import { NextRequest, NextResponse } from 'next/server';
import { validateMagicToken } from '@/lib/services/magic-tokens';
import { db } from '@/db';
import { assessmentRequestSuppliers, assessmentRequests, assessmentResponses, assessmentDocumentRequests, suppliers, users } from '@/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { enqueueAssessmentEmail } from '@/lib/queue/email-queue';
import { createSystemNotification } from '@/app/actions/notifications';
import { sendEmail } from '@/lib/services/email';

export const dynamic = 'force-dynamic';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ assessmentId: string; requestId: string }> }
) {
    const { assessmentId, requestId } = await params;

    try {
        // Validate magic token
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

        const { participant, assessmentRequest, contact } = validation;

        // Verify this is the correct request
        if (assessmentRequest.id !== assessmentId) {
            return NextResponse.json({ error: 'Token does not match this request' }, { status: 403 });
        }

        // Check if already submitted
        if (participant.status === 'submitted' || participant.status === 'completed') {
            return NextResponse.json({ error: 'Already submitted' }, { status: 400 });
        }

        const { responses } = body; // Array of { documentRequestId, responseText, documentUrl }

        if (!responses || !Array.isArray(responses) || responses.length === 0) {
            return NextResponse.json({ error: 'At least one response is required' }, { status: 400 });
        }

        // Validate document request IDs belong to this assessment
        const docRequestIds = responses.map(r => r.documentRequestId).filter(Boolean);
        if (docRequestIds.length > 0) {
            const validDocRequests = await db.select({ id: assessmentDocumentRequests.id })
                .from(assessmentDocumentRequests)
                .innerJoin(assessmentRequests, eq(assessmentDocumentRequests.groupId, assessmentRequests.id))
                .where(and(
                    eq(assessmentRequests.id, assessmentId),
                    inArray(assessmentDocumentRequests.id, docRequestIds)
                ));
            
            const validIds = new Set(validDocRequests.map(d => d.id));
            for (const response of responses) {
                if (response.documentRequestId && !validIds.has(response.documentRequestId)) {
                    return NextResponse.json({ error: `Invalid document request ID: ${response.documentRequestId}` }, { status: 400 });
                }
            }
        }

        // Save responses
        const responseRecords = await db.insert(assessmentResponses).values(
            responses.map(r => ({
                assessmentRequestId: assessmentId,
                supplierId: participant.supplierId,
                contactId: contact.id,
                documentRequestId: r.documentRequestId || null,
                responseText: r.responseText || null,
                documentUrl: r.documentUrl || null,
                submittedAt: new Date(),
                status: 'submitted',
            }))
        ).returning();

        // Update participant status
        await db.update(assessmentRequestSuppliers)
            .set({ 
                status: 'submitted',
                respondedAt: new Date(),
            })
            .where(eq(assessmentRequestSuppliers.id, participant.id));

        // Send confirmation email to supplier contact
        await enqueueAssessmentEmail(
            assessmentId,
            participant.id,
            contact.id,
            'confirmation',
            {
                submittedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            }
        );

        // Notify the assessment managers (responsible + creator) of the new response
        try {
            const [ar] = await db
                .select({
                    title: assessmentRequests.title,
                    responsibleId: assessmentRequests.responsibleId,
                    createdById: assessmentRequests.createdById,
                })
                .from(assessmentRequests)
                .where(eq(assessmentRequests.id, assessmentId))
                .limit(1);

            const [supplierRow] = await db
                .select({ name: suppliers.name })
                .from(suppliers)
                .where(eq(suppliers.id, participant.supplierId))
                .limit(1);

            const supplierName = supplierRow?.name ?? 'A supplier';
            const link = `/requests/assessments/${assessmentId}?tab=responses`;
            const title = 'New response submitted';
            const message = `${supplierName} submitted a response to "${ar?.title ?? 'an assessment request'}".`;
            const recipients = Array.from(
                new Set([ar?.responsibleId, ar?.createdById].filter((id): id is string => Boolean(id)))
            );

            if (recipients.length > 0) {
                const recipientUsers = await db
                    .select({ id: users.id, email: users.email, name: users.name })
                    .from(users)
                    .where(inArray(users.id, recipients));

                for (const user of recipientUsers) {
                    await createSystemNotification({ userId: user.id, title, message, type: 'success', link });
                    if (user.email) {
                        await sendEmail({
                            to: user.email,
                            subject: `Assessment response submitted: ${ar?.title ?? 'Supplier assessment'}`,
                            body: `${supplierName} has submitted an assessment response for "${ar?.title ?? 'the request'}".\n\nReview it here: ${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}${link}`,
                        });
                    }
                }
            }
        } catch (notifError) {
            console.error('Failed to create submission notification:', notifError);
        }

        // Check if all required responses are submitted
        const requiredDocRequests = await db.select({ id: assessmentDocumentRequests.id })
            .from(assessmentDocumentRequests)
            .innerJoin(assessmentRequests, eq(assessmentDocumentRequests.groupId, assessmentRequests.id))
            .where(and(
                eq(assessmentRequests.id, assessmentId),
                eq(assessmentDocumentRequests.isAnswerRequired, true)
            ));

        const submittedDocRequestIds = new Set(responseRecords.map((r: { documentRequestId: string | null }) => r.documentRequestId).filter(Boolean));
        const allRequiredSubmitted = requiredDocRequests.every(dr => submittedDocRequestIds.has(dr.id));

        if (allRequiredSubmitted) {
            await db.update(assessmentRequestSuppliers)
                .set({ status: 'completed' })
                .where(eq(assessmentRequestSuppliers.id, participant.id));
        }

        return NextResponse.json({ 
            success: true, 
            message: 'Response submitted successfully',
            responseCount: responseRecords.length,
            allRequiredSubmitted,
        });
    } catch (error) {
        console.error('Failed to submit response:', error);
        return NextResponse.json({ error: 'Failed to submit response' }, { status: 500 });
    }
}