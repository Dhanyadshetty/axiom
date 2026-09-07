import type {
    AssessmentTemplate,
    DocumentTemplate,
} from "@/db/schema";

export type { AssessmentTemplate, DocumentTemplate };

export type AssessmentListRow = {
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

export type AssessmentDetail = {
    id: string;
    title: string;
    description: string | null;
    responsibleId: string;
    teamIds: string[] | null;
    dueDate: Date | null;
    status: "draft" | "published" | "closed";
    templateId: string | null;
    messageBody: string | null;
    createdById: string;
    createdAt: Date;
    updatedAt: Date;
    responsible: { id: string; name: string | null; email: string | null; image: string | null } | null;
    createdBy: { id: string; name: string | null } | null;
    template: AssessmentTemplate | null;
    documentRequestGroups: Array<{
        id: string;
        assessmentRequestId: string;
        label: string;
        allowAdditionalAttachments: boolean;
        order: number;
        documents: Array<{
            id: string;
            groupId: string;
            documentTemplateId: string;
            name: string;
            isAnswerRequired: boolean;
            order: number;
        }>;
    }>;
    suppliers: Array<{
        id: string;
        supplierId: string;
        supplierName: string | null;
        contactId: string | null;
        contactName: string | null;
        contactEmail: string | null;
        status: string;
        contacts: Array<{
            contactId: string | null;
            contactName: string | null;
            contactEmail: string | null;
        }>;
    }>;
    responseCount: number;
};

export type SupplierDocumentResponse = {
    documentRequestId: string | null;
    documentUrl: string | null;
    responseText: string | null;
    documentName: string | null;
    submittedAt: Date | null;
};
