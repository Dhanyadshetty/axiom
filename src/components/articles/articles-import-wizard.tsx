'use client';

import * as React from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import {
    Upload,
    Download,
    FileSpreadsheet,
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    Loader2,
    X,
    Trash2,
    AlertTriangle,
    FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
    prepareArticleImport,
    commitArticleImport,
    type ParsedArticleImportRow,
    type ValidatedArticleImportRow,
} from '@/app/actions/articles';

export const ARTICLE_SCHEMA_FIELDS = [
    'Article number',
    'Description',
    'Long text',
    'CN code',
    'Category',
    'Net weight',
    'Net weight unit',
] as const;

export type ArticleSchemaField = (typeof ARTICLE_SCHEMA_FIELDS)[number];

export const FIELD_KEY_MAP: Record<ArticleSchemaField, string> = {
    'Article number': 'articleNumber',
    Description: 'description',
    'Long text': 'longText',
    'CN code': 'cnCode',
    Category: 'category',
    'Net weight': 'netWeight',
    'Net weight unit': 'netWeightUnit',
};

// Bilingual alias list (English + German) for auto-mapping
const ALIASES: Record<ArticleSchemaField, string[]> = {
    'Article number': [
        'article number',
        'article no',
        'articlenumber',
        'article',
        'item number',
        'sku',
        'part number',
        'part no',
        'artikelnummer',
        'artikelnr',
        'artikel',
        'materialnummer',
        'matnr',
    ],
    Description: [
        'description',
        'desc',
        'name',
        'article name',
        'title',
        'bezeichnung',
        'beschreibung',
        'artikelname',
        'kurztext',
    ],
    'Long text': [
        'long text',
        'longtext',
        'extended description',
        'details',
        'langtext',
        'artikelbeschreibung',
    ],
    'CN code': [
        'cn code',
        'cncode',
        'hs code',
        'hscode',
        'customs code',
        'commodity code',
        'zolltarifnummer',
        'warennummer',
    ],
    Category: [
        'category',
        'group',
        'material group',
        'product group',
        'kategorie',
        'warengruppe',
        'matkl',
    ],
    'Net weight': [
        'net weight',
        'netweight',
        'weight',
        'nettogewicht',
        'gewicht',
        'net mass',
    ],
    'Net weight unit': [
        'net weight unit',
        'weight unit',
        'unit',
        'gewichts-einheit',
        'einheit',
        'uom',
    ],
};

const TEMPLATE_SAMPLE: string[][] = [
    [
        '10000100',
        'ISOLIERSCHLAUCH',
        'ISOLIERSCHLAUCH 10MM SCHWARZ',
        '39173200',
        '0340 Tube, Sleeve, Hose',
        '3.5',
        'G',
    ],
    [
        '10000101',
        'MAGNETGEHAEUSE',
        'MAGNETGEHAEUSE VERZINKT',
        '85059090',
        '0640 Deep drawn',
        '120.0',
        'KG',
    ],
];

