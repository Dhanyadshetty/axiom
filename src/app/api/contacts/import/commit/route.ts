import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { commitContactImport, prepareContactImport } from '@/app/actions/contacts-detail';
import { isValidEmail } from '@/components/contacts/contacts-schema';
import { z } from 'zod';

const rowSchema = z.object({
    name: z.string().optional().default(''),
    email: z.string().optional().default(''),
    phone: z.string().optional().nullable(),
    language: z.string().optional().nullable(),
    department: z.string().optional().nullable(),
    position: z.string().optional().nullable(),
    responsibility: z.string().optional().nullable(),
    status: z.enum(['active', 'inactive', 'on_hold']).optional().default('active'),
});

const bodySchema = z.object({
    supplierId: z.string().trim().min(1).nullable(),
    rows: z.array(rowSchema),
    dryRun: z.boolean().optional(),
});

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => null);
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid body', details: parsed.error.issues }, { status: 400 });
    }

    const { supplierId, rows, dryRun } = parsed.data;

    const review = await prepareContactImport({ supplierId, rows: rows as unknown as Array<Record<string, string>> });

    if (dryRun) {
        return NextResponse.json({
            success: true,
            review: review.parsed,
            imported: 0,
            rejected: [],
        });
    }

    const validIndexes = new Set(review.parsed.filter((r) => r.errors.length === 0).map((r) => r.rowIndex));
    const accepted = rows.filter((_, i) => validIndexes.has(i)).map((r) => ({
        name: (r.name || '').trim(),
        email: (r.email || '').trim(),
        phone: r.phone || null,
        language: r.language || null,
        department: r.department || null,
        position: r.position || null,
        responsibility: r.responsibility || null,
        status: (r.status || 'active') as any,
    })).filter((r) => r.name && isValidEmail(r.email));

    const result = await commitContactImport({ supplierId, rows: accepted });
    return NextResponse.json({
        success: result.success,
        imported: result.imported,
        rejected: result.rejected,
        review: review.parsed,
        error: result.error,
    });
}
