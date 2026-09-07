"use client";

import * as React from "react";
import { Pencil, Plus, Search, Trash2, X, Hash, Type, ListChecks, UserCircle, CheckSquare, MessageSquare, Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import * as Dialog from "@radix-ui/react-dialog";
import { Badge } from "@/components/ui/badge";
import { ColumnId, SupplierView, type ColumnDef, SUPPLIER_COLUMNS } from "./tacto/suppliers-model";

interface PropertyMeta {
    id: ColumnId;
    title: string;
    slug: string;
    type: PropertyType;
    questionTitle?: string;
    createdAt?: string;
    updatedAt?: string;
}

type PropertyType =
    | "Number"
    | "Multi User Select"
    | "Single Select"
    | "Multi Select"
    | "Yes/No"
    | "Short Text"
    | "Long Text";

function typeIcon(type: PropertyType) {
    switch (type) {
        case "Number":
            return <Hash className="h-3.5 w-3.5" />;
        case "Multi User Select":
            return <UserCircle className="h-3.5 w-3.5" />;
        case "Single Select":
            return <ListChecks className="h-3.5 w-3.5" />;
        case "Multi Select":
            return <ListChecks className="h-3.5 w-3.5" />;
        case "Yes/No":
            return <CheckSquare className="h-3.5 w-3.5" />;
        case "Long Text":
            return <MessageSquare className="h-3.5 w-3.5" />;
        default:
            return <Type className="h-3.5 w-3.5" />;
    }
}

function inferType(columnId: ColumnId): PropertyType {
    if (columnId === "orderVolume2025" || columnId === "orderVolume2024") return "Number";
    if (columnId === "responsibleBuyer") return "Multi User Select";
    if (columnId.startsWith("cert")) return "Yes/No";
    if (
        columnId === "ssaSent" ||
        columnId === "ssaReceived" ||
        columnId === "ssaCompleted" ||
        columnId === "supplierCreatedIn" ||
        columnId === "reachRelevance" ||
        columnId === "rohsRelevance" ||
        columnId === "internal"
    )
        return "Yes/No";
    if (columnId === "commodityGroup") return "Multi Select";
    if (
        columnId === "status" ||
        columnId === "abc" ||
        columnId === "esgRiskStatus" ||
        columnId === "esgAnalysisProgress" ||
        columnId === "strategicClassification" ||
        columnId === "incidentStatus"
    )
        return "Single Select";
    if (columnId.startsWith("egbImplementation")) return "Long Text";
    return "Short Text";
}

function slugFor(columnId: ColumnId): string {
    if (columnId === "abc") return "computed_analytics_abc_classification";
    if (columnId === "orderVolume2025") return "computed_analytics_order_volume_2025";
    if (columnId === "orderVolume2024") return "computed_analytics_order_volume_2024";
    if (columnId === "responsibleBuyer") return "responsible_buyer";
    if (columnId === "strategicClassification") return "strategic_classification";
    return columnId;
}

export function TableSettingsView({
    view,
    allViews: _allViews,
}: {
    view: SupplierView;
    allViews: SupplierView[];
}) {
    const [search, setSearch] = React.useState("");
    const [linked, setLinked] = React.useState<ColumnId[]>([...view.columns]);
    const [pickerOpen, setPickerOpen] = React.useState(false);

    const linkedMeta = React.useMemo<PropertyMeta[]>(
        () =>
            linked.map((id) => {
                const col: ColumnDef | undefined = SUPPLIER_COLUMNS[id];
                return {
                    id,
                    title: col?.label ?? id,
                    slug: slugFor(id),
                    type: inferType(id),
                };
            }),
        [linked],
    );

    const availableColumns = React.useMemo<PropertyMeta[]>(() => {
        const all = Object.keys(SUPPLIER_COLUMNS) as ColumnId[];
        return all
            .filter((id) => !linked.includes(id))
            .map((id) => {
                const col = SUPPLIER_COLUMNS[id];
                return {
                    id,
                    title: col?.label ?? id,
                    slug: slugFor(id),
                    type: inferType(id),
                };
            });
    }, [linked]);

    const handleUnlink = (id: ColumnId) => {
        if (id === "supplier") return;
        setLinked((prev) => prev.filter((c) => c !== id));
    };

    return (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-950">
                        {view.label}
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Configure the columns shown in this supplier table view.
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                        <div className="relative max-w-sm flex-1">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search properties…"
                                className="pl-9"
                            />
                        </div>
                        <Button className="gap-2" onClick={() => setPickerOpen(true)}>
                            <Plus className="h-4 w-4" /> Link a new property
                        </Button>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <table className="w-full border-collapse text-sm">
                        <thead className="bg-slate-50">
                            <tr className="border-b border-slate-200">
                                <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wide text-slate-500">
                                    Title
                                </th>
                                <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wide text-slate-500">
                                    Type
                                </th>
                                <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wide text-slate-500">
                                    Slug
                                </th>
                                <th className="px-4 py-3 text-right text-[11px] font-black uppercase tracking-wide text-slate-500">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {linkedMeta
                                .filter((p) =>
                                    search
                                        ? p.title.toLowerCase().includes(search.toLowerCase()) ||
                                          p.slug.includes(search.toLowerCase())
                                        : true,
                                )
                                .map((p) => (
                                    <tr
                                        key={p.id}
                                        className="border-b border-slate-100 last:border-0"
                                    >
                                        <td className="px-4 py-3 font-medium text-slate-900">
                                            {p.title}
                                        </td>
                                        <td className="px-4 py-3 text-slate-700">
                                            <span className="inline-flex items-center gap-1.5 text-xs">
                                                {typeIcon(p.type)}
                                                {p.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <code className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-700">
                                                {p.slug}
                                            </code>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                type="button"
                                                onClick={() => handleUnlink(p.id)}
                                                disabled={p.id === "supplier"}
                                                className={cn(
                                                    "rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600",
                                                    p.id === "supplier" && "opacity-40 cursor-not-allowed",
                                                )}
                                                aria-label={`Unlink ${p.title}`}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="text-base font-black tracking-tight text-slate-950">
                    View information
                </h2>
                <div className="mt-4 space-y-4 text-sm">
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                            Name
                        </p>
                        <div className="mt-1 flex items-center justify-between gap-2 rounded-md border border-slate-200 px-3 py-2">
                            <span className="font-medium text-slate-900">{view.label}</span>
                            <Pencil className="h-4 w-4 cursor-pointer text-slate-400 hover:text-slate-700" />
                        </div>
                    </div>
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                            Groups
                        </p>
                        <div className="mt-1 rounded-md border border-slate-200 px-3 py-2 font-medium text-slate-900">
                            {view.group}
                        </div>
                    </div>
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                            On dashboard
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                            <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">
                                <SettingsIcon className="mr-1 h-3 w-3" /> Yes
                            </Badge>
                            <span className="text-xs text-slate-500">
                                Visible on the Suppliers dashboard widget.
                            </span>
                        </div>
                    </div>
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                            Created at
                        </p>
                        <p className="mt-1 text-slate-700">
                            {new Date().toISOString().slice(0, 10)}
                        </p>
                    </div>
                </div>
            </aside>

            <LinkPropertyModal
                open={pickerOpen}
                onOpenChange={setPickerOpen}
                available={availableColumns}
                onConfirm={(selected) => {
                    setLinked((prev) => [...prev, ...selected]);
                    setPickerOpen(false);
                }}
            />
        </div>
    );
}

function LinkPropertyModal({
    open,
    onOpenChange,
    available,
    onConfirm,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    available: PropertyMeta[];
    onConfirm: (ids: ColumnId[]) => void;
}) {
    const [search, setSearch] = React.useState("");
    const [selected, setSelected] = React.useState<Set<ColumnId>>(new Set());

    const filtered = React.useMemo(
        () =>
            available.filter(
                (p) =>
                    !search ||
                    p.title.toLowerCase().includes(search.toLowerCase()) ||
                    p.slug.includes(search.toLowerCase()),
            ),
        [available, search],
    );

    return (
        <Dialog.Root
            open={open}
            onOpenChange={(v) => {
                if (!v) setSelected(new Set());
                onOpenChange(v);
            }}
        >
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[800px] max-w-[94vw] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white shadow-2xl">
                    <div className="flex items-center justify-between border-b border-slate-200 p-4">
                        <div>
                            <Dialog.Title className="text-lg font-black tracking-tight text-slate-950">
                                Link a new property
                            </Dialog.Title>
                            <Dialog.Description className="mt-1 text-sm text-slate-500">
                                Pick one or more properties to add to this view.
                            </Dialog.Description>
                        </div>
                        <Dialog.Close asChild>
                            <button className="rounded-md p-1 text-slate-400 hover:bg-slate-100">
                                <X className="h-5 w-5" />
                            </button>
                        </Dialog.Close>
                    </div>

                    <div className="border-b border-slate-200 p-3">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search…"
                                className="pl-9"
                            />
                        </div>
                    </div>

                    <div className="max-h-[480px] overflow-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead className="sticky top-0 z-10 bg-slate-50">
                                <tr className="border-b border-slate-200">
                                    <th className="w-12 px-3 py-2" />
                                    <th className="px-3 py-2 text-left text-[11px] font-black uppercase tracking-wide text-slate-500">
                                        Title
                                    </th>
                                    <th className="px-3 py-2 text-left text-[11px] font-black uppercase tracking-wide text-slate-500">
                                        Slug
                                    </th>
                                    <th className="px-3 py-2 text-left text-[11px] font-black uppercase tracking-wide text-slate-500">
                                        Type
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((p) => {
                                    const checked = selected.has(p.id);
                                    return (
                                        <tr
                                            key={p.id}
                                            className="cursor-pointer border-b border-slate-100 last:border-0 hover:bg-slate-50"
                                            onClick={() => {
                                                setSelected((prev) => {
                                                    const next = new Set(prev);
                                                    if (next.has(p.id)) next.delete(p.id);
                                                    else next.add(p.id);
                                                    return next;
                                                });
                                            }}
                                        >
                                            <td className="px-3 py-2">
                                                <Checkbox checked={checked} />
                                            </td>
                                            <td className="px-3 py-2 font-medium text-slate-900">
                                                {p.title}
                                            </td>
                                            <td className="px-3 py-2">
                                                <code className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-700">
                                                    {p.slug}
                                                </code>
                                            </td>
                                            <td className="px-3 py-2 text-xs text-slate-700">
                                                <span className="inline-flex items-center gap-1.5">
                                                    {typeIcon(p.type)} {p.type}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-200 p-4">
                        <span className="text-sm text-slate-500">
                            {selected.size} {selected.size === 1 ? "Property" : "Properties"}{" "}
                            selected
                        </span>
                        <div className="flex gap-2">
                            <Dialog.Close asChild>
                                <Button variant="outline">Cancel</Button>
                            </Dialog.Close>
                            <Button
                                onClick={() => onConfirm(Array.from(selected))}
                                disabled={selected.size === 0}
                            >
                                Select properties
                            </Button>
                        </div>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}