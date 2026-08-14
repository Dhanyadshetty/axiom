import { Button } from "@/components/ui/button";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, ArrowUpRight, Boxes, CreditCard, Database, Landmark, ShieldAlert, ShieldCheck, Sparkles, TrendingUp, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LazyDataExplorer } from "@/components/dashboard/dashboard-intelligence-lazy";
import { RecentProcurements } from "@/components/dashboard/recent-procurements";
import { getDashboardStats, getRecentOrders, getMonthlySpend, getCategorySpend, getHighRiskSuppliers, getSupplierAnalytics, getCountrySpendBreakdown } from "@/app/actions/dashboard";
import { getOperationalSignals } from "@/app/actions/operational-readiness";
import { getSuppliers } from "@/app/actions/suppliers";
import { getParts } from "@/app/actions/parts";
import { getDepartmentLeads } from "@/app/actions/users";
import { CreateOrderDialog } from "@/components/sourcing/create-order-dialog";

import Link from "next/link";
import { auth } from "@/auth";
import type { Session } from "next-auth";
import { CommunicationHub } from "@/components/dashboard/communication-hub";
import { OperationalFreshnessStrip } from "@/components/dashboard/operational-freshness-strip";
import { AutoRefresh } from "@/components/shared/auto-refresh";
import { RequisitionDialog } from "@/app/sourcing/requisitions/requisition-dialog";
import { canAccessAIFleet, canAccessRiskIntelligence, canAccessScenarioModeling, canManageSourcing, canManageSuppliers } from "@/lib/rbac";
import { ProcurementCommandBoard } from "@/components/dashboard/procurement-command-board";
import { getAllTasks } from "@/app/actions/workflow-tasks";
import { getAllTickets } from "@/app/actions/support";
import { RouteLoadingSkeleton } from "@/components/shared/route-loading-skeleton";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { getActiveLanguage, t } from "@/lib/i18n";

export const dynamic = 'force-dynamic'

type SessionUser = {
  id?: string;
  role?: string | null;
};

export default async function Home() {
  const session = await auth();
  return (
    <Suspense fallback={<RouteLoadingSkeleton cards={4} rows={7} />}>
      <DashboardContent session={session} />
    </Suspense>
  );
}

