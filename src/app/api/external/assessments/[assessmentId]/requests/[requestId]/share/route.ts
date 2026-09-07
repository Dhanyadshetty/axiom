import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { assessmentRequests, assessmentRequestSuppliers, assessmentRequestSupplierContacts, contacts, users, suppliers } from '@/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { enqueueAssessmentEmail } from '@/lib/queue/email-queue';
import { createMagicToken } from '@/lib/services/magic-tokens';

export const dynamic = 'force-dynamic';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ assessmentId: string; requestId: string }> }
) {
    const session = await auth();
    if (!session?.user || session.user.role === 'supplier') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { assessmentId, requestId } = await params;

    try {
        const body = await request.json();
        const { emails } = body;

        if (!emails || !Array.isArray(emails) || emails.length === 0) {
            return NextResponse.json({ error: 'At least one email is required' }, { status: 400 });
        }

        // Verify the assessment request exists and user has access
        const [assessmentRequest] = await db.select().from(assessmentRequests)
            .where(eq(assessmentRequests.id, assessmentId))
            .limit(1);

        if (!assessmentRequest) {
            return NextResponse.json({ error: 'Assessment request not found' }, { status: 404 });
        }

        // Check if user is the responsible person or creator
        if (assessmentRequest.responsibleId !== session.user.id && assessmentRequest.createdById !== session.user.id) {
            return NextResponse.json({ error: 'Not authorized to share this request' }, { status: 403 });
        }

        const results = [];

        for (const email of emails) {
            const trimmedEmail = email.trim().toLowerCase();
            if (!trimmedEmail) continue;

            // Find or create contact
            let [contact] = await db.select().from(contacts)
                .where(and(eq(contacts.email, trimmedEmail), isNull(contacts.supplierId)))
                .limit(1);

            let supplierId: string | null = null;
            let supplierName = 'Unknown Supplier';

            if (!contact) {
                // Try to find contact linked to a supplier
                [contact] = await db.select().from(contacts)
                    .where(eq(contacts.email, trimmedEmail))
                    .limit(1);
                
                if (contact?.supplierId) {
                    const [sup] = await db.select().from(suppliers).where(eq(suppliers.id, contact.supplierId)).limit(1);
                    supplierId = sup?.id || null;
                    supplierName = sup?.name || 'Unknown Supplier';
                }
            } else if (contact.supplierId) {
                const [sup] = await db.select().from(suppliers).where(eq(suppliers.id, contact.supplierId)).limit(1);
                supplierId = sup?.id || null;
                supplierName = sup?.name || 'Unknown Supplier';
            }

            // If no contact found, create a new one (minimal)
            if (!contact) {
                const [newContact] = await db.insert(contacts).values({
                    name: trimmedEmail.split('@')[0],
                    email: trimmedEmail,
                    status: 'active',
                    createdBy: session.user.id,
                }).returning();
                contact = newContact;
            }

            // Find or create supplier participant
            let participantId: string;

            if (supplierId) {
                const [existingParticipant] = await db.select().from(assessmentRequestSuppliers)
                    .where(and(
                        eq(assessmentRequestSuppliers.assessmentRequestId, assessmentId),
                        eq(assessmentRequestSuppliers.supplierId, supplierId)
                    ))
                    .limit(1);

                if (existingParticipant) {
                    participantId = existingParticipant.id;
                    // Link contact to participant
                    await db.insert(assessmentRequestSupplierContacts)
                        .values({ assessmentRequestSupplierId: participantId, contactId: contact.id })
                        .onConflictDoNothing();
                } else {
                    const [newParticipant] = await db.insert(assessmentRequestSuppliers).values({
                        assessmentRequestId: assessmentId,
                        supplierId,
                        contactId: contact.id,
                        status: 'pending',
                    }).returning();
                    participantId = newParticipant.id;
                }
            } else {
                // Create a temporary supplier record for this contact
                const [tempSupplier] = await db.insert(suppliers).values({
                    name: contact.name || trimmedEmail,
                    contactEmail: trimmedEmail,
                    status: 'active',
                    lifecycleStatus: 'prospect',
                }).returning();

                const [newParticipant] = await db.insert(assessmentRequestSuppliers).values({
                    assessmentRequestId: assessmentId,
                    supplierId: tempSupplier.id,
                    contactId: contact.id,
                    status: 'pending',
                }).returning();
                participantId = newParticipant.id;
            }

            // Create magic token and send email
            const emailResult = await enqueueAssessmentEmail(
                assessmentId,
                participantId,
                contact.id,
                'forward',
                {
                    forwarderName: session.user.name || session.user.email,
                    forwardLinkUrl: '', // Could add a direct link
                }
            );

            results.push({
                email: trimmedEmail,
                success: emailResult.success,
                participantId,
                contactId: contact.id,
                error: emailResult.error,
            });
        }

        return NextResponse.json({ success: true, results });
    } catch (error) {
        console.error('Failed to share assessment:', error);
        return NextResponse.json({ error: 'Failed to share assessment' }, { status: 500 });
    }
}