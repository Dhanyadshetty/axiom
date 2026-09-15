"use server";

import { db } from "@/db";
import {
    assessmentRequests,
    assessmentRequestSuppliers,
    assessmentRequestSupplierContacts,
    assessmentResponses,
    assessmentTemplates,
    assessmentDocumentRequestGroups,
    assessmentDocumentRequests,
    suppliers,
    contacts,
    users,
} from "@/db/schema";
import { eq, and, isNull, isNotNull, desc, asc, inArray } from "drizzle-orm";
import type { AssessmentTemplateSchema, FormAnswer } from "@/lib/assessment-templates/types";
import { validateFormAnswers, validateFormAnswersDetailed } from "@/lib/assessment-templates/validate";
import { autoFillSupplierAnswersForExternal, autoFillSupplierAnswersForExternalOverwrite } from "./assessment-autofill";
import pmaSchema from "@/lib/assessment-templates/supplier-self-assessment-pma-code-of-conduct.json";
import { getBundledTemplateSchema, resolveAssessmentTemplateSchema } from "@/lib/assessment-templates";
import { storeUploadedFile } from "@/lib/file-storage";
import { createSystemNotification } from "@/app/actions/notifications";
import { sendEmail } from "@/lib/services/email";

// Normalize schema to ensure all required arrays exist
function normalizeSchema(schema: AssessmentTemplateSchema): AssessmentTemplateSchema {
    return {
        ...schema,
        sections: (schema.sections ?? []).map((section) => ({
            ...section,
            blocks: (section.blocks ?? []).map((block) => ({
                ...block,
                fields: block.fields ?? [],
                subBlocks: (block.subBlocks ?? []).map((subBlock) => ({
                    ...subBlock,
                    fields: subBlock.fields ?? [],
                })),
            })),
        })),
    };
}

export type AssessmentStatus = "answer_pending" | "in_progress" | "submitted" | "rejected";

export interface ExternalContactInformation {
    organization: string;
    mainContact: { name: string; avatar?: string | null };
    email: string;
}

export interface ExternalRequestDetails {
    subject: string;
    sentOn: string | null;
    dueOn: string | null;
}

export interface ExternalBuyerAddress {
    company: string;
    street: string;
    city: string;
    country: string;
}

export interface ExternalFormData {
    id: string;
    assessmentRequestId: string;
    supplierId: string;
    supplierName: string;
    status: AssessmentStatus;
    schema: AssessmentTemplateSchema;
    answers: FormAnswer;
    /** Timestamp of the server-side draft used to safely recover local edits. */
    draftUpdatedAt: string | null;
    contactInformation: ExternalContactInformation;
    requestDetails: ExternalRequestDetails;
    buyerAddress: ExternalBuyerAddress;
    buyerName: string | null;
    buyerEmail: string | null;
    documentRequests: Array<{
        id: string;
        groupLabel: string;
        name: string;
        isAnswerRequired: boolean;
        allowAdditionalAttachments: boolean;
        documentUrl: string | null;
    }>;
}

function mapStatus(participantStatus: string | null): AssessmentStatus {
    switch (participantStatus) {
        case "in_progress":
            return "in_progress";
        case "submitted":
        case "completed":
            return "submitted";
        case "rejected":
            return "rejected";
        case "pending":
        case "sent":
        default:
            return "answer_pending";
    }
}

function schemaForCategory(category: string | null): AssessmentTemplateSchema {
    // Each of the 9 enum categories has a bundled JSON in
    // `src/lib/assessment-templates/*.json`. We prefer the bundled schema
    // for the actual category and only fall back to the PMA schema when
    // no bundle exists (which should never happen for the seeded enum
    // values, but is a safe last resort).
    return (
        getBundledTemplateSchema(category) ??
        (pmaSchema as unknown as AssessmentTemplateSchema)
    );
}

