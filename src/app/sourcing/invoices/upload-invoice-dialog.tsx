'use client'

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Upload, FileText, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { createInvoice } from "@/app/actions/invoices";
import { toast } from "sonner";
import { useLanguage } from "@/components/i18n/language-provider";
import { t } from "@/lib/i18n";

interface OCRData {
    invoiceNumber: string | null;
    amount: number | null;
    currency: string | null;
    supplierName: string | null;
    invoiceDate: string | null;
    dueDate: string | null;
    taxAmount: number | null;
    subtotal: number | null;
    lineItems: { description: string; quantity: number; unitPrice: number; totalPrice: number }[];
    paymentTerms: string | null;
    purchaseOrderRef: string | null;
}

interface OCRResponse {
    success: boolean;
    data?: OCRData;
    source?: string;
    documentUrl?: string | null;
    warnings?: string[];
    requiresReview?: boolean;
    error?: string;
}

interface UploadInvoiceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    suppliers: { id: string; name: string }[];
}

const SUPPORTED_EXTENSIONS = new Set(['pdf', 'png', 'jpg', 'jpeg', 'webp']);

const EMPTY_OCR_DATA: OCRData = {
    invoiceNumber: null,
    amount: null,
    currency: null,
    supplierName: null,
    invoiceDate: null,
    dueDate: null,
    taxAmount: null,
    subtotal: null,
    lineItems: [],
    paymentTerms: null,
    purchaseOrderRef: null,
};

function isSupportedInvoiceFile(file: File) {
    if (file.type.startsWith('image/') || file.type === 'application/pdf') return true;

    const extension = file.name.split('.').pop()?.toLowerCase();
    return extension ? SUPPORTED_EXTENSIONS.has(extension) : false;
}

