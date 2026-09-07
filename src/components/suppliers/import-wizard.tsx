"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import {
    Loader,
    Upload,
    X,
    Download,
    FileSpreadsheet,
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    AlertTriangle,
    ArrowRight,
} from "lucide-react";
import { importClassificationSuppliers, type ClassificationImportRow } from "@/app/actions/suppliers";
import { COUNTRIES } from "@/lib/utils/countryFlags";

// ---------------------------------------------------------------------------
// Schema definition (the 11 target columns, in canonical order)
// ---------------------------------------------------------------------------

const SCHEMA_FIELDS = [
    "Supplier",
    "Country",
    "Order Volume 2025",
    "Order Volume 2024",
    "ABC Classification Order",
    "Supplier Status",
    "Supplier Type",
    "Area of Need",
    "Commodity Group",
    "Responsible Buyer",
    "Strategic Classification (Prettl Pyramid)",
] as const;

type SchemaField = (typeof SCHEMA_FIELDS)[number];

// Bilingual alias list (English + German). German-market supplier tool.
const ALIASES: Record<SchemaField, string[]> = {
    Supplier: ["supplier", "suppliers", "lieferant", "lieferanten", "company", "company name", "firma", "unternehmen", "name"],
    Country: ["country", "countries", "land", "herkunftsland", "nation"],
    "Order Volume 2025": ["order volume 2025", "order volume 25", "bestellvolumen 2025", "volumen 2025", "purchase volume 2025", "beschaffungsvolumen 2025"],
    "Order Volume 2024": ["order volume 2024", "order volume 24", "bestellvolumen 2024", "volumen 2024", "purchase volume 2024", "beschaffungsvolumen 2024"],
    "ABC Classification Order": ["abc classification order", "abc order", "abc klassifikation", "abc klassifizierung bestellung", "abc bestellung"],
    "Supplier Status": ["supplier status", "status", "lieferantenstatus", "zustand"],
    "Supplier Type": ["supplier type", "type", "lieferantentyp", "art"],
    "Area of Need": ["area of need", "areas of need", "bedarfsbereich", "bedarfsbereiche", "bedarf"],
    "Commodity Group": ["commodity group", "commodity groups", "warengruppe", "warengruppen", "produktgruppe"],
    "Responsible Buyer": ["responsible buyer", "buyer", "einkäufer", "verantwortlicher einkäufer", "ansprechpartner einkauf"],
    "Strategic Classification (Prettl Pyramid)": [
        "strategic classification",
        "strategic classification (prettl pyramid)",
        "prettl pyramid",
        "pyramid",
        "strategische einstufung",
        "strategische klassifikation",
        "strategische klassifizierung",
    ],
};

// ---------------------------------------------------------------------------
// Placeholder / empty-value handling
// ---------------------------------------------------------------------------

const EMPTY_TOKENS = new Set(["none", "nan", "null", "n/a", "na", "-", ""]);

function isEmptyValue(value: unknown): boolean {
    if (value === null || value === undefined) return true;
    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        return EMPTY_TOKENS.has(normalized);
    }
    if (typeof value === "number") return Number.isNaN(value);
    if (Array.isArray(value)) return value.length === 0;
    return false;
}

function displayValue(value: unknown): string {
    if (isEmptyValue(value)) return "";
    if (Array.isArray(value)) return value.join(", ");
    return String(value);
}

// ---------------------------------------------------------------------------
// Template
// ---------------------------------------------------------------------------

const TEMPLATE_SAMPLE: string[][] = [
    [
        "Acme Components GmbH",
        "Germany",
        "1250000",
        "1100000",
        "A",
        "active",
        "Manufacturer",
        "Production, Logistics",
        "Electronics, Fasteners",
        "j.smith",
        "Strategic",
    ],
    [
        "Nordic Plastics AS",
        "Norway",
        "540000",
        "600000",
        "B",
        "prospect",
        "Distributor",
        "Packaging",
        "Plastics",
        "a.khan",
        "Preferred",
    ],
];

