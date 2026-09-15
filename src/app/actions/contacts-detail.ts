'use server';

import { db } from '@/db';
import { contacts, suppliers, users } from '@/db/schema';
import { eq, and, or, ilike, sql, desc, asc, inArray, notInArray, isNull, isNotNull, ne, not } from 'drizzle-orm';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { isValidEmail, type ContactColumnKey, type ContactStatus } from '@/components/contacts/contacts-schema';

export interface ContactRow {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    supplierId: string | null;
    supplierName: string | null;
    supplierNumber: string | null;
    language: string | null;
    department: string | null;
    position: string | null;
    responsibility: string | null;
    status: ContactStatus;
    createdAt: string | null;
    updatedAt: string | null;
}

export type FilterOperator =
    | 'contains'
    | 'does_not_contain'
    | 'equals'
    | 'does_not_equal'
    | 'begins_with'
    | 'does_not_begin_with'
    | 'ends_with'
    | 'does_not_end_with'
    | 'blank'
    | 'not_blank'
    | 'is_one_of'
    | 'is_none_of';

export interface AdvancedFilterRule {
    field: ContactColumnKey;
    operator: FilterOperator;
    value?: string;
    values?: string[];
}

export interface ContactListFilter {
    status?: ContactStatus[];
    language?: string[];
    department?: string[];
    supplierId?: string;
    search?: string;
    advancedFilters?: AdvancedFilterRule[];
    sortBy?: 'name' | 'email' | 'status' | 'createdAt';
    sortDir?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
}

export async function listContacts(filter: ContactListFilter = {}): Promise<{ rows: ContactRow[]; total: number }> {
    const session = await auth();
    if (!session?.user) return { rows: [], total: 0 };

    const where: any[] = [];
    if (filter.supplierId) where.push(eq(contacts.supplierId, filter.supplierId));
    if (filter.status && filter.status.length) where.push(inArray(contacts.status, filter.status));
    if (filter.language && filter.language.length) where.push(inArray(contacts.language, filter.language));
    if (filter.department && filter.department.length) where.push(inArray(contacts.department, filter.department));

    if (filter.advancedFilters && filter.advancedFilters.length) {
        for (const rule of filter.advancedFilters) {
            const cond = buildFilterCondition(rule);
            if (cond) where.push(cond);
        }
    }

    if (filter.search) {
        const q = `%${filter.search}%`;
        const orExpr = or(
            ilike(contacts.name, q),
            ilike(contacts.email, q),
            ilike(contacts.phone, q),
        );
        where.push(orExpr);
    }

    const sortCol =
        filter.sortBy === 'email' ? contacts.email
        : filter.sortBy === 'status' ? contacts.status
        : filter.sortBy === 'createdAt' ? contacts.createdAt
        : contacts.name;
    const dir = filter.sortDir === 'desc' ? desc : asc;

    let qb = db.select({
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
        createdAt: contacts.createdAt,
        updatedAt: contacts.updatedAt,
    })
        .from(contacts)
        .leftJoin(suppliers, eq(contacts.supplierId, suppliers.id))
        .where(where.length ? and(...where) : undefined)
        .orderBy(dir(sortCol));

    if (filter.limit) qb = qb.limit(filter.limit) as any;
    if (filter.offset) qb = qb.offset(filter.offset) as any;

    const rows = (await qb).map((r) => ({
        ...r,
        status: (r.status || 'active') as ContactStatus,
        createdAt: r.createdAt ? r.createdAt.toISOString() : null,
        updatedAt: r.updatedAt ? r.updatedAt.toISOString() : null,
    }));

    const countRow = await db
        .select({ n: sql<number>`count(*)::int` })
        .from(contacts)
        .leftJoin(suppliers, eq(contacts.supplierId, suppliers.id))
        .where(where.length ? and(...where) : undefined);

    return { rows, total: Number(countRow[0]?.n ?? 0) };
}

