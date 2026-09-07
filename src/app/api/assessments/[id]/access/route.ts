import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  assessmentRequestSuppliers,
  assessmentRequestSupplierContacts,
  contacts,
  suppliers,
} from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all participants for this assessment
    const participants = await db
      .select({
        id: assessmentRequestSuppliers.id,
        supplierId: assessmentRequestSuppliers.supplierId,
        contactId: assessmentRequestSuppliers.contactId,
        supplierName: suppliers.name,
      })
      .from(assessmentRequestSuppliers)
      .leftJoin(suppliers, eq(assessmentRequestSuppliers.supplierId, suppliers.id))
      .where(eq(assessmentRequestSuppliers.assessmentRequestId, id));

    // Get all contacts linked to these participants
    const participantIds = participants.map((p) => p.id);
    let contactLinks: Array<{ arsId: string; contactId: string; contactName: string | null; contactEmail: string }> = [];
    if (participantIds.length > 0) {
      contactLinks = await db
        .select({
          arsId: assessmentRequestSupplierContacts.assessmentRequestSupplierId,
          contactId: contacts.id,
          contactName: contacts.name,
          contactEmail: contacts.email,
        })
        .from(assessmentRequestSupplierContacts)
        .leftJoin(contacts, eq(assessmentRequestSupplierContacts.contactId, contacts.id))
        .where(inArray(assessmentRequestSupplierContacts.assessmentRequestSupplierId, participantIds));
    }

    // Build the access list
    const accessMap = new Map<string, { id: string; name: string | null; email: string }>();
    
    for (const p of participants) {
      if (p.contactId) {
        const contactLink = contactLinks.find((cl) => cl.arsId === p.id && cl.contactId === p.contactId);
        if (contactLink) {
          accessMap.set(contactLink.contactEmail.toLowerCase(), {
            id: contactLink.contactId,
            name: contactLink.contactName,
            email: contactLink.contactEmail,
          });
        }
      }
      // Also add any additional contacts from the contact links
      for (const cl of contactLinks) {
        if (cl.arsId === p.id) {
          accessMap.set(cl.contactEmail.toLowerCase(), {
            id: cl.contactId,
            name: cl.contactName,
            email: cl.contactEmail,
          });
        }
      }
    }

    return NextResponse.json({ success: true, access: Array.from(accessMap.values()) });
  } catch (error) {
    console.error("Failed to fetch assessment access:", error);
    return NextResponse.json({ error: "Failed to fetch access list" }, { status: 500 });
  }
}