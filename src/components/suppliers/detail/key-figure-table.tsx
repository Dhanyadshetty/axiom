"use client";

import * as React from "react";
import { Plus, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export interface TableColumn {
    key: string;
    label: string;
    type?: "text" | "number";
    width?: string;
    required?: boolean;
}

export interface KeyFigureTableProps {
    title: string;
    columns: TableColumn[];
    rows: Array<Record<string, unknown>>;
    sortDesc?: boolean;
    onAdd: (row: Record<string, unknown>) => void;
    onEdit: (index: number, patch: Record<string, unknown>) => void;
    onRemove: (index: number) => void;
    onRowMenu?: (index: number) => void;
    emptyHint?: string;
}

export function KeyFigureTable({
    title,
    columns,
    rows,
    sortDesc = true,
    onAdd,
    onEdit,
    onRemove,
    onRowMenu,
    emptyHint,
}: KeyFigureTableProps) {
    const [open, setOpen] = React.useState(false);
    const sorted = React.useMemo(() => {
        const copy = [...rows];
        const keyCol = columns[0]?.key;
        if (!keyCol) return copy;
        copy.sort((a, b) => {
            const av = a[keyCol];
            const bv = b[keyCol];
            if (typeof av === "number" && typeof bv === "number") {
                return sortDesc ? bv - av : av - bv;
            }
            return sortDesc
                ? String(bv ?? "").localeCompare(String(av ?? ""))
                : String(av ?? "").localeCompare(String(bv ?? ""));
        });
        return copy;
    }, [rows, columns, sortDesc]);

    return (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                    {title}
                </h3>
                <Button size="sm" variant="outline" className="gap-1" onClick={() => setOpen(true)}>
                    <Plus className="h-3.5 w-3.5" /> Add
                </Button>
            </div>
            {sorted.length === 0 ? (
                <div className="px-4 py-6 text-sm text-slate-400">
                    {emptyHint ?? "No entries yet."}
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                {columns.map((c) => (
                                    <th key={c.key} className="px-3 py-2">
                                        {c.label}
                                    </th>
                                ))}
                                <th className="w-8" />
                            </tr>
                        </thead>
                        <tbody>
                            {sorted.map((row, i) => (
                                <tr key={i} className="border-b border-slate-100 last:border-0">
                                    {columns.map((c) => (
                                        <td key={c.key} className="px-3 py-1.5">
                                            <Input
                                                type={c.type === "number" ? "number" : "text"}
                                                defaultValue={String(row[c.key] ?? "")}
                                                onBlur={(e) => {
                                                    const v =
                                                        c.type === "number"
                                                            ? Number(e.target.value || 0)
                                                            : e.target.value;
                                                    if (v !== row[c.key])
                                                        onEdit(i, { [c.key]: v });
                                                }}
                                                className="h-8"
                                            />
                                        </td>
                                    ))}
                                    <td className="px-2 py-1.5">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                onRowMenu ? onRowMenu(i) : onRemove(i)
                                            }
                                            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                            aria-label="Row actions"
                                        >
                                            <MoreVertical className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <AddEntryDialog
                open={open}
                onOpenChange={setOpen}
                title={title}
                columns={columns}
                onSubmit={(row) => {
                    onAdd(row);
                    setOpen(false);
                }}
            />
        </div>
    );
}

function AddEntryDialog({
    open,
    onOpenChange,
    title,
    columns,
    onSubmit,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    title: string;
    columns: TableColumn[];
    onSubmit: (row: Record<string, unknown>) => void;
}) {
    const [draft, setDraft] = React.useState<Record<string, string>>({});
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (open) {
            setDraft({});
            setError(null);
        }
    }, [open]);

    const submit = () => {
        for (const c of columns) {
            if (c.required && !draft[c.key]) {
                setError(`${c.label} is required.`);
                return;
            }
        }
        const row: Record<string, unknown> = {};
        for (const c of columns) {
            const v = draft[c.key] ?? "";
            row[c.key] = c.type === "number" ? Number(v || 0) : v;
        }
        onSubmit(row);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add entry</DialogTitle>
                    <DialogDescription>
                        Add a new row to {title.toLowerCase()}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-3 py-2">
                    {columns.map((c) => (
                        <div key={c.key} className="grid gap-1">
                            <Label className="text-xs font-semibold text-slate-500">
                                {c.label}
                                {c.required ? " *" : ""}
                            </Label>
                            <Input
                                type={c.type === "number" ? "number" : "text"}
                                value={draft[c.key] ?? ""}
                                onChange={(e) =>
                                    setDraft((d) => ({ ...d, [c.key]: e.target.value }))
                                }
                            />
                        </div>
                    ))}
                    {error ? <p className="text-xs text-rose-600">{error}</p> : null}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={submit}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