function downloadExcelTemplate() {
    const ws = XLSX.utils.aoa_to_sheet([
        ARTICLE_SCHEMA_FIELDS as unknown as string[],
        ...TEMPLATE_SAMPLE,
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Articles');
    XLSX.writeFile(wb, 'articles-import-template.xlsx');
}

function downloadCsvTemplate() {
    const rows = [
        ARTICLE_SCHEMA_FIELDS.join(','),
        ...TEMPLATE_SAMPLE.map((row) =>
            row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')
        ),
    ];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'articles-import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
}

type WizardStep = 'upload' | 'sheets' | 'mapping' | 'preview';

export interface ArticlesImportWizardProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function ArticlesImportWizard({ onSuccess }: ArticlesImportWizardProps) {
    const [step, setStep] = React.useState<WizardStep>('upload');
    const [workbook, setWorkbook] = React.useState<XLSX.WorkBook | null>(null);
    const [sheetNames, setSheetNames] = React.useState<string[]>([]);
    const [selectedSheet, setSelectedSheet] = React.useState<string>('');
    const [rawRows, setRawRows] = React.useState<Record<string, any>[]>([]);
    const [sourceHeaders, setSourceHeaders] = React.useState<string[]>([]);
    const [columnMapping, setColumnMapping] = React.useState<
        Record<ArticleSchemaField, string | null>
    >({
        'Article number': null,
        Description: null,
        'Long text': null,
        'CN code': null,
        Category: null,
        'Net weight': null,
        'Net weight unit': null,
    });
    const [validatedRows, setValidatedRows] = React.useState<ValidatedArticleImportRow[]>([]);
    const [isValidating, setIsValidating] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [fileName, setFileName] = React.useState<string>('');
    const fileInputRef = React.useRef<HTMLInputElement | null>(null);

    // Auto-map headers
    const autoMapColumns = (headers: string[]) => {
        const mapping: Record<ArticleSchemaField, string | null> = {
            'Article number': null,
            Description: null,
            'Long text': null,
            'CN code': null,
            Category: null,
            'Net weight': null,
            'Net weight unit': null,
        };

        const normalizedHeaders = headers.map((h) => ({
            raw: h,
            clean: h.toLowerCase().trim().replace(/[_\s-]+/g, ' '),
        }));

        for (const targetField of ARTICLE_SCHEMA_FIELDS) {
            const aliasList = ALIASES[targetField];
            for (const h of normalizedHeaders) {
                if (aliasList.some((a) => h.clean === a || h.clean.includes(a))) {
                    mapping[targetField] = h.raw;
                    break;
                }
            }
        }
        setColumnMapping(mapping);
    };

    const handleFileUpload = (file: File) => {
        setFileName(file.name);
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const wb = XLSX.read(data, { type: 'array' });
                setWorkbook(wb);
                setSheetNames(wb.SheetNames);

                if (wb.SheetNames.length === 1) {
                    processSheet(wb, wb.SheetNames[0]);
                } else {
                    setSelectedSheet(wb.SheetNames[0]);
                    setStep('sheets');
                }
            } catch (err) {
                toast.error('Failed to parse file. Please upload a valid .xlsx or .csv file.');
            }
        };

        reader.readAsArrayBuffer(file);
    };

    const processSheet = (wb: XLSX.WorkBook, sheetName: string) => {
        const ws = wb.Sheets[sheetName];
        const json: Record<string, any>[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

        if (!json.length) {
            toast.error('The selected sheet is empty');
            return;
        }

        const headers = Object.keys(json[0] || {});
        setRawRows(json);
        setSourceHeaders(headers);
        autoMapColumns(headers);
        setStep('mapping');
    };

    const handleConfirmMapping = async () => {
        if (!columnMapping['Article number']) {
            toast.error('Please map the "Article number" column before proceeding');
            return;
        }

        setIsValidating(true);
        try {
            const transformed: ParsedArticleImportRow[] = rawRows.map((row) => ({
                articleNumber: columnMapping['Article number'] ? row[columnMapping['Article number']] : '',
                description: columnMapping['Description'] ? row[columnMapping['Description']] : '',
                longText: columnMapping['Long text'] ? row[columnMapping['Long text']] : '',
                cnCode: columnMapping['CN code'] ? row[columnMapping['CN code']] : '',
                category: columnMapping['Category'] ? row[columnMapping['Category']] : '',
                netWeight: columnMapping['Net weight'] ? row[columnMapping['Net weight']] : '',
                netWeightUnit: columnMapping['Net weight unit'] ? row[columnMapping['Net weight unit']] : '',
            }));

            const result = await prepareArticleImport(transformed);
            setValidatedRows(result.rows);
            setStep('preview');
        } catch {
            toast.error('Failed to validate records');
        } finally {
            setIsValidating(false);
        }
    };

    const handleCommitImport = async () => {
        const validItems = validatedRows.filter((r) => r.isValid).map((r) => r.cleaned);
        if (!validItems.length) {
            toast.error('No valid articles to import');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await commitArticleImport(validItems);
            if (res.success) {
                toast.success(`Successfully imported ${res.insertedCount} articles`);
                onSuccess?.();
            } else {
                toast.error(res.error || 'Failed to import articles');
            }
        } catch {
            toast.error('Unexpected error during import');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteRow = (index: number) => {
        setValidatedRows((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-6">
            {/* Stepper Header (matches screenshot) */}
            <div className="flex items-center gap-6 border-b border-slate-100 pb-4 text-xs font-semibold text-slate-500">
                <div
                    className={cn(
                        'flex items-center gap-2',
                        step === 'upload' ? 'text-slate-900 font-bold' : 'text-slate-400'
                    )}
                >
                    <span
                        className={cn(
                            'flex h-6 w-6 items-center justify-center rounded-full text-xs',
                            step === 'upload'
                                ? 'bg-slate-900 text-white'
                                : 'bg-slate-100 text-slate-600'
                        )}
                    >
                        1
                    </span>
                    <span>Upload</span>
                </div>

                <div
                    className={cn(
                        'flex items-center gap-2',
                        step === 'sheets' ? 'text-slate-900 font-bold' : 'text-slate-400'
                    )}
                >
                    <span
                        className={cn(
                            'flex h-6 w-6 items-center justify-center rounded-full text-xs',
                            step === 'sheets'
                                ? 'bg-slate-900 text-white'
                                : 'bg-slate-100 text-slate-600'
                        )}
                    >
                        2
                    </span>
                    <span>Sheet selection</span>
                </div>

                <div
                    className={cn(
                        'flex items-center gap-2',
                        step === 'mapping' ? 'text-slate-900 font-bold' : 'text-slate-400'
                    )}
                >
                    <span
                        className={cn(
                            'flex h-6 w-6 items-center justify-center rounded-full text-xs',
                            step === 'mapping'
                                ? 'bg-slate-900 text-white'
                                : 'bg-slate-100 text-slate-600'
                        )}
                    >
                        3
                    </span>
                    <span>Map columns</span>
                </div>

                <div
                    className={cn(
                        'flex items-center gap-2',
                        step === 'preview' ? 'text-slate-900 font-bold' : 'text-slate-400'
                    )}
                >
                    <span
                        className={cn(
                            'flex h-6 w-6 items-center justify-center rounded-full text-xs',
                            step === 'preview'
                                ? 'bg-slate-900 text-white'
                                : 'bg-slate-100 text-slate-600'
                        )}
                    >
                        4
                    </span>
                    <span>Review entries</span>
                </div>
            </div>

            {/* STEP 1: UPLOAD (exact match to screenshot) */}
            {step === 'upload' && (
                <div className="space-y-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">Upload & map columns</h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Upload an .xlsx, .xls, .csv, or .tsv file. We'll auto-map your columns to the article template.
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={downloadExcelTemplate}
                            className="gap-2 text-xs font-semibold rounded-xl border-slate-200 shadow-2xs"
                        >
                            <Download className="h-3.5 w-3.5 text-slate-600" />
                            Download Excel template
                        </Button>
                    </div>

                    {/* Drag & Drop Area */}
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                            e.preventDefault();
                            if (e.dataTransfer.files?.[0]) {
                                handleFileUpload(e.dataTransfer.files[0]);
                            }
                        }}
                        className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl py-16 px-6 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer group"
                    >
                        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-slate-600 group-hover:bg-slate-200/70 transition-colors mb-3">
                            <Upload className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-semibold text-slate-800">Drop a file here, or click to browse</p>
                        <p className="text-xs text-slate-400 mt-1">.xlsx, .xls, .csv, .tsv</p>
                        <Button
                            size="sm"
                            type="button"
                            className="mt-4 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-semibold shadow-2xs pointer-events-none"
                        >
                            Choose file
                        </Button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xls,.csv,.tsv"
                            className="hidden"
                            onChange={(e) => {
                                if (e.target.files?.[0]) {
                                    handleFileUpload(e.target.files[0]);
                                }
                            }}
                        />
                    </div>

                    {/* Bottom Links */}
                    <div className="flex items-center justify-between pt-2">
                        <button
                            type="button"
                            onClick={downloadCsvTemplate}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
                        >
                            <Download className="h-3.5 w-3.5" />
                            CSV template
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                // Manual entry generates dummy starter row in review step
                                setValidatedRows([
                                    {
                                        rowIndex: 1,
                                        raw: { articleNumber: '10000100', description: 'New Article' },
                                        cleaned: {
                                            articleNumber: '10000100',
                                            description: 'New Article',
                                            longText: 'New Article Description',
                                            cnCode: '39173200',
                                            category: '0340 Tube, Sleeve, Hose',
                                            netWeight: 3.5,
                                            netWeightUnit: 'G',
                                            budgetPrice: 1.5,
                                            costModel: 'Standard',
                                        },
                                        isValid: true,
                                        errors: [],
                                        warnings: [],
                                    },
                                ]);
                                setStep('preview');
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
                        >
                            <FileText className="h-3.5 w-3.5" />
                            Manual entry
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 2: SHEET SELECTION */}
            {step === 'sheets' && (
                <div className="space-y-4">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900">Select Sheet</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            This workbook contains multiple sheets. Choose which sheet to import.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {sheetNames.map((name) => (
                            <button
                                key={name}
                                type="button"
                                onClick={() => {
                                    setSelectedSheet(name);
                                    if (workbook) processSheet(workbook, name);
                                }}
                                className={cn(
                                    'flex items-center gap-3 p-4 rounded-xl border text-left transition-all',
                                    selectedSheet === name
                                        ? 'border-slate-900 bg-slate-50/80 font-bold'
                                        : 'border-slate-200 hover:bg-slate-50'
                                )}
                            >
                                <FileSpreadsheet className="h-5 w-5 text-slate-500" />
                                <span className="text-xs text-slate-800">{name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="flex justify-between pt-4 border-t border-slate-100">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setStep('upload')}
                            className="gap-2 text-xs"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" /> Back
                        </Button>
                    </div>
                </div>
            )}

            {/* STEP 3: MAP COLUMNS */}
            {step === 'mapping' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">Map Columns</h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Match headers from <span className="font-semibold text-slate-700">{fileName}</span> to the target article fields.
                            </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                            {rawRows.length} rows found
                        </Badge>
                    </div>

                    <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-80 overflow-y-auto">
                        {ARTICLE_SCHEMA_FIELDS.map((targetField) => {
                            const isRequired = targetField === 'Article number';
                            const currentMapped = columnMapping[targetField];

                            return (
                                <div
                                    key={targetField}
                                    className="grid grid-cols-2 items-center p-3 hover:bg-slate-50/60 transition-colors"
                                >
                                    <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                                        <span>{targetField}</span>
                                        {isRequired && <span className="text-red-500">*</span>}
                                    </div>

                                    <select
                                        value={currentMapped || ''}
                                        onChange={(e) =>
                                            setColumnMapping((prev) => ({
                                                ...prev,
                                                [targetField]: e.target.value || null,
                                            }))
                                        }
                                        className="h-8 text-xs border border-slate-200 rounded-lg px-2.5 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400"
                                    >
                                        <option value="">-- Ignore this field --</option>
                                        {sourceHeaders.map((h) => (
                                            <option key={h} value={h}>
                                                {h}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex justify-between pt-4 border-t border-slate-100">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setStep('upload')}
                            className="gap-2 text-xs"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" /> Back
                        </Button>

                        <Button
                            size="sm"
                            onClick={handleConfirmMapping}
                            disabled={isValidating}
                            className="gap-2 text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 rounded-xl"
                        >
                            {isValidating ? (
                                <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    Validating...
                                </>
                            ) : (
                                <>
                                    Review entries <ArrowRight className="h-3.5 w-3.5" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            )}

            {/* STEP 4: REVIEW & COMMIT */}
            {step === 'preview' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">Review Entries</h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Verified {validatedRows.filter((r) => r.isValid).length} of {validatedRows.length} records ready to import.
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                                {validatedRows.filter((r) => r.isValid).length} Valid
                            </Badge>
                            {validatedRows.filter((r) => !r.isValid).length > 0 && (
                                <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-xs">
                                    {validatedRows.filter((r) => !r.isValid).length} Invalid
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Preview Table */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-slate-50 text-slate-600 font-semibold sticky top-0 border-b border-slate-200">
                                <tr>
                                    <th className="py-2.5 px-3">#</th>
                                    <th className="py-2.5 px-3">Status</th>
                                    <th className="py-2.5 px-3">Article number</th>
                                    <th className="py-2.5 px-3">Description</th>
                                    <th className="py-2.5 px-3">CN code</th>
                                    <th className="py-2.5 px-3">Category</th>
                                    <th className="py-2.5 px-3">Net weight</th>
                                    <th className="py-2.5 px-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                {validatedRows.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/80">
                                        <td className="py-2 px-3 text-slate-400 font-mono">{idx + 1}</td>
                                        <td className="py-2 px-3">
                                            {row.isValid ? (
                                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                                                    Ready
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[10px]">
                                                    {row.errors[0] || 'Error'}
                                                </Badge>
                                            )}
                                        </td>
                                        <td className="py-2 px-3 font-semibold text-slate-900">
                                            {row.cleaned.articleNumber}
                                        </td>
                                        <td className="py-2 px-3 max-w-[180px] truncate">
                                            {row.cleaned.description || '—'}
                                        </td>
                                        <td className="py-2 px-3">{row.cleaned.cnCode || '—'}</td>
                                        <td className="py-2 px-3">{row.cleaned.category || '—'}</td>
                                        <td className="py-2 px-3">
                                            {row.cleaned.netWeight != null
                                                ? `${row.cleaned.netWeight} ${row.cleaned.netWeightUnit || ''}`
                                                : '—'}
                                        </td>
                                        <td className="py-2 px-3 text-right">
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteRow(idx)}
                                                className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-slate-100"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-between pt-4 border-t border-slate-100">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setStep('mapping')}
                            className="gap-2 text-xs"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" /> Back
                        </Button>

                        <Button
                            size="sm"
                            onClick={handleCommitImport}
                            disabled={isSubmitting || validatedRows.filter((r) => r.isValid).length === 0}
                            className="gap-2 text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 rounded-xl"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    Importing...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Import {validatedRows.filter((r) => r.isValid).length} articles
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
