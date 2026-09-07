"use client";

import * as React from "react";
import { Check, Minus } from "lucide-react";
import { cn, isNonEmpty } from "./styling";

export type CertValue = string | "Accepted" | "Non-existent" | "-";

export interface CertDef {
    key: string;
    label: string;
    requested?: boolean;
}

export interface CertSection {
    title: string;
    certs: CertDef[];
}

export interface CertificationsBlockProps {
    sections: CertSection[];
    values: Record<string, CertValue | undefined>;
    onCommit?: (key: string, value: CertValue) => void;
}

export function CertificationsBlock({
    sections,
    values,
    onCommit,
}: CertificationsBlockProps) {
    return (
        <div className="space-y-3">
            {sections.map((s) => (
                <div
                    key={s.title}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                    <div className="border-b border-slate-100 bg-slate-50 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-slate-500">
                        {s.title}
                    </div>
                    <ul className="divide-y divide-slate-100">
                        {s.certs.map((cert) => {
                            const v = values[cert.key];
                            return (
                                <li
                                    key={cert.key}
                                    className="grid grid-cols-[1fr_minmax(0,1fr)_auto] items-center gap-3 px-4 py-2.5"
                                >
                                    <div className="text-sm text-slate-700">{cert.label}</div>
                                    <div className="flex items-center gap-2">
                                        <CertValueDisplay value={v} />
                                    </div>
                                    <RowActions
                                        onCommit={(next) => onCommit?.(cert.key, next)}
                                        current={v}
                                    />
                                </li>
                            );
                        })}
                    </ul>
                </div>
            ))}
        </div>
    );
}

function CertValueDisplay({ value }: { value: CertValue | undefined }) {
    if (!isNonEmpty(value) || value === "-") {
        return (
            <span className="inline-flex items-center gap-1 text-sm text-slate-400">
                <Minus className="h-3.5 w-3.5" /> -
            </span>
        );
    }
    if (value === "Non-existent") {
        return <span className="text-sm text-slate-400">Non-existent</span>;
    }
    if (value === "Accepted") {
        return (
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Accepted
            </span>
        );
    }
    return <span className="text-sm text-slate-700">{value}</span>;
}

function RowActions({
    onCommit,
    current,
}: {
    onCommit: (v: CertValue) => void;
    current: CertValue | undefined;
}) {
    return (
        <div className="flex items-center gap-1">
            <button
                type="button"
                onClick={() => onCommit(current === "Accepted" ? "Non-existent" : "Accepted")}
                className={cn(
                    "rounded-md border px-2 py-1 text-[11px] font-semibold transition-colors",
                    current === "Accepted"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50",
                )}
            >
                <Check className="mr-1 inline h-3 w-3" /> Accepted
            </button>
            <button
                type="button"
                onClick={() => onCommit(current === "Non-existent" ? "-" : "Non-existent")}
                className={cn(
                    "rounded-md border px-2 py-1 text-[11px] font-semibold transition-colors",
                    current === "Non-existent"
                        ? "border-slate-300 bg-slate-100 text-slate-700"
                        : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50",
                )}
            >
                Non-existent
            </button>
        </div>
    );
}