function downloadTemplate() {
    const ws = XLSX.utils.aoa_to_sheet([SCHEMA_FIELDS as unknown as string[], ...TEMPLATE_SAMPLE]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Supplier Import");
    XLSX.writeFile(wb, "supplier-import-template.xlsx");
}

// ---------------------------------------------------------------------------
// Column-letter helper (A, B, ..., Z, AA, ...)
// ---------------------------------------------------------------------------

function colLetter(index: number): string {
    let s = "";
    let n = index;
    while (n >= 0) {
        s = String.fromCharCode((n % 26) + 65) + s;
        n = Math.floor(n / 26) - 1;
    }
    return s;
}

// ---------------------------------------------------------------------------
// Normalization helpers
// ---------------------------------------------------------------------------

function normalizeStatus(value: unknown): string {
    const v = String(value ?? "").trim().toLowerCase();
    const mapping: Record<string, string> = {
        active: "active",
        inactive: "inactive",
        prospect: "prospect",
        blocked: "blocked",
    };
    return mapping[v] ?? "active";
}

// ---------------------------------------------------------------------------
// Column mapping engine
// ---------------------------------------------------------------------------

function normalizeHeader(header: string): string {
    return header
        .trim()
        .toLowerCase()
        .replace(/[\s_\-./()]+/g, " ")
        .replace(/[^\p{L}\p{N} ]/gu, "")
        .replace(/\s+/g, " ")
        .trim();
}

interface SourceColumn {
    index: number;
    letter: string;
    header: string;
    samples: string[];
    hasData: boolean;
}

type ColumnMapping = Record<string, SchemaField | "__ignore__">; // keyed by header+index

function autoMapColumns(sourceColumns: SourceColumn[]): ColumnMapping {
    const mapping: ColumnMapping = {};
    const claimed = new Set<SchemaField>();

    // Pass 1: exact match (case/punctuation-insensitive)
    for (const col of sourceColumns) {
        const norm = normalizeHeader(col.header);
        const exact = (SCHEMA_FIELDS as readonly string[]).find(
            (field) => normalizeHeader(field) === norm,
        );
        if (exact && !claimed.has(exact as SchemaField)) {
            mapping[colKey(col)] = exact as SchemaField;
            claimed.add(exact as SchemaField);
        }
    }

    // Pass 2: bilingual alias match
    for (const col of sourceColumns) {
        if (mapping[colKey(col)]) continue;
        const norm = normalizeHeader(col.header);
        let matched: SchemaField | null = null;
        for (const field of SCHEMA_FIELDS) {
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

    // Pass 3: fuzzy substring match, only when exactly one schema field is plausible
    for (const col of sourceColumns) {
        if (mapping[colKey(col)]) continue;
        const norm = normalizeHeader(col.header);
        if (!norm) continue;
        const candidates = (SCHEMA_FIELDS as readonly SchemaField[]).filter((field) => {
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

function colKey(col: SourceColumn): string {
    return `${col.index}:${col.header}`;
}

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

interface ParsedRow {
    rowIndex: number;
    values: Record<SchemaField, string>;
    raw: Record<SchemaField, unknown>;
    errors: Record<SchemaField, string[]>;
    hasError: boolean;
}

function findCountryCode(countryName: string): string | null {
    if (!countryName) return null;
    const normalized = countryName.trim().toLowerCase();
    if (/^[a-z]{2}$/.test(normalized)) {
        const match = COUNTRIES.find((c) => c.code.toLowerCase() === normalized);
        return match ? match.code : null;
    }
    const exact = COUNTRIES.find((c) => c.name.toLowerCase() === normalized);
    if (exact) return exact.code;
    const fuzzy = COUNTRIES.find(
        (c) => c.name.toLowerCase().includes(normalized) || normalized.includes(c.name.toLowerCase()),
    );
    return fuzzy ? fuzzy.code : null;
}

function parseRows(
    data: unknown[][],
    sourceColumns: SourceColumn[],
    mapping: ColumnMapping,
): ParsedRow[] {
    const rows: ParsedRow[] = [];
    let rowNumber = 0;

    for (const rawRow of data) {
        rowNumber += 1;
        // Skip fully empty rows
        if (!rawRow || rawRow.every((cell) => isEmptyValue(cell))) continue;

        const values = {} as Record<SchemaField, string>;
        const raw = {} as Record<SchemaField, unknown>;
        (SCHEMA_FIELDS as readonly SchemaField[]).forEach((field) => {
            values[field] = "";
            raw[field] = "";
        });

        // Map source columns to schema fields
        for (const col of sourceColumns) {
            const target = mapping[colKey(col)];
            if (!target || target === "__ignore__") continue;
            const cellValue = rawRow[col.index];
            raw[target] = cellValue;
            values[target] = displayValue(cellValue);
        }

        const errors = {} as Record<SchemaField, string[]>;
        (SCHEMA_FIELDS as readonly SchemaField[]).forEach((field) => {
            errors[field] = [];
        });

        // Validation
        if (isEmptyValue(values.Supplier)) {
            errors.Supplier.push("Supplier is required");
        }
        if (isEmptyValue(values.Country)) {
            errors.Country.push("Country is required");
        } else {
            const code = findCountryCode(values.Country);
            if (!code) {
                errors.Country.push(`"${values.Country}" is not a recognized country`);
            }
        }
        if (!isEmptyValue(values["ABC Classification Order"])) {
            const abc = values["ABC Classification Order"].trim().toUpperCase();
            if (!["A", "B", "C"].includes(abc)) {
                errors["ABC Classification Order"].push("Must be A, B, or C");
            }
        }

        const hasError = (SCHEMA_FIELDS as readonly SchemaField[]).some(
            (field) => errors[field].length > 0,
        );

        rows.push({ rowIndex: rowNumber, values, raw, errors, hasError });
    }

    return rows;
}

// ---------------------------------------------------------------------------
// Wizard component
// ---------------------------------------------------------------------------

export function ImportWizard() {
    const router = useRouter();
    const [step, setStep] = React.useState<1 | 2 | 3 | 4>(1);
    const [parsing, setParsing] = React.useState(false);
    const [importing, setImporting] = React.useState(false);

    const [fileName, setFileName] = React.useState("");
    const [sheetNames, setSheetNames] = React.useState<string[]>([]);
    const [selectedSheet, setSelectedSheet] = React.useState<string>("");
    const [workbookBuffer, setWorkbookBuffer] = React.useState<ArrayBuffer | null>(null);
    const [sourceColumns, setSourceColumns] = React.useState<SourceColumn[]>([]);
    const [rawData, setRawData] = React.useState<unknown[][]>([]);
    const [mapping, setMapping] = React.useState<ColumnMapping>({});
    const [notice, setNotice] = React.useState<string | null>(null);
    const [rows, setRows] = React.useState<ParsedRow[]>([]);
    const [showErrorsOnly, setShowErrorsOnly] = React.useState(false);
    const [result, setResult] = React.useState<{ created: number; skipped: number } | null>(null);

    const supplierMapped = React.useMemo(
        () =>
            sourceColumns.some((col) => mapping[colKey(col)] === "Supplier") ||
            // Before columns are parsed, fall back to any mapping value
            Object.values(mapping).includes("Supplier"),
        [sourceColumns, mapping],
    );

    const countryMapped = React.useMemo(
        () =>
            sourceColumns.some((col) => mapping[colKey(col)] === "Country") ||
            Object.values(mapping).includes("Country"),
        [sourceColumns, mapping],
    );

    const reviewEnabled = supplierMapped && countryMapped;

    const parseSheet = (workbook: XLSX.WorkBook, sheetName: string) => {
        const sheet = workbook.Sheets[sheetName];
        const sheetData = XLSX.utils.sheet_to_json(sheet, {
            header: 1,
            defval: "",
            blankrows: false,
        }) as unknown[][];

        // Find header row: first row that has at least one cell matching a schema field/alias
        let headerIndex = sheetData.findIndex((row) =>
            (row as unknown[]).some((cell) => {
                const norm = normalizeHeader(String(cell ?? ""));
                return (SCHEMA_FIELDS as readonly string[]).some(
                    (field) => normalizeHeader(field) === norm,
                );
            }),
        );
        if (headerIndex < 0) headerIndex = 0;

        const headerRow = (sheetData[headerIndex] as unknown[]) ?? [];
        const dataRows = sheetData.slice(headerIndex + 1);

        const cols: SourceColumn[] = [];
        headerRow.forEach((cell, index) => {
            const header = String(cell ?? "").trim();
            if (!header) return; // skip unnamed columns
            // Collect up to 3 sample values from data rows
            const samples: string[] = [];
            for (const r of dataRows) {
                const val = displayValue((r as unknown[])[index]);
                if (val && !samples.includes(val)) samples.push(val);
                if (samples.length >= 3) break;
            }
            const hasData = dataRows.some((r) => {
                const v = (r as unknown[])[index];
                return !isEmptyValue(v);
            });
            cols.push({ index, letter: colLetter(index), header, samples, hasData });
        });

        setSourceColumns(cols);
        setRawData(dataRows);
        setMapping(autoMapColumns(cols));
        setNotice(null);
    };

    const parseWorkbook = async (file: File) => {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheets = workbook.SheetNames;
        setSheetNames(sheets);
        setWorkbookBuffer(buffer);

        // Pick sheet with the most non-empty data rows
        let bestSheet = sheets[0];
        let bestRows = -1;
        for (const name of sheets) {
            const sheet = workbook.Sheets[name];
            const sheetData = XLSX.utils.sheet_to_json(sheet, {
                header: 1,
                defval: "",
                blankrows: false,
            }) as unknown[][];
            const nonEmpty = sheetData.filter(
                (r) => r && r.some((cell) => !isEmptyValue(cell)),
            ).length;
            if (nonEmpty > bestRows) {
                bestRows = nonEmpty;
                bestSheet = name;
            }
        }
        setSelectedSheet(bestSheet);
        parseSheet(workbook, bestSheet);
        setFileName(file.name);
    };

    const handleFile = async (file: File) => {
        setParsing(true);
        try {
            await parseWorkbook(file);
            toast.success(`Parsed "${file.name}". Review the column mapping below.`);
        } catch (error) {
            console.error(error);
            toast.error("Could not parse the file. Use .xlsx, .xls, .csv, or .tsv format.");
        } finally {
            setParsing(false);
        }
    };

    const handleDrop = (event: React.DragEvent) => {
        event.preventDefault();
        const file = event.dataTransfer.files?.[0];
        if (file) void handleFile(file);
    };

    const changeSheet = (name: string) => {
        if (!workbookBuffer) return;
        setSelectedSheet(name);
        const workbook = XLSX.read(workbookBuffer, { type: "array" });
        parseSheet(workbook, name);
    };

    const handleMappingChange = (col: SourceColumn, target: SchemaField | "__ignore__" | "") => {
        setMapping((prev) => {
            const next = { ...prev };
            const key = colKey(col);

            if (target === "" || target === "__ignore__") {
                if (target === "__ignore__") next[key] = "__ignore__";
                else delete next[key];
                setNotice(null);
                return next;
            }

            // If another column already maps to this field, clear it (guarantee 1:1)
            const prevOwner = sourceColumns.find(
                (c) => c.index !== col.index && next[colKey(c)] === target,
            );
            if (prevOwner) {
                delete next[colKey(prevOwner)];
                setNotice(
                    `“${target}” was already mapped to column ${prevOwner.letter} (“${prevOwner.header}”). That mapping was cleared so each field is claimed by only one column.`,
                );
            } else {
                setNotice(null);
            }
            next[key] = target;
            return next;
        });
    };

    const goToReview = () => {
        const parsed = parseRows(rawData, sourceColumns, mapping);
        setRows(parsed);
        setShowErrorsOnly(false);
        setStep(2);
    };

    const errorCount = rows.filter((r) => r.hasError).length;
    const importableCount = rows.filter((r) => !r.hasError).length;

    const handleImport = async () => {
        setImporting(true);
        try {
            const payload: ClassificationImportRow[] = rows.map((r) => {
                const countryCode = findCountryCode(r.values.Country);
                const importErrors = (SCHEMA_FIELDS as readonly SchemaField[]).flatMap(
                    (field) => r.errors[field] ?? [],
                );
                return {
                    name: r.values.Supplier,
                    countryCode: countryCode || r.values.Country,
                    status: normalizeStatus(r.values["Supplier Status"]) as
                        | "active"
                        | "inactive"
                        | "blacklisted"
                        | null,
                    supplierType: r.values["Supplier Type"] || null,
                    areaOfNeed: r.values["Area of Need"]
                        ? r.values["Area of Need"].split(/[;,|]/).map((s) => s.trim()).filter(Boolean)
                        : [],
                    commodityGroup: r.values["Commodity Group"]
                        ? r.values["Commodity Group"].split(/[;,|]/).map((s) => s.trim()).filter(Boolean)
                        : [],
                    responsibleBuyer: r.values["Responsible Buyer"]
                        ? r.values["Responsible Buyer"].split(/[;,|]/).map((s) => s.trim()).filter(Boolean)
                        : [],
                    strategicClassification:
                        r.values["Strategic Classification (Prettl Pyramid)"].trim() || null,
                    importErrors,
                };
            });

            const res = await importClassificationSuppliers(payload);
            setImporting(false);
            if (res.created > 0 || res.success) {
                const flagged = res.errors.length;
                toast.success(
                    `Imported ${res.created} supplier${res.created !== 1 ? "s" : ""}${
                        flagged > 0 ? ` (${flagged} imported with flags — see Classification grid)` : ""
                    }.`,
                );
                router.push("/suppliers");
            } else {
                toast.error(res.error || "Import failed.");
            }
        } catch (error) {
            setImporting(false);
            console.error("Import error:", error);
            toast.error("Import failed.");
        }
    };

    const resetAll = () => {
        setStep(1);
        setFileName("");
        setSheetNames([]);
        setSelectedSheet("");
        setWorkbookBuffer(null);
        setSourceColumns([]);
        setRawData([]);
        setMapping({});
        setNotice(null);
        setRows([]);
        setResult(null);
    };

    // -----------------------------------------------------------------------
    // Step indicator + back navigation
    // -----------------------------------------------------------------------

    const renderHeader = () => (
        <div className="mb-6">
            <nav className="flex items-center gap-1.5 text-sm text-slate-400">
                <Link href="/suppliers" className="hover:text-slate-700">
                    Suppliers
                </Link>
                <span>/</span>
                <span className="font-semibold text-slate-800">Supplier Import</span>
            </nav>
        </div>
    );

    const renderSteps = () => (
        <div className="mb-6 flex items-center gap-2 overflow-x-auto text-sm">
            {[
                { num: 1, label: "Upload" },
                { num: 2, label: "Sheet selection" },
                { num: 3, label: "Map columns" },
                { num: 4, label: "Review entries" },
            ].map((s, idx) => {
                const active = step === s.num || (step === 1 && s.num === 1) || (step === 2 && s.num === 4);
                const done = step > s.num;
                return (
                    <React.Fragment key={s.num}>
                        {idx > 0 ? <span className="h-px w-10 bg-slate-200" /> : null}
                        <div className="flex items-center gap-2">
                            <div
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                                    active
                                        ? "bg-primary text-white"
                                        : done
                                          ? "bg-emerald-100 text-emerald-700"
                                          : "bg-slate-200 text-slate-500"
                                }`}
                            >
                                {s.num}
                            </div>
                            <span
                                className={`whitespace-nowrap ${
                                    active ? "font-semibold text-slate-900" : "text-slate-400"
                                }`}
                            >
                                {s.label}
                            </span>
                        </div>
                    </React.Fragment>
                );
            })}
        </div>
    );

    // -----------------------------------------------------------------------
    // STEP 1
    // -----------------------------------------------------------------------

    const renderStep1 = () => (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black tracking-tight text-slate-950">
                        Upload &amp; map columns
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Upload an .xlsx, .xls, .csv, or .tsv file. We&apos;ll auto-map your columns to the
                        supplier template.
                    </p>
                </div>
                <Button variant="outline" className="gap-2" onClick={downloadTemplate}>
                    <Download className="h-4 w-4" /> Download Excel template
                </Button>
            </div>

            {!fileName ? (
                <label
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className="flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-10 text-center transition-colors hover:border-primary hover:bg-primary/5"
                >
                    <Upload className="h-10 w-10 text-slate-400" />
                    <div>
                        <p className="text-sm font-semibold text-slate-700">
                            Drop a file here, or click to browse
                        </p>
                        <p className="text-xs text-slate-500">.xlsx, .xls, .csv, .tsv</p>
                    </div>
                    <span className="inline-flex h-8 cursor-pointer items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground">
                        Choose file
                    </span>
                    <input
                        type="file"
                        accept=".xlsx,.xls,.csv,.tsv"
                        className="hidden"
                        onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) void handleFile(file);
                        }}
                    />
                </label>
            ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                            <span className="font-medium text-slate-800">{fileName}</span>
                            <button
                                type="button"
                                onClick={resetAll}
                                className="ml-2 text-slate-400 hover:text-rose-600"
                                aria-label="Remove file"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        {sheetNames.length > 1 && (
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-slate-500">Sheet:</span>
                                <select
                                    className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm"
                                    value={selectedSheet}
                                    onChange={(e) => changeSheet(e.target.value)}
                                >
                                    {sheetNames.map((name) => (
                                        <option key={name} value={name}>
                                            {name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                            Column mapping
                        </p>
                        {sourceColumns.map((col) => {
                            const target = mapping[colKey(col)];
                            const unmappedWithData = !target && col.hasData;
                            return (
                                <div
                                    key={colKey(col)}
                                    className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
                                        unmappedWithData
                                            ? "border-orange-200 bg-orange-50"
                                            : "border-slate-200 bg-white"
                                    }`}
                                >
                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-bold text-slate-600">
                                        {col.letter}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-slate-800">
                                            {col.header}
                                        </p>
                                        <p className="truncate text-xs text-slate-400">
                                            {col.samples.length
                                                ? col.samples.map((s) => (s.length > 24 ? s.slice(0, 24) + "…" : s)).join("  ·  ")
                                                : "no sample values"}
                                        </p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-300" />
                                    <select
                                        className="h-9 w-60 rounded-md border border-slate-300 bg-white px-2 text-sm"
                                        value={target && target !== "__ignore__" ? target : ""}
                                        onChange={(e) =>
                                            handleMappingChange(
                                                col,
                                                (e.target.value || "") as SchemaField | "__ignore__" | "",
                                            )
                                        }
                                    >
                                        <option value="">Don&apos;t import</option>
                                        {(SCHEMA_FIELDS as readonly SchemaField[]).map((field) => (
                                            <option key={field} value={field}>
                                                {field}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            );
                        })}
                    </div>

                    {notice && (
                        <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                            <span>{notice}</span>
                        </div>
                    )}

                    <div className="mt-5 flex items-center justify-between">
                        <Link href="/suppliers">
                            <Button variant="ghost">Cancel</Button>
                        </Link>
                        <Button
                            className="gap-2"
                            onClick={goToReview}
                            disabled={!reviewEnabled || parsing}
                        >
                            {parsing ? (
                                <Loader className="h-4 w-4 animate-spin" />
                            ) : (
                                <ChevronRight className="h-4 w-4" />
                            )}
                            Review entries
                        </Button>
                    </div>
                    {!reviewEnabled && (
                        <p className="mt-2 text-right text-xs text-slate-400">
                            Map at least the <strong>Supplier</strong> and <strong>Country</strong> columns to
                            continue.
                        </p>
                    )}
                </div>
            )}
        </div>
    );

    // -----------------------------------------------------------------------
    // STEP 2
    // -----------------------------------------------------------------------

    const visibleRows = showErrorsOnly ? rows.filter((r) => r.hasError) : rows;

    const renderStep2 = () => (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black tracking-tight text-slate-950">Review &amp; import</h2>
                    <p className="mt-1 text-sm text-slate-500">
                        {rows.length} row{rows.length !== 1 ? "s" : ""} parsed · {importableCount} ready ·{" "}
                        {errorCount} with errors
                        {errorCount > 0 ? " (error rows will be imported with flags for correction)" : ""}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setShowErrorsOnly(false)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                            !showErrorsOnly
                                ? "border-slate-900 bg-slate-900 text-white"
                                : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                        All rows ({rows.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowErrorsOnly(true)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                            showErrorsOnly
                                ? "border-rose-600 bg-rose-600 text-white"
                                : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                        Error rows ({errorCount})
                    </button>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="max-h-[460px] overflow-auto">
                    <table className="w-full border-collapse text-sm">
                        <thead className="sticky top-0 z-10 bg-slate-50">
                            <tr className="border-b border-slate-200">
                                {(SCHEMA_FIELDS as readonly SchemaField[]).map((field) => (
                                    <th
                                        key={field}
                                        className="px-3 py-2 text-left text-[11px] font-black uppercase tracking-wide text-slate-500"
                                    >
                                        {field}
                                    </th>
                                ))}
                                <th className="px-3 py-2 text-left text-[11px] font-black uppercase tracking-wide text-slate-500">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleRows.map((row) => (
                                <tr
                                    key={row.rowIndex}
                                    className={`border-b last:border-0 ${
                                        row.hasError ? "bg-rose-50/40" : "hover:bg-slate-50"
                                    }`}
                                >
                                    {(SCHEMA_FIELDS as readonly SchemaField[]).map((field) => {
                                        const hasError = row.errors[field]?.length > 0;
                                        return (
                                            <td
                                                key={field}
                                                className={`px-3 py-2 align-top text-slate-700 ${
                                                    hasError ? "bg-rose-100/60 text-rose-700" : ""
                                                }`}
                                                title={hasError ? row.errors[field].join("; ") : undefined}
                                            >
                                                {displayValue(row.raw[field]) || (
                                                    <span className="text-slate-300">—</span>
                                                )}
                                            </td>
                                        );
                                    })}
                                    <td className="px-3 py-2">
                                        {row.hasError ? (
                                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600">
                                                <X className="h-3.5 w-3.5" /> Error
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                                                <CheckCircle2 className="h-3.5 w-3.5" /> Valid
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {visibleRows.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={SCHEMA_FIELDS.length + 1}
                                        className="px-6 py-10 text-center text-slate-500"
                                    >
                                        No rows to show.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => setStep(1)}
                    disabled={importing}
                >
                    <ChevronLeft className="h-4 w-4" /> Back
                </Button>
                <Button
                    className="gap-2"
                    onClick={handleImport}
                    disabled={importing || rows.length === 0}
                >
                    {importing ? (
                        <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                        <CheckCircle2 className="h-4 w-4" />
                    )}
                    Import {rows.length} supplier{rows.length !== 1 ? "s" : ""}
                    {errorCount > 0 ? ` (${errorCount} flagged)` : ""}
                </Button>
            </div>
        </div>
    );

    // -----------------------------------------------------------------------
    // RESULT
    // -----------------------------------------------------------------------

    if (result) {
        return (
            <div className="mx-auto max-w-2xl">
                {renderHeader()}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        <h2 className="text-xl font-black tracking-tight text-slate-950">Import complete</h2>
                    </div>
                    <p className="text-sm text-slate-500">
                        Imported {result.created} supplier{result.created !== 1 ? "s" : ""}
                        {result.skipped > 0 ? `, ${result.skipped} skipped due to errors` : ""}.
                    </p>
                    <div className="mt-6 flex gap-2">
                        <Button variant="outline" onClick={resetAll}>
                            Import another file
                        </Button>
                        <Link href="/suppliers">
                            <Button>Back to Suppliers</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative mx-auto max-w-4xl">
            {renderHeader()}
            {renderSteps()}
            {step === 1 ? renderStep1() : renderStep2()}
            <BlurOverlay
                show={parsing}
                title="Extracting data from your file…"
                subtitle={fileName ? `Parsing ${fileName}` : undefined}
            />
            <BlurOverlay
                show={importing}
                title="Importing suppliers…"
                subtitle="Writing rows to the database"
            />
        </div>
    );
}

function BlurOverlay({
    show,
    title,
    subtitle,
}: {
    show: boolean;
    title: string;
    subtitle?: string;
}) {
    if (!show) return null;
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-md"
            role="status"
            aria-live="polite"
            aria-busy="true"
        >
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-2xl">
                <div className="flex items-center gap-3">
                    <Loader className="h-6 w-6 animate-spin text-primary" />
                    <div>
                        <p className="text-sm font-bold text-slate-900">{title}</p>
                        {subtitle ? (
                            <p className="text-xs text-slate-500">{subtitle}</p>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}
