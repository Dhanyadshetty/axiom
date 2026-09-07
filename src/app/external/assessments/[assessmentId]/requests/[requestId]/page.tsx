import { Suspense } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getExternalAssessmentResponse } from "@/app/actions/external-assessments";
import { ExternalAssessmentLandingClient } from "./ExternalAssessmentLandingClient";

export const dynamic = "force-dynamic";

export default async function ExternalAssessmentLandingPage({
  params,
}: {
  params: Promise<{ assessmentId: string; requestId: string }>;
}) {
  const { assessmentId, requestId } = await params;

  const response = await getExternalAssessmentResponse(assessmentId, requestId);

  if (!response) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-slate-900">Assessment not found</h1>
          <p className="mt-2 text-slate-500">This assessment response could not be found or has expired.</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={null}>
      <ExternalAssessmentLandingClient initialResponse={response} />
    </Suspense>
  );
}