"use client";

import * as React from "react";
import { History, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { isNonEmpty } from "./styling";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export type PropertyValueKind =
    | "text"
    | "number"
    | "select"
    | "multiline"
    | "boolean"
    | "date"
    | "list"
    | "file"
    | "pill"
    | "list-of-rows"
    | "table";

export interface PropertyField {
    key: string;
    label: string;
    value: unknown;
    kind: PropertyValueKind;
    options?: string[];
    placeholder?: string;
    editable?: boolean;
    hasHistory?: boolean;
    pillClass?: string;
    onCommit?: (next: unknown) => void;
}

export function PropertyRow({ field }: { field: PropertyField }) {
    const [open, setOpen] = React.useState(false);
    const [editing, setEditing] = React.useState(false);

    const editable = field.editable !== false;
    const hasHistory = field.hasHistory === true;

    return (
        <div className="grid grid-cols-[1fr_minmax(0,1.6fr)_auto] items-center gap-3 border-b border-slate-100 px-4 py-2.5 last:border-0">
            <div className="text-[12px] font-medium text-slate-500">{field.label}</div>
            <div className="min-w-0">
                <ValueDisplay
                    field={field}
                    editing={editing}
                    onStopEditing={() => setEditing(false)}
                />
            </div>
            <div className="flex items-center gap-1">
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    disabled={!hasHistory}
                    className={cn(
                        "rounded-md p-1 transition-colors",
                        hasHistory
                            ? "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                            : "cursor-not-allowed text-slate-300",
                    )}
                    aria-label={`History of ${field.label}`}
                >
                    <History className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editable && setEditing((e) => !e)}
                    disabled={!editable}
                    className={cn(
                        "rounded-md p-1 transition-colors",
                        editable
                            ? editing
                                ? "bg-slate-100 text-slate-700"
                                : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                            : "cursor-not-allowed text-slate-300",
                    )}
                    aria-label={`Edit ${field.label}`}
                >
                    <Pencil className="h-4 w-4" />
                </button>
            </div>
            {open ? (
                <HistoryFlyout
                    title={field.label}
                    hasHistory={hasHistory}
                    onClose={() => setOpen(false)}
                />
            ) : null}
        </div>
    );
}

function ValueDisplay({
    field,
    editing,
    onStopEditing,
}: {
    field: PropertyField;
    editing: boolean;
    onStopEditing: () => void;
}) {
    const [draft, setDraft] = React.useState<string>(String(field.value ?? ""));

    React.useEffect(() => {
        setDraft(String(field.value ?? ""));
    }, [field.value]);

    if (editing && field.kind === "boolean") {
        return (
            <Checkbox
                checked={Boolean(field.value)}
                onCheckedChange={(v) => {
                    field.onCommit?.(Boolean(v));
                    onStopEditing();
                }}
            />
        );
    }

    if (editing) {
        if (field.kind === "select") {
            return (
                <Select
                    value={String(field.value ?? "")}
                    onValueChange={(v) => {
                        field.onCommit?.(v);
                        onStopEditing();
                    }}
                >
                    <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder={field.placeholder ?? "Select..."} />
                    </SelectTrigger>
                    <SelectContent>
                        {(field.options ?? []).map((opt) => (
                            <SelectItem key={opt} value={opt}>
                                {opt}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            );
        }
        if (field.kind === "multiline") {
            return (
                <Textarea
                    autoFocus
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onBlur={() => {
                        field.onCommit?.(draft);
                        onStopEditing();
                    }}
                    rows={3}
                    placeholder={field.placeholder ?? "Enter text"}
                />
            );
        }
        if (field.kind === "number") {
            return (
                <Input
                    autoFocus
                    type="number"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onBlur={() => {
                        field.onCommit?.(draft === "" ? "" : Number(draft));
                        onStopEditing();
                    }}
                    placeholder={field.placeholder ?? "Enter a number"}
                />
            );
        }
        return (
            <Input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={() => {
                    field.onCommit?.(draft);
                    onStopEditing();
                }}
                placeholder={field.placeholder ?? "Enter text"}
            />
        );
    }

    if (!isNonEmpty(field.value)) {
        return <EmptyForKind kind={field.kind} />;
    }

    if (field.kind === "boolean") {
        const ok = Boolean(field.value);
        return ok ? (
            <span className="inline-flex items-center gap-1 text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Yes
            </span>
        ) : (
            <span className="text-slate-400">No</span>
        );
    }

    if (field.kind === "pill") {
        return (
            <span
                className={cn(
                    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                    field.pillClass ?? "bg-slate-50 text-slate-700 border-slate-200",
                )}
            >
                {String(field.value)}
            </span>
        );
    }

    if (field.kind === "list" && Array.isArray(field.value)) {
        return (
            <div className="flex flex-wrap gap-1">
                {field.value.map((v) => (
                    <span
                        key={String(v)}
                        className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-700"
                    >
                        {String(v)}
                    </span>
                ))}
            </div>
        );
    }

    if (field.kind === "multiline" || field.kind === "list-of-rows") {
        return (
            <div className="whitespace-pre-wrap text-sm text-slate-700">
                {String(field.value)}
            </div>
        );
    }

    if (field.kind === "date") {
        return <span className="text-sm text-slate-700">{String(field.value)}</span>;
    }

    return <span className="text-sm text-slate-700">{String(field.value)}</span>;
}

function EmptyForKind({ kind }: { kind: PropertyValueKind }) {
    if (kind === "select") return <span className="text-xs italic text-slate-400">Select...</span>;
    if (kind === "number") return <span className="text-xs italic text-slate-400">Enter a number</span>;
    if (kind === "date") return <span className="text-sm text-slate-400">-</span>;
    if (kind === "boolean") return <span className="text-slate-400">-</span>;
    if (kind === "file") return <span className="text-sm text-slate-400">No files attached</span>;
    return <span className="text-xs italic text-slate-400">Enter text</span>;
}

function HistoryFlyout({
    title,
    hasHistory,
    onClose,
}: {
    title: string;
    hasHistory: boolean;
    onClose: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20" onClick={onClose}>
            <div
                className="flex h-full w-full max-w-md flex-col bg-white shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
                    <h3 className="text-sm font-semibold text-slate-700">History · {title}</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
                        aria-label="Close history"
                    >
                        ×
                    </button>
                </div>
                <div className="flex-1 overflow-auto px-5 py-4 text-sm text-slate-500">
                    {hasHistory ? (
                        <p>No history available for this attribute.</p>
                    ) : (
                        <p>No history available for this attribute.</p>
                    )}
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 px-5 py-2 text-xs text-slate-400">
                    <button
                        type="button"
                        className="rounded-md px-2 py-1 hover:bg-slate-100"
                        aria-label="Previous"
                    >
                        ‹
                    </button>
                    <span>0 / 0</span>
                    <button
                        type="button"
                        className="rounded-md px-2 py-1 hover:bg-slate-100"
                        aria-label="Next"
                    >
                        ›
                    </button>
                </div>
            </div>
        </div>
    );
}
