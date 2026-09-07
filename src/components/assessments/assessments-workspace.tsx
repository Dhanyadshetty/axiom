"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
    Search,
    ChevronDown,
    Check,
    ListFilter,
    FileText,
    Users,
    Calendar,
    Pencil,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CreateRequestModal } from "./create-request-modal";
import type { AssessmentListRow, AssessmentTemplate } from "@/lib/assessment-types";
import { applyFieldFilters, type FilterFieldDef, type RawValue } from "@/components/filters/field-filter-engine";
import { PerFieldFilter } from "@/components/filters/per-field-filter";
import { usePersistedFilters } from "@/components/filters/use-persisted-filters";

type ColumnKey =
    | "title"
    | "responsible"
    | "dueDate"
    | "responses"
    | "status"
    | "suppliers"
    | "createdAt"
    | "updatedAt"
    | "team"
    | "creator";

const ALL_COLUMNS: { key: ColumnKey; label: string }[] = [
    { key: "title", label: "Title" },
    { key: "responsible", label: "Responsible" },
    { key: "dueDate", label: "Due on" },
    { key: "responses", label: "Responses submitted" },
    { key: "status", label: "Status" },
    { key: "suppliers", label: "Suppliers" },
    { key: "createdAt", label: "Created at" },
    { key: "updatedAt", label: "Updated at" },
    { key: "team", label: "Team" },
    { key: "creator", label: "Creator" },
];

const statusStyles: Record<string, { dot: string; label: string; badge: string }> = {
    draft: { dot: "bg-blue-500", label: "Draft", badge: "border-blue-200 bg-blue-50 text-blue-700" },
    published: { dot: "bg-emerald-500", label: "Published", badge: "border-emerald-200 bg-emerald-50 text-emerald-700" },
    submitted: { dot: "bg-emerald-500", label: "Submitted", badge: "border-emerald-200 bg-emerald-50 text-emerald-700" },
    closed: { dot: "bg-rose-500", label: "Closed", badge: "border-rose-200 bg-rose-50 text-rose-700" },
    blanks: { dot: "bg-slate-400", label: "Blanks", badge: "border-slate-200 bg-slate-50 text-slate-600" },
};

type FilterFieldKey =
    | "id" | "title" | "responsible" | "dueDate" | "suppliers"
    | "responsesSubmitted" | "status" | "template" | "createdAt"
    | "updatedAt" | "creator" | "team";

const REQUEST_FILTER_FIELDS: FilterFieldDef[] = [
    { key: "id", label: "ID", type: "text" },
    { key: "title", label: "Title", type: "text" },
    { key: "responsible", label: "Responsible", type: "text" },
    { key: "dueDate", label: "Due on", type: "text" },
    { key: "suppliers", label: "Suppliers", type: "number" },
    { key: "responsesSubmitted", label: "Responses submitted", type: "number" },
    { key: "status", label: "Status", type: "categorical" },
    { key: "template", label: "Template", type: "text" },
    { key: "createdAt", label: "Created at", type: "text" },
    { key: "updatedAt", label: "Last updated at", type: "text" },
    { key: "creator", label: "Creator", type: "text" },
    { key: "team", label: "Team", type: "text" },
];

function getRowFilterValue(row: AssessmentListRow, key: FilterFieldKey): string {
    switch (key) {
        case "id": return row.id;
        case "title": return row.title ?? "";
        case "responsible": return row.responsibleName ?? "";
        case "dueDate": return row.dueDate ? formatDate(row.dueDate) : "";
        case "suppliers": return String(row.supplierCount ?? "");
        case "responsesSubmitted": return String(row.responsesSubmitted ?? "");
        case "status": return row.status ?? "";
        case "template": return row.templateName ?? "";
        case "createdAt": return formatDate(row.createdAt);
        case "updatedAt": return formatDate(row.updatedAt);
        case "creator": return row.createdByName ?? "";
        case "team": return (row.teamIds ?? []).join(", ");
        default: return "";
    }
}

