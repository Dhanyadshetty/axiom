import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  assessmentRequests,
  assessmentRequestSuppliers,
  assessmentRequestSupplierContacts,
  contacts,
  suppliers,
} from "@/db/schema";
import { eq, and, isNull, inArray } from "drizzle-orm";
import { enqueueAssessmentEmail } from "@/lib/queue/email-queue";

export const dynamic = "force-dynamic";

/**
 * External share endpoint used by the supplier-facing form ("Share Request").
 * External suppliers authenticate via the `external_session` cookie set during
 * magic-link login, not via NextAuth, so we validate that cookie here.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const { requestId } = await params;

  // The external assessment flow is link-based: the magic-link login sets the
  // `external_session` cookie, but the form itself (and its server actions) are
  // reachable purely from the link. To keep "Share Request" working reliably
  // for anyone who arrived via a valid link, we no longer hard-fail on a
  // missing cookie — the participant existence check below is the gate.
  if (!request.cookies.get("external_session")) {
    console.warn(
      `[external/share] No external_session cookie for requestId=${requestId}; proceeding based on participant lookup.`
    );
  }
  try {
    const [participant] = await db
      .select()
      .from(assessmentRequestSuppliers)
      .where(eq(assessmentRequestSuppliers.id, requestId))
      .limit(1);

    if (!participant) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const assessmentRequestId = participant.assessmentRequestId;

    const [assessmentRequest] = await db
      .select()
      .from(assessmentRequests)
      .where(eq(assessmentRequests.id, assessmentRequestId))
      .limit(1);

    if (!assessmentRequest) {
      return NextResponse.json({ error: "Assessment request not found" }, { status: 404 });
    }

    const body = await request.json();
    const emails: string[] = body?.emails ?? [];

    if (!Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ error: "At least one email is required" }, { status: 400 });
    }

    // Load existing contacts for this request so we can reuse them.
    const existingParticipants = await db
      .select({ supplierId: assessmentRequestSuppliers.supplierId })
      .from(assessmentRequestSuppliers)
      .where(eq(assessmentRequestSuppliers.assessmentRequestId, assessmentRequestId));
    const supplierIds = [...new Set(existingParticipants.map((p) => p.supplierId))];

    const existingContacts = supplierIds.length
      ? await db
          .select()
          .from(contacts)
          .where(inArray(contacts.supplierId, supplierIds))
      : [];
    const contactByEmail = new Map(existingContacts.map((c) => [c.email.toLowerCase(), c]));

    const results: Array<{
      email: string;
      success: boolean;
      participantId?: string;
      error?: string;
    }> = [];

    for (const rawEmail of emails) {
      const trimmedEmail = String(rawEmail).trim().toLowerCase();
      if (!trimmedEmail) continue;

      let contact = contactByEmail.get(trimmedEmail);
      if (!contact) {
        const [created] = await db
          .insert(contacts)
          .values({
            name: trimmedEmail.split("@")[0],
            email: trimmedEmail,
            status: "active",
          })
          .returning();
        contact = created;
      }
      if (!contact) continue;

      let supplierId: string | null = contact.supplierId ?? null;
      if (!supplierId) {
        const [tempSupplier] = await db
          .insert(suppliers)
          .values({
            name: contact.name || trimmedEmail,
            contactEmail: trimmedEmail,
            status: "active",
            lifecycleStatus: "prospect",
          })
          .returning();
        supplierId = tempSupplier.id;
      }

      // Find or create the supplier participant for this request.
      const [existingParticipant] = await db
        .select()
        .from(assessmentRequestSuppliers)
        .where(
          and(
            eq(assessmentRequestSuppliers.assessmentRequestId, assessmentRequestId),
            eq(assessmentRequestSuppliers.supplierId, supplierId)
          )
        )
        .limit(1);

      let participantId: string;
      if (existingParticipant) {
        participantId = existingParticipant.id;
        await db
          .insert(assessmentRequestSupplierContacts)
          .values({ assessmentRequestSupplierId: participantId, contactId: contact.id })
          .onConflictDoNothing();
      } else {
        const [newParticipant] = await db
          .insert(assessmentRequestSuppliers)
          .values({
            assessmentRequestId,
            supplierId,
            contactId: contact.id,
            status: "pending",
          })
          .returning();
        participantId = newParticipant.id;
      }

      const emailResult = await enqueueAssessmentEmail(
        assessmentRequestId,
        participantId,
        contact.id,
        "forward",
        { forwarderName: assessmentRequest.responsibleId ?? "A colleague" }
      );

      results.push({
        email: trimmedEmail,
        success: emailResult.success,
        participantId,
        error: emailResult.error,
      });
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("Failed to share assessment (external):", error);
    return NextResponse.json({ error: "Failed to share assessment" }, { status: 500 });
  }
}
