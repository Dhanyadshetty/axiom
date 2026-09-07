"use client";

import * as React from "react";
import { toast } from "sonner";
import { Search, Users, MoreVertical, Trash2, Check, Phone, Building2, Pencil, Edit2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    getContactsForPicker,
    assignContactToRequestSupplier,
    removeSupplierFromAssessment,
    type ContactPickerRow,
} from "@/app/actions/assessments";
import { SupplierNameLink, MailLink } from "./links";
import { AddSuppliersControl, type ConfirmedSupplier } from "./add-suppliers-modal";
import type { AssessmentDetail } from "@/lib/assessment-types";

function normalizeKey(value: string | null | undefined): string {
    return (value ?? "").trim().replace(/\s+/g, " ").toLowerCase();
}

type LocalContact = { email: string; name: string | null };
type LocalSupplierRow = {
    id: string;
    supplierId: string;
    supplierName: string | null;
    status: string;
    contacts: LocalContact[];
};

// Build the local rows from the server-provided supplier list so that suppliers
// added in a previous session (and persisted to the database) are reflected
// when the user returns to this step. Without this, `rows` started empty and
// only held optimistic client state, so added suppliers disappeared on revisit.
function rowsFromDetail(detail: AssessmentDetail): LocalSupplierRow[] {
    return (detail.suppliers ?? []).map((s) => ({
        id: s.id,
        supplierId: s.supplierId,
        supplierName: s.supplierName,
        status: s.status,
        contacts: (s.contacts ?? []).map((c) => ({
            email: c.contactEmail ?? "",
            name: c.contactName ?? null,
        })),
    }));
}

