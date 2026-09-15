"use client";

import React, { useState } from "react";
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
    ChevronDown,
    ChevronRight,
    Search,
    CheckSquare,
    Bell,
    BoxSelect,
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

const navCls =
    "flex items-center rounded-md px-3 py-1.5 text-[13px] font-medium text-sidebar-foreground/90 transition-colors hover:bg-accent hover:text-accent-foreground";
const sectionButtonCls =
    "flex w-full items-center justify-between px-3 py-1.5 text-[11px] font-semibold tracking-wider uppercase text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors group";
const sectionDividerCls = "h-px flex-1 bg-sidebar-foreground/15";

export function Sidebar({ className }: { className?: string }) {
    const { data: session, status } = useSession();
    const { language } = useLanguage();
    const ts = t(language, "sidebar");

    // Collapsible sections state
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        supplyChain: true,
        transactions: true,
        tools: true,
        sourcing: false,
        intelligence: true,
        operations: true,
        resources: true,
    });

    const toggleSection = (key: string) => {
        setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSearchClick = () => {
        if (typeof window !== "undefined") {
            window.dispatchEvent(
                new CustomEvent("axiom:command-palette-toggle", { detail: { open: true } })
            );
        }
    };

    if (status === "loading") {
        return (
            <div
                className={cn(
                    "flex h-[100dvh] min-h-[100dvh] w-[17rem] min-w-[17rem] flex-col overflow-hidden border-r border-sidebar-border/80 bg-sidebar text-sidebar-foreground xl:w-[18rem] xl:min-w-[18rem]",
                    className
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
    const visiblePriorityLinks =
        role === "admin"
            ? adminPriorityLinks.filter((link) => canAccessAdminPath(user, link.href))
            : [];
    const visibleOperationalLinks =
        role === "admin"
            ? adminOperationalLinks.filter((link) => canAccessAdminPath(user, link.href))
            : [];
    const workspaceLabel =
        role === "admin"
            ? ts.adminConsole
            : role === "supplier"
            ? ts.supplierPortal
            : ts.internalWorkspace;
    const workspaceDescription =
        role === "admin"
            ? ts.adminDescription
            : role === "supplier"
            ? ts.supplierDescription
            : ts.internalDescription;
    const workspaceBadgeClass =
        role === "admin"
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
                className
            )}
        >
            <div className="show-scrollbar min-h-0 flex-1 overflow-y-auto pb-6">
                {/* Header with Org & Workspace */}
                <div className="mb-1 flex items-center justify-between border-b border-sidebar-border/70 px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 shrink-0 rounded-lg bg-primary shadow-md shadow-primary/30 flex items-center justify-center">
                            <AxiomLogo className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div className="flex flex-col leading-none">
                            <div className="flex items-center gap-1">
                                <span className="text-[14px] font-bold tracking-tight text-sidebar-foreground truncate max-w-[120px]">
                                    PRETTL Mech...
                                </span>
                                <ChevronDown className="h-3.5 w-3.5 text-sidebar-foreground/60" />
                            </div>
                            <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/50 mt-0.5">
                                Axiom Platform
                            </span>
                        </div>
                    </div>
                </div>

                {/* Workspace Badge */}
                <div className="mx-3 mt-2 rounded-xl border border-sidebar-foreground/10 bg-white/60 px-3 py-2 text-slate-900 shadow-2xs">
                    <span
                        className={cn(
                            "inline-flex rounded-full border px-2 py-0.5 text-[8.5px] font-black uppercase tracking-[0.12em]",
                            workspaceBadgeClass
                        )}
                    >
                        {workspaceLabel}
                    </span>
                    <p className="mt-1 text-[11px] font-medium text-slate-700 leading-tight">
                        {workspaceDescription}
                    </p>
                </div>

                {/* Quick Navigation Items */}
                <div className="mt-2 space-y-0.5 px-3">
                    <button
                        type="button"
                        onClick={handleSearchClick}
                        className={cn(navCls, "w-full text-left justify-start cursor-pointer")}
                    >
                        <Search className="mr-2 h-4 w-4 text-sidebar-foreground/70" />
                        <span>Search</span>
                        <kbd className="ml-auto pointer-events-none inline-flex h-4 select-none items-center gap-0.5 rounded border border-sidebar-foreground/20 bg-sidebar-foreground/5 px-1 font-mono text-[9px] font-medium text-sidebar-foreground/60">
                            ⌘K
                        </kbd>
                    </button>

                    <NavLink href={role === "supplier" ? "/portal" : "/"} className={navCls}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        {homeLabel}
                    </NavLink>

                    {role !== "supplier" && (
                        <>
                            <NavLink href="/admin/tasks" className={navCls}>
                                <CheckSquare className="mr-2 h-4 w-4" />
                                <span>{ts.tasks || "Tasks"}</span>
                            </NavLink>
                            <button
                                type="button"
                                onClick={() => {
                                    if (typeof window !== "undefined") {
                                        window.dispatchEvent(
                                            new CustomEvent("axiom:notification-panel-toggle")
                                        );
                                    }
                                }}
                                className={cn(navCls, "w-full text-left justify-start")}
                            >
                                <Bell className="mr-2 h-4 w-4" />
                                <span>{ts.notifications || "Notifications"}</span>
                            </button>
                        </>
                    )}
                </div>

                {/* Copilot & AI Fleet (if active) */}
                <div className="mt-2 space-y-1 px-3">
                    {role !== "supplier" && (
                        <NavLink
                            href="/copilot"
                            className={cn(
                                navCls,
                                "border border-primary/25 bg-primary/12 text-emerald-100 font-semibold hover:bg-primary/18"
                            )}
                        >
                            <AxiomLogo className="mr-2 h-4 w-4 text-primary" />
                            {ts.copilot}
                        </NavLink>
                    )}
                    {role === "admin" && canAccessAIFleet(user) && (
                        <Link href="/admin/agents">
                            <span className="flex items-center rounded-md border border-emerald-400/25 bg-emerald-500/14 px-3 py-1.5 text-[13px] font-semibold text-emerald-100 transition-all hover:bg-emerald-500/20">
                                <Layers className="mr-2 h-4 w-4 text-emerald-200" />
                                {ts.agents}
                                <span className="ml-auto rounded-full bg-emerald-300/18 px-1.5 py-0.5 text-[9px] font-black text-emerald-100">
                                    {enabledAgentCount}
                                </span>
                            </span>
                        </Link>
                    )}
                </div>

                {/* Collapsible: SUPPLY CHAIN DATA */}
                {role !== "supplier" && (
                    <div className="mt-3.5 px-3">
                        <button
                            type="button"
                            onClick={() => toggleSection("supplyChain")}
                            className={sectionButtonCls}
                        >
                            <span>{ts.supplyChainData || "Supply chain data"}</span>
                            {openSections.supplyChain ? (
                                <ChevronDown className="h-3.5 w-3.5 transition-transform" />
                            ) : (
                                <ChevronRight className="h-3.5 w-3.5 transition-transform" />
                            )}
                        </button>

                        {openSections.supplyChain && (
                            <div className="mt-0.5 space-y-0.5 pl-1">
                                <NavLink
                                    href="/suppliers"
                                    className={navCls}
                                    onClick={() => {
                                        if (typeof window !== "undefined") {
                                            window.dispatchEvent(
                                                new CustomEvent("suppliers:reset-to-default-view")
                                            );
                                        }
                                    }}
                                >
                                    <Building2 className="mr-2 h-4 w-4" />
                                    {ts.suppliers}
                                </NavLink>
                                <NavLink href="/contacts" className={navCls}>
                                    <ContactRound className="mr-2 h-4 w-4" />
                                    {ts.contacts}
                                </NavLink>
                                <NavLink href="/articles" className={navCls}>
                                    <BoxSelect className="mr-2 h-4 w-4" />
                                    {ts.articles || "Articles"}
                                </NavLink>
                            </div>
                        )}
                    </div>
                )}

                {/* Collapsible: TRANSACTIONS */}
                {role !== "supplier" && (
                    <div className="mt-3 px-3">
                        <button
                            type="button"
                            onClick={() => toggleSection("transactions")}
                            className={sectionButtonCls}
                        >
                            <span>{ts.transactions || "Transactions"}</span>
                            {openSections.transactions ? (
                                <ChevronDown className="h-3.5 w-3.5 transition-transform" />
                            ) : (
                                <ChevronRight className="h-3.5 w-3.5 transition-transform" />
                            )}
                        </button>

                        {openSections.transactions && (
                            <div className="mt-0.5 space-y-0.5 pl-1">
                                <NavLink href="/sourcing/orders" className={navCls}>
                                    <ShoppingCart className="mr-2 h-4 w-4" />
                                    {ts.orders}
                                </NavLink>
                                <NavLink href="/sourcing/goods-receipts" className={navCls}>
                                    <Truck className="mr-2 h-4 w-4" />
                                    {ts.goodsReceipts}
                                </NavLink>
                                <NavLink href="/sourcing/invoices" className={navCls}>
                                    <ReceiptText className="mr-2 h-4 w-4" />
                                    {ts.invoices}
                                </NavLink>
                                <NavLink href="/sourcing/contracts" className={navCls}>
                                    <Scale className="mr-2 h-4 w-4" />
                                    {ts.quantityContracts || ts.contracts}
                                </NavLink>
                            </div>
                        )}
                    </div>
                )}

                {/* Documents Direct Link */}
                {role !== "supplier" && (
                    <div className="mt-2 px-3">
                        <NavLink href="/docs" className={navCls}>
                            <FileText className="mr-2 h-4 w-4" />
                            {ts.documents || "Documents"}
                        </NavLink>
                    </div>
                )}

                {/* Collapsible: TOOLS */}
                {role !== "supplier" && (
                    <div className="mt-3 px-3">
                        <button
                            type="button"
                            onClick={() => toggleSection("tools")}
                            className={sectionButtonCls}
                        >
                            <span>{ts.tools || "Tools"}</span>
                            {openSections.tools ? (
                                <ChevronDown className="h-3.5 w-3.5 transition-transform" />
                            ) : (
                                <ChevronRight className="h-3.5 w-3.5 transition-transform" />
                            )}
                        </button>

                        {openSections.tools && (
                            <div className="mt-0.5 space-y-0.5 pl-1">
                                <NavLink href="/analytics" className={navCls}>
                                    <BarChart3 className="mr-2 h-4 w-4" />
                                    {ts.analytics || "Analytics"}
                                </NavLink>
                                <NavLink href="/savings" className={navCls}>
                                    <PiggyBank className="mr-2 h-4 w-4" />
                                    {ts.savings}
                                </NavLink>
                                <NavLink href="/inventory" className={navCls}>
                                    <Warehouse className="mr-2 h-4 w-4" />
                                    {ts.inventory}
                                </NavLink>
                                <NavLink href="/sustainability" className={navCls}>
                                    <Leaf className="mr-2 h-4 w-4" />
                                    {ts.sustainability}
                                </NavLink>
                            </div>
                        )}
                    </div>
                )}

                {/* Additional Sourcing & Execution items (optional accordion) */}
                {role !== "supplier" && (
                    <div className="mt-3 px-3">
                        <button
                            type="button"
                            onClick={() => toggleSection("sourcing")}
                            className={sectionButtonCls}
                        >
                            <span>{ts.sourcing}</span>
                            {openSections.sourcing ? (
                                <ChevronDown className="h-3.5 w-3.5 transition-transform" />
                            ) : (
                                <ChevronRight className="h-3.5 w-3.5 transition-transform" />
                            )}
                        </button>

                        {openSections.sourcing && (
                            <div className="mt-0.5 space-y-0.5 pl-1">
                                <NavLink href="/sourcing/parts" className={navCls}>
                                    <Package className="mr-2 h-4 w-4" />
                                    {ts.partsCatalog}
                                </NavLink>
                                <NavLink href="/sourcing/rfqs" className={navCls}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    {ts.sourcingRequests}
                                </NavLink>
                                <NavLink href="/requests" className={navCls}>
                                    <ClipboardList className="mr-2 h-4 w-4" />
                                    {ts.requests}
                                </NavLink>
                                <NavLink href="/sourcing/requisitions" className={navCls}>
                                    <ClipboardList className="mr-2 h-4 w-4" />
                                    {ts.requisitions}
                                </NavLink>
                                <NavLink href="/sourcing/exceptions" className={navCls}>
                                    <ShieldAlert className="mr-2 h-4 w-4" />
                                    {ts.exceptionManagement}
                                </NavLink>
                            </div>
                        )}
                    </div>
                )}

                {/* Supplier Portal Links */}
                {role === "supplier" && (
                    <div className="mt-4 px-3">
                        <div className="mb-1.5 flex items-center gap-2 px-1">
                            <span className={sectionDividerCls} />
                            <span className="text-[10.5px] font-black uppercase tracking-[0.16em] text-sidebar-foreground/78">
                                {ts.vendorPortal}
                            </span>
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

                {/* Resources */}
                <div className="mt-3 px-3">
                    <button
                        type="button"
                        onClick={() => toggleSection("resources")}
                        className={sectionButtonCls}
                    >
                        <span>{ts.resources}</span>
                        {openSections.resources ? (
                            <ChevronDown className="h-3.5 w-3.5 transition-transform" />
                        ) : (
                            <ChevronRight className="h-3.5 w-3.5 transition-transform" />
                        )}
                    </button>
                    {openSections.resources && (
                        <div className="mt-0.5 space-y-0.5 pl-1">
                            {role !== "supplier" && (
                                <NavLink href="/docs" className={navCls}>
                                    <BookOpen className="mr-2 h-4 w-4" />
                                    {ts.playbook}
                                </NavLink>
                            )}
                            <NavLink href="/support" className={navCls}>
                                <LifeBuoy className="mr-2 h-4 w-4" />
                                {ts.helpSupport}
                            </NavLink>
                        </div>
                    )}
                </div>

                {/* Admin Intelligence & Operations */}
                {role === "admin" &&
                    (visiblePriorityLinks.length > 0 || visibleOperationalLinks.length > 0) && (
                        <div className="mt-4 px-3">
                            {visiblePriorityLinks.length > 0 && (
                                <>
                                    <div className="mb-1.5 flex items-center gap-2 px-1">
                                        <span className={sectionDividerCls} />
                                        <span className="text-[10.5px] font-black uppercase tracking-[0.16em] text-sidebar-foreground/78">
                                            {ts.intelligence}
                                        </span>
                                        <span className={sectionDividerCls} />
                                    </div>
                                    <div className="space-y-0.5">
                                        {visiblePriorityLinks.map((link) => {
                                            const Icon = link.icon;
                                            return (
                                                <NavLink
                                                    key={link.href}
                                                    href={link.href}
                                                    className={navCls}
                                                >
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
                                        <span className="text-[10.5px] font-black uppercase tracking-[0.16em] text-sidebar-foreground/78">
                                            {ts.operations}
                                        </span>
                                        <span className={sectionDividerCls} />
                                    </div>
                                    <div className="space-y-0.5">
                                        {visibleOperationalLinks.map((link) => {
                                            const Icon = link.icon;
                                            return (
                                                <NavLink
                                                    key={link.href}
                                                    href={link.href}
                                                    className={navCls}
                                                >
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

                {/* Logout Button for Admin */}
                {role === "admin" && (
                    <div className="mt-auto pt-4 px-3 pb-6">
                        <button
                            type="button"
                            onClick={() => signOut({ redirect: true, callbackUrl: "/signout" })}
                            className="w-full flex items-center gap-3 rounded-lg bg-red-50 px-4 py-2.5 text-red-600 font-medium text-[13px] transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
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
