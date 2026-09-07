import { db } from '@/db';
import { emailSendLog, magicTokens, assessmentRequestSuppliers, assessmentRequestSupplierContacts, contacts, assessmentRequests, users, suppliers } from '@/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { sendEmail, EmailPayload } from '@/lib/services/email';
import { renderEmailTemplate } from '@/lib/services/email-templates';
import { buildMagicLinkUrl } from '@/lib/services/magic-tokens';
import { autoFillSupplierAnswersForExternal } from '@/app/actions/assessment-autofill';

const EMAIL_QUEUE_NAME = 'assessment-emails';

type EmailJobPayload = {
    logId: string;
    templateType: 'invitation' | 'forward' | 'reminder' | 'reIssue' | 'confirmation';
    assessmentRequestId: string;
    participantId: string;
    contactId: string;
    toEmail: string;
    toName: string;
    langCode: string;
    customData?: Record<string, unknown>;
};

type EmailJobResult = {
    success: boolean;
    messageId?: string;
    error?: string;
};

const globalForEmailQueue = globalThis as typeof globalThis & {
    __axiomEmailQueue?: import('bullmq').Queue<EmailJobPayload>;
    __axiomEmailQueueConnection?: import('ioredis').default;
};

function createRedisConnection(redisUrl: string): import('ioredis').default {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const IORedis = require('ioredis').default ?? require('ioredis');
    const connection = new IORedis(redisUrl, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
    });

    connection.on('error', (err: Error) => {
        console.error('[EmailQueue] Redis connection error:', err.message);
    });

    return connection;
}

async function getEmailQueue(): Promise<import('bullmq').Queue<EmailJobPayload> | null> {
    if (!process.env.REDIS_URL) return null;

    if (globalForEmailQueue.__axiomEmailQueue) {
        return globalForEmailQueue.__axiomEmailQueue;
    }

    const { Queue } = await import('bullmq');
    const connection = createRedisConnection(process.env.REDIS_URL);
    globalForEmailQueue.__axiomEmailQueueConnection = connection;

    const queue = new Queue<EmailJobPayload>(EMAIL_QUEUE_NAME, {
        connection,
        defaultJobOptions: {
            attempts: 3,
            removeOnComplete: 1000,
            removeOnFail: 1000,
            backoff: { type: 'exponential', delay: 10000 },
        },
    });

    globalForEmailQueue.__axiomEmailQueue = queue;
    return queue;
}

/**
 * Enqueue an assessment email for sending
 */
