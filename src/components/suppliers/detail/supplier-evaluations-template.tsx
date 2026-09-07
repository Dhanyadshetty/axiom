"use client";

import * as React from "react";
import Link from "next/link";
import { ClipboardList, FileText, Loader2, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CreateEvaluationModal } from "../create-evaluation-modal";
import {
    deleteSupplierEvaluation,
    getSupplierEvaluations,
    ensureEvaluationTemplatesSeeded,
    type SupplierEvaluationListRow,
} from "@/app/actions/supplier-evaluations";
import type { SupplierEvaluationTemplate } from "@/db/schema";
import { getEvaluationTemplates } from "@/app/actions/supplier-evaluations";
import { SupplierHeader } from "./supplier-header";

function statusPillClass(status: string) {
    switch (status) {
        case "completed":
            return "bg-emerald-50 text-emerald-700 border-emerald-200";
        case "in_progress":
            return "bg-blue-50 text-blue-700 border-blue-200";
        case "cancelled":
            return "bg-slate-100 text-slate-500 border-slate-200";
        case "draft":
        default:
            return "bg-amber-50 text-amber-700 border-amber-200";
    }
}

function formatDate(value: Date | string | null | undefined) {
    if (!value) return "—";
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date);
}

export interface SupplierEvaluationsTemplateProps {
    supplier: {
        id: string;
        supplierNumber?: string | null;
        name: string;
        countryCode?: string | null;
        countryName?: string | null;
        city?: string | null;
    };
    supplierId: string;
    supplierName: string;
    supplierNumber: string;
    initialEvaluations: SupplierEvaluationListRow[];
    initialTemplates: SupplierEvaluationTemplate[];
}

