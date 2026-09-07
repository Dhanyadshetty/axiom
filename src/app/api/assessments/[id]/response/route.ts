import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { assessmentResponses, assessmentRequests, assessmentRequestSuppliers, contacts, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/app/actions/activity";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { supplierId, contactId, answers, status } = body;

    if (!supplierId || !contactId || !answers) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [assessmentRequest] = await db
      .select()
      .from(assessmentRequests)
      .where(eq(assessmentRequests.id, id))
      .limit(1);

    if (!assessmentRequest) {
      return NextResponse.json({ error: "Assessment request not found" }, { status: 404 });
    }

    const [participant] = await db
      .select()
      .from(assessmentRequestSuppliers)
      .where(
        and(
          eq(assessmentRequestSuppliers.assessmentRequestId, id),
          eq(assessmentRequestSuppliers.supplierId, supplierId)
        )
      )
      .limit(1);

    if (!participant) {
      return NextResponse.json({ error: "Supplier not found for this request" }, { status: 404 });
    }

    const [existingResponse] = await db
      .select()
      .from(assessmentResponses)
      .where(
        and(
          eq(assessmentResponses.assessmentRequestId, id),
          eq(assessmentResponses.supplierId, supplierId),
          eq(assessmentResponses.contactId, contactId),
          eq(assessmentResponses.documentRequestId, null)
        )
      )
      .orderBy(assessmentResponses.createdAt)
      .limit(1);

    const responseData = {
      assessmentRequestId: id,
      supplierId,
      contactId,
      documentRequestId: null,
      answers: JSON.stringify(answers),
      status,
      startedAt: existingResponse?.startedAt || new Date().toISOString(),
      submittedAt: status === "submitted" ? new Date().toISOString() : null,
      rejectedAt: status === "rejected" ? new Date().toISOString() : null,
      rejectionReason: status === "rejected" ? "Supplier rejected participation" : null,
    };

    if (existingResponse) {
      await db
        .update(assessmentResponses)
        .set(responseData)
        .where(eq(assessmentResponses.id, existingResponse.id));
    } else {
      await db.insert(assessmentResponses).values(responseData);
    }

    await logActivity(
      status === "submitted" ? "SUBMIT_RESPONSE" : status === "rejected" ? "REJECT_RESPONSE" : "SAVE_DRAFT",
      "assessment_response",
      id,
      `Response ${status} by supplier ${supplierId}`
    );

    revalidatePath(`/requests/assessments/${id}`);
    revalidatePath(`/external/assessments/${id}/requests/${participant.id}/form`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save response:", error);
    return NextResponse.json({ error: "Failed to save response" }, { status: 500 });
  }
}

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
    const searchParams = request.nextUrl.searchParams;
    const supplierId = searchParams.get("supplierId");
    const contactId = searchParams.get("contactId");

    if (!supplierId || !contactId) {
      return NextResponse.json({ error: "Missing supplierId or contactId" }, { status: 400 });
    }

    const [response] = await db
      .select()
      .from(assessmentResponses)
      .where(
        and(
          eq(assessmentResponses.assessmentRequestId, id),
          eq(assessmentResponses.supplierId, supplierId),
          eq(assessmentResponses.contactId, contactId),
          eq(assessmentResponses.documentRequestId, null)
        )
      )
      .orderBy(assessmentResponses.createdAt)
      .limit(1);

    if (!response) {
      return NextResponse.json({ answers: {}, status: "draft" });
    }

    return NextResponse.json({
      answers: response.answers ? JSON.parse(response.answers) : {},
      status: response.status,
      startedAt: response.startedAt,
      submittedAt: response.submittedAt,
      rejectedAt: response.rejectedAt,
      rejectionReason: response.rejectionReason,
    });
  } catch (error) {
    console.error("Failed to fetch response:", error);
    return NextResponse.json({ error: "Failed to fetch response" }, { status: 500 });
  }
}