function buildFilterCondition(rule: AdvancedFilterRule) {
    const isSupplier = rule.field === 'supplier';
    const colMap: Record<string, any> = {
        name: contacts.name,
        email: contacts.email,
        phone: contacts.phone,
        supplier: contacts.supplierId,
        language: contacts.language,
        department: contacts.department,
        position: contacts.position,
        responsibility: contacts.responsibility,
        status: contacts.status,
    };
    const col = colMap[rule.field];
    if (!col) return undefined;

    const val = (rule.value ?? '').trim();
    const vals = (rule.values ?? []).filter(Boolean);
    const hasBlanks = vals.includes('(Blanks)');
    const nonBlankVals = vals.filter((v) => v !== '(Blanks)');

    switch (rule.operator) {
        case 'contains':
            if (isSupplier) {
                return val ? ilike(suppliers.name, `%${val}%`) : undefined;
            }
            return val ? ilike(col, `%${val}%`) : undefined;
        case 'does_not_contain':
            if (isSupplier) {
                return val ? not(ilike(suppliers.name, `%${val}%`)) : undefined;
            }
            return val ? not(ilike(col, `%${val}%`)) : undefined;
        case 'equals':
            if (isSupplier) {
                return val ? ilike(suppliers.name, val) : undefined;
            }
            return val ? ilike(col, val) : undefined;
        case 'does_not_equal':
            if (isSupplier) {
                return val ? not(ilike(suppliers.name, val)) : undefined;
            }
            return val ? not(ilike(col, val)) : undefined;
        case 'begins_with':
            if (isSupplier) {
                return val ? ilike(suppliers.name, `${val}%`) : undefined;
            }
            return val ? ilike(col, `${val}%`) : undefined;
        case 'does_not_begin_with':
            if (isSupplier) {
                return val ? not(ilike(suppliers.name, `${val}%`)) : undefined;
            }
            return val ? not(ilike(col, `${val}%`)) : undefined;
        case 'ends_with':
            if (isSupplier) {
                return val ? ilike(suppliers.name, `%${val}`) : undefined;
            }
            return val ? ilike(col, `%${val}`) : undefined;
        case 'does_not_end_with':
            if (isSupplier) {
                return val ? not(ilike(suppliers.name, `%${val}`)) : undefined;
            }
            return val ? not(ilike(col, `%${val}`)) : undefined;
        case 'blank':
            return or(isNull(col), eq(col, ''));
        case 'not_blank':
            return and(isNotNull(col), ne(col, ''));
        case 'is_one_of': {
            if (!vals.length) return undefined;
            const conditions: any[] = [];
            if (hasBlanks) {
                conditions.push(isNull(col), eq(col, ''));
            }
            if (nonBlankVals.length) {
                if (rule.field === 'department' || rule.field === 'responsibility') {
                    // Match any tag in comma-separated strings
                    const tagConds = nonBlankVals.map((v) => ilike(col, `%${v}%`));
                    conditions.push(...tagConds);
                } else if (isSupplier) {
                    // Match supplier IDs or supplier names
                    conditions.push(or(
                        inArray(contacts.supplierId, nonBlankVals),
                        inArray(suppliers.name, nonBlankVals),
                        inArray(suppliers.id, nonBlankVals),
                    ));
                } else {
                    conditions.push(inArray(col, nonBlankVals));
                }
            }
            return conditions.length > 1 ? or(...conditions) : conditions[0];
        }
        case 'is_none_of': {
            if (!vals.length) return undefined;
            const conditions: any[] = [];
            if (hasBlanks) {
                conditions.push(and(isNotNull(col), ne(col, '')));
            }
            if (nonBlankVals.length) {
                if (rule.field === 'department' || rule.field === 'responsibility') {
                    const tagConds = nonBlankVals.map((v) => not(ilike(col, `%${v}%`)));
                    conditions.push(and(...tagConds));
                } else if (isSupplier) {
                    conditions.push(and(
                        notInArray(contacts.supplierId, nonBlankVals),
                        notInArray(suppliers.name, nonBlankVals),
                    ));
                } else {
                    conditions.push(notInArray(col, nonBlankVals));
                }
            }
            return conditions.length > 1 ? and(...conditions) : conditions[0];
        }
        default:
            return undefined;
    }
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function resolveSupplierUuid(ref: string): Promise<string | null> {
    if (!ref) return null;
    const numeric = ref.replace(/[^0-9]/g, '');
    const conds: any[] = [];
    if (UUID_RE.test(ref)) conds.push(eq(suppliers.id, ref));
    if (ref !== numeric) conds.push(eq(suppliers.supplierNumber, ref));
    if (numeric && numeric !== ref) conds.push(eq(suppliers.supplierNumber, numeric));
    if (conds.length) {
        const rows = await db.select({ id: suppliers.id })
            .from(suppliers)
            .where(or(...conds))
            .limit(1);
        if (rows[0]?.id) return rows[0].id;
    }
    const [created] = await db.insert(suppliers).values({
        name: `Supplier ${ref}`,
        contactEmail: `noreply+${ref.replace(/[^a-zA-Z0-9_-]/g, '-')}@placeholder.local`,
        supplierNumber: ref,
    }).returning({ id: suppliers.id });
    return created?.id ?? null;
}

const contactInputSchema = z.object({
    name: z.string().trim().min(1, 'Name is required'),
    email: z.string().trim().refine(isValidEmail, 'Invalid email'),
    phone: z.string().trim().optional().nullable(),
    supplierId: z.string().trim().min(1).optional().nullable(),
    language: z.string().trim().optional().nullable(),
    department: z.string().trim().optional().nullable(),
    position: z.string().trim().optional().nullable(),
    responsibility: z.string().trim().optional().nullable(),
    status: z.enum(['active', 'inactive', 'on_hold']).default('active'),
});

export async function createContact(input: z.input<typeof contactInputSchema>) {
    const session = await auth();
    if (!session?.user) return { success: false, error: 'Unauthorized' } as const;
    const parsed = contactInputSchema.safeParse(input);
    if (!parsed.success) {
        return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' } as const;
    }
    try {
        const data = parsed.data;
        const supplierUuid = data.supplierId ? await resolveSupplierUuid(data.supplierId) : null;
        const [row] = await db.insert(contacts).values({
            name: data.name,
            email: data.email,
            phone: data.phone || null,
            supplierId: supplierUuid,
            language: data.language || null,
            department: data.department || null,
            position: data.position || null,
            responsibility: data.responsibility || null,
            status: data.status,
            source: 'manual',
            createdBy: session.user.id,
        }).returning();
        revalidatePath('/contacts');
        if (data.supplierId) revalidatePath(`/suppliers/${data.supplierId}/contacts`);
        revalidatePath('/requests');
        revalidatePath('/requests/assessments');
        return { success: true, data: row } as const;
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Failed to create contact' } as const;
    }
}

const updateSchema = contactInputSchema.partial().extend({ id: z.string().trim().min(1) });

export async function updateContact(input: z.input<typeof updateSchema>) {
    const session = await auth();
    if (!session?.user) return { success: false, error: 'Unauthorized' } as const;
    const parsed = updateSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: 'Invalid input' } as const;
    try {
        const { id, supplierId, ...rest } = parsed.data;
        const patch: Record<string, unknown> = { updatedAt: new Date() };
        for (const [k, v] of Object.entries(rest)) {
            if (v !== undefined) patch[k] = v || null;
        }
        if (supplierId !== undefined) {
            patch.supplierId = supplierId ? await resolveSupplierUuid(supplierId) : null;
        }
        await db.update(contacts).set(patch).where(eq(contacts.id, id));
        revalidatePath('/contacts');
        revalidatePath('/requests');
        revalidatePath('/requests/assessments');
        return { success: true } as const;
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Failed to update contact' } as const;
    }
}

