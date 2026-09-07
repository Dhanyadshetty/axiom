import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { listContacts, createContact } from '@/app/actions/contacts-detail';
import { isValidEmail, type ContactStatus } from '@/components/contacts/contacts-schema';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: supplierId } = await params;
    const url = new URL(req.url);
    const statusParam = url.searchParams.getAll('status');
    const language = url.searchParams.getAll('language');
    const department = url.searchParams.getAll('department');
    const search = url.searchParams.get('q') || undefined;
    const sortBy = (url.searchParams.get('sortBy') || undefined) as any;
    const sortDir = (url.searchParams.get('sortDir') || undefined) as any;
    const limit = url.searchParams.get('limit') ? Number(url.searchParams.get('limit')) : 100;
    const offset = url.searchParams.get('offset') ? Number(url.searchParams.get('offset')) : 0;

    const result = await listContacts({
        supplierId,
        status: statusParam.length ? (statusParam as ContactStatus[]) : undefined,
        language: language.length ? language : undefined,
        department: department.length ? department : undefined,
        search,
        sortBy,
        sortDir,
        limit,
        offset,
    });

    return NextResponse.json(result);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: supplierId } = await params;
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });

    const email = String(body.email || '').trim();
    const name = String(body.name || '').trim();
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    if (!email || !isValidEmail(email)) return NextResponse.json({ error: 'Invalid email' }, { status: 400 });

    const result = await createContact({
        name,
        email,
        phone: body.phone ?? null,
        supplierId,
        language: body.language ?? null,
        department: body.department ?? null,
        position: body.position ?? null,
        responsibility: body.responsibility ?? null,
        status: (body.status || 'active') as ContactStatus,
    });
    if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ data: result.data }, { status: 201 });
}