async function DashboardContent({
  session,
}: {
  session: Session | null;
}) {
  const language = await getActiveLanguage();
  const td = t(language, "dashboard");
  const currentUser = session?.user as SessionUser | undefined;
  const userRole = currentUser?.role;
  const isAdmin = userRole === 'admin';
  const canLaunchOrders = canManageSourcing(currentUser);
  const canOpenRiskRoutes = canAccessRiskIntelligence(currentUser);
  const canOpenScenarioRoutes = canAccessScenarioModeling(currentUser);
  const canOpenAIFleet = canAccessAIFleet(currentUser);
  const canEditSuppliers = canManageSuppliers(currentUser);

  const [
    stats,
    recentOrders,
    monthlySpend,
    categorySpend,
    riskySuppliers,
    supplierAnalytics,
    countrySpend,
    suppliers,
    parts,
    departmentLeads,
    operationalSignals,
    openTasks,
    supportTickets,
  ] = await Promise.all([
    getDashboardStats(),
    getRecentOrders(),
    getMonthlySpend(),
    getCategorySpend(),
    getHighRiskSuppliers(),
    getSupplierAnalytics(),
    getCountrySpendBreakdown(),
    getSuppliers(),
    getParts(),
    getDepartmentLeads(),
    getOperationalSignals(),
    isAdmin ? getAllTasks({ status: 'open', limit: 200 }) : Promise.resolve([]),
    isAdmin ? getAllTickets() : Promise.resolve([]),
  ]);

  const leads = departmentLeads.filter((lead) => lead.id !== currentUser?.id);
  const activeOrderCount = Number(stats.pendingCount || 0);
  const moderateRiskSuppliers = supplierAnalytics
    .filter((supplier) => Number(supplier.riskScore || 0) >= 40 && Number(supplier.riskScore || 0) < 60)
    .sort((left, right) => Number(right.riskScore || 0) - Number(left.riskScore || 0))
    .slice(0, 3);
  const topRiskSupplier = riskySuppliers[0] ?? null;
  const warehouseSubtitle = Number(stats.totalInventory) > 0
    ? `On-hand units across ${stats.stockedSkuCount} stocked SKUs`
    : activeOrderCount > 0
      ? `No on-hand stock yet. ${activeOrderCount} active orders are still upstream of receiving.`
      : stats.partCount > 0
        ? `On-hand units across ${stats.stockedSkuCount} stocked SKUs`
        : "Parts catalog has not been populated yet.";
  const dashboardTitle = isAdmin ? td.adminCommandCenter : td.operationsWorkspace;
  const sessionBadge = isAdmin ? td.adminSession : td.internalSession;
  const dashboardSubtitle = isAdmin
    ? td.platformIntelligence
    : td.operationalWorkspace;
  const renderedAt = new Date().toISOString();

  const roleBadgeClass = isAdmin
    ? "bg-amber-50 text-amber-700 border-amber-200"
    : "bg-blue-50 text-blue-700 border-blue-200";
  const quickActions = isAdmin ? [
    {
      key: "support" as const,
      href: "/admin/support",
      title: td.openHelpdesk,
      subtitle: td.supportQueueEscalations,
      countLabel: `${supportTickets.filter((ticket) => ticket.status !== 'closed').length} active`,
    },
    {
      key: "suppliers" as const,
      href: "/suppliers",
      title: td.allSuppliers,
      subtitle: td.classificationOnboardingCompliance,
      countLabel: `${stats.supplierCount} tracked`,
    },
    {
      key: "findings" as const,
      href: "/admin/risk",
      title: td.openFindings,
      subtitle: td.riskWatchlist,
      countLabel: `${riskySuppliers.length} critical`,
    },
    {
      key: "tasks" as const,
      href: "/admin/tasks",
      title: td.allTasks,
      subtitle: td.workflowInbox,
      countLabel: `${openTasks.length} open`,
    },
  ] : [];

  return (
    <div className="p-4 lg:p-10 space-y-8 bg-background min-h-full">
      <div className="flex items-center justify-between">
        <DashboardHeader 
          userName={session?.user?.name || "User"}
          dashboardTitle={dashboardTitle}
          dashboardSubtitle={dashboardSubtitle}
          sessionBadge={sessionBadge}
          roleBadgeClass={roleBadgeClass}
        />
        <div className="flex items-center space-x-3 self-end mb-6">
          <AutoRefresh />
          {isAdmin
            ? canLaunchOrders
              ? <CreateOrderDialog suppliers={suppliers} parts={parts} />
              : null
            : <RequisitionDialog />}
        </div>
      </div>

      {isAdmin && operationalSignals && (
        <OperationalFreshnessStrip
          renderedAt={renderedAt}
          telemetryTitle={operationalSignals.telemetry.title}
          telemetryDetail={operationalSignals.telemetry.detail}
          fxTitle={operationalSignals.fxRates.title}
          fxDetail={operationalSignals.fxRates.detail}
        />
      )}

      {isAdmin ? (
        <ProcurementCommandBoard
          quickActions={quickActions}
          monthlyData={monthlySpend}
          categoryData={categorySpend}
          countryData={countrySpend}
        />
      ) : null}

      {!isAdmin ? (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card border-l-4 border-l-emerald-600 shadow-lg hover:shadow-emerald-500/20 transition-all h-full accent-shimmer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-tight">{td.purchaseRequests}</CardTitle>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
              <CreditCard className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground tracking-tighter">{td.purchaseRequests}</div>
            <div className="flex items-center gap-1 mt-2">
              <Badge variant="outline" className="text-[10px] font-bold bg-muted/30 text-muted-foreground border-border px-1.5 py-0">
                {td.internalWorkflow}
              </Badge>
              <span className="text-[10px] text-muted-foreground font-medium uppercase">{td.submitForApproval}</span>
            </div>
            <div className="flex gap-2 mt-3 pt-3 border-t border-border">
              <Link href="/sourcing/requisitions" className="flex-1">
                  <Button size="sm" variant="outline" className="w-full h-7 text-[10px] font-bold uppercase">
                  {td.viewRequisitions}
                </Button>
              </Link>
              <RequisitionDialog />
            </div>
          </CardContent>
        </Card>

        {/* Active Suppliers */}
        <Card className="glass-card border-l-4 border-l-emerald-500 shadow-lg hover:shadow-emerald-500/20 transition-all h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-tight">{td.verifiedNetwork}</CardTitle>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
              <Users className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground tracking-tighter">{stats.supplierCount}</div>
            <p className="text-[10px] text-muted-foreground mt-2 font-medium uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
               {td.activeGlobalSuppliers}
             </p>
            <div className="flex gap-2 mt-3 pt-3 border-t border-border">
              <Link href="/suppliers" className="flex-1">
                 <Button size="sm" variant="outline" className="w-full h-7 text-[10px] font-bold uppercase">
                  {td.viewSuppliers}
                </Button>
              </Link>
              {canEditSuppliers && (
                <Link href="/suppliers?action=new">
                  <Button size="sm" className="h-7 text-[10px] font-bold uppercase bg-emerald-500 hover:bg-emerald-600 text-white">
                    {td.add}
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending Orders */}
        <Card className="glass-card border-l-4 border-l-sky-500 shadow-lg hover:shadow-sky-500/20 transition-all h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-tight">{td.activeFunnel}</CardTitle>
            <div className="p-2 bg-sky-50 dark:bg-sky-950/30 rounded-lg">
              <CreditCard className="h-4 w-4 text-sky-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground tracking-tighter">{stats.pendingCount}</div>
            <p className="text-[10px] text-muted-foreground mt-2 font-medium uppercase font-mono">{stats.fulfilledCount} {td.fulfilled} · {stats.pendingCount} {td.active}</p>
            <div className="flex gap-2 mt-3 pt-3 border-t border-border">
              <Link href="/sourcing/orders" className="flex-1">
                <Button size="sm" variant="outline" className="w-full h-7 text-[10px] font-bold uppercase">
                  {td.viewOrders}
                </Button>
              </Link>
              <Link href="/sourcing/orders">
                <Button size="sm" className="h-7 text-[10px] font-bold uppercase bg-sky-500 hover:bg-sky-600 text-white">
                  {td.track}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Live Inventory */}
        <Card className="glass-card border-l-4 border-l-amber-500 shadow-lg hover:shadow-amber-500/20 transition-all h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-tight">{td.warehouseLoad}</CardTitle>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
              <Boxes className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground tracking-tighter">{Number(stats.totalInventory).toLocaleString('en-IN')}</div>
            <p className="text-[10px] text-muted-foreground mt-2 font-medium uppercase">{warehouseSubtitle}</p>
            <div className="flex gap-2 mt-3 pt-3 border-t border-border">
              <Link href="/sourcing/parts" className="flex-1">
                 <Button size="sm" variant="outline" className="w-full h-7 text-[10px] font-bold uppercase">
                  {td.inventoryLabel}
                </Button>
              </Link>
              <Link href="/sourcing/parts?filter=critical">
                 <Button size="sm" className="h-7 text-[10px] font-bold uppercase bg-amber-500 hover:bg-amber-600 text-white">
                  {td.reorder}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      ) : null}

      {isAdmin && canOpenRiskRoutes && topRiskSupplier && (
        <Card className="overflow-hidden border-red-200 bg-[radial-gradient(circle_at_top_left,rgba(248,113,113,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.16),transparent_36%),linear-gradient(135deg,#fff7f7_0%,#ffffff_52%,#fff1f2_100%)] shadow-xl">
          <CardContent className="p-6 lg:p-8">
            <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr] lg:items-center">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">
                    <ShieldAlert className="mr-1 h-3.5 w-3.5" />
                     {td.criticalOpsWatch}
                    </Badge>
                   <Badge variant="outline" className="border-white/80 bg-white/90 text-slate-700">
                     {riskySuppliers.length} {riskySuppliers.length === 1 ? td.supplierAlert : td.supplierAlerts}
                   </Badge>
                 </div>
                 <div>
                   <h2 className="text-3xl font-black tracking-tight text-slate-950">{td.impactNeedsAttention}</h2>
                   <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-700">
                     {topRiskSupplier.name} {td.riskRouteCopy} {topRiskSupplier.riskScore}.
                   </p>
                 </div>
               </div>

                 <div className="grid gap-3">
                   <Link href="/admin/risk">
                      <Button className="w-full justify-between rounded-2xl bg-slate-900 px-5 py-6 text-left text-sm font-bold text-white hover:bg-slate-800">
                      {td.openRiskIntelligence}
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                 </Link>
                 <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                   <Link href="/sourcing/exceptions">
                     <Button variant="outline" className="w-full justify-between rounded-2xl px-4 py-5 text-left font-semibold">
                       {td.exceptionQueue}
                       <ShieldAlert className="h-4 w-4" />
                     </Button>
                   </Link>
                   {canOpenScenarioRoutes ? (
                     <Link href="/admin/scenarios">
                       <Button variant="outline" className="w-full justify-between rounded-2xl px-4 py-5 text-left font-semibold">
                         {td.scenarioLab}
                         <TrendingUp className="h-4 w-4" />
                       </Button>
                     </Link>
                   ) : null}
                   {canOpenAIFleet ? (
                     <Link href="/admin/agents">
                       <Button variant="outline" className="w-full justify-between rounded-2xl px-4 py-5 text-left font-semibold">
                         {td.aiFleet}
                         <Sparkles className="h-4 w-4" />
                       </Button>
                     </Link>
                   ) : null}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isAdmin && (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-black uppercase tracking-[0.16em] text-slate-900">{td.globalOperatingControls}</CardTitle>
            <CardDescription>
              {td.controlsIntro}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div className="flex min-h-[220px] flex-col rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Landmark className="h-4 w-4 text-emerald-600" />
                {td.multiCurrencySpend}
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {td.multiCurrencyCopy}
              </p>
              <p className="mt-3 text-sm font-semibold text-slate-900">
                {operationalSignals?.fxRates.title || td.financeSettingsReview}
              </p>
              <div className="mt-auto border-t border-slate-200 pt-3">
                <Link href="/admin/settings" className="inline-flex items-center text-sm font-semibold text-slate-900 hover:text-primary">
                  {td.openFinanceConsole}
                  <ArrowUpRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="flex min-h-[220px] flex-col rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                {td.regionalCompliance}
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {td.regionalComplianceCopy}
              </p>
              <p className="mt-3 text-sm font-semibold text-slate-900">
                {stats.supplierCount} {td.supplierRecordsCompliance}
              </p>
              <div className="mt-auto border-t border-slate-200 pt-3">
                <Link href="/admin/compliance" className="inline-flex items-center text-sm font-semibold text-slate-900 hover:text-primary">
                  {td.openComplianceRoutes}
                  <ArrowUpRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="flex min-h-[220px] flex-col rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <CreditCard className="h-4 w-4 text-sky-600" />
                {td.deterministicMatching}
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {td.deterministicMatchingCopy}
              </p>
              <p className="mt-3 text-sm font-semibold text-slate-900">
                {operationalSignals?.exceptions.financeHolds || 0} {td.financeHoldsReview}
              </p>
              <div className="mt-auto border-t border-slate-200 pt-3">
                <Link href="/admin/financial-matching" className="inline-flex items-center text-sm font-semibold text-slate-900 hover:text-primary">
                  {td.openMatchingQueue}
                  <ArrowUpRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="flex min-h-[220px] flex-col rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Database className="h-4 w-4 text-amber-600" />
                {td.guardedImports}
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {td.guardedImportsCopy}
              </p>
              <p className="mt-3 text-sm font-semibold text-slate-900">
                {td.useDryRun}
              </p>
              <div className="mt-auto border-t border-slate-200 pt-3">
                <Link href="/admin/import" className="inline-flex items-center text-sm font-semibold text-slate-900 hover:text-primary">
                  {td.openControlledImport}
                  <ArrowUpRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="flex min-h-[220px] flex-col rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <ShieldAlert className="h-4 w-4 text-red-600" />
                {td.operationalTruth}
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-900">
                {operationalSignals?.telemetry.title || td.telemetryPending}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {operationalSignals?.telemetry.detail || td.telemetryNotAvailable}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {operationalSignals?.fxRates.detail || td.fxNotAvailable}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {operationalSignals?.aiAssist.detail || td.aiNotAvailable}
              </p>
              <div className="mt-auto border-t border-slate-200 pt-3">
                <Link href="/sourcing/exceptions" className="inline-flex items-center text-sm font-semibold text-slate-900 hover:text-primary">
                  {operationalSignals?.exceptions.title || td.openExceptionRoute}
                  <ArrowUpRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isAdmin && canOpenAIFleet && (
        <Card className="overflow-hidden border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_32%),linear-gradient(135deg,#ffffff_0%,#f8fafc_52%,#ecfeff_100%)] shadow-xl">
          <CardContent className="p-6 lg:p-8">
            <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-center">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                     <Sparkles className="mr-1 h-3.5 w-3.5" />
                     {td.aiFleet}
                    </Badge>
                   <Badge variant="outline" className="border-slate-200 bg-white/80 text-slate-600">
                     {td.aiFleet}
                   </Badge>
                 </div>
                 <div>
                   <h2 className="text-3xl font-black tracking-tight text-slate-950">{td.aiExecutionLive}</h2>
                   <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                     {td.aiExecutionCopy}
                   </p>
                 </div>
               </div>

               <div className="grid gap-3">
                 <Link href="/admin/agents">
                   <Button className="w-full justify-between rounded-2xl bg-slate-950 px-5 py-6 text-left text-sm font-bold hover:bg-black">
                     {td.openAIFleet}
                     <ArrowUpRight className="h-4 w-4" />
                   </Button>
                 </Link>
                 <div className="grid gap-3 sm:grid-cols-2">
                   <Link href="/admin/fraud-alerts">
                     <Button variant="outline" className="w-full justify-between rounded-2xl px-4 py-5 text-left font-semibold">
                       {td.riskConsole}
                       <ShieldCheck className="h-4 w-4" />
                     </Button>
                   </Link>
                   <Link href="/admin/scenarios">
                     <Button variant="outline" className="w-full justify-between rounded-2xl px-4 py-5 text-left font-semibold">
                       {td.scenarioLab}
                       <TrendingUp className="h-4 w-4" />
                     </Button>
                   </Link>
                 </div>
               </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 space-y-6">
          {isAdmin ? (
            <LazyDataExplorer monthlyData={monthlySpend} categoryData={categorySpend} supplierData={supplierAnalytics} />
          ) : (
            <Card className="shadow-lg border-accent/50 overflow-hidden">
              <CardHeader className="border-b bg-muted/20">
                 <CardTitle className="text-lg">{td.operationalWorkspaceTitle}</CardTitle>
                <CardDescription>{td.operationalWorkspaceCopy}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link href="/sourcing/requisitions" className="flex-1">
                    <Button variant="outline" className="w-full">{td.openRequisitions}</Button>
                  </Link>
                  <Link href="/support" className="flex-1">
                    <Button className="w-full">{td.helpSupport}</Button>
                  </Link>
                </div>
                <p className="text-sm text-muted-foreground">
                  {td.enterpriseSpendLimited}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
        <div className="col-span-3 space-y-6">
          {isAdmin ? <CommunicationHub leads={leads} /> : null}
          {isAdmin ? <Card className="shadow-lg border-accent/50 overflow-hidden">
            <CardHeader className="border-b bg-muted/20">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Activity className="h-5 w-5 text-primary" />
                  {td.recentProcurement}
                </CardTitle>
                <CardDescription>
                  {td.recentProcurementCopy}
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <RecentProcurements orders={recentOrders} />
            </CardContent>
          </Card> : null}

          {isAdmin && (
            <Card className="shadow-lg border-destructive/20 overflow-hidden">
              <CardHeader className="border-b bg-destructive/10 border-destructive/20">
                  <CardTitle className="flex items-center gap-2 text-lg text-destructive font-black uppercase tracking-widest">
                    <ShieldAlert className="h-5 w-5 animate-pulse" />
                    {td.riskIntelligence}
                  </CardTitle>
                  <CardDescription className="text-destructive/70 font-medium">
                    {td.highPriorityInterventions}
                  </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {riskySuppliers.length > 0 ? riskySuppliers.map((s) => (
                    <Link key={s.id} href={`/suppliers/${s.id}`} className="block group">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-destructive/10 group-hover:border-destructive/30 group-hover:shadow-md transition-all">
                        <div>
                          <p className="font-bold text-foreground group-hover:text-destructive transition-colors">{s.name}</p>
                           <p className="text-[10px] font-mono text-muted-foreground uppercase">{td.interventionNeeded}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="destructive" className="font-black text-[12px] px-2 py-0.5">
                            {s.riskScore}
                          </Badge>
                           <p className="text-[8px] text-muted-foreground font-black uppercase tracking-tighter mt-1">{td.criticality}</p>
                        </div>
                      </div>
                    </Link>
                  )) : moderateRiskSuppliers.length > 0 ? moderateRiskSuppliers.map((supplier) => (
                    <Link key={supplier.name} href="/suppliers" className="block group">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-200/60 group-hover:border-amber-400 group-hover:shadow-md transition-all">
                        <div>
                          <p className="font-bold text-foreground group-hover:text-amber-700 transition-colors">{supplier.name}</p>
                           <p className="text-[10px] font-mono text-muted-foreground uppercase">{td.warningRange}</p>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-amber-500 text-white hover:bg-amber-500 font-black text-[12px] px-2 py-0.5">
                            {supplier.riskScore}
                          </Badge>
                           <p className="text-[8px] text-muted-foreground font-black uppercase tracking-tighter mt-1">{td.monitorClosely}</p>
                        </div>
                      </div>
                    </Link>
                  )) : (
                     <p className="text-sm text-muted-foreground text-center py-4">{td.allSafe}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
