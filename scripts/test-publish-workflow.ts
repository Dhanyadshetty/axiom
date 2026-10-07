import { db, pool } from '../src/db';
import * as schema from '../src/db/schema';
import { eq, desc } from 'drizzle-orm';
import { enqueueAssessmentEmail } from '../src/lib/queue/email-queue';

async function runTest() {
  console.log('=== Testing Assessment Email Queue & Send ===');
  
  const assessmentId = '0f1bf084-6136-4b0f-9fb9-8cbdf6ccfa0f';
  const [participant] = await db.select().from(schema.assessmentRequestSuppliers)
    .where(eq(schema.assessmentRequestSuppliers.assessmentRequestId, assessmentId))
    .limit(1);

  if (!participant) {
    console.log('No participant found for assessment', assessmentId);
    await pool.end();
    return;
  }

  const sContacts = await db.select().from(schema.assessmentRequestSupplierContacts)
    .where(eq(schema.assessmentRequestSupplierContacts.assessmentRequestSupplierId, participant.id));
  
  console.log(`Found ${sContacts.length} contact links for participant ${participant.id}`);

  for (const link of sContacts) {
    console.log(`\n--- Sending invitation to contact: ${link.contactId} ---`);
    const result = await enqueueAssessmentEmail(assessmentId, participant.id, link.contactId, 'invitation');
    console.log('enqueueAssessmentEmail result:', result);
  }

  const logs = await db.select().from(schema.emailSendLog).orderBy(desc(schema.emailSendLog.createdAt)).limit(5);
  console.log('\n=== Recent Email Send Logs ===');
  for (const log of logs) {
    console.log(`[${log.createdAt?.toISOString()}] to=${log.email} template=${log.templateType} status=${log.status} error=${log.errorMessage} msgId=${log.providerMessageId}`);
  }

  await pool.end();
}

runTest().catch((err) => {
  console.error('Error during test:', err);
  process.exit(1);
});