export async function deleteContact(id: string) {
    const session = await auth();
    if (!session?.user) return { success: false, error: 'Unauthorized' } as const;
    try {
        await db.delete(contacts).where(eq(contacts.id, id));
        revalidatePath('/contacts');
        revalidatePath('/requests');
        revalidatePath('/requests/assessments');
        return { success: true } as const;
    } catch {
        return { success: false, error: 'Failed to delete contact' } as const;
    }
}

export async function bulkDeleteContacts(ids: string[]) {
    const session = await auth();
    if (!session?.user) return { success: false, error: 'Unauthorized' } as const;
    if (!ids.length) return { success: true, count: 0 } as const;
    try {
        await db.delete(contacts).where(inArray(contacts.id, ids));
        revalidatePath('/contacts');
        revalidatePath('/requests');
        revalidatePath('/requests/assessments');
        return { success: true, count: ids.length } as const;
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to delete contacts' } as const;
    }
}

export async function updateContactStatus(id: string, status: ContactStatus) {
    const session = await auth();
    if (!session?.user) return { success: false, error: 'Unauthorized' } as const;
    try {
        await db.update(contacts).set({ status, updatedAt: new Date() }).where(eq(contacts.id, id));
        revalidatePath('/contacts');
        revalidatePath('/requests');
        revalidatePath('/requests/assessments');
        return { success: true } as const;
    } catch {
        return { success: false, error: 'Failed to update status' } as const;
    }
}

