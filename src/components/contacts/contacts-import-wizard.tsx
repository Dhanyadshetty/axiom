'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
    Upload,
    ChevronRight,
    Download,
    FileSpreadsheet,
    ArrowLeft,
    ArrowRight,
    Plus,
    Trash2,
    AlertTriangle,
    CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
    CONTACT_COLUMNS,
    IGNORE_COLUMN,
    TEMPLATE_HEADERS,
    type ContactColumnKey,
} from '@/components/contacts/contacts-schema';
import { listSuppliersLite } from '@/app/actions/contacts-detail';

type WizardStep = 'upload' | 'sheet' | 'mapping' | 'review';

interface ParsedSheetInfo {
    name: string;
    headers: string[];
    rowCount: number;
    suggestedMapping: Record<string, string>;
    preview: Array<Record<string, string>>;
}

interface ReviewRow {
    rowIndex: number;
    data: Record<string, string>;
    errors: string[];
    isDuplicate: boolean;
    selected: boolean;
}

const STEP_LABELS: Record<WizardStep, string> = {
    upload: 'Upload',
    sheet: 'Sheet selection',
    mapping: 'Column mapping',
    review: 'Review entries',
};

export function ContactsImportWizard({ embeddedSupplierId }: { embeddedSupplierId?: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supplierIdFromQuery = embeddedSupplierId ?? searchParams?.get('supplierId') ?? '';
    const supplierNameFromQuery = searchParams?.get('supplierName') ?? '';
    const supplierNumberFromQuery = searchParams?.get('supplierNumber') ?? '';

    const [step, setStep] = React.useState<WizardStep>('upload');
    const [fileMeta, setFileMeta] = React.useState<{ name: string; sheetCount: number } | null>(null);
    const [sheets, setSheets] = React.useState<ParsedSheetInfo[]>([]);
    const [activeSheet, setActiveSheet] = React.useState<string>('');
    const [parsedRows, setParsedRows] = React.useState<Array<Record<string, string>>>([]);
    const [headers, setHeaders] = React.useState<string[]>([]);
    const [mapping, setMapping] = React.useState<Record<string, ContactColumnKey | typeof IGNORE_COLUMN>>({});
    const [reviewRows, setReviewRows] = React.useState<ReviewRow[]>([]);
    const [submitting, setSubmitting] = React.useState(false);
    const [dragOver, setDragOver] = React.useState(false);
    const [supplierId, setSupplierId] = React.useState<string>(supplierIdFromQuery);
    const [supplierName, setSupplierName] = React.useState<string>(supplierNameFromQuery);
    const [supplierNumber, setSupplierNumber] = React.useState<string>(supplierNumberFromQuery);
    const [supplierOptions, setSupplierOptions] = React.useState<Array<{ id: string; name: string; supplierNumber: string | null }>>([]);
    const [committed, setCommitted] = React.useState(false);

    React.useEffect(() => {
        if (!supplierId) {
            listSuppliersLite().then(setSupplierOptions).catch(() => {});
        }
    }, [supplierId]);

    const steps: WizardStep[] = ['upload', 'sheet', 'mapping', 'review'];
    const currentStepIdx = steps.indexOf(step);

    const handleFile = async (file: File) => {
        const fd = new FormData();
        fd.append('file', file);
        try {
            const res = await fetch('/api/contacts/import/parse', { method: 'POST', body: fd });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Parse failed');
            setFileMeta({ name: data.fileName, sheetCount: data.sheetCount });
            const sheetInfos: ParsedSheetInfo[] = data.sheets;
            setSheets(sheetInfos);
            if (sheetInfos.length === 1) {
                selectSheet(sheetInfos[0]);
                setStep('mapping');
            } else {
                setStep('sheet');
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to parse file');
        }
    };

    const selectSheet = (sheet: ParsedSheetInfo) => {
        setActiveSheet(sheet.name);
        setHeaders(sheet.headers);
        setMapping(sheet.suggestedMapping as any);
        setParsedRows(sheet.preview);
    };

    const handleConfirmSheet = () => {
        const sheet = sheets.find((s) => s.name === activeSheet);
        if (!sheet) return;
        selectSheet(sheet);
        setStep('mapping');
    };

    const downloadTemplate = async (format: 'xlsx' | 'csv') => {
        try {
            const res = await fetch(`/api/contacts/import/template?format=${format}`);
            if (!res.ok) throw new Error('Template download failed');
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = format === 'csv' ? 'contacts_template.csv' : 'contacts_template.xlsx';
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed');
        }
    };

    const mappedRow = (headerRow: Record<string, string>): Record<string, string> => {
        const out: Record<string, string> = {};
        for (const [srcCol, target] of Object.entries(mapping)) {
            if (target && target !== IGNORE_COLUMN) {
                out[target] = headerRow[srcCol] ?? '';
            }
        }
        return out;
    };

    const canProceedFromMapping = React.useMemo(() => {
        const mappedFields = new Set(Object.values(mapping).filter((v) => v && v !== IGNORE_COLUMN));
        return mappedFields.has('name') && mappedFields.has('email');
    }, [mapping]);

    const handleEnterReview = async () => {
        if (!supplierId) {
            toast.error('Select a supplier first');
            return;
        }
        const rows = parsedRows.map((r) => mappedRow(r));
        try {
            const res = await fetch('/api/contacts/import/commit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    supplierId,
                    rows,
                    dryRun: true,
                }),
            });
            const data = await res.json();
            const reviewFromServer: ReviewRow[] = (data.review || []).map((r: any) => ({
                rowIndex: r.rowIndex,
                data: rows[r.rowIndex] || {},
                errors: r.errors,
                isDuplicate: r.isDuplicate,
                selected: r.errors.length === 0,
            }));
            setReviewRows(reviewFromServer);
            setStep('review');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed');
        }
    };

    const handleCommit = async () => {
        if (!supplierId) return;
        setSubmitting(true);
        try {
            const selected = reviewRows.filter((r) => r.selected && r.errors.length === 0);
            const res = await fetch('/api/contacts/import/commit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    supplierId,
                    rows: selected.map((r) => r.data),
                }),
            });
            const data = await res.json();
            if (data.success) {
                setCommitted(true);
                toast.success(`Imported ${data.imported} contacts`);
                if (supplierId) {
                    setTimeout(() => {
                        router.push(`/suppliers/${supplierNumber || supplierId}/contacts`);
                        router.refresh();
                    }, 800);
                }
            } else {
                toast.error(data.error || 'Import failed');
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed');
        } finally {
            setSubmitting(false);
        }
    };

    const updateReviewCell = (idx: number, field: string, value: string) => {
        setReviewRows((prev) => prev.map((r) => r.rowIndex === idx ? { ...r, data: { ...r.data, [field]: value } } : r));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-black">Contact Import</h1>
                {supplierName && (
                    <Badge variant="secondary" className="text-xs">Supplier: {supplierName}</Badge>
                )}
            </div>

            {/* Step breadcrumb */}
            <nav className="flex items-center gap-2 text-sm">
                {steps.map((s, i) => (
                    <React.Fragment key={s}>
                        <span className={cn(
                            'rounded-full px-3 py-1 text-xs font-medium',
                            i < currentStepIdx ? 'bg-emerald-100 text-emerald-700' :
                            i === currentStepIdx ? 'bg-emerald-600 text-white' :
                            'bg-slate-100 text-slate-500'
                        )}>
                            {i + 1}. {STEP_LABELS[s]}
                        </span>
                        {i < steps.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-slate-300" />}
                    </React.Fragment>
                ))}
            </nav>

            {step === 'upload' && (
                <Card>
                    <CardContent className="pt-6 space-y-4">
                        <div
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={(e) => {
                                e.preventDefault();
                                setDragOver(false);
                                const file = e.dataTransfer.files?.[0];
                                if (file) handleFile(file);
                            }}
                            className={cn(
                                'rounded-xl border-2 border-dashed p-12 text-center transition-colors',
                                dragOver ? 'border-emerald-500 bg-emerald-50/40' : 'border-slate-300'
                            )}
                        >
                            <Upload className="mx-auto h-10 w-10 text-slate-400 mb-3" />
                            <p className="font-medium text-slate-700">Drop file here</p>
                            <p className="text-xs text-slate-500 my-2">oder</p>
                            <label>
                                <input
                                    type="file"
                                    accept=".xlsx,.xls,.csv,.tsv"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleFile(file);
                                    }}
                                />
                                <span className="inline-flex">
                                    <Button type="button" variant="outline" className="cursor-pointer">
                                        <Upload className="h-4 w-4 mr-2" /> Datei auswählen
                                    </Button>
                                </span>
                            </label>
                            <p className="text-[11px] text-slate-400 mt-3">Accepts .xlsx, .xls, .csv, .tsv (up to 5,000 rows)</p>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-2 border-t">
                            <Button variant="outline" size="sm" onClick={() => downloadTemplate('xlsx')}>
                                <Download className="h-4 w-4 mr-2" /> Excel template (.xlsx)
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => downloadTemplate('csv')}>
                                <Download className="h-4 w-4 mr-2" /> CSV template
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setStep('review')}>
                                <FileSpreadsheet className="h-4 w-4 mr-2" /> Manual entry
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {step === 'sheet' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Sheet selection</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-sm text-slate-600">File &ldquo;{fileMeta?.name}&rdquo; contains {fileMeta?.sheetCount} sheets. Pick one:</p>
                        <div className="grid gap-2">
                            {sheets.map((s) => (
                                <label key={s.name} className={cn(
                                    'flex items-center gap-3 rounded-lg border p-3 cursor-pointer',
                                    activeSheet === s.name ? 'border-emerald-500 bg-emerald-50/40' : 'border-slate-200'
                                )}>
                                    <input
                                        type="radio"
                                        checked={activeSheet === s.name}
                                        onChange={() => setActiveSheet(s.name)}
                                        className="h-4 w-4"
                                    />
                                    <div>
                                        <div className="font-medium">{s.name}</div>
                                        <div className="text-xs text-slate-500">{s.headers.length} columns · {s.rowCount} rows</div>
                                    </div>
                                </label>
                            ))}
                        </div>
                        <div className="flex justify-between pt-2">
                            <Button variant="outline" onClick={() => setStep('upload')}>
                                <ArrowLeft className="h-4 w-4 mr-2" /> Back
                            </Button>
                            <Button onClick={handleConfirmSheet} disabled={!activeSheet}>
                                Next <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {step === 'mapping' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Column mapping</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-sm text-slate-600">Map each source column from the file to one of our fields, or ignore it. Name and Email are required.</p>
                        <div className="grid gap-2">
                            {headers.map((h) => (
                                <div key={h} className="grid grid-cols-[1fr,24px,1fr] items-center gap-3 rounded-md border border-slate-200 px-3 py-2">
                                    <div className="font-medium text-sm truncate">{h}</div>
                                    <ArrowRight className="h-4 w-4 text-slate-300" />
                                    <Select
                                        value={mapping[h] || IGNORE_COLUMN}
                                        onValueChange={(v) => setMapping((prev) => ({ ...prev, [h]: v as any }))}
                                    >
                                        <SelectTrigger className="h-9">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={IGNORE_COLUMN}>Ignore this column</SelectItem>
                                            {CONTACT_COLUMNS.filter((c) => c.key !== 'supplier').map((c) => (
                                                <SelectItem key={c.key} value={c.key}>{c.label}{c.required ? ' *' : ''}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between pt-2">
                            <Button variant="outline" onClick={() => setStep(fileMeta && fileMeta.sheetCount > 1 ? 'sheet' : 'upload')}>
                                <ArrowLeft className="h-4 w-4 mr-2" /> Back
                            </Button>
                            <Button onClick={handleEnterReview} disabled={!canProceedFromMapping || !supplierId}>
                                Next <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {step === 'review' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Review entries</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {!supplierId && (
                            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                                Select a supplier:
                                <select
                                    value={supplierId}
                                    onChange={(e) => setSupplierId(e.target.value)}
                                    className="ml-2 h-9 rounded-md border bg-white px-2"
                                >
                                    <option value="">Select supplier...</option>
                                    {supplierOptions.map((s) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div className="text-sm text-slate-600">
                            {reviewRows.filter((r) => r.errors.length === 0 && r.selected).length} valid rows, {reviewRows.filter((r) => r.errors.length > 0).length} flagged
                        </div>
                        <div className="overflow-x-auto border rounded-md">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                                    <tr>
                                        <th className="px-2 py-2 w-8" />
                                        {['name', 'email', 'phone', 'language', 'department', 'position', 'responsibility', 'status'].map((k) => (
                                            <th key={k} className="px-2 py-2 text-left">{k}</th>
                                        ))}
                                        <th className="px-2 py-2 w-8" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {reviewRows.map((r) => (
                                        <tr key={r.rowIndex} className={cn('border-t', r.errors.length > 0 && 'bg-amber-50/40')}>
                                            <td className="px-2 py-2">
                                                <Checkbox
                                                    checked={r.selected && r.errors.length === 0}
                                                    disabled={r.errors.length > 0}
                                                    onCheckedChange={(c) => setReviewRows((prev) => prev.map((p) => p.rowIndex === r.rowIndex ? { ...p, selected: !!c } : p))}
                                                />
                                            </td>
                                            {['name', 'email', 'phone', 'language', 'department', 'position', 'responsibility', 'status'].map((k) => (
                                                <td key={k} className="px-2 py-1">
                                                    <Input
                                                        value={r.data[k] ?? ''}
                                                        onChange={(e) => updateReviewCell(r.rowIndex, k, e.target.value)}
                                                        className="h-7 text-xs"
                                                    />
                                                </td>
                                            ))}
                                            <td className="px-2 py-2">
                                                <button onClick={() => setReviewRows((prev) => prev.filter((p) => p.rowIndex !== r.rowIndex))} className="text-slate-400 hover:text-rose-600">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="border-t bg-slate-50/60">
                                        <td className="px-2 py-2">
                                            <Button variant="outline" size="sm" onClick={() => {
                                                const next = reviewRows.length;
                                                setReviewRows((prev) => [...prev, { rowIndex: next, data: { name: '', email: '' }, errors: ['Missing name', 'Missing email'], isDuplicate: false, selected: false }]);
                                            }}>
                                                <Plus className="h-3.5 w-3.5" />
                                            </Button>
                                        </td>
                                        <td colSpan={9} className="px-2 py-2 text-xs text-slate-500">Add row</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        {committed ? (
                            <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4" /> Import complete — redirecting...
                            </div>
                        ) : (
                            <div className="flex justify-between pt-2">
                                <Button variant="outline" onClick={() => setStep('mapping')}>
                                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                                </Button>
                                <Button onClick={handleCommit} disabled={submitting || !supplierId}>
                                    {submitting ? 'Importing...' : 'Import'}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
