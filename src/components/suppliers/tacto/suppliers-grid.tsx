"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as Popover from "@radix-ui/react-popover";
import * as XLSX from "xlsx";
import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    Check,
    ChevronDown,
    Download,
    Grid2x2,
    MoreVertical,
    Plus,
    RotateCcw,
    Search,
    Upload,
    X,
    FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddSupplierModal } from "@/components/suppliers/add-supplier-modal";
import {
    type ColumnId,
    type FilterFieldKey,
    type FilterOperator,
    type FilterRule,
    type RawValue,
    type Supplier,
    type SupplierView,
    FILTER_FIELD_KIND,
    FILTER_FIELD_LABELS,
    FILTER_FIELD_OPTIONS,
    OPERATOR_LABELS,
    SUPPLIER_COLUMNS,
    SUPPLIER_VIEWS,
    getFieldValue,
    getNavGroups,
    getView,
} from "./suppliers-model";
import { MOCK_SUPPLIERS } from "./suppliers-mock-data";

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

const currencyFmt = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
});

function fmtCurrency(value: number): string {
    return currencyFmt.format(value);
}

function flagEmoji(code: string): string {
    if (!/^[A-Za-z]{2}$/.test(code)) return "🌐";
    const normalized = code.toUpperCase();
    return String.fromCodePoint(...normalized.split("").map((c) => 127397 + c.charCodeAt(0)));
}

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

function countryName(code: string): string {
    try {
        return regionNames.of(code.toUpperCase()) ?? code;
    } catch {
        return code;
    }
}

function isBlank(value: RawValue): boolean {
    if (value === null || value === undefined) return true;
    if (typeof value === "string") return value.trim() === "";
    if (typeof value === "boolean") return value === false;
    if (Array.isArray(value)) return value.length === 0;
    return false;
}

// ---------------------------------------------------------------------------
// Filter engine
// ---------------------------------------------------------------------------

function evalRule(supplier: Supplier, rule: FilterRule): boolean {
    const raw = getFieldValue(supplier, rule.field);
    switch (rule.operator) {
        case "is_one_of": {
            const allowed = Array.isArray(rule.value) ? rule.value : [String(rule.value)];
            if (Array.isArray(raw)) return raw.some((v) => allowed.includes(v));
            return allowed.includes(String(raw));
        }
        case "is_none_of": {
            const denied = Array.isArray(rule.value) ? rule.value : [String(rule.value)];
            if (Array.isArray(raw)) return !raw.some((v) => denied.includes(v));
            return !denied.includes(String(raw));
        }
        case "equals":
            return raw === rule.value;
        case "gte":
            return Number(raw) >= Number(rule.value);
        case "is_blank":
            return isBlank(raw);
        case "is_not_blank":
            return !isBlank(raw);
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
        countryName(supplier.country),
        supplier.country,
        supplier.commodityGroup,
        supplier.responsibleBuyer,
        supplier.strategicClassification,
        supplier.supplierStatus,
        supplier.esg.riskStatus,
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
    return haystack.includes(q);
}

// ---------------------------------------------------------------------------
// Pill / badge styling
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Cell rendering
// ---------------------------------------------------------------------------

function Cell({ supplier, columnId }: { supplier: Supplier; columnId: ColumnId }) {
    const col = SUPPLIER_COLUMNS[columnId];
    const value = readColumnValue(supplier, columnId);

    switch (col.type) {
        case "country":
            return (
                <span className="flex items-center gap-2">
                    <span className="text-base leading-none">{flagEmoji(supplier.country)}</span>
                    <span className="font-medium text-slate-800">{countryName(supplier.country)}</span>
                </span>
            );
        case "currency":
            return <span className="font-semibold text-slate-900">{fmtCurrency(value as number)}</span>;
        case "number":
            return <span className="tabular-nums text-slate-700">{String(value)}</span>;
        case "abc":
            return (
                <span className={cn("inline-flex h-6 w-6 items-center justify-center rounded-md text-sm font-black", abcBadgeClass(String(value)))}>
                    {value}
                </span>
            );
        case "statusPill":
            return <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold", statusPillClass(String(value)))}>{value}</span>;
        case "strategicPill":
            return value ? (
                <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold", strategicPillClass(String(value)))}>
                    {value}
                </span>
            ) : (
                <span className="text-slate-300">—</span>
            );
        case "pill":
            return value ? (
                <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold", pillClass(String(value)))}>
                    {value}
                </span>
            ) : (
                <span className="text-slate-300">—</span>
            );
        case "certificate":
            return value === "Existent" ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                    <Check className="h-3 w-3" /> Existent
                </span>
            ) : (
                <span className="italic text-slate-400">Non-existent</span>
            );
        case "boolean":
            return value === true ? (
                <span className="inline-flex items-center text-emerald-600" title="Yes">
                    <Check className="h-4 w-4" />
                </span>
            ) : (
                <span className="text-slate-300">—</span>
            );
        case "buyer":
            return (
                <span className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold uppercase text-slate-600">
                        {String(value).slice(0, 1) || "?"}
                    </span>
                    <span className="text-slate-700">{value || "—"}</span>
                </span>
            );
        default:
            return <span className="text-slate-700">{value === "" ? "—" : String(value)}</span>;
    }
}