export interface ParsedContactForReview {
    rowIndex: number;
    data: Record<string, string>;
    errors: string[];
    isDuplicate: boolean;
}

export async function prepareContactImport(opts: {
    supplierId: string | null;
    rows: Array<Record<string, string>>;
}): Promise<{ parsed: ParsedContactForReview[] }> {
    const session = await auth();
    if (!session?.user) return { parsed: [] };
    const { supplierId, rows } = opts;

    const emails = rows.map((r) => r.email?.trim().toLowerCase()).filter(Boolean);
    let existingEmails: Set<string> = new Set();
    if (emails.length) {
        const conditions = [inArray(sql<string>`lower(${contacts.email})`, emails)];
        if (supplierId) {
            conditions.push(eq(contacts.supplierId, supplierId));
        }
        const existing = await db
            .select({ email: contacts.email })
            .from(contacts)
            .where(and(...conditions));
        existingEmails = new Set(existing.map((r) => r.email.toLowerCase()));
    }

    const parsed: ParsedContactForReview[] = rows.map((row, idx) => {
        const errors: string[] = [];
        const warnings: string[] = [];
        const name = row.name?.trim() ?? '';
        const email = row.email?.trim() ?? '';
        if (!name) errors.push('Missing name');
        if (!email) errors.push('Missing email');
        else if (!isValidEmail(email)) errors.push('Invalid email format');
        const isDuplicate = !!email && existingEmails.has(email.toLowerCase());
        if (isDuplicate) warnings.push('Existing contact with same email');
        return { rowIndex: idx, data: row, errors, warnings, isDuplicate };
    });

    return { parsed };
}

const commitRowSchema = z.object({
    name: z.string().trim().min(1),
    email: z.string().trim().refine(isValidEmail, 'Invalid email'),
    phone: z.string().optional().nullable(),
    supplierId: z.string().optional().nullable(),
    supplier: z.string().optional().nullable(),
    language: z.string().optional().nullable(),
    department: z.string().optional().nullable(),
    position: z.string().optional().nullable(),
    responsibility: z.string().optional().nullable(),
    status: z.enum(['active', 'inactive', 'on_hold']).default('active'),
});

export async function commitContactImport(opts: {
    supplierId: string | null;
    rows: Array<z.input<typeof commitRowSchema>>;
}) {
    const session = await auth();
    if (!session?.user) return { success: false, error: 'Unauthorized', imported: 0, rejected: 0 } as const;

    const defaultSupplierUuid = opts.supplierId ? await resolveSupplierUuid(opts.supplierId) : null;

    let imported = 0;
    const rejected: Array<{ index: number; reason: string }> = [];
    const values: any[] = [];

    for (let idx = 0; idx < opts.rows.length; idx++) {
        const row = opts.rows[idx];
        const parsed = commitRowSchema.safeParse(row);
        if (!parsed.success) {
            rejected.push({ index: idx, reason: parsed.error.issues[0]?.message ?? 'Invalid row' });
            continue;
        }
        const data = parsed.data;
        let rowSupplierUuid = defaultSupplierUuid;
        const rowSupplierRef = (data.supplierId || data.supplier || '').trim();
        if (rowSupplierRef) {
            const resolved = await resolveSupplierUuid(rowSupplierRef);
            if (resolved) rowSupplierUuid = resolved;
        }

        values.push({
            name: data.name,
            email: data.email,
            phone: data.phone || null,
            supplierId: rowSupplierUuid,
            language: data.language || null,
            department: data.department || null,
            position: data.position || null,
            responsibility: data.responsibility || null,
            status: data.status,
            source: 'import' as const,
            createdBy: session.user.id,
        });
        imported += 1;
    }

    try {
        if (values.length) {
            await db.insert(contacts).values(values);
            revalidatePath('/contacts');
            if (opts.supplierId) {
                revalidatePath(`/suppliers/${opts.supplierId}/contacts`);
            }
            revalidatePath('/requests');
            revalidatePath('/requests/assessments');
        }
        return { success: true, imported, rejected } as const;
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Insert failed', imported, rejected } as const;
    }
}

export async function listSuppliersLite() {
    const session = await auth();
    if (!session?.user) return [];
    const rows = await db.select({
        id: suppliers.id,
        name: suppliers.name,
        supplierNumber: suppliers.supplierNumber,
    }).from(suppliers).orderBy(asc(suppliers.name));
    return rows;
}
