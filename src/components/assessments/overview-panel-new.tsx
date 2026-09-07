"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Users, UserCheck, Calendar, Building2, Mail, CheckCircle2, MoreHorizontal, Clock, Search, FileText, Filter, ArrowUpDown, Send, Edit, ExternalLink, UserCog, Loader2, Bell, Mail as MailIcon, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectGroup,
    SelectLabel,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AssessmentDetail } from "@/lib/assessment-types";
import { AddSuppliersControl } from "./add-suppliers-modal";
import { resendInvitation, assignContactToRequestSupplier } from "@/app/actions/assessments";

import {
    supplierStatusStyles,
    reviewStatusStyles,
    initials,
    formatDate,
    formatDateTime,
    truncate,
} from "./shared-constants";

interface SupplierRowProps {
    supplier: AssessmentDetail["suppliers"][number];
    index: number;
    assessmentRequestId: string;
    referenceDate: Date;
    onOpenResponse: (supplierId: string, assessmentRequestSupplierId: string) => void;
    onEditResponse: (supplierId: string, assessmentRequestSupplierId: string) => void;
    onSendReminder: (assessmentRequestSupplierId: string) => Promise<void>;
    onSendEmail: (assessmentRequestSupplierId: string) => Promise<void>;
    onChangeResponsible: (supplier: AssessmentDetail["suppliers"][number]) => void;
}