export async function enqueueAssessmentEmail(
    assessmentRequestId: string,
    participantId: string,
    contactId: string,
    templateType: 'invitation' | 'forward' | 'reminder' | 'reIssue' | 'confirmation',
    customData?: Record<string, unknown>
): Promise<{ success: boolean; logId?: string; error?: string }> {
    try {
        // Fetch all required data
        const [participant, contact, assessmentRequest, buyerUser, supplier] = await Promise.all([
            db.select().from(assessmentRequestSuppliers).where(eq(assessmentRequestSuppliers.id, participantId)).limit(1),
            db.select().from(contacts).where(eq(contacts.id, contactId)).limit(1),
            db.select().from(assessmentRequests).where(eq(assessmentRequests.id, assessmentRequestId)).limit(1),
            // Get buyer/responsible user
            db.select().from(users).where(eq(users.id, (await db.select({ responsibleId: assessmentRequests.responsibleId }).from(assessmentRequests).where(eq(assessmentRequests.id, assessmentRequestId)).limit(1))[0]?.responsibleId)).limit(1),
            db.select().from(suppliers).where(eq(suppliers.id, (await db.select({ supplierId: assessmentRequestSuppliers.supplierId }).from(assessmentRequestSuppliers).where(eq(assessmentRequestSuppliers.id, participantId)).limit(1))[0]?.supplierId)).limit(1),
        ]);

        if (!participant[0] || !contact[0] || !assessmentRequest[0]) {
            return { success: false, error: 'Required records not found' };
        }

        const p = participant[0];
        const c = contact[0];
        const ar = assessmentRequest[0];
        const buyer = buyerUser[0];
        const sup = supplier[0];

        // Ensure the recipient's draft form is prefilled with the supplier's
        // latest Properties + the chosen contact's details BEFORE the email is
        // queued/sent. This runs from the central send entry point so every
        // form-sending path — publish, resend, buyer share, both external
        // share routes, and post-submit confirmation — picks up the same
        // fresh prefill. Failures are logged but never block email delivery.
        try {
            const linked = await db
                .select({ contactId: assessmentRequestSupplierContacts.contactId })
                .from(assessmentRequestSupplierContacts)
                .where(eq(assessmentRequestSupplierContacts.assessmentRequestSupplierId, p.id));
            const targetContactIds = Array.from(
                new Set(
                    linked.length > 0
                        ? linked.map((l) => l.contactId)
                        : p.contactId
                        ? [p.contactId]
                        : [c.id]
                )
            );
            for (const cid of targetContactIds) {
                try {
                    await autoFillSupplierAnswersForExternal(
                        assessmentRequestId,
                        p.id,
                        cid
                    );
                } catch (innerErr) {
                    console.error(
                        '[EmailQueue] autoFillSupplierAnswersForExternal failed for contact',
                        cid,
                        innerErr
                    );
                }
            }
        } catch (prefillErr) {
            console.error('[EmailQueue] prefill sweep failed:', prefillErr);
        }

        // Get or create magic token
        const tokenRecord = await db.select().from(magicTokens)
            .where(and(
                eq(magicTokens.participantId, participantId),
                eq(magicTokens.contactId, contactId),
                isNull(magicTokens.revokedAt),
                isNull(magicTokens.usedAt)
            ))
            .orderBy(magicTokens.createdAt)
            .limit(1);

        let magicToken: string;
        let expiresAt: Date;

        if (tokenRecord[0]) {
            magicToken = tokenRecord[0].token;
            expiresAt = tokenRecord[0].expiresAt;
        } else {
            // Create new token
            const newToken = await import('@/lib/services/magic-tokens').then(m => m.createMagicToken(
                assessmentRequestId,
                participantId,
                contactId,
                c.email,
                templateType === 'forward' ? 'forward' : 'invitation'
            ));
            if (!newToken) {
                return { success: false, error: 'Failed to create magic token' };
            }
            magicToken = newToken.token;
            expiresAt = newToken.expiresAt;
        }

        // Build magic link
        const magicLinkUrl = buildMagicLinkUrl(magicToken, assessmentRequestId, participantId);

        // Determine buyer company name
        const buyerCompanyName = buyer?.name || 'Axiom Buyer';

        // Create email send log entry
        const [logEntry] = await db.insert(emailSendLog).values({
            assessmentRequestId,
            participantId,
            contactId,
            email: c.email,
            templateType,
            status: 'queued',
            attempts: 0,
        }).returning({ id: emailSendLog.id });

        if (!logEntry) {
            return { success: false, error: 'Failed to create email log' };
        }

        // Enqueue the job
        if (process.env.REDIS_URL) {
            const queue = await getEmailQueue();
            if (queue) {
                await queue.add('send-assessment-email', {
                    logId: logEntry.id,
                    templateType,
                    assessmentRequestId,
                    participantId,
                    contactId,
                    toEmail: c.email,
                    toName: c.name || c.email,
                    langCode: c.language || 'en',
                    customData,
                }, {
                    jobId: `email:${logEntry.id}`,
                });
                return { success: true, logId: logEntry.id };
            }
        }

        // Fallback: send synchronously if no Redis
        const jobResult = await processEmailJob({
            logId: logEntry.id,
            templateType,
            assessmentRequestId,
            participantId,
            contactId,
            toEmail: c.email,
            toName: c.name || c.email,
            langCode: c.language || 'en',
            customData,
        });

        return { success: jobResult.success, logId: logEntry.id, error: jobResult.error };
    } catch (error) {
        console.error('Failed to enqueue assessment email:', error);
        return { success: false, error: 'Failed to enqueue email' };
    }
}

