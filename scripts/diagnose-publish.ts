import { db, pool } from '../src/db';
import * as schema from '../src/db/schema';
import { eq, desc } from 'drizzle-orm';
import { sendEmail } from '../src/lib/services/email';

async function main() {
  console.log('--- Checking DB tables ---');
  const reqs = await db.select().from(schema.assessmentRequests).where(eq(schema.assessmentRequests.id, '0f1bf084-6136-4b0f-9fb9-8cbdf6ccfa0f'));
  console.log('Assessment request count:', reqs.length);
  if (reqs.length > 0) {
    console.log('Assessment request:', JSON.stringify(reqs[0], null, 2));
  }

  const reqSuppliers = await db.select().from(schema.assessmentRequestSuppliers).where(eq(schema.assessmentRequestSuppliers.assessmentRequestId, '0f1bf084-6136-4b0f-9fb9-8cbdf6ccfa0f'));
  console.log('Suppliers count:', reqSuppliers.length);
  for (const s of reqSuppliers) {
    console.log('Supplier participant:', s);
    const sContacts = await db.select().from(schema.assessmentRequestSupplierContacts).where(eq(schema.assessmentRequestSupplierContacts.assessmentRequestSupplierId, s.id));
    console.log('Supplier contacts count:', sContacts.length, sContacts);
  }

  const allLogs = await db.select().from(schema.emailSendLog).orderBy(desc(schema.emailSendLog.createdAt)).limit(10);
  console.log('Recent email send logs:', JSON.stringify(allLogs, null, 2));

  console.log('--- Testing SMTP sendEmail directly ---');
  const result = await sendEmail({
    to: 'sandeep.p@prettl.com',
    subject: 'Test Axiom diagnostic email',
    body: 'This is a test to verify SMTP configuration.',
  });
  console.log('sendEmail test result:', result);

  await pool.end();
}

main().catch(err => {
  console.error('Fatal diagnostic error:', err);
  process.exit(1);
});
