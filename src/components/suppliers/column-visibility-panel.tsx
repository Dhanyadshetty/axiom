"use client";

import * as React from "react";
import { Columns3 } from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
    type ColumnDef,
    type SupplierColumnId,
} from "./suppliers-config";

export function ColumnVisibilityPanel({
    allColumns,
    visible,
    onToggle,
}: {
    allColumns: ColumnDef[];
    visible: Set<SupplierColumnId>;
    onToggle: (id: SupplierColumnId) => void;
}) {
    const categories: Array<{ key: ColumnDef["category"]; label: string }> = [
        { key: "core", label: "CORE" },
        { key: "classification", label: "CLASSIFICATION" },
        { key: "certificates", label: "CERTIFICATES" },
        { key: "lifecycle", label: "ONBOARDING" },
        { key: "risk", label: "ESG" },
    ];

    const total = allColumns.length;
    const shown = allColumns.filter((col) => visible.has(col.id)).length;
    const [search, setSearch] = React.useState("");

    const filteredColumns = allColumns.filter((col) =>
        col.label.toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <Popover.Root>
            <Popover.Trigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Columns3 className="h-4 w-4" />
                    Columns {shown}/{total}
                </Button>
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content
                    align="end"
                    sideOffset={8}
                    className="z-50 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-xl"
                >
                    <div className="mb-3 flex items-center gap-2">
                        <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                            VISIBLE COLUMNS
                        </p>
                        <span className="text-xs text-slate-400">{shown}/{total}</span>
                    </div>
                    <Input
                        placeholder="Search columns..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="mb-3 h-8 text-sm"
                    />
                    <div className="max-h-80 space-y-3 overflow-y-auto">
                        {categories.map((category) => {
                            const cols = filteredColumns.filter((col) => col.category === category.key);
                            if (cols.length === 0) return null;
                            return (
                                <div key={category.key}>
                                    <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                        {category.label}
                                    </p>
                                    <div className="space-y-1">
                                        {cols.map((col) => (
                                            <label
                                                key={col.id}
                                                className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1.5 text-sm hover:bg-slate-50"
                                            >
                                                <Checkbox
                                                    checked={visible.has(col.id)}
                                                    onCheckedChange={() => onToggle(col.id)}
                                                    aria-label={col.label}
                                                />
                                                <span className="text-slate-700 flex-1 truncate">{col.label}</span>
                                                {col.computed ? (
                                                    <span
                                                        className="ml-auto flex h-5 items-center rounded bg-fuchsia-100 px-1.5 text-[10px] font-semibold uppercase text-fuchsia-700"
                                                        title="AUTO — calculated from order data"
                                                    >
                                                        AUTO
                                                    </span>
                                                ) : null}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-2 flex justify-between border-t border-slate-100 pt-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => allColumns.forEach((col) => visible.has(col.id) || onToggle(col.id))}
                        >
                            Show all
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => allColumns.forEach((col) => !col.frozen && visible.has(col.id) && onToggle(col.id))}
                        >
                            Hide all
                        </Button>
                    </div>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}
