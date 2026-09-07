import { Suspense } from "react";
import { auth } from "@/auth";
import { canManageRequests } from "@/lib/rbac";
import { getAssessmentRequestById, getUsersForPicker } from "@/app/actions/assessments";
import { AssessmentDetailClient } from "@/components/assessments/assessment-detail";
import type { View } from "@/components/assessments/assessment-detail";

export const dynamic = "force-dynamic";

export default async function AssessmentDetailPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ step?: string; tab?: string; view?: string }>;
}) {
    const session = await auth();
    if (!canManageRequests(session?.user)) {
        return (
            <div className="p-10">
                <h1 className="text-xl font-bold">Access denied</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    You do not have permission to view assessment requests.
                </p>
            </div>
        );
    }
    const { id } = await params;
    const sp = await searchParams;
    const detail = await getAssessmentRequestById(id);
    if (!detail) {
        return (
            <div className="p-10">
                <h1 className="text-xl font-bold">Request not found</h1>
                <p className="text-sm text-muted-foreground mt-2">
                    This assessment request does not exist or you do not have access.
                </p>
            </div>
        );
    }
    const rawUsers = await getUsersForPicker();
    const userOptions = rawUsers.map((u) => ({ ...u, image: null as string | null }));
    const canManage = canManageRequests(session?.user);
    
    // Default view logic: Published -> overview, Draft -> form
    const hasExplicitView = sp.view === "overview" || sp.view === "responses" || sp.view === "form" || sp.view === "share";
    const hasExplicitTab = sp.tab === "overview" || sp.tab === "responses" || sp.tab === "form" || sp.tab === "share";
    const explicitView = hasExplicitView ? sp.view : (hasExplicitTab ? sp.tab : null);
    
    const initialView = (explicitView ?? (detail.status === "published" ? "overview" : "form")) as View;
    const initialStep = sp.step === "form" || sp.step === "participants" ? sp.step : "general";

    return (
        <Suspense fallback={<div className="p-10 text-sm text-muted-foreground">Loading assessment request…</div>}>
            <AssessmentDetailClient
                detail={detail}
                userOptions={userOptions}
                canManage={canManage}
                initialStep={initialStep}
                initialView={initialView}
                currentUserId={session!.user.id!}
            />
        </Suspense>
    );
}