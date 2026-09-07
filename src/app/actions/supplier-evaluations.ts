'use server'

import { db } from "@/db";
import {
    supplierEvaluationTemplates,
    supplierEvaluations,
    suppliers,
    users,
    type SupplierEvaluation,
    type SupplierEvaluationTemplate,
} from "@/db/schema";
import { and, asc, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { logActivity } from "./activity";
import { hasSupplierPermission } from "@/lib/suppliers/rbac";

export async function getEvaluationTemplates(): Promise<SupplierEvaluationTemplate[]> {
    const session = await auth();
    if (!session) return [];
    try {
        return await db
            .select()
            .from(supplierEvaluationTemplates)
            .where(eq(supplierEvaluationTemplates.isActive, true))
            .orderBy(asc(supplierEvaluationTemplates.name));
    } catch (error) {
        console.error("Failed to fetch evaluation templates:", error);
        return [];
    }
}

export interface SupplierEvaluationListRow {
    id: string;
    supplierId: string;
    title: string;
    status: SupplierEvaluation["status"];
    language: string | null;
    templateId: string;
    templateName: string | null;
    createdByName: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export async function getSupplierEvaluations(supplierId: string): Promise<SupplierEvaluationListRow[]> {
    const session = await auth();
    if (!session || !supplierId) return [];
    try {
        const rows = await db
            .select({
                id: supplierEvaluations.id,
                supplierId: supplierEvaluations.supplierId,
                title: supplierEvaluations.title,
                status: supplierEvaluations.status,
                language: supplierEvaluations.language,
                templateId: supplierEvaluations.templateId,
                createdAt: supplierEvaluations.createdAt,
                updatedAt: supplierEvaluations.updatedAt,
                createdById: supplierEvaluations.createdById,
            })
            .from(supplierEvaluations)
            .where(eq(supplierEvaluations.supplierId, supplierId))
            .orderBy(desc(supplierEvaluations.updatedAt));

        if (rows.length === 0) return [];

        const templateIds = Array.from(new Set(rows.map((r) => r.templateId)));
        const creatorIds = Array.from(
            new Set(rows.map((r) => r.createdById).filter((id): id is string => Boolean(id))),
        );

        const [templateRows, creatorRows] = await Promise.all([
            templateIds.length
                ? db
                      .select({ id: supplierEvaluationTemplates.id, name: supplierEvaluationTemplates.name })
                      .from(supplierEvaluationTemplates)
                      .where(eq(supplierEvaluationTemplates.isActive, true))
                : Promise.resolve([] as { id: string; name: string }[]),
            creatorIds.length
                ? db.select({ id: users.id, name: users.name }).from(users)
                : Promise.resolve([] as { id: string; name: string | null }[]),
        ]);

        const templateMap = new Map(templateRows.map((t) => [t.id, t.name]));
        const creatorMap = new Map(creatorRows.map((u) => [u.id, u.name ?? null]));

        return rows.map((r) => ({
            id: r.id,
            supplierId: r.supplierId,
            title: r.title,
            status: r.status,
            language: r.language,
            templateId: r.templateId,
            templateName: templateMap.get(r.templateId) ?? null,
            createdByName: r.createdById ? creatorMap.get(r.createdById) ?? null : null,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
        }));
    } catch (error) {
        console.error("Failed to fetch supplier evaluations:", error);
        return [];
    }
}

export interface CreateEvaluationInput {
    supplierId: string;
    templateId: string;
    title: string;
    language?: string;
    notes?: string;
}

export type CreateEvaluationResult =
    | { success: true; evaluation: SupplierEvaluation }
    | { success: false; error: string };

export async function createEvaluation(input: CreateEvaluationInput): Promise<CreateEvaluationResult> {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };
    const role = (session.user?.role as string) ?? "user";
    if (!hasSupplierPermission(role, "suppliers.edit")) {
        return { success: false, error: "You do not have permission to create evaluations." };
    }

    const supplierId = String(input.supplierId ?? "").trim();
    const templateId = String(input.templateId ?? "").trim();
    const title = String(input.title ?? "").trim();

    if (!supplierId) return { success: false, error: "Missing supplier." };
    if (!templateId) return { success: false, error: "Please select an evaluation template." };
    if (!title) return { success: false, error: "Please enter an evaluation title." };

    try {
        const [supplier] = await db
            .select({ id: suppliers.id, name: suppliers.name })
            .from(suppliers)
            .where(eq(suppliers.id, supplierId))
            .limit(1);
        if (!supplier) return { success: false, error: "Supplier not found." };

        const [template] = await db
            .select({ id: supplierEvaluationTemplates.id, isActive: supplierEvaluationTemplates.isActive })
            .from(supplierEvaluationTemplates)
            .where(and(eq(supplierEvaluationTemplates.id, templateId), eq(supplierEvaluationTemplates.isActive, true)))
            .limit(1);
        if (!template) return { success: false, error: "Selected evaluation template is no longer available." };

        const [created] = await db
            .insert(supplierEvaluations)
            .values({
                supplierId,
                templateId,
                title,
                language: input.language ?? "en",
                notes: input.notes ?? null,
                status: "draft",
                createdById: session.user?.id ?? null,
            })
            .returning();

        if (!created) return { success: false, error: "Failed to create evaluation." };

        await logActivity(
            "CREATE",
            "supplier_evaluation",
            created.id,
            `Evaluation "${created.title}" created for supplier ${supplier.name}`,
        );

        revalidatePath(`/suppliers/${supplierId}/overview`);
        revalidatePath(`/suppliers/${supplierId}/evaluations`);
        revalidatePath("/suppliers");

        return { success: true, evaluation: created };
    } catch (error) {
        console.error("Failed to create evaluation:", error);
        return { success: false, error: "Failed to create evaluation." };
    }
}

export async function deleteSupplierEvaluation(evaluationId: string): Promise<{ success: boolean; error?: string }> {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };
    const role = (session.user?.role as string) ?? "user";
    if (!hasSupplierPermission(role, "suppliers.edit")) {
        return { success: false, error: "You do not have permission to delete evaluations." };
    }

    try {
        const [existing] = await db
            .select({
                id: supplierEvaluations.id,
                supplierId: supplierEvaluations.supplierId,
                title: supplierEvaluations.title,
            })
            .from(supplierEvaluations)
            .where(eq(supplierEvaluations.id, evaluationId))
            .limit(1);

        if (!existing) return { success: false, error: "Evaluation not found." };

        await db.delete(supplierEvaluations).where(eq(supplierEvaluations.id, evaluationId));

        await logActivity(
            "DELETE",
            "supplier_evaluation",
            evaluationId,
            `Evaluation "${existing.title}" deleted`,
        );

        revalidatePath(`/suppliers/${existing.supplierId}/evaluations`);
        revalidatePath(`/suppliers/${existing.supplierId}/overview`);
        revalidatePath("/suppliers");

        return { success: true };
    } catch (error) {
        console.error("Failed to delete evaluation:", error);
        return { success: false, error: "Failed to delete evaluation." };
    }
}

