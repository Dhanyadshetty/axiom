"use server";

import { db } from "@/db";
import {
    assessmentRequests,
    assessmentRequestSuppliers,
    assessmentRequestSupplierContacts,
    assessmentResponses,
    assessmentTemplates,
    suppliers,
    contacts,
    users,
} from "@/db/schema";
import { eq, and, isNull, desc } from "drizzle-orm";
import type { AssessmentTemplateSchema, FormAnswer } from "@/lib/assessment-templates/types";
import { validateFormAnswers, validateFormAnswersDetailed } from "@/lib/assessment-templates/validate";
import { autoFillSupplierAnswersForExternal, autoFillSupplierAnswersForExternalOverwrite } from "./assessment-autofill";
import pmaSchema from "@/lib/assessment-templates/supplier-self-assessment-pma-code-of-conduct.json";
import { getBundledTemplateSchema } from "@/lib/assessment-templates";

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
    contactInformation: ExternalContactInformation;
    requestDetails: ExternalRequestDetails;
    buyerAddress: ExternalBuyerAddress;
    buyerName: string | null;
    buyerEmail: string | null;
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

    let schema: AssessmentTemplateSchema;
    if (template?.config) {
        try {
            schema = normalizeSchema(JSON.parse(template.config) as AssessmentTemplateSchema);
        } catch {
            schema = schemaForCategory(template?.category ?? null);
        }
    } else {
        schema = schemaForCategory(template?.category ?? null);
    }
    // Ensure fallback schema is also normalized
    schema = normalizeSchema(schema);

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
            const useOverwrite = !existingBefore || existingBefore.status === "draft";
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
        .select({ answers: assessmentResponses.answers, status: assessmentResponses.status })
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
    };
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
            schema = template?.config
                ? normalizeSchema(JSON.parse(template.config) as AssessmentTemplateSchema)
                : normalizeSchema(schemaForCategory(template?.category ?? null));
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
            .update(assessmentRequestSuppliers)
            .set({ status: "submitted", respondedAt: new Date(), updatedAt: new Date() })
            .where(eq(assessmentRequestSuppliers.id, participant.id));

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
