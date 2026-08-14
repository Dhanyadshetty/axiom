import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getPortalRequests } from "@/app/actions/supplier-intelligence";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";
import { t, getActiveLanguage } from "@/lib/i18n";

const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    sent: 'bg-blue-100 text-blue-800',
    acknowledged: 'bg-indigo-100 text-indigo-800',
    in_progress: 'bg-purple-100 text-purple-800',
    submitted: 'bg-green-100 text-green-800',
    verified: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-red-100 text-red-800',
    overdue: 'bg-amber-100 text-amber-800',
};

export default async function PortalRequestsPage() {
    const session = await auth();
    if (!session?.user || session.user.role !== 'supplier') {
        redirect('/');
    }

    const language = await getActiveLanguage();
    const tc = t(language, "portal");

    let requests: any[] = [];
    try {
        requests = await getPortalRequests();
    } catch {
        // Tables may not exist yet
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <ClipboardList className="h-6 w-6 text-primary" />
                    {tc.requestsTasksTitle}
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                    {tc.requestsTasksSubtitle}
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">{tc.yourRequests}</CardTitle>
                </CardHeader>
                <CardContent>
                    {requests.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">{tc.noRequestsAtThisTime}</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {requests.map((req) => {
                                const isOverdue = req.dueDate && new Date(req.dueDate) < new Date() && !['submitted', 'verified'].includes(req.status);
                                return (
                                    <div key={req.id} className={`py-3 ${isOverdue ? 'bg-red-50/50 dark:bg-red-950/10 -mx-4 px-4 rounded' : ''}`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-sm">{req.title}</span>
                                            <Badge variant="outline" className={`text-[10px] ${statusColors[req.status] || ''}`}>
                                                {req.status?.replace(/_/g, ' ')}
                                            </Badge>
                                            <Badge variant="outline" className="text-[10px]">
                                                {req.requestType?.replace(/_/g, ' ')}
                                            </Badge>
                                        </div>
                                        {req.description && (
                                            <p className="text-xs text-muted-foreground">{req.description}</p>
                                        )}
                                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                            {req.dueDate && (
                                                <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                                                    Due: {new Date(req.dueDate).toLocaleDateString()}
                                                </span>
                                            )}
                                            {req.respondedAt && (
                                                <span className="text-green-600">
                                                    Responded: {new Date(req.respondedAt).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
