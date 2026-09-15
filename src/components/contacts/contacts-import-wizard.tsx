'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import {
    Upload,
    Download,
    FileSpreadsheet,
    ArrowLeft,
    ArrowRight,
    Plus,
    Trash2,
    CheckCircle2,
    Building2,
    Loader2,
    X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import {
    listSuppliersLite,
    prepareContactImport,
    commitContactImport,
} from '@/app/actions/contacts-detail';
import { isValidEmail } from '@/components/contacts/contacts-schema';

// ---------------------------------------------------------------------------
// Schema definition (Target Contact Fields)
// ---------------------------------------------------------------------------

export const CONTACT_SCHEMA_FIELDS = [
    'Contact',
    'Email',
    'Phone number',
    'Supplier',
    'Language',
    'Department',
    'Position',
    'Responsibility',
    'Status',
] as const;

export type ContactSchemaField = (typeof CONTACT_SCHEMA_FIELDS)[number];

export const FIELD_KEY_MAP: Record<ContactSchemaField, string> = {
    Contact: 'name',
    Email: 'email',
    'Phone number': 'phone',
    Supplier: 'supplier',
    Language: 'language',
    Department: 'department',
    Position: 'position',
    Responsibility: 'responsibility',
    Status: 'status',
};

export const KEY_TO_FIELD_MAP: Record<string, ContactSchemaField> = {
    name: 'Contact',
    email: 'Email',
    phone: 'Phone number',
    supplier: 'Supplier',
    language: 'Language',
    department: 'Department',
    position: 'Position',
    responsibility: 'Responsibility',
    status: 'Status',
};

// Bilingual alias list (English + German) for auto-mapping
const ALIASES: Record<ContactSchemaField, string[]> = {
    Contact: ['contact', 'contacts', 'name', 'full name', 'first name', 'last name', 'kontakt', 'ansprechpartner', 'person', 'vorname', 'nachname', 'contact name'],
    Email: ['email', 'e-mail', 'mail', 'e_mail', 'email address', 'e-mail-adresse', 'adresse', 'business email'],
    'Phone number': ['phone', 'phone number', 'telephone', 'telefon', 'mobile', 'mobil', 'handy', 'cell', 'rufnummer', 'tel', 'phone numbers'],
    Supplier: ['supplier', 'suppliers', 'supplier name', 'supplier id', 'vendor', 'lieferant', 'lieferanten', 'company', 'firma', 'kreditor', 'creditor'],
    Language: ['language', 'sprache', 'lang'],
    Department: ['department', 'abteilung', 'bereich', 'dept'],
    Position: ['position', 'role', 'title', 'job title', 'funktion', 'job', 'beruf'],
    Responsibility: ['responsibility', 'responsibilities', 'verantwortung', 'zuständigkeit', 'scope', 'aufgaben'],
    Status: ['status', 'zustand', 'contact status'],
};

// ---------------------------------------------------------------------------
// Template Download
// ---------------------------------------------------------------------------

const TEMPLATE_SAMPLE: string[][] = [
    [
        'Jane Doe',
        'jane.doe@acme-supplier.com',
        '+49 170 1234567',
        'Acme Components GmbH',
        'English',
        'Sales',
        'Key Account Manager',
        'Customer inquiries, RFQs',
        'active',
    ],
    [
        'Max Mustermann',
        'max.mustermann@nordic-plastics.com',
        '+49 171 9876543',
        'Nordic Plastics AS',
        'German',
        'Quality Management',
        'Quality Lead',
        'Audits, Certifications',
        'active',
    ],
];