export function SupplierEvaluationsTemplate({
    supplier,
    supplierId,
    supplierName,
    supplierNumber,
    initialEvaluations,
    initialTemplates,
}: SupplierEvaluationsTemplateProps) {
    const [evaluations, setEvaluations] = React.useState(initialEvaluations);
    const [templates, setTemplates] = React.useState(initialTemplates);
    const [createOpen, setCreateOpen] = React.useState(false);
    const [search, setSearch] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState<"all" | "draft" | "in_progress" | "completed" | "cancelled">("all");
    const [pendingDelete, setPendingDelete] = React.useState<SupplierEvaluationListRow | null>(null);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        let cancelled = false;
        ensureEvaluationTemplatesSeeded()
            .then(() => getEvaluationTemplates())
            .then((rows) => {
                if (!cancelled) {
                    setTemplates(rows);
                }
            })
            .catch(() => undefined);
        return () => {
            cancelled = true;
        };
    }, []);

    const filtered = React.useMemo(() => {
        const q = search.trim().toLowerCase();
        return evaluations.filter((row) => {
            if (statusFilter !== "all" && row.status !== statusFilter) return false;
            if (!q) return true;
            return (
                row.title.toLowerCase().includes(q) ||
                (row.templateName ?? "").toLowerCase().includes(q) ||
                (row.createdByName ?? "").toLowerCase().includes(q)
            );
        });
    }, [evaluations, search, statusFilter]);

    const refresh = React.useCallback(async () => {
        setLoading(true);
        try {
            const rows = await getSupplierEvaluations(supplierId);
            setEvaluations(rows);
        } catch (error) {
            console.error("Failed to refresh evaluations:", error);
        } finally {
            setLoading(false);
        }
    }, [supplierId]);

    const handleCreated = React.useCallback(async () => {
        setCreateOpen(false);
        await refresh();
    }, [refresh]);

    const handleDelete = async () => {
        if (!pendingDelete) return;
        setIsDeleting(true);
        try {
            const result = await deleteSupplierEvaluation(pendingDelete.id);
            if (result.success) {
                toast.success("Evaluation deleted");
                setPendingDelete(null);
                await refresh();
            } else {
                toast.error(result.error || "Failed to delete evaluation");
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to delete evaluation");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <SupplierHeader
                supplier={supplier}
                section="evaluations"
                supplierNumber={supplierNumber}
                sidebarCollapsed={false}
                onToggleSidebar={() => undefined}
                headerActions={
                    <Button
                        type="button"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => setCreateOpen(true)}
                    >
                        <Plus className="h-4 w-4" /> Create new Evaluation
                    </Button>
                }
            />
            <div className="mx-auto max-w-7xl space-y-4 px-6 py-6">
                <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full sm:max-w-sm">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search title, template, owner…"
                            className="pl-9"
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(e.target.value as typeof statusFilter)
                            }
                            className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm"
                            aria-label="Filter by status"
                        >
                            <option value="all">All statuses</option>
                            <option value="draft">Draft</option>
                            <option value="in_progress">In progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <Button
                            type="button"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => setCreateOpen(true)}
                        >
                            <Plus className="h-4 w-4" /> Create new Evaluation
                        </Button>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/60 px-4 py-3">
                        <div className="flex items-center gap-2">
                            <ClipboardList className="h-4 w-4 text-slate-500" />
                            <h2 className="text-sm font-semibold text-slate-700">
                                Evaluations for {supplierName}
                            </h2>
                        </div>
                        <span className="text-xs text-slate-500">
                            {filtered.length} of {evaluations.length}
                        </span>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-slate-500">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading evaluations…
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
                            <FileText className="h-10 w-10 text-slate-300" />
                            <p className="mt-3 text-base font-bold text-slate-900">
                                No evaluations yet
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                                Create the first evaluation for this supplier.
                            </p>
                            <Button
                                type="button"
                                size="sm"
                                className="mt-4 gap-1.5"
                                onClick={() => setCreateOpen(true)}
                            >
                                <Plus className="h-4 w-4" /> Create new Evaluation
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 text-sm">
                                <thead className="bg-slate-50/40 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    <tr>
                                        <th className="px-4 py-3">Title</th>
                                        <th className="px-4 py-3">Template</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Owner</th>
                                        <th className="px-4 py-3">Updated</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filtered.map((row) => (
                                        <tr key={row.id} className="hover:bg-slate-50/60">
                                            <td className="px-4 py-3 align-top">
                                                <p className="font-semibold text-slate-900">
                                                    {row.title}
                                                </p>
                                                <p className="mt-0.5 font-mono text-[11px] text-slate-400">
                                                    #{row.id.slice(0, 8)}
                                                    {row.language ? ` · ${row.language.toUpperCase()}` : ""}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3 align-top text-slate-700">
                                                {row.templateName ?? "—"}
                                            </td>
                                            <td className="px-4 py-3 align-top">
                                                <span
                                                    className={cn(
                                                        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
                                                        statusPillClass(row.status),
                                                    )}
                                                >
                                                    {(row.status ?? "draft").replace("_", " ")}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 align-top text-slate-700">
                                                {row.createdByName ?? "—"}
                                            </td>
                                            <td className="px-4 py-3 align-top text-slate-700">
                                                {formatDate(row.updatedAt)}
                                            </td>
                                            <td className="px-4 py-3 align-top text-right">
                                                <button
                                                    type="button"
                                                    className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                                                    onClick={() => setPendingDelete(row)}
                                                    aria-label={`Delete evaluation ${row.title}`}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <p className="text-xs text-slate-500">
                    Supplier: <Link href={`/suppliers/${supplierNumber}/overview`} className="font-medium text-emerald-700 hover:underline">{supplierName}</Link> · ID{" "}
                    <span className="font-mono">{supplierNumber}</span>
                </p>
            </div>

            <CreateEvaluationModal
                open={createOpen}
                onOpenChange={setCreateOpen}
                supplierId={supplierId}
                supplierName={supplierName}
                templates={templates}
                onCreated={handleCreated}
            />

            <AlertDialog open={Boolean(pendingDelete)} onOpenChange={(o) => !o && setPendingDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete evaluation?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete{" "}
                            <span className="font-semibold text-slate-900">
                                {pendingDelete?.title}
                            </span>
                            ? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                void handleDelete();
                            }}
                            disabled={isDeleting}
                            className="bg-rose-600 hover:bg-rose-700"
                        >
                            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
