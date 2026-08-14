'use client';

import Link from "next/link";
import React, { useState, useTransition } from "react";
import { Check, ExternalLink, Loader2, Repeat, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";

import { approveRequisition, convertToPO, rejectRequisition } from "@/app/actions/requisitions";
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
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils/currency";
import { useLanguage } from "@/components/i18n/language-provider";
import { t } from "@/lib/i18n";

interface RequisitionActionsProps {
    requisitionId: string;
    title: string;
    estimatedAmount: number;
    status: string;
    isAdmin: boolean;
    suppliers: any[];
    purchaseOrderId?: string | null;
}

export function RequisitionActions({
    requisitionId,
    title,
    estimatedAmount,
    status,
    isAdmin,
    suppliers,
    purchaseOrderId,
}: RequisitionActionsProps) {
    const { language } = useLanguage();
    const tc = t(language, "sourcing");
    const [isPending, startTransition] = useTransition();
    const [convertOpen, setConvertOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<string>("");
    const [approveOpen, setApproveOpen] = useState(false);
    const [rejectOpen, setRejectOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState("");

    const highValue = estimatedAmount >= 500000;

    const handleApprove = () => {
        startTransition(async () => {
            const result = await approveRequisition(requisitionId);
            if (result.success) {
                toast.success(tc.requisitionApproved);
                setApproveOpen(false);
            } else {
                toast.error(result.error || tc.approvalFailed);
            }
        });
    };

    const handleReject = () => {
        if (!rejectReason.trim()) {
            toast.error(tc.provideRejectionReason);
            return;
        }

        startTransition(async () => {
            const result = await rejectRequisition(requisitionId, rejectReason.trim());
            if (result.success) {
                toast.success(tc.requisitionRejected);
                setRejectOpen(false);
                setRejectReason("");
            } else {
                toast.error(result.error || tc.rejectionFailed);
            }
        });
    };

    const handleConvert = () => {
        if (!selectedSupplier) {
            toast.error(tc.selectSupplier);
            return;
        }

        startTransition(async () => {
            const result = await convertToPO(requisitionId, selectedSupplier);
            if (result.success) {
                toast.success(tc.convertedToPO);
                setConvertOpen(false);
            } else {
                toast.error(result.error || tc.conversionFailed);
            }
        });
    };

    if (status === 'converted_to_po' && purchaseOrderId) {
        return (
            <Link href={`/sourcing/orders/${purchaseOrderId}`}>
                <Button variant="outline" size="sm" className="h-9 gap-1 text-xs">
                    <ExternalLink size={12} />
                    {tc.viewPO}
                </Button>
            </Link>
        );
    }

    if (!isAdmin) {
        return (
            <Button variant="ghost" size="sm" className="h-9 text-xs text-muted-foreground" disabled>
                {tc.awaitingApproval}
            </Button>
        );
    }

    return (
        <div className="flex items-center justify-end gap-2">
            {status === 'pending_approval' && (
                <>
                    <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
                        <DialogTrigger asChild>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-9 gap-1 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                                disabled={isPending}
                            >
                                <X size={14} />
                                {tc.reject}
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{tc.rejectRequisitionTitle}</DialogTitle>
                                <DialogDescription>
                                    {tc.rejectReasonDesc}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-3 py-2">
                                <Label htmlFor={`reject-reason-${requisitionId}`}>{tc.reason}</Label>
                                <Textarea
                                    id={`reject-reason-${requisitionId}`}
                                    value={rejectReason}
                                    onChange={(event) => setRejectReason(event.target.value)}
                                    placeholder={tc.rejectReasonPlaceholder}
                                    className="min-h-[120px]"
                                />
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setRejectOpen(false)}>{tc.cancel}</Button>
                                <Button
                                    onClick={handleReject}
                                    disabled={isPending || !rejectReason.trim()}
                                    className="bg-red-600 text-white hover:bg-red-700"
                                >
                                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <X className="mr-2 h-4 w-4" />}
                                    {tc.rejectRequisition}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <AlertDialog open={approveOpen} onOpenChange={setApproveOpen}>
                        <Button
                            size="sm"
                            className={`h-10 gap-2 ${highValue ? 'bg-emerald-700 px-4 shadow-lg hover:bg-emerald-800' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                            onClick={() => setApproveOpen(true)}
                            disabled={isPending}
                        >
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check size={14} />}
                            {highValue ? tc.approveSpend : tc.approve}
                        </Button>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>{tc.approveRequisitionTitle}</AlertDialogTitle>
                                <AlertDialogDescription>
                                    <span className="block font-medium text-foreground">{title}</span>
                                    <span className="mt-2 block">
                                        {tc.approveMoveText.replace("{amount}", formatCurrency(estimatedAmount))}
                                    </span>
                                    {highValue && (
                                        <span className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-800">
                                            <ShieldCheck className="h-4 w-4" />
                                            {tc.highValueApproval}
                                        </span>
                                    )}
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>{tc.reviewAgain}</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleApprove}
                                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                                >
                                    {tc.confirmApproval}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </>
            )}

            {status === 'approved' && (
                <Dialog open={convertOpen} onOpenChange={setConvertOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="h-9 gap-1 border-primary/30 text-primary hover:bg-primary/5">
                            <Repeat size={14} />
                            {tc.convertToPO}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{tc.convertRequisitionTitle}</DialogTitle>
                            <DialogDescription>
                                {tc.convertDesc}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="supplier">{tc.primarySupplier}</Label>
                                <Select onValueChange={setSelectedSupplier}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={tc.choosePartner} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {suppliers.map((supplier) => (
                                            <SelectItem key={supplier.id} value={supplier.id}>
                                                {supplier.name} (Tier {supplier.tierLevel === 'tier_1' ? '1' : supplier.tierLevel === 'tier_2' ? '2' : '3'})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setConvertOpen(false)}>{tc.cancel}</Button>
                            <Button onClick={handleConvert} disabled={isPending || !selectedSupplier}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {tc.generatePO}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {(status === 'rejected' || status === 'draft') && (
                <Button variant="ghost" size="sm" className="h-9 italic text-muted-foreground" disabled>
                    {status === 'rejected' ? tc.rejected : tc.draft}
                </Button>
            )}
        </div>
    );
}
