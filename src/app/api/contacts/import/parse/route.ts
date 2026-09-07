import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { parseWorkbook } from '@/lib/contacts/import-parser';

export const runtime = 'nodejs';

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
        return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    }
    const buf = await file.arrayBuffer();
    try {
        const parsed = parseWorkbook(buf, file.name);
        return NextResponse.json({
            fileName: file.name,
            sheetCount: parsed.sheets.length,
            sheets: parsed.sheets.map((s) => ({
                name: s.name,
                headers: s.headers,
                rowCount: s.rows.length,
                suggestedMapping: s.suggestedMapping,
                preview: s.rows.slice(0, 10),
            })),
        });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to parse file' },
            { status: 400 },
        );
    }
}