async function getPrimaryContactId(participantId: string, fallbackContactId: string | null): Promise<string | null> {
    if (fallbackContactId) return fallbackContactId;
    const linked = await db
        .select({ contactId: assessmentRequestSupplierContacts.contactId })
        .from(assessmentRequestSupplierContacts)
        .where(eq(assessmentRequestSupplierContacts.assessmentRequestSupplierId, participantId))
        .limit(1);
    return linked[0]?.contactId ?? null;
}

async function upsertFormResponse(params: {
    assessmentRequestId: string;
    supplierId: string;
    contactId: string | null;
    answers: FormAnswer;
    status: "draft" | "submitted" | "rejected";
}): Promise<void> {
    const existing = await db
        .select({ id: assessmentResponses.id })
        .from(assessmentResponses)
        .where(
            and(
                eq(assessmentResponses.assessmentRequestId, params.assessmentRequestId),
                eq(assessmentResponses.supplierId, params.supplierId),
                isNull(assessmentResponses.documentRequestId)
            )
        )
        .orderBy(desc(assessmentResponses.createdAt))
        .limit(1);

    const payload = {
        answers: JSON.stringify(params.answers),
        status: params.status,
        updatedAt: new Date(),
    };

    if (existing[0]) {
        await db
            .update(assessmentResponses)
            .set(payload)
            .where(eq(assessmentResponses.id, existing[0].id));
    } else {
        await db.insert(assessmentResponses).values({
            assessmentRequestId: params.assessmentRequestId,
            supplierId: params.supplierId,
            contactId: params.contactId,
            answers: payload.answers,
            status: params.status,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }
}

export async function getExternalAssessmentForm(
    assessmentId: string,
    requestId: string
): Promise<ExternalFormData | null> {
    const [participant] = await db
        .select()
        .from(assessmentRequestSuppliers)
        .where(eq(assessmentRequestSuppliers.id, requestId))
        .limit(1);

    if (!participant) return null;

    const [request] = await db
        .select()
        .from(assessmentRequests)
        .where(eq(assessmentRequests.id, assessmentId))
        .limit(1);

    if (!request) return null;

    const [supplier] = await db
        .select()
        .from(suppliers)
        .where(eq(suppliers.id, participant.supplierId))
        .limit(1);

    const [template] = request.templateId
        ? await db.select().from(assessmentTemplates).where(eq(assessmentTemplates.id, request.templateId)).limit(1)
        : [null];

    const schema = normalizeSchema(
        resolveAssessmentTemplateSchema(template?.category ?? null, template?.config ?? null)
            ?? schemaForCategory(template?.category ?? null)
    );

    const contactId = await getPrimaryContactId(participant.id, participant.contactId);
    const [contact] = contactId
        ? await db.select().from(contacts).where(eq(contacts.id, contactId)).limit(1)
        : [null];

    // Lazy live prefill: if the supplier's Properties have been updated since
    // the request was published, refresh the prefill from the latest Supplier
    // Properties. Use the external-safe variant (suppliers authenticate via
    // magic token, not NextAuth, so the buyer-side `auth()` check would
    // always fail here).
    //
    // Two modes:
    //  - **Overwrite** when the existing draft row has never been touched by
    //    the supplier (status still `draft` and answers were written by a
    //    previous autofill run that may have been incomplete or stale).
    //    This guarantees every link the supplier opens shows the freshest
    //    prefill derived from the supplier's current properties — including
    //    nested sub-blocks like `production_site_details`.
    //  - **Preserve** once the supplier has manually edited and saved
    //    (`in_progress` / `submitted` / `rejected`), so the autofill never
    //    clobbers their work.
    if (contactId) {
        try {
            const [existingBefore] = await db
                .select({ status: assessmentResponses.status })
                .from(assessmentResponses)
                .where(
                    and(
                        eq(assessmentResponses.assessmentRequestId, assessmentId),
                        eq(assessmentResponses.supplierId, participant.supplierId),
                        eq(assessmentResponses.contactId, contactId),
                        isNull(assessmentResponses.documentRequestId)
                    )
                )
                .orderBy(desc(assessmentResponses.createdAt))
                .limit(1);
            const preservedStatuses = new Set(["in_progress", "submitted", "completed", "approved", "rejected"]);
            // A saved supplier draft must never be treated as untouched
            // prefill data. Older drafts retain the `draft` response status,
            // while the participant is moved to `in_progress` on first save.
            const useOverwrite = !existingBefore || (existingBefore.status === "draft" && participant.status !== "in_progress");
            if (useOverwrite) {
                await autoFillSupplierAnswersForExternalOverwrite(assessmentId, participant.id, contactId);
            } else if (!preservedStatuses.has(existingBefore.status)) {
                await autoFillSupplierAnswersForExternal(assessmentId, participant.id, contactId);
            }
        } catch (err) {
            console.error("Lazy prefill on form open failed:", err);
        }
    }

    const [responsible] = request.responsibleId
        ? await db.select({ name: users.name, email: users.email }).from(users).where(eq(users.id, request.responsibleId)).limit(1)
        : [null];

    const existingResponse = await db
        .select({ answers: assessmentResponses.answers, status: assessmentResponses.status, updatedAt: assessmentResponses.updatedAt })
        .from(assessmentResponses)
        .where(
            and(
                eq(assessmentResponses.assessmentRequestId, assessmentId),
                eq(assessmentResponses.supplierId, participant.supplierId),
                isNull(assessmentResponses.documentRequestId)
            )
        )
        .orderBy(desc(assessmentResponses.createdAt))
        .limit(1);

    const documentRequests = await db
        .select({
            id: assessmentDocumentRequests.id,
            groupLabel: assessmentDocumentRequestGroups.label,
            name: assessmentDocumentRequests.name,
            isAnswerRequired: assessmentDocumentRequests.isAnswerRequired,
            allowAdditionalAttachments: assessmentDocumentRequestGroups.allowAdditionalAttachments,
            documentUrl: assessmentResponses.documentUrl,
        })
        .from(assessmentDocumentRequests)
        .innerJoin(
            assessmentDocumentRequestGroups,
            eq(assessmentDocumentRequests.groupId, assessmentDocumentRequestGroups.id)
        )
        .leftJoin(
            assessmentResponses,
            and(
                eq(assessmentResponses.documentRequestId, assessmentDocumentRequests.id),
                eq(assessmentResponses.assessmentRequestId, assessmentId),
                eq(assessmentResponses.supplierId, participant.supplierId)
            )
        )
        .where(eq(assessmentDocumentRequestGroups.assessmentRequestId, assessmentId))
        .orderBy(asc(assessmentDocumentRequestGroups.order), asc(assessmentDocumentRequests.order));

    const answers: FormAnswer = existingResponse[0]?.answers
        ? (JSON.parse(existingResponse[0].answers) as FormAnswer)
        : {};

    return {
        id: participant.id,
        assessmentRequestId: assessmentId,
        supplierId: participant.supplierId,
        supplierName: supplier?.name ?? "Supplier",
        status: mapStatus(participant.status),
        schema,
        answers,
        draftUpdatedAt: existingResponse[0]?.updatedAt?.toISOString() ?? null,
        contactInformation: {
            organization: supplier?.name ?? "Supplier",
            mainContact: {
                name: contact?.name ?? supplier?.name ?? "Supplier",
                avatar: null,
            },
            email: contact?.email ?? "",
        },
        requestDetails: {
            subject: request.title,
            sentOn: participant.sentAt ? participant.sentAt.toISOString() : null,
            dueOn: request.dueDate ? request.dueDate.toISOString() : null,
        },
        buyerAddress: {
            company: responsible?.name ?? "Axiom",
            street: "Supplier Assessment",
            city: "Remote",
            country: "Germany",
        },
        buyerName: responsible?.name ?? null,
        buyerEmail: responsible?.email ?? null,
        documentRequests: documentRequests.map((doc) => ({
            ...doc,
            isAnswerRequired: Boolean(doc.isAnswerRequired),
            allowAdditionalAttachments: Boolean(doc.allowAdditionalAttachments),
        })),
    };
}

export async function uploadExternalAssessmentDocument(
    assessmentId: string,
    requestId: string,
    documentRequestId: string | null,
    file: File
): Promise<{ ok: boolean; url?: string; error?: string }> {
    try {
        const [participant] = await db
            .select()
            .from(assessmentRequestSuppliers)
            .where(and(eq(assessmentRequestSuppliers.id, requestId), eq(assessmentRequestSuppliers.assessmentRequestId, assessmentId)))
            .limit(1);
        if (!participant) return { ok: false, error: "Request not found" };

        const [documentRequest] = documentRequestId ? await db
            .select({ id: assessmentDocumentRequests.id })
            .from(assessmentDocumentRequests)
            .innerJoin(assessmentDocumentRequestGroups, eq(assessmentDocumentRequests.groupId, assessmentDocumentRequestGroups.id))
            .where(and(eq(assessmentDocumentRequests.id, documentRequestId), eq(assessmentDocumentRequestGroups.assessmentRequestId, assessmentId)))
            .limit(1) : [null];
        if (documentRequestId && !documentRequest) return { ok: false, error: "Document request not found" };
        if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Select a document first" };

        const stored = await storeUploadedFile(file);
        if (!documentRequestId) return { ok: true, url: stored.url };

        const contactId = await getPrimaryContactId(participant.id, participant.contactId);
        const [existing] = await db
            .select({ id: assessmentResponses.id })
            .from(assessmentResponses)
            .where(and(
                eq(assessmentResponses.assessmentRequestId, assessmentId),
                eq(assessmentResponses.supplierId, participant.supplierId),
                eq(assessmentResponses.documentRequestId, documentRequestId)
            ))
            .limit(1);

        if (existing) {
            await db.update(assessmentResponses).set({ documentUrl: stored.url, updatedAt: new Date() }).where(eq(assessmentResponses.id, existing.id));
        } else {
            await db.insert(assessmentResponses).values({
                assessmentRequestId: assessmentId,
                supplierId: participant.supplierId,
                contactId,
                documentRequestId,
                documentUrl: stored.url,
                status: "draft",
                submittedAt: null,
            });
        }
        return { ok: true, url: stored.url };
    } catch (err) {
        console.error("uploadExternalAssessmentDocument failed", err);
        return { ok: false, error: "Upload failed. Please try again." };
    }
}

// Shape expected by the existing ExternalAssessmentLandingClient.
export interface ExternalAssessmentResponse {
    id: string;
    assessmentRequestId: string;
    supplierId: string;
    supplierName: string;
    supplierAddress: { company: string; street: string; city: string; country: string };
    supplierContact: { name: string; email: string };
    contactName: string;
    contactEmail: string;
    assessmentTitle: string;
    status: AssessmentStatus;
    buyerName: string | null;
    buyerEmail: string | null;
    dueDate?: string | null;
    sentAt: string;
    messageBody?: string;
    template: { id: string; name: string; config: unknown };
}

export async function getExternalAssessmentResponse(
    assessmentId: string,
    requestId: string
): Promise<ExternalAssessmentResponse | null> {
    const data = await getExternalAssessmentForm(assessmentId, requestId);
    if (!data) return null;

    const buyerMessageBlock = data.schema.sections
        .find((s) => s.key === "buyer_message")
        ?.blocks.find((b) => b.key === "buyer_message_block");

    return {
        id: data.id,
        assessmentRequestId: data.assessmentRequestId,
        supplierId: data.supplierId,
        supplierName: data.supplierName,
        supplierAddress: {
            company: data.buyerAddress.company,
            street: data.buyerAddress.street,
            city: data.buyerAddress.city,
            country: data.buyerAddress.country,
        },
        supplierContact: {
            name: data.contactInformation.mainContact.name,
            email: data.contactInformation.email,
        },
        contactName: data.contactInformation.mainContact.name,
        contactEmail: data.contactInformation.email,
        assessmentTitle: data.schema.name,
        status: data.status,
        buyerName: data.buyerName,
        buyerEmail: data.buyerEmail,
        dueDate: data.requestDetails.dueOn,
        sentAt: data.requestDetails.sentOn ?? new Date().toISOString(),
        messageBody: buyerMessageBlock?.message,
        template: {
            id: data.schema.id,
            name: data.schema.name,
            config: data.schema,
        },
    };
}

export async function saveExternalAssessmentDraft(
    assessmentId: string,
    requestId: string,
    answers: FormAnswer
): Promise<{ ok: boolean; status?: AssessmentStatus; error?: string }> {
    try {
        const [participant] = await db
            .select()
            .from(assessmentRequestSuppliers)
            .where(eq(assessmentRequestSuppliers.id, requestId))
            .limit(1);

        if (!participant) return { ok: false, error: "Participant not found" };

        if (participant.status === "submitted" || participant.status === "completed" || participant.status === "rejected") {
            return { ok: false, error: "This response has already been finalized and can no longer be edited." };
        }

        const contactId = await getPrimaryContactId(participant.id, participant.contactId);

        await upsertFormResponse({
            assessmentRequestId: assessmentId,
            supplierId: participant.supplierId,
            contactId,
            answers,
            // `assessmentResponses` uses draft/submitted/rejected; the
            // participant row carries the in_progress workflow status.
            status: "draft",
        });

        if (participant.status === "pending" || participant.status === "sent") {
            await db
                .update(assessmentRequestSuppliers)
                .set({ status: "in_progress", updatedAt: new Date() })
                .where(eq(assessmentRequestSuppliers.id, participant.id));
        }

        return { ok: true, status: "in_progress" };
    } catch (err) {
        console.error("saveExternalAssessmentDraft failed", err);
        return {
            ok: false,
            error: "We could not save your draft due to a server error. Please retry.",
        };
    }
}

export async function submitExternalAssessment(
    assessmentId: string,
    requestId: string,
    answers: FormAnswer
): Promise<{ ok: boolean; errors?: string[]; fieldErrors?: Array<{ fieldKey: string; sectionKey: string; blockKey: string; message: string }>; status?: AssessmentStatus; error?: string }> {
    try {
        const [participant] = await db
            .select()
            .from(assessmentRequestSuppliers)
            .where(eq(assessmentRequestSuppliers.id, requestId))
            .limit(1);

        if (!participant) return { ok: false, error: "Participant not found" };

        if (participant.status === "submitted" || participant.status === "completed") {
            return { ok: false, error: "This response has already been submitted." };
        }
        if (participant.status === "rejected") {
            return { ok: false, error: "This participation has been rejected." };
        }

        const [request] = await db
            .select()
            .from(assessmentRequests)
            .where(eq(assessmentRequests.id, assessmentId))
            .limit(1);
        if (!request) return { ok: false, error: "Request not found" };

        const [template] = request.templateId
            ? await db.select().from(assessmentTemplates).where(eq(assessmentTemplates.id, request.templateId)).limit(1)
            : [null];

        let schema: AssessmentTemplateSchema;
        try {
            schema = normalizeSchema(
                resolveAssessmentTemplateSchema(template?.category ?? null, template?.config ?? null)
                    ?? schemaForCategory(template?.category ?? null)
            );
        } catch (parseErr) {
            console.error("submitExternalAssessment: invalid template.config JSON", parseErr);
            return { ok: false, error: "Assessment template is misconfigured. Please contact the requester." };
        }

        const errors = validateFormAnswers(schema, answers);
        if (errors.length > 0) {
            // Also build field-level errors so the client can render inline
            // messages on the offending fields instead of just a toast.
            const detailed = validateFormAnswersDetailed(schema, answers);
            return {
                ok: false,
                errors,
                fieldErrors: detailed.map((e) => ({
                    fieldKey: e.fieldKey,
                    sectionKey: e.sectionKey,
                    blockKey: e.blockKey,
                    message: e.message,
                })),
            };
        }

        const contactId = await getPrimaryContactId(participant.id, participant.contactId);

        await upsertFormResponse({
            assessmentRequestId: assessmentId,
            supplierId: participant.supplierId,
            contactId,
            answers,
            status: "submitted",
        });

        await db
            .update(assessmentResponses)
            .set({ status: "submitted", submittedAt: new Date(), updatedAt: new Date() })
            .where(and(
                eq(assessmentResponses.assessmentRequestId, assessmentId),
                eq(assessmentResponses.supplierId, participant.supplierId),
                isNotNull(assessmentResponses.documentRequestId)
            ));

        await db
            .update(assessmentRequestSuppliers)
            .set({ status: "submitted", respondedAt: new Date(), updatedAt: new Date() })
            .where(eq(assessmentRequestSuppliers.id, participant.id));

        try {
            const [requestRow] = await db
                .select({
                    title: assessmentRequests.title,
                    responsibleId: assessmentRequests.responsibleId,
                    createdById: assessmentRequests.createdById,
                })
                .from(assessmentRequests)
                .where(eq(assessmentRequests.id, assessmentId))
                .limit(1);

            const [supplierRow] = await db
                .select({ name: suppliers.name })
                .from(suppliers)
                .where(eq(suppliers.id, participant.supplierId))
                .limit(1);

            const recipients = Array.from(
                new Set([requestRow?.responsibleId, requestRow?.createdById].filter((id): id is string => Boolean(id)))
            );

            if (recipients.length > 0) {
                const receiverRows = await db
                    .select({ id: users.id, email: users.email, name: users.name })
                    .from(users)
                    .where(inArray(users.id, recipients));

                const supplierName = supplierRow?.name ?? "A supplier";
                const title = "New supplier response submitted";
                const message = `${supplierName} has submitted a response for "${requestRow?.title ?? "an assessment request"}". Please review it.`;
                const link = `/requests/assessments/${assessmentId}?tab=responses`;

                await Promise.all(receiverRows.map(async (user) => {
                    await createSystemNotification({ userId: user.id, title, message, type: "success", link });
                    if (user.email) {
                        await sendEmail({
                            to: user.email,
                            subject: `Supplier response submitted: ${requestRow?.title ?? "Assessment request"}`,
                            body: `${supplierName} has submitted a response for "${requestRow?.title ?? "the assessment request"}".\n\nReview it here: ${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}${link}`,
                        });
                    }
                }));
            }
        } catch (notificationError) {
            console.error("submitExternalAssessment notification failed", notificationError);
        }

        return { ok: true, status: "submitted" };
    } catch (err) {
        console.error("submitExternalAssessment failed", err);
        return {
            ok: false,
            error: "We could not save your submission due to a server error. Please retry, and contact the requester if the problem persists.",
        };
    }
}

export async function rejectExternalAssessment(
    assessmentId: string,
    requestId: string,
    reason?: string
): Promise<{ ok: boolean; status?: AssessmentStatus; error?: string }> {
    const [participant] = await db
        .select()
        .from(assessmentRequestSuppliers)
        .where(eq(assessmentRequestSuppliers.id, requestId))
        .limit(1);

    if (!participant) return { ok: false, error: "Participant not found" };

    await db
        .update(assessmentRequestSuppliers)
        .set({ status: "rejected", updatedAt: new Date() })
        .where(eq(assessmentRequestSuppliers.id, participant.id));

    const contactId = await getPrimaryContactId(participant.id, participant.contactId);
    await upsertFormResponse({
        assessmentRequestId: assessmentId,
        supplierId: participant.supplierId,
        contactId,
        answers: {},
        status: "rejected",
    });

    return { ok: true, status: "rejected" };
}
