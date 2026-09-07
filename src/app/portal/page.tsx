'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { getSupplierDashboardSnapshot } from "@/app/actions/portal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Bell,
    ChevronRight,
    ClipboardList,
    Clock,
    FileCheck,
    FileText,
    MessageSquare,
    ShoppingCart,
    Sparkles,
    TriangleAlert,
    ShieldAlert,
} from "lucide-react";
import { openOrDownloadFile } from "@/lib/client/download";
import { useLanguage } from "@/components/i18n/language-provider";
import { t } from "@/lib/i18n";

type SupplierDashboardSnapshot = NonNullable<Awaited<ReturnType<typeof getSupplierDashboardSnapshot>>>;

export default function SupplierDashboard() {
    const { data: session } = useSession();
    const { language } = useLanguage();
    const tc = t(language, "portal");
    const [snapshot, setSnapshot] = useState<SupplierDashboardSnapshot | null>(null);
    const [loading, setLoading] = useState(true);
    const [dateTime, setDateTime] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadData() {
            const data = await getSupplierDashboardSnapshot();
            if (!cancelled) {
                setSnapshot(data as SupplierDashboardSnapshot | null);
                setLoading(false);
            }
        }

        void loadData();

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        const locale = language === "de" ? "de-DE" : "en-US";
        const updateClock = () => {
            const now = new Date();
            setDateTime(
                now.toLocaleString(locale, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                }),
            );
        };

        updateClock();
        const interval = setInterval(updateClock, 1000);
        return () => clearInterval(interval);
    }, [language]);

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="font-medium text-muted-foreground">{tc.loadingWorkspace}</p>
                </div>
            </div>
        );
    }

    if (!snapshot) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="max-w-md space-y-2 text-center">
                    <h1 className="text-2xl font-bold tracking-tight">{tc.workspaceUnavailable}</h1>
                    <p className="text-muted-foreground">
                        {tc.unavailableBody}
                    </p>
                </div>
            </div>
        );
    }

    const counts = snapshot.counts;
    const notificationCount = counts.invitedRFQs + counts.openRequests;
    const healthStatus = snapshot?.healthStatus ?? 'healthy';
    const healthTone = healthStatus === 'attention'
        ? 'border-red-200 bg-red-50 text-red-800'
        : healthStatus === 'watch'
            ? 'border-amber-200 bg-amber-50 text-amber-800'
            : 'border-emerald-200 bg-emerald-50 text-emerald-800';
    const healthTitle = healthStatus === 'attention'
        ? tc.attentionRequired
        : healthStatus === 'watch'
            ? tc.monitorLive
            : tc.operatingClean;
    const healthDescription = healthStatus === 'attention'
        ? `${counts.overdueRequests} ${tc.overdueBlocking}`
        : healthStatus === 'watch'
            ? `${counts.openRequests} ${tc.openDueNext7}`
            : tc.noOverdue;
    return (
        <div className="flex min-h-full flex-col bg-background p-4 lg:p-8 space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="mb-1 text-lg text-muted-foreground">{tc.welcome}, <span className="font-bold text-foreground">{session?.user?.name || 'User'}</span></p>
                    <h1 className="text-3xl font-bold tracking-tight">{tc.supplierCommandCenter}</h1>
                    <p className="mt-1 text-muted-foreground">{tc.portalSubtitle}</p>
                </div>
                <div className="flex gap-2">
                    <span className="hidden items-center rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-xs text-muted-foreground lg:flex">{dateTime}</span>
                    <Button variant="outline" className="gap-2 relative" asChild>
                        <Link href="/portal/requests">
                            <Bell className="h-4 w-4" />
                            {tc.actionQueue}
                            {notificationCount > 0 ? (
                                <span className="absolute -top-2 -right-2 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                                    {notificationCount}
                                </span>
                            ) : null}
                        </Link>
                    </Button>
                </div>
            </div>

            {session?.user && !session.user.isTwoFactorEnabled && (
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 flex gap-3 items-start">
                    <ShieldAlert className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-2">
                        <p className="text-sm font-medium text-amber-900">{tc.secureAccount}</p>
                        <p className="text-xs text-amber-800">{tc.twoFactorBody}</p>
                        <Link href="/portal/security">
                            <Button size="sm" variant="outline" className="h-7 mt-1">{tc.learnMore}</Button>
                        </Link>
                    </div>
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-none bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider">{tc.newInvitations}</CardTitle>
                        <Sparkles className="h-4 w-4 opacity-80" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black">{counts.invitedRFQs}</div>
                        <p className="mt-2 text-xs opacity-80">{tc.liveRfqsWaiting}</p>
                        <Button variant="secondary" size="sm" className="mt-4 w-full font-bold border-none transition-colors" asChild>
                            <Link href="/portal/rfqs">
                                {tc.viewInvitations} <ChevronRight className="ml-1 h-3 w-3" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium uppercase text-muted-foreground">{tc.activeOrders}</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{counts.activeOrders}</div>
                        <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {counts.dueThisWeekOrders > 0
                                ? `${counts.dueThisWeekOrders} ${tc.ordersDueNext7}`
                                : tc.noDeliveries}
                        </p>
                        <Button variant="outline" size="sm" className="mt-4 w-full font-bold" asChild>
                            <Link href="/portal/orders">{tc.trackOrders}</Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium uppercase text-muted-foreground">{tc.actionQueue}</CardTitle>
                        <ClipboardList className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{counts.openRequests}</div>
                        <p className="mt-2 text-xs text-muted-foreground">
                            {counts.overdueRequests > 0
                                ? `${counts.overdueRequests} ${tc.overdueRequests}`
                                : counts.openRequests > 0
                                    ? tc.outstandingReady
                                    : tc.noOpenTasks}
                        </p>
                        <Button variant="outline" size="sm" className="mt-4 w-full font-bold" asChild>
                            <Link href="/portal/requests">{tc.openRequests}</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            {tc.activeSourcingRequests}
                        </CardTitle>
                        <CardDescription>{tc.recentRfqsDesc}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {snapshot.recentRfqs.length === 0 ? (
                                <div className="rounded-xl border-2 border-dashed py-12 text-center italic text-muted-foreground">
                                    {tc.noActiveInvites}
                                </div>
                            ) : (
                                snapshot.recentRfqs.map((rfq) => (
                                    <div key={rfq.id} className="group flex items-center justify-between rounded-xl border p-4 transition-colors hover:bg-muted/50">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-foreground transition-colors group-hover:text-primary">{rfq.title}</span>
                                            <span className="text-xs text-muted-foreground">{tc.received} {new Date(rfq.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge variant={rfq.status === 'invited' ? 'default' : 'secondary'} className="text-[10px] font-bold uppercase">
                                                {rfq.status}
                                            </Badge>
                                            <Link href={`/portal/rfqs/${rfq.id}`}>
                                                <Button size="sm" variant="ghost" className="h-8 w-8 border border-muted-foreground/20 p-0">
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className={`border shadow-sm ${healthTone}`}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <TriangleAlert className="h-5 w-5" />
                                {tc.workspaceStatus}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <p className="font-semibold">{healthTitle}</p>
                            <p>{healthDescription}</p>
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-muted/20 shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <MessageSquare className="h-5 w-5 text-primary" />
                                {tc.supportDesk}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                                {tc.supportBody}
                            </p>
                            <Button className="w-full font-bold shadow-md" asChild>
                                <Link href="/support">{tc.openSupportWorkspace}</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase text-muted-foreground">
                                <FileCheck className="h-4 w-4 text-primary" />
                                {tc.recentDocuments}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {snapshot.recentDocuments.length === 0 ? (
                                <>
                                    <p className="text-sm text-muted-foreground">{tc.noDocumentsVault}</p>
                                    <Button variant="outline" className="w-full font-bold" asChild>
                                        <Link href="/portal/documents">{tc.openDocumentVault}</Link>
                                    </Button>
                                </>
                            ) : (
                                <>
                                    {snapshot.recentDocuments.map((document) => (
                                        <button
                                            key={document.id}
                                            type="button"
                                            className="flex w-full items-center justify-between rounded-lg p-2 text-left transition-colors hover:bg-muted"
                                            onClick={() => {
                                                if (document.url) {
                                                    openOrDownloadFile(document.url, document.name);
                                                }
                                            }}
                                        >
                                            <div>
                                                <span className="text-sm font-medium">{document.name}</span>
                                                <p className="text-[11px] text-muted-foreground">
                                                    {String(document.type || 'other').replace(/_/g, ' ')} · {new Date(document.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                        </button>
                                    ))}
                                    <Button variant="outline" className="w-full font-bold" asChild>
                                        <Link href="/portal/documents">{tc.viewAllDocuments}</Link>
                                    </Button>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-bold uppercase text-muted-foreground">{tc.latestBuyerRequests}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {snapshot.recentRequests.length === 0 ? (
                                <p className="text-sm text-muted-foreground">{tc.noBuyerRequests}</p>
                            ) : (
                                snapshot.recentRequests.map((request) => (
                                    <div key={request.id} className="rounded-lg border p-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-semibold">{request.title}</p>
                                                <p className="text-[11px] text-muted-foreground">
                                                    {String(request.requestType || 'request').replace(/_/g, ' ')}
                                                </p>
                                            </div>
                                            <Badge variant="outline" className="text-[10px] uppercase">
                                                {String(request.status || 'unknown').replace(/_/g, ' ')}
                                            </Badge>
                                        </div>
                                        {request.dueDate ? (
                                            <p className="mt-2 text-[11px] text-muted-foreground">
                                                {tc.dueLabel} {new Date(request.dueDate).toLocaleDateString()}
                                            </p>
                                        ) : null}
                                    </div>
                                ))
                            )}
                            <Button variant="outline" className="w-full font-bold" asChild>
                                <Link href="/portal/requests">{tc.openRequestQueue}</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
