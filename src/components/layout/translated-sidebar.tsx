"use client";

import Link from "next/link";
import { useLanguage } from "@/components/language-provider";
import { AxiomLogo } from "@/components/shared/axiom-logo";
import { NavLink } from "@/components/layout/nav-link";
import { cn } from "@/lib/utils";
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
} from "lucide-react";
import type { ComponentType } from "react";

/**
 * Map from icon name string → Lucide component.
 * This lets us pass serializable strings from the server component
 * instead of non-serializable React component references.
 */
const iconMap: Record<string, ComponentType<{ className?: string }>> = {
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
    AxiomLogo,
};

export type SidebarSection = {
  id: string;
  titleKey?: string;
  links: {
    labelKey: string;
    iconName: string; // string key into iconMap
    href: string;
    emphasis?: "copilot" | "agents";
    badge?: string | number;
  }[];
};

type TranslatedSidebarProps = {
  className?: string;
  sections: SidebarSection[];
  workspaceLabelKey: string;
  workspaceDescKey: string;
  workspaceBadgeClass: string;
};

const navCls =
  "flex items-center rounded-md px-3 py-1 text-[13px] font-medium text-sidebar-foreground/92 transition-colors hover:bg-accent hover:text-accent-foreground";
const sectionLabelCls =
  "text-[10.5px] font-black uppercase tracking-[0.16em] text-sidebar-foreground/78";
const sectionDividerCls = "h-px flex-1 bg-sidebar-foreground/18";

export function TranslatedSidebar({
  className,
  sections,
  workspaceLabelKey,
  workspaceDescKey,
  workspaceBadgeClass,
}: TranslatedSidebarProps) {
  const { t } = useLanguage();

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
            <span className="text-[16px] font-black tracking-tight text-sidebar-foreground">
              Axiom
            </span>
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-sidebar-foreground/60">
              {t("sidebar.procurementOS")}
            </span>
          </div>
        </div>

        <div className="mx-3 rounded-2xl border border-sidebar-foreground/12 bg-white/70 px-3 py-3 text-slate-900">
          <span
            className={cn(
              "inline-flex rounded-full border px-2 py-1 text-[9px] font-black uppercase tracking-[0.14em]",
              workspaceBadgeClass,
            )}
          >
            {t(workspaceLabelKey)}
          </span>
          <p className="mt-2 text-[12px] font-semibold text-slate-900">
            {t(workspaceDescKey)}
          </p>
        </div>

        {sections.map((section) => (
          <div key={section.id} className={section.id === "primary" ? "mt-2 space-y-0.5 px-3" : "mt-4 px-3"}>
            {section.titleKey && (
              <div className="mb-1.5 flex items-center gap-2 px-1">
                <span className={sectionDividerCls} />
                <span className={sectionLabelCls}>{t(section.titleKey)}</span>
                <span className={sectionDividerCls} />
              </div>
            )}
            <div className="space-y-0.5">
              {section.links.map((link) => {
                const Icon = iconMap[link.iconName] ?? LayoutDashboard;
                if (link.emphasis === "copilot") {
                  return (
                    <NavLink
                      key={link.href}
                      href={link.href}
                      className={cn(
                        navCls,
                        "border border-primary/25 bg-primary/12 text-emerald-100 font-semibold hover:bg-primary/18",
                      )}
                    >
                      <Icon className="mr-2 h-4 w-4 text-primary" />
                      {t(link.labelKey)}
                    </NavLink>
                  );
                }
                if (link.emphasis === "agents") {
                  return (
                    <Link key={link.href} href={link.href}>
                      <span className="flex items-center rounded-md border border-emerald-400/25 bg-emerald-500/14 px-3 py-1.5 text-[13px] font-semibold text-emerald-100 transition-all hover:bg-emerald-500/20">
                        <Icon className="mr-2 h-4 w-4 text-emerald-200" />
                        {t(link.labelKey)}
                        {link.badge !== undefined && (
                          <span className="ml-auto rounded-full bg-emerald-300/18 px-1.5 py-0.5 text-[9px] font-black text-emerald-100">
                            {link.badge}
                          </span>
                        )}
                      </span>
                    </Link>
                  );
                }
                return (
                  <NavLink key={link.href} href={link.href} className={navCls}>
                    <Icon className="mr-2 h-4 w-4" />
                    {t(link.labelKey)}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
