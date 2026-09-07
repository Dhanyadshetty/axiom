import { redirect } from "next/navigation";
import { getExternalAssessmentForm } from "@/app/actions/external-assessments";
import { ExternalAssessmentFormClient } from "./ExternalAssessmentFormClient";

export const dynamic = "force-dynamic";

export default async function ExternalAssessmentFormPage({
    params,
    searchParams,
}: {
    params: Promise<{ assessmentId: string; requestId: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const { assessmentId, requestId } = await params;
    const sp = await searchParams;

    // If the magic token is present on the form URL itself (i.e. a direct
    // link like /external/assessments/.../form?magictoken=...), hand the
    // token off to a Route Handler that validates the token, sets the
    // external_session cookie, and redirects back to the cleaned URL.
    //
    // Server Components cannot mutate cookies (Next.js throws
    // "Cookies can only be modified in a Server Action or Route Handler"),
    // so the cookie work has to happen in /api/external/magic-bootstrap.
    // That handler is now hardened to always return a 302 redirect — even
    // on unexpected errors — so the surrounding Server Components render
    // can no longer surface a 500 from the bootstrap hop.
    const token = typeof sp.magictoken === "string" ? sp.magictoken : null;
    if (token) {
        const cleaned = new URLSearchParams();
        for (const [k, v] of Object.entries(sp)) {
            if (k === "magictoken") continue;
            if (typeof v === "string") cleaned.set(k, v);
        }
        const qs = cleaned.toString();
        const target = `/external/assessments/${assessmentId}/requests/${requestId}/form${qs ? `?${qs}` : ""}`;
        redirect(`/api/external/magic-bootstrap?magictoken=${encodeURIComponent(token)}&redirect=${encodeURIComponent(target)}`);
    }

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

    return <ExternalAssessmentFormClient initialData={data} />;
}