export function UploadInvoiceDialog({ open, onOpenChange, onSuccess, suppliers }: UploadInvoiceDialogProps) {
    const { language } = useLanguage();
    const tc = t(language, "invoices");
    const [step, setStep] = useState<'upload' | 'review' | 'saving'>('upload');
    const [uploading, setUploading] = useState(false);
    const [ocrData, setOcrData] = useState<OCRData | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [ocrSource, setOcrSource] = useState<string>('');
    const [ocrWarnings, setOcrWarnings] = useState<string[]>([]);
    const [documentUrl, setDocumentUrl] = useState<string | null>(null);
    const [supplierId, setSupplierId] = useState('');
    const [editableData, setEditableData] = useState<Record<string, string>>({});
    const fileRef = useRef<HTMLInputElement>(null);

    const reset = () => {
        setStep('upload');
        setUploading(false);
        setOcrData(null);
        setSelectedFile(null);
        setOcrSource('');
        setOcrWarnings([]);
        setDocumentUrl(null);
        setSupplierId('');
        setEditableData({});
    };

    const formatLineNumber = (value: number | null | undefined) =>
        typeof value === 'number' && Number.isFinite(value) ? value.toFixed(2) : '-';

    const prepareReviewState = (data: OCRData, options?: { source?: string; warnings?: string[]; documentUrl?: string | null }) => {
        setOcrData(data);
        setOcrSource(options?.source || tc.manualReview);
        setOcrWarnings(options?.warnings || []);
        setDocumentUrl(options?.documentUrl || null);
        setEditableData({
            invoiceNumber: data.invoiceNumber || '',
            amount: data.amount?.toString() || '',
            currency: data.currency || '',
            invoiceDate: data.invoiceDate || '',
            dueDate: data.dueDate || '',
            taxAmount: data.taxAmount?.toString() || '',
            subtotal: data.subtotal?.toString() || '',
            paymentTerms: data.paymentTerms || '',
            purchaseOrderRef: data.purchaseOrderRef || '',
        });

        const matchedSupplierId = data.supplierName
            ? suppliers.find((supplier) =>
                supplier.name.toLowerCase().includes(data.supplierName!.toLowerCase()) ||
                data.supplierName!.toLowerCase().includes(supplier.name.toLowerCase())
            )?.id
            : '';

        setSupplierId(matchedSupplierId || '');
        setStep('review');
    };

    const startManualReview = (warning?: string) => {
        prepareReviewState(EMPTY_OCR_DATA, {
            source: tc.manualReviewWorkspace,
            warnings: warning ? [warning] : [tc.manualReviewSkipped],
            documentUrl: null,
        });
    };

    const handleFileSelect = async (file: File) => {
        if (!isSupportedInvoiceFile(file)) {
            toast.error(tc.onlySupportedFiles);
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            toast.error(tc.fileUnder10mb);
            return;
        }

        setSelectedFile(file);
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/invoices/ocr', { method: 'POST', body: formData });
            const json = await res.json().catch((): OCRResponse => ({
                success: false,
                error: tc.ocrUnreadable,
            }));

            if (!res.ok || !json.success) {
                startManualReview(json.error || tc.ocrManualReviewNeeded);
                toast.warning(json.error || tc.ocrNeedsReview);
                setUploading(false);
                return;
            }

            const data = json.data || EMPTY_OCR_DATA;
            prepareReviewState(data, {
                source: json.source || 'Axiom OCR',
                documentUrl: json.documentUrl || null,
                warnings: json.warnings || [],
            });

            if (json.warnings?.length) {
                toast.warning(tc.loadedWithReview);
            } else {
                toast.success(tc.invoiceExtracted);
            }
        } catch (error) {
            console.error("Invoice OCR upload failed:", error);
            startManualReview(tc.manualReviewModeReady);
            toast.warning(tc.documentLoadedManual);
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        if (!supplierId) {
            toast.error(tc.selectSupplierRequired);
            return;
        }
        if (!editableData.invoiceNumber) {
            toast.error(tc.invoiceNumberRequired);
            return;
        }
        if (!editableData.amount || isNaN(Number(editableData.amount))) {
            toast.error(tc.validAmountRequired);
            return;
        }
        if (!editableData.currency) {
            toast.error(tc.currencyRequired);
            return;
        }

        setStep('saving');

        try {
            const result = await createInvoice({
                supplierId,
                invoiceNumber: editableData.invoiceNumber,
                amount: Number(editableData.amount),
                currency: editableData.currency,
                invoiceDate: editableData.invoiceDate || undefined,
                dueDate: editableData.dueDate || undefined,
                taxAmount: editableData.taxAmount ? Number(editableData.taxAmount) : undefined,
                subtotal: editableData.subtotal ? Number(editableData.subtotal) : undefined,
                lineItems: ocrData?.lineItems || undefined,
                paymentTerms: editableData.paymentTerms || undefined,
                purchaseOrderRef: editableData.purchaseOrderRef || undefined,
                documentUrl: documentUrl || undefined,
            });

            if (result.success) {
                if ('warning' in result && result.warning) {
                    toast.warning(`${tc.invoiceNumber} ${editableData.invoiceNumber} ${tc.createdWithReview}`, {
                        description: result.warning,
                    });
                } else {
                    toast.success(`${tc.invoiceNumber} ${editableData.invoiceNumber} ${tc.createdSuccess}`);
                }
                onSuccess();
                onOpenChange(false);
                reset();
            } else {
                toast.error(result.error || tc.failedCreate);
                setStep('review');
            }
        } catch (error) {
            console.error("Invoice save failed:", error);
            toast.error(tc.failedCreateRetry);
            setStep('review');
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Upload className="h-5 w-5 text-primary" />
                        {step === 'upload' ? tc.uploadTitle : step === 'review' ? tc.reviewTitle : tc.savingTitle}
                    </DialogTitle>
                    <DialogDescription>
                        {step === 'upload'
                            ? tc.uploadDesc
                            : step === 'review'
                                ? tc.reviewDesc
                                : tc.savingDesc}
                    </DialogDescription>
                </DialogHeader>

                {step === 'upload' && (
                    <div className="space-y-4">
                        <div
                            className="border-2 border-dashed rounded-lg p-8 sm:p-12 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
                            onClick={() => { if (!uploading) fileRef.current?.click(); }}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                if (uploading) return;
                                const file = e.dataTransfer.files[0];
                                if (file) handleFileSelect(file);
                            }}
                        >
                            {uploading ? (
                                <div className="flex flex-col items-center gap-3">
                                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                                    <p className="font-semibold">{tc.processing}</p>
                                    <p className="text-sm text-muted-foreground">{tc.extractingFrom} {selectedFile?.name}</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-3">
                                    <FileText className="h-10 w-10 text-muted-foreground" />
                                    <p className="font-semibold">{tc.dropHere}</p>
                                    <p className="text-sm text-muted-foreground">{tc.supportsFiles}</p>
                                </div>
                            )}
                        </div>
                        <input
                            ref={fileRef}
                            type="file"
                            accept=".pdf,image/*"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileSelect(file);
                            }}
                        />
                        <div className="flex justify-end">
                            <Button type="button" variant="outline" onClick={() => startManualReview()}>
                                {tc.enterManually}
                            </Button>
                        </div>
                    </div>
                )}

                {step === 'review' && ocrData && (
                    <div className="space-y-4">
                        {ocrWarnings.length > 0 ? (
                            <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
                                <CardContent className="space-y-2 px-4 py-3 text-sm">
                                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                        <AlertTriangle className="h-4 w-4" />
                                        <span className="font-semibold">
                                            {tc.reviewNeededFor} {selectedFile?.name || tc.manualEntry}
                                        </span>
                                    </div>
                                    <p className="text-xs text-amber-700/90 dark:text-amber-200/90">
                                        {tc.source}: {ocrSource}
                                    </p>
                                    <div className="space-y-1 text-xs text-amber-700/90 dark:text-amber-200/90">
                                        {ocrWarnings.map((warning) => (
                                            <p key={warning}>{warning}</p>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800">
                                <CardContent className="py-3 px-4 flex items-center gap-2 text-sm">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                    <span className="font-medium text-emerald-700 dark:text-emerald-400">
                                        {tc.dataPreparedFrom} {selectedFile?.name || tc.manualEntry} {tc.viaAxiomOcr}
                                    </span>
                                </CardContent>
                            </Card>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs font-semibold">{tc.supplier}</Label>
                                <select
                                    value={supplierId}
                                    onChange={(e) => setSupplierId(e.target.value)}
                                    className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                                >
                                    <option value="">{tc.selectSupplier}</option>
                                    {suppliers.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                                {ocrData.supplierName && !supplierId && (
                                    <p className="text-xs text-amber-600 flex items-center gap-1">
                                        <AlertTriangle className="h-3 w-3" />
                                        {tc.detectedSelect.replace("{name}", ocrData.supplierName)}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs font-semibold">{tc.invoiceNumber}</Label>
                                <Input
                                    value={editableData.invoiceNumber}
                                    onChange={(e) => setEditableData(d => ({ ...d, invoiceNumber: e.target.value }))}
                                    className="h-9"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs font-semibold">{tc.amount}</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={editableData.amount}
                                    onChange={(e) => setEditableData(d => ({ ...d, amount: e.target.value }))}
                                    className="h-9"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs font-semibold">{tc.currency}</Label>
                                <Input
                                    value={editableData.currency}
                                    onChange={(e) => setEditableData(d => ({ ...d, currency: e.target.value }))}
                                    className="h-9"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs font-semibold">{tc.invoiceDate}</Label>
                                <Input
                                    type="date"
                                    value={editableData.invoiceDate}
                                    onChange={(e) => setEditableData(d => ({ ...d, invoiceDate: e.target.value }))}
                                    className="h-9"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs font-semibold">{tc.dueDate}</Label>
                                <Input
                                    type="date"
                                    value={editableData.dueDate}
                                    onChange={(e) => setEditableData(d => ({ ...d, dueDate: e.target.value }))}
                                    className="h-9"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs font-semibold">{tc.subtotal}</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={editableData.subtotal}
                                    onChange={(e) => setEditableData(d => ({ ...d, subtotal: e.target.value }))}
                                    className="h-9"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs font-semibold">{tc.taxAmount}</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={editableData.taxAmount}
                                    onChange={(e) => setEditableData(d => ({ ...d, taxAmount: e.target.value }))}
                                    className="h-9"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs font-semibold">{tc.paymentTerms}</Label>
                                <Input
                                    value={editableData.paymentTerms}
                                    onChange={(e) => setEditableData(d => ({ ...d, paymentTerms: e.target.value }))}
                                    className="h-9"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs font-semibold">{tc.poReference}</Label>
                                <Input
                                    value={editableData.purchaseOrderRef}
                                    onChange={(e) => setEditableData(d => ({ ...d, purchaseOrderRef: e.target.value }))}
                                    className="h-9"
                                />
                            </div>
                        </div>

                        {ocrData.lineItems && ocrData.lineItems.length > 0 && (
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold">{tc.lineItems.replace("{count}", String(ocrData.lineItems.length))}</Label>
                                <div className="rounded-md border text-xs">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b bg-muted/50">
                                                <th className="px-3 py-2 text-left font-semibold">{tc.description}</th>
                                                <th className="px-3 py-2 text-right font-semibold">{tc.qty}</th>
                                                <th className="px-3 py-2 text-right font-semibold">{tc.unitPrice}</th>
                                                <th className="px-3 py-2 text-right font-semibold">{tc.total}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {ocrData.lineItems.map((item, i) => (
                                                <tr key={i} className="border-b">
                                                    <td className="px-3 py-2">{item.description}</td>
                                                    <td className="px-3 py-2 text-right tabular-nums">{item.quantity}</td>
                                                    <td className="px-3 py-2 text-right tabular-nums">{formatLineNumber(item.unitPrice)}</td>
                                                    <td className="px-3 py-2 text-right tabular-nums font-medium">{formatLineNumber(item.totalPrice)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        <DialogFooter className="gap-2">
                            <Button variant="outline" onClick={() => { reset(); }}>{tc.cancel}</Button>
                            <Button onClick={handleSave} className="gap-2">
                                <CheckCircle2 className="h-4 w-4" />
                                {tc.saveInvoice}
                            </Button>
                        </DialogFooter>
                    </div>
                )}

                {step === 'saving' && (
                    <div className="flex flex-col items-center py-12 gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="font-medium">{tc.savingDesc}</p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
