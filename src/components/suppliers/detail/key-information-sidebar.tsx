"use client";

import * as React from "react";
import Link from "next/link";
import {
    ChevronDown,
    MoreVertical,
    X,
    Settings2,
    Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { isNonEmpty, statusPillClass } from "./styling";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface KeyInfoItem {
    label: string;
    value: unknown;
    kind?: "text" | "number" | "pill" | "multi-pill" | "select-user" | "select";
    options?: string[];
    pillClass?: string;
    removable?: boolean;
    onCommit?: (value: unknown) => void;
    onRemove?: () => void;
}

export function KeyInformationSidebar({
    title,
    items,
    bottomButton,
    onConfigureSidebar,
    onConfigureProperties,
}: {
    title: string;
    items: KeyInfoItem[];
    bottomButton?: { label: string; href: string };
    onConfigureSidebar?: () => void;
    onConfigureProperties?: () => void;
}) {
    const [open, setOpen] = React.useState(true);
    const [menuOpen, setMenuOpen] = React.useState(false);

    return (
        <aside className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <button
                    type="button"
                    onClick={() => setOpen((o) => !o)}
                    className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-slate-500"
                >
                    {title}
                    <ChevronDown
                        className={cn(
                            "h-3.5 w-3.5 text-slate-400 transition-transform",
                            open ? "rotate-180" : "rotate-0",
                        )}
                    />
                </button>
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setMenuOpen((m) => !m)}
                        className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        aria-label="Sidebar actions"
                    >
                        <MoreVertical className="h-4 w-4" />
                    </button>
                    {menuOpen ? (
                        <div
                            className="absolute right-0 z-20 mt-1 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
                            onMouseLeave={() => setMenuOpen(false)}
                        >
                            <button
                                type="button"
                                onClick={() => {
                                    setMenuOpen(false);
                                    onConfigureSidebar?.();
                                }}
                                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                            >
                                <Settings2 className="h-3.5 w-3.5" /> Configure sidebar
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setMenuOpen(false);
                                    onConfigureProperties?.();
                                }}
                                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                            >
                                <Settings2 className="h-3.5 w-3.5" /> Configure properties
                            </button>
                        </div>
                    ) : null}
                </div>
            </div>
            {open ? (
                <div className="space-y-3 px-4 py-4 text-sm">
                    {items.map((item) => (
                        <SidebarRow key={item.label} item={item} />
                    ))}
                    {bottomButton ? (
                        <div className="pt-2">
                            <Button asChild className="w-full">
                                <Link href={bottomButton.href}>{bottomButton.label}</Link>
                            </Button>
                        </div>
                    ) : null}
                </div>
            ) : null}
        </aside>
    );
}

function SidebarRow({ item }: { item: KeyInfoItem }) {
    const [editing, setEditing] = React.useState(false);
    const [draft, setDraft] = React.useState<string>(String(item.value ?? ""));

    React.useEffect(() => {
        setDraft(String(item.value ?? ""));
    }, [item.value]);

    const commit = () => {
        item.onCommit?.(draft);
        setEditing(false);
    };

    const display = (() => {
        const v = item.value;
        if (item.kind === "multi-pill" && Array.isArray(v)) {
            if (v.length === 0) return <EmptyValue />;
            return (
                <div className="flex flex-wrap justify-end gap-1">
                    {v.map((tag: string) => (
                        <span
                            key={tag}
                            className={cn(
                                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                                statusPillClass(tag),
                            )}
                        >
                            {tag}
                            {item.removable ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const next = v.filter((t) => t !== tag);
                                        item.onCommit?.(next);
                                    }}
                                    className="rounded-full p-0.5 hover:bg-black/5"
                                    aria-label={`Remove ${tag}`}
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            ) : null}
                        </span>
                    ))}
                </div>
            );
        }
        if (item.kind === "pill") {
            const text = String(v ?? "");
            if (!isNonEmpty(v)) return <EmptyValue />;
            return (
                <span
                    className={cn(
                        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                        item.pillClass ?? statusPillClass(text),
                    )}
                >
                    {text}
                </span>
            );
        }
        if (item.kind === "number") {
            if (!isNonEmpty(v)) return <EmptyValue number />;
            return (
                <span className="text-right font-semibold text-slate-700">
                    {Number(v).toLocaleString("en-US")}
                </span>
            );
        }
        if (item.kind === "select-user" || item.kind === "select") {
            if (!isNonEmpty(v)) {
                return (
                    <span className="text-xs italic text-slate-400">
                        {item.kind === "select-user" ? "Select..." : "Select..."}
                    </span>
                );
            }
            return <span className="font-medium text-slate-700">{String(v)}</span>;
        }
        if (!isNonEmpty(v)) return <EmptyValue />;
        return <span className="text-right font-medium text-slate-700">{String(v)}</span>;
    })();

    return (
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2 last:border-0">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                {item.label}
            </span>
            <div className="flex max-w-[60%] flex-col items-end gap-1">
                {editing && (item.kind === "text" || item.kind === "number") ? (
                    <Input
                        autoFocus
                        type={item.kind === "number" ? "number" : "text"}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onBlur={commit}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") commit();
                            if (e.key === "Escape") setEditing(false);
                        }}
                        className="h-7 w-32 text-right text-xs"
                    />
                ) : editing && (item.kind === "select" || item.kind === "select-user") ? (
                    <Select
                        value={String(draft || "")}
                        onValueChange={(v) => {
                            setDraft(v);
                            item.onCommit?.(v);
                            setEditing(false);
                        }}
                    >
                        <SelectTrigger className="h-7 w-32 text-xs">
                            <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                            {(item.options ?? []).map((opt) => (
                                <SelectItem key={opt} value={opt}>
                                    {opt}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                ) : (
                    <button
                        type="button"
                        onClick={() => (item.onCommit ? setEditing(true) : undefined)}
                        className="text-right"
                    >
                        {display}
                    </button>
                )}
            </div>
        </div>
    );
}

function EmptyValue({ number }: { number?: boolean }) {
    return (
        <span className="text-xs italic text-slate-400">
            {number ? "Enter a number" : "Select..."}
        </span>
    );
}

export const TrashIcon = Trash2;