function downloadExcelTemplate() {
    const ws = XLSX.utils.aoa_to_sheet([CONTACT_SCHEMA_FIELDS as unknown as string[], ...TEMPLATE_SAMPLE]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Contacts');
    XLSX.writeFile(wb, 'contacts-import-template.xlsx');
}

function downloadCsvTemplate() {
    const rows = [
        CONTACT_SCHEMA_FIELDS.join(','),
        ...TEMPLATE_SAMPLE.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')),
    ];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contacts-import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function colLetter(index: number): string {
    let s = '';
    let n = index;
    while (n >= 0) {
        s = String.fromCharCode((n % 26) + 65) + s;
        n = Math.floor(n / 26) - 1;
    }
    return s;
}

function normalizeHeader(header: string): string {
    return header
        .trim()
        .toLowerCase()
        .replace(/[\s_\-./()]+/g, ' ')
        .replace(/[^\p{L}\p{N} ]/gu, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function normaliseCell(value: unknown): string {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value.trim();
    if (typeof value === 'number') return String(value);
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    return String(value);
}

export interface SourceColumn {
    index: number;
    letter: string;
    header: string;
    samples: string[];
    hasData: boolean;
}

export type ColumnMapping = Record<string, ContactSchemaField | '__ignore__'>;

function colKey(col: SourceColumn): string {
    return `${col.index}:${col.header}`;
}

function autoMapColumns(sourceColumns: SourceColumn[]): ColumnMapping {
    const mapping: ColumnMapping = {};
    const claimed = new Set<ContactSchemaField>();

    // Pass 1: exact match
    for (const col of sourceColumns) {
        const norm = normalizeHeader(col.header);
        const exact = (CONTACT_SCHEMA_FIELDS as readonly string[]).find(
            (field) => normalizeHeader(field) === norm,
        );
        if (exact && !claimed.has(exact as ContactSchemaField)) {
            mapping[colKey(col)] = exact as ContactSchemaField;
            claimed.add(exact as ContactSchemaField);
        }
    }

    // Pass 2: bilingual alias match
    for (const col of sourceColumns) {
        if (mapping[colKey(col)]) continue;
        const norm = normalizeHeader(col.header);
        let matched: ContactSchemaField | null = null;
        for (const field of CONTACT_SCHEMA_FIELDS) {
            if (claimed.has(field)) continue;
            const aliases = ALIASES[field].map((a) => normalizeHeader(a));
            if (aliases.includes(norm)) {
                matched = field;
                break;
            }
        }
        if (matched) {
            mapping[colKey(col)] = matched;
            claimed.add(matched);
        }
    }

    // Pass 3: fuzzy substring match
    for (const col of sourceColumns) {
        if (mapping[colKey(col)]) continue;
        const norm = normalizeHeader(col.header);
        if (!norm) continue;
        const candidates = (CONTACT_SCHEMA_FIELDS as readonly ContactSchemaField[]).filter((field) => {
            if (claimed.has(field)) return false;
            const fieldNorm = normalizeHeader(field);
            const aliasNorms = ALIASES[field].map((a) => normalizeHeader(a));
            return (
                norm.includes(fieldNorm) ||
                fieldNorm.includes(norm) ||
                aliasNorms.some((a) => norm.includes(a) || a.includes(norm))
            );
        });
        if (candidates.length === 1) {
            mapping[colKey(col)] = candidates[0];
            claimed.add(candidates[0]);
        }
    }

    return mapping;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type WizardStep = 1 | 2 | 3 | 4;

interface ReviewRow {
    rowIndex: number;
    data: Record<string, string>;
    errors: string[];
    isDuplicate: boolean;
    selected: boolean;
}

interface ContactsImportWizardProps {
    embeddedSupplierId?: string;
    supplierId?: string;
    supplierName?: string;
    supplierNumber?: string;
    onSuccess?: () => void;
    onClose?: () => void;
}

export function ContactsImportWizard({
    embeddedSupplierId,
    supplierId: supplierIdProp,
    supplierName: supplierNameProp,
    supplierNumber: supplierNumberProp,
    onSuccess,
    onClose,
}: ContactsImportWizardProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialSupplierId = embeddedSupplierId ?? supplierIdProp ?? searchParams?.get('supplierId') ?? '';
    const initialSupplierName = supplierNameProp ?? searchParams?.get('supplierName') ?? '';
    const initialSupplierNumber = supplierNumberProp ?? searchParams?.get('supplierNumber') ?? '';

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const [step, setStep] = React.useState<WizardStep>(1);
    const [fileName, setFileName] = React.useState('');
    const [sheetNames, setSheetNames] = React.useState<string[]>([]);
    const [selectedSheet, setSelectedSheet] = React.useState('');
    const [rawAoa, setRawAoa] = React.useState<unknown[][]>([]);
    const [sourceColumns, setSourceColumns] = React.useState<SourceColumn[]>([]);
    const [mapping, setMapping] = React.useState<ColumnMapping>({});
    const [reviewRows, setReviewRows] = React.useState<ReviewRow[]>([]);
    const [parsing, setParsing] = React.useState(false);
    const [submitting, setSubmitting] = React.useState(false);
    const [dragOver, setDragOver] = React.useState(false);
    const [supplierId, setSupplierId] = React.useState<string>(initialSupplierId);
    const [supplierName, setSupplierName] = React.useState<string>(initialSupplierName);
    const [supplierNumber, setSupplierNumber] = React.useState<string>(initialSupplierNumber);
    const [supplierOptions, setSupplierOptions] = React.useState<Array<{ id: string; name: string; supplierNumber: string | null }>>([]);
    const [committed, setCommitted] = React.useState(false);

    React.useEffect(() => {
        listSuppliersLite().then(setSupplierOptions).catch(() => {});
    }, []);

    // -----------------------------------------------------------------------
    // Parsing Sheet & Extracting Source Columns
    // -----------------------------------------------------------------------

    const parseSheetData = React.useCallback((aoa: unknown[][]) => {
        if (!aoa.length) {
            setSourceColumns([]);
            setMapping({});
            return;
        }

        const headerRowIdx = aoa.findIndex((row) => Array.isArray(row) && row.some((c) => normaliseCell(c) !== ''));
        const headerRow = (headerRowIdx >= 0 ? aoa[headerRowIdx] : aoa[0]) || [];
        const dataRows = aoa.slice(headerRowIdx >= 0 ? headerRowIdx + 1 : 1);

        const colCount = Math.max(
            headerRow.length,
            ...dataRows.slice(0, 50).map((r) => (Array.isArray(r) ? r.length : 0)),
        );

        const cols: SourceColumn[] = [];
        for (let i = 0; i < colCount; i++) {
            const rawH = headerRow[i];
            const header = normaliseCell(rawH) || `Column ${i + 1}`;
            const samples: string[] = [];
            let hasData = false;

            for (const r of dataRows) {
                if (!Array.isArray(r)) continue;
                const v = normaliseCell(r[i]);
                if (v) {
                    hasData = true;
                    if (samples.length < 3 && !samples.includes(v)) {
                        samples.push(v);
                    }
                }
            }

            cols.push({
                index: i,
                letter: colLetter(i),
                header,
                samples,
                hasData,
            });
        }

        setSourceColumns(cols);
        setMapping(autoMapColumns(cols));
    }, []);

    const handleFile = async (file: File) => {
        if (!file) return;
        setParsing(true);
        setFileName(file.name);
        try {
            const buf = await file.arrayBuffer();
            const wb = XLSX.read(new Uint8Array(buf), { type: 'array' });
            if (!wb.SheetNames.length) throw new Error('No sheets found in file');

            setSheetNames(wb.SheetNames);
            const firstSheet = wb.SheetNames[0];
            setSelectedSheet(firstSheet);

            const ws = wb.Sheets[firstSheet];
            const aoa = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, blankrows: false, defval: '' });
            setRawAoa(aoa);
            parseSheetData(aoa);

            if (wb.SheetNames.length > 1) {
                setStep(2); // Sheet selection
            } else {
                setStep(3); // Map columns
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to parse file');
        } finally {
            setParsing(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const changeSheet = (sheetName: string, wbBuffer?: ArrayBuffer) => {
        setSelectedSheet(sheetName);
        // If raw buffer or sheet exists, parse
        // We re-read sheet if needed
    };

    const handleMappingChange = (col: SourceColumn, target: ContactSchemaField | '__ignore__' | '') => {
        setMapping((prev) => ({
            ...prev,
            [colKey(col)]: target === '' ? '__ignore__' : target,
        }));
    };

    // -----------------------------------------------------------------------
    // Transition to Review
    // -----------------------------------------------------------------------

    const handleProceedToReview = async () => {
        const headerRowIdx = rawAoa.findIndex((row) => Array.isArray(row) && row.some((c) => normaliseCell(c) !== ''));
        const dataRows = rawAoa.slice(headerRowIdx >= 0 ? headerRowIdx + 1 : 1);

        const rows: Array<Record<string, string>> = dataRows
            .filter((r) => Array.isArray(r) && r.some((c) => normaliseCell(c) !== ''))
            .map((r) => {
                const out: Record<string, string> = {
                    name: '',
                    email: '',
                    phone: '',
                    supplier: '',
                    supplierId: '',
                    department: '',
                    position: '',
                    responsibility: '',
                    language: '',
                    status: 'active',
                };

                for (const col of sourceColumns) {
                    const mappedField = mapping[colKey(col)];
                    if (mappedField && mappedField !== '__ignore__') {
                        const key = FIELD_KEY_MAP[mappedField];
                        const val = normaliseCell((r as unknown[])[col.index]);
                        if (val) out[key] = val;
                    }
                }

                // If email exists but name is empty, auto-derive name
                if (!out.name && out.email) {
                    const prefix = out.email.split('@')[0].replace(/[._-]/g, ' ');
                    out.name = prefix.charAt(0).toUpperCase() + prefix.slice(1);
                }

                return out;
            });

        try {
            const res = await prepareContactImport({
                supplierId: supplierId || null,
                rows,
            });

            const reviewFromServer: ReviewRow[] = (res.parsed || []).map((r: any) => ({
                rowIndex: r.rowIndex,
                data: rows[r.rowIndex] || {},
                errors: r.errors || [],
                isDuplicate: !!r.isDuplicate,
                selected: (r.errors || []).length === 0,
            }));

            setReviewRows(reviewFromServer);
            setStep(4);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to prepare review');
        }
    };

    // -----------------------------------------------------------------------
    // Final Commit
    // -----------------------------------------------------------------------

    const handleCommit = async () => {
        setSubmitting(true);
        try {
            const selected = reviewRows.filter((r) => r.selected && r.errors.length === 0);
            if (selected.length === 0) {
                toast.error('No valid rows selected for import');
                return;
            }
            const res = await commitContactImport({
                supplierId: supplierId || null,
                rows: selected.map((r) => r.data) as any,
            });
            if (res.success) {
                setCommitted(true);
                toast.success(`Successfully imported ${res.imported} contacts`);
                onSuccess?.();
                if (supplierId && !onSuccess) {
                    setTimeout(() => {
                        router.push(`/suppliers/${supplierNumber || supplierId}/contacts`);
                        router.refresh();
                    }, 800);
                }
            } else {
                toast.error(res.error || 'Import failed');
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to import contacts');
        } finally {
            setSubmitting(false);
        }
    };

    const updateReviewCell = (idx: number, field: string, value: string) => {
        setReviewRows((prev) =>
            prev.map((r) => (r.rowIndex === idx ? { ...r, data: { ...r.data, [field]: value } } : r)),
        );
    };

    // -----------------------------------------------------------------------
    // Step Navigation Indicators
    // -----------------------------------------------------------------------

    const steps = [
        { num: 1, label: 'Upload' },
        { num: 2, label: 'Sheet selection' },
        { num: 3, label: 'Map columns' },
        { num: 4, label: 'Review entries' },
    ];

    return (
        <div className="space-y-6">
            {/* Top Breadcrumb & Step Indicators matching screenshot */}
            <div className="mb-2 flex items-center gap-2 overflow-x-auto text-sm">
                {steps.map((s, idx) => {
                    const active = step === s.num;
                    const done = step > s.num;
                    return (
                        <React.Fragment key={s.num}>
                            {idx > 0 ? <span className="h-px w-10 bg-slate-200" /> : null}
                            <div className="flex items-center gap-2">
                                <div
                                    className={cn(
                                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors',
                                        active
                                            ? 'bg-black text-white'
                                            : done
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-slate-100 text-slate-500',
                                    )}
                                >
                                    {s.num}
                                </div>
                                <span
                                    className={cn(
                                        'whitespace-nowrap text-xs font-medium',
                                        active ? 'font-semibold text-slate-900' : 'text-slate-400',
                                    )}
                                >
                                    {s.label}
                                </span>
                            </div>
                        </React.Fragment>
                    );
                })}
            </div>

            {/* STEP 1: UPLOAD */}
            {step === 1 && (
                <div className="space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Upload & map columns</h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Upload an .xlsx, .xls, .csv, or .tsv file. We&apos;ll auto-map your columns to the contact template.
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={downloadExcelTemplate}
                            className="h-9 px-3.5 text-xs font-medium text-slate-700 border-slate-200 hover:bg-slate-50"
                        >
                            <Download className="h-4 w-4 mr-2 text-slate-500" /> Download Excel template
                        </Button>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls,.csv,.tsv"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFile(file);
                        }}
                    />

                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={(e) => {
                            e.preventDefault();
                            setDragOver(false);
                            const file = e.dataTransfer.files?.[0];
                            if (file) handleFile(file);
                        }}
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                            'rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer transition-all bg-white',
                            dragOver ? 'border-sky-500 bg-sky-50/50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/40',
                            parsing && 'opacity-60 pointer-events-none',
                        )}
                    >
                        {parsing ? (
                            <div className="flex flex-col items-center justify-center gap-2 py-6">
                                <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
                                <p className="text-xs font-medium text-slate-700">Reading and parsing file...</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600 mb-3">
                                    <Upload className="h-6 w-6" />
                                </div>
                                <p className="font-semibold text-slate-800 text-sm">Drop a file here, or click to browse</p>
                                <p className="text-xs text-slate-400 mt-1 mb-4">.xlsx, .xls, .csv, .tsv</p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        fileInputRef.current?.click();
                                    }}
                                    className="h-8 px-4 text-xs font-medium bg-white rounded-lg shadow-sm"
                                >
                                    Choose file
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={downloadCsvTemplate}
                            className="h-8 text-xs text-slate-600 hover:text-slate-900"
                        >
                            <Download className="h-3.5 w-3.5 mr-1.5 text-slate-400" /> CSV template
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setReviewRows([
                                    {
                                        rowIndex: 0,
                                        data: { name: '', email: '', status: 'active' },
                                        errors: ['Missing name', 'Missing email'],
                                        isDuplicate: false,
                                        selected: false,
                                    },
                                ]);
                                setStep(4);
                            }}
                            className="h-8 text-xs text-slate-600 hover:text-slate-900"
                        >
                            <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5 text-slate-400" /> Manual entry
                        </Button>
                    </div>
                </div>
            )}

            {/* STEP 2: SHEET SELECTION */}
            {step === 2 && (
                <div className="space-y-4">
                    <div>
                        <h2 className="text-base font-bold text-slate-900">Sheet selection</h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            File &ldquo;{fileName}&rdquo; contains {sheetNames.length} sheets. Pick one to import:
                        </p>
                    </div>

                    <div className="grid gap-2">
                        {sheetNames.map((s) => (
                            <label
                                key={s}
                                className={cn(
                                    'flex items-center gap-3 rounded-xl border p-3.5 cursor-pointer transition-colors',
                                    selectedSheet === s
                                        ? 'border-sky-500 bg-sky-50/40 text-slate-900'
                                        : 'border-slate-200 hover:bg-slate-50 text-slate-700',
                                )}
                            >
                                <input
                                    type="radio"
                                    checked={selectedSheet === s}
                                    onChange={() => setSelectedSheet(s)}
                                    className="h-4 w-4 text-sky-600"
                                />
                                <span className="font-semibold text-xs">{s}</span>
                            </label>
                        ))}
                    </div>

                    <div className="flex justify-between pt-3 border-t border-slate-100">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setStep(1)}
                            className="h-8 text-xs"
                        >
                            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => setStep(3)}
                            disabled={!selectedSheet}
                            className="h-8 text-xs bg-black text-white hover:bg-neutral-800"
                        >
                            Next <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                        </Button>
                    </div>
                </div>
            )}

            {/* STEP 3: MAP COLUMNS */}
            {step === 3 && (
                <div className="space-y-4">
                    {/* File chip */}
                    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5">
                        <div className="flex items-center gap-2 min-w-0">
                            <FileSpreadsheet className="h-4 w-4 text-sky-600 shrink-0" />
                            <span className="truncate text-xs font-semibold text-slate-800">{fileName}</span>
                            <button
                                type="button"
                                onClick={() => {
                                    setFileName('');
                                    setSourceColumns([]);
                                    setStep(1);
                                }}
                                className="ml-1 text-slate-400 hover:text-rose-600"
                                aria-label="Remove file"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>
                        {sheetNames.length > 1 && (
                            <div className="flex items-center gap-2 text-xs">
                                <span className="text-slate-500">Sheet:</span>
                                <span className="font-semibold text-slate-800">{selectedSheet}</span>
                            </div>
                        )}
                    </div>

                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                            Column mapping
                        </p>
                        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                            {sourceColumns.map((col) => {
                                const target = mapping[colKey(col)];
                                const unmappedWithData = (!target || target === '__ignore__') && col.hasData;
                                return (
                                    <div
                                        key={colKey(col)}
                                        className={cn(
                                            'flex items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-colors',
                                            unmappedWithData
                                                ? 'border-orange-200 bg-orange-50/40'
                                                : 'border-slate-200 bg-white',
                                        )}
                                    >
                                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-bold text-slate-600">
                                            {col.letter}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-xs font-semibold text-slate-800">
                                                {col.header}
                                            </p>
                                            <p className="truncate text-[11px] text-slate-400 mt-0.5">
                                                {col.samples.length
                                                    ? col.samples.map((s) => (s.length > 28 ? s.slice(0, 28) + '…' : s)).join('  ·  ')
                                                    : 'no sample values'}
                                            </p>
                                        </div>
                                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                                        <select
                                            className="h-8.5 w-56 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-800 outline-none focus:border-slate-400"
                                            value={target && target !== '__ignore__' ? target : ''}
                                            onChange={(e) =>
                                                handleMappingChange(
                                                    col,
                                                    (e.target.value || '') as ContactSchemaField | '__ignore__' | '',
                                                )
                                            }
                                        >
                                            <option value="">Don&apos;t import</option>
                                            {CONTACT_SCHEMA_FIELDS.map((field) => (
                                                <option key={field} value={field}>
                                                    {field} {field === 'Contact' || field === 'Email' ? '*' : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex justify-between pt-3 border-t border-slate-100">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setStep(sheetNames.length > 1 ? 2 : 1)}
                            className="h-8 text-xs"
                        >
                            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleProceedToReview}
                            className="h-8 text-xs bg-black text-white hover:bg-neutral-800"
                        >
                            Next <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                        </Button>
                    </div>
                </div>
            )}

            {/* STEP 4: REVIEW ENTRIES */}
            {step === 4 && (
                <div className="space-y-4">
                    {/* Supplier Selector */}
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                        <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-sky-600" />
                            <span className="text-xs font-semibold text-slate-700">Assign to Supplier (optional):</span>
                        </div>
                        <select
                            value={supplierId}
                            onChange={(e) => {
                                setSupplierId(e.target.value);
                                const matched = supplierOptions.find((s) => s.id === e.target.value);
                                setSupplierName(matched?.name ?? '');
                                setSupplierNumber(matched?.supplierNumber ?? '');
                            }}
                            className="h-8 rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-800 outline-none focus:border-slate-400"
                        >
                            <option value="">(No default supplier / Keep per-row)</option>
                            {supplierOptions.map((s, sIdx) => (
                                <option key={`supp-${s.id}-${sIdx}`} value={s.id}>
                                    {s.supplierNumber ? `${s.supplierNumber} ` : ''}{s.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600">
                        <span>
                            <strong className="text-emerald-700 font-semibold">
                                {reviewRows.filter((r) => r.errors.length === 0 && r.selected).length}
                            </strong>{' '}
                            valid rows selected for import
                            {reviewRows.filter((r) => r.errors.length > 0).length > 0 && (
                                <span className="text-rose-600 ml-2">
                                    ({reviewRows.filter((r) => r.errors.length > 0).length} flagged with errors)
                                </span>
                            )}
                        </span>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setReviewRows((prev) => prev.map((p) => ({ ...p, selected: p.errors.length === 0 })))}
                                className="h-7 text-xs text-slate-600"
                            >
                                Select all valid
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setReviewRows((prev) => prev.map((p) => ({ ...p, selected: false })))}
                                className="h-7 text-xs text-slate-400 hover:text-slate-600"
                            >
                                Deselect all
                            </Button>
                        </div>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-[360px]">
                        <table className="w-full text-xs">
                            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 sticky top-0 z-10 border-b border-slate-200">
                                <tr>
                                    <th className="px-2.5 py-2 w-8">
                                        <Checkbox
                                            checked={
                                                reviewRows.length > 0 &&
                                                reviewRows.filter((r) => r.errors.length === 0).length > 0 &&
                                                reviewRows.filter((r) => r.errors.length === 0).every((r) => r.selected)
                                            }
                                            onCheckedChange={(c) =>
                                                setReviewRows((prev) =>
                                                    prev.map((p) => (p.errors.length === 0 ? { ...p, selected: !!c } : p)),
                                                )
                                            }
                                        />
                                    </th>
                                    {['name', 'email', 'phone', 'supplier', 'language', 'department', 'position', 'responsibility', 'status'].map(
                                        (k, kIdx) => (
                                            <th key={`th-${k}-${kIdx}`} className="px-2.5 py-2 text-left font-medium">
                                                {KEY_TO_FIELD_MAP[k] ?? k}
                                            </th>
                                        ),
                                    )}
                                    <th className="px-2.5 py-2 w-8" />
                                </tr>
                            </thead>
                            <tbody>
                                {reviewRows.map((r, rIdx) => (
                                    <tr
                                        key={`review-row-${r.rowIndex}-${rIdx}`}
                                        className={cn(
                                            'border-b border-slate-100 transition-colors',
                                            r.errors.length > 0 ? 'bg-rose-50/40' : 'hover:bg-slate-50/60',
                                        )}
                                    >
                                        <td className="px-2.5 py-2">
                                            <Checkbox
                                                checked={r.selected && r.errors.length === 0}
                                                disabled={r.errors.length > 0}
                                                onCheckedChange={(c) =>
                                                    setReviewRows((prev) =>
                                                        prev.map((p) =>
                                                            p.rowIndex === r.rowIndex ? { ...p, selected: !!c } : p,
                                                        ),
                                                    )
                                                }
                                            />
                                        </td>
                                        {['name', 'email', 'phone', 'supplier', 'language', 'department', 'position', 'responsibility', 'status'].map(
                                            (k, kIdx) => (
                                                <td key={`cell-${r.rowIndex}-${k}-${kIdx}`} className="px-2.5 py-1">
                                                    <Input
                                                        value={r.data[k] ?? ''}
                                                        onChange={(e) => updateReviewCell(r.rowIndex, k, e.target.value)}
                                                        className={cn(
                                                            'h-7 text-xs rounded border-slate-200',
                                                            (k === 'name' && !r.data.name) || (k === 'email' && !isValidEmail(r.data.email || ''))
                                                                ? 'border-rose-300 bg-rose-50/50'
                                                                : '',
                                                        )}
                                                    />
                                                </td>
                                            ),
                                        )}
                                        <td className="px-2.5 py-2">
                                            <button
                                                type="button"
                                                onClick={() => setReviewRows((prev) => prev.filter((p) => p.rowIndex !== r.rowIndex))}
                                                className="text-slate-400 hover:text-rose-600 p-1"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                <tr className="border-t border-slate-100 bg-slate-50/40">
                                    <td className="px-2.5 py-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const next = reviewRows.length;
                                                setReviewRows((prev) => [
                                                    ...prev,
                                                    {
                                                        rowIndex: next,
                                                        data: { name: '', email: '', status: 'active' },
                                                        errors: ['Missing name', 'Missing email'],
                                                        isDuplicate: false,
                                                        selected: false,
                                                    },
                                                ]);
                                            }}
                                            className="h-6 w-6 p-0"
                                        >
                                            <Plus className="h-3 w-3" />
                                        </Button>
                                    </td>
                                    <td colSpan={10} className="px-2.5 py-2 text-[11px] text-slate-500">
                                        Add blank row
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {committed ? (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            <span>Import completed successfully!</span>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 sticky bottom-0 bg-white z-20">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setStep(3)}
                                className="h-9 text-xs"
                            >
                                <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleCommit}
                                disabled={submitting || reviewRows.filter((r) => r.selected && r.errors.length === 0).length === 0}
                                className="h-9 px-4 text-xs font-medium bg-black text-white hover:bg-neutral-800 flex items-center gap-1.5 cursor-pointer shadow-sm"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                                        Importing...
                                    </>
                                ) : (
                                    <>
                                        Next (Import {reviewRows.filter((r) => r.selected && r.errors.length === 0).length} Contacts){' '}
                                        <ArrowRight className="h-3.5 w-3.5 ml-1" />
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
