import * as React from "react";
import { Plus, Inbox, ArrowUp, ArrowDown, ChevronsUpDown, Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/currency";
import { flagEmoji, countryName } from "@/lib/utils/countryFlags";
import {
    SUPPLIER_COLUMNS,
    type ColumnDef,
    type SupplierColumnId,
    type SupplierTableRow,
} from "./suppliers-config";

type SortRule = { id: SupplierColumnId; dir: "asc" | "desc" };

export interface SupplierTableProps {
    rows: SupplierTableRow[];
    columns: ColumnDef[];
    sort: SortRule[];
    onSort: (id: SupplierColumnId, additive: boolean) => void;
    selectedIds: Set<string>;
    onToggleRow: (id: string) => void;
    onToggleAll: () => void;
    newRowIds?: Set<string>;
    onRowClick?: (row: SupplierTableRow) => void;
    freezeFirstColumn?: boolean;
    density?: "compact" | "comfortable";
}

function getCellValue(row: SupplierTableRow, columnId: SupplierColumnId): string | number {
    switch (columnId) {
        case "supplier":
            return row.name;
        case "country":
            return row.countryCode ?? "";
        case "orderVolume2025":
            return row.currentYearVolume;
        case "orderVolume2024":
            return row.previousYearVolume;
        case "abc":
            return row.abcClassification;
        case "status":
            return row.status;
        case "supplierType":
            return row.supplierType ?? "";
        case "areaOfNeed":
            return (row.areaOfNeed || []).join(", ");
        case "commodityGroup":
            return (row.commodityGroup || []).join(", ");
        case "responsibleBuyer":
            return (row.responsibleBuyer || []).join(", ");
        case "strategicClassification":
            return row.strategicClassification ?? "";
        case "lifecycle":
            return row.lifecycleStatus;
        case "riskScore":
            return row.riskScore;
        case "tier":
            return row.tierLevel;
        case "city":
            return row.city ?? "";
        case "contactEmail":
            return row.contactEmail ?? "";
        default:
            return "";
    }
}

function sortRows(rows: SupplierTableRow[], sort: SortRule[]): SupplierTableRow[] {
    if (sort.length === 0) return rows;
    return [...rows].sort((a, b) => {
        for (const s of sort) {
            const av = getCellValue(a, s.id);
            const bv = getCellValue(b, s.id);
            let cmp = 0;
            if (typeof av === "number" && typeof bv === "number") cmp = av - bv;
            else cmp = String(av).localeCompare(String(bv));
            if (cmp !== 0) return s.dir === "asc" ? cmp : -cmp;
        }
        return 0;
    });
}

function cellDisplay(row: SupplierTableRow, columnId: SupplierColumnId) {
    const value = getCellValue(row, columnId);

    if (columnId === "country") {
        const code = row.countryCode ?? "";
        return (
            <div className="flex items-center gap-2">
                <span className="text-lg leading-none">{code ? flagEmoji(code) : ""}</span>
                <span className="font-medium text-slate-900">{code ? countryName(code) : "—"}</span>
            </div>
        );
    }

    if (columnId === "orderVolume2025" || columnId === "orderVolume2024") {
        return (
            <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900">{formatCurrency(value as number)}</span>
                <span className="text-xs text-slate-400">· {columnId === "orderVolume2025" ? "2025" : "2024"}</span>
            </div>
        );
    }

    if (columnId === "riskScore") {
        const score = typeof value === "number" ? value : 0;
        const tone =
            score >= 75
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : score >= 60
                  ? "border-amber-200 bg-amber-50 text-amber-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700";
        return <Badge variant="outline" className={cn("font-medium", tone)}>{score}</Badge>;
    }

    if (columnId === "supplier") {
        return (
            <div>
                <p className="text-sm font-bold text-slate-950">{row.name}</p>
                <p className="text-xs text-slate-500">{row.id}</p>
            </div>
        );
    }

    return <span className="text-slate-600">{String(value)}</span>;
}

export function SupplierTable({
    rows,
    columns,
    sort,
    onSort,
    selectedIds,
    onToggleRow,
    onToggleAll,
    newRowIds,
    onRowClick,
    freezeFirstColumn,
    density,
}: SupplierTableProps) {
    const sortedRows = React.useMemo(() => sortRows(rows, sort), [rows, sort]);
    const allSelected = sortedRows.length > 0 && selectedIds.size === sortedRows.length;
    const someSelected = selectedIds.size > 0 && !allSelected;
    const cellPad = density === "compact" ? "px-3 py-1.5" : "px-4 py-3";

    const sortDirFor = (id: SupplierColumnId) => sort.find((s) => s.id === id)?.dir;

    return (
        <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex-1 overflow-auto">
                <table className="w-full border-collapse">
                    <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50">
                        <tr>
                            {columns.map((column) => {
                                const dir = sortDirFor(column.id);
                                const isSorted = dir !== undefined;
                                return (
                                    <th
                                        key={column.id}
                                        style={{ width: column.width, minWidth: column.width }}
                                        className={cn(
                                            "border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-slate-500",
                                            column.align === "right" ? "text-right" : column.align === "center" ? "text-center" : "text-left",
                                            freezeFirstColumn && column.id === "supplier" ? "sticky left-0 z-20" : "",
                                        )}
                                    >
                                        {column.id === "supplier" ? (
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    checked={allSelected ? true : someSelected ? "indeterminate" : false}
                                                    onCheckedChange={onToggleAll}
                                                    aria-label="Select all rows"
                                                />
                                                <span>{column.label}</span>
                                            </div>
                                        ) : column.sortable ? (
                                            <button
                                                type="button"
                                                onClick={(e) => onSort(column.id, e.shiftKey)}
                                                className={cn(
                                                    "inline-flex items-center gap-1.5 transition-colors hover:text-slate-900",
                                                    column.align === "right" ? "flex-row-reverse" : "",
                                                )}
                                            >
                                                <span>{column.label}</span>
                                                {isSorted ? (
                                                    dir === "asc" ? (
                                                        <ArrowUp className="h-3.5 w-3.5 text-slate-700" />
                                                    ) : (
                                                        <ArrowDown className="h-3.5 w-3.5 text-slate-700" />
                                                    )
                                                ) : (
                                                    <ChevronsUpDown className="h-3.5 w-3.5 text-slate-300" />
                                                )}
                                            </button>
                                        ) : (
                                            <span>{column.label}</span>
                                        )}
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {sortedRows.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-16">
                                    <div className="flex flex-col items-center justify-center text-center">
                                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                                            <Inbox className="h-6 w-6 text-slate-400" />
                                        </div>
                                        <p className="text-base font-semibold text-slate-900">No rows</p>
                                        <p className="mt-1 text-sm text-slate-500">There are no rows matching your filter.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            sortedRows.map((row) => (
                                <tr
                                    key={row.id}
                                    onClick={() => onRowClick?.(row)}
                                    className={cn(
                                        "transition-colors hover:bg-slate-50/70",
                                        selectedIds.has(row.id) && "bg-slate-50/60",
                                        newRowIds?.has(row.id) && "bg-amber-50/60",
                                        onRowClick && "cursor-pointer",
                                    )}
                                >
                                    {columns.map((column) => (
                                        <td
                                            key={column.id}
                                            className={cn(
                                                "border-b border-slate-100 align-top text-sm",
                                                cellPad,
                                                column.align === "right" ? "text-right" : column.align === "center" ? "text-center" : "text-left",
                                                freezeFirstColumn && column.id === "supplier" ? "sticky left-0 z-10 bg-white" : "",
                                            )}
                                        >
                                            {column.id === "supplier" ? (
                                                <div
                                                    className="flex items-center gap-2"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Checkbox
                                                        checked={selectedIds.has(row.id)}
                                                        onCheckedChange={() => onToggleRow(row.id)}
                                                        aria-label={`Select ${row.name}`}
                                                    />
                                                    {cellDisplay(row, column.id)}
                                                </div>
                                            ) : (
                                                cellDisplay(row, column.id)
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-600">
                <span>
                    <span className="font-bold text-slate-900">{sortedRows.length}</span>
                    <span className="ml-1">suppliers</span>
                </span>
                <div className="inline-flex">
                    <Button className="gap-2 rounded-r-none">
                        <Plus className="h-4 w-4" /> Add new
                    </Button>
                    <Button variant="outline" className="rounded-l-none border-l border-white/30 px-2.5">
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

export { SupplierTable as SuppliersTable };
