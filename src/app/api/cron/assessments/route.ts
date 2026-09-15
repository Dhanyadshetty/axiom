import { NextResponse } from 'next/server';
import { eq, inArray } from 'drizzle-orm';
import { db } from '@/db';
import { assessmentRequestSuppliers, assessmentRequests, contacts, suppliers } from '@/db/schema';
import { isCronAuthorized } from '@/lib/api-security';
import { withPgAdvisoryLock } from '@/lib/db-locks';
import { enqueueAssessmentEmail } from '@/lib/queue/email-queue';
import { getAssessmentReminderDates } from '@/lib/reminder-schedule';

export async function GET(req: Request) {
    try {
        if (!isCronAuthorized(req)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const locked = await withPgAdvisoryLock('cron:assessment-reminders', async () => {
            const now = new Date();
            const participants = await db
                .select({
                    id: assessmentRequestSuppliers.id,
                    assessmentRequestId: assessmentRequestSuppliers.assessmentRequestId,
                    supplierId: assessmentRequestSuppliers.supplierId,
                    contactId: assessmentRequestSuppliers.contactId,
                    status: assessmentRequestSuppliers.status,
                    sentAt: assessmentRequestSuppliers.sentAt,
                    dueDate: assessmentRequests.dueDate,
                    requestTitle: assessmentRequests.title,
                    supplierName: suppliers.name,
                    contactEmail: contacts.email,
                    contactName: contacts.name,
                })
                .from(assessmentRequestSuppliers)
                .leftJoin(assessmentRequests, eq(assessmentRequestSuppliers.assessmentRequestId, assessmentRequests.id))
                .leftJoin(suppliers, eq(assessmentRequestSuppliers.supplierId, suppliers.id))
                .leftJoin(contacts, eq(assessmentRequestSuppliers.contactId, contacts.id))
                .where(inArray(assessmentRequestSuppliers.status, ['sent', 'in_progress']));

            let sent = 0;
            const dueCutoff = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 14);

            for (const participant of participants) {
                if (!participant.contactId || !participant.contactEmail) {
                    continue;
                }

                const dueDate = participant.dueDate ? new Date(participant.dueDate) : null;
                const sentAt = participant.sentAt ?? new Date();
                const scheduling = getAssessmentReminderDates({
                    sentAt,
                    lastReminderSentAt: sentAt,
                    dueDate: dueDate ?? new Date(now.getTime() + 1000 * 60 * 60 * 24 * 14),
                });

                const reminderDue = dueDate
                    ? scheduling.nextReminder <= dueDate && scheduling.nextReminder <= now
                    : scheduling.nextReminder <= now;

                if (!reminderDue || (dueDate && dueDate < now && dueDate < scheduling.nextReminder)) {
                    continue;
                }

                if (dueDate && dueDate.getTime() < now.getTime()) {
                    continue;
                }

                if (dueDate && dueDate.getTime() > dueCutoff.getTime()) {
                    continue;
                }

                const result = await enqueueAssessmentEmail(
                    participant.assessmentRequestId,
                    participant.id,
                    participant.contactId,
                    'reminder',
                    {
                        reminderDate: now.toISOString(),
                        requestTitle: participant.requestTitle ?? 'Assessment request',
                    }
                );

                if (result.success) {
                    await db.update(assessmentRequestSuppliers)
                        .set({
                            status: 'sent',
                            sentAt: participant.sentAt ?? new Date(),
                            lastReminderSentAt: new Date(),
                            updatedAt: new Date(),
                        })
                        .where(eq(assessmentRequestSuppliers.id, participant.id));
                    sent += 1;
                }
            }

            return NextResponse.json({
                success: true,
                remindersSent: sent,
                checkedAt: now.toISOString(),
            });
        });

        if (!locked.acquired) {
            return NextResponse.json({ success: true, skipped: true, reason: 'already_running' }, { status: 202 });
        }

        return locked.value;
    } catch (error) {
        console.error('[Assessment Reminder Cron] failed:', error);
        return NextResponse.json({ error: 'Failed to process assessment reminders' }, { status: 500 });
    }
}
