import { db } from "../src/db";
import {
  assessmentRequests,
  assessmentRequestSuppliers,
  assessmentRequestSupplierContacts,
  suppliers,
  contacts,
  assessmentTemplates,
  users,
} from "../src/db/schema";
import { eq } from "drizzle-orm";
import { createMagicToken } from "../src/lib/services/magic-tokens";
import { TEST_ASSESSMENT_CONSTANTS } from "../src/lib/constants/test-assessment";

async function main() {
  const [user] = await db.select().from(users).limit(1);
  if (!user) throw new Error("No user found in DB");

  const [template] = await db
    .select()
    .from(assessmentTemplates)
    .where(eq(assessmentTemplates.category, TEST_ASSESSMENT_CONSTANTS.TEMPLATE_CATEGORY))
    .limit(1);
  if (!template) throw new Error("PMA template not seeded. Run `npm run db:seed:assessment` first.");

  const supplierName = TEST_ASSESSMENT_CONSTANTS.SUPPLIER_NAME;
  let [supplier] = await db
    .select()
    .from(suppliers)
    .where(eq(suppliers.name, supplierName))
    .limit(1);
  if (!supplier) {
    [supplier] = await db
      .insert(suppliers)
      .values({
        name: supplierName,
        contactEmail: TEST_ASSESSMENT_CONSTANTS.SUPPLIER_EMAIL,
        status: TEST_ASSESSMENT_CONSTANTS.SUPPLIER_STATUS,
        lifecycleStatus: TEST_ASSESSMENT_CONSTANTS.SUPPLIER_LIFECYCLE_STATUS,
      })
      .returning();
  }

  const email = process.argv[2] || TEST_ASSESSMENT_CONSTANTS.DEFAULT_CONTACT_EMAIL;
  let [contact] = await db.select().from(contacts).where(eq(contacts.email, email)).limit(1);
  if (!contact) {
    [contact] = await db
      .insert(contacts)
      .values({ name: email.split("@")[0], email, status: TEST_ASSESSMENT_CONSTANTS.CONTACT_STATUS, supplierId: supplier.id })
      .returning();
  }

  const [request] = await db
    .insert(assessmentRequests)
    .values({
      title: TEST_ASSESSMENT_CONSTANTS.REQUEST_TITLE,
      responsibleId: user.id,
      createdById: user.id,
      templateId: template.id,
      status: TEST_ASSESSMENT_CONSTANTS.REQUEST_STATUS,
      messageBody: TEST_ASSESSMENT_CONSTANTS.REQUEST_MESSAGE_BODY,
    })
    .returning();

  const [participant] = await db
    .insert(assessmentRequestSuppliers)
    .values({
      assessmentRequestId: request.id,
      supplierId: supplier.id,
      contactId: contact.id,
      status: TEST_ASSESSMENT_CONSTANTS.PARTICIPANT_STATUS,
      sentAt: new Date(),
    })
    .returning();

  await db
    .insert(assessmentRequestSupplierContacts)
    .values({ assessmentRequestSupplierId: participant.id, contactId: contact.id })
    .onConflictDoNothing();

  const token = await createMagicToken(request.id, participant.id, contact.id, email, TEST_ASSESSMENT_CONSTANTS.MAGIC_TOKEN_PURPOSE);
  if (!token) throw new Error("Failed to create magic token");

  const baseUrl = process.env.APP_BASE_URL || TEST_ASSESSMENT_CONSTANTS.DEFAULT_BASE_URL;
  const redirect = TEST_ASSESSMENT_CONSTANTS.REDIRECT_PATH_TEMPLATE
    .replace("{requestId}", request.id)
    .replace("{participantId}", participant.id);
  const link = TEST_ASSESSMENT_CONSTANTS.LOGIN_PATH_TEMPLATE
    .replace("{token}", token.token)
    .replace("{redirect}", encodeURIComponent(redirect));

  console.log("ASSESSMENT_ID=" + request.id);
  console.log("REQUEST_ID=" + participant.id);
  console.log("MAGIC_LINK=" + link);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
