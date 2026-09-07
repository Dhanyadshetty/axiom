"use client";

import Link from "next/link";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    UserCog,
    ShieldAlert,
    BarChart3,
    FileText,
    Settings,
    History,
    BookOpen,
    CreditCard,
    Truck,
    ArrowRightLeft,
    PiggyBank,
    ContactRound,
    LifeBuoy,
    FileUp,
    Inbox,
    ShieldCheck,
    ClipboardList,
    Warehouse,
    ReceiptText,
    Scale,
    Globe,
    Layers,
    Building2,
    Leaf,
    LogOut,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { AxiomLogo } from "@/components/shared/axiom-logo";
import { NavLink } from "@/components/layout/nav-link";
import { AGENT_REGISTRY } from "@/app/actions/agents/registry";
import { canAccessAIFleet, canAccessAdminPath } from "@/lib/rbac";
import { useLanguage } from "@/components/i18n/language-provider";
import { t } from "@/lib/i18n";

type SessionUser = {
    role?: string | null;
    accessProfile?: string | null;
    department?: string | null;
    countryScope?: string | null;
    regionScope?: string | null;
};

const adminPriorityLinks = [
    { labelKey: "fraudAlerts", icon: ShieldAlert, href: "/admin/fraud-alerts" },
    { labelKey: "telemetry", icon: History, href: "/admin/telemetry" },
    { labelKey: "financialMatching", icon: CreditCard, href: "/admin/financial-matching" },
    { labelKey: "spendIntelligence", icon: BarChart3, href: "/admin/analytics" },
    { labelKey: "riskIntelligence", icon: ShieldAlert, href: "/admin/risk" },
];

const adminOperationalLinks = [
    { labelKey: "taskInbox", icon: Inbox, href: "/admin/tasks" },
    { labelKey: "compliance", icon: ShieldCheck, href: "/admin/compliance" },
    { labelKey: "userManagement", icon: UserCog, href: "/admin/users" },
    { labelKey: "supportTickets", icon: LifeBuoy, href: "/admin/support" },
    { labelKey: "auditTrail", icon: History, href: "/admin/audit" },
    { labelKey: "importData", icon: FileUp, href: "/admin/import" },
    { labelKey: "adminSettings", icon: Settings, href: "/admin/settings" },
    { labelKey: "scenarioModeling", icon: BarChart3, href: "/admin/scenarios" },
    { labelKey: "supplierEcosystem", icon: Globe, href: "/admin/ecosystem" },
];

const supplierLinks = [
    { labelKey: "myPortal", icon: LayoutDashboard, href: "/portal" },
    { labelKey: "incomingBids", icon: FileText, href: "/portal/rfqs" },
    { labelKey: "activeOrders", icon: ShoppingCart, href: "/portal/orders" },
    { labelKey: "myDocuments", icon: FileText, href: "/portal/documents" },
    { labelKey: "requestsTasks", icon: ClipboardList, href: "/portal/requests" },
];

const navCls = "flex items-center rounded-md px-3 py-1 text-[13px] font-medium text-sidebar-foreground/92 transition-colors hover:bg-accent hover:text-accent-foreground";
const sectionLabelCls = "text-[10.5px] font-black uppercase tracking-[0.16em] text-sidebar-foreground/78";
const sectionDividerCls = "h-px flex-1 bg-sidebar-foreground/18";

