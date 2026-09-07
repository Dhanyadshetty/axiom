"use client";

import * as React from "react";
import { SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getViewGroups, type SupplierView } from "./suppliers-config";
import { useSupplierPermission } from "./suppliers-rbac";

const SIDEBAR_COLLAPSED_KEY = "suppliers.sidebarCollapsed";

export function ViewsSidebar({
    activeViewId,
    counts,
    onSelect,
}: {
    activeViewId: string;
    counts: Record<string, number>;
    onSelect: (viewId: string) => void;
}) {
    const groups = getViewGroups();
    const { can } = useSupplierPermission();
    const [collapsed, setCollapsed] = React.useState(false);
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
        try {
            const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
            if (stored !== null) {
                setCollapsed(JSON.parse(stored));
            }
        } catch {
            // ignore
        }
    }, []);

    const toggleCollapsed = () => {
        const next = !collapsed;
        setCollapsed(next);
        try {
            localStorage.setItem(SIDEBAR_COLLAPSED_KEY, JSON.stringify(next));
        } catch {
            // ignore
        }
    };

    if (!mounted) {
        return (
            <aside className="hidden lg:block w-[330px] flex-shrink-0">
                <div className="flex h-full w-full flex-col rounded-3xl border border-slate-200 bg-white shadow-sm" />
            </aside>
        );
    }

    if (collapsed) {
        return (
            <aside className="hidden lg:block w-10 flex-shrink-0">
                <div className="flex h-full w-full flex-col rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex h-16 items-center justify-center border-b border-slate-100">
                        <button
                            type="button"
                            onClick={toggleCollapsed}
                            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 transition-colors"
                            aria-label="Expand view list"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="flex-1" />
                </div>
            </aside>
        );
    }

    return (
        <aside className="hidden lg:block w-[330px] flex-shrink-0">
            <div className="flex h-full w-full flex-col rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 p-4">
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Views</p>
                        <p className="mt-1 text-sm text-slate-500">Saved supplier segments</p>
                    </div>
                    <button
                        type="button"
                        onClick={toggleCollapsed}
                        className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 transition-colors"
                        aria-label="Collapse view list"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                </div>
                <div className="flex-1 space-y-5 overflow-y-auto p-3">
                    {groups.map((group) => (
                        <div key={group.group}>
                            <p className="mb-2 px-1 text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                                {group.group}
                            </p>
                            <div className="space-y-1">
                                {group.views.map((view) => (
                                    <ViewButton
                                        key={view.id}
                                        view={view}
                                        active={view.id === activeViewId}
                                        count={counts[view.id] ?? 0}
                                        onSelect={onSelect}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                {can("suppliers.manageViews") ? (
                    <div className="border-t border-slate-100 p-3">
                        <button
                            type="button"
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                        >
                            <SlidersHorizontal className="h-4 w-4" />
                            Manage views
                        </button>
                    </div>
                ) : null}
            </div>
        </aside>
    );
}

function ViewButton({
    view,
    active,
    count,
    onSelect,
}: {
    view: SupplierView;
    active: boolean;
    count: number;
    onSelect: (id: string) => void;
}) {
    return (
        <button
            type="button"
            onClick={() => onSelect(view.id)}
            className={`w-full rounded-2xl px-3 py-2.5 text-left transition-all ${
                active ? "bg-slate-900 text-white shadow-lg" : "hover:bg-slate-50"
            }`}
        >
            <div className="flex items-center justify-between gap-2">
                <span className={`text-sm font-bold ${active ? "text-white" : "text-slate-900"}`}>
                    {view.label}
                </span>
                <Badge
                    variant="outline"
                    className={
                        active
                            ? "border-white/20 bg-white/10 text-white"
                            : "border-slate-200 bg-white text-slate-700"
                    }
                >
                    {count}
                </Badge>
            </div>
            <p className={`mt-0.5 text-xs ${active ? "text-slate-300" : "text-slate-500"}`}>
                {view.description}
            </p>
        </button>
    );
}
