'use server'

import { db } from "@/db";
import {
    assessmentTemplates,
    documentTemplates,
    assessmentRequests,
    assessmentDocumentRequestGroups,
    assessmentDocumentRequests,
    assessmentRequestSuppliers,
    assessmentRequestSupplierContacts,
    assessmentResponses,
    suppliers,
    contacts,
    users,
    type AssessmentTemplate,
    DocumentTemplate,
    type AssessmentRequest,
    type AssessmentDocumentRequestGroup,
    type AssessmentDocumentRequest,
} from "@/db/schema";
import { linkContactToRequestSupplier } from "@/app/actions/supplier-import";
import type { SupplierDocumentResponse } from "@/lib/assessment-types";

function fileNameFromUrl(url: string | null): string | null {
    if (!url) return null;
    try {
        const path = new URL(url, "http://localhost").pathname;
        const decoded = decodeURIComponent(path.split("/").pop() ?? "");
        return decoded || null;
    } catch {
        return url.split("/").pop() ?? null;
    }
}
import { eq, desc, inArray, asc, and, isNull, isNotNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { logActivity } from "./activity";
import { auth } from "@/auth";
import { enqueueAssessmentEmail } from "@/lib/queue/email-queue";
import type { AssessmentTemplateSchema, FormAnswer } from "@/lib/assessment-templates/types";
import pmaSchema from "@/lib/assessment-templates/supplier-self-assessment-pma-code-of-conduct.json";
import { getBundledTemplateSchema, resolveAssessmentTemplateSchema } from "@/lib/assessment-templates";
import { collectUploadedDocumentsFromAnswers } from "@/lib/assessment-upload-documents";

const ASSESSMENT_PAGE = "/requests/assessments";

function getUserContext() {
    return auth();
}

type AssessmentListRow = {
    id: string;
    title: string;
    responsibleId: string | null;
    responsibleName: string | null;
    responsibleAvatar?: string | null;
    dueDate: Date | null;
    status: "draft" | "published" | "closed";
    templateId: string | null;
    templateName: string | null;
    createdById: string;
    createdByName: string | null;
    createdAt: Date;
    updatedAt: Date;
    teamIds: string[] | null;
    supplierCount: number;
    responsesSubmitted: number;
    supplierIds: string[];
};

export async function getAssessmentTemplates(): Promise<AssessmentTemplate[]> {
    const session = await getUserContext();
    if (!session) return [];
    try {
        return await db
            .select()
            .from(assessmentTemplates)
            .where(eq(assessmentTemplates.isActive, true))
            .orderBy(asc(assessmentTemplates.name));
    } catch (error) {
        console.error("Failed to fetch assessment templates:", error);
        return [];
    }
}

export async function getDocumentTemplates(): Promise<DocumentTemplate[]> {
    const session = await getUserContext();
    if (!session) return [];
    try {
        return await db
            .select()
            .from(documentTemplates)
            .where(eq(documentTemplates.isActive, true))
            .orderBy(asc(documentTemplates.category), asc(documentTemplates.name));
    } catch (error) {
        console.error("Failed to fetch document templates:", error);
        return [];
    }
}

export async function getAssessmentRequests(tab: "all" | "my" = "all"): Promise<AssessmentListRow[]> {
    const session = await getUserContext();
    if (!session) return [];

    try {
        const baseRows = await db
            .select({
                id: assessmentRequests.id,
                title: assessmentRequests.title,
                responsibleId: assessmentRequests.responsibleId,
                dueDate: assessmentRequests.dueDate,
                status: assessmentRequests.status,
                templateId: assessmentRequests.templateId,
                createdById: assessmentRequests.createdById,
                createdAt: assessmentRequests.createdAt,
                updatedAt: assessmentRequests.updatedAt,
                teamIds: assessmentRequests.teamIds,
            })
            .from(assessmentRequests)
            .orderBy(desc(assessmentRequests.updatedAt));

        if (baseRows.length === 0) return [];

        const ids = baseRows.map((r) => r.id);

        const [responsibleRows, creatorRows, templateRows, supplierRows, responseRows] = await Promise.all([
            db.select({ id: users.id, name: users.name }).from(users)
                .where(inArray(users.id, baseRows.map((r) => r.responsibleId).filter(Boolean) as string[])),
            db.select({ id: users.id, name: users.name }).from(users)
                .where(inArray(users.id, baseRows.map((r) => r.createdById))),
            db.select({ id: assessmentTemplates.id, name: assessmentTemplates.name }).from(assessmentTemplates)
                .where(inArray(assessmentTemplates.id, baseRows.map((r) => r.templateId).filter(Boolean) as string[])),
            db.select({
                assessmentRequestId: assessmentRequestSuppliers.assessmentRequestId,
                supplierId: assessmentRequestSuppliers.supplierId,
                status: assessmentRequestSuppliers.status,
            }).from(assessmentRequestSuppliers)
                .where(inArray(assessmentRequestSuppliers.assessmentRequestId, ids)),
            db.select({
                assessmentRequestId: assessmentResponses.assessmentRequestId,
                supplierId: assessmentResponses.supplierId,
                status: assessmentResponses.status,
            }).from(assessmentResponses)
                .where(inArray(assessmentResponses.assessmentRequestId, ids)),
        ]);

        const responsibleMap = new Map(responsibleRows.map((u) => [u.id, u]));
        const creatorMap = new Map(creatorRows.map((u) => [u.id, u.name]));
        const templateMap = new Map(templateRows.map((t) => [t.id, t.name]));
        const supplierMap = new Map<string, { supplierId: string; status: string }[]>();
        for (const row of supplierRows) {
            const list = supplierMap.get(row.assessmentRequestId) || [];
            list.push({ supplierId: row.supplierId, status: row.status });
            supplierMap.set(row.assessmentRequestId, list);
        }
        const responseMap = new Map<string, { supplierId: string; status: string }[]>();
        for (const row of responseRows) {
            const list = responseMap.get(row.assessmentRequestId) || [];
            list.push({ supplierId: row.supplierId, status: row.status });
            responseMap.set(row.assessmentRequestId, list);
        }

        return baseRows
            .filter((row) => (tab === "my" ? row.createdById === session.user.id || row.responsibleId === session.user.id : true))
            .map((row) => {
                const suppliersList = supplierMap.get(row.id) || [];
                const responsesList = responseMap.get(row.id) || [];
                const responsible = row.responsibleId ? responsibleMap.get(row.responsibleId) : undefined;
                const submittedCount = responsesList.filter(
                    (r) => r.status === "submitted" || r.status === "approved"
                ).length;
                return {
                    id: row.id,
                    title: row.title,
                    responsibleId: row.responsibleId,
                    responsibleName: responsible?.name ?? null,
                    responsibleAvatar: null,
                    dueDate: row.dueDate,
                    status: row.status,
                    templateId: row.templateId,
                    templateName: row.templateId ? (templateMap.get(row.templateId) ?? null) : null,
                    createdById: row.createdById,
                    createdByName: creatorMap.get(row.createdById) ?? null,
                    createdAt: row.createdAt,
                    updatedAt: row.updatedAt,
                    teamIds: row.teamIds,
                    supplierCount: suppliersList.length,
                    responsesSubmitted: submittedCount,
                    supplierIds: Array.from(new Set(suppliersList.map((s) => s.supplierId))),
                };
            });
    } catch (error) {
        console.error("Failed to fetch assessment requests:", error);
        return [];
    }
}

type AssessmentDetail = AssessmentRequest & {
    responsible: { id: string; name: string | null; email: string | null; image: string | null } | null;
    createdBy: { id: string; name: string | null } | null;
    template: AssessmentTemplate | null;
    documentRequestGroups: Array<
        AssessmentDocumentRequestGroup & {
            documents: AssessmentDocumentRequest[];
        }
    >;
    suppliers: Array<{
        id: string;
        supplierId: string;
        supplierName: string | null;
        contactId: string | null;
        contactName: string | null;
        status: string;
        sentAt: Date | string | null;
        lastReminderSentAt: Date | string | null;
    }>;
    responseCount: number;
};

export async function getAssessmentRequestById(id: string): Promise<AssessmentDetail | null> {
    const session = await getUserContext();
    if (!session) return null;

    try {
        const [requestRow] = await db
            .select()
            .from(assessmentRequests)
            .where(eq(assessmentRequests.id, id))
            .limit(1);

        if (!requestRow) return null;

        const [responsible, createdBy, template, groups, suppliersList, responses] = await Promise.all([
            requestRow.responsibleId
                ? db.select({ id: users.id, name: users.name, email: users.email })
                    .from(users).where(eq(users.id, requestRow.responsibleId)).limit(1)
                : Promise.resolve([]),
            db.select({ id: users.id, name: users.name }).from(users).where(eq(users.id, requestRow.createdById)).limit(1),
            requestRow.templateId
                ? db.select().from(assessmentTemplates).where(eq(assessmentTemplates.id, requestRow.templateId)).limit(1)
                : Promise.resolve([]),
            db.select().from(assessmentDocumentRequestGroups)
                .where(eq(assessmentDocumentRequestGroups.assessmentRequestId, id))
                .orderBy(asc(assessmentDocumentRequestGroups.order)),
            db.select({
                id: assessmentRequestSuppliers.id,
                supplierId: assessmentRequestSuppliers.supplierId,
                contactId: assessmentRequestSuppliers.contactId,
                status: assessmentRequestSuppliers.status,
                sentAt: assessmentRequestSuppliers.sentAt,
                lastReminderSentAt: assessmentRequestSuppliers.lastReminderSentAt,
                supplierName: suppliers.name,
                contactName: contacts.name,
                contactEmail: contacts.email,
            })
                .from(assessmentRequestSuppliers)
                .leftJoin(suppliers, eq(assessmentRequestSuppliers.supplierId, suppliers.id))
                .leftJoin(contacts, eq(assessmentRequestSuppliers.contactId, contacts.id))
                .where(eq(assessmentRequestSuppliers.assessmentRequestId, id)),
            db.select({ count: assessmentResponses.id })
                .from(assessmentResponses)
                .where(eq(assessmentResponses.assessmentRequestId, id)),
        ]);

        // Fetch every contact linked to each supplier participant (join table).
        const arsIds = suppliersList.map((s: { id: string }) => s.id);
        const contactLinks = arsIds.length
            ? await db
                .select({
                    arsId: assessmentRequestSupplierContacts.assessmentRequestSupplierId,
                    contactId: contacts.id,
                    contactName: contacts.name,
                    contactEmail: contacts.email,
                })
                .from(assessmentRequestSupplierContacts)
                .leftJoin(contacts, eq(assessmentRequestSupplierContacts.contactId, contacts.id))
                .where(inArray(assessmentRequestSupplierContacts.assessmentRequestSupplierId, arsIds))
            : [];

        const groupIds = groups.map((g) => g.id);
        const documentsByGroup = groupIds.length
            ? await db.select().from(assessmentDocumentRequests)
                .where(inArray(assessmentDocumentRequests.groupId, groupIds))
                .orderBy(asc(assessmentDocumentRequests.order))
            : [];

        const groupsWithDocs = groups.map((g) => ({
            ...g,
            documents: documentsByGroup.filter((d) => d.groupId === g.id),
        }));

        return {
            ...requestRow,
            responsible: responsible[0]
                ? { id: responsible[0].id, name: responsible[0].name, email: responsible[0].email, image: null }
                : null,
            createdBy: createdBy[0] ? { id: createdBy[0].id, name: createdBy[0].name } : null,
            template: template[0] ?? null,
            documentRequestGroups: groupsWithDocs,
            suppliers: suppliersList.map((s) => ({
                id: s.id,
                supplierId: s.supplierId,
                supplierName: s.supplierName,
                contactId: s.contactId,
                contactName: s.contactName,
                contactEmail: s.contactEmail,
                status: s.status,
                sentAt: s.sentAt,
                lastReminderSentAt: s.lastReminderSentAt,
                contacts: contactLinks
                    .filter((l) => l.arsId === s.id)
                    .map((l) => ({ contactId: l.contactId, contactName: l.contactName, contactEmail: l.contactEmail })),
            })),
            responseCount: responses.length,
        };
    } catch (error) {
        console.error("Failed to fetch assessment request:", error);
        return null;
    }
}

const DEFAULT_PMA_MESSAGE = `Dear [Supplier Name],

We are conducting a Supplier Self-Assessment as part of our continuous improvement and compliance program covering the Product Material Declaration (PMA) and our Supplier Code of Conduct.

Please review the attached document requests and provide the required evidence by the stated deadline. Your cooperation helps us maintain a transparent, responsible, and sustainable supply chain.

If you have any questions, contact your assigned procurement representative.

Kind regards,
Axiom Procurement Team`;

export async function createAssessmentRequest(templateId: string, title?: string) {
    const session = await getUserContext();
    if (!session) return { success: false, error: "Unauthorized" };
    if (session.user.role === "supplier") return { success: false, error: "Suppliers cannot create requests" };

    try {
        const [template] = templateId
            ? await db.select().from(assessmentTemplates).where(eq(assessmentTemplates.id, templateId)).limit(1)
            : [null];

        const [created] = await db.insert(assessmentRequests).values({
            title: title?.trim() || template?.name || "Untitled Assessment Request",
            responsibleId: session.user.id,
            templateId: templateId || null,
            messageBody: DEFAULT_PMA_MESSAGE,
            status: "draft",
            createdById: session.user.id,
        }).returning();

        await logActivity(
            "CREATE",
            "assessment_request",
            created.id,
            `Assessment request '${created.title}' created from template ${template?.name ?? "none"}`
        );

        revalidatePath("/requests");
        revalidatePath(ASSESSMENT_PAGE);
        return { success: true, id: created.id };
    } catch (error) {
        console.error("Failed to create assessment request:", error);
        return { success: false, error: "Failed to create assessment request" };
    }
}

export async function updateAssessmentSetup(
    id: string,
    data: { title?: string; responsibleId?: string; dueDate?: string | null; teamIds?: string[] }
) {
    const session = await getUserContext();
    if (!session) return { success: false, error: "Unauthorized" };

    try {
        const values: Record<string, unknown> = { updatedAt: new Date() };
        if (data.title !== undefined) values.title = data.title.trim();
        if (data.responsibleId !== undefined) values.responsibleId = data.responsibleId;
        if (data.dueDate !== undefined) values.dueDate = data.dueDate ? new Date(data.dueDate) : null;
        if (data.teamIds !== undefined) values.teamIds = data.teamIds;

        await db.update(assessmentRequests).set(values).where(eq(assessmentRequests.id, id));
        await logActivity("UPDATE", "assessment_request", id, "Updated general information");
        revalidatePath("/requests");
        revalidatePath(`${ASSESSMENT_PAGE}/${id}`);
        revalidatePath(ASSESSMENT_PAGE);
        return { success: true };
    } catch (error) {
        console.error("Failed to update assessment setup:", error);
        return { success: false, error: "Failed to update request" };
    }
}

export async function saveAssessmentMessage(id: string, messageBody: string) {
    const session = await getUserContext();
    if (!session) return { success: false, error: "Unauthorized" };

    try {
        await db.update(assessmentRequests)
            .set({ messageBody, updatedAt: new Date() })
            .where(eq(assessmentRequests.id, id));
        revalidatePath(`${ASSESSMENT_PAGE}/${id}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to save message:", error);
        return { success: false, error: "Failed to save message" };
    }
}

export async function addDocumentRequestGroup(assessmentRequestId: string, label: string) {
    const session = await getUserContext();
    if (!session) return { success: false, error: "Unauthorized" };

    try {
        const existing = await db.select({ order: assessmentDocumentRequestGroups.order })
            .from(assessmentDocumentRequestGroups)
            .where(eq(assessmentDocumentRequestGroups.assessmentRequestId, assessmentRequestId));
        const nextOrder = existing.length ? Math.max(...existing.map((g) => g.order)) + 1 : 0;

        const [created] = await db.insert(assessmentDocumentRequestGroups).values({
            assessmentRequestId,
            label: label.trim() || "Document requests",
            order: nextOrder,
            allowAdditionalAttachments: true,
        }).returning();

        revalidatePath(`${ASSESSMENT_PAGE}/${assessmentRequestId}`);
        return { success: true, id: created.id };
    } catch (error) {
        console.error("Failed to add document request group:", error);
        return { success: false, error: "Failed to add document section" };
    }
}

export async function updateDocumentRequestGroup(
    groupId: string,
    data: { label?: string; allowAdditionalAttachments?: boolean }
) {
    const session = await getUserContext();
    if (!session) return { success: false, error: "Unauthorized" };

    try {
        const values: Record<string, unknown> = { updatedAt: new Date() };
        if (data.label !== undefined) values.label = data.label.trim();
        if (data.allowAdditionalAttachments !== undefined) values.allowAdditionalAttachments = data.allowAdditionalAttachments;
        await db.update(assessmentDocumentRequestGroups).set(values).where(eq(assessmentDocumentRequestGroups.id, groupId));
        revalidatePath(ASSESSMENT_PAGE);
        return { success: true };
    } catch (error) {
        console.error("Failed to update document request group:", error);
        return { success: false, error: "Failed to update section" };
    }
}

export async function deleteDocumentRequestGroup(groupId: string) {
    const session = await getUserContext();
    if (!session) return { success: false, error: "Unauthorized" };

    try {
        await db.delete(assessmentDocumentRequestGroups).where(eq(assessmentDocumentRequestGroups.id, groupId));
        revalidatePath(ASSESSMENT_PAGE);
        return { success: true };
    } catch (error) {
        console.error("Failed to delete document request group:", error);
        return { success: false, error: "Failed to delete section" };
    }
}

export async function linkDocumentTemplates(groupId: string, items: { id: string; name: string }[]) {
    const session = await getUserContext();
    if (!session) return { success: false, error: "Unauthorized" };

    try {
        const [group] = await db.select().from(assessmentDocumentRequestGroups)
            .where(eq(assessmentDocumentRequestGroups.id, groupId)).limit(1);
        if (!group) return { success: false, error: "Section not found" };

        const existingDocs = await db.select().from(assessmentDocumentRequests)
            .where(eq(assessmentDocumentRequests.groupId, groupId));
        const existingTemplateIds = new Set(existingDocs.map((d) => d.documentTemplateId));
        const selectedIdSet = new Set(items.map((i) => i.id));

        // Remove documents that are no longer selected
        const toRemove = existingDocs.filter((d) => !selectedIdSet.has(d.documentTemplateId));
        if (toRemove.length) {
            await db.delete(assessmentDocumentRequests)
                .where(inArray(assessmentDocumentRequests.id, toRemove.map((d) => d.id)));
        }

        // Add newly selected items (preserve existing toggles for retained ones)
        const newItems = items.filter((i) => !existingTemplateIds.has(i.id));
        if (newItems.length) {
            const nextOrder = existingDocs.length ? Math.max(...existingDocs.map((d) => d.order)) + 1 : 0;
            await db.insert(assessmentDocumentRequests).values(
                newItems.map((i, idx) => ({
                    groupId,
                    documentTemplateId: i.id,
                    name: i.name,
                    isAnswerRequired: true,
                    order: nextOrder + idx,
                }))
            );
        }

        revalidatePath(ASSESSMENT_PAGE);
        return { success: true, id: groupId };
    } catch (error) {
        console.error("Failed to link document templates:", error);
        return { success: false, error: "Failed to link documents" };
    }
}

export async function updateDocumentRequest(
    documentRequestId: string,
    data: { isAnswerRequired?: boolean; name?: string }
) {
    const session = await getUserContext();
    if (!session) return { success: false, error: "Unauthorized" };

    try {
        const values: Record<string, unknown> = { updatedAt: new Date() };
        if (data.isAnswerRequired !== undefined) values.isAnswerRequired = data.isAnswerRequired;
        if (data.name !== undefined) values.name = data.name.trim();
        await db.update(assessmentDocumentRequests).set(values).where(eq(assessmentDocumentRequests.id, documentRequestId));
        revalidatePath(ASSESSMENT_PAGE);
        return { success: true };
    } catch (error) {
        console.error("Failed to update document request:", error);
        return { success: false, error: "Failed to update document" };
    }
}

export async function reorderDocumentRequest(documentRequestId: string, direction: "up" | "down") {
    const session = await getUserContext();
    if (!session) return { success: false, error: "Unauthorized" };

    try {
        const [doc] = await db.select().from(assessmentDocumentRequests)
            .where(eq(assessmentDocumentRequests.id, documentRequestId)).limit(1);
        if (!doc) return { success: false, error: "Document not found" };

        const siblings = await db.select().from(assessmentDocumentRequests)
            .where(eq(assessmentDocumentRequests.groupId, doc.groupId))
            .orderBy(asc(assessmentDocumentRequests.order));
        const idx = siblings.findIndex((s) => s.id === doc.id);
        const swapIdx = direction === "up" ? idx - 1 : idx + 1;
        if (swapIdx < 0 || swapIdx >= siblings.length) return { success: true };

        const other = siblings[swapIdx];
        await db.update(assessmentDocumentRequests).set({ order: other.order, updatedAt: new Date() })
            .where(eq(assessmentDocumentRequests.id, doc.id));
        await db.update(assessmentDocumentRequests).set({ order: doc.order, updatedAt: new Date() })
            .where(eq(assessmentDocumentRequests.id, other.id));

        revalidatePath(ASSESSMENT_PAGE);
        return { success: true };
    } catch (error) {
        console.error("Failed to reorder document request:", error);
        return { success: false, error: "Failed to reorder" };
    }
}

export async function addSuppliersToAssessment(assessmentRequestId: string, supplierIds: string[]) {
    const session = await getUserContext();
    if (!session) return { success: false, error: "Unauthorized" };
    if (!supplierIds.length) return { success: true };

    try {
        const existing = await db.select().from(assessmentRequestSuppliers)
            .where(eq(assessmentRequestSuppliers.assessmentRequestId, assessmentRequestId));
        const existingSet = new Set(existing.map((s) => s.supplierId));
        const toInsert = supplierIds.filter((sid) => !existingSet.has(sid));

        if (toInsert.length) {
            await db.insert(assessmentRequestSuppliers).values(
                toInsert.map((sid) => ({ assessmentRequestId, supplierId: sid, status: "pending" }))
            );
        }

        await logActivity("UPDATE", "assessment_request", assessmentRequestId, `Added ${toInsert.length} supplier(s)`);
        revalidatePath(`${ASSESSMENT_PAGE}/${assessmentRequestId}`);
        revalidatePath(ASSESSMENT_PAGE);
        return { success: true };
    } catch (error) {
        console.error("Failed to add suppliers:", error);
        return { success: false, error: "Failed to add suppliers" };
    }
}

export async function removeSupplierFromAssessment(assessmentRequestSupplierId: string) {
    const session = await getUserContext();
    if (!session) return { success: false, error: "Unauthorized" };

    try {
        console.log("[removeSupplierFromAssessment] Deleting supplier:", assessmentRequestSupplierId);
        const result = await db.delete(assessmentRequestSuppliers)
            .where(eq(assessmentRequestSuppliers.id, assessmentRequestSupplierId))
            .returning({ id: assessmentRequestSuppliers.id });
        
        console.log("[removeSupplierFromAssessment] Delete result:", result);
        
        if (result.length === 0) {
            return { success: false, error: "Supplier not found" };
        }
        
        revalidatePath(ASSESSMENT_PAGE);
        revalidatePath(`${ASSESSMENT_PAGE}/${(await db.select({ assessmentRequestId: assessmentRequestSuppliers.assessmentRequestId }).from(assessmentRequestSuppliers).where(eq(assessmentRequestSuppliers.id, assessmentRequestSupplierId)).limit(1))[0]?.assessmentRequestId}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to remove supplier:", error);
        return { success: false, error: `Failed to remove supplier: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
}

export async function publishAssessment(id: string, notify: boolean) {
    const session = await getUserContext();
    if (!session) return { success: false, error: "Unauthorized" };

    try {
        const suppliersList = await db.select().from(assessmentRequestSuppliers)
            .where(eq(assessmentRequestSuppliers.assessmentRequestId, id));
        if (suppliersList.length === 0) {
            return { success: false, error: "Add at least one supplier before publishing" };
        }

        // Auto-fill each participant's draft `assessment_responses` row from
        // the supplier's profile + contact details BEFORE flipping the
        // request to `published`. Failures here are logged but never block
        // the publish — the prefill can also run lazily when the supplier
        // opens the form.
        const { autoFillSupplierAnswers } = await import(
            "@/app/actions/assessment-autofill"
        );
        for (const participant of suppliersList) {
            const links = await db
                .select({ contactId: assessmentRequestSupplierContacts.contactId })
                .from(assessmentRequestSupplierContacts)
                .where(
                    eq(
                        assessmentRequestSupplierContacts.assessmentRequestSupplierId,
                        participant.id
                    )
                );
            const contactIds =
                links.length > 0
                    ? links.map((l) => l.contactId)
                    : participant.contactId
                    ? [participant.contactId]
                    : [];
            for (const cid of contactIds) {
                try {
                    await autoFillSupplierAnswers(id, participant.id, cid);
                } catch (err) {
                    console.error(
                        "publishAssessment: auto-fill failed for participant",
                        participant.id,
                        err
                    );
                }
            }
        }

        await db.update(assessmentRequests).set({ status: "published", updatedAt: new Date() })
            .where(eq(assessmentRequests.id, id));

        if (notify) {
            // Update status to sent and queue emails for each participant
            await db.update(assessmentRequestSuppliers)
                .set({ status: "sent", sentAt: new Date(), lastReminderSentAt: new Date() })
                .where(eq(assessmentRequestSuppliers.assessmentRequestId, id));

            // Get every (participant, contact) link so multi-contact
            // suppliers all receive their invitation — not just the primary
            // contact stored on `assessmentRequestSuppliers.contactId`.
            const participantContactLinks = await db.select({
                participantId: assessmentRequestSupplierContacts.assessmentRequestSupplierId,
                contactId: assessmentRequestSupplierContacts.contactId,
            })
            .from(assessmentRequestSupplierContacts)
            .innerJoin(
                assessmentRequestSuppliers,
                eq(assessmentRequestSupplierContacts.assessmentRequestSupplierId, assessmentRequestSuppliers.id)
            )
            .where(eq(assessmentRequestSuppliers.assessmentRequestId, id));

            for (const link of participantContactLinks) {
                await enqueueAssessmentEmail(id, link.participantId, link.contactId, 'invitation');
            }
        }

        await logActivity("PUBLISH", "assessment_request", id, notify ? "Published and notified suppliers" : "Published silently");
        revalidatePath(`${ASSESSMENT_PAGE}/${id}`);
        revalidatePath(ASSESSMENT_PAGE);
        return { success: true };
    } catch (error) {
        console.error("Failed to publish assessment:", error);
        return { success: false, error: "Failed to publish" };
    }
}

export async function closeAssessment(id: string) {
    const session = await getUserContext();
    if (!session) return { success: false, error: "Unauthorized" };

    try {
        await db.update(assessmentRequests).set({ status: "closed", updatedAt: new Date() })
            .where(eq(assessmentRequests.id, id));
        await logActivity("CLOSE", "assessment_request", id, "Request closed");
        revalidatePath(`${ASSESSMENT_PAGE}/${id}`);
        revalidatePath(ASSESSMENT_PAGE);
        return { success: true };
    } catch (error) {
        console.error("Failed to close assessment:", error);
        return { success: false, error: "Failed to close" };
    }
}

export async function getSuppliersForPicker(search = "") {
    const session = await getUserContext();
    if (!session) return [];
    try {
        const query = search.trim().toLowerCase();
        const rows = await db.select({ id: suppliers.id, name: suppliers.name, status: suppliers.status })
            .from(suppliers)
            .where(eq(suppliers.status, "active"))
            .limit(100);
        return rows.filter((r) => !query || r.name.toLowerCase().includes(query));
    } catch (error) {
        console.error("Failed to fetch suppliers:", error);
        return [];
    }
}

export async function getUsersForPicker(search = "") {
    const session = await getUserContext();
    if (!session) return [];
    try {
        const query = search.trim().toLowerCase();
        const rows = await db.select({ id: users.id, name: users.name, email: users.email })
            .from(users)
            .limit(100);
        return rows.filter((r) => !query || (r.name ?? "").toLowerCase().includes(query));
    } catch (error) {
        console.error("Failed to fetch users:", error);
        return [];
    }
}

export type ContactPickerRow = {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    jobTitle: string | null;
    status: string | null;
    supplierId: string | null;
    supplierName: string | null;
};

export async function getContactsForPicker(supplierId: string, search = ""): Promise<ContactPickerRow[]> {
    const session = await getUserContext();
    if (!session || !supplierId) return [];
    try {
        const rows = await db
            .select({
                id: contacts.id,
                name: contacts.name,
                email: contacts.email,
                phone: contacts.phone,
                jobTitle: contacts.jobTitle,
                status: contacts.status,
                supplierId: contacts.supplierId,
                supplierName: suppliers.name,
            })
            .from(contacts)
            .leftJoin(suppliers, eq(contacts.supplierId, suppliers.id))
            .where(and(eq(contacts.supplierId, supplierId), eq(contacts.status, "active")))
            .orderBy(asc(contacts.name))
            .limit(200);
        const query = search.trim().toLowerCase();
        return rows.filter(
            (r) => !query || (r.name ?? "").toLowerCase().includes(query) || r.email.toLowerCase().includes(query)
        );
    } catch (error) {
        console.error("Failed to fetch contacts:", error);
        return [];
    }
}

export async function getAssessmentContacts(assessmentRequestId: string): Promise<{ success: boolean; contacts: { id: string; name: string | null; email: string }[]; error?: string }> {
    const session = await getUserContext();
    if (!session) return { success: false, contacts: [], error: "Unauthorized" };
    try {
        const rows = await db
            .select({
                id: contacts.id,
                name: contacts.name,
                email: contacts.email,
            })
            .from(contacts)
            .leftJoin(suppliers, eq(contacts.supplierId, suppliers.id))
            .leftJoin(assessmentRequestSuppliers, eq(assessmentRequestSuppliers.supplierId, suppliers.id))
            .where(eq(assessmentRequestSuppliers.assessmentRequestId, assessmentRequestId))
            .orderBy(asc(contacts.name));
        return { success: true, contacts: rows };
    } catch (error) {
        console.error("Failed to fetch assessment contacts:", error);
        return { success: false, contacts: [], error: "Failed to fetch contacts" };
    }
}

export async function assignContactToRequestSupplier(assessmentRequestSupplierId: string, contactId: string | null) {
    const session = await getUserContext();
    if (!session) return { success: false, error: "Unauthorized" };
    try {
        if (contactId) {
            await linkContactToRequestSupplier(assessmentRequestSupplierId, contactId);
        }
        await logActivity("UPDATE", "assessment_request", assessmentRequestSupplierId, contactId ? "Linked contact" : "Removed contact");
        revalidatePath(ASSESSMENT_PAGE);
        return { success: true };
    } catch (error) {
        console.error("Failed to assign contact:", error);
        return { success: false, error: "Failed to assign contact" };
    }
}

export async function resendInvitation(assessmentRequestSupplierId: string) {
    const session = await getUserContext();
    if (!session) return { success: false, error: "Unauthorized" };

    try {
        const [participant] = await db.select().from(assessmentRequestSuppliers)
            .where(eq(assessmentRequestSuppliers.id, assessmentRequestSupplierId))
            .limit(1);

        if (!participant) {
            return { success: false, error: "Participant not found" };
        }

        if (!participant.contactId) {
            return { success: false, error: "No contact assigned to this participant" };
        }

        // Queue a reminder email
        const result = await enqueueAssessmentEmail(
            participant.assessmentRequestId,
            participant.id,
            participant.contactId,
            'reminder'
        );

        if (result.success) {
            const reminderSentAt = new Date();
            await db.update(assessmentRequestSuppliers)
                .set({ status: 'sent', sentAt: participant.sentAt ?? reminderSentAt, lastReminderSentAt: reminderSentAt })
                .where(eq(assessmentRequestSuppliers.id, assessmentRequestSupplierId));
        }

        await logActivity("RESEND", "assessment_request", participant.assessmentRequestId, `Resent invitation to participant ${assessmentRequestSupplierId}`);
        revalidatePath(`${ASSESSMENT_PAGE}/${participant.assessmentRequestId}`);
        return result;
    } catch (error) {
        console.error("Failed to resend invitation:", error);
        return { success: false, error: "Failed to resend invitation" };
    }
}

export async function shareAssessmentRequest(assessmentRequestId: string, emails: string[], forwarderName: string) {
    const session = await getUserContext();
    if (!session) return { success: false, error: "Unauthorized" };
    if (session.user.role === 'supplier') return { success: false, error: "Suppliers cannot share requests" };

    try {
        const [assessmentRequest] = await db.select().from(assessmentRequests)
            .where(eq(assessmentRequests.id, assessmentRequestId))
            .limit(1);

        if (!assessmentRequest) {
            return { success: false, error: "Assessment request not found" };
        }

        // Check authorization
        if (assessmentRequest.responsibleId !== session.user.id && assessmentRequest.createdById !== session.user.id) {
            return { success: false, error: "Not authorized to share this request" };
        }

        const results = [];

        for (const email of emails) {
            const trimmedEmail = email.trim().toLowerCase();
            if (!trimmedEmail) continue;

            // Find or create contact
            let [contact] = await db.select().from(contacts)
                .where(eq(contacts.email, trimmedEmail))
                .limit(1);

            let supplierId: string | null = null;
            let supplierName = 'Unknown Supplier';

            if (contact?.supplierId) {
                const [sup] = await db.select().from(suppliers).where(eq(suppliers.id, contact.supplierId)).limit(1);
                supplierId = sup?.id || null;
                supplierName = sup?.name || 'Unknown Supplier';
            }

            if (!contact) {
                const [newContact] = await db.insert(contacts).values({
                    name: trimmedEmail.split('@')[0],
                    email: trimmedEmail,
                    status: 'active',
                    createdBy: session.user.id,
                }).returning();
                contact = newContact;
            }

            // Find or create supplier participant
            let participantId: string;

            if (supplierId) {
                const [existingParticipant] = await db.select().from(assessmentRequestSuppliers)
                    .where(and(
                        eq(assessmentRequestSuppliers.assessmentRequestId, assessmentRequestId),
                        eq(assessmentRequestSuppliers.supplierId, supplierId)
                    ))
                    .limit(1);

                if (existingParticipant) {
                    participantId = existingParticipant.id;
                    await db.insert(assessmentRequestSupplierContacts)
                        .values({ assessmentRequestSupplierId: participantId, contactId: contact.id })
                        .onConflictDoNothing();
                } else {
                    const [newParticipant] = await db.insert(assessmentRequestSuppliers).values({
                        assessmentRequestId,
                        supplierId,
                        contactId: contact.id,
                        status: 'pending',
                    }).returning();
                    participantId = newParticipant.id;
                }
            } else {
                const [tempSupplier] = await db.insert(suppliers).values({
                    name: contact.name || trimmedEmail,
                    contactEmail: trimmedEmail,
                    status: 'active',
                    lifecycleStatus: 'prospect',
                }).returning();

                const [newParticipant] = await db.insert(assessmentRequestSuppliers).values({
                    assessmentRequestId,
                    supplierId: tempSupplier.id,
                    contactId: contact.id,
                    status: 'pending',
                }).returning();
                participantId = newParticipant.id;
            }

            // Queue forward email
            const emailResult = await enqueueAssessmentEmail(
                assessmentRequestId,
                participantId,
                contact.id,
                'forward',
                { forwarderName }
            );

            results.push({
                email: trimmedEmail,
                success: emailResult.success,
                participantId,
                contactId: contact.id,
                error: emailResult.error,
            });
        }

        await logActivity("SHARE", "assessment_request", assessmentRequestId, `Shared with ${emails.length} recipient(s)`);
        revalidatePath(`${ASSESSMENT_PAGE}/${assessmentRequestId}`);
        return { success: true, results };
    } catch (error) {
        console.error("Failed to share assessment:", error);
        return { success: false, error: "Failed to share assessment" };
    }
}

function schemaForCategory(category: string | null): AssessmentTemplateSchema {
    return (
        resolveAssessmentTemplateSchema(category, null) ??
        (pmaSchema as unknown as AssessmentTemplateSchema)
    );
}

export async function getSupplierResponse(
    assessmentRequestId: string,
    supplierId: string
): Promise<{ answers: FormAnswer; status: string; template: AssessmentTemplateSchema; messageBody: string | null; documents: SupplierDocumentResponse[] } | null> {
    const session = await auth();
    if (!session) return null;

    try {
        const [request] = await db
            .select()
            .from(assessmentRequests)
            .where(eq(assessmentRequests.id, assessmentRequestId))
            .limit(1);

        if (!request) return null;

        const [template] = request.templateId
            ? await db.select().from(assessmentTemplates).where(eq(assessmentTemplates.id, request.templateId)).limit(1)
            : [null];

        const schema = resolveAssessmentTemplateSchema(
            template?.category ?? null,
            template?.config ?? null
        ) ?? schemaForCategory(template?.category ?? null);

        const existingResponse = await db
            .select({ answers: assessmentResponses.answers, status: assessmentResponses.status })
            .from(assessmentResponses)
            .where(
                and(
                    eq(assessmentResponses.assessmentRequestId, assessmentRequestId),
                    eq(assessmentResponses.supplierId, supplierId),
                    isNull(assessmentResponses.documentRequestId)
                )
            )
            .orderBy(desc(assessmentResponses.createdAt))
            .limit(1);

        const answers: FormAnswer = existingResponse[0]?.answers
            ? (JSON.parse(existingResponse[0].answers) as FormAnswer)
            : {};

        const documentRows = await db
            .select({
                documentRequestId: assessmentResponses.documentRequestId,
                documentUrl: assessmentResponses.documentUrl,
                responseText: assessmentResponses.responseText,
                submittedAt: assessmentResponses.submittedAt,
                documentName: assessmentDocumentRequests.name,
            })
            .from(assessmentResponses)
            .leftJoin(assessmentDocumentRequests, eq(assessmentResponses.documentRequestId, assessmentDocumentRequests.id))
            .where(
                and(
                    eq(assessmentResponses.assessmentRequestId, assessmentRequestId),
                    eq(assessmentResponses.supplierId, supplierId),
                    isNotNull(assessmentResponses.documentUrl)
                )
            );

        const documentsFromRows: SupplierDocumentResponse[] = documentRows
            .filter((r) => r.documentUrl)
            .map((r) => ({
                documentRequestId: r.documentRequestId,
                documentUrl: r.documentUrl,
                responseText: r.responseText,
                documentName: r.documentName ?? fileNameFromUrl(r.documentUrl),
                submittedAt: r.submittedAt,
            }));

        const nestedDocuments = collectUploadedDocumentsFromAnswers(answers)
            .filter((row) => row.documentUrl)
            .map((row) => ({
                documentRequestId: null,
                documentUrl: row.documentUrl,
                responseText: row.responseText,
                documentName: row.documentName ?? fileNameFromUrl(row.documentUrl),
                submittedAt: row.submittedAt,
            }));

        const documents = [...documentsFromRows, ...nestedDocuments].filter((doc, index, arr) => arr.findIndex((candidate) => candidate.documentUrl === doc.documentUrl) === index);

        return {
            answers,
            status: existingResponse[0]?.status ?? "pending",
            template: schema,
            messageBody: request.messageBody,
            documents,
        };
    } catch (error) {
        console.error("Failed to fetch supplier response:", error);
        return null;
    }
}
