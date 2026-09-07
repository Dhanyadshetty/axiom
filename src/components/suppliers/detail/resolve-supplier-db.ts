import 'server-only';
import { db } from '@/db';
import { suppliers } from '@/db/schema';
import { eq, or } from 'drizzle-orm';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function resolveSupplierByIdOrNumber(idOrNumber: string) {
    if (!idOrNumber) return null;
    const numeric = idOrNumber.replace(/[^0-9]/g, '');
    const conds: any[] = [];
    if (UUID_RE.test(idOrNumber)) conds.push(eq(suppliers.id, idOrNumber));
    if (idOrNumber !== numeric) conds.push(eq(suppliers.supplierNumber, idOrNumber));
    if (numeric && numeric !== idOrNumber) conds.push(eq(suppliers.supplierNumber, numeric));
    if (!conds.length) return null;
    const rows = await db.select({
        id: suppliers.id,
        name: suppliers.name,
        supplierNumber: suppliers.supplierNumber,
    }).from(suppliers).where(or(...conds)).limit(1);
    return rows[0] ?? null;
}
