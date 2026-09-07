'use server'

import { db } from "@/db";
import {
    suppliers,
    contacts,
    assessmentRequestSuppliers,
    assessmentRequestSupplierContacts,
    platformSettings,
} from "@/db/schema";
import { eq, and, asc, ilike, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { logActivity } from "./activity";
import { auth } from "@/auth";
import { autoFillSupplierAnswers } from "./assessment-autofill";

const ASSESSMENT_PAGE = "/requests/assessments";

export type DefaultSupplierContact = {
    contact: string;
    email: string;
    phone?: string | null;
    language?: string | null;
    department?: string | null;
    position?: string | null;
    responsibility?: string | null;
    status?: string | null;
    supplierName: string;
};

export type ImportContactRow = {
    contact: string;
    email: string;
    phone?: string | null;
    language?: string | null;
    department?: string | null;
    position?: string | null;
    responsibility?: string | null;
    status?: string | null;
};

export type ImportSupplierPayload = {
    supplierName: string;
    existingSupplierId?: string | null;
    status?: string | null;
    contacts: ImportContactRow[];
};

export type ImportResult = {
    success: boolean;
    error?: string;
    createdSuppliers: number;
    createdContacts: number;
    linkedSuppliers: number;
    errors: string[];
};

function normalizeName(value: string | null | undefined): string {
    if (!value) return "";
    return value
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase();
}

function normalizeContactStatus(value: string | null | undefined): "active" | "inactive" | "on_hold" {
    const v = (value ?? "").trim().toLowerCase();
    if (v === "inactive" || v === "on_hold" || v === "on hold" || v === "hold") return "inactive";
    if (v === "active") return "active";
    return "active";
}

function normalizeSupplierStatus(value: string | null | undefined): "active" | "inactive" | "blacklisted" {
    const v = (value ?? "").trim().toLowerCase();
    if (v === "inactive") return "inactive";
    if (v === "blacklisted") return "blacklisted";
    return "active";
}

async function findSupplierByName(name: string): Promise<{ id: string; name: string | null } | null> {
    const key = normalizeName(name);
    if (!key) return null;
    const rows = await db
        .select({ id: suppliers.id, name: suppliers.name })
        .from(suppliers)
        .limit(2000);
    return rows.find((r) => normalizeName(r.name) === key) ?? null;
}

async function ensureLinked(
    assessmentRequestId: string,
    supplierId: string
): Promise<{ arsId: string; created: boolean }> {
    const [existing] = await db
        .select({ id: assessmentRequestSuppliers.id })
        .from(assessmentRequestSuppliers)
        .where(
            and(
                eq(assessmentRequestSuppliers.assessmentRequestId, assessmentRequestId),
                eq(assessmentRequestSuppliers.supplierId, supplierId)
            )
        )
        .limit(1);

    if (existing) {
        return { arsId: existing.id, created: false };
    }

    const [created] = await db.insert(assessmentRequestSuppliers).values({
        assessmentRequestId,
        supplierId,
        status: "pending",
    }).returning();
    return { arsId: created.id, created: true };
}

/**
 * Link a contact to a supplier participant. One supplier can have many contacts
 * via the assessment_request_supplier_contacts join table. The first linked
 * contact also becomes the supplier row's primary `contactId` for display.
 */
export async function linkContactToRequestSupplier(
    arsId: string,
    contactId: string
): Promise<void> {
    await db
        .insert(assessmentRequestSupplierContacts)
        .values({ assessmentRequestSupplierId: arsId, contactId })
        .onConflictDoNothing();
    const [row] = await db
        .select({ contactId: assessmentRequestSuppliers.contactId })
        .from(assessmentRequestSuppliers)
        .where(eq(assessmentRequestSuppliers.id, arsId))
        .limit(1);
    if (!row?.contactId) {
        await db
            .update(assessmentRequestSuppliers)
            .set({ contactId, updatedAt: new Date() })
            .where(eq(assessmentRequestSuppliers.id, arsId));
    }
    // Auto-fill the outgoing form for this supplier + contact from the
    // supplier's profile and the contact's details. Failures are logged but
    // never block the contact-link operation.
    try {
        const [participant] = await db
            .select({ assessmentRequestId: assessmentRequestSuppliers.assessmentRequestId })
            .from(assessmentRequestSuppliers)
            .where(eq(assessmentRequestSuppliers.id, arsId))
            .limit(1);
        if (participant?.assessmentRequestId) {
            await autoFillSupplierAnswers(
                participant.assessmentRequestId,
                arsId,
                contactId
            );
        }
    } catch (err) {
        console.error("linkContactToRequestSupplier: auto-fill failed", err);
    }
}

/**
 * Commit a set of supplier + contact rows in a single save.
 * Writes to the global Suppliers module (suppliers + contacts) and attaches
 * each supplier as a participant of the assessment request. Duplicate supplier
 * records are never created: rows whose supplier name already exists in the
 * system (or was created earlier in this same batch) are merged onto the
 * existing supplier instead of inserted again.
 */
export async function importSuppliersToAssessment(
    assessmentRequestId: string,
    payload: ImportSupplierPayload[]
): Promise<ImportResult> {
    const session = await auth();
    if (!session || session.user.role === "supplier") {
        return { success: false, error: "Unauthorized", createdSuppliers: 0, createdContacts: 0, linkedSuppliers: 0, errors: ["Unauthorized"] };
    }

    const result: ImportResult = {
        success: true,
        createdSuppliers: 0,
        createdContacts: 0,
        linkedSuppliers: 0,
        errors: [],
    };

    if (!Array.isArray(payload) || payload.length === 0) {
        return { success: false, error: "No rows to import", createdSuppliers: 0, createdContacts: 0, linkedSuppliers: 0, errors: ["No rows to import"] };
    }

    const seenSupplierKeys = new Map<string, string>(); // normalized name -> supplierId

    try {
        for (const entry of payload) {
            const supplierName = (entry.supplierName ?? "").trim();
            if (!supplierName) {
                result.errors.push("A row is missing a supplier name and was skipped.");
                continue;
            }

            let supplierId: string;

            if (entry.existingSupplierId) {
                supplierId = entry.existingSupplierId;
            } else {
                const key = normalizeName(supplierName);
                const already = seenSupplierKeys.get(key);
                if (already) {
                    supplierId = already;
                } else {
                    const existing = await findSupplierByName(supplierName);
                    if (existing) {
                        supplierId = existing.id;
                        seenSupplierKeys.set(key, supplierId);
                    } else {
                        const [created] = await db
                            .insert(suppliers)
                            .values({
                                name: supplierName,
                                contactEmail: "",
                                status: normalizeSupplierStatus(entry.status),
                                lifecycleStatus: "prospect",
                            })
                            .returning();
                        supplierId = created.id;
                        seenSupplierKeys.set(key, supplierId);
                        result.createdSuppliers += 1;
                        await logActivity("CREATE", "supplier", supplierId, `Supplier created via Add suppliers import: ${supplierName}`);
                    }
                }
            }

            const { arsId, created } = await ensureLinked(assessmentRequestId, supplierId);
            if (created) result.linkedSuppliers += 1;

            // Contacts are created in the global Suppliers module and linked to the
            // supplier participant. One supplier can carry many contacts.
            for (const c of entry.contacts ?? []) {
                const email = (c.email ?? "").trim();
                const contactName = (c.contact ?? "").trim();
                if (!contactName && !email) continue;
                const [contactRow] = await db
                    .insert(contacts)
                    .values({
                        name: contactName || email,
                        email: email || `${normalizeName(contactName) || "contact"}@unknown.local`,
                        phone: (c.phone ?? "").trim() || null,
                        jobTitle: (c.position ?? "").trim() || null,
                        language: (c.language ?? "").trim() || null,
                        department: (c.department ?? "").trim() || null,
                        responsibility: (c.responsibility ?? "").trim() || null,
                        status: normalizeContactStatus(c.status),
                        supplierId,
                        createdBy: session.user.id,
                    })
                    .returning();
                await linkContactToRequestSupplier(arsId, contactRow.id);
                result.createdContacts += 1;
            }
        }

        if (result.errors.length) result.success = false;

        await logActivity(
            "UPDATE",
            "assessment_request",
            assessmentRequestId,
            `Imported ${result.createdSuppliers} supplier(s) and ${result.createdContacts} contact(s)`
        );
        revalidatePath(`${ASSESSMENT_PAGE}/${assessmentRequestId}`);
        revalidatePath(ASSESSMENT_PAGE);
        revalidatePath("/suppliers");
        return result;
    } catch (error) {
        console.error("Failed to import suppliers:", error);
        return { success: false, error: "Failed to import suppliers", createdSuppliers: result.createdSuppliers, createdContacts: result.createdContacts, linkedSuppliers: result.linkedSuppliers, errors: ["Failed to import suppliers"] };
    }
}

export type ExistingContactRow = {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    supplierId: string | null;
    supplierName: string | null;
    language: string | null;
    department: string | null;
    position: string | null;
    responsibility: string | null;
    status: string | null;
};

export async function getExistingContactsForPicker(opts: {
    search?: string;
    supplierId?: string | null;
    status?: string | null;
} = {}): Promise<ExistingContactRow[]> {
    const session = await auth();
    if (!session) return [];
    try {
        const rows = await db
            .select({
                id: contacts.id,
                name: contacts.name,
                email: contacts.email,
                phone: contacts.phone,
                supplierId: contacts.supplierId,
                supplierName: suppliers.name,
                language: contacts.language,
                department: contacts.department,
                position: contacts.position,
                responsibility: contacts.responsibility,
                status: contacts.status,
            })
            .from(contacts)
            .leftJoin(suppliers, eq(contacts.supplierId, suppliers.id))
            .orderBy(asc(suppliers.name), asc(contacts.name))
            .limit(500);

        const query = (opts.search ?? "").trim().toLowerCase();
        return rows.filter((r) => {
            if (opts.supplierId && r.supplierId !== opts.supplierId) return false;
            if (opts.status && r.status !== opts.status) return false;
            if (!query) return true;
            return (
                (r.name ?? "").toLowerCase().includes(query) ||
                r.email.toLowerCase().includes(query) ||
                (r.supplierName ?? "").toLowerCase().includes(query)
            );
        });
    } catch (error) {
        console.error("Failed to fetch contacts:", error);
        return [];
    }
}

export async function getSupplierOptionsForFilter(): Promise<{ id: string; name: string | null }[]> {
    const session = await auth();
    if (!session) return [];
    try {
        const rows = await db
            .select({ id: suppliers.id, name: suppliers.name })
            .from(suppliers)
            .orderBy(asc(suppliers.name))
            .limit(10000);
        return rows;
    } catch (error) {
        console.error("Failed to fetch supplier options:", error);
        return [];
    }
}

export type AddSuppliersGridRow = {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    supplierId: string | null;
    supplierName: string | null;
    supplierNumber: string | null;
    language: string | null;
    department: string | null;
    position: string | null;
    responsibility: string | null;
    status: string | null;
};

/**
 * Fetch all contacts for the "Add Suppliers" modal default grid.
 * Returns contacts from the one-time Excel upload (default suppliers).
 * If no Excel upload exists, returns empty array.
 * This populates the grid immediately on modal open.
 */
export async function getContactsForAddSuppliersGrid(opts: {
    search?: string;
    supplierId?: string | null;
    status?: string | null;
    limit?: number;
} = {}): Promise<AddSuppliersGridRow[]> {
    // Use the new default suppliers from Excel upload
    return getDefaultSuppliersForGrid(opts);
}

export type AddExistingContactItem = {
    contactId: string;
    supplierId: string;
};

export async function addExistingContactsToAssessment(
    assessmentRequestId: string,
    items: AddExistingContactItem[]
): Promise<{ success: boolean; error?: string; linked: number }> {
    const session = await auth();
    if (!session || session.user.role === "supplier") {
        return { success: false, error: "Unauthorized", linked: 0 };
    }
    if (!Array.isArray(items) || items.length === 0) {
        return { success: false, error: "No contacts selected", linked: 0 };
    }
    try {
        let linked = 0;
        for (const item of items) {
            const { arsId, created } = await ensureLinked(assessmentRequestId, item.supplierId);
            await linkContactToRequestSupplier(arsId, item.contactId);
            if (created) linked += 1;
        }
        await logActivity("UPDATE", "assessment_request", assessmentRequestId, `Added ${items.length} existing contact(s)`);
        revalidatePath(`${ASSESSMENT_PAGE}/${assessmentRequestId}`);
        revalidatePath(ASSESSMENT_PAGE);
        return { success: true, linked };
    } catch (error) {
        console.error("Failed to add existing contacts:", error);
        return { success: false, error: "Failed to add contacts", linked: 0 };
    }
}

/**
 * Save uploaded Excel suppliers as default for the Add Suppliers grid
 * This appends new suppliers to existing default suppliers (preserves original records)
 */
export async function saveDefaultSuppliersFromExcel(
    suppliersData: DefaultSupplierContact[]
): Promise<{ success: boolean; error?: string; count: number }> {
    const session = await auth();
    if (!session || session.user.role === "supplier") {
        return { success: false, error: "Unauthorized", count: 0 };
    }

    try {
        // Validate and clean incoming data
        const validNewData = suppliersData
            .filter(d => d.email && d.email.includes('@') && d.supplierName)
            .map(d => ({
                contact: d.contact?.trim() || d.email.split('@')[0],
                email: d.email.trim().toLowerCase(),
                phone: d.phone?.trim() || null,
                language: d.language?.trim() || null,
                department: d.department?.trim() || null,
                position: d.position?.trim() || null,
                responsibility: d.responsibility?.trim() || null,
                status: d.status?.trim() || 'Active',
                supplierName: d.supplierName.trim(),
            }));

        if (validNewData.length === 0) {
            return { success: false, error: "No valid supplier data provided", count: 0 };
        }

        // Fetch existing default suppliers
        const [settings] = await db.select().from(platformSettings).where(eq(platformSettings.id, 1)).limit(1);
        
        let existingData: DefaultSupplierContact[] = [];
        if (settings?.defaultSuppliersData) {
            try {
                existingData = JSON.parse(settings.defaultSuppliersData);
            } catch {
                existingData = [];
            }
        }

        // Create a set of existing keys (email + supplierName) for deduplication
        const existingKeys = new Set(
            existingData.map(d => `${d.email.trim().toLowerCase()}::${d.supplierName.trim().toLowerCase()}`)
        );

        // Filter out new data that already exists
        const uniqueNewData = validNewData.filter(d => {
            const key = `${d.email}::${d.supplierName.toLowerCase()}`;
            return !existingKeys.has(key);
        });

        // Combine existing and new data (existing first, then new)
        const combinedData = [...existingData, ...uniqueNewData];

        // Store as JSON in platform settings
        await db.update(platformSettings)
            .set({
                defaultSuppliersData: JSON.stringify(combinedData),
                defaultSuppliersUploadedAt: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(platformSettings.id, 1));

        await logActivity("UPDATE", "platform_settings", "1", `Saved ${uniqueNewData.length} new default suppliers from Excel upload (total: ${combinedData.length})`);
        revalidatePath("/requests/assessments");
        revalidatePath("/suppliers");

        return { success: true, count: uniqueNewData.length };
    } catch (error) {
        console.error("Failed to save default suppliers:", error);
        return { success: false, error: "Failed to save default suppliers", count: 0 };
    }
}

/**
 * Get contacts for the Add Suppliers grid from the canonical `contacts` table.
 *
 * This is the single source of truth shared with the Supplier Contacts tab:
 * any contact created/edited/activated under a supplier's Contacts page
 * is reflected here on the next modal open (no caching, no duplicate blob).
 *
 * Optional `opts.supplierId` filters by linked supplier UUID.
 * Optional `opts.status` ("active" | "all") defaults to active.
 * Optional `opts.search` matches against name, email, phone, supplier name,
 * language, department, position, and responsibility.
 */
export async function getDefaultSuppliersForGrid(opts: {
    search?: string;
    supplierId?: string | null;
    status?: string | null;
    limit?: number;
} = {}): Promise<AddSuppliersGridRow[]> {
    const session = await auth();
    if (!session) return [];

    try {
        const where: ReturnType<typeof eq>[] = [];
        if (opts.supplierId) where.push(eq(contacts.supplierId, opts.supplierId));
        const statusFilter = (opts.status ?? "active").toLowerCase();
        if (statusFilter !== "all") {
            where.push(eq(contacts.status, statusFilter as "active" | "inactive" | "on_hold"));
        }
        const query = (opts.search ?? "").trim();
        if (query) {
            const like = `%${query}%`;
            const searchOr = or(
                ilike(contacts.name, like),
                ilike(contacts.email, like),
                ilike(contacts.phone, like),
                ilike(contacts.department, like),
                ilike(contacts.position, like),
                ilike(contacts.responsibility, like),
                ilike(contacts.language, like),
                ilike(suppliers.name, like),
            );
            where.push(searchOr as ReturnType<typeof eq>);
        }

        let qb = db
            .select({
                id: contacts.id,
                name: contacts.name,
                email: contacts.email,
                phone: contacts.phone,
                supplierId: contacts.supplierId,
                supplierName: suppliers.name,
                supplierNumber: suppliers.supplierNumber,
                language: contacts.language,
                department: contacts.department,
                position: contacts.position,
                responsibility: contacts.responsibility,
                status: contacts.status,
            })
            .from(contacts)
            .leftJoin(suppliers, eq(contacts.supplierId, suppliers.id))
            .where(where.length ? and(...where) : undefined)
            .orderBy(asc(contacts.name));

        if (opts.limit) qb = qb.limit(opts.limit) as typeof qb;

        const rows = await qb;
        return rows.map((r) => ({
            id: r.id,
            name: r.name,
            email: r.email,
            phone: r.phone ?? null,
            supplierId: r.supplierId ?? null,
            supplierName: r.supplierName ?? null,
            supplierNumber: r.supplierNumber ?? null,
            language: r.language ?? null,
            department: r.department ?? null,
            position: r.position ?? null,
            responsibility: r.responsibility ?? null,
            status: r.status ?? "active",
        }));
    } catch (error) {
        console.error("Failed to fetch contacts for Add Suppliers grid:", error);
        return [];
    }
}

/**
 * Clear the stored default suppliers (reset to empty)
 */
export async function clearDefaultSuppliers(): Promise<{ success: boolean; error?: string }> {
    const session = await auth();
    if (!session || session.user.role === "supplier") {
        return { success: false, error: "Unauthorized" };
    }

    try {
        await db.update(platformSettings)
            .set({
                defaultSuppliersData: null,
                defaultSuppliersUploadedAt: null,
                updatedAt: new Date(),
            })
            .where(eq(platformSettings.id, 1));

        await logActivity("UPDATE", "platform_settings", "1", "Cleared default suppliers");
        revalidatePath("/requests/assessments");
        revalidatePath("/suppliers");

        return { success: true };
    } catch (error) {
        console.error("Failed to clear default suppliers:", error);
        return { success: false, error: "Failed to clear default suppliers" };
    }
}

/**
 * Check if default suppliers have been uploaded
 */
export async function hasDefaultSuppliers(): Promise<boolean> {
    try {
        const [settings] = await db.select({ data: platformSettings.defaultSuppliersData }).from(platformSettings).where(eq(platformSettings.id, 1)).limit(1);
        return !!(settings?.data && JSON.parse(settings.data).length > 0);
    } catch {
        return false;
    }
}
