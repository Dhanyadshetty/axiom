import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  assessmentRequestSuppliers,
  contacts,
  suppliers,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; supplierId: string }> }
) {
  const { id, supplierId } = await params;
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find the assessment request supplier (participant) for this supplier
    const [participant] = await db
      .select({
        id: assessmentRequestSuppliers.id,
        supplierId: assessmentRequestSuppliers.supplierId,
        contactId: assessmentRequestSuppliers.contactId,
      })
      .from(assessmentRequestSuppliers)
      .where(
        and(
          eq(assessmentRequestSuppliers.assessmentRequestId, id),
          eq(assessmentRequestSuppliers.supplierId, supplierId)
        )
      )
      .limit(1);

    if (!participant) {
      return NextResponse.json({ error: "Supplier not found in this assessment" }, { status: 404 });
    }

    // Get all contacts for this supplier
    const supplierContacts = await db
      .select({
        id: contacts.id,
        name: contacts.name,
        email: contacts.email,
      })
      .from(contacts)
      .where(eq(contacts.supplierId, supplierId))
      .orderBy(contacts.name);

    // Also include the primary contact if it's not in the contacts list
    const primaryContactId = participant.contactId;
    let primaryContact = null;
    if (primaryContactId) {
      const [pc] = await db
        .select({
          id: contacts.id,
          name: contacts.name,
          email: contacts.email,
        })
        .from(contacts)
        .where(eq(contacts.id, primaryContactId))
        .limit(1);
      primaryContact = pc;
    }

    // Combine and deduplicate
    const allContacts = [...supplierContacts];
    if (primaryContact && !allContacts.some((c) => c.id === primaryContact.id)) {
      allContacts.unshift(primaryContact);
    }

    return NextResponse.json({
      success: true,
      contacts: allContacts.map((c) => ({
        contactId: c.id,
        contactName: c.name,
        contactEmail: c.email,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch supplier contacts:", error);
    return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 });
  }
}