export function Sidebar({ className }: { className?: string }) {
    const { data: session, status } = useSession();
    const { language } = useLanguage();
    const ts = t(language, "sidebar");

    if (status === "loading") {
        return (
            <div
                className={cn(
                    "flex h-[100dvh] min-h-[100dvh] w-[17rem] min-w-[17rem] flex-col overflow-hidden border-r border-sidebar-border/80 bg-sidebar text-sidebar-foreground xl:w-[18rem] xl:min-w-[18rem]",
                    className,
                )}
            >
                <div className="show-scrollbar min-h-0 flex-1 overflow-y-auto pb-6">
                    <div className="mb-1 flex items-center gap-3 border-b border-sidebar-border/70 px-4 py-4">
                        <div className="h-8 w-8 shrink-0 rounded-lg bg-primary shadow-md shadow-primary/30 flex items-center justify-center">
                            <div className="h-5 w-5 animate-pulse rounded bg-primary-foreground/20" />
                        </div>
                        <div className="flex flex-col leading-none">
                            <div className="h-4 w-24 animate-pulse rounded bg-sidebar-foreground/10" />
                            <div className="h-2 w-16 animate-pulse rounded bg-sidebar-foreground/10 mt-1" />
                        </div>
                    </div>
                    <div className="mx-3 mt-4 space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="h-8 animate-pulse rounded-md bg-sidebar-foreground/10" />
                        ))}
                    </div>
                    <div className="mt-4 px-3 space-y-3">
                        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                            <div key={i} className="h-8 animate-pulse rounded-md bg-sidebar-foreground/10" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const user = session?.user as SessionUser | undefined;
    const role = user?.role;
    const visiblePriorityLinks = role === "admin" ? adminPriorityLinks.filter((link) => canAccessAdminPath(user, link.href)) : [];
    const visibleOperationalLinks = role === "admin" ? adminOperationalLinks.filter((link) => canAccessAdminPath(user, link.href)) : [];
    const workspaceLabel = role === "admin" ? ts.adminConsole : role === "supplier" ? ts.supplierPortal : ts.internalWorkspace;
    const workspaceDescription = role === "admin"
        ? ts.adminDescription
        : role === "supplier"
            ? ts.supplierDescription
            : ts.internalDescription;
    const workspaceBadgeClass = role === "admin"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : role === "supplier"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-blue-200 bg-blue-50 text-blue-700";
    const homeLabel = role === "admin" ? ts.adminConsole : role === "supplier" ? ts.supplierPortal : ts.workspace;
    const enabledAgentCount = AGENT_REGISTRY.filter((agent) => agent.isEnabled).length;

    return (
        <div
            className={cn(
                "flex h-[100dvh] min-h-[100dvh] w-[17rem] min-w-[17rem] flex-col overflow-hidden border-r border-sidebar-border/80 bg-sidebar text-sidebar-foreground xl:w-[18rem] xl:min-w-[18rem]",
                className,
            )}
        >
            <div className="show-scrollbar min-h-0 flex-1 overflow-y-auto pb-6">
                <div className="mb-1 flex items-center gap-3 border-b border-sidebar-border/70 px-4 py-4">
                    <div className="h-8 w-8 shrink-0 rounded-lg bg-primary shadow-md shadow-primary/30 flex items-center justify-center">
                        <AxiomLogo className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div className="flex flex-col leading-none">
                        <span className="text-[16px] font-black tracking-tight text-sidebar-foreground">Axiom</span>
                        <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-sidebar-foreground/60">Procurement OS</span>
                    </div>
                </div>

                <div className="mx-3 rounded-2xl border border-sidebar-foreground/12 bg-white/70 px-3 py-3 text-slate-900">
                    <span className={cn("inline-flex rounded-full border px-2 py-1 text-[9px] font-black uppercase tracking-[0.14em]", workspaceBadgeClass)}>
                        {workspaceLabel}
                    </span>
                    <p className="mt-2 text-[12px] font-semibold text-slate-900">{workspaceDescription}</p>
                </div>

                <div className="mt-2 space-y-0.5 px-3">
                    <NavLink href={role === "supplier" ? "/portal" : "/"} className={navCls}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        {homeLabel}
                    </NavLink>
                    {role !== "supplier" && (
                        <NavLink
                            href="/suppliers"
                            className={navCls}
                            onClick={() => {
                                if (typeof window !== "undefined") {
                                    window.dispatchEvent(new CustomEvent("suppliers:reset-to-default-view"));
                                }
                            }}
                        >
                            <Building2 className="mr-2 h-4 w-4" />
                            {ts.suppliers}
                        </NavLink>
                    )}
                </div>

                <div className="mt-2 space-y-1 px-3">
                    {role !== "supplier" && (
                        <NavLink href="/copilot" className={cn(navCls, "border border-primary/25 bg-primary/12 text-emerald-100 font-semibold hover:bg-primary/18")}>
                            <AxiomLogo className="mr-2 h-4 w-4 text-primary" />
                            {ts.copilot}
                        </NavLink>
                    )}
                    {role === "admin" && canAccessAIFleet(user) && (
                        <Link href="/admin/agents">
                            <span className="flex items-center rounded-md border border-emerald-400/25 bg-emerald-500/14 px-3 py-1.5 text-[13px] font-semibold text-emerald-100 transition-all hover:bg-emerald-500/20">
                                <Layers className="mr-2 h-4 w-4 text-emerald-200" />
                                {ts.agents}
                                <span className="ml-auto rounded-full bg-emerald-300/18 px-1.5 py-0.5 text-[9px] font-black text-emerald-100">{enabledAgentCount}</span>
                            </span>
                        </Link>
                    )}
                </div>

                {role !== "supplier" && (
                    <div className="mt-4 px-3">
                        <div className="mb-1.5 flex items-center gap-2 px-1">
                            <span className={sectionDividerCls} />
                            <span className={sectionLabelCls}>{ts.sourcing}</span>
                            <span className={sectionDividerCls} />
                        </div>
                        <div className="space-y-0.5">
                            <NavLink href="/sourcing/parts" className={navCls}><Package className="mr-2 h-4 w-4" />{ts.partsCatalog}</NavLink>
                            <NavLink href="/sourcing/rfqs" className={navCls}><FileText className="mr-2 h-4 w-4" />{ts.sourcingRequests}</NavLink>
                            <NavLink href="/requests" className={navCls}><ClipboardList className="mr-2 h-4 w-4" />{ts.requests}</NavLink>
                            <NavLink href="/sourcing/requisitions" className={navCls}><ClipboardList className="mr-2 h-4 w-4" />{ts.requisitions}</NavLink>
                            <NavLink href="/sourcing/orders" className={navCls}><ShoppingCart className="mr-2 h-4 w-4" />{ts.orders}</NavLink>
                            <NavLink href="/sourcing/goods-receipts" className={navCls}><Truck className="mr-2 h-4 w-4" />{ts.goodsReceipts}</NavLink>
                            <NavLink href="/sourcing/exceptions" className={navCls}><ShieldAlert className="mr-2 h-4 w-4" />{ts.exceptionManagement}</NavLink>
                            <NavLink href="/sourcing/contracts" className={navCls}><Scale className="mr-2 h-4 w-4" />{ts.contracts}</NavLink>
                        </div>
                    </div>
                )}

                {role !== "supplier" && (
                    <div className="mt-4 px-3">
                        <div className="mb-1.5 flex items-center gap-2 px-1">
                            <span className={sectionDividerCls} />
                            <span className={sectionLabelCls}>{ts.finance}</span>
                            <span className={sectionDividerCls} />
                        </div>
                        <div className="space-y-0.5">
                            <NavLink href="/sourcing/invoices" className={navCls}><ReceiptText className="mr-2 h-4 w-4" />{ts.invoices}</NavLink>
                            <NavLink href="/inventory" className={navCls}><Warehouse className="mr-2 h-4 w-4" />{ts.inventory}</NavLink>
                            <NavLink href="/transactions" className={navCls}><ArrowRightLeft className="mr-2 h-4 w-4" />{ts.transactions}</NavLink>
                            <NavLink href="/contacts" className={navCls}><ContactRound className="mr-2 h-4 w-4" />{ts.contacts}</NavLink>
                            <NavLink href="/savings" className={navCls}><PiggyBank className="mr-2 h-4 w-4" />{ts.savings}</NavLink>
                            <NavLink href="/sustainability" className={navCls}><Leaf className="mr-2 h-4 w-4" />{ts.sustainability}</NavLink>
                        </div>
                    </div>
                )}

                {role === "supplier" && (
                    <div className="mt-4 px-3">
                        <div className="mb-1.5 flex items-center gap-2 px-1">
                            <span className={sectionDividerCls} />
                            <span className={sectionLabelCls}>{ts.vendorPortal}</span>
                            <span className={sectionDividerCls} />
                        </div>
                        <div className="space-y-0.5">
                            {supplierLinks.map((link) => {
                                const Icon = link.icon;
                                return (
                                    <NavLink key={link.href} href={link.href} className={navCls}>
                                        <Icon className="mr-2 h-4 w-4" />
                                        {ts[link.labelKey as keyof typeof ts]}
                                    </NavLink>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="mt-4 px-3">
                    <div className="mb-1.5 flex items-center gap-2 px-1">
                        <span className={sectionDividerCls} />
                        <span className={sectionLabelCls}>{ts.resources}</span>
                        <span className={sectionDividerCls} />
                    </div>
                    <div className="space-y-0.5">
                        {role !== "supplier" && (
                            <NavLink href="/docs" className={navCls}><BookOpen className="mr-2 h-4 w-4" />{ts.playbook}</NavLink>
                        )}
                        <NavLink href="/support" className={navCls}><LifeBuoy className="mr-2 h-4 w-4" />{ts.helpSupport}</NavLink>
                    </div>
                </div>

                {role === "admin" && (visiblePriorityLinks.length > 0 || visibleOperationalLinks.length > 0) && (
                    <div className="mt-4 px-3">
                        {visiblePriorityLinks.length > 0 && (
                            <>
                                <div className="mb-1.5 flex items-center gap-2 px-1">
                                    <span className={sectionDividerCls} />
                                    <span className={sectionLabelCls}>{ts.intelligence}</span>
                                    <span className={sectionDividerCls} />
                                </div>
                                <div className="space-y-0.5">
                                    {visiblePriorityLinks.map((link) => {
                                        const Icon = link.icon;
                                        return (
                                            <NavLink key={link.href} href={link.href} className={navCls}>
                                                <Icon className="mr-2 h-4 w-4" />
                                                {ts[link.labelKey as keyof typeof ts]}
                                            </NavLink>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                        {visibleOperationalLinks.length > 0 && (
                            <div className="mt-3">
                                <div className="mb-1.5 flex items-center gap-2 px-1">
                                    <span className={sectionDividerCls} />
                                    <span className={sectionLabelCls}>{ts.operations}</span>
                                    <span className={sectionDividerCls} />
                                </div>
                                <div className="space-y-0.5">
                                    {visibleOperationalLinks.map((link) => {
                                        const Icon = link.icon;
                                        return (
                                            <NavLink key={link.href} href={link.href} className={navCls}>
                                                <Icon className="mr-2 h-4 w-4" />
                                                {ts[link.labelKey as keyof typeof ts]}
                                            </NavLink>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {role === "admin" && (
                    <div className="mt-auto pt-4 px-3 pb-6">
                        <button
                            type="button"
                            onClick={() => signOut({ redirect: true, callbackUrl: "/signout" })}
                            className="w-full flex items-center gap-3 rounded-lg bg-red-50 px-4 py-3 text-red-600 font-medium text-[13px] transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        >
                            <LogOut className="h-4 w-4 shrink-0" />
                            {ts.logout}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
