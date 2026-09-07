import { db } from "@/db";
import {
  assessmentRequests,
  assessmentRequestSuppliers,
  assessmentRequestSupplierContacts,
  contacts,
  suppliers,
} from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { ShareRequestClient } from "./ShareRequestClient";

export const dynamic = "force-dynamic";

type ContactRow = { id: string; name: string | null; email: string };

export default async function ShareRequestPage({
  params,
}: {
  params: Promise<{ assessmentId: string; requestId: string }>;
}) {
  const { assessmentId, requestId } = await params;

  const [request] = await db
    .select({ title: assessmentRequests.title })
    .from(assessmentRequests)
    .where(eq(assessmentRequests.id, assessmentId))
    .limit(1);

  const participants = await db
    .select()
    .from(assessmentRequestSuppliers)
    .where(eq(assessmentRequestSuppliers.assessmentRequestId, assessmentId));

  const arsIds = participants.map((p) => p.id);
  const supplierIds = [...new Set(participants.map((p) => p.supplierId))];

  const linkRows = arsIds.length
    ? await db
        .select()
        .from(assessmentRequestSupplierContacts)
        .where(inArray(assessmentRequestSupplierContacts.assessmentRequestSupplierId, arsIds))
    : [];
  const linkedContactIds = linkRows.map((l) => l.contactId);
  const primaryContactIds = participants.map((p) => p.contactId).filter(Boolean) as string[];
  const allContactIds = [...new Set([...linkedContactIds, ...primaryContactIds])];

  const existingContacts: ContactRow[] = allContactIds.length
    ? await db
        .select({ id: contacts.id, name: contacts.name, email: contacts.email })
        .from(contacts)
        .where(inArray(contacts.id, allContactIds))
    : [];

  const orgContacts: ContactRow[] = supplierIds.length
    ? await db
        .select({ id: contacts.id, name: contacts.name, email: contacts.email })
        .from(contacts)
        .where(inArray(contacts.supplierId, supplierIds))
    : [];

  const [supplier] = supplierIds.length
    ? await db
        .select({ name: suppliers.name })
        .from(suppliers)
        .where(eq(suppliers.id, supplierIds[0]))
        .limit(1)
    : [null];

  return (
    <ShareRequestClient
      assessmentId={assessmentId}
      requestId={requestId}
      organization={supplier?.name ?? "Your organization"}
      subject={request?.title ?? "Supplier Self Assessment"}
      existingAccess={existingContacts}
      orgContacts={orgContacts}
    />
  );
}