export function ParticipantsStep({
    detail,
    canManage,
    onMutated,
    registerSave,
    onSavingChange,
}: {
    detail: AssessmentDetail;
    canManage: boolean;
    onMutated: () => void;
    registerSave: (fn: (() => Promise<void>) | null) => void;
    onSavingChange?: (saving: boolean) => void;
}) {
    const [rows, setRows] = React.useState<LocalSupplierRow[]>(() => rowsFromDetail(detail));
    const [search, setSearch] = React.useState("");
    const [contactTarget, setContactTarget] = React.useState<{ arsId: string; supplierId: string; supplierName: string | null } | null>(null);
    const [isSavingSuppliers, setIsSavingSuppliers] = React.useState(false);
    const [, startTransition] = React.useTransition();

    // Keep the displayed rows in sync with the persisted supplier list whenever
    // the underlying assessment changes (e.g. returning to this request).
    React.useEffect(() => {
        setRows(rowsFromDetail(detail));
        // Re-seed only when switching to a different request, not on every
        // refresh — local optimistic state must survive refreshes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [detail.id]);

    // Mirror of rows for synchronous snapshots, plus the snapshot taken at the
    // moment of an optimistic merge so a failed server write can be rolled back.
    const rowsRef = React.useRef<LocalSupplierRow[]>(rows);
    const mergeSnapshotRef = React.useRef<LocalSupplierRow[] | null>(null);
    React.useEffect(() => { rowsRef.current = rows; }, [rows]);

    const handleSaveDraft = React.useCallback(async () => {
        onMutated();
    }, [onMutated]);

    React.useEffect(() => {
        if (!canManage) {
            registerSave(null);
            return;
        }
        registerSave(() => handleSaveDraft());
        return () => registerSave(null);
    }, [canManage, registerSave, handleSaveDraft]);

    // Optimistic merge: group the modal's confirmed rows by supplier and append
    // their contacts to local state immediately. The server write happens in the
    // background; on success we reconcile via refresh, on failure we roll back.
    const handleMerge = (merged: ConfirmedSupplier[]) => {
        mergeSnapshotRef.current = rowsRef.current;
        setIsSavingSuppliers(true);
        onSavingChange?.(true);
        setRows((prev) => {
            const next = [...prev];
            for (const m of merged) {
                const matchIdx = next.findIndex((r) =>
                    (r.supplierId && m.supplierId && r.supplierId === m.supplierId) ||
                    (!m.supplierId && normalizeKey(r.supplierName) === normalizeKey(m.supplierName))
                );
                if (matchIdx >= 0) {
                    const existing = next[matchIdx];
                    const contacts = [...existing.contacts];
                    for (const c of m.contacts) {
                        if (!contacts.some((x) => normalizeKey(x.email) === normalizeKey(c.email))) {
                            contacts.push({ email: c.email, name: c.name });
                        }
                    }
                    next[matchIdx] = { ...existing, contacts };
                } else {
                    next.push({
                        id: m.supplierId ? `new-${m.supplierId}` : `new-${normalizeKey(m.supplierName)}`,
                        supplierId: m.supplierId ?? "",
                        supplierName: m.supplierName,
                        status: "pending",
                        contacts: m.contacts.map((c) => ({ email: c.email, name: c.name })),
                    });
                }
            }
            return next;
        });
    };

    const handleReconcile = () => {
        setIsSavingSuppliers(false);
        onSavingChange?.(false);
        onMutated();
    };
    const handleRollback = () => {
        setIsSavingSuppliers(false);
        onSavingChange?.(false);
        if (mergeSnapshotRef.current) setRows(mergeSnapshotRef.current);
    };

    const filtered = React.useMemo(() => {
        const q = search.trim().toLowerCase();
        return rows.filter((s) => !q || (s.supplierName ?? "").toLowerCase().includes(q));
    }, [rows, search]);

    const handleRemove = (id: string) => {
        startTransition(async () => {
            // Optimistic removal
            setRows((prev) => prev.filter((r) => r.id !== id));
            const result = await removeSupplierFromAssessment(id);
            if (result.success) {
                toast.success("Supplier removed");
                onMutated();
            } else {
                toast.error(result.error || "Failed");
                // Rollback on failure - refetch would be needed but we don't sync with detail anymore
                // For now, just show error; user can refresh page if needed
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">Suppliers</h2>
                    <p className="text-sm text-slate-500">
                        Add the suppliers who should complete this assessment.
                    </p>
                </div>
                {canManage ? (
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Filter suppliers"
                                className="w-56 pl-9"
                            />
                        </div>
                        <AddSuppliersControl assessmentId={detail.id} requestTitle={detail.title} templateName={detail.template?.name ?? null} onAdded={handleMerge} onReconcile={handleReconcile} onRollback={handleRollback} />
                    </div>
                ) : (
                    <div className="relative w-56">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter suppliers" className="pl-9" />
                    </div>
                )}
            </div>

            {rows.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                    <Users className="mx-auto mb-3 h-9 w-9 text-slate-300" />
                    <p className="text-sm font-medium text-slate-600">No supplier added yet</p>
                    <p className="mt-1 text-xs text-slate-400">
                        {canManage
                            ? "Add Suppliers to invite them to this assessment."
                            : "The buyer has not added any suppliers to this request."}
                    </p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-xs font-black uppercase tracking-wider text-slate-500">
                            <tr className="border-b border-slate-200">
                                <th className="px-4 py-3 text-left">Supplier</th>
                                <th className="px-4 py-3 text-left">Contacts</th>
                                <th className="w-16 px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((s) => (
                                <tr key={s.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-7 w-7">
                                                <AvatarFallback className="bg-emerald-100 text-emerald-700 text-[10px]">
                                                    {(s.supplierName ?? "?").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                                                {s.supplierName ? (
                                                    <SupplierNameLink id={s.supplierId} name={s.supplierName} />
                                                ) : (
                                                    `Supplier ${s.supplierId.slice(0, 6)}`
                                                )}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col gap-1">
                                            {s.contacts.length === 0 ? (
                                                <span className="text-slate-400">No contact assigned</span>
                                            ) : (
                                                s.contacts.map((c, i) => (
                                                    <div key={`${c.email}-${i}`} className="flex items-center gap-2 text-sm">
                                                        <span className="font-medium text-slate-700">{c.name || c.email || "Unnamed"}</span>
                                                        {c.email ? <MailLink email={c.email} className="text-xs" /> : null}
                                                        {canManage ? (
                                                            <button
                                                                onClick={() => setContactTarget({ arsId: s.id, supplierId: s.supplierId, supplierName: s.supplierName })}
                                                                className="rounded p-0.5 text-slate-400 hover:bg-slate-100"
                                                                aria-label="Edit contact"
                                                            >
                                                                <Pencil className="h-3 w-3" />
                                                            </button>
                                                        ) : null}
                                                    </div>
                                                ))
                                            )}
                                            {canManage && s.contacts.length > 0 ? null : null}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {canManage ? (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="rounded-md p-1.5 text-slate-500 outline-none transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-emerald-400"
                                                        aria-label="More actions"
                                                    >
                                                        <MoreVertical className="h-5 w-5" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-52">
                                                    <DropdownMenuItem
                                                        onSelect={() =>
                                                            setContactTarget({ arsId: s.id, supplierId: s.supplierId, supplierName: s.supplierName })
                                                        }
                                                        className="gap-2"
                                                    >
                                                        <Edit2 className="h-4 w-4" /> Edit supplier
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onSelect={() => handleRemove(s.id)}
                                                        className="gap-2 text-rose-600 focus:bg-rose-50 focus:text-rose-700"
                                                    >
                                                        <Trash2 className="h-4 w-4" /> Remove supplier
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        ) : null}
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-4 py-8 text-center text-sm text-slate-400">
                                        No suppliers match your filter.
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>
            )}

            <ChooseContactDialog
                open={Boolean(contactTarget)}
                onOpenChange={(o) => { if (!o) setContactTarget(null); }}
                target={contactTarget}
                onAssigned={onMutated}
            />
        </div>
    );
}

function ChooseContactDialog({
    open,
    onOpenChange,
    target,
    onAssigned,
}: {
    open: boolean;
    onOpenChange: (o: boolean) => void;
    target: { arsId: string; supplierId: string; supplierName: string | null } | null;
    onAssigned: () => void;
}) {
    const [query, setQuery] = React.useState("");
    const [options, setOptions] = React.useState<ContactPickerRow[]>([]);
    const [selected, setSelected] = React.useState<string | null>(null);
    const [isPending, startTransition] = React.useTransition();

    React.useEffect(() => {
        if (!open || !target) return;
        let active = true;
        startTransition(async () => {
            const rows = await getContactsForPicker(target.supplierId, query);
            if (active) setOptions(rows);
        });
        return () => { active = false; };
    }, [open, target, query]);

    React.useEffect(() => {
        if (open) { setSelected(null); setQuery(""); }
    }, [open]);

    const handleAssign = () => {
        if (!selected || !target) return;
        startTransition(async () => {
            const result = await assignContactToRequestSupplier(target.arsId, selected);
            if (result.success) {
                toast.success("Contact assigned");
                onOpenChange(false);
                onAssigned();
            } else {
                toast.error(result.error || "Failed to assign contact");
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Choose a contact</DialogTitle>
                    <DialogDescription>
                        Select the contact at {target?.supplierName ?? "this supplier"} who should receive this assessment.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
                        <Building2 className="h-3.5 w-3.5" /> {target?.supplierName ?? "Supplier"}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" /> Active
                    </span>
                    <div className="relative ml-auto w-64">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search contacts" className="pl-9" />
                    </div>
                </div>

                <div className="max-h-80 overflow-y-auto rounded-xl border border-slate-200">
                    {options.length === 0 ? (
                        <p className="p-6 text-center text-sm text-slate-400">No active contacts found for this supplier.</p>
                    ) : (
                        options.map((o) => {
                            const checked = selected === o.id;
                            return (
                                <button
                                    key={o.id}
                                    onClick={() => setSelected(o.id)}
                                    className="flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left last:border-0 hover:bg-slate-50"
                                >
                                    <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${checked ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300"}`}>
                                        {checked ? <Check className="h-3.5 w-3.5" /> : null}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-slate-800">{o.name || o.email}</p>
                                        <p className="flex items-center gap-3 truncate text-xs text-slate-400">
                                            <MailLink email={o.email} />
                                            {o.phone ? <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{o.phone}</span> : null}
                                        </p>
                                    </div>
                                    {o.jobTitle ? (
                                        <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">{o.jobTitle}</span>
                                    ) : null}
                                </button>
                            );
                        })
                    )}
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Rows: {options.length}</span>
                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button onClick={handleAssign} disabled={isPending || !selected} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            {isPending ? "Adding..." : "Add contact"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
