import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));

export const statusPillClass = (value: string | null | undefined): string => {
    switch (value) {
        case "Active":
            return "bg-emerald-50 text-emerald-700 border-emerald-200";
        case "Potential Supplier":
            return "bg-orange-50 text-orange-700 border-orange-200";
        case "Evaluation Process":
            return "bg-blue-50 text-blue-700 border-blue-200";
        case "Rejected Supplier":
            return "bg-rose-50 text-rose-700 border-rose-200";
        case "Manufacturer":
            return "bg-violet-50 text-violet-700 border-violet-200";
        case "Distributor":
            return "bg-amber-50 text-amber-700 border-amber-200";
        case "Service Provider":
            return "bg-sky-50 text-sky-700 border-sky-200";
        case "Direct":
            return "bg-emerald-50 text-emerald-700 border-emerald-200";
        case "Indirect":
            return "bg-slate-50 text-slate-700 border-slate-200";
        case "Production":
            return "bg-blue-50 text-blue-700 border-blue-200";
        case "Tooling":
            return "bg-amber-50 text-amber-700 border-amber-200";
        case "Services":
            return "bg-sky-50 text-sky-700 border-sky-200";
        case "A":
            return "bg-emerald-100 text-emerald-700 border-emerald-200";
        case "B":
            return "bg-amber-100 text-amber-700 border-amber-200";
        case "C":
            return "bg-blue-100 text-blue-700 border-blue-200";
        default:
            return "bg-slate-50 text-slate-600 border-slate-200";
    }
};

export const pillClass = (value: string): string => {
    if (["Low risk", "Completed", "Cleared", "Valid", "Accepted", "Approved"].includes(value))
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (["Medium risk", "In progress", "Potential discrepancy", "Pending", "Requested"].includes(value))
        return "bg-amber-50 text-amber-700 border-amber-200";
    if (["High risk", "Violation confirmed", "Rejected"].includes(value))
        return "bg-rose-50 text-rose-700 border-rose-200";
    if (["Unknown", "Waiting for SSA", "Non-existent", "Not evaluated", "Not requested"].includes(value))
        return "bg-slate-100 text-slate-600 border-slate-200";
    return "bg-slate-50 text-slate-600 border-slate-200";
};

export const strategicPillClass = (value: string): string => {
    if (value.includes("Preferred")) return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (value.includes("Strategic")) return "bg-blue-50 text-blue-700 border-blue-200";
    if (value.includes("Internal")) return "bg-violet-50 text-violet-700 border-violet-200";
    return "bg-slate-50 text-slate-600 border-slate-200";
};

export const abcBadgeClass = (value: string): string => {
    switch (value) {
        case "A":
            return "bg-emerald-100 text-emerald-700";
        case "B":
            return "bg-amber-100 text-amber-700";
        case "C":
            return "bg-blue-100 text-blue-700";
        default:
            return "bg-slate-100 text-slate-600";
    }
};

export const certValueClass = (value: string | null | undefined): string => {
    if (!value || value === "Non-existent" || value === "-") return "text-slate-400";
    if (value === "Accepted" || value === "Valid") return "text-emerald-700 font-semibold";
    return "text-slate-700";
};

export const isNonEmpty = (value: unknown): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === "string") return value.trim() !== "";
    if (typeof value === "number") return true;
    if (typeof value === "boolean") return true;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "object") return Object.keys(value).length > 0;
    return false;
};
