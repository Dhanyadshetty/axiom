"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    BookmarkPlus,
    Check,
    ChevronDown,
    FileSpreadsheet,
    Filter,
    Grid2x2,
    MoreVertical,
    PanelLeftClose,
    PanelLeftOpen,
    Plus,
    RotateCcw,
    Search,
    Settings,
    Trash2,
    Upload,
    X,
} from "lucide-react";
import * as Popover from "@radix-ui/react-popover";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useVirtualizer } from "@tanstack/react-virtual";
import { flagEmoji, countryName } from "@/lib/utils/countryFlags";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddSupplierModal } from "@/components/suppliers/add-supplier-modal";
import { SupplierRowMenu } from "@/components/suppliers/supplier-row-menu";
import { CreateEvaluationModal } from "@/components/suppliers/create-evaluation-modal";
import { BulkActionsMenu } from "@/components/shared/bulk-actions-menu";
import { Can } from "@/components/suppliers/suppliers-rbac";
import { buildSupplierBulkActions } from "@/components/suppliers/supplier-bulk-actions";
import {
    type ColumnId,
    type FilterFieldKey,
    type FilterOperator,
    type FilterRule,
    type Supplier,
    type SupplierView,
    FILTER_FIELD_LABELS,
    FILTER_FIELD_KIND,
    FILTER_FIELD_OPTIONS,
    OPERATORS_BY_KIND,
    OPERATOR_LABELS,
    getFieldValue,
} from "./tacto/suppliers-model";

interface SuppliersModuleProps {
    suppliers: Supplier[];
    views: SupplierView[];
    defaultViewId: string;
    canManage: boolean;
    canImport: boolean;
}

interface SavedPreset {
    id: string;
    name: string;
    viewId: string;
    filters: FilterRule[];
    sort: { id: ColumnId; dir: "asc" | "desc" } | null;
    search: string;
}

function fmtCurrency(value: number): string {
    return new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
    }).format(value);
}

function isBlankValue(value: unknown): boolean {
    if (value === null || value === undefined) return true;
    if (typeof value === "string") return value.trim() === "";
    if (typeof value === "boolean") return value === false;
    if (Array.isArray(value)) return value.length === 0;
    return false;
}

function evalRule(supplier: Supplier, rule: FilterRule): boolean {
    const raw = getFieldValue(supplier, rule.field);

    switch (rule.operator) {
        case "is_one_of": {
            const allowed = Array.isArray(rule.value) ? rule.value : [String(rule.value)];
            if (Array.isArray(raw)) return raw.some((v) => allowed.includes(String(v)));
            if (raw === "" || raw === null || raw === undefined) return false;
            return allowed.includes(String(raw));
        }
        case "is_none_of": {
            const denied = Array.isArray(rule.value) ? rule.value : [String(rule.value)];
            if (raw === "" || raw === null || raw === undefined) return true;
            if (Array.isArray(raw)) return !raw.some((v) => denied.includes(String(v)));
            return !denied.includes(String(raw));
        }
        case "equals":
            if (typeof rule.value === "boolean") return raw === rule.value;
            if (Array.isArray(raw)) return raw.some((v) => String(v) === String(rule.value));
            if (raw === "" || raw === null || raw === undefined) return false;
            return String(raw) === String(rule.value);
        case "not_equals":
            if (typeof rule.value === "boolean") return raw !== rule.value;
            if (Array.isArray(raw)) return !raw.some((v) => String(v) === String(rule.value));
            if (raw === "" || raw === null || raw === undefined) return true;
            return String(raw) !== String(rule.value);
        case "contains": {
            const needle = String(rule.value ?? "").toLowerCase();
            if (!needle) return true;
            if (Array.isArray(raw)) return raw.some((v) => String(v).toLowerCase().includes(needle));
            if (raw === "" || raw === null || raw === undefined) return false;
            return String(raw).toLowerCase().includes(needle);
        }
        case "gte":
            return Number(raw) >= Number(rule.value);
        case "lte":
            return Number(raw) <= Number(rule.value);
        case "is_blank":
            return isBlankValue(raw);
        case "is_not_blank":
            return !isBlankValue(raw);
        default:
            return true;
    }
}

function applyFilters(rows: Supplier[], filters: FilterRule[]): Supplier[] {
    if (filters.length === 0) return rows;
    return rows.filter((row) => {
        let result = evalRule(row, filters[0]);
        for (let i = 1; i < filters.length; i++) {
            const next = evalRule(row, filters[i]);
            result = filters[i].connector === "or" ? result || next : result && next;
        }
        return result;
    });
}

function matchesSearch(supplier: Supplier, query: string): boolean {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const haystack = [
        supplier.name,
        supplier.id,
        supplier.country,
        countryName(supplier.country),
        supplier.commodityGroup,
        supplier.responsibleBuyer,
        supplier.strategicClassification,
        supplier.supplierStatus,
        supplier.esg.riskStatus,
        supplier.isicCode,
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
    return haystack.includes(q);
}

function readColumnValue(supplier: Supplier, columnId: ColumnId): unknown {
    switch (columnId) {
        case "supplier":
            return supplier.name;
        case "supplierId":
            return supplier.id;
        case "supplierName":
            return supplier.name;
        case "country":
            return supplier.country;
        case "isicCode":
            return supplier.isicCode;
        case "internal":
            return supplier.internal;
        case "orderVolume2025":
            return supplier.orderVolume2025;
        case "orderVolume2024":
            return supplier.orderVolume2024;
        case "abc":
            return supplier.abcClassification;
        case "status":
            return supplier.supplierStatus;
        case "supplierType":
            return supplier.supplierType ?? "";
        case "areaOfNeed":
            return supplier.areaOfNeed ?? [];
        case "commodityGroup":
            return supplier.commodityGroup;
        case "responsibleBuyer":
            return supplier.responsibleBuyer;
        case "strategicClassification":
            return supplier.strategicClassification;
        case "certIso9001":
            return supplier.certificates.iso9001;
        case "certIso13485":
            return supplier.certificates.iso13485;
        case "certIso45001":
            return supplier.certificates.iso45001;
        case "certIso17025":
            return supplier.certificates.iso17025;
        case "certCodeOfConduct":
            return supplier.certificates.codeOfConduct;
        case "certNda":
            return supplier.certificates.nda;
        case "certIso14001":
            return supplier.certificates.iso14001;
        case "ssaSent":
            return supplier.ssaSent;
        case "ssaReceived":
            return supplier.ssaReceived;
        case "ssaCompleted":
            return supplier.ssaCompleted;
        case "supplierCreatedIn":
            return supplier.supplierCreatedIn;
        case "reachRelevance":
            return supplier.reach.relevance;
        case "reachAffected":
            return supplier.reach.affected;
        case "reachNotes":
            return supplier.reach.notes;
        case "reachSupplierSpecific":
            return supplier.reach.supplierSpecificNote;
        case "rohsRelevance":
            return supplier.rohs.relevance;
        case "rohsAffected":
            return supplier.rohs.affected;
        case "rohsNote":
            return supplier.rohs.note;
        case "rohsSupplierSpecific":
            return supplier.rohs.supplierSpecificNote;
        case "esgAnalysisProgress":
            return supplier.esg.analysisProgress;
        case "esgRiskStatus":
            return supplier.esg.riskStatus;
        case "concreteRisk":
            return supplier.esg.concreteRisk;
        case "humanRights":
            return supplier.esg.humanRights;
        case "workersRights":
            return supplier.esg.workersRights;
        case "environmental":
            return supplier.esg.environmental;
        case "existingKnowledge":
            return supplier.esg.existingKnowledge;
        case "incidentStatus":
            return supplier.publicIncidents[0]?.status ?? "";
        case "incidentCategory":
            return supplier.publicIncidents[0]?.category ?? "";
        case "incidentJustification":
            return supplier.publicIncidents[0]?.briefJustification ?? "";
        case "incidentSources":
            return supplier.publicIncidents[0]?.sources ?? "";
        case "egbAnalysisProgress":
            return supplier.ownBusinessArea.analysisProgress;
        case "egbRiskStatus":
            return supplier.ownBusinessArea.riskStatus;
        case "egbImplementation1":
            return supplier.ownBusinessArea.implementation1;
        case "egbImplementation2":
            return supplier.ownBusinessArea.implementation2;
        case "egbImplementation3":
            return supplier.ownBusinessArea.implementation3;
        case "contactPerson":
            return supplier.ownBusinessArea.contactPerson;
        default:
            return "";
    }
}

function statusPillClass(value: string): string {
    switch (value) {
        case "Active":
            return "bg-emerald-50 text-emerald-700 border-emerald-200";
        case "Potential Supplier":
            return "bg-orange-50 text-orange-700 border-orange-200";
        case "Evaluation Process":
            return "bg-blue-50 text-blue-700 border-blue-200";
        case "Rejected Supplier":
            return "bg-rose-50 text-rose-700 border-rose-200";
        default:
            return "bg-slate-50 text-slate-600 border-slate-200";
    }
}

function pillClass(value: string): string {
    if (["Low risk", "Completed", "Cleared"].includes(value))
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (["Medium risk", "In progress", "Potential discrepancy"].includes(value))
        return "bg-amber-50 text-amber-700 border-amber-200";
    if (["High risk", "Violation confirmed"].includes(value))
        return "bg-rose-50 text-rose-700 border-rose-200";
    if (["Unknown", "Waiting for SSA"].includes(value))
        return "bg-slate-100 text-slate-600 border-slate-200";
    return "bg-slate-50 text-slate-600 border-slate-200";
}

function strategicPillClass(value: string): string {
    if (value.includes("Preferred")) return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (value.includes("Strategic")) return "bg-blue-50 text-blue-700 border-blue-200";
    if (value.includes("Internal")) return "bg-violet-50 text-violet-700 border-violet-200";
    return "bg-slate-50 text-slate-600 border-slate-200";
}

function abcBadgeClass(value: string): string {
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
}

const Cell = React.memo(function Cell({ supplier, columnId, onCreateEvaluation }: { supplier: Supplier; columnId: ColumnId; onCreateEvaluation?: (supplierId: string) => void }) {
    const value = readColumnValue(supplier, columnId);
    switch (columnId) {
        case "supplier":
            return (
                <div className="flex items-center justify-between gap-2 min-w-0 w-full">
                    <Link
                        href={`/suppliers/${supplier.id}/overview`}
                        className="block min-w-0 flex-1 group/supplier"
                    >
                        <p
                            className="font-semibold text-slate-900 group-hover/supplier:text-primary group-hover/supplier:underline leading-snug truncate"
                            title={supplier.name}
                        >
                            {supplier.name}
                        </p>
                        <p className="font-mono text-[11px] text-slate-400 truncate mt-0.5" title={`#${supplier.id}`}>
                            #{supplier.id}
                        </p>
                    </Link>
                    <SupplierRowMenu
                        supplierId={supplier.id}
                        supplierName={supplier.name}
                        onCreateEvaluation={onCreateEvaluation}
                    />
                </div>
            );
        case "supplierId":
            return (
                <Link
                    href={`/suppliers/${supplier.id}/overview`}
                    className="font-mono text-xs font-medium text-slate-700 hover:text-primary hover:underline block truncate"
                    title={supplier.id}
                >
                    {supplier.id}
                </Link>
            );
        case "supplierName":
            return (
                <Link
                    href={`/suppliers/${supplier.id}/overview`}
                    className="font-semibold text-slate-900 hover:text-primary hover:underline block truncate leading-snug"
                    title={supplier.name}
                >
                    {supplier.name}
                </Link>
            );
        case "country":
            return (
                <span className="flex items-center gap-2 min-w-0">
                    <span className="text-base leading-none shrink-0">{flagEmoji(supplier.country)}</span>
                    <span className="font-medium text-slate-800 truncate" title={countryName(supplier.country)}>
                        {countryName(supplier.country)}
                    </span>
                </span>
            );
        case "orderVolume2025":
        case "orderVolume2024":
            return (
                <span className="font-semibold text-slate-900">
                    {fmtCurrency(Number(value) || 0)}
                </span>
            );
        case "abc":
            return (
                <span
                    className={cn(
                        "inline-flex h-6 w-6 items-center justify-center rounded-md text-sm font-black",
                        abcBadgeClass(String(value)),
                    )}
                >
                    {String(value)}
                </span>
            );
        case "status":
            return (
                <span
                    className={cn(
                        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                        statusPillClass(String(value)),
                    )}
                >
                    {String(value)}
                </span>
            );
        case "supplierType":
            return (
                <span className="text-slate-700">
                    {value ? String(value) : <span className="text-slate-300">—</span>}
                </span>
            );
        case "areaOfNeed":
            if (Array.isArray(value) && value.length > 0) {
                return (
                    <span className="flex flex-wrap gap-1">
                        {value.map((v) => (
                            <span
                                key={String(v)}
                                className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700"
                            >
                                {String(v)}
                            </span>
                        ))}
                    </span>
                );
            }
            return <span className="text-slate-300">—</span>;
        case "commodityGroup":
            return (
                <span className="text-slate-700">
                    {value ? String(value) : <span className="text-slate-300">—</span>}
                </span>
            );
        case "strategicClassification":
            return value ? (
                <span
                    className={cn(
                        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                        strategicPillClass(String(value)),
                    )}
                >
                    {String(value)}
                </span>
            ) : (
                <span className="text-slate-300">—</span>
            );
        case "esgAnalysisProgress":
        case "esgRiskStatus":
        case "incidentStatus":
            return value ? (
                <span
                    className={cn(
                        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                        pillClass(String(value)),
                    )}
                >
                    {String(value)}
                </span>
            ) : (
                <span className="text-slate-300">—</span>
            );
        case "egbAnalysisProgress":
        case "egbRiskStatus":
            return value ? (
                <span
                    className={cn(
                        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                        pillClass(String(value)),
                    )}
                >
                    {String(value)}
                </span>
            ) : (
                <span className="text-slate-300">—</span>
            );
        case "certIso9001":
        case "certIso13485":
        case "certIso45001":
        case "certIso17025":
        case "certCodeOfConduct":
        case "certNda":
        case "certIso14001":
            return value === "Existent" ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                    <Check className="h-3 w-3" /> Existent
                </span>
            ) : (
                <span className="italic text-slate-400">Non-existent</span>
            );
        case "internal":
        case "ssaSent":
        case "ssaReceived":
        case "ssaCompleted":
        case "supplierCreatedIn":
        case "reachRelevance":
        case "rohsRelevance":
            return value === true ? (
                <span className="inline-flex items-center text-emerald-600" title="Yes">
                    <Check className="h-4 w-4" />
                </span>
            ) : (
                <span className="text-slate-300">—</span>
            );
        case "responsibleBuyer":
            return (
                <span className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold uppercase text-slate-600">
                        {String(value).slice(0, 1) || "?"}
                    </span>
                    <span className="text-slate-700">{String(value) || "—"}</span>
                </span>
            );
        default:
            return (
                <span className="text-slate-700">
                    {value === "" || value === null || value === undefined ? "—" : String(value)}
                </span>
            );
    }
});

