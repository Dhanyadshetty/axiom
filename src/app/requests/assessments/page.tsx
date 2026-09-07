import { auth } from "@/auth";
import { canManageRequests } from "@/lib/rbac";
import { getAssessmentRequests, getAssessmentTemplates } from "@/app/actions/assessments";
import { AssessmentsWorkspace } from "@/components/assessments/assessments-workspace";

export const dynamic = "force-dynamic";

export default async function AssessmentsPage({
    searchParams,
}: {
    searchParams: Promise<{ tab?: string; action?: string }>;
}) {
    const session = await auth();
    const params = await searchParams;
    const tab = params.tab === "my" ? "my" : "all";
    const initialRows = await getAssessmentRequests(tab);
    const templates = await getAssessmentTemplates();
    const canManage = canManageRequests(session?.user);

    return (
        <AssessmentsWorkspace
            initialRows={initialRows}
            templates={templates}
            canManage={canManage}
            defaultTab={tab}
            defaultCreateOpen={params.action === "new"}
        />
    );
}
