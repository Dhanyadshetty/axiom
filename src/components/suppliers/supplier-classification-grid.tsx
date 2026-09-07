"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpDown, Check, Search, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type ClassificationRow = {
    id: string;
    supplierNumber: string | null;
    name: string;
    commodityGroup: string[];
    responsibleBuyer: string[];
    strategicClassification: string | null;
    status: string;
};

function routeId(row: ClassificationRow) {
    return row.supplierNumber || row.id;
}

function stratBadgeClass(value: string | null) {
    if (!value) return "border-slate-200 bg-slate-50 text-slate-600";
    if (value.toLowerCase().includes("preferred")) return "border-emerald-200 bg-emerald-50 text-emerald-700";
    if (value.toLowerCase().includes("strategic")) return "border-blue-200 bg-blue-50 text-blue-700";
    if (value.toLowerCase().includes("approved")) return "border-violet-200 bg-violet-50 text-violet-700";
    return "border-slate-200 bg-slate-50 text-slate-700";
}

export function SupplierClassificationGrid({ rows, viewId }: { rows: ClassificationRow[]; viewId: string }) {
    const [search, setSearch] = React.useState("");
    const [commodityFilter, setCommodityFilter] = React.useState("all");
    const [buyerFilter, setBuyerFilter] = React.useState("all");
    const [stratFilter, setStratFilter] = React.useState("all");
    const [selected, setSelected] = React.useState<Set<string>>(new Set());

    const commodityOptions = React.useMemo(
        () => Array.from(new Set(rows.flatMap((r) => r.commodityGroup))).sort(),
        [rows],
    );
    const buyerOptions = React.useMemo(
        () => Array.from(new Set(rows.flatMap((r) => r.responsibleBuyer))).sort(),
        [rows],
    );
    const stratOptions = React.useMemo(
        () => Array.from(new Set(rows.map((r) => r.strategicClassification).filter(Boolean) as string[])).sort(),
        [rows],
    );

    const filtered = React.useMemo(
        () =>
            rows.filter((r) => {
                const q = search.trim().toLowerCase();
                const matchesSearch = !q || r.name.toLowerCase().includes(q);
                const matchesCommodity = commodityFilter === "all" || r.commodityGroup.includes(commodityFilter);
                const matchesBuyer = buyerFilter === "all" || r.responsibleBuyer.includes(buyerFilter);
                const matchesStrat = stratFilter === "all" || (r.strategicClassification ?? "") === stratFilter;
                return matchesSearch && matchesCommodity && matchesBuyer && matchesStrat;
            }),
        [rows, search, commodityFilter, buyerFilter, stratFilter],
    );

    const allSelected = filtered.length > 0 && filtered.every((r) => selected.has(routeId(r)));
    const toggleAll = () =>
        setSelected((prev) => {
            const next = new Set(prev);
            if (allSelected) filtered.forEach((r) => next.delete(routeId(r)));
            else filtered.forEach((r) => next.add(routeId(r)));
            return next;
        });
    const toggleRow = (id: string) =>
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm lg:flex-row lg:items-center lg:justify-between">
                <div className="relative w-full lg:max-w-xs">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search supplier…"
                        className="pl-9"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <select
                        value={commodityFilter}
                        onChange={(e) => setCommodityFilter(e.target.value)}
                        className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm"
                    >
                        <option value="all">All commodity groups</option>
                        {commodityOptions.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                    <select
                        value={buyerFilter}
                        onChange={(e) => setBuyerFilter(e.target.value)}
                        className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm"
                    >
                        <option value="all">All buyers</option>
                        {buyerOptions.map((b) => (
                            <option key={b} value={b}>{b}</option>
                        ))}
                    </select>
                    <select
                        value={stratFilter}
                        onChange={(e) => setStratFilter(e.target.value)}
                        className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm"
                    >
                        <option value="all">All classifications</option>
                        {stratOptions.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                    <Button variant="outline" size="sm" className="gap-1.5" disabled={selected.size === 0}>
                        <Check className="h-4 w-4" /> {selected.size} selected
                    </Button>
                    <Button asChild size="sm" className="gap-1.5">
                        <Link href="/suppliers/import">
                            <Upload className="h-4 w-4" /> Import
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="flex items-center justify-between px-1 text-sm text-slate-500">
                <span>
                    <span className="font-bold text-slate-900">{filtered.length}</span> suppliers
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                    View {viewId} <ArrowUpDown className="h-3 w-3" />
                </span>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto overflow-y-auto max-h-[70vh]">
                    <table className="w-full min-w-[820px] text-sm">
                        <thead className="bg-slate-50">
                            <tr className="border-b">
                                <th className="w-12 px-4 py-3 text-left">
                                    <Checkbox
                                        checked={allSelected ? true : filtered.some((r) => selected.has(routeId(r))) ? "indeterminate" : false}
                                        onCheckedChange={toggleAll}
                                        aria-label="Select all"
                                    />
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-[0.14em] text-slate-500">Supplier</th>
                                <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-[0.14em] text-slate-500">Commodity Group</th>
                                <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-[0.14em] text-slate-500">Responsible Buyer</th>
                                <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-[0.14em] text-slate-500">Strategic Classification</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((row) => {
                                const rid = routeId(row);
                                const isSelected = selected.has(rid);
                                return (
                                    <tr key={row.id} className={cn("border-b last:border-0 hover:bg-slate-50/70", isSelected && "bg-blue-50/40")}>
                                        <td className="px-4 py-3 align-top">
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={() => toggleRow(rid)}
                                                aria-label={`Select ${row.name}`}
                                            />
                                        </td>
                                        <td className="px-4 py-3 align-top">
                                            <Link
                                                href={`/suppliers/${rid}/overview`}
                                                className="text-sm font-bold text-slate-950 transition-colors hover:text-primary hover:underline"
                                            >
                                                {row.name}
                                            </Link>
                                            <p className="mt-0.5 font-mono text-[11px] text-slate-400">#{row.supplierNumber ?? row.id}</p>
                                        </td>
                                        <td className="px-4 py-3 align-top">
                                            <div className="flex flex-wrap gap-1">
                                                {row.commodityGroup.length ? (
                                                    row.commodityGroup.map((c) => (
                                                        <Badge key={c} variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">{c}</Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-slate-300">—</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 align-top">
                                            <div className="flex flex-wrap gap-1">
                                                {row.responsibleBuyer.length ? (
                                                    row.responsibleBuyer.map((b) => (
                                                        <span key={b} className="text-slate-700">{b}</span>
                                                    ))
                                                ) : (
                                                    <span className="text-slate-300">—</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 align-top">
                                            {row.strategicClassification ? (
                                                <Badge variant="outline" className={cn("font-medium", stratBadgeClass(row.strategicClassification))}>
                                                    {row.strategicClassification}
                                                </Badge>
                                            ) : (
                                                <span className="text-slate-300">—</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <p className="text-base font-semibold text-slate-900">No suppliers</p>
                                        <p className="mt-1 text-sm text-slate-500">No suppliers match the current filters.</p>
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
