"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ClipboardList,
    ExternalLink,
    FileText,
    Loader2,
    MoreVertical,
    Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
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
import { Can } from "@/components/suppliers/suppliers-rbac";
import { deleteSupplier } from "@/app/actions/suppliers";

export interface SupplierRowMenuProps {
    supplierId: string;
    supplierName?: string;
    onCreateEvaluation?: (supplierId: string) => void;
    /** When true, the icon is always visible. Defaults to "visible on hover". */
    alwaysVisible?: boolean;
    className?: string;
}

export function SupplierRowMenu({
    supplierId,
    supplierName,
    onCreateEvaluation,
    alwaysVisible = false,
    className,
}: SupplierRowMenuProps) {
    const router = useRouter();
    const [deleteOpen, setDeleteOpen] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const result = await deleteSupplier(supplierId);
            if (result.success) {
                toast.success(`Supplier ${supplierName ? `"${supplierName}" ` : ""}deleted`);
                setDeleteOpen(false);
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
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Supplier actions"
                        title="Supplier actions"
                        className={cn(
                            "h-7 w-7 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800",
                            !alwaysVisible &&
                                "opacity-0 transition-opacity group-hover/row:opacity-100 group-focus-within/row:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100",
                            className,
                        )}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={4} className="min-w-[200px]">
                    <DropdownMenuLabel className="text-xs font-normal text-slate-500">
                        {supplierName ? truncate(supplierName, 36) : "Supplier actions"}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="flex items-center gap-2"
                        onSelect={(e) => {
                            e.preventDefault();
                            const url = `/suppliers/${supplierId}/overview`;
                            if (typeof window !== "undefined") {
                                window.open(url, "_blank", "noopener,noreferrer");
                            }
                        }}
                    >
                        <ExternalLink className="h-4 w-4 text-slate-500" />
                        Open in new tab
                    </DropdownMenuItem>
                    <Can permission="suppliers.edit">
                        <DropdownMenuItem
                            className="flex items-center gap-2"
                            onSelect={(e) => {
                                e.preventDefault();
                                onCreateEvaluation?.(supplierId);
                            }}
                        >
                            <FileText className="h-4 w-4 text-slate-500" />
                            Create new Evaluation
                        </DropdownMenuItem>
                    </Can>
                    <DropdownMenuItem asChild className="flex items-center gap-2">
                        <Link href={`/suppliers/${supplierId}/evaluations`}>
                            <ClipboardList className="h-4 w-4 text-slate-500" />
                            Show all Evaluations
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <Can permission="suppliers.delete">
                        <DropdownMenuItem
                            onSelect={(e) => {
                                e.preventDefault();
                                setDeleteOpen(true);
                            }}
                            className="flex items-center gap-2 text-rose-600 focus:text-rose-700"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete Supplier
                        </DropdownMenuItem>
                    </Can>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete supplier?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {supplierName ? (
                                <>
                                    Are you sure you want to delete{" "}
                                    <span className="font-semibold text-slate-900">{supplierName}</span>?
                                </>
                            ) : (
                                "Are you sure you want to delete this supplier?"
                            )}{" "}
                            This action cannot be undone.
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
        </>
    );
}

function truncate(value: string, max: number) {
    if (value.length <= max) return value;
    return value.slice(0, max - 1) + "…";
}