function formatDate(value: Date | string | null) {
    if (!value) return "—";
    const d = typeof value === "string" ? new Date(value) : value;
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function initials(name: string | null) {
    if (!name) return "?";
    return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export function AssessmentsWorkspace({
    initialRows,
    templates,
    canManage,
    defaultTab,
    defaultCreateOpen,
}: {
    initialRows: AssessmentListRow[];
    templates: AssessmentTemplate[];
    canManage: boolean;
    defaultTab: "all" | "my";
    defaultCreateOpen?: boolean;
}) {
    const router = useRouter();
    const [rows] = React.useState(initialRows);
    const [tab, setTab] = React.useState<"all" | "my">(defaultTab);
    const [search, setSearch] = React.useState("");
    const [filters, setFilters] = usePersistedFilters("request_filters");
    const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
    const [visibleColumns, setVisibleColumns] = React.useState<Set<ColumnKey>>(
        new Set(ALL_COLUMNS.slice(0, 8).map((c) => c.key))
    );
    const [createOpen, setCreateOpen] = React.useState(defaultCreateOpen ?? false);

    const tabRows = React.useMemo(
        () => (tab === "my" ? rows.filter((r) => r.status !== "closed" || true) : rows),
        [rows, tab]
    );

    const requestOptions = React.useMemo(() => {
        const statuses = new Set<string>();
        for (const row of rows) if (row.status) statuses.add(row.status);
        return { status: Array.from(statuses).sort() };
    }, [rows]);

    const getRequestOptions = React.useCallback(
        (key: string) => (requestOptions as Record<string, string[]>)[key] ?? [],
        [requestOptions],
    );

    const filteredRows = React.useMemo(() => {
        const q = search.trim().toLowerCase();
        const bySearch = tabRows.filter((row) => {
            const matchesSearch =
                !q ||
                row.title.toLowerCase().includes(q) ||
                (row.responsibleName ?? "").toLowerCase().includes(q) ||
                (row.templateName ?? "").toLowerCase().includes(q);
            return matchesSearch;
        });
        return applyFieldFilters(
            bySearch,
            filters,
            (row, key) => getRowFilterValue(row, key as FilterFieldKey) as RawValue,
        );
    }, [tabRows, search, filters]);

    const allSelected = filteredRows.length > 0 && filteredRows.every((r) => selectedIds.has(r.id));
    const toggleAll = () => {
        if (allSelected) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredRows.map((r) => r.id)));
        }
    };
    const toggleRow = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIds(next);
    };

    const columnCount = visibleColumns.size;

    return (
        <div className="p-4 lg:p-8 space-y-6 min-h-full bg-background">
            {/* Header */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                        <FileText className="h-4 w-4" />
                        Requests
                    </div>
                    <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">
                        Requests
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Create and manage supplier assessment requests.
                    </p>
                </div>
                {canManage ? (
                    <CreateRequestModal templates={templates} defaultOpen={createOpen} onOpenChange={setCreateOpen} />
                ) : null}
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-slate-200">
                {([
                    { id: "all", label: "All" },
                    { id: "my", label: "My Requests" },
                ] as const).map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={`relative px-4 py-2.5 text-sm font-semibold transition-colors ${
                            tab === t.id
                                ? "text-slate-950"
                                : "text-slate-500 hover:text-slate-700"
                        }`}
                    >
                        {t.label}
                        {tab === t.id ? (
                            <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-emerald-600" />
                        ) : null}
                    </button>
                ))}
            </div>

            {/* Filter + search bar */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-[240px] flex-1 max-w-md">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by title, responsible, template"
                        className="pl-9"
                    />
                </div>

                <PerFieldFilter
                    fields={REQUEST_FILTER_FIELDS}
                    filters={filters}
                    onChange={setFilters}
                    getOptions={getRequestOptions}
                />

                {/* Columns selector */}
                <div className="relative ml-auto">
                    <ColumnSelector
                        visible={visibleColumns}
                        onChange={setVisibleColumns}
                        count={columnCount}
                    />
                </div>
            </div>

            {/* Table card */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1100px] text-sm">
                        <thead className="bg-slate-50 text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                            <tr className="border-b border-slate-200">
                                <th className="w-10 px-4 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        checked={allSelected}
                                        onChange={toggleAll}
                                        className="h-4 w-4 rounded border-slate-300"
                                    />
                                </th>
                                <th className="px-4 py-3 text-left">ID</th>
                                {ALL_COLUMNS.filter((c) => visibleColumns.has(c.key)).map((c) => (
                                    <th key={c.key} className="px-4 py-3 text-left whitespace-nowrap">{c.label}</th>
                                ))}
                                {canManage ? (
                                    <th className="w-24 px-4 py-3 text-right">Actions</th>
                                ) : null}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRows.map((row) => {
                                const r = row.responsesSubmitted;
                                const total = row.supplierCount || 0;
                                const displayStatus = total > 0 && r === total ? "submitted" : row.status;
                                const status = statusStyles[displayStatus] ?? statusStyles.draft;
                                return (
                                    <tr
                                        key={row.id}
                                        onClick={() => router.push(`/requests/assessments/${row.id}`)}
                                        className="cursor-pointer border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                                    >
                                        <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(row.id)}
                                                onChange={() => toggleRow(row.id)}
                                                className="h-4 w-4 rounded border-slate-300"
                                            />
                                        </td>
                                        <td className="px-4 py-4 font-mono text-xs text-slate-400">
                                            {row.id.slice(0, 8)}
                                        </td>
                                        {visibleColumns.has("title") ? (
                                            <td className="px-4 py-4 font-semibold text-slate-900">
                                                <div className="flex flex-col">
                                                    <span>{row.title}</span>
                                                    {row.templateName ? (
                                                        <span className="text-xs font-normal text-slate-400">{row.templateName}</span>
                                                    ) : null}
                                                </div>
                                            </td>
                                        ) : null}
                                        {visibleColumns.has("responsible") ? (
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-7 w-7">
                                                        {row.responsibleAvatar ? (
                                                            <AvatarImage src={row.responsibleAvatar} alt={row.responsibleName ?? ""} />
                                                        ) : null}
                                                        <AvatarFallback className="text-[10px]">
                                                            {initials(row.responsibleName)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-slate-700">{row.responsibleName ?? "—"}</span>
                                                </div>
                                            </td>
                                        ) : null}
                                        {visibleColumns.has("dueDate") ? (
                                            <td className="px-4 py-4 text-slate-600 whitespace-nowrap">
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                                    {formatDate(row.dueDate)}
                                                </span>
                                            </td>
                                        ) : null}
                                        {visibleColumns.has("responses") ? (
                                            <td className="px-4 py-4">
                                                <Badge variant="outline" className="border-slate-200 bg-slate-50">
                                                    {r}/{total}
                                                </Badge>
                                            </td>
                                        ) : null}
                                        {visibleColumns.has("status") ? (
                                            <td className="px-4 py-4">
                                                <span className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${status.badge}`}>
                                                    <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                                                    {status.label}
                                                </span>
                                            </td>
                                        ) : null}
                                        {visibleColumns.has("suppliers") ? (
                                            <td className="px-4 py-4">
                                                {row.supplierIds.length === 0 ? (
                                                    <span className="text-slate-400">No suppliers</span>
                                                ) : (
                                                    <div className="flex flex-wrap items-center gap-1">
                                                        {row.supplierIds.slice(0, 3).map((sid) => (
                                                            <Badge key={sid} variant="secondary" className="bg-slate-100 text-slate-600">
                                                                {`S-${sid.slice(0, 4)}`}
                                                            </Badge>
                                                        ))}
                                                        {row.supplierIds.length > 3 ? (
                                                            <span className="text-xs text-slate-400">+{row.supplierIds.length - 3}</span>
                                                        ) : null}
                                                    </div>
                                                )}
                                            </td>
                                        ) : null}
                                        {visibleColumns.has("createdAt") ? (
                                            <td className="px-4 py-4 text-slate-600 whitespace-nowrap">{formatDate(row.createdAt)}</td>
                                        ) : null}
                                        {visibleColumns.has("updatedAt") ? (
                                            <td className="px-4 py-4 text-slate-600 whitespace-nowrap">{formatDate(row.updatedAt)}</td>
                                        ) : null}
                                        {visibleColumns.has("team") ? (
                                            <td className="px-4 py-4 text-slate-600">
                                                {row.teamIds?.length ? (
                                                    <Badge variant="outline" className="border-slate-200 bg-white">
                                                        <Users className="mr-1 h-3 w-3" />
                                                        {row.teamIds.length}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-slate-400">—</span>
                                                )}
                                            </td>
                                        ) : null}
                                        {visibleColumns.has("creator") ? (
                                            <td className="px-4 py-4 text-slate-600">{row.createdByName ?? "—"}</td>
                                        ) : null}
                                        {canManage ? (
                                            <td className="px-4 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={() => router.push(`/requests/assessments/${row.id}?step=general`)}
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                                                    aria-label="Edit request"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" /> Edit
                                                </button>
                                            </td>
                                        ) : null}
                                    </tr>
                                );
                            })}
                            {filteredRows.length === 0 ? (
                                <tr>
                                    <td colSpan={visibleColumns.size + (canManage ? 3 : 2)} className="px-6 py-16 text-center">
                                        <FileText className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                                        <p className="text-base font-semibold text-slate-900">No requests found</p>
                                        <p className="mt-1 text-sm text-slate-500">
                                            {canManage
                                                ? "Create a new request from a template to get started."
                                                : "You have no assessment requests yet."}
                                        </p>
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Rows: {filteredRows.length} of {rows.length}</span>
                {selectedIds.size > 0 ? (
                    <span className="font-medium text-slate-700">{selectedIds.size} selected</span>
                ) : null}
            </div>
        </div>
    );
}

function ColumnSelector({
    visible,
    onChange,
    count,
}: {
    visible: Set<ColumnKey>;
    onChange: (next: Set<ColumnKey>) => void;
    count: number;
}) {
    const [open, setOpen] = React.useState(false);
    return (
        <div className="relative">
            <Button variant="outline" className="gap-2" onClick={() => setOpen((v) => !v)}>
                <ListFilter className="h-4 w-4" />
                Columns
                <Badge variant="secondary" className="ml-1">{count}/{ALL_COLUMNS.length}</Badge>
                <ChevronDown className="h-4 w-4" />
            </Button>
            {open ? (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                        <p className="px-2 py-1.5 text-xs font-black uppercase tracking-wider text-slate-400">
                            Visible columns
                        </p>
                        {ALL_COLUMNS.map((col) => {
                            const active = visible.has(col.key);
                            return (
                                <button
                                    key={col.key}
                                    onClick={() => {
                                        const next = new Set(visible);
                                        if (next.has(col.key)) next.delete(col.key);
                                        else next.add(col.key);
                                        onChange(next);
                                    }}
                                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-slate-50"
                                >
                                    <span className={`flex h-4 w-4 items-center justify-center rounded border ${
                                        active ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300"
                                    }`}>
                                        {active ? <Check className="h-3 w-3" /> : null}
                                    </span>
                                    {col.label}
                                </button>
                            );
                        })}
                    </div>
                </>
            ) : null}
        </div>
    );
}
