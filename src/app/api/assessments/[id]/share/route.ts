import { NextRequest, NextResponse } from "next/server";
import { shareAssessmentRequest } from "@/app/actions/assessments";
import { auth } from "@/auth";

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
    const emails: string[] = body?.emails ?? [];

    if (!Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ error: "At least one email is required" }, { status: 400 });
    }

    const result = await shareAssessmentRequest(id, emails, session.user.name ?? "A colleague");

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, results: result.results });
  } catch (error) {
    console.error("Failed to share assessment:", error);
    return NextResponse.json({ error: "Failed to share assessment" }, { status: 500 });
  }
}