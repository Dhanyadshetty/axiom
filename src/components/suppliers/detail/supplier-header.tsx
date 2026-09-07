"use client";

import * as React from "react";
import Link from "next/link";
import {
    ChevronRight,
    MoreHorizontal,
    PanelRightOpen,
    PanelRightClose,
    Building2,
    Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { deleteSupplier } from "@/app/actions/suppliers";
export type SectionKey =
    | "overview"
    | "properties"
    | "evaluations"
    | "activities"
    | "documents"
    | "contacts"
    | "articles"
    | "transactions"
    | "tools"
    | "views";

export interface SupplierHeaderProps {
    supplier: {
        id: string;
        supplierNumber?: string | null;
        name: string;
        countryCode?: string | null;
        countryName?: string | null;
        city?: string | null;
        website?: string | null;
    };
    section: SectionKey;
    supplierNumber: string;
    sidebarCollapsed: boolean;
    onToggleSidebar: () => void;
    /** Optional label for the last breadcrumb segment. Defaults to the section's tab label. */
    currentLabel?: string;
    /** Optional slot for extra header buttons (e.g. "Create new Evaluation"). */
    headerActions?: React.ReactNode;
}

const TABS: Array<{ key: string; label: string; href: (id: string) => string; dropdown?: boolean }> = [
    { key: "overview", label: "Overview", href: (id) => `/suppliers/${id}/overview` },
    { key: "properties", label: "Properties", href: (id) => `/suppliers/${id}/properties` },
    { key: "evaluations", label: "Evaluations", href: (id) => `/suppliers/${id}/evaluations` },
    { key: "activities", label: "Activities", href: () => "#" },
    { key: "documents", label: "Documents", href: () => "#" },
    { key: "contacts", label: "Contacts", href: (id) => `/suppliers/${id}/contacts` },
    { key: "articles", label: "Articles", href: () => "#" },
    { key: "transactions", label: "Transactions", href: () => "#", dropdown: true },
    { key: "tools", label: "Tools", href: () => "#", dropdown: true },
    { key: "views", label: "Individual views", href: () => "#", dropdown: true },
];

function flagEmoji(code: string | null | undefined): string {
    const normalized = (code || "").toUpperCase();
    if (!/^[A-Z]{2}$/.test(normalized)) return "🌐";
    return String.fromCodePoint(...normalized.split("").map((c) => 127397 + c.charCodeAt(0)));
}

export function SupplierHeader({
    supplier,
    section,
    supplierNumber,
    sidebarCollapsed,
    onToggleSidebar,
    currentLabel,
    headerActions,
}: SupplierHeaderProps) {
    const [deleteOpen, setDeleteOpen] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const router = useRouter();

    const displayName = supplier.name?.trim() || `#${supplier.supplierNumber ?? supplier.id}`;
    const breadcrumbCurrent =
        currentLabel ?? TABS.find((t) => t.key === section)?.label ?? "Supplier";

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const result = await deleteSupplier(supplier.id);
            if (result.success) {
                toast.success("Supplier deleted");
                setDeleteOpen(false);
                router.push("/suppliers");
                router.refresh();
            } else {
                toast.error(result.error || "Failed to delete supplier");
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to delete supplier");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <header className="border-b border-slate-200 bg-white">
            <div className="flex flex-col gap-3 px-6 pt-5 pb-2">
                <div className="flex flex-wrap items-center gap-2">
                    <SupplierBreadcrumb
                        supplierName={displayName}
                        supplierNumber={supplierNumber}
                        current={breadcrumbCurrent}
                    />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                                aria-label="More actions"
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-[180px]">
                            <DropdownMenuItem
                                onSelect={(e) => {
                                    e.preventDefault();
                                    setDeleteOpen(true);
                                }}
                                className="flex items-center gap-2 text-rose-600 focus:text-rose-700"
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete supplier
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    {headerActions ? (
                        <div className="ml-auto flex items-center gap-2">{headerActions}</div>
                    ) : null}
                </div>
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                            <Building2 className="h-7 w-7" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight text-slate-900">
                                {supplier.name}
                            </h1>
                            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
                                <span className="font-mono">#{supplier.supplierNumber ?? supplier.id}</span>
                                <span className="text-slate-300">·</span>
                                <span className="inline-flex items-center gap-1.5">
                                    <span aria-hidden>{flagEmoji(supplier.countryCode)}</span>
                                    {supplier.city ? `${supplier.city}, ` : ""}
                                    {supplier.countryName || supplier.countryCode || "—"}
                                </span>
                                {supplier.website ? (
                                    <>
                                        <span className="text-slate-300">·</span>
                                        <a
                                            href={
                                                supplier.website.startsWith("http")
                                                    ? supplier.website
                                                    : `https://${supplier.website}`
                                            }
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-blue-600 hover:underline"
                                        >
                                            {supplier.website.replace(/^https?:\/\//, "")}
                                        </a>
                                    </>
                                ) : null}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={onToggleSidebar}
                            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        >
                            {sidebarCollapsed ? (
                                <PanelRightOpen className="h-4 w-4" />
                            ) : (
                                <PanelRightClose className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                </div>
                <nav className="-mb-px flex flex-wrap items-center gap-1 overflow-x-auto">
                    {TABS.map((t) => {
                        const isActive = t.key === section;
                        const className = cn(
                            "inline-flex items-center gap-1 whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors",
                            isActive
                                ? "border-emerald-600 text-emerald-700"
                                : "border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900",
                        );
                        if (t.href(supplierNumber) === "#") {
                            return (
                                <button key={t.key} type="button" className={className}>
                                    {t.label}
                                    {t.dropdown ? <ChevronRight className="h-3.5 w-3.5 -rotate-90" /> : null}
                                </button>
                            );
                        }
                        return (
                            <Link key={t.key} href={t.href(supplierNumber)} className={className}>
                                {t.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>
            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete supplier?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this supplier? This action cannot be undone.
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
        </header>
    );
}

export function SupplierBreadcrumb({
    supplierName,
    supplierNumber,
    current,
}: {
    supplierName: string;
    supplierNumber: string;
    current: string;
}) {
    return (
        <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500"
        >
            <Link href="/suppliers" className="hover:text-emerald-700 hover:underline">
                Suppliers
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <Link
                href={`/suppliers/${supplierNumber}/overview`}
                className="hover:text-emerald-700 hover:underline"
            >
                {supplierName}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <span
                aria-current="page"
                className="font-semibold text-slate-900"
            >
                {current}
            </span>
        </nav>
    );
}
