import { NextRequest, NextResponse } from 'next/server';
import { validateMagicToken } from '@/lib/services/magic-tokens';
import { db } from '@/db';
import { assessmentRequestSuppliers, assessmentRequests } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ assessmentId: string; requestId: string }> }
) {
    const { assessmentId, requestId } = await params;

    try {
        // Validate magic token from Authorization header or body
        const authHeader = request.headers.get('authorization');
        const body = await request.json().catch(() => ({}));
        const token = authHeader?.replace('Bearer ', '') || body.magicToken;

        if (!token) {
            return NextResponse.json({ error: 'Magic token required' }, { status: 401 });
        }

        const validation = await validateMagicToken(token);

        if (!validation.valid) {
            return NextResponse.json({ error: validation.error || 'Invalid token' }, { status: 401 });
        }

        const { participant, assessmentRequest } = validation;

        // Verify this is the correct request
        if (assessmentRequest.id !== assessmentId) {
            return NextResponse.json({ error: 'Token does not match this request' }, { status: 403 });
        }

        // Check if already rejected
        if (participant.status === 'rejected') {
            return NextResponse.json({ error: 'Already rejected' }, { status: 400 });
        }

        // Update participant status to rejected
        await db.update(assessmentRequestSuppliers)
            .set({ 
                status: 'rejected',
                respondedAt: new Date(),
            })
            .where(eq(assessmentRequestSuppliers.id, participant.id));

        // Revoke all tokens for this participant
        await db.update(assessmentRequestSuppliers)
            .set({ status: 'rejected' })
            .where(eq(assessmentRequestSuppliers.id, participant.id));

        return NextResponse.json({ 
            success: true, 
            message: 'Participation rejected successfully' 
        });
    } catch (error) {
        console.error('Failed to reject participation:', error);
        return NextResponse.json({ error: 'Failed to reject participation' }, { status: 500 });
    }
}