function SupplierRow({ supplier, index, assessmentRequestId, referenceDate, onOpenResponse, onEditResponse, onSendReminder, onSendEmail, onChangeResponsible }: SupplierRowProps) {
    const status = supplierStatusStyles[supplier.status] ?? supplierStatusStyles.pending;
    const reviewStatus = supplier.status === "submitted" || supplier.status === "completed"
        ? reviewStatusStyles.not_reviewed
        : reviewStatusStyles.not_reviewed;
    
    const primaryContact = supplier.contacts[0];
    const additionalContactsCount = supplier.contacts.length - 1;

    return (
        <tr key={supplier.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70">
            <td className="px-4 py-3 w-10">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
            </td>
            <td className="px-4 py-3 min-w-[180px]">
                <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">
                        {initials(supplier.supplierName)}
                    </span>
                    <span className="font-medium text-slate-900 truncate max-w-[160px]">
                        {supplier.supplierName ?? `Supplier ${supplier.supplierId.slice(0, 6)}`}
                    </span>
                </div>
            </td>
            <td className="px-4 py-3 min-w-[200px]">
                <div className="flex items-center gap-2">
                    {primaryContact ? (
                        <>
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[10px] font-medium text-slate-600">
                                {initials(primaryContact.contactName)}
                            </span>
                            <span className="font-medium text-slate-900 truncate max-w-[140px]">
                                {primaryContact.contactName ?? primaryContact.contactEmail ?? "Unnamed"}
                            </span>
                            {additionalContactsCount > 0 && (
                                <Badge variant="secondary" className="border-slate-200 bg-slate-50 text-slate-600 text-[10px] px-1.5 py-0.5">
                                    +{additionalContactsCount}
                                </Badge>
                            )}
                        </>
                    ) : (
                        <span className="text-slate-400 text-sm">No contact assigned</span>
                    )}
                </div>
            </td>
            <td className="px-4 py-3 min-w-[160px]">
                <Badge variant="outline" className={status.badge}>
                    <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${status.dot}`} />
                    {status.label}
                </Badge>
            </td>
            <td className="px-4 py-3 min-w-[140px]">
                <Badge variant="outline" className={reviewStatus.badge}>
                    {reviewStatus.icon}
                    <span className="ml-1">{reviewStatus.label}</span>
                </Badge>
            </td>
            <td className="px-4 py-3 min-w-[120px] text-slate-500 text-sm">
                {supplier.status === "sent" || supplier.status === "in_progress"
                    ? formatDate(new Date(referenceDate.getTime() - 86400000))
                    : "—"}
            </td>
            <td className="px-4 py-3 min-w-[120px] text-slate-500 text-sm">
                {supplier.status === "sent" || supplier.status === "in_progress"
                    ? formatDate(new Date(referenceDate.getTime() + 86400000 * 3))
                    : "—"}
            </td>
            <td className="px-4 py-3 w-10 text-right">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            onClick={(e) => e.stopPropagation()}
                            className="rounded-md p-1.5 text-slate-400 outline-none transition-colors hover:bg-slate-100 hover:text-slate-700"
                            aria-label="More actions"
                        >
                            <MoreHorizontal className="h-5 w-5" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuItem 
                            onSelect={() => onOpenResponse(supplier.supplierId, supplier.id)} 
                            className="gap-2 flex items-center"
                        >
                            <ExternalLink className="h-4 w-4" />
                            Open response in new tab
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                            onSelect={() => onEditResponse(supplier.supplierId, supplier.id)} 
                            className="gap-2 flex items-center"
                        >
                            <Edit className="h-4 w-4" />
                            Edit response
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            onSelect={() => onSendReminder(supplier.id)} 
                            className="gap-2 flex items-center"
                            disabled={supplier.status !== "sent" && supplier.status !== "in_progress"}
                        >
                            <Bell className="h-4 w-4" />
                            Send Reminder
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                            onSelect={() => onSendEmail(supplier.id)} 
                            className="gap-2 flex items-center"
                        >
                            <MailIcon className="h-4 w-4" />
                            Send email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            onSelect={() => onChangeResponsible(supplier)} 
                            className="gap-2 flex items-center"
                        >
                            <UserCog className="h-4 w-4" />
                            Change responsible
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </td>
        </tr>
    );
}

export function OverviewPanelNew({ detail, canManage }: { detail: AssessmentDetail; canManage: boolean }) {
    const router = useRouter();
    const [search, setSearch] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState<string>("all");
    const [sortConfig, setSortConfig] = React.useState<{ key: string; direction: "asc" | "desc" } | null>(null);
    const [changeResponsibleOpen, setChangeResponsibleOpen] = React.useState(false);
    const [selectedSupplierForResponsible, setSelectedSupplierForResponsible] = React.useState<AssessmentDetail["suppliers"][number] | null>(null);
    const [responsibleSearch, setResponsibleSearch] = React.useState("");
    const [responsibleContacts, setResponsibleContacts] = React.useState<{ contactId: string; contactName: string | null; contactEmail: string }[]>([]);
    const [loadingResponsibleContacts, setLoadingResponsibleContacts] = React.useState(false);
    const [selectedResponsibleContactId, setSelectedResponsibleContactId] = React.useState<string>("");
    const [changingResponsible, setChangingResponsible] = React.useState(false);

    const handleSort = (key: string) => {
        setSortConfig((current) => {
            if (current?.key === key && current.direction === "asc") {
                return { key, direction: "desc" };
            }
            return { key, direction: "asc" };
        });
    };

    const sortedAndFilteredSuppliers = React.useMemo(() => {
        const q = search.trim().toLowerCase();
        let result = detail.suppliers.filter((s) => {
            const matchesSearch =
                !q ||
                (s.supplierName ?? "").toLowerCase().includes(q) ||
                (s.contactName ?? "").toLowerCase().includes(q) ||
                (s.contactEmail ?? "").toLowerCase().includes(q) ||
                s.contacts.some(
                    (c) =>
                        (c.contactName ?? "").toLowerCase().includes(q) ||
                        (c.contactEmail ?? "").toLowerCase().includes(q)
                );
            const matchesStatus = statusFilter === "all" || s.status === statusFilter;
            return matchesSearch && matchesStatus;
        });

        if (sortConfig) {
            result = [...result].sort((a, b) => {
                let aVal: string | number = "";
                let bVal: string | number = "";

                switch (sortConfig.key) {
                    case "supplierName":
                        aVal = a.supplierName ?? "";
                        bVal = b.supplierName ?? "";
                        break;
                    case "contactName":
                        aVal = a.contacts[0]?.contactName ?? "";
                        bVal = b.contacts[0]?.contactName ?? "";
                        break;
                    case "status":
                        aVal = a.status;
                        bVal = b.status;
                        break;
                    case "reviewStatus":
                        aVal = a.status === "submitted" || a.status === "completed" ? "not_reviewed" : "not_reviewed";
                        bVal = b.status === "submitted" || b.status === "completed" ? "not_reviewed" : "not_reviewed";
                        break;
                    case "lastReminder":
                        aVal = a.status === "sent" || a.status === "in_progress" ? 1 : 0;
                        bVal = b.status === "sent" || b.status === "in_progress" ? 1 : 0;
                        break;
                    case "nextReminder":
                        aVal = a.status === "sent" || a.status === "in_progress" ? 1 : 0;
                        bVal = b.status === "sent" || b.status === "in_progress" ? 1 : 0;
                        break;
                }

                if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [detail.suppliers, search, statusFilter, sortConfig]);

    const referenceDate = React.useMemo(() => new Date(), []);

    const statusOptions = [
        { value: "all", label: "All statuses" },
        { value: "pending", label: "Pending" },
        { value: "sent", label: "Sent" },
        { value: "in_progress", label: "Response in progress" },
        { value: "submitted", label: "Submitted" },
        { value: "completed", label: "Completed" },
        { value: "rejected", label: "Rejected" },
    ];

    const handleSuppliersAdded = () => {
        router.refresh();
    };

    // Action handlers
    const handleOpenResponse = (supplierId: string, assessmentRequestSupplierId: string) => {
        const url = `/requests/assessments/${detail.id}?tab=responses&assessmentRequestId=${assessmentRequestSupplierId}`;
        window.open(url, "_blank", "noopener,noreferrer");
    };

    const handleEditResponse = (supplierId: string, assessmentRequestSupplierId: string) => {
        const url = `/external/assessments/${detail.id}/requests/${assessmentRequestSupplierId}`;
        window.open(url, "_blank", "noopener,noreferrer");
    };

    const handleSendReminder = async (assessmentRequestSupplierId: string) => {
        const result = await resendInvitation(assessmentRequestSupplierId);
        if (result.success) {
            toast.success("Reminder sent successfully");
            router.refresh();
        } else {
            toast.error(result.error || "Failed to send reminder");
        }
    };

    const handleSendEmail = async (assessmentRequestSupplierId: string) => {
        // Send email uses the same template/action as Send Reminder
        const result = await resendInvitation(assessmentRequestSupplierId);
        if (result.success) {
            toast.success("Email sent successfully");
            router.refresh();
        } else {
            toast.error(result.error || "Failed to send email");
        }
    };

    const handleChangeResponsible = async (supplier: AssessmentDetail["suppliers"][number]) => {
        setSelectedSupplierForResponsible(supplier);
        setSelectedResponsibleContactId(supplier.contactId ?? "");
        setResponsibleSearch("");
        setLoadingResponsibleContacts(true);
        try {
            // Fetch all contacts for this supplier
            const response = await fetch(`/api/assessments/${detail.id}/suppliers/${supplier.supplierId}/contacts`);
            if (response.ok) {
                const data = await response.json();
                setResponsibleContacts(data.contacts || []);
            } else {
                // Fallback to contacts from the supplier data
                setResponsibleContacts(
                    supplier.contacts.map((c) => ({
                        contactId: c.contactId ?? "",
                        contactName: c.contactName,
                        contactEmail: c.contactEmail ?? "",
                    }))
                );
            }
        } catch (error) {
            console.error("Failed to load contacts:", error);
            setResponsibleContacts(
                supplier.contacts.map((c) => ({
                    contactId: c.contactId ?? "",
                    contactName: c.contactName,
                    contactEmail: c.contactEmail ?? "",
                }))
            );
        } finally {
            setLoadingResponsibleContacts(false);
        }
        setChangeResponsibleOpen(true);
    };

    const handleConfirmChangeResponsible = async () => {
        if (!selectedSupplierForResponsible || !selectedResponsibleContactId || changingResponsible) return;
        setChangingResponsible(true);
        try {
            const result = await assignContactToRequestSupplier(selectedSupplierForResponsible.id, selectedResponsibleContactId);
            if (result.success) {
                toast.success("Responsible person updated");
                setChangeResponsibleOpen(false);
                router.refresh();
            } else {
                toast.error(result.error || "Failed to update responsible person");
            }
        } catch (error) {
            console.error("Failed to change responsible:", error);
            toast.error("Failed to update responsible person");
        } finally {
            setChangingResponsible(false);
        }
    };

    const filteredResponsibleContacts = React.useMemo(() => {
        const q = responsibleSearch.trim().toLowerCase();
        return responsibleContacts.filter(
            (c) =>
                !q ||
                (c.contactName ?? "").toLowerCase().includes(q) ||
                c.contactEmail.toLowerCase().includes(q)
        );
    }, [responsibleContacts, responsibleSearch]);

    return (
        <div className="space-y-6">
            {/* Header with breadcrumb, title, swap icon, and status */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100">
                        <Users className="h-4 w-4 text-emerald-600" />
                    </span>
                    <div className="min-w-0">
                        <h1 className="text-xl font-bold text-slate-900 truncate">
                            {detail.id.slice(0, 8)}: {detail.title}
                        </h1>
                        <p className="text-sm text-slate-500">
                            {detail.suppliers.length} suppliers · {detail.documentRequestGroups.reduce((sum, g) => sum + g.documents.length, 0)} document requests
                        </p>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>Duplicate request</DropdownMenuItem>
                            <DropdownMenuItem>Export to PDF</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${supplierStatusStyles[detail.status]?.badge ?? supplierStatusStyles.draft.badge}`}>
                        <span className={`h-2 w-2 rounded-full ${supplierStatusStyles[detail.status]?.dot ?? supplierStatusStyles.draft.dot}`} />
                        {supplierStatusStyles[detail.status]?.label ?? "Draft"}
                    </span>
            </div>

            <hr className="border-slate-200" />

            {/* Suppliers table */}
            <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-slate-900">Suppliers</h2>
                        <Badge variant="outline" className="border-slate-200 bg-slate-50">
                            {detail.suppliers.length} suppliers
                        </Badge>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        {canManage && detail.status !== "closed" ? (
                            <AddSuppliersControl
                                assessmentId={detail.id}
                                requestTitle={detail.title}
                                templateName={detail.template?.name ?? null}
                                onAdded={handleSuppliersAdded}
                                onReconcile={handleSuppliersAdded}
                                onRollback={() => {}}
                            />
                        ) : null}
                        <div className="relative inline-block">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="gap-1.5">
                                        <Filter className="h-3.5 w-3.5" /> Add filter
                                        {statusFilter !== "all" ? (
                                            <Badge variant="secondary" className="ml-1">{statusOptions.find((o) => o.value === statusFilter)?.label}</Badge>
                                        ) : null}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-64">
                                    <div className="p-2">
                                        <p className="mb-1 px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                            Filter by status
                                        </p>
                                        {statusOptions.map((opt) => {
                                            const active = statusFilter === opt.value;
                                            return (
                                                <button
                                                    key={opt.value}
                                                    onClick={() => setStatusFilter(opt.value)}
                                                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-slate-100"
                                                >
                                                    <span className={`flex h-4 w-4 items-center justify-center rounded border ${active ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300"}`}>
                                                        {active ? <CheckCircle2 className="h-3 w-3" /> : null}
                                                    </span>
                                                    {opt.label}
                                                </button>
                                            );
                                        })}
                                        {statusFilter !== "all" ? (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="mt-1 w-full"
                                                onClick={() => setStatusFilter("all")}
                                            >
                                                Clear filter
                                            </Button>
                                        ) : null}
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search suppliers or contacts…"
                                className="h-9 w-64 pl-9 pr-4 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                    <div className="max-h-[60vh] overflow-auto">
                        <table className="w-full min-w-[1200px] text-sm">
                            <thead className="sticky top-0 z-10 bg-slate-50 text-xs font-black uppercase tracking-wider text-slate-500">
                                <tr className="border-b border-slate-200">
                                    <th className="px-4 py-3 text-left w-10">
                                        <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                                    </th>
                                    <th className="px-4 py-3 text-left min-w-[180px] cursor-pointer hover:bg-slate-100 select-none" onClick={() => handleSort("supplierName")}>
                                        <div className="flex items-center gap-1">
                                            Supplier
                                            {sortConfig?.key === "supplierName" && (
                                                <ArrowUpDown className="h-3 w-3 text-slate-400" />
                                            )}
                                        </div>
                                    </th>
                                    <th className="px-4 py-3 text-left min-w-[200px] cursor-pointer hover:bg-slate-100 select-none" onClick={() => handleSort("contactName")}>
                                        <div className="flex items-center gap-1">
                                            Contacts
                                            {sortConfig?.key === "contactName" && (
                                                <ArrowUpDown className="h-3 w-3 text-slate-400" />
                                            )}
                                        </div>
                                    </th>
                                    <th className="px-4 py-3 text-left min-w-[160px] cursor-pointer hover:bg-slate-100 select-none" onClick={() => handleSort("status")}>
                                        <div className="flex items-center gap-1">
                                            Status
                                            {sortConfig?.key === "status" && (
                                                <ArrowUpDown className="h-3 w-3 text-slate-400" />
                                            )}
                                        </div>
                                    </th>
                                    <th className="px-4 py-3 text-left min-w-[140px] cursor-pointer hover:bg-slate-100 select-none" onClick={() => handleSort("reviewStatus")}>
                                        <div className="flex items-center gap-1">
                                            Review status
                                            {sortConfig?.key === "reviewStatus" && (
                                                <ArrowUpDown className="h-3 w-3 text-slate-400" />
                                            )}
                                        </div>
                                    </th>
                                    <th className="px-4 py-3 text-left min-w-[120px] cursor-pointer hover:bg-slate-100 select-none" onClick={() => handleSort("lastReminder")}>
                                        <div className="flex items-center gap-1">
                                            Last reminder
                                            {sortConfig?.key === "lastReminder" && (
                                                <ArrowUpDown className="h-3 w-3 text-slate-400" />
                                            )}
                                        </div>
                                    </th>
                                    <th className="px-4 py-3 text-left min-w-[120px] cursor-pointer hover:bg-slate-100 select-none" onClick={() => handleSort("nextReminder")}>
                                        <div className="flex items-center gap-1">
                                            Next reminder
                                            {sortConfig?.key === "nextReminder" && (
                                                <ArrowUpDown className="h-3 w-3 text-slate-400" />
                                            )}
                                        </div>
                                    </th>
                                    <th className="px-4 py-3 text-right w-10"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {detail.suppliers.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                                            No suppliers added yet.
                                        </td>
                                    </tr>
                                ) : sortedAndFilteredSuppliers.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                                            No suppliers match the current filter.
                                        </td>
                                    </tr>
                                ) : (
                                    sortedAndFilteredSuppliers.map((s, i) => (
                                        <SupplierRow
                                            key={s.id}
                                            supplier={s}
                                            index={i}
                                            assessmentRequestId={detail.id}
                                            referenceDate={referenceDate}
                                            onOpenResponse={handleOpenResponse}
                                            onEditResponse={handleEditResponse}
                                            onSendReminder={handleSendReminder}
                                            onSendEmail={handleSendEmail}
                                            onChangeResponsible={handleChangeResponsible}
                                        />
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Change Responsible Modal */}
            {changeResponsibleOpen && selectedSupplierForResponsible && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="w-full max-w-md rounded-2xl bg-white shadow-xl overflow-hidden">
                    <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                        <h3 className="text-lg font-semibold text-slate-900">Change responsible</h3>
                        <button
                            onClick={() => setChangeResponsibleOpen(false)}
                            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                            aria-label="Close"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="p-5 space-y-4">
                        <div>
                            <Label htmlFor="responsible-select" className="block text-sm font-medium text-slate-700 mb-2">
                                Responsible <span className="text-rose-500">*</span>
                            </Label>
                            <Select value={selectedResponsibleContactId} onValueChange={setSelectedResponsibleContactId}>
                                <SelectTrigger className="w-full" id="responsible-select">
                                    <SelectValue placeholder="Select a contact..." />
                                </SelectTrigger>
                                <SelectContent position="popper" className="w-[--radix-select-trigger-width] max-h-72">
                                    <div className="relative px-2 pb-2 pt-1">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                        <Input
                                            type="search"
                                            value={responsibleSearch}
                                            onChange={(e) => setResponsibleSearch(e.target.value)}
                                            onKeyDown={(e) => e.stopPropagation()}
                                            placeholder="Search contacts..."
                                            className="pl-9"
                                            aria-label="Search contacts"
                                        />
                                    </div>
                                    <SelectGroup>
                                        <SelectLabel className="px-2 py-1.5 text-xs font-semibold text-slate-500">Contacts for {selectedSupplierForResponsible.supplierName}</SelectLabel>
                                        {loadingResponsibleContacts ? (
                                            <div className="flex items-center justify-center py-4">
                                                <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
                                            </div>
                                        ) : filteredResponsibleContacts.length === 0 ? (
                                            <SelectItem value="" disabled className="px-2 py-3 text-slate-400 text-center">
                                                No contacts found
                                            </SelectItem>
                                        ) : (
                                            filteredResponsibleContacts.map((contact) => (
                                                <SelectItem key={contact.contactId} value={contact.contactId} className="px-2 py-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-medium text-slate-600">
                                                            {initials(contact.contactName)}
                                                        </span>
                                                        <span className="font-medium text-slate-900 truncate">{contact.contactName ?? "Unnamed"}</span>
                                                        <span className="ml-auto pl-3 text-xs text-slate-500 truncate">{contact.contactEmail}</span>
                                                    </div>
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={() => setChangeResponsibleOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleConfirmChangeResponsible} disabled={!selectedResponsibleContactId || changingResponsible}>
                                {changingResponsible ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        )}
        </div>
    );
}

// Right Sidebar Component
export function OverviewSidebar({ detail }: { detail: AssessmentDetail }) {
    const [detailsOpen, setDetailsOpen] = React.useState(true);
    const [moreInfoOpen, setMoreInfoOpen] = React.useState(true);

    const detailsContent = (
        <dl className="space-y-4 text-sm">
            <div>
                <dt className="text-slate-500">Status</dt>
                <dd className="mt-1 flex items-center gap-2">
                    <span className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${supplierStatusStyles[detail.status]?.badge ?? supplierStatusStyles.draft.badge}`}>
                        <span className={`h-2 w-2 rounded-full ${supplierStatusStyles[detail.status]?.dot ?? supplierStatusStyles.draft.dot}`} />
                        {supplierStatusStyles[detail.status]?.label ?? "Draft"}
                    </span>
                </dd>
            </div>
            <div>
                <dt className="text-slate-500">Responsible</dt>
                <dd className="mt-1 flex items-center gap-2">
                    <Avatar className="h-7 w-7">
                        {detail.responsible?.image ? (
                            <AvatarImage src={detail.responsible.image} alt="" />
                        ) : (
                            <AvatarFallback className="text-[9px]">{initials(detail.responsible?.name ?? null)}</AvatarFallback>
                        )}
                    </Avatar>
                    <span className="text-slate-900">{detail.responsible?.name ?? "—"}</span>
                </dd>
            </div>
            <div>
                <dt className="text-slate-500">Team</dt>
                <dd className="mt-1">
                    {detail.teamIds?.length ? (
                        <div className="flex -space-x-2">
                            {detail.teamIds.slice(0, 5).map((teamId, i) => (
                                <Avatar key={teamId} className="h-7 w-7 border-2 border-white">
                                    <AvatarFallback className="text-[9px]">{i + 1}</AvatarFallback>
                                </Avatar>
                            ))}
                            {detail.teamIds.length > 5 && (
                                <Avatar className="h-7 w-7 border-2 border-white bg-slate-100">
                                    <AvatarFallback className="text-[9px]">+{detail.teamIds.length - 5}</AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    ) : (
                        <span className="text-slate-400">No team members</span>
                    )}
                </dd>
            </div>
            <div>
                <dt className="text-slate-500">Deadline</dt>
                <dd className="mt-1 flex items-center gap-1.5 text-slate-900">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    {detail.dueDate ? formatDate(detail.dueDate) : "Not set"}
                </dd>
            </div>
        </dl>
    );

    const moreInfoContent = (
        <dl className="space-y-4 text-sm">
            <div>
                <dt className="text-slate-500">Created by</dt>
                <dd className="mt-1 flex items-center gap-2">
                    <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-[9px]">{initials(detail.createdBy?.name ?? null)}</AvatarFallback>
                    </Avatar>
                    <span className="text-slate-900">{detail.createdBy?.name ?? "—"}</span>
                </dd>
            </div>
            <div>
                <dt className="text-slate-500">Created at</dt>
                <dd className="mt-1 flex items-center gap-1.5 text-slate-900">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    {formatDateTime(detail.createdAt)}
                </dd>
            </div>
            <div>
                <dt className="text-slate-500">Template</dt>
                <dd className="mt-1 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-slate-900 truncate max-w-[200px]">{detail.template?.name ?? "—"}</span>
                </dd>
            </div>
        </dl>
    );

    return (
        <aside className="w-full lg:w-80 space-y-4">
            {/* Details Section */}
            <Card className="border-slate-200">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                            Details
                        </CardTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 p-0"
                            onClick={() => setDetailsOpen(!detailsOpen)}
                        >
                            <ChevronUp className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {detailsContent}
                </CardContent>
            </Card>

            {/* More Information Section */}
            <Card className="border-slate-200">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                            More information
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <dl className="space-y-4 text-sm">
                        <div>
                            <dt className="text-slate-500">Created by</dt>
                            <dd className="mt-1 flex items-center gap-2">
                                <Avatar className="h-7 w-7">
                                    <AvatarFallback className="text-[9px]">{initials(detail.createdBy?.name ?? null)}</AvatarFallback>
                                </Avatar>
                                <span className="text-slate-900">{detail.createdBy?.name ?? "—"}</span>
                            </dd>
                        </div>
                        <div>
                            <dt className="text-slate-500">Created at</dt>
                            <dd className="mt-1 flex items-center gap-1.5 text-slate-900">
                                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                {formatDateTime(detail.createdAt)}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-slate-500">Template</dt>
                            <dd className="mt-1 flex items-center gap-1.5">
                                <FileText className="h-3.5 w-3.5 text-slate-400" />
                                <span className="text-slate-900 truncate max-w-[200px]">{detail.template?.name ?? "—"}</span>
                            </dd>
                        </div>
                    </dl>
                </CardContent>
            </Card>
        </aside>
    );
}

export {
    supplierStatusStyles,
    reviewStatusStyles,
    initials,
    formatDate,
    formatDateTime,
    truncate,
} from "./shared-constants";