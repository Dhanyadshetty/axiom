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
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { AxiomLogo } from "@/components/shared/axiom-logo";
import { PmaLogo } from "@/components/shared/pma-logo";
import { NavLink } from "@/components/layout/nav-link";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { AGENT_REGISTRY } from "@/app/actions/agents/registry";
import { canAccessAIFleet, canAccessAdminPath } from "@/lib/rbac";
import { useLanguage } from "@/components/i18n/language-provider";
import { t } from "@/lib/i18n";

function getUserInitials(name?: string | null, email?: string | null): string {
    if (name && name.trim()) {
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    }
    if (email && email.trim()) {
        return email.slice(0, 2).toUpperCase();
    }
    return "U";
}

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
        tools: true,
        sourcing: false,
        intelligence: true,
        operations: true,
        resources: true,
    });

    const [openSubSections, setOpenSubSections] = useState<Record<string, boolean>>({
        transactions: true,
        savings: true,
    });

    const toggleSection = (key: string) => {
        setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const toggleSubSection = (key: string) => {
        setOpenSubSections((prev) => ({ ...prev, [key]: !prev[key] }));
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
    const homeLabel = role === "admin" ? ts.adminConsole : role === "supplier" ? ts.supplierPortal : ts.workspace;
    const enabledAgentCount = AGENT_REGISTRY.filter((agent) => agent.isEnabled).length;
    const router = useRouter();
    const [orgMenuOpen, setOrgMenuOpen] = useState(false);

    // Sidebar Resizable Width with SSR-safe hydration
    const [sidebarWidth, setSidebarWidth] = useState<number>(280);
    const [isDragging, setIsDragging] = useState(false);

    // Sync from localStorage after client mounts to avoid hydration mismatch
    React.useEffect(() => {
        try {
            const saved = localStorage.getItem("axiom_sidebar_width");
            if (saved) {
                const parsed = parseInt(saved, 10);
                if (!isNaN(parsed) && parsed >= 230 && parsed <= 500) {
                    setSidebarWidth(parsed);
                }
            }
        } catch (_) {}
    }, []);

    const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        const startX = e.clientX;
        const startWidth = sidebarWidth;

        const onMouseMove = (moveEvent: MouseEvent) => {
            const delta = moveEvent.clientX - startX;
            const newWidth = Math.max(230, Math.min(500, startWidth + delta));
            setSidebarWidth(newWidth);
            try {
                localStorage.setItem("axiom_sidebar_width", newWidth.toString());
            } catch (_) {}
        };

        const onMouseUp = () => {
            setIsDragging(false);
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        };

        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    }, [sidebarWidth]);

    return (
        <div
            suppressHydrationWarning
            style={{ width: `${sidebarWidth}px`, minWidth: `${sidebarWidth}px` }}
            className={cn(
                "relative flex h-[100dvh] min-h-[100dvh] flex-col overflow-hidden border-r border-sidebar-border/80 bg-sidebar text-sidebar-foreground transition-[width] duration-75 ease-out",
                isDragging && "select-none !transition-none",
                className
            )}
        >
            <div className="show-scrollbar min-h-0 flex-1 overflow-y-auto pb-6">
                {/* Header with Standalone PMA Logo & Organization Dropdown */}
                <div className="mb-2 border-b border-sidebar-border/70 px-3 py-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                        {/* Standalone PMA Logo Badge - clicking does not trigger dropdown */}
                        <Link
                            href="/"
                            title="PRETTL Mechatronics & Actuators"
                            className="h-8.5 w-14 shrink-0 rounded-lg bg-white shadow-sm flex items-center justify-center px-1.5 py-1 border border-white/20 hover:opacity-90 transition-opacity"
                        >
                            <PmaLogo className="h-full w-full object-contain" />
                        </Link>

                        {/* Dropdown Menu Trigger only for Company / Menu */}
                        <DropdownMenu open={orgMenuOpen} onOpenChange={setOrgMenuOpen}>
                            <DropdownMenuTrigger asChild>
                                <button
                                    type="button"
                                    className="flex flex-1 items-center justify-between min-w-0 rounded-xl p-1 transition-colors hover:bg-sidebar-accent/60 text-left outline-none cursor-pointer group"
                                    aria-label="Open workspace menu"
                                >
                                    <div className="flex flex-col leading-none min-w-0 flex-1 mr-1">
                                        <span
                                            title="PRETTL Mechatronics & Actuators"
                                            className="text-[13px] font-bold tracking-tight text-sidebar-foreground whitespace-nowrap truncate min-w-0"
                                        >
                                            PRETTL Mechatronics &amp; Actuators
                                        </span>
                                        <span className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/50 mt-1 whitespace-nowrap truncate">
                                            Axiom Platform
                                        </span>
                                    </div>
                                    <div className="h-6 w-6 shrink-0 rounded-md flex items-center justify-center text-sidebar-foreground/60 group-hover:text-sidebar-foreground transition-colors">
                                        <ChevronDown
                                            className={cn(
                                                "h-3.5 w-3.5 transition-transform duration-200",
                                                orgMenuOpen && "rotate-180 text-sidebar-foreground"
                                            )}
                                        />
                                    </div>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                            align="start"
                            sideOffset={8}
                            className="w-[270px] rounded-2xl p-1.5 shadow-2xl border border-slate-200/80 bg-white text-slate-900 z-50 animate-in fade-in-0 zoom-in-95"
                        >
                            {/* User details card */}
                            <div className="flex items-center gap-3 p-2.5">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold text-sm border border-slate-200">
                                    {getUserInitials(session?.user?.name, session?.user?.email)}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-slate-900 truncate">
                                        {session?.user?.name || "User"}
                                    </p>
                                    <p className="text-xs text-slate-500 truncate">
                                        {session?.user?.email || "user@prettl.com"}
                                    </p>
                                </div>
                            </div>

                            <DropdownMenuSeparator className="my-1 bg-slate-100" />

                            {/* Help & support */}
                            <DropdownMenuItem
                                onClick={() => router.push("/support")}
                                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 cursor-pointer rounded-xl hover:bg-slate-100 focus:bg-slate-100 focus:text-slate-900"
                            >
                                <LifeBuoy className="h-4 w-4 text-slate-500" />
                                <span>Help &amp; support</span>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="my-1 bg-slate-100" />

                            {/* Log out */}
                            <DropdownMenuItem
                                onClick={() => signOut({ redirect: true, callbackUrl: "/login" })}
                                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 cursor-pointer rounded-xl hover:bg-red-50 focus:bg-red-50 focus:text-red-600"
                            >
                                <LogOut className="h-4 w-4 text-red-600" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    </div>
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

                                {/* Transactions Submenu */}
                                <div>
                                    <button
                                        type="button"
                                        onClick={() => toggleSubSection("transactions")}
                                        className={cn(navCls, "w-full justify-between cursor-pointer group/tx")}
                                    >
                                        <div className="flex items-center">
                                            <ReceiptText className="mr-2 h-4 w-4" />
                                            <span>{ts.transactions || "Transactions"}</span>
                                        </div>
                                        {openSubSections.transactions ? (
                                            <ChevronDown className="h-3.5 w-3.5 opacity-60 group-hover/tx:opacity-100 transition-transform" />
                                        ) : (
                                            <ChevronRight className="h-3.5 w-3.5 opacity-60 group-hover/tx:opacity-100 transition-transform" />
                                        )}
                                    </button>

                                    {openSubSections.transactions && (
                                        <div className="space-y-0.5 pl-7 pr-1 pt-0.5">
                                            <NavLink href="/sourcing/orders" className={cn(navCls, "text-[12.5px] py-1 pl-2.5")}>
                                                {ts.orders || "Orders"}
                                            </NavLink>
                                            <NavLink href="/sourcing/goods-receipts" className={cn(navCls, "text-[12.5px] py-1 pl-2.5")}>
                                                {ts.goodsReceipts || "Goods Receipts"}
                                            </NavLink>
                                            <NavLink href="/sourcing/invoices" className={cn(navCls, "text-[12.5px] py-1 pl-2.5")}>
                                                {ts.invoices || "Invoices"}
                                            </NavLink>
                                            <NavLink href="/sourcing/contracts" className={cn(navCls, "text-[12.5px] py-1 pl-2.5")}>
                                                {ts.quantityContracts || ts.contracts || "Quantity contracts"}
                                            </NavLink>
                                        </div>
                                    )}
                                </div>

                                {/* Documents inside Supply Chain Data */}
                                <NavLink href="/documents" className={navCls}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    {ts.documents || "Documents"}
                                </NavLink>
                            </div>
                        )}
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

                                {/* Savings Submenu */}
                                <div>
                                    <button
                                        type="button"
                                        onClick={() => toggleSubSection("savings")}
                                        className={cn(navCls, "w-full justify-between cursor-pointer group/sav")}
                                    >
                                        <div className="flex items-center">
                                            <PiggyBank className="mr-2 h-4 w-4" />
                                            <span>{ts.savings || "Savings"}</span>
                                        </div>
                                        {openSubSections.savings ? (
                                            <ChevronDown className="h-3.5 w-3.5 opacity-60 group-hover/sav:opacity-100 transition-transform" />
                                        ) : (
                                            <ChevronRight className="h-3.5 w-3.5 opacity-60 group-hover/sav:opacity-100 transition-transform" />
                                        )}
                                    </button>

                                    {openSubSections.savings && (
                                        <div className="space-y-0.5 pl-7 pr-1 pt-0.5">
                                            <NavLink href="/savings" className={cn(navCls, "text-[12.5px] py-1 pl-2.5")}>
                                                Dashboard
                                            </NavLink>
                                            <NavLink href="/savings?tab=findings" className={cn(navCls, "text-[12.5px] py-1 pl-2.5")}>
                                                Findings
                                            </NavLink>
                                            <NavLink href="/savings?tab=opportunities" className={cn(navCls, "text-[12.5px] py-1 pl-2.5")}>
                                                Opportunities
                                            </NavLink>
                                        </div>
                                    )}
                                </div>

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

            {/* Resizable Sidebar Dragger Handle */}
            <div
                onMouseDown={handleMouseDown}
                onDoubleClick={() => {
                    setSidebarWidth(280);
                    try {
                        localStorage.setItem("axiom_sidebar_width", "280");
                    } catch (_) {}
                }}
                title="Drag to resize sidebar (double-click to reset)"
                className={cn(
                    "absolute right-0 top-0 bottom-0 w-2 cursor-col-resize z-50 select-none group transition-colors",
                    isDragging ? "bg-emerald-500/80" : "hover:bg-emerald-500/40"
                )}
            >
                <div
                    className={cn(
                        "absolute top-1/2 -translate-y-1/2 right-[2px] h-10 w-[3px] rounded-full transition-colors",
                        isDragging ? "bg-white" : "bg-sidebar-foreground/20 group-hover:bg-emerald-400"
                    )}
                />
            </div>
        </div>
    );
}
