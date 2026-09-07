import { getExternalAssessmentForm } from "@/app/actions/external-assessments";
import { SubmissionSuccessClient } from "./SubmissionSuccessClient";

export const dynamic = "force-dynamic";

export default async function SubmissionSuccessPage({
    params,
    searchParams,
}: {
    params: Promise<{ assessmentId: string; requestId: string }>;
    searchParams: Promise<{ submittedAt?: string }>;
}) {
    const { assessmentId, requestId } = await params;
    const { submittedAt } = await searchParams;
    let data = null;
    try {
        data = await getExternalAssessmentForm(assessmentId, requestId);
    } catch (error) {
        console.error("Failed to load assessment form:", error);
    }

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-slate-600">
                <div className="text-center">
                    <h1 className="text-xl font-semibold text-slate-900 mb-2">Request not found</h1>
                    <p className="text-sm">This assessment link is invalid or has expired.</p>
                </div>
            </div>
        );
    }

    return <SubmissionSuccessClient initialData={data} submittedAt={submittedAt} />;
}