import { buildWorkbookFromSheet, buildCsvFromSheet } from '@/lib/contacts/import-parser';
import { TEMPLATE_HEADERS } from '@/components/contacts/contacts-schema';
import { auth } from '@/auth';

export const runtime = 'nodejs';

function sample(): Array<Record<string, string>> {
    return [
        {
            name: 'Anna Müller',
            email: 'anna.mueller@example.com',
            phone: '+49 123 456 7890',
            language: 'German',
            department: 'Purchasing/Procurement',
            position: 'Senior Buyer',
            responsibility: 'Price Inquiries for Articles',
            status: 'active',
        },
    ];
}

export async function GET(req: Request) {
    const session = await auth();
    if (!session?.user) {
        return new Response('Unauthorized', { status: 401 });
    }
    const url = new URL(req.url);
    const format = (url.searchParams.get('format') || 'xlsx').toLowerCase();

    if (format === 'csv') {
        const csv = buildCsvFromSheet(TEMPLATE_HEADERS, sample());
        return new Response(csv, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': 'attachment; filename="contacts_template.csv"',
            },
        });
    }

    const buf = buildWorkbookFromSheet(TEMPLATE_HEADERS, sample());
    return new Response(buf, {
        status: 200,
        headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename="contacts_template.xlsx"',
        },
    });
}
