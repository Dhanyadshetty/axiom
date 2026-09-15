"use client";

import { AlertCircle, Clock, CheckCircle2 } from "lucide-react";

import type { AssessmentDetail } from "@/lib/assessment-types";

export const supplierStatusStyles: Record<string, { dot: string; label: string; badge: string }> = {
    // Request-level statuses (used by the request detail header/sidebar)
    draft: { dot: "bg-slate-400", label: "Draft", badge: "border-slate-200 bg-slate-50 text-slate-600" },
    published: { dot: "bg-emerald-500", label: "Published", badge: "border-emerald-200 bg-emerald-50 text-emerald-700" },
    // Participant (supplier) statuses
    pending: { dot: "bg-slate-400", label: "Pending", badge: "border-slate-200 bg-slate-50 text-slate-600" },
    sent: { dot: "bg-sky-500", label: "Sent", badge: "border-sky-200 bg-sky-50 text-sky-700" },
    in_progress: { dot: "bg-amber-500", label: "Response in progress", badge: "border-amber-200 bg-amber-50 text-amber-700" },
    submitted: { dot: "bg-emerald-500", label: "Submitted", badge: "border-emerald-200 bg-emerald-50 text-emerald-700" },
    completed: { dot: "bg-emerald-500", label: "Completed", badge: "border-emerald-200 bg-emerald-50 text-emerald-700" },
    closed: { dot: "bg-rose-500", label: "Closed", badge: "border-rose-200 bg-rose-50 text-rose-700" },
};

export const reviewStatusStyles: Record<string, { icon: React.ReactNode; label: string; badge: string }> = {
    not_reviewed: { icon: <AlertCircle className="h-3.5 w-3.5" />, label: "Not reviewed", badge: "border-slate-200 bg-slate-50 text-slate-600" },
    in_review: { icon: <Clock className="h-3.5 w-3.5" />, label: "In review", badge: "border-amber-200 bg-amber-50 text-amber-700" },
    approved: { icon: <CheckCircle2 className="h-3.5 w-3.5" />, label: "Approved", badge: "border-emerald-200 bg-emerald-50 text-emerald-700" },
    rejected: { icon: <AlertCircle className="h-3.5 w-3.5" />, label: "Rejected", badge: "border-rose-200 bg-rose-50 text-rose-700" },
};

export function initials(name: string | null) {
    if (!name) return "?";
    return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export function formatDate(value: Date | string | null) {
    if (!value) return "—";
    const d = typeof value === "string" ? new Date(value) : value;
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
}

export function formatDateTime(value: Date | string | null) {
    if (!value) return "—";
    const d = typeof value === "string" ? new Date(value) : value;
    return d.toLocaleString("en-US", { month: "2-digit", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "UTC" });
}

export function truncate(str: string | null, max: number) {
    if (!str) return "—";
    return str.length > max ? str.slice(0, max - 1) + "…" : str;
}