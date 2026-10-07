'use client';

import * as React from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import {
    FileSpreadsheet,
    ArrowRight,
    CheckCircle2,
    Loader2,
    Trash2,
    AlertTriangle,
    AlertCircle,
    Eye,
    LayoutGrid,
    List,
    ChevronLeft,
    ChevronUp,
    ChevronDown,
    HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
    prepareArticleImport,
    commitArticleImport,
    type ParsedArticleImportRow,
} from '@/app/actions/articles';
import { colLetter, normaliseCell } from '@/lib/contacts/import-parser';
import {
    ManualEntrySpreadsheet,
    type ManualSpreadsheetColumn,
} from '@/components/shared/manual-entry-spreadsheet';

// ---------------------------------------------------------------------------
// Schema Definition for Articles
// ---------------------------------------------------------------------------

export const ARTICLE_TARGET_FIELDS = [
    { key: 'articleNumber', label: 'Article ID', required: true, description: 'Unique article identifier / part number' },
    { key: 'description', label: 'Article Name', required: true, description: 'Short name or description' },
    { key: 'longText', label: 'Long text', required: false, description: 'Extended item details or specifications' },
    { key: 'cnCode', label: 'CN code', required: false, description: 'Customs / HS commodity code' },
    { key: 'category', label: 'Category', required: false, description: 'Material or product category' },
    { key: 'netWeight', label: 'Net weight', required: false, description: 'Net weight numerical value' },
    { key: 'netWeightUnit', label: 'Net weight unit', required: false, description: 'Unit of measure (e.g. G, KG, T)' },
    { key: 'budgetPrice', label: 'Budget price', required: false, description: 'Target or budget unit price' },
    { key: 'costModel', label: 'Cost model', required: false, description: 'Costing model designation' },
] as const;

export type ArticleTargetFieldKey = (typeof ARTICLE_TARGET_FIELDS)[number]['key'];

export const IGNORE_COLUMN = '__ignore__';

// Bilingual alias list (English + German) for auto-mapping
const ALIASES: Record<ArticleTargetFieldKey, string[]> = {
    articleNumber: [
        'article id',
        'articleid',
        'article number',
        'article no',
        'articlenumber',
        'article',
        'item number',
        'item no',
        'sku',
        'part number',
        'part no',
        'artikelnummer',
        'artikelnr',
        'artikel',
        'materialnummer',
        'matnr',
        'id',
    ],
    description: [
        'article name',
        'articlename',
        'description',
        'desc',
        'name',
        'title',
        'bezeichnung',
        'beschreibung',
        'artikelname',
        'kurztext',
    ],
    longText: [
        'long text',
        'longtext',
        'extended description',
        'details',
        'langtext',
        'artikelbeschreibung',
        'spezifikation',
    ],
    cnCode: [
        'cn code',
        'cncode',
        'hs code',
        'hscode',
        'customs code',
        'commodity code',
        'zolltarifnummer',
        'warennummer',
    ],
    category: [
        'category',
        'group',
        'material group',
        'product group',
        'kategorie',
        'warengruppe',
        'matkl',
    ],
    netWeight: [
        'net weight',
        'netweight',
        'weight',
        'nettogewicht',
        'gewicht',
        'net mass',
    ],
    netWeightUnit: [
        'net weight unit',
        'weight unit',
        'unit',
        'gewichts-einheit',
        'einheit',
        'uom',
    ],
    budgetPrice: [
        'budget price',
        'budgetprice',
        'target price',
        'price',
        'richtpreis',
        'zielpreis',
        'preis',
    ],
    costModel: [
        'cost model',
        'costmodel',
        'kalkulationsmodell',
        'kostenmodell',
    ],
};

const TEMPLATE_HEADERS = [
    'Article ID',
    'Article Name',
    'Long text',
    'CN code',
    'Category',
    'Net weight',
    'Net weight unit',
    'Budget price',
    'Cost model',
];

const TEMPLATE_SAMPLE: string[][] = [
    [
        '10000100',
        'ISOLIERSCHLAUCH',
        'ISOLIERSCHLAUCH 10MM SCHWARZ',
        '39173200',
        '0340 Tube, Sleeve, Hose',
        '3.5',
        'G',
        '1.25',
        'Standard',
    ],
    [
        '10000101',
        'MAGNETGEHAEUSE',
        'MAGNETGEHAEUSE VERZINKT',
        '85059090',
        '0640 Deep drawn',
        '120.0',
        'KG',
        '45.00',
        'Standard',
    ],
];

function downloadExcelTemplate() {
    const ws = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS, ...TEMPLATE_SAMPLE]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Articles');
    XLSX.writeFile(wb, 'articles-import-template.xlsx');
}