/**
 * Process an email job (called by worker or fallback)
 */
export async function processEmailJob(payload: EmailJobPayload): Promise<EmailJobResult> {
    const { logId, templateType, assessmentRequestId, participantId, contactId, toEmail, toName, langCode, customData } = payload;

    try {
        // Update log: increment attempts, set status to sending
        await db.update(emailSendLog)
            .set({ 
                status: 'sending', 
                attempts: (await db.select({ attempts: emailSendLog.attempts }).from(emailSendLog).where(eq(emailSendLog.id, logId)).limit(1))[0]?.attempts + 1 || 1,
                sentAt: new Date(),
            })
            .where(eq(emailSendLog.id, logId));

        // Fetch data for template
        const [participant, contact, assessmentRequest, buyerUser, supplier] = await Promise.all([
            db.select().from(assessmentRequestSuppliers).where(eq(assessmentRequestSuppliers.id, participantId)).limit(1),
            db.select().from(contacts).where(eq(contacts.id, contactId)).limit(1),
            db.select().from(assessmentRequests).where(eq(assessmentRequests.id, assessmentRequestId)).limit(1),
            db.select().from(users).where(eq(users.id, (await db.select({ responsibleId: assessmentRequests.responsibleId }).from(assessmentRequests).where(eq(assessmentRequests.id, assessmentRequestId)).limit(1))[0]?.responsibleId)).limit(1),
            db.select().from(suppliers).where(eq(suppliers.id, (await db.select({ supplierId: assessmentRequestSuppliers.supplierId }).from(assessmentRequestSuppliers).where(eq(assessmentRequestSuppliers.id, participantId)).limit(1))[0]?.supplierId)).limit(1),
        ]);

        if (!participant[0] || !contact[0] || !assessmentRequest[0]) {
            throw new Error('Required records not found');
        }

        const p = participant[0];
        const c = contact[0];
        const ar = assessmentRequest[0];
        const buyer = buyerUser[0];
        const sup = supplier[0];

        // Get magic token
        const [tokenRecord] = await db.select().from(magicTokens)
            .where(and(
                eq(magicTokens.participantId, participantId),
                eq(magicTokens.contactId, contactId),
                isNull(magicTokens.revokedAt),
                isNull(magicTokens.usedAt)
            ))
            .orderBy(magicTokens.createdAt)
            .limit(1);

        if (!tokenRecord) {
            throw new Error('No valid magic token found');
        }

        const magicLinkUrl = buildMagicLinkUrl(tokenRecord.token, assessmentRequestId, participantId);

        // For the invitation email, the "Forward request" button must open the
        // in-app share dialog (not the same fill-out link). Build a magic link
        // that logs the recipient in and lands them on the share page.
        const forwardLinkUrl = templateType === 'invitation'
            ? buildMagicLinkUrl(
                tokenRecord.token,
                assessmentRequestId,
                participantId,
                `/external/assessments/${assessmentRequestId}/requests/${participantId}/share`
            )
            : (customData?.forwardLinkUrl as string || '');

        // Prepare template data
        const templateData = {
            requestId: assessmentRequestId,
            requestTitle: ar.title,
            buyerCompanyName: buyer?.name || 'Axiom Buyer',
            supplierCompanyName: sup?.name || 'Supplier',
            submissionDeadline: ar.dueDate ? new Date(ar.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not specified',
            responsibleName: c.name || 'Valued Partner',
            responsibleEmail: c.email,
            magicLinkUrl,
            forwardLinkUrl,
            supportEmail: 'pma.axiom.support@gmail.com',
            langCode,
            year: new Date().getFullYear(),
            expiryDate: tokenRecord.expiresAt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            forwarderName: customData?.forwarderName as string || '',
            submittedAt: customData?.submittedAt as string || new Date().toLocaleDateString('en-GB'),
        };

        // Render template
        const rendered = renderEmailTemplate(templateType, templateData);

        // Send email (HTML preferred; text kept as multipart fallback)
        const emailPayload: EmailPayload = {
            to: toEmail,
            subject: rendered.subject,
            body: rendered.text,
            html: rendered.html,
        };

        const result = await sendEmail(emailPayload);

        if (result.success) {
            await db.update(emailSendLog)
                .set({ 
                    status: 'sent', 
                    providerMessageId: result.messageId,
                    sentAt: new Date(),
                })
                .where(eq(emailSendLog.id, logId));
        } else {
            await db.update(emailSendLog)
                .set({ 
                    status: 'failed', 
                    errorMessage: result.error,
                })
                .where(eq(emailSendLog.id, logId));
        }

        return { success: result.success, messageId: result.messageId, error: result.error };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('[EmailQueue] Job failed:', errorMessage);

        await db.update(emailSendLog)
            .set({ 
                status: 'failed', 
                errorMessage,
            })
            .where(eq(emailSendLog.id, logId));

        return { success: false, error: errorMessage };
    }
}

/**
 * Start the email worker
 */
export async function startEmailWorker(): Promise<import('bullmq').Worker<EmailJobPayload> | null> {
    if (!process.env.REDIS_URL) {
        console.warn('[EmailQueue] REDIS_URL not configured. Worker not started.');
        return null;
    }

    const { Worker } = await import('bullmq');
    const connection = createRedisConnection(process.env.REDIS_URL);

    const worker = new Worker<EmailJobPayload>(
        EMAIL_QUEUE_NAME,
        async (job) => {
            await processEmailJob(job.data);
        },
        {
            connection,
            concurrency: 10,
            stalledInterval: 30_000,
        }
    );

    worker.on('completed', (job) => {
        console.log(`[EmailQueue] Job completed: ${job.id}`);
    });

    worker.on('failed', (job, error) => {
        console.error(`[EmailQueue] Job failed: ${job?.id}`, error.message);
    });

    worker.on('error', (error) => {
        console.error('[EmailQueue] Worker error:', error.message);
    });

    return worker;
}

/**
 * Handle email webhook events (bounce, complaint, delivery)
 */
export async function handleEmailWebhook(
    eventType: 'bounce' | 'complaint' | 'delivery',
    providerMessageId: string,
    email: string,
    details?: Record<string, unknown>
): Promise<void> {
    try {
        // Find the email log by provider message ID
        const [logEntry] = await db.select().from(emailSendLog)
            .where(eq(emailSendLog.providerMessageId, providerMessageId))
            .limit(1);

        if (!logEntry) {
            console.warn(`[EmailWebhook] No log entry found for provider message ID: ${providerMessageId}`);
            return;
        }

        const statusMap: Record<string, string> = {
            bounce: 'bounced',
            complaint: 'complained',
            delivery: 'delivered',
        };

        const updateData: Record<string, unknown> = {
            status: statusMap[eventType],
        };

        if (eventType === 'bounce') {
            updateData.bouncedAt = new Date();
        } else if (eventType === 'complaint') {
            updateData.complainedAt = new Date();
        } else if (eventType === 'delivery') {
            updateData.deliveredAt = new Date();
        }

        await db.update(emailSendLog)
            .set(updateData)
            .where(eq(emailSendLog.id, logEntry.id));

        // If bounced or complained, update participant status indicator
        if (eventType === 'bounce' || eventType === 'complaint') {
            if (logEntry.participantId) {
                await db.update(assessmentRequestSuppliers)
                    .set({ status: 'email_failed' })
                    .where(eq(assessmentRequestSuppliers.id, logEntry.participantId));
            }
        }

        console.log(`[EmailWebhook] Updated log ${logEntry.id} to ${statusMap[eventType]}`);
    } catch (error) {
        console.error('[EmailWebhook] Failed to process webhook:', error);
    }
}