function navGroupsForViews(views: SupplierView[]) {
    const map = new Map<string, SupplierView[]>();
    for (const v of views) {
        const list = map.get(v.group) ?? [];
        list.push(v);
        map.set(v.group, list);
    }
    return Array.from(map.entries()).map(([group, list]) => ({ group, views: list }));
}

// Forward-declared helper used by SuppliersModule's toolbar.
// Opens the 2-step Add Filter popover starting at the field-selection step.
function NewFilterButton({ onAdd }: { onAdd: (rule: FilterRule) => void }) {
    return (
        <FilterBuilderPopover
            isNew
            onApply={(rule) => onAdd(rule)}
            trigger={
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 border-dashed text-slate-600"
                >
                    <Plus className="h-3.5 w-3.5" /> Add filter
                </Button>
            }
        />
    );
}

export function SuppliersModule({
    suppliers,
    views,
    defaultViewId,
    canManage,
    canImport,
}: SuppliersModuleProps) {
    const router = useRouter();
    const [activeViewId, setActiveViewId] = React.useState(defaultViewId);
    const [viewListCollapsed, setViewListCollapsed] = React.useState(false);
    const [filters, setFilters] = React.useState<FilterRule[]>([]);
    const [search, setSearch] = React.useState("");
    const [sort, setSort] = React.useState<{ id: ColumnId; dir: "asc" | "desc" } | null>(null);
    const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
    const [addOpen, setAddOpen] = React.useState(false);
    const [highlightedRowId, setHighlightedRowId] = React.useState<string | null>(null);
    const [activePresetId, setActivePresetId] = React.useState<string | null>(null);
    const [savedPresets, setSavedPresets] = React.useState<SavedPreset[]>([]);
    const [createEvalFor, setCreateEvalFor] = React.useState<{ id: string; name: string } | null>(null);
    const gridScrollRef = React.useRef<HTMLDivElement>(null);

    const handleCreateEvaluation = React.useCallback((supplierId: string) => {
        const row = suppliers.find((s) => s.id === supplierId);
        setCreateEvalFor({ id: supplierId, name: row?.name ?? "" });
    }, [suppliers]);

    const view = React.useMemo(
        () => views.find((v) => v.id === activeViewId) ?? views[0],
        [activeViewId, views],
    );

    const [visible, setVisible] = React.useState<Set<ColumnId>>(
        () => new Set((views.find((v) => v.id === defaultViewId) ?? views[0]).columns),
    );

    React.useEffect(() => {
        setFilters(view.filters.map((f) => ({ ...f })));
        setVisible(new Set(view.columns));
        setSort(view.defaultSort ? { ...view.defaultSort } : null);
        setSearch("");
        setSelectedIds(new Set());
        setActivePresetId(null);
    }, [view]);

    React.useEffect(() => {
        const handler = () => setActiveViewId(defaultViewId);
        window.addEventListener("suppliers:reset-to-default-view", handler);
        return () => window.removeEventListener("suppliers:reset-to-default-view", handler);
    }, [defaultViewId]);

    const viewPresets = React.useMemo(
        () => savedPresets.filter((p) => p.viewId === view.id),
        [savedPresets, view.id],
    );

    const viewCounts = React.useMemo(() => {
        const map: Record<string, number> = {};
        for (const v of views) map[v.id] = applyFilters(suppliers, v.filters).length;
        return map;
    }, [suppliers, views]);

    const visibleColumns = React.useMemo(
        () => view.columns.filter((id) => visible.has(id)),
        [view.columns, visible],
    );

    const filteredRows = React.useMemo(
        () => applyFilters(suppliers, filters).filter((row) => matchesSearch(row, search)),
        [suppliers, filters, search],
    );

    const sortedRows = React.useMemo(() => {
        if (!sort) return filteredRows;
        const copy = [...filteredRows];
        copy.sort((a, b) => {
            const av = readColumnValue(a, sort.id);
            const bv = readColumnValue(b, sort.id);
            let cmp = 0;
            if (typeof av === "number" && typeof bv === "number") cmp = av - bv;
            else cmp = String(av ?? "").localeCompare(String(bv ?? ""));
            return sort.dir === "asc" ? cmp : -cmp;
        });
        return copy;
    }, [filteredRows, sort]);

    const rowVirtualizer = useVirtualizer({
        count: sortedRows.length,
        getScrollElement: () => gridScrollRef.current,
        estimateSize: () => 60,
        overscan: 12,
    });

    const totalColumnWidth = React.useMemo(
        () => visibleColumns.reduce((w, id) => w + (COLUMN_WIDTHS[id] ?? 180), 60),
        [visibleColumns],
    );

    const columnVirtualizer = useVirtualizer({
        count: visibleColumns.length,
        getScrollElement: () => gridScrollRef.current,
        estimateSize: (index) => COLUMN_WIDTHS[visibleColumns[index] ?? "supplier"] ?? 180,
        horizontal: true,
        overscan: 4,
    });

    const virtualColumns = columnVirtualizer.getVirtualItems();
    const columnOffset = columnVirtualizer.getTotalSize();
    const columnStart = virtualColumns.length > 0 ? virtualColumns[0].start : 0;

    React.useEffect(() => {
        rowVirtualizer.measure();
    }, [rowVirtualizer, visibleColumns]);

    React.useEffect(() => {
        columnVirtualizer.measure();
    }, [columnVirtualizer, visibleColumns]);

    const toggleSort = (id: ColumnId) => {
        setSort((prev) => {
            if (!prev || prev.id !== id) return { id, dir: "asc" };
            if (prev.dir === "asc") return { id, dir: "desc" };
            return null;
        });
    };

    const toggleColumn = (id: ColumnId) =>
        setVisible((prev) => {
            if (id === "supplier") return prev;
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });

    const toggleAllColumns = (turnOn: boolean) => {
        setVisible(() => {
            if (!turnOn) {
                return new Set<ColumnId>(["supplier"]);
            }
            return new Set(view.columns);
        });
    };

    const resetView = () => {
        setFilters(view.filters.map((f) => ({ ...f })));
        setVisible(new Set(view.columns));
        setSort(view.defaultSort ? { ...view.defaultSort } : null);
        setSearch("");
        setActivePresetId(null);
    };

    const applyPreset = (preset: SavedPreset) => {
        setFilters(preset.filters.map((f) => ({ ...f })));
        setSort(preset.sort ? { ...preset.sort } : null);
        setSearch(preset.search ?? "");
        setActivePresetId(preset.id);
    };

    const saveCurrentAsPreset = (name: string) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        const id = `preset-${Date.now().toString(36)}`;
        const preset: SavedPreset = {
            id,
            name: trimmed,
            viewId: view.id,
            filters: filters.map((f) => ({ ...f })),
            sort: sort ? { ...sort } : null,
            search,
        };
        setSavedPresets((prev) => [...prev, preset]);
        setActivePresetId(id);
    };

    const deletePreset = (id: string) => {
        setSavedPresets((prev) => prev.filter((p) => p.id !== id));
        if (activePresetId === id) setActivePresetId(null);
    };

    const handleCreated = (newId: string) => {
        setAddOpen(false);
        if (newId && newId !== "__new__") {
            setHighlightedRowId(newId);
            window.setTimeout(() => setHighlightedRowId(null), 2400);
        }
        router.refresh();
    };

    const groups = React.useMemo(() => navGroupsForViews(views), [views]);

    return (
        <div className="flex h-full min-w-0 flex-col gap-4 overflow-hidden">
            <div className="flex shrink-0 flex-col gap-4">
                <nav className="flex items-center gap-1.5 text-sm text-slate-400">
                    <Link
                        href="/suppliers"
                        onClick={(event) => {
                            event.preventDefault();
                            setActiveViewId(defaultViewId);
                            if (activeViewId !== defaultViewId || window.location.pathname !== "/suppliers") {
                                router.push("/suppliers");
                            }
                        }}
                        className="rounded px-1 -mx-1 transition-colors hover:text-slate-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    >
                        Suppliers
                    </Link>
                    <span>/</span>
                    <span className="font-semibold text-slate-800">{view.label}</span>
                </nav>
            </div>

            <div
                className={cn(
                    "grid min-h-0 flex-1 gap-4 overflow-hidden",
                    viewListCollapsed
                        ? "lg:grid-cols-[auto_minmax(0,1fr)]"
                        : "lg:grid-cols-[300px_minmax(0,1fr)]",
                )}
            >
            {viewListCollapsed ? (
                <div className="hidden lg:flex lg:items-start lg:pt-1">
                    <button
                        type="button"
                        onClick={() => setViewListCollapsed(false)}
                        title="Expand view list"
                        aria-label="Expand view list"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    >
                        <PanelLeftOpen className="h-4 w-4" />
                    </button>
                </div>
            ) : (
                <aside className="hidden min-h-0 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-sm lg:block">
                    <div className="mb-2 flex items-center justify-end">
                        <button
                            type="button"
                            onClick={() => setViewListCollapsed(true)}
                            title="Collapse view list"
                            aria-label="Collapse view list"
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                        >
                            <PanelLeftClose className="h-4 w-4" />
                        </button>
                    </div>
                    <nav className="space-y-5">
                        {groups.map((group) => (
                            <div key={group.group}>
                                <p className="mb-2 px-2 text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                                    {group.group}
                                </p>
                                <div className="space-y-0.5">
                                    {group.views.map((v) => {
                                        const active = v.id === activeViewId;
                                        return (
                                            <button
                                                key={v.id}
                                                type="button"
                                                onClick={() => setActiveViewId(v.id)}
                                                className={cn(
                                                    "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                                                    active
                                                        ? "bg-slate-900 font-semibold text-white"
                                                        : "text-slate-600 hover:bg-slate-100",
                                                )}
                                            >
                                                <span className="truncate">{v.label}</span>
                                                <span
                                                    className={cn(
                                                        "ml-2 shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                                                        active
                                                            ? "bg-white/15 text-white"
                                                            : "bg-slate-100 text-slate-500",
                                                    )}
                                                >
                                                    {viewCounts[v.id] ?? 0}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </nav>
                </aside>
            )}

            <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-hidden">
                <div className="shrink-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <PresetFilterDropdown
                                presets={viewPresets}
                                activePresetId={activePresetId}
                                onApply={applyPreset}
                                onSaveAs={saveCurrentAsPreset}
                                onDelete={deletePreset}
                            />
                            <NewFilterButton
                                onAdd={(rule) => {
                                    setFilters((prev) => [...prev, rule]);
                                }}
                            />
                            {filters.length > 0 ? (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="gap-1.5 text-slate-500"
                                    onClick={() => {
                                        setFilters([]);
                                        setActivePresetId(null);
                                    }}
                                >
                                    <X className="h-3.5 w-3.5" /> Clear filters
                                </Button>
                            ) : null}
                            {view.hasReset ? (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1.5"
                                    onClick={resetView}
                                >
                                    <RotateCcw className="h-3.5 w-3.5" /> Reset
                                </Button>
                            ) : null}
                        </div>

                        {filters.length > 0 ? (
                            <FilterChips filters={filters} onChange={setFilters} />
                        ) : null}

                        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                            <p className="text-xs text-slate-500">
                                {sortedRows.length === filteredRows.length
                                    ? `${sortedRows.length.toLocaleString("en-US")} row${sortedRows.length === 1 ? "" : "s"} shown`
                                    : `${sortedRows.length.toLocaleString("en-US")} of ${filteredRows.length.toLocaleString("en-US")} rows shown`}
                            </p>

                            <div className="flex flex-wrap items-center gap-2">
                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search…"
                                        className="w-48 pl-9"
                                    />
                                </div>

                                <Can permission="suppliers.manageTableSettings">
                                    <ColumnVisibilityMenu
                                        columns={view.columns}
                                        visible={visible}
                                        onToggle={toggleColumn}
                                        onToggleAll={toggleAllColumns}
                                    />
                                </Can>

                                <CanAnyMenu
                                    canManage={canManage}
                                    canImport={canImport}
                                    viewId={view.id}
                                />

                                <Can permission="suppliers.create">
                                    <AddNewSplitButton
                                        onAddSingle={() => setAddOpen(true)}
                                        onBulkImport={() => router.push("/suppliers/import")}
                                    />
                                </Can>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div
                        ref={gridScrollRef}
                        className="relative flex-1 overflow-auto contain-strict custom-table-scrollbar show-scrollbar"
                    >
                        <div
                            style={{
                                minWidth: totalColumnWidth,
                                width: totalColumnWidth,
                            }}
                        >
                            <div className="sticky top-0 z-20 flex border-b border-slate-200 bg-slate-50">
                                <div className="sticky left-0 z-30 flex w-12 shrink-0 items-center justify-start border-r border-slate-200 bg-slate-50 px-3 py-2.5">
                                    <Checkbox
                                        checked={
                                            sortedRows.length > 0 &&
                                            sortedRows.every((r) => selectedIds.has(r.id))
                                                ? true
                                                : sortedRows.some((r) => selectedIds.has(r.id))
                                                  ? "indeterminate"
                                                  : false
                                        }
                                        onCheckedChange={() => {
                                            const all =
                                                sortedRows.length > 0 &&
                                                sortedRows.every((r) => selectedIds.has(r.id));
                                            setSelectedIds(
                                                all
                                                    ? new Set()
                                                    : new Set(sortedRows.map((r) => r.id)),
                                            );
                                        }}
                                        aria-label="Select all"
                                    />
                                </div>
                                <div
                                    style={{
                                        position: "relative",
                                        height: 41,
                                        width: columnOffset,
                                        transform: `translateX(-${columnStart}px)`,
                                    }}
                                >
                                    {virtualColumns.map((vc) => {
                                        const id = visibleColumns[vc.index];
                                        if (!id) return null;
                                        const active = sort?.id === id;
                                        const align =
                                            COLUMN_ALIGN[id] === "right"
                                                ? "text-right"
                                                : COLUMN_ALIGN[id] === "center"
                                                  ? "text-center"
                                                  : "text-left";
                                        return (
                                            <div
                                                key={id}
                                                style={{
                                                    position: "absolute",
                                                    top: 0,
                                                    left: vc.start,
                                                    width: vc.size,
                                                    height: 41,
                                                }}
                                                className={cn(
                                                    "px-3 py-2.5 text-[11px] font-black uppercase tracking-wide text-slate-500",
                                                    align,
                                                )}
                                                title={COLUMN_LABELS[id]}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => toggleSort(id)}
                                                    className={cn(
                                                        "inline-flex w-full items-center gap-1 hover:text-slate-800",
                                                        active && "text-slate-900",
                                                    )}
                                                >
                                                    <span className="truncate">
                                                        {COLUMN_LABELS[id]}
                                                    </span>
                                                    {active ? (
                                                        sort?.dir === "asc" ? (
                                                            <ArrowUp className="h-3 w-3" />
                                                        ) : (
                                                            <ArrowDown className="h-3 w-3" />
                                                        )
                                                    ) : (
                                                        <ArrowUpDown className="h-3 w-3 text-slate-300" />
                                                    )}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {sortedRows.length === 0 ? (
                                <div className="px-6 py-16">
                                    <div className="flex flex-col items-center justify-center text-center">
                                        <Grid2x2 className="h-10 w-10 text-slate-300" />
                                        <p className="mt-3 text-base font-bold text-slate-900">
                                            No rows
                                        </p>
                                        <p className="mt-1 text-sm text-slate-400">
                                            There are no rows matching your filter.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    style={{
                                        height: rowVirtualizer.getTotalSize(),
                                        position: "relative",
                                        width: totalColumnWidth,
                                    }}
                                >
                                    {rowVirtualizer.getVirtualItems().map((vi) => {
                                        const row = sortedRows[vi.index];
                                        if (!row) return null;
                                        const selected = selectedIds.has(row.id);
                                        const highlighted = highlightedRowId === row.id;
                                        return (
                                            <div
                                                key={row.id}
                                                data-row-id={row.id}
                                                className={cn(
                                                    "group/row absolute left-0 top-0 flex border-b border-slate-100 text-sm hover:bg-slate-50/70",
                                                    selected && "bg-blue-50/40",
                                                    highlighted && "animate-row-highlight",
                                                )}
                                                style={{
                                                    height: vi.size,
                                                    transform: `translateY(${vi.start}px)`,
                                                    width: totalColumnWidth,
                                                    contain: "layout style paint",
                                                    contentVisibility: "auto",
                                                }}
                                            >
                                                <div className="sticky left-0 z-10 flex w-12 shrink-0 items-center justify-start border-r border-slate-100 bg-white px-3">
                                                    <Checkbox
                                                        checked={selected}
                                                        onCheckedChange={() => {
                                                            setSelectedIds((prev) => {
                                                                const next = new Set(prev);
                                                                if (next.has(row.id))
                                                                    next.delete(row.id);
                                                                else next.add(row.id);
                                                                return next;
                                                            });
                                                        }}
                                                        aria-label={`Select ${row.name}`}
                                                    />
                                                </div>
                                                <div
                                                    style={{
                                                        position: "relative",
                                                        height: vi.size,
                                                        width: columnOffset,
                                                        transform: `translateX(-${columnStart}px)`,
                                                    }}
                                                >
                                                    {virtualColumns.map((vc) => {
                                                        const id = visibleColumns[vc.index];
                                                        if (!id) return null;
                                                        const align =
                                                            COLUMN_ALIGN[id] === "right"
                                                                ? "justify-end text-right"
                                                                : COLUMN_ALIGN[id] === "center"
                                                                  ? "justify-center text-center"
                                                                  : "justify-start text-left";
                                                        return (
                                                            <div
                                                                key={id}
                                                                style={{
                                                                    position: "absolute",
                                                                    top: 0,
                                                                    left: vc.start,
                                                                    width: vc.size,
                                                                    height: vi.size,
                                                                }}
                                                                className={cn(
                                                                    "px-3.5 py-2.5 flex items-center min-w-0 overflow-hidden",
                                                                    align,
                                                                )}
                                                            >
                                                                <Cell supplier={row} columnId={id} onCreateEvaluation={handleCreateEvaluation} />
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        <BulkActionsMenu
                            selectedIds={selectedIds}
                            onClearSelection={() => setSelectedIds(new Set())}
                            actions={buildSupplierBulkActions({
                                suppliers,
                                onDeleted: () => setSelectedIds(new Set()),
                            })}
                            className="mr-4"
                        />
                    </div>
                </div>

                <div className="flex shrink-0 items-center justify-between border-t border-slate-200 bg-white px-3 py-2 text-sm text-slate-500">
                    <span>
                        Suppliers:{" "}
                        <span className="font-semibold text-slate-800">
                            {sortedRows.length.toLocaleString("en-US")}
                        </span>
                    </span>
                    {highlightedRowId ? (
                        <span className="text-xs text-orange-600">
                            Newly added row highlighted
                        </span>
                    ) : null}
                </div>

                <AddSupplierModal
                    open={addOpen}
                    onOpenChange={setAddOpen}
                    onCreated={handleCreated}
                />
                <CreateEvaluationModal
                    open={Boolean(createEvalFor)}
                    onOpenChange={(o) => {
                        if (!o) setCreateEvalFor(null);
                    }}
                    supplierId={createEvalFor?.id ?? ""}
                    supplierName={createEvalFor?.name}
                    onCreated={() => setCreateEvalFor(null)}
                />
            </div>
            </div>
        </div>
    );
}

const COLUMN_WIDTHS: Record<ColumnId, number> = {
    supplier: 340,
    supplierId: 220,
    supplierName: 280,
    country: 200,
    isicCode: 140,
    internal: 120,
    orderVolume2025: 170,
    orderVolume2024: 170,
    abc: 130,
    status: 180,
    supplierType: 160,
    areaOfNeed: 180,
    commodityGroup: 180,
    responsibleBuyer: 200,
    strategicClassification: 220,
    certIso9001: 140,
    certIso13485: 140,
    certIso45001: 140,
    certIso17025: 140,
    certCodeOfConduct: 200,
    certNda: 200,
    certIso14001: 140,
    ssaSent: 120,
    ssaReceived: 130,
    ssaCompleted: 130,
    supplierCreatedIn: 160,
    reachRelevance: 150,
    reachAffected: 160,
    reachNotes: 200,
    reachSupplierSpecific: 200,
    rohsRelevance: 150,
    rohsAffected: 160,
    rohsNote: 200,
    rohsSupplierSpecific: 200,
    esgAnalysisProgress: 180,
    esgRiskStatus: 160,
    concreteRisk: 200,
    humanRights: 160,
    workersRights: 160,
    environmental: 160,
    existingKnowledge: 220,
    incidentStatus: 200,
    incidentCategory: 180,
    incidentJustification: 240,
    incidentSources: 200,
    egbAnalysisProgress: 200,
    egbRiskStatus: 180,
    egbImplementation1: 180,
    egbImplementation2: 180,
    egbImplementation3: 180,
    contactPerson: 200,
};

const COLUMN_ALIGN: Partial<Record<ColumnId, "left" | "right" | "center">> = {
    supplierId: "left",
    internal: "center",
    abc: "center",
    orderVolume2025: "right",
    orderVolume2024: "right",
    ssaSent: "center",
    ssaReceived: "center",
    ssaCompleted: "center",
    supplierCreatedIn: "center",
    reachRelevance: "center",
    rohsRelevance: "center",
    certIso9001: "center",
    certIso13485: "center",
    certIso45001: "center",
    certIso17025: "center",
    certCodeOfConduct: "center",
    certNda: "center",
    certIso14001: "center",
};

const COLUMN_LABELS: Record<ColumnId, string> = {
    supplier: "Supplier",
    supplierId: "Supplier ID",
    supplierName: "Supplier Name",
    country: "Country",
    isicCode: "ISIC Code",
    internal: "Internal",
    orderVolume2025: "Order Volume 2025",
    orderVolume2024: "Order Volume 2024",
    abc: "ABC Classification Order Volume",
    status: "Supplier Status",
    supplierType: "Supplier Type",
    areaOfNeed: "Area of Need",
    commodityGroup: "Commodity Group",
    responsibleBuyer: "Responsible Buyer",
    strategicClassification: "Strategic Classification (Prettl Pyramid)",
    certIso9001: "ISO 9001",
    certIso13485: "ISO 13485",
    certIso45001: "ISO 45001",
    certIso17025: "ISO 17025",
    certCodeOfConduct: "Verhaltenskodex (Code of Conduct)",
    certNda: "Vertraulichkeitsvereinbarung (NDA)",
    certIso14001: "ISO 14001",
    ssaSent: "SSA sent",
    ssaReceived: "SSA received",
    ssaCompleted: "SSA completed",
    supplierCreatedIn: "Supplier created in …",
    reachRelevance: "REACH relevance",
    reachAffected: "REACH affected",
    reachNotes: "REACH Notes",
    reachSupplierSpecific: "Supplier specific note (REACH)",
    rohsRelevance: "RoHS relevance",
    rohsAffected: "RoHS affected",
    rohsNote: "RoHS Note",
    rohsSupplierSpecific: "Supplier specific note (RoHS)",
    esgAnalysisProgress: "ESG Analysis Progress",
    esgRiskStatus: "ESG Risk Status",
    concreteRisk: "Concrete Risk",
    humanRights: "Human Rights",
    workersRights: "Workers Rights",
    environmental: "Environmental",
    existingKnowledge: "Existing Knowledge & Expertise",
    incidentStatus: "Status",
    incidentCategory: "Category",
    incidentJustification: "Brief justification",
    incidentSources: "Sources",
    egbAnalysisProgress: "Analysis progress (EGB)",
    egbRiskStatus: "Risk Status (EGB)",
    egbImplementation1: "Implementation 1",
    egbImplementation2: "Implementation 2",
    egbImplementation3: "Implementation 3",
    contactPerson: "Contact Person",
};

function ColumnVisibilityMenu({
    columns,
    visible,
    onToggle,
    onToggleAll,
}: {
    columns: ColumnId[];
    visible: Set<ColumnId>;
    onToggle: (id: ColumnId) => void;
    onToggleAll?: (turnOn: boolean) => void;
}) {
    const [search, setSearch] = React.useState("");
    const enabled = columns.filter((id) => visible.has(id)).length;
    const allOn = enabled === columns.length;
    const filtered = React.useMemo(
        () =>
            columns.filter((id) =>
                search
                    ? COLUMN_LABELS[id].toLowerCase().includes(search.toLowerCase())
                    : true,
            ),
        [columns, search],
    );

    return (
        <Popover.Root>
            <Popover.Trigger asChild>
                <Button variant="outline" size="sm" className="gap-2 font-medium">
                    Columns {enabled}/{columns.length}
                    <ChevronDown className="h-3.5 w-3.5" />
                </Button>
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content
                    align="end"
                    sideOffset={6}
                    className="z-50 w-80 rounded-xl border border-slate-200 bg-white p-2 shadow-xl"
                >
                    <p className="px-2 py-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                        Visible columns
                    </p>
                    <div className="mb-1 px-2">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search…"
                                className="h-7 pl-7 text-xs"
                            />
                        </div>
                    </div>
                    <div className="max-h-72 space-y-0.5 overflow-auto">
                        <label className="flex cursor-pointer items-center gap-2 rounded-md border-b border-slate-100 px-2 py-1.5 text-sm font-semibold text-slate-800 hover:bg-slate-50">
                            <Checkbox
                                checked={allOn}
                                onCheckedChange={() => onToggleAll?.(!allOn)}
                            />
                            Select all
                        </label>
                        {filtered.map((id) => (
                            <label
                                key={id}
                                className={cn(
                                    "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-slate-50",
                                    id === "supplier" && "opacity-60",
                                )}
                            >
                                <Checkbox
                                    checked={visible.has(id)}
                                    disabled={id === "supplier"}
                                    onCheckedChange={() => onToggle(id)}
                                />
                                <span className="truncate" title={COLUMN_LABELS[id]}>
                                    {COLUMN_LABELS[id]}
                                </span>
                            </label>
                        ))}
                    </div>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}

function CanAnyMenu({
    canManage,
    canImport,
    viewId,
}: {
    canManage: boolean;
    canImport: boolean;
    viewId: string;
}) {
    if (!canManage) {
        return (
            <Popover.Root>
                <Popover.Trigger asChild>
                    <Button variant="outline" size="sm" className="px-2" aria-label="More options">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </Popover.Trigger>
                <Popover.Portal>
                    <Popover.Content
                        align="end"
                        sideOffset={6}
                        className="z-50 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"
                    >
                        <p className="px-2 py-1.5 text-xs text-slate-400">
                            No additional actions available for your role.
                        </p>
                    </Popover.Content>
                </Popover.Portal>
            </Popover.Root>
        );
    }
    return (
        <Popover.Root>
            <Popover.Trigger asChild>
                <Button variant="outline" size="sm" className="px-2" aria-label="More options">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content
                    align="end"
                    sideOffset={6}
                    className="z-50 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"
                >
                    <Link
                        href={`/suppliers/views/${viewId}/settings`}
                        className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                        <Settings className="h-4 w-4" /> Table settings
                    </Link>
                    <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        onClick={() => {
                            // user-controlled revert handled by Reset button
                        }}
                    >
                        <RotateCcw className="h-4 w-4" /> Revert changes
                    </button>
                    {canImport ? (
                        <Link
                            href="/suppliers/import"
                            className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                            <FileSpreadsheet className="h-4 w-4" /> Import wizard
                        </Link>
                    ) : null}
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}

function AddNewSplitButton({
    onAddSingle,
    onBulkImport,
}: {
    onAddSingle: () => void;
    onBulkImport: () => void;
}) {
    return (
        <DropdownMenu>
            <div className="inline-flex">
                <Button size="sm" className="gap-1.5 rounded-r-none" onClick={onAddSingle}>
                    <Plus className="h-4 w-4" /> Add new
                </Button>
                <DropdownMenuTrigger asChild>
                    <Button
                        size="sm"
                        className="rounded-l-none border-l border-white/30 px-2"
                        aria-label="More create options"
                    >
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
            </div>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                    className="gap-2"
                    onSelect={(event) => {
                        event.preventDefault();
                        onAddSingle();
                    }}
                >
                    <Plus className="h-4 w-4" />
                    Add single Supplier
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="gap-2"
                    onSelect={(event) => {
                        event.preventDefault();
                        onBulkImport();
                    }}
                >
                    <Upload className="h-4 w-4" />
                    Bulk import Suppliers
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// ---------------------------------------------------------------------------
// Preset Filter Dropdown (BUG 1 fix)
// ---------------------------------------------------------------------------

function PresetFilterDropdown({
    presets,
    activePresetId,
    onApply,
    onSaveAs,
    onDelete,
}: {
    presets: SavedPreset[];
    activePresetId: string | null;
    onApply: (preset: SavedPreset) => void;
    onSaveAs: (name: string) => void;
    onDelete: (id: string) => void;
}) {
    const [open, setOpen] = React.useState(false);
    const [saveOpen, setSaveOpen] = React.useState(false);
    const [draftName, setDraftName] = React.useState("");
    const active = presets.find((p) => p.id === activePresetId);

    return (
        <Popover.Root
            open={open}
            onOpenChange={(v) => {
                setOpen(v);
                if (!v) {
                    setSaveOpen(false);
                    setDraftName("");
                }
            }}
        >
            <Popover.Trigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                        "gap-2 font-medium",
                        active
                            ? "border-primary/40 bg-primary/5 text-primary"
                            : "border-slate-300 text-slate-700",
                    )}
                >
                    <Filter className="h-3.5 w-3.5" />
                    {active ? active.name : "No preset filter"}
                    <ChevronDown className="h-3.5 w-3.5" />
                </Button>
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content
                    align="start"
                    sideOffset={6}
                    className="z-50 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-xl"
                >
                    <p className="px-2 py-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                        Saved presets
                    </p>
                    {presets.length === 0 ? (
                        <p className="px-2 py-3 text-sm text-slate-500">
                            No preset filter.{" "}
                            <button
                                type="button"
                                className="font-semibold text-primary hover:underline"
                                onClick={() => setSaveOpen(true)}
                            >
                                Save current as preset
                            </button>
                        </p>
                    ) : (
                        <div className="max-h-56 space-y-0.5 overflow-auto">
                            {presets.map((p) => (
                                <div
                                    key={p.id}
                                    className={cn(
                                        "group flex items-center gap-1 rounded-md px-2 py-1.5 text-sm hover:bg-slate-50",
                                        p.id === activePresetId && "bg-slate-100",
                                    )}
                                >
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onApply(p);
                                            setOpen(false);
                                        }}
                                        className="flex-1 truncate text-left font-medium text-slate-800"
                                    >
                                        {p.name}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onDelete(p.id)}
                                        className="rounded p-1 text-slate-300 hover:bg-rose-50 hover:text-rose-600"
                                        aria-label={`Delete preset ${p.name}`}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-2 border-t border-slate-100 pt-2">
                        {saveOpen ? (
                            <div className="flex items-center gap-1.5 px-1">
                                <Input
                                    autoFocus
                                    value={draftName}
                                    onChange={(e) => setDraftName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            onSaveAs(draftName);
                                            setDraftName("");
                                            setSaveOpen(false);
                                            setOpen(false);
                                        } else if (e.key === "Escape") {
                                            setSaveOpen(false);
                                            setDraftName("");
                                        }
                                    }}
                                    placeholder="Preset name"
                                    className="h-8 text-sm"
                                />
                                <Button
                                    size="sm"
                                    className="h-8"
                                    onClick={() => {
                                        onSaveAs(draftName);
                                        setDraftName("");
                                        setSaveOpen(false);
                                        setOpen(false);
                                    }}
                                    disabled={!draftName.trim()}
                                >
                                    Save
                                </Button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setSaveOpen(true)}
                                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-primary hover:bg-primary/5"
                            >
                                <BookmarkPlus className="h-3.5 w-3.5" />
                                Save current as preset
                            </button>
                        )}
                    </div>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}

// ---------------------------------------------------------------------------
// Filter chips + 2-step Add Filter popover (BUG 2 fix)
// ---------------------------------------------------------------------------

function chipValueText(rule: FilterRule): string {
    if (rule.operator === "is_blank") return "(empty)";
    if (rule.operator === "is_not_blank") return "(not empty)";
    if (rule.operator === "equals" && typeof rule.value === "boolean") return rule.value ? "Yes" : "No";
    if (Array.isArray(rule.value)) {
        if (rule.value.length === 0) return "(any)";
        if (rule.value.length <= 2) return rule.value.join(", ");
        return `${rule.value.length} selected`;
    }
    return String(rule.value);
}

function FilterChips({
    filters,
    onChange,
}: {
    filters: FilterRule[];
    onChange: (next: FilterRule[]) => void;
}) {
    return (
        <div className="flex flex-wrap items-center gap-1.5">
            {filters.map((rule, index) => (
                <React.Fragment key={index}>
                    {index > 0 ? (
                        <button
                            type="button"
                            onClick={() =>
                                onChange(
                                    filters.map((r, i) =>
                                        i === index
                                            ? { ...r, connector: r.connector === "and" ? "or" : "and" }
                                            : r,
                                    ),
                                )
                            }
                            className={cn(
                                "rounded-md px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wide",
                                rule.connector === "or"
                                    ? "bg-violet-100 text-violet-700"
                                    : "bg-slate-100 text-slate-500",
                            )}
                            title="Toggle connector"
                        >
                            {rule.connector}
                        </button>
                    ) : null}
                    <FilterChip rule={rule} onChange={(next) => {
                        onChange(filters.map((r, i) => (i === index ? next : r)));
                    }} onRemove={() => onChange(filters.filter((_, i) => i !== index))} />
                </React.Fragment>
            ))}
        </div>
    );
}

function FilterChip({
    rule,
    onChange,
    onRemove,
}: {
    rule: FilterRule;
    onChange: (next: FilterRule) => void;
    onRemove: () => void;
}) {
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white py-0.5 pl-2.5 pr-1 text-xs">
            <span className="font-semibold text-slate-700">{FILTER_FIELD_LABELS[rule.field]}</span>
            <span className="text-slate-400">{OPERATOR_LABELS[rule.operator]}</span>
            <span className="font-medium text-slate-900">{chipValueText(rule)}</span>
            <FilterBuilderPopover
                initialRule={rule}
                onApply={onChange}
                trigger={
                    <button
                        type="button"
                        className="rounded p-0.5 text-slate-400 hover:bg-slate-100"
                        title="Edit filter"
                    >
                        <Filter className="h-3 w-3" />
                    </button>
                }
            />
            <button
                type="button"
                onClick={onRemove}
                className="rounded p-0.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                aria-label="Remove filter"
            >
                <X className="h-3 w-3" />
            </button>
        </span>
    );
}

function FilterBuilderPopover({
    initialRule,
    isNew,
    onApply,
    trigger,
}: {
    initialRule?: FilterRule;
    isNew?: boolean;
    onApply: (next: FilterRule) => void;
    trigger: React.ReactNode;
}) {
    const fallbackRule: FilterRule = {
        field: "supplierId",
        operator: "contains",
        value: "",
        connector: "and",
    };
    const seed = initialRule ?? fallbackRule;

    const [step, setStep] = React.useState<"field" | "operator">(
        isNew ? "field" : "operator",
    );
    const [field, setField] = React.useState<FilterFieldKey>(seed.field);
    const [operator, setOperator] = React.useState<FilterOperator>(seed.operator);
    const [value, setValue] = React.useState<unknown>(seed.value);
    const [search, setSearch] = React.useState("");
    const [open, setOpen] = React.useState(false);

    const kind = FILTER_FIELD_KIND[field];
    const options = FILTER_FIELD_OPTIONS[field] ?? [];

    const apply = () => {
        onApply({ field, operator, value: value as never, connector: seed.connector });
        setOpen(false);
    };

    const fieldList = (Object.keys(FILTER_FIELD_LABELS) as FilterFieldKey[]).filter((key) =>
        search
            ? FILTER_FIELD_LABELS[key].toLowerCase().includes(search.toLowerCase())
            : true,
    );

    return (
        <Popover.Root
            open={open}
            onOpenChange={(v) => {
                setOpen(v);
                if (v) {
                    setStep(isNew ? "field" : "operator");
                    setSearch("");
                }
            }}
        >
            <Popover.Trigger asChild>{trigger}</Popover.Trigger>
            <Popover.Portal>
                <Popover.Content
                    align="start"
                    sideOffset={6}
                    className="z-50 w-80 rounded-xl border border-slate-200 bg-white p-2 shadow-xl"
                >
                    <div className="flex items-center justify-between border-b border-slate-100 px-2 pb-2">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                            {step === "field" ? "Select field" : "Edit filter"}
                        </p>
                        {step === "operator" ? (
                            <button
                                type="button"
                                className="text-[11px] font-semibold text-primary hover:underline"
                                onClick={() => setStep("field")}
                            >
                                Change field
                            </button>
                        ) : null}
                    </div>

                    {step === "field" ? (
                        <div className="p-2">
                            <div className="relative mb-2">
                                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search fields…"
                                    className="h-8 pl-7 text-xs"
                                />
                            </div>
                            <div className="max-h-72 space-y-0.5 overflow-auto">
                                {fieldList.map((key) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => {
                                            setField(key);
                                            const newKind = FILTER_FIELD_KIND[key];
                                            const ops = OPERATORS_BY_KIND[newKind] ?? [];
                                            const nextOp = ops.includes(operator)
                                                ? operator
                                                : ops[0] ?? "equals";
                                            setOperator(nextOp);
                                            // Seed a sensible default value for the new field
                                            if (newKind === "categorical" || newKind === "country") {
                                                setValue(
                                                    (FILTER_FIELD_OPTIONS[key] ?? [])[0] ?? "",
                                                );
                                            } else if (newKind === "boolean") {
                                                setValue(true);
                                            } else if (newKind === "number") {
                                                setValue(0);
                                            } else {
                                                setValue("");
                                            }
                                            setStep("operator");
                                        }}
                                        className={cn(
                                            "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-slate-50",
                                            key === field && "bg-slate-100 font-semibold",
                                        )}
                                    >
                                        <span>{FILTER_FIELD_LABELS[key]}</span>
                                        <span className="text-[10px] uppercase tracking-wide text-slate-400">
                                            {FILTER_FIELD_KIND[key]}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3 p-3">
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                                    Field
                                </label>
                                <div className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm font-medium text-slate-800">
                                    {FILTER_FIELD_LABELS[field]}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                                    Operator
                                </label>
                                <select
                                    className="h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-sm"
                                    value={operator}
                                    onChange={(e) => {
                                        const next = e.target.value as FilterOperator;
                                        setOperator(next);
                                        if (next === "is_blank" || next === "is_not_blank") {
                                            setValue(null);
                                        }
                                    }}
                                >
                                    {(OPERATORS_BY_KIND[kind] ?? []).map((op) => (
                                        <option key={op} value={op}>
                                            {OPERATOR_LABELS[op]}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {operator !== "is_blank" && operator !== "is_not_blank" ? (
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                                        Value
                                    </label>
                                    {kind === "categorical" || kind === "country" ? (
                                        <div className="max-h-40 space-y-1 overflow-auto rounded-md border border-slate-200 p-2">
                                            {options.map((opt) => {
                                                const current = Array.isArray(value)
                                                    ? value
                                                    : [];
                                                const checked = current.includes(opt);
                                                const isMulti =
                                                    operator === "is_one_of" ||
                                                    operator === "is_none_of";
                                                return (
                                                    <label
                                                        key={opt}
                                                        className="flex cursor-pointer items-center gap-2 text-sm"
                                                    >
                                                        {isMulti ? (
                                                            <Checkbox
                                                                checked={checked}
                                                                onCheckedChange={(c) => {
                                                                    const set = new Set(
                                                                        current as string[],
                                                                    );
                                                                    if (c) set.add(opt);
                                                                    else set.delete(opt);
                                                                    setValue(Array.from(set));
                                                                }}
                                                            />
                                                        ) : (
                                                            <input
                                                                type="radio"
                                                                name={`filter-${field}`}
                                                                checked={checked}
                                                                onChange={() => setValue(opt)}
                                                                className="h-3.5 w-3.5 accent-primary"
                                                            />
                                                        )}
                                                        {opt}
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    ) : kind === "boolean" ? (
                                        <select
                                            className="h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-sm"
                                            value={value === true ? "true" : "false"}
                                            onChange={(e) => setValue(e.target.value === "true")}
                                        >
                                            <option value="true">Yes</option>
                                            <option value="false">No</option>
                                        </select>
                                    ) : kind === "number" ? (
                                        <Input
                                            type="number"
                                            className="h-9"
                                            value={Number(value) || 0}
                                            onChange={(e) =>
                                                setValue(Number(e.target.value))
                                            }
                                        />
                                    ) : (
                                        <Input
                                            className="h-9"
                                            value={String(value ?? "")}
                                            onChange={(e) => setValue(e.target.value)}
                                            placeholder="Enter value…"
                                        />
                                    )}
                                </div>
                            ) : null}

                            <div className="flex justify-end gap-2 pt-1">
                                <Button size="sm" onClick={apply}>
                                    Apply
                                </Button>
                            </div>
                        </div>
                    )}
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}