export async function ensureEvaluationTemplatesSeeded(): Promise<void> {
    const session = await auth();
    if (!session) return;
    try {
        const existing = await db
            .select({ name: supplierEvaluationTemplates.name })
            .from(supplierEvaluationTemplates)
            .limit(50);

        const existingNames = new Set(existing.map((e) => e.name));
        const seeds: Array<{ name: string; category: typeof supplierEvaluationTemplates.$inferInsert.category; description: string }> = [
            {
                name: "ESG Risk Analysis - Own Business Areas",
                category: "esg_risk_own_business_area",
                description: "Assess ESG risk posture across the supplier's own operations and business areas.",
            },
            {
                name: "ESG Risk Analysis - Occasion-based Evaluation",
                category: "esg_risk_occasion_based",
                description: "Trigger an ESG risk evaluation tied to a specific occasion or event.",
            },
            {
                name: "ESG Risk Analysis - Supplier Self Assessment",
                category: "esg_risk_supplier_self_assessment",
                description: "Supplier-driven self-assessment of ESG risks and mitigations.",
            },
            {
                name: "ESG Risk Analysis - Mitigation Factors & Appropriateness",
                category: "esg_risk_mitigation_factors",
                description: "Evaluate mitigation factors and the appropriateness of ESG controls.",
            },
        ];

        const missing = seeds.filter((s) => !existingNames.has(s.name));
        if (missing.length > 0) {
            await db
                .insert(supplierEvaluationTemplates)
                .values(
                    missing.map((s) => ({
                        name: s.name,
                        category: s.category,
                        description: s.description,
                        isActive: true,
                        createdById: session.user?.id ?? null,
                    })),
                );
        }
    } catch (error) {
        console.error("Failed to seed evaluation templates:", error);
    }
}