function readColumnValue(supplier: Supplier, columnId: ColumnId): RawValue {
    switch (columnId) {
        case "supplier":
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

function sortValue(supplier: Supplier, columnId: ColumnId): string | number {
    const raw = readColumnValue(supplier, columnId);
    if (typeof raw === "boolean") return raw ? 1 : 0;
    if (typeof raw === "number") return raw;
    if (columnId === "supplier") return supplier.name.toLowerCase();
    return String(raw).toLowerCase();
}

function cellTextForExport(supplier: Supplier, columnId: ColumnId): string {
    const raw = readColumnValue(supplier, columnId);
    if (typeof raw === "boolean") return raw ? "Yes" : "";
    if (columnId === "supplier") return `${supplier.id} ${supplier.name}`;
    return String(raw);
}

// ---------------------------------------------------------------------------
// Filter chip value text
// ---------------------------------------------------------------------------

function chipValueText(rule: FilterRule): string {
    if (rule.operator === "is_blank") return "(Blanks)";
    if (rule.operator === "is_not_blank") return "(not blank)";
    if (rule.operator === "equals" && typeof rule.value === "boolean") return rule.value ? "✅" : "—";
    if (Array.isArray(rule.value)) return rule.value.join(", ");
    return String(rule.value);
}

// ---------------------------------------------------------------------------
// Filter editor (shared by chips + Add filter)
// ---------------------------------------------------------------------------

const OPERATORS_BY_KIND: Record<string, FilterOperator[]> = {
    categorical: ["is_one_of", "is_none_of", "is_blank", "is_not_blank"],
    boolean: ["equals", "is_blank", "is_not_blank"],
    number: ["equals", "gte", "is_blank", "is_not_blank"],
};

function FilterEditor({
    rule,
    onApply,
    onRemove,
    showFieldSelect,
}: {
    rule: FilterRule;
    onApply: (next: FilterRule) => void;
    onRemove?: () => void;
    showFieldSelect?: boolean;
}) {
    const [field, setField] = React.useState<FilterFieldKey>(rule.field);
    const [operator, setOperator] = React.useState<FilterOperator>(rule.operator);
    const [value, setValue] = React.useState<RawValue>(rule.value);

    const kind = FILTER_FIELD_KIND[field];
    const options = FILTER_FIELD_OPTIONS[field] ?? [];

    const changeField = (next: FilterFieldKey) => {
        setField(next);
        const nextKind = FILTER_FIELD_KIND[next];
        const nextOps = OPERATORS_BY_KIND[nextKind];
        const nextOp = nextOps.includes(operator) ? operator : nextOps[0];
        setOperator(nextOp);
        if (nextKind === "categorical") setValue([...(FILTER_FIELD_OPTIONS[next] ?? [])][0] ?? "");
        else if (nextKind === "boolean") setValue(true);
        else if (nextKind === "number") setValue(0);
        else setValue("");
    };

    const apply = () => onApply({ field, operator, value, connector: rule.connector });

    return (
        <div className="w-72 space-y-3 p-3">
            {showFieldSelect ? (
                <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Field</label>
                    <select
                        className="h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-sm"
                        value={field}
                        onChange={(e) => changeField(e.target.value as FilterFieldKey)}
                    >
                        {(Object.keys(FILTER_FIELD_LABELS) as FilterFieldKey[]).map((key) => (
                            <option key={key} value={key}>
                                {FILTER_FIELD_LABELS[key]}
                            </option>
                        ))}
                    </select>
                </div>
            ) : null}

            <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Operator</label>
                <select
                    className="h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-sm"
                    value={operator}
                    onChange={(e) => setOperator(e.target.value as FilterOperator)}
                >
                    {OPERATORS_BY_KIND[kind].map((op) => (
                        <option key={op} value={op}>
                            {OPERATOR_LABELS[op]}
                        </option>
                    ))}
                </select>
            </div>

            {operator !== "is_blank" && operator !== "is_not_blank" ? (
                <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Value</label>
                    {kind === "categorical" ? (
                        <div className="max-h-44 space-y-1 overflow-auto rounded-md border border-slate-200 p-2">
                            {options.map((opt) => {
                                const current = Array.isArray(value) ? value : [];
                                const checked = current.includes(opt);
                                return (
                                    <label key={opt} className="flex cursor-pointer items-center gap-2 text-sm">
                                        <Checkbox
                                            checked={checked}
                                            onCheckedChange={(c) => {
                                                const set = new Set(current);
                                                if (c) set.add(opt);
                                                else set.delete(opt);
                                                setValue(Array.from(set));
                                            }}
                                        />
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
                            <option value="true">✅</option>
                            <option value="false">—</option>
                        </select>
                    ) : (
                        <Input
                            type="number"
                            className="h-9"
                            value={Number(value) || 0}
                            onChange={(e) => setValue(Number(e.target.value))}
                        />
                    )}
                </div>
            ) : null}

            <div className="flex items-center justify-between pt-1">
                <div className="flex gap-2">
                    <Button size="sm" onClick={apply}>
                        Apply
                    </Button>
                    {onRemove ? (
                        <Button size="sm" variant="ghost" className="text-rose-600" onClick={onRemove}>
                            <X className="h-3.5 w-3.5" /> Remove
                        </Button>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Column visibility panel
// ---------------------------------------------------------------------------

function ColumnVisibilityPanel({
    view,
    visible,
    onToggle,
}: {
    view: SupplierView;
    visible: Set<ColumnId>;
    onToggle: (id: ColumnId) => void;
}) {
    const enabled = view.columns.filter((id) => visible.has(id)).length;
    return (
        <Popover.Root>
            <Popover.Trigger asChild>
                <Button variant="outline" size="sm" className="gap-2 font-medium">
                    Columns {enabled}/{view.columns.length}
                    <ChevronDown className="h-3.5 w-3.5" />
                </Button>
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content align="end" sideOffset={6} className="z-50 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                    <p className="px-2 py-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">Visible columns</p>
                    <div className="max-h-72 space-y-0.5 overflow-auto">
                        {view.columns.map((id) => {
                            const col = SUPPLIER_COLUMNS[id];
                            return (
                                <label
                                    key={id}
                                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-slate-50"
                                >
                                    <Checkbox checked={visible.has(id)} onCheckedChange={() => onToggle(id)} />
                                    <span className="truncate" title={col.label}>
                                        {col.label}
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}

// ---------------------------------------------------------------------------
// Filter chips row
// ---------------------------------------------------------------------------

function FilterChips({
    filters,
    onChange,
}: {
    filters: FilterRule[];
    onChange: (next: FilterRule[]) => void;
}) {
    const update = (index: number, next: FilterRule, remove?: boolean) => {
        if (remove) {
            onChange(filters.filter((_, i) => i !== index));
            return;
        }
        onChange(filters.map((r, i) => (i === index ? next : r)));
    };

    if (filters.length === 0) {
        return (
            <Popover.Root>
                <Popover.Trigger asChild>
                    <Button variant="outline" size="sm" className="gap-1.5 border-dashed text-slate-500">
                        <Plus className="h-3.5 w-3.5" /> Add filter
                    </Button>
                </Popover.Trigger>
                <Popover.Portal>
                    <Popover.Content align="start" sideOffset={6} className="z-50 rounded-xl border border-slate-200 bg-white shadow-xl">
                        <FilterEditor
                            rule={{ field: "supplierStatus", operator: "is_one_of", value: ["Active"], connector: "and" }}
                            onApply={(next) => onChange([...filters, next])}
                        />
                    </Popover.Content>
                </Popover.Portal>
            </Popover.Root>
        );
    }

    return (
        <div className="flex flex-wrap items-center gap-2">
            {filters.map((rule, index) => (
                <React.Fragment key={index}>
                    {index > 0 ? (
                        <button
                            type="button"
                            onClick={() =>
                                onChange(
                                    filters.map((r, i) =>
                                        i === index ? { ...r, connector: r.connector === "and" ? "or" : "and" } : r,
                                    ),
                                )
                            }
                            className={cn(
                                "rounded-md px-2 py-1 text-[11px] font-bold uppercase tracking-wide",
                                rule.connector === "or"
                                    ? "bg-violet-50 text-violet-700"
                                    : "bg-slate-100 text-slate-500",
                            )}
                            title="Toggle connector"
                        >
                            {rule.connector}
                        </button>
                    ) : null}
                    <Popover.Root>
                        <Popover.Trigger asChild>
                            <button
                                type="button"
                                className="group inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs hover:border-slate-400"
                            >
                                <span className="font-semibold text-slate-500">{FILTER_FIELD_LABELS[rule.field]}</span>
                                <span className="text-slate-400">{OPERATOR_LABELS[rule.operator]}</span>
                                <span className="font-medium text-slate-800">{chipValueText(rule)}</span>
                                <Plus className="h-3 w-3 text-slate-400 group-hover:text-slate-600" />
                            </button>
                        </Popover.Trigger>
                        <Popover.Portal>
                            <Popover.Content align="start" sideOffset={6} className="z-50 rounded-xl border border-slate-200 bg-white shadow-xl">
                                <FilterEditor
                                    rule={rule}
                                    onApply={(next) => update(index, next)}
                                    onRemove={() => update(index, rule, true)}
                                />
                            </Popover.Content>
                        </Popover.Portal>
                    </Popover.Root>
                </React.Fragment>
            ))}
            <Popover.Root>
                <Popover.Trigger asChild>
                    <Button variant="outline" size="sm" className="gap-1.5 border-dashed text-slate-500">
                        <Plus className="h-3.5 w-3.5" /> Add filter
                    </Button>
                </Popover.Trigger>
                <Popover.Portal>
                    <Popover.Content align="start" sideOffset={6} className="z-50 rounded-xl border border-slate-200 bg-white shadow-xl">
                        <FilterEditor
                            rule={{ field: "supplierStatus", operator: "is_one_of", value: ["Active"], connector: "and" }}
                            showFieldSelect
                            onApply={(next) => onChange([...filters, next])}
                        />
                    </Popover.Content>
                </Popover.Portal>
            </Popover.Root>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------

function ViewsSidebar({
    activeViewId,
    counts,
    onSelect,
}: {
    activeViewId: string;
    counts: Record<string, number>;
    onSelect: (id: string) => void;
}) {
    const groups = getNavGroups();
    return (
        <nav className="space-y-5">
            {groups.map((group) => (
                <div key={group.group}>
                    <p className="mb-2 px-2 text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                        {group.group}
                    </p>
                    <div className="space-y-0.5">
                        {group.views.map((view) => {
                            const active = view.id === activeViewId;
                            return (
                                <button
                                    key={view.id}
                                    type="button"
                                    onClick={() => onSelect(view.id)}
                                    className={cn(
                                        "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                                        active
                                            ? "bg-slate-900 font-semibold text-white"
                                            : "text-slate-600 hover:bg-slate-100",
                                    )}
                                >
                                    <span className="truncate">{view.label}</span>
                                    <span
                                        className={cn(
                                            "ml-2 shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                                            active ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500",
                                        )}
                                    >
                                        {counts[view.id] ?? 0}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </nav>
    );
}

// ---------------------------------------------------------------------------
// Main grid
// ---------------------------------------------------------------------------

export function SuppliersGrid({ data = MOCK_SUPPLIERS, viewId }: { data?: Supplier[]; viewId?: string }) {
    const [activeViewId, setActiveViewId] = React.useState<string>(viewId ?? SUPPLIER_VIEWS[0].id);
    const [filters, setFilters] = React.useState<FilterRule[]>([]);
    const [search, setSearch] = React.useState("");
    const [sort, setSort] = React.useState<{ id: ColumnId; dir: "asc" | "desc" } | null>(null);
    const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
    const [addOpen, setAddOpen] = React.useState(false);

    const router = useRouter();
    const openAddSingle = () => setAddOpen(true);
    const goToBulkImport = () => router.push("/suppliers/import");

    const view = React.useMemo(() => getView(activeViewId), [activeViewId]);

    const [visible, setVisible] = React.useState<Set<ColumnId>>(new Set(view.columns));

    React.useEffect(() => {
        setFilters(view.filters.map((f) => ({ ...f })));
        setVisible(new Set(view.columns));
        setSort(view.defaultSort ? { ...view.defaultSort } : null);
        setSearch("");
        setSelectedIds(new Set());
    }, [activeViewId, view]);

    const viewCounts = React.useMemo(() => {
        const map: Record<string, number> = {};
        for (const v of SUPPLIER_VIEWS) map[v.id] = applyFilters(data, v.filters).length;
        return map;
    }, [data]);

    const visibleColumns = React.useMemo(
        () => view.columns.filter((id) => visible.has(id)),
        [view.columns, visible],
    );

    const filteredRows = React.useMemo(
        () => applyFilters(data, filters).filter((row) => matchesSearch(row, search)),
        [data, filters, search],
    );

    const sortedRows = React.useMemo(() => {
        if (!sort) return filteredRows;
        const copy = [...filteredRows];
        copy.sort((a, b) => {
            const av = sortValue(a, sort.id);
            const bv = sortValue(b, sort.id);
            let cmp = 0;
            if (typeof av === "number" && typeof bv === "number") cmp = av - bv;
            else cmp = String(av).localeCompare(String(bv));
            return sort.dir === "asc" ? cmp : -cmp;
        });
        return copy;
    }, [filteredRows, sort]);

    const toggleSort = (id: ColumnId) => {
        setSort((prev) => {
            if (!prev || prev.id !== id) return { id, dir: "asc" };
            if (prev.dir === "asc") return { id, dir: "desc" };
            return null;
        });
    };

    const toggleColumn = (id: ColumnId) =>
        setVisible((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });

    const allSelected = sortedRows.length > 0 && sortedRows.every((r) => selectedIds.has(r.id));
    const toggleAll = () =>
        setSelectedIds(() => {
            if (allSelected) return new Set();
            return new Set(sortedRows.map((r) => r.id));
        });
    const toggleRow = (id: string) =>
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });

    const resetView = () => {
        setFilters(view.filters.map((f) => ({ ...f })));
        setVisible(new Set(view.columns));
        setSort(view.defaultSort ? { ...view.defaultSort } : null);
        setSearch("");
    };

    const handleExport = (format: "csv" | "xlsx" = "csv") => {
        const headers = visibleColumns.map((id) => SUPPLIER_COLUMNS[id].label);
        const rows = sortedRows.map((row) => visibleColumns.map((id) => cellTextForExport(row, id)));

        if (format === "csv") {
            const lines = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","));
            const csv = [headers.join(","), ...lines].join("\n");
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `suppliers-${activeViewId}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } else {
            const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Suppliers");
            XLSX.writeFile(workbook, `suppliers-${activeViewId}.xlsx`);
        }
    };

    return (
        <div className="grid h-full gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
            {/* Sidebar */}
            <aside className="hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm lg:block">
                <ViewsSidebar activeViewId={activeViewId} counts={viewCounts} onSelect={setActiveViewId} />
            </aside>

            {/* Main */}
            <div className="space-y-4">
                <div>
                    <nav className="flex items-center gap-1.5 text-sm text-slate-400">
                        <span>Suppliers</span>
                        <span>/</span>
                        <span className="font-semibold text-slate-800">{view.label}</span>
                    </nav>
                </div>

                {/* Toolbar */}
                <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1 space-y-3">
                            <FilterChips filters={filters} onChange={setFilters} />
                            <div className="flex flex-wrap items-center gap-2">
                                {view.hasReset ? (
                                    <Button variant="outline" size="sm" className="gap-1.5" onClick={resetView}>
                                        <RotateCcw className="h-3.5 w-3.5" /> Reset
                                    </Button>
                                ) : null}
                                <span className="text-xs text-slate-400">
                                    {filters.length === 0 ? "No preset filter" : `${filters.length} filter${filters.length > 1 ? "s" : ""} applied`}
                                </span>
                            </div>
                        </div>

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
                            <ColumnVisibilityPanel view={view} visible={visible} onToggle={toggleColumn} />
                            <Popover.Root>
                                <Popover.Trigger asChild>
                                    <Button variant="outline" size="sm" className="px-2">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </Popover.Trigger>
                                <Popover.Portal>
                                    <Popover.Content align="end" sideOffset={6} className="z-50 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                                        <button className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-slate-700 hover:bg-slate-50" onClick={() => handleExport("csv")}>
                                            <FileSpreadsheet className="h-4 w-4" /> Export (CSV)
                                        </button>
                                        <button className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-slate-700 hover:bg-slate-50" onClick={() => handleExport("xlsx")}>
                                            <FileSpreadsheet className="h-4 w-4" /> Export (Excel)
                                        </button>
                                        <button className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-slate-700 hover:bg-slate-50" onClick={resetView}>
                                            <RotateCcw className="h-4 w-4" /> Reset view
                                        </button>
                                    </Popover.Content>
                                </Popover.Portal>
                            </Popover.Root>
                            <DropdownMenu>
                                <div className="inline-flex">
                                    <Button
                                        size="sm"
                                        className="gap-1.5 rounded-r-none"
                                        onClick={openAddSingle}
                                    >
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
                                            openAddSingle();
                                        }}
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add Single Supplier
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="gap-2"
                                        onSelect={(event) => {
                                            event.preventDefault();
                                            goToBulkImport();
                                        }}
                                    >
                                        <Upload className="h-4 w-4" />
                                        Bulk Import Suppliers
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <AddSupplierModal
                                open={addOpen}
                                onOpenChange={setAddOpen}
                                onCreated={() => setAddOpen(false)}
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="max-h-[60vh] overflow-auto">
                        <table className="w-full border-collapse text-sm" style={{ minWidth: visibleColumns.reduce((w, id) => w + SUPPLIER_COLUMNS[id].width, 60) }}>
                            <thead className="sticky top-0 z-10 bg-slate-50">
                                <tr className="border-b border-slate-200">
                                    <th className="w-12 px-3 py-2.5 text-left">
                                        <Checkbox checked={allSelected ? true : sortedRows.some((r) => selectedIds.has(r.id)) ? "indeterminate" : false} onCheckedChange={toggleAll} aria-label="Select all" />
                                    </th>
                                    {visibleColumns.map((id) => {
                                        const col = SUPPLIER_COLUMNS[id];
                                        const active = sort?.id === id;
                                        return (
                                            <th
                                                key={id}
                                                style={{ width: col.width, textAlign: col.align ?? "left" }}
                                                className="px-3 py-2.5 text-[11px] font-black uppercase tracking-wide text-slate-500"
                                                title={col.label}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => toggleSort(id)}
                                                    className={cn(
                                                        "inline-flex items-center gap-1 hover:text-slate-800",
                                                        active && "text-slate-900",
                                                    )}
                                                >
                                                    <span className="truncate">{col.label}</span>
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
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                {sortedRows.map((row) => {
                                    const selected = selectedIds.has(row.id);
                                    return (
                                        <tr key={row.id} className={cn("border-b border-slate-100 last:border-0 hover:bg-slate-50/70", selected && "bg-blue-50/40")}>
                                            <td className="px-3 py-2.5 align-top">
                                                <Checkbox checked={selected} onCheckedChange={() => toggleRow(row.id)} aria-label={`Select ${row.name}`} />
                                            </td>
                                            {visibleColumns.map((id) => {
                                                const col = SUPPLIER_COLUMNS[id];
                                                const align = col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left";
                                                return (
                                                    <td key={id} style={{ width: col.width }} className={cn("px-3 py-2.5 align-top", align)}>
                                                        {id === "supplier" ? (
                                                            <Link href={`/suppliers/${row.id}`} className="block space-y-0.5 group/supplier">
                                                                <p className="font-semibold text-slate-900 group-hover/supplier:text-primary group-hover/supplier:underline">{row.name}</p>
                                                                <p className="font-mono text-[11px] text-slate-400">#{row.id}</p>
                                                            </Link>
                                                        ) : (
                                                            <Cell supplier={row} columnId={id} />
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                                {sortedRows.length === 0 ? (
                                    <tr>
                                        <td colSpan={visibleColumns.length + 1} className="px-6 py-16">
                                            <div className="flex flex-col items-center justify-center text-center">
                                                <Grid2x2 className="h-10 w-10 text-slate-300" />
                                                <p className="mt-3 text-base font-bold text-slate-900">No rows</p>
                                                <p className="mt-1 text-sm text-slate-400">There are no rows matching your filter.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : null}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-1 text-sm text-slate-500">
                    Suppliers: <span className="font-semibold text-slate-800">{sortedRows.length.toLocaleString("en-US")}</span>
                </div>
            </div>
        </div>
    );
}