function downloadCsvTemplate() {
    const rows = [
        TEMPLATE_HEADERS.join(','),
        ...TEMPLATE_SAMPLE.map((row) =>
            row.map((cell) => `"${(cell || '').replace(/"/g, '""')}"`).join(','),
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

// ---------------------------------------------------------------------------
// 5-Step Tacto Wizard Definition
// ---------------------------------------------------------------------------

type WizardStep = 'upload' | 'sheet' | 'header' | 'mapping' | 'review';

const WIZARD_STEPS = [
    { key: 'upload', label: 'Upload' },
    { key: 'sheet', label: 'Sheet selection' },
    { key: 'header', label: 'Select header row' },
    { key: 'mapping', label: 'Map columns' },
    { key: 'review', label: 'Review entries' },
] as const;

interface SourceColumn {
    index: number;
    letter: string;
    header: string;
    samples: string[];
    hasData: boolean;
}

const ARTICLE_MANUAL_COLUMNS: ManualSpreadsheetColumn[] = [
    { key: 'articleNumber', label: 'Article ID', required: true, placeholder: 'e.g. 10000100' },
    { key: 'description', label: 'Article Name', required: true, placeholder: 'e.g. HOSE 10MM BLACK' },
    { key: 'longText', label: 'Long text', placeholder: 'Detailed description...' },
    { key: 'cnCode', label: 'CN code', placeholder: '39173200' },
    { key: 'category', label: 'Category', placeholder: '0340 Tube, Sleeve' },
    {
        key: 'netWeight',
        label: 'Net weight',
        placeholder: '3.5',
        validator: (v) => (v && isNaN(Number(v)) ? 'Must be a valid number' : null),
    },
    { key: 'netWeightUnit', label: 'Net weight unit', placeholder: 'G, KG' },
    {
        key: 'budgetPrice',
        label: 'Budget price',
        placeholder: '1.25',
        validator: (v) => (v && isNaN(Number(v)) ? 'Must be a valid number' : null),
    },
    { key: 'costModel', label: 'Cost model', placeholder: 'Standard' },
];

interface ArticlesImportWizardProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function ArticlesImportWizard({ onSuccess, onCancel: _onCancel }: ArticlesImportWizardProps) {
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Flow State
    const [step, setStep] = React.useState<WizardStep>('upload');
    const [isManualEntry, setIsManualEntry] = React.useState(false);
    const [fileName, setFileName] = React.useState('');
    const [sheetNames, setSheetNames] = React.useState<string[]>([]);
    const [selectedSheet, setSelectedSheet] = React.useState('');
    const [sheetViewMode, setSheetViewMode] = React.useState<'grid' | 'list'>('grid');
    const [workbookRef, setWorkbookRef] = React.useState<XLSX.WorkBook | null>(null);

    // Sheet Quick Preview Modal (Eye symbol)
    const [previewSheetModal, setPreviewSheetModal] = React.useState<{
        open: boolean;
        sheetName: string;
        aoa: unknown[][];
    }>({ open: false, sheetName: '', aoa: [] });

    // Full Raw Sheet Data for Header Selection
    const [rawSheetAoa, setRawSheetAoa] = React.useState<unknown[][]>([]);
    const [headerRowIndex, setHeaderRowIndex] = React.useState<number>(0);

    // Extracted Data & Columns
    const [sourceColumns, setSourceColumns] = React.useState<SourceColumn[]>([]);
    const [rawDataRows, setRawDataRows] = React.useState<unknown[][]>([]);

    // Column Mapping: colKey -> ArticleTargetFieldKey | '__ignore__'
    const [mapping, setMapping] = React.useState<Record<string, ArticleTargetFieldKey | typeof IGNORE_COLUMN>>({});

    // Collapsible sample rows per column card in Step 4
    const [collapsedColumns, setCollapsedColumns] = React.useState<Record<string, boolean>>({});

    // Review Rows State
    const [validatedRows, setValidatedRows] = React.useState<
        Array<{
            rowIndex: number;
            raw: ParsedArticleImportRow;
            cleaned: {
                articleNumber: string;
                description: string | null;
                longText: string | null;
                cnCode: string | null;
                category: string | null;
                netWeight: number | null;
                netWeightUnit: string | null;
                budgetPrice: number | null;
                costModel: string | null;
            };
            errors: string[];
            warnings: string[];
            selected: boolean;
        }>
    >([]);

    const [parsing, setParsing] = React.useState(false);
    const [validating, setValidating] = React.useState(false);
    const [submitting, setSubmitting] = React.useState(false);
    const [dragOver, setDragOver] = React.useState(false);
    const [committed, setCommitted] = React.useState(false);

    // -----------------------------------------------------------------------
    // Parsing Sheet with Given Header Row Index
    // -----------------------------------------------------------------------

    const parseSheetData = React.useCallback(
        (aoa: unknown[][], customHeaderIdx?: number) => {
            if (!aoa.length) {
                setSourceColumns([]);
                setRawDataRows([]);
                setMapping({});
                return;
            }

            let headerIdx = 0;
            if (typeof customHeaderIdx === 'number' && customHeaderIdx >= 0 && customHeaderIdx < aoa.length) {
                headerIdx = customHeaderIdx;
            } else {
                const firstNonEmptyIdx = aoa.findIndex((row) => Array.isArray(row) && row.some((c) => normaliseCell(c) !== ''));
                headerIdx = firstNonEmptyIdx >= 0 ? firstNonEmptyIdx : 0;
            }

            setHeaderRowIndex(headerIdx);

            const candidateHeaderRow = (Array.isArray(aoa[headerIdx]) ? aoa[headerIdx] : []) as unknown[];
            const maxCols = Math.max(
                candidateHeaderRow.length,
                ...aoa.slice(0, Math.min(aoa.length, 50)).map((r) => (Array.isArray(r) ? r.length : 0)),
            );

            const seenHeaders = new Map<string, number>();
            const headers: string[] = [];
            for (let i = 0; i < maxCols; i++) {
                const cellVal = normaliseCell(candidateHeaderRow[i]);
                const raw = cellVal ? cellVal : `Column ${colLetter(i)}`;
                const count = seenHeaders.get(raw) || 0;
                seenHeaders.set(raw, count + 1);
                headers.push(count > 0 ? `${raw} (${count + 1})` : raw);
            }

            const dataRows = aoa
                .slice(headerIdx + 1)
                .filter((r) => Array.isArray(r) && r.some((c) => normaliseCell(c) !== ''));

            setRawDataRows(dataRows);

            const cols: SourceColumn[] = [];
            for (let i = 0; i < headers.length; i++) {
                const h = headers[i];
                const samples: string[] = [];
                let hasData = false;

                for (const r of dataRows) {
                    if (!Array.isArray(r)) continue;
                    const v = normaliseCell(r[i]);
                    if (v) {
                        hasData = true;
                        if (samples.length < 5 && !samples.includes(v)) {
                            samples.push(v);
                        }
                    }
                }

                cols.push({
                    index: i,
                    letter: colLetter(i),
                    header: h,
                    samples,
                    hasData,
                });
            }

            setSourceColumns(cols);

            // Auto-mapping: Match English & German aliases
            const autoMap: Record<string, ArticleTargetFieldKey | typeof IGNORE_COLUMN> = {};
            const claimed = new Set<ArticleTargetFieldKey>();

            for (const col of cols) {
                const keyId = `${col.index}:${col.header}`;
                const normHeader = col.header.trim().toLowerCase().replace(/[\s_\-./()]+/g, ' ');

                let matchedField: ArticleTargetFieldKey | null = null;

                // Pass 1: exact field key or label match
                for (const field of ARTICLE_TARGET_FIELDS) {
                    if (claimed.has(field.key)) continue;
                    const normLabel = field.label.toLowerCase();
                    if (normHeader === normLabel || normHeader === field.key.toLowerCase()) {
                        matchedField = field.key;
                        break;
                    }
                }

                // Pass 2: Alias match
                if (!matchedField) {
                    for (const [fKey, aliasList] of Object.entries(ALIASES) as Array<[ArticleTargetFieldKey, string[]]>) {
                        if (claimed.has(fKey)) continue;
                        if (aliasList.some((al) => normHeader === al || normHeader.includes(al))) {
                            matchedField = fKey;
                            break;
                        }
                    }
                }

                if (matchedField) {
                    autoMap[keyId] = matchedField;
                    claimed.add(matchedField);
                } else {
                    autoMap[keyId] = IGNORE_COLUMN;
                }
            }

            setMapping(autoMap);
        },
        [],
    );

    // -----------------------------------------------------------------------
    // File Handler
    // -----------------------------------------------------------------------

    const handleFile = async (file: File) => {
        if (!file) return;
        setParsing(true);
        setFileName(file.name);
        try {
            const buf = await file.arrayBuffer();
            const wb = XLSX.read(new Uint8Array(buf), { type: 'array' });
            if (!wb.SheetNames.length) throw new Error('No sheets found in file');

            setWorkbookRef(wb);
            setSheetNames(wb.SheetNames);
            const firstSheet = wb.SheetNames[0];
            setSelectedSheet(firstSheet);

            const ws = wb.Sheets[firstSheet];
            const aoa = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, blankrows: false, defval: '', raw: false });
            setRawSheetAoa(aoa);

            parseSheetData(aoa, 0);
            setStep('sheet');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to parse file');
        } finally {
            setParsing(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const loadSheetAoa = (sheetName: string) => {
        if (!workbookRef || !sheetName) return;
        const ws = workbookRef.Sheets[sheetName];
        if (!ws) return;
        const aoa = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, blankrows: false, defval: '', raw: false });
        setRawSheetAoa(aoa);
        parseSheetData(aoa, 0);
    };

    const handleOpenSheetPreview = (sheetName: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!workbookRef || !sheetName) return;
        const ws = workbookRef.Sheets[sheetName];
        if (!ws) return;
        const aoa = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, blankrows: false, defval: '', raw: false });
        setPreviewSheetModal({
            open: true,
            sheetName,
            aoa,
        });
    };

    // -----------------------------------------------------------------------
    // Mapping Analysis
    // -----------------------------------------------------------------------

    const getColKey = (col: SourceColumn) => `${col.index}:${col.header}`;

    const mappingAnalysis = React.useMemo(() => {
        const targetCounts = new Map<ArticleTargetFieldKey, number>();
        for (const col of sourceColumns) {
            const target = mapping[getColKey(col)];
            if (target && target !== IGNORE_COLUMN) {
                targetCounts.set(target, (targetCounts.get(target) || 0) + 1);
            }
        }

        const duplicateTargets = new Set<ArticleTargetFieldKey>();
        for (const [target, count] of targetCounts.entries()) {
            if (count > 1) duplicateTargets.add(target);
        }

        let mappedCount = 0;
        let needsReviewCount = 0;
        let ignoredCount = 0;

        for (const col of sourceColumns) {
            const key = getColKey(col);
            const target = mapping[key];

            if (!target || target === IGNORE_COLUMN) {
                if (col.hasData) needsReviewCount++;
                else ignoredCount++;
            } else if (duplicateTargets.has(target)) {
                needsReviewCount++;
            } else {
                mappedCount++;
            }
        }

        const isArticleNumberMapped = Array.from(targetCounts.keys()).includes('articleNumber');
        const isDescriptionMapped = Array.from(targetCounts.keys()).includes('description');
        const hasDuplicates = duplicateTargets.size > 0;
        const isValidToProceed = isArticleNumberMapped && !hasDuplicates;

        return {
            mappedCount,
            needsReviewCount,
            ignoredCount,
            duplicateTargets,
            isArticleNumberMapped,
            isDescriptionMapped,
            hasDuplicates,
            isValidToProceed,
        };
    }, [sourceColumns, mapping]);

    const handleMappingChange = (col: SourceColumn, target: ArticleTargetFieldKey | typeof IGNORE_COLUMN) => {
        setMapping((prev) => {
            const next = { ...prev };
            const key = getColKey(col);

            if (target === IGNORE_COLUMN) {
                next[key] = IGNORE_COLUMN;
                return next;
            }

            for (const otherCol of sourceColumns) {
                const otherKey = getColKey(otherCol);
                if (otherKey !== key && next[otherKey] === target) {
                    next[otherKey] = IGNORE_COLUMN;
                }
            }

            next[key] = target;
            return next;
        });
    };

    const getColumnValueStats = (colIndex: number) => {
        if (!rawDataRows.length) return { filledCount: 0, total: 0, percent: '0' };
        let filled = 0;
        for (const row of rawDataRows) {
            if (Array.isArray(row) && normaliseCell(row[colIndex]) !== '') {
                filled++;
            }
        }
        const pct = ((filled / rawDataRows.length) * 100).toFixed(filled === rawDataRows.length ? 0 : 2);
        return { filledCount: filled, total: rawDataRows.length, percent: pct };
    };

    // -----------------------------------------------------------------------
    // Prepare Review
    // -----------------------------------------------------------------------

    const handleProceedToReview = async () => {
        setValidating(true);
        try {
            const rowsToValidate: ParsedArticleImportRow[] = [];

            for (const row of rawDataRows) {
                if (!Array.isArray(row)) continue;
                const rec: Record<string, string> = {};

                for (const col of sourceColumns) {
                    const target = mapping[getColKey(col)];
                    if (target && target !== IGNORE_COLUMN) {
                        rec[target] = normaliseCell(row[col.index]);
                    }
                }

                rowsToValidate.push({
                    articleNumber: rec.articleNumber || '',
                    description: rec.description || '',
                    longText: rec.longText || '',
                    cnCode: rec.cnCode || '',
                    category: rec.category || '',
                    netWeight: rec.netWeight || '',
                    netWeightUnit: rec.netWeightUnit || '',
                    budgetPrice: rec.budgetPrice || '',
                    costModel: rec.costModel || '',
                });
            }

            const res = await prepareArticleImport(rowsToValidate);

            const preparedRows = res.rows.map((r) => ({
                rowIndex: r.rowIndex,
                raw: r.raw,
                cleaned: r.cleaned,
                errors: r.errors,
                warnings: r.warnings,
                selected: r.isValid,
            }));

            setValidatedRows(preparedRows);
            setStep('review');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to validate articles');
        } finally {
            setValidating(false);
        }
    };

    const updateReviewCell = (rowIndex: number, field: string, value: string) => {
        setValidatedRows((prev) =>
            prev.map((r) => {
                if (r.rowIndex !== rowIndex) return r;
                const nextCleaned = { ...r.cleaned, [field]: value };
                const errors: string[] = [];
                if (!nextCleaned.articleNumber?.trim()) {
                    errors.push('Article number is required');
                }
                return {
                    ...r,
                    cleaned: nextCleaned,
                    errors,
                    selected: errors.length === 0 ? r.selected : false,
                };
            }),
        );
    };

    // -----------------------------------------------------------------------
    // Commit Import
    // -----------------------------------------------------------------------

    const handleCommit = async () => {
        const rowsToImport = validatedRows.filter((r) => r.selected && r.errors.length === 0);
        if (!rowsToImport.length) {
            toast.error('No valid rows selected for import.');
            return;
        }

        setSubmitting(true);
        try {
            const items = rowsToImport.map((r) => r.cleaned);
            const res = await commitArticleImport(items);

            if (res.success && res.insertedCount > 0) {
                setCommitted(true);
                toast.success(`Successfully imported ${res.insertedCount} article${res.insertedCount !== 1 ? 's' : ''}.`);
                onSuccess?.();
            } else {
                toast.error(res.error || 'Failed to import articles.');
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Import failed');
        } finally {
            setSubmitting(false);
        }
    };

    const currentStepIndex = WIZARD_STEPS.findIndex((s) => s.key === step);

    const gridMaxCols = React.useMemo(() => {
        if (!rawSheetAoa.length) return 8;
        return Math.min(26, Math.max(8, ...rawSheetAoa.slice(0, 30).map((r) => (Array.isArray(r) ? r.length : 0))));
    }, [rawSheetAoa]);

    // -----------------------------------------------------------------------
    // Render UI
    // -----------------------------------------------------------------------

    if (isManualEntry) {
        return (
            <ManualEntrySpreadsheet
                title="Article Import"
                columns={ARTICLE_MANUAL_COLUMNS}
                entityNameSingular="article"
                entityNamePlural="articles"
                onBack={() => setIsManualEntry(false)}
                onCommit={async (validRows) => {
                    const cleanedItems = validRows.map((r) => ({
                        articleNumber: r.articleNumber,
                        description: r.description,
                        longText: r.longText || null,
                        cnCode: r.cnCode || null,
                        category: r.category || null,
                        netWeight: r.netWeight ? Number(r.netWeight) : null,
                        netWeightUnit: r.netWeightUnit || null,
                        budgetPrice: r.budgetPrice ? Number(r.budgetPrice) : null,
                        costModel: r.costModel || null,
                    }));

                    const res = await commitArticleImport(cleanedItems);
                    if (res.success) {
                        onSuccess?.();
                        return { success: true, count: res.insertedCount };
                    } else {
                        return { success: false, error: res.error || 'Failed to import articles' };
                    }
                }}
            />
        );
    }

    return (
        <div className="w-full space-y-6 text-slate-800">
            {/* Top Stepper Breadcrumb */}
            <div className="flex items-center gap-2.5 text-xs text-slate-500 overflow-x-auto pb-1 border-b border-slate-100">
                {WIZARD_STEPS.map((s, idx) => {
                    const isDone = idx < currentStepIndex;
                    const isCurrent = idx === currentStepIndex;
                    return (
                        <React.Fragment key={s.key}>
                            {idx > 0 && <span className="text-slate-300 font-light select-none">&gt;</span>}
                            <div
                                className={cn(
                                    'flex items-center gap-1.5 whitespace-nowrap py-1',
                                    isCurrent && 'font-semibold text-slate-900',
                                    isDone && 'text-slate-700',
                                    !isCurrent && !isDone && 'text-slate-400',
                                )}
                            >
                                {isDone && (
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                )}
                                <span>{s.label}</span>
                            </div>
                        </React.Fragment>
                    );
                })}
            </div>

            {/* STEP 1: UPLOAD */}
            {step === 'upload' && (
                <div className="space-y-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Upload</h2>
                            <p className="text-xs text-slate-500 mt-1">
                                Drag and drop your file here or browse and upload your file.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={downloadExcelTemplate}
                                className="h-9 px-3.5 text-xs font-medium text-slate-700 border-slate-200 hover:bg-slate-50 rounded-lg shadow-sm"
                            >
                                Excel template (.xlsx)
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={downloadCsvTemplate}
                                className="h-9 px-3.5 text-xs font-medium text-slate-700 border-slate-200 hover:bg-slate-50 rounded-lg shadow-sm"
                            >
                                CSV template
                            </Button>
                        </div>
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

                    {/* Central Dropzone Box */}
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
                            'rounded-2xl border border-dashed p-12 text-center transition-all bg-white flex flex-col items-center justify-center min-h-[320px]',
                            dragOver ? 'border-[#FF7A00] bg-orange-50/30' : 'border-slate-200 hover:border-slate-300',
                            parsing && 'opacity-60 pointer-events-none',
                        )}
                    >
                        {parsing ? (
                            <div className="flex flex-col items-center justify-center gap-3 py-8">
                                <Loader2 className="h-10 w-10 animate-spin text-[#FF7A00]" />
                                <p className="text-xs font-semibold text-slate-700">Reading and preparing file...</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center">
                                {/* 3 File Badges: XLS(X), CSV, TSV */}
                                <div className="flex items-center gap-4 mb-5">
                                    {['XLS(X)', 'CSV', 'TSV'].map((fmt) => (
                                        <div
                                            key={fmt}
                                            className="relative flex flex-col items-center justify-end w-14 h-16 rounded-lg bg-slate-50 border border-slate-200 shadow-sm p-1.5"
                                        >
                                            <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-slate-300" />
                                            <div className="w-full py-1 text-center rounded bg-[#FF7A00] text-white text-[10px] font-bold tracking-tight uppercase shadow-xs">
                                                {fmt}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <p className="font-medium text-slate-700 text-sm mb-4">Drop file here</p>

                                <div className="flex items-center gap-3 my-2 w-64">
                                    <div className="h-px flex-1 bg-slate-200" />
                                    <span className="text-xs text-slate-400 font-medium">or</span>
                                    <div className="h-px flex-1 bg-slate-200" />
                                </div>

                                <div className="flex items-center gap-3 mt-4">
                                    <Button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="h-9 px-6 text-xs font-semibold bg-[#FF7A00] hover:bg-[#EA6C00] text-white rounded-lg shadow-sm"
                                    >
                                        Select file
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => setIsManualEntry(true)}
                                        className="h-9 px-6 text-xs font-semibold bg-[#FFE0CC] hover:bg-[#FFD4BD] text-[#C45500] rounded-lg shadow-sm"
                                    >
                                        Manual entry
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* STEP 2: SHEET SELECTION */}
            {step === 'sheet' && (
                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Sheet selection</h2>
                        <p className="text-xs text-slate-500 mt-1">
                            Select the sheet in your file that you want to import.
                        </p>
                    </div>

                    {/* Toolbar */}
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-700">
                            {sheetNames.length} {sheetNames.length === 1 ? 'sheet' : 'sheets'} imported.
                        </span>
                        <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-0.5 bg-slate-50">
                            <button
                                type="button"
                                onClick={() => setSheetViewMode('grid')}
                                className={cn(
                                    'p-1.5 rounded text-slate-500 transition-colors',
                                    sheetViewMode === 'grid' ? 'bg-white shadow-xs text-slate-900' : 'hover:text-slate-700',
                                )}
                                title="Grid view"
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setSheetViewMode('list')}
                                className={cn(
                                    'p-1.5 rounded text-slate-500 transition-colors',
                                    sheetViewMode === 'list' ? 'bg-white shadow-xs text-slate-900' : 'hover:text-slate-700',
                                )}
                                title="List view"
                            >
                                <List className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Sheet Cards Grid or List */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                        {/* Left Info Card */}
                        <div className="md:col-span-1 rounded-xl border border-slate-200 border-l-4 border-l-[#FF7A00] bg-white p-4 shadow-sm">
                            <h3 className="font-bold text-xs text-slate-900 truncate" title={fileName}>
                                {fileName}
                            </h3>
                            <p className="text-[11px] text-slate-500 mt-1">
                                {sheetNames.length} {sheetNames.length === 1 ? 'Sheet' : 'Sheets'}
                            </p>
                        </div>

                        {/* Right Sheets View */}
                        <div className="md:col-span-3">
                            {sheetViewMode === 'grid' ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {sheetNames.map((sName) => {
                                        const isSelected = selectedSheet === sName;
                                        return (
                                            <div
                                                key={sName}
                                                onClick={() => {
                                                    setSelectedSheet(sName);
                                                    loadSheetAoa(sName);
                                                }}
                                                className={cn(
                                                    'cursor-pointer rounded-xl border p-4 bg-white transition-all shadow-sm relative flex flex-col justify-between min-h-[170px]',
                                                    isSelected
                                                        ? 'border-[#FF7A00] ring-1 ring-[#FF7A00]'
                                                        : 'border-slate-200 hover:border-slate-300 hover:shadow-md',
                                                )}
                                            >
                                                {/* Top Row: Checkbox + Eye Preview Symbol */}
                                                <div className="flex items-center justify-between">
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={() => {
                                                            setSelectedSheet(sName);
                                                            loadSheetAoa(sName);
                                                        }}
                                                        className={cn(
                                                            'h-4 w-4 rounded',
                                                            isSelected && 'bg-[#FF7A00] border-[#FF7A00] text-white',
                                                        )}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleOpenSheetPreview(sName, e)}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                                                        title="Quick preview sheet data"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                </div>

                                                {/* Table wireframe graphic */}
                                                <div className="my-3 flex flex-col justify-center items-center">
                                                    <div className="w-full max-w-[130px] rounded border border-orange-200 bg-orange-50/40 p-1.5 space-y-1">
                                                        <div className="h-3 rounded bg-[#FFD9C0] w-full" />
                                                        <div className="grid grid-cols-3 gap-1">
                                                            <div className="h-2 rounded bg-orange-100" />
                                                            <div className="h-2 rounded bg-orange-100" />
                                                            <div className="h-2 rounded bg-orange-100" />
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-1">
                                                            <div className="h-2 rounded bg-orange-100" />
                                                            <div className="h-2 rounded bg-orange-100" />
                                                            <div className="h-2 rounded bg-orange-100" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Sheet Name & File */}
                                                <div>
                                                    <h4 className="font-semibold text-xs text-slate-800 truncate">{sName}</h4>
                                                    <p className="text-[10px] text-slate-400 truncate">{fileName}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
                                    {sheetNames.map((sName) => {
                                        const isSelected = selectedSheet === sName;
                                        return (
                                            <div
                                                key={sName}
                                                onClick={() => {
                                                    setSelectedSheet(sName);
                                                    loadSheetAoa(sName);
                                                }}
                                                className={cn(
                                                    'flex items-center justify-between p-3.5 cursor-pointer transition-colors',
                                                    isSelected ? 'bg-orange-50/40' : 'hover:bg-slate-50',
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={() => {
                                                            setSelectedSheet(sName);
                                                            loadSheetAoa(sName);
                                                        }}
                                                        className={cn(
                                                            'h-4 w-4 rounded',
                                                            isSelected && 'bg-[#FF7A00] border-[#FF7A00] text-white',
                                                        )}
                                                    />
                                                    <div>
                                                        <h4 className="font-semibold text-xs text-slate-800">{sName}</h4>
                                                        <p className="text-[10px] text-slate-400">{fileName}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleOpenSheetPreview(sName, e)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                                                    title="Quick preview sheet data"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bottom Navigation */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setStep('upload')}
                            className="h-9 px-4 text-xs font-medium rounded-lg text-slate-700"
                        >
                            <ChevronLeft className="h-4 w-4 mr-1 text-slate-500" /> Back
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => {
                                if (!selectedSheet && sheetNames.length > 0) {
                                    setSelectedSheet(sheetNames[0]);
                                    loadSheetAoa(sheetNames[0]);
                                }
                                setStep('header');
                            }}
                            disabled={!selectedSheet && sheetNames.length === 0}
                            className="h-9 px-6 text-xs font-semibold bg-[#FF7A00] hover:bg-[#EA6C00] text-white rounded-lg shadow-sm"
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}

            {/* STEP 3: SELECT HEADER ROW & PREVIEW */}
            {step === 'header' && (
                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Select header row</h2>
                        <p className="text-xs text-slate-500 mt-1">
                            Select the row for the worksheet from the files uploaded in the previous step to set the header row.
                        </p>
                    </div>

                    {/* Active Sheet Badge */}
                    <div className="border-l-4 border-l-[#FF7A00] pl-3 py-1">
                        <h3 className="font-bold text-sm text-slate-900">{selectedSheet || sheetNames[0] || 'Sheet1'}</h3>
                        <p className="text-xs text-slate-400">{fileName}</p>
                    </div>

                    {/* Interactive Spreadsheet Grid */}
                    <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
                        <div className="overflow-x-auto max-h-[420px]">
                            <table className="w-full text-xs border-collapse">
                                <thead className="bg-slate-50 sticky top-0 z-20 border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                                    <tr>
                                        <th className="w-14 px-3 py-2 text-center bg-slate-100 border-r border-slate-200 font-mono text-slate-400 sticky left-0 z-30">
                                            #
                                        </th>
                                        {Array.from({ length: gridMaxCols }, (_, i) => (
                                            <th key={`col-${i}`} className="px-4 py-2 text-left font-mono text-slate-500 border-r border-slate-100 min-w-[140px]">
                                                {colLetter(i)}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {rawSheetAoa.slice(0, 100).map((row, rowIdx) => {
                                        const isSelectedHeader = rowIdx === headerRowIndex;
                                        const isBeforeHeader = rowIdx < headerRowIndex;
                                        const rowCells = Array.isArray(row) ? row : [];

                                        return (
                                            <tr
                                                key={`raw-row-${rowIdx}`}
                                                onClick={() => {
                                                    setHeaderRowIndex(rowIdx);
                                                    parseSheetData(rawSheetAoa, rowIdx);
                                                }}
                                                className={cn(
                                                    'cursor-pointer transition-colors group',
                                                    isSelectedHeader
                                                        ? 'bg-amber-100/70 font-semibold text-slate-900 border-y-2 border-amber-400'
                                                        : isBeforeHeader
                                                        ? 'opacity-40 bg-slate-50/50 hover:opacity-80'
                                                        : 'hover:bg-amber-50/40 text-slate-700',
                                                )}
                                            >
                                                <td
                                                    className={cn(
                                                        'px-3 py-2 text-center font-mono border-r border-slate-200 sticky left-0 z-10 select-none text-[11px]',
                                                        isSelectedHeader
                                                            ? 'bg-amber-200 text-amber-900 font-bold'
                                                            : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100',
                                                    )}
                                                >
                                                    {rowIdx + 1}
                                                </td>

                                                {Array.from({ length: gridMaxCols }, (_, colIdx) => {
                                                    const cellVal = normaliseCell(rowCells[colIdx]);
                                                    return (
                                                        <td
                                                            key={`cell-${rowIdx}-${colIdx}`}
                                                            className="px-4 py-2 truncate max-w-[200px] border-r border-slate-100 font-sans"
                                                            title={cellVal}
                                                        >
                                                            {cellVal || <span className="text-slate-300 font-light select-none">-</span>}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Bottom Navigation */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setStep('sheet')}
                            className="h-9 px-4 text-xs font-medium rounded-lg text-slate-700"
                        >
                            <ChevronLeft className="h-4 w-4 mr-1 text-slate-500" /> Back
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => {
                                parseSheetData(rawSheetAoa, headerRowIndex);
                                setStep('mapping');
                            }}
                            className="h-9 px-6 text-xs font-semibold bg-[#FF7A00] hover:bg-[#EA6C00] text-white rounded-lg shadow-sm"
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}

            {/* STEP 4: MAP COLUMNS (Matching Tacto Screenshot 5) */}
            {step === 'mapping' && (
                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Map columns</h2>
                        <p className="text-xs text-slate-500 mt-1">
                            {mappingAnalysis.mappedCount} of {sourceColumns.length} columns mapped automatically
                        </p>
                    </div>

                    {/* Active Sheet Badge */}
                    <div className="border-l-4 border-l-[#FF7A00] pl-3 py-1">
                        <h3 className="font-bold text-sm text-slate-900">{selectedSheet || 'Sheet1'}</h3>
                        <p className="text-xs text-slate-400">{fileName}</p>
                    </div>

                    {/* Required Fields Warning */}
                    {!mappingAnalysis.isArticleNumberMapped && (
                        <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50/50 p-3 text-xs text-rose-800">
                            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                            <div>
                                <span className="font-semibold">Required Field Missing:</span> Article ID must be mapped to proceed.
                            </div>
                        </div>
                    )}

                    {/* Column Cards (Matching Tacto UI Layout) */}
                    <div className="space-y-3.5">
                        {sourceColumns.map((col) => {
                            const key = getColKey(col);
                            const target = mapping[key] || IGNORE_COLUMN;
                            const isMapped = target !== IGNORE_COLUMN && !mappingAnalysis.duplicateTargets.has(target as ArticleTargetFieldKey);
                            const isCollapsed = !!collapsedColumns[key];
                            const stats = getColumnValueStats(col.index);

                            const sampleCells = rawDataRows.slice(0, 3).map((r) => (Array.isArray(r) ? normaliseCell(r[col.index]) : ''));

                            return (
                                <div
                                    key={key}
                                    className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden transition-all hover:border-slate-300"
                                >
                                    {/* Top Row */}
                                    <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white border-b border-slate-100">
                                        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
                                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold font-mono text-slate-700">
                                                {col.letter}
                                            </span>
                                            <span className="text-xs font-bold text-slate-900 truncate max-w-[160px]" title={col.header}>
                                                {col.header}
                                            </span>
                                            <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />
                                            <select
                                                value={target}
                                                onChange={(e) =>
                                                    handleMappingChange(
                                                        col,
                                                        e.target.value as ArticleTargetFieldKey | typeof IGNORE_COLUMN,
                                                    )
                                                }
                                                className="h-9 min-w-[200px] max-w-[260px] rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 outline-none focus:border-[#FF7A00] shadow-xs"
                                            >
                                                <option value={IGNORE_COLUMN}>Select...</option>
                                                {ARTICLE_TARGET_FIELDS.map((field) => (
                                                    <option key={field.key} value={field.key}>
                                                        {field.label} {field.required ? ' (Required)' : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Status & Stats Section */}
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <div className="flex items-center justify-end gap-1.5 text-xs">
                                                    {isMapped ? (
                                                        <>
                                                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                                            <span className="font-semibold text-slate-800">
                                                                Mapped to {ARTICLE_TARGET_FIELDS.find((f) => f.key === target)?.label}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                                                            <span className="font-medium text-slate-700">
                                                                Automatic mapping not possible
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                                <div className="flex items-center justify-end gap-1 text-[11px] text-slate-400 mt-0.5">
                                                    <HelpCircle className="h-3 w-3 text-slate-400 shrink-0" />
                                                    <span>{stats.percent} % of rows have a value</span>
                                                </div>
                                            </div>

                                            {/* Collapse Toggle */}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setCollapsedColumns((prev) => ({
                                                        ...prev,
                                                        [key]: !prev[key],
                                                    }))
                                                }
                                                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                                title={isCollapsed ? 'Expand samples' : 'Collapse samples'}
                                            >
                                                {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Preview Sample Rows inside Card */}
                                    {!isCollapsed && (
                                        <div className="divide-y divide-slate-100 bg-slate-50/40 text-xs">
                                            {sampleCells.map((val, sampleIdx) => (
                                                <div key={`sample-${key}-${sampleIdx}`} className="flex items-center px-4 py-2">
                                                    <span className="w-8 font-mono text-[11px] text-slate-400 select-none">
                                                        {sampleIdx + 1}
                                                    </span>
                                                    <span
                                                        className={cn(
                                                            'font-sans truncate',
                                                            val ? 'text-slate-700 font-normal' : 'text-slate-400 italic',
                                                        )}
                                                    >
                                                        {val || 'Empty'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Step Navigation Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setStep('header')}
                            className="h-9 px-4 text-xs font-medium rounded-lg text-slate-700"
                        >
                            <ChevronLeft className="h-4 w-4 mr-1 text-slate-500" /> Back
                        </Button>
                        <Button
                            size="sm"
                            disabled={!mappingAnalysis.isValidToProceed || validating}
                            onClick={handleProceedToReview}
                            className="h-9 px-6 text-xs font-semibold bg-[#FF7A00] hover:bg-[#EA6C00] text-white rounded-lg shadow-sm disabled:opacity-50 disabled:pointer-events-none flex items-center gap-1.5"
                        >
                            {validating ? (
                                <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Preparing Review...
                                </>
                            ) : (
                                'Next'
                            )}
                        </Button>
                    </div>
                </div>
            )}

            {/* STEP 5: REVIEW ENTRIES */}
            {step === 'review' && (
                <div className="space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Review entries</h2>
                            <p className="text-xs text-slate-500 mt-1">
                                Review entries before importing into the system. You can edit cells directly or exclude rows.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 text-xs">
                            <span className="font-semibold text-emerald-700">
                                {validatedRows.filter((r) => r.errors.length === 0 && r.selected).length} ready to import
                            </span>
                            {validatedRows.filter((r) => r.errors.length > 0).length > 0 && (
                                <>
                                    <span className="text-slate-300">·</span>
                                    <span className="font-semibold text-rose-600">
                                        {validatedRows.filter((r) => r.errors.length > 0).length} errors
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Quick Selection Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 bg-slate-50/70 p-2.5 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="selectAllReviewArticles"
                                checked={
                                    validatedRows.length > 0 &&
                                    validatedRows.filter((r) => r.errors.length === 0).length > 0 &&
                                    validatedRows.filter((r) => r.errors.length === 0).every((r) => r.selected)
                                }
                                onCheckedChange={(c) =>
                                    setValidatedRows((prev) =>
                                        prev.map((p) => (p.errors.length === 0 ? { ...p, selected: !!c } : p)),
                                    )
                                }
                                className="h-4 w-4 rounded"
                            />
                            <label htmlFor="selectAllReviewArticles" className="cursor-pointer font-medium text-slate-700">
                                Select All Valid Rows
                            </label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setValidatedRows((prev) => prev.map((p) => ({ ...p, selected: p.errors.length === 0 })))}
                                className="h-7 text-xs text-slate-600 hover:text-slate-900"
                            >
                                Select valid only
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setValidatedRows((prev) => prev.map((p) => ({ ...p, selected: false })))}
                                className="h-7 text-xs text-slate-400 hover:text-slate-600"
                            >
                                Deselect all
                            </Button>
                        </div>
                    </div>

                    {/* Preview & Editable Table */}
                    <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-[380px] bg-white shadow-sm">
                        <table className="w-full text-xs">
                            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 sticky top-0 z-10 border-b border-slate-200">
                                <tr>
                                    <th className="px-3 py-2.5 w-10 text-center">
                                        <Checkbox
                                            checked={
                                                validatedRows.length > 0 &&
                                                validatedRows.filter((r) => r.errors.length === 0).length > 0 &&
                                                validatedRows.filter((r) => r.errors.length === 0).every((r) => r.selected)
                                            }
                                            onCheckedChange={(c) =>
                                                setValidatedRows((prev) =>
                                                    prev.map((p) => (p.errors.length === 0 ? { ...p, selected: !!c } : p)),
                                                )
                                            }
                                            className="h-4 w-4 rounded"
                                        />
                                    </th>
                                    <th className="px-3 py-2.5 text-left font-semibold">Article ID*</th>
                                    <th className="px-3 py-2.5 text-left font-semibold">Article Name</th>
                                    <th className="px-3 py-2.5 text-left font-semibold">Long text</th>
                                    <th className="px-3 py-2.5 text-left font-semibold">CN code</th>
                                    <th className="px-3 py-2.5 text-left font-semibold">Category</th>
                                    <th className="px-3 py-2.5 text-left font-semibold">Net weight</th>
                                    <th className="px-3 py-2.5 text-left font-semibold">Net weight unit</th>
                                    <th className="px-3 py-2.5 text-left font-semibold">Budget price</th>
                                    <th className="px-3 py-2.5 text-left font-semibold">Cost model</th>
                                    <th className="px-3 py-2.5 w-10" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {validatedRows.map((r, rIdx) => {
                                    const hasErr = r.errors.length > 0;
                                    const hasWarn = r.warnings.length > 0;

                                    return (
                                        <tr
                                            key={`review-article-row-${r.rowIndex}-${rIdx}`}
                                            className={cn(
                                                'transition-colors',
                                                hasErr
                                                    ? 'bg-rose-50/40 hover:bg-rose-50/60'
                                                    : hasWarn
                                                    ? 'bg-amber-50/20 hover:bg-amber-50/40'
                                                    : 'hover:bg-slate-50/60',
                                            )}
                                        >
                                            <td className="px-3 py-2 text-center">
                                                <Checkbox
                                                    checked={r.selected && !hasErr}
                                                    disabled={hasErr}
                                                    onCheckedChange={(c) =>
                                                        setValidatedRows((prev) =>
                                                            prev.map((p) =>
                                                                p.rowIndex === r.rowIndex ? { ...p, selected: !!c } : p,
                                                            ),
                                                        )
                                                    }
                                                    className="h-4 w-4 rounded"
                                                />
                                            </td>
                                            <td className="px-2 py-1 min-w-[140px]">
                                                <Input
                                                    value={r.cleaned.articleNumber ?? ''}
                                                    onChange={(e) => updateReviewCell(r.rowIndex, 'articleNumber', e.target.value)}
                                                    placeholder="10000100"
                                                    className={cn(
                                                        'h-7 text-xs rounded border-slate-200 bg-white font-mono',
                                                        !r.cleaned.articleNumber && 'border-rose-300 bg-rose-50/50',
                                                    )}
                                                />
                                            </td>
                                            <td className="px-2 py-1 min-w-[160px]">
                                                <Input
                                                    value={r.cleaned.description ?? ''}
                                                    onChange={(e) => updateReviewCell(r.rowIndex, 'description', e.target.value)}
                                                    placeholder="Article name"
                                                    className="h-7 text-xs rounded border-slate-200 bg-white"
                                                />
                                            </td>
                                            <td className="px-2 py-1 min-w-[160px]">
                                                <Input
                                                    value={r.cleaned.longText ?? ''}
                                                    onChange={(e) => updateReviewCell(r.rowIndex, 'longText', e.target.value)}
                                                    placeholder="Detailed description"
                                                    className="h-7 text-xs rounded border-slate-200 bg-white"
                                                />
                                            </td>
                                            <td className="px-2 py-1 min-w-[100px]">
                                                <Input
                                                    value={r.cleaned.cnCode ?? ''}
                                                    onChange={(e) => updateReviewCell(r.rowIndex, 'cnCode', e.target.value)}
                                                    placeholder="39173200"
                                                    className="h-7 text-xs rounded border-slate-200 bg-white font-mono"
                                                />
                                            </td>
                                            <td className="px-2 py-1 min-w-[140px]">
                                                <Input
                                                    value={r.cleaned.category ?? ''}
                                                    onChange={(e) => updateReviewCell(r.rowIndex, 'category', e.target.value)}
                                                    placeholder="Category"
                                                    className="h-7 text-xs rounded border-slate-200 bg-white"
                                                />
                                            </td>
                                            <td className="px-2 py-1 min-w-[90px]">
                                                <Input
                                                    type="number"
                                                    value={r.cleaned.netWeight != null ? String(r.cleaned.netWeight) : ''}
                                                    onChange={(e) => updateReviewCell(r.rowIndex, 'netWeight', e.target.value)}
                                                    placeholder="3.5"
                                                    className="h-7 text-xs rounded border-slate-200 bg-white"
                                                />
                                            </td>
                                            <td className="px-2 py-1 min-w-[80px]">
                                                <Input
                                                    value={r.cleaned.netWeightUnit ?? ''}
                                                    onChange={(e) => updateReviewCell(r.rowIndex, 'netWeightUnit', e.target.value)}
                                                    placeholder="G"
                                                    className="h-7 text-xs rounded border-slate-200 bg-white"
                                                />
                                            </td>
                                            <td className="px-2 py-1 min-w-[90px]">
                                                <Input
                                                    type="number"
                                                    value={r.cleaned.budgetPrice != null ? String(r.cleaned.budgetPrice) : ''}
                                                    onChange={(e) => updateReviewCell(r.rowIndex, 'budgetPrice', e.target.value)}
                                                    placeholder="1.25"
                                                    className="h-7 text-xs rounded border-slate-200 bg-white"
                                                />
                                            </td>
                                            <td className="px-2 py-1 min-w-[100px]">
                                                <Input
                                                    value={r.cleaned.costModel ?? ''}
                                                    onChange={(e) => updateReviewCell(r.rowIndex, 'costModel', e.target.value)}
                                                    placeholder="Standard"
                                                    className="h-7 text-xs rounded border-slate-200 bg-white"
                                                />
                                            </td>
                                            <td className="px-2 py-1 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => setValidatedRows((prev) => prev.filter((p) => p.rowIndex !== r.rowIndex))}
                                                    className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                                                    title="Delete row"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Success Message or Navigation */}
                    {committed ? (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800 flex items-center gap-2.5">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                            <span className="font-medium">Import completed successfully! Articles are saved to the database.</span>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 bg-white">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setStep('mapping')}
                                className="h-9 px-4 text-xs font-medium rounded-lg text-slate-700"
                            >
                                <ChevronLeft className="h-4 w-4 mr-1 text-slate-500" /> Back
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleCommit}
                                disabled={submitting || validatedRows.filter((r) => r.selected && r.errors.length === 0).length === 0}
                                className="h-9 px-6 text-xs font-semibold bg-[#FF7A00] hover:bg-[#EA6C00] text-white rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                                        Importing Articles...
                                    </>
                                ) : (
                                    <>
                                        Import {validatedRows.filter((r) => r.selected && r.errors.length === 0).length} Articles
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* Quick Preview Modal (Eye Symbol) */}
            <Dialog
                open={previewSheetModal.open}
                onOpenChange={(open) => setPreviewSheetModal((p) => ({ ...p, open }))}
            >
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col p-6 rounded-2xl bg-white shadow-xl">
                    <DialogHeader className="pb-3 border-b border-slate-100 text-left">
                        <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <FileSpreadsheet className="h-4 w-4 text-[#FF7A00]" />
                            Preview: {previewSheetModal.sheetName}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-500 font-normal">
                            First {Math.min(previewSheetModal.aoa.length, 30)} rows from &ldquo;{previewSheetModal.sheetName}&rdquo;
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-auto border border-slate-200 rounded-xl my-3 max-h-[400px]">
                        <table className="w-full text-xs border-collapse">
                            <tbody className="divide-y divide-slate-100">
                                {previewSheetModal.aoa.slice(0, 30).map((row, rowIdx) => (
                                    <tr key={`prev-row-${rowIdx}`} className={rowIdx === 0 ? 'bg-slate-50 font-semibold' : 'hover:bg-slate-50/50'}>
                                        <td className="w-10 px-2 py-1.5 text-center font-mono text-[10px] text-slate-400 bg-slate-100/60 border-r border-slate-200">
                                            {rowIdx + 1}
                                        </td>
                                        {Array.isArray(row) &&
                                            row.slice(0, 10).map((cell, cIdx) => (
                                                <td key={`prev-cell-${rowIdx}-${cIdx}`} className="px-3 py-1.5 border-r border-slate-100 truncate max-w-[180px]">
                                                    {normaliseCell(cell) || <span className="text-slate-300">-</span>}
                                                </td>
                                            ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPreviewSheetModal((p) => ({ ...p, open: false }))}
                            className="h-8 text-xs font-medium"
                        >
                            Close
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => {
                                setSelectedSheet(previewSheetModal.sheetName);
                                loadSheetAoa(previewSheetModal.sheetName);
                                setPreviewSheetModal((p) => ({ ...p, open: false }));
                                setStep('header');
                            }}
                            className="h-8 text-xs font-semibold bg-[#FF7A00] hover:bg-[#EA6C00] text-white"
                        >
                            Select this Sheet &amp; Continue
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
