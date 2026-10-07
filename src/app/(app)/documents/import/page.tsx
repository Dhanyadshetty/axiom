"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ChevronRight,
    FileSpreadsheet,
    FileText,
    Upload,
    Check,
    AlertCircle,
    ArrowLeft,
    Download,
    FileCode2,
    Database,
    Trash2,
} from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { importDocumentsMetadata, ImportMetadataRow } from "@/app/actions/documents";
import { cn } from "@/lib/utils";

type Step = "upload" | "sheets" | "mapping" | "review";

const REQUIRED_TARGET_FIELDS = [
    { key: "name", label: "Name *", required: true },
    { key: "type", label: "Type", required: false },
    { key: "supplierName", label: "Supplier", required: false },
    { key: "sources", label: "Sources", required: false },
    { key: "validFrom", label: "Valid from", required: false },
    { key: "expiresAt", label: "Expires at", required: false },
    { key: "status", label: "Status", required: false },
    { key: "createdByName", label: "Created by", required: false },
    { key: "createdVia", label: "Created via", required: false },
];

export default function ImportMetadataPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [currentStep, setCurrentStep] = useState<Step>("upload");
    const [fileName, setFileName] = useState<string>("");
    const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
    const [sheets, setSheets] = useState<string[]>([]);
    const [selectedSheet, setSelectedSheet] = useState<string>("");
    const [rawRows, setRawRows] = useState<Record<string, any>[]>([]);
    const [sourceHeaders, setSourceHeaders] = useState<string[]>([]);
    const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
    const [parsedEntries, setParsedEntries] = useState<ImportMetadataRow[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Template Download Handler
    const downloadTemplate = (format: "xlsx" | "csv") => {
        const sampleData = [
            {
                Name: "ISO 9001 Certificate.pdf",
                Type: "ISO 9001",
                Supplier: "Grohe Technology GmbH",
                Sources: "SSA-63800",
                "Valid from": "19.05.2026",
                "Expires at": "18.05.2029",
                Status: "Valid",
                "Created by": "Carmelo Ginosa",
            },
            {
                Name: "Code-of-Conduct_2026.pdf",
                Type: "Code of Conduct",
                Supplier: "Schlosser GmbH",
                Sources: "SSA-55463",
                "Valid from": "01.01.2026",
                "Expires at": "31.12.2030",
                Status: "Valid",
                "Created by": "Marco Roscic",
            },
        ];

        const ws = XLSX.utils.json_to_sheet(sampleData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Document Metadata");

        if (format === "xlsx") {
            XLSX.writeFile(wb, "Document_Metadata_Template.xlsx");
        } else {
            XLSX.writeFile(wb, "Document_Metadata_Template.csv", { bookType: "csv" });
        }
        toast.success(`Template downloaded as ${format.toUpperCase()}`);
    };

    // Process file
    const processFile = (file: File) => {
        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const wb = XLSX.read(data, { type: "array" });
                setWorkbook(wb);
                setSheets(wb.SheetNames);

                if (wb.SheetNames.length === 1) {
                    // Single sheet -> auto select and move to mapping
                    const sheet = wb.SheetNames[0];
                    setSelectedSheet(sheet);
                    parseSheetData(wb, sheet);
                    setCurrentStep("mapping");
                } else {
                    // Multi sheet -> choose sheet
                    setSelectedSheet(wb.SheetNames[0]);
                    setCurrentStep("sheets");
                }
            } catch (err) {
                console.error(err);
                toast.error("Failed to read file. Please ensure it is a valid spreadsheet.");
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const parseSheetData = (wb: XLSX.WorkBook, sheetName: string) => {
        const ws = wb.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: "" });
        if (json.length === 0) {
            toast.error("Selected sheet has no rows.");
            return;
        }

        const headers = Object.keys(json[0]);
        setSourceHeaders(headers);
        setRawRows(json);

        // Auto-match headers
        const initialMapping: Record<string, string> = {};
        REQUIRED_TARGET_FIELDS.forEach((target) => {
            const found = headers.find(
                (h) =>
                    h.toLowerCase().replace(/[^a-z]/g, "") ===
                    target.key.toLowerCase().replace(/[^a-z]/g, "") ||
                    h.toLowerCase().includes(target.label.toLowerCase().replace(/[^a-z]/g, ""))
            );
            if (found) {
                initialMapping[target.key] = found;
            }
        });
        setFieldMapping(initialMapping);
    };

    const handleSelectSheetAndContinue = () => {
        if (!workbook || !selectedSheet) return;
        parseSheetData(workbook, selectedSheet);
        setCurrentStep("mapping");
    };

    const handleConfirmMapping = () => {
        if (!fieldMapping.name) {
            toast.error("Please map the 'Name' column (required).");
            return;
        }

        const entries: ImportMetadataRow[] = rawRows.map((row) => ({
            name: String(row[fieldMapping.name] || "").trim(),
            type: fieldMapping.type ? String(row[fieldMapping.type] || "Other").trim() : "Other",
            supplierName: fieldMapping.supplierName ? String(row[fieldMapping.supplierName] || "").trim() : undefined,
            sources: fieldMapping.sources ? String(row[fieldMapping.sources] || "").trim() : undefined,
            validFrom: fieldMapping.validFrom ? String(row[fieldMapping.validFrom] || "").trim() : undefined,
            expiresAt: fieldMapping.expiresAt ? String(row[fieldMapping.expiresAt] || "").trim() : undefined,
            status: fieldMapping.status ? String(row[fieldMapping.status] || "Valid").trim() : "Valid",
            createdByName: fieldMapping.createdByName ? String(row[fieldMapping.createdByName] || "").trim() : undefined,
            createdVia: fieldMapping.createdVia ? String(row[fieldMapping.createdVia] || "Import").trim() : "Metadata Import",
        })).filter((e) => e.name.length > 0);

        if (entries.length === 0) {
            toast.error("No valid entries found with a Name value.");
            return;
        }

        setParsedEntries(entries);
        setCurrentStep("review");
    };

    const handleFinalImport = async () => {
        setIsSubmitting(true);
        try {
            const res = await importDocumentsMetadata(parsedEntries);
            if (res.success) {
                toast.success(`Successfully imported ${res.count} documents.`);
                router.push("/documents");
            } else {
                toast.error(res.error || "Import failed.");
            }
        } catch (e) {
            console.error(e);
            toast.error("An error occurred during import.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full flex-col bg-white text-slate-900">
            {/* Top Breadcrumb Header */}
            <div className="border-b border-slate-200/80 px-6 py-3.5">
                <div className="flex items-center gap-2 text-sm">
                    <Link
                        href="/documents"
                        className="font-medium text-slate-500 hover:text-slate-900 transition-colors"
                    >
                        Documents
                    </Link>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-semibold text-slate-900">Import Metadata</span>
                </div>
            </div>

            <div className="flex-1 px-6 py-6 max-w-5xl w-full mx-auto">
                {/* Stepper Navigation */}
                <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <span className={cn(currentStep === "upload" && "text-slate-900 font-bold")}>
                            Upload
                        </span>
                        <ChevronRight className="h-3 w-3 text-slate-300" />
                        <span className={cn(currentStep === "sheets" && "text-slate-900 font-bold")}>
                            Sheet selection
                        </span>
                        <ChevronRight className="h-3 w-3 text-slate-300" />
                        <span className={cn(currentStep === "mapping" && "text-slate-900 font-bold")}>
                            Column mapping
                        </span>
                        <ChevronRight className="h-3 w-3 text-slate-300" />
                        <span className={cn(currentStep === "review" && "text-slate-900 font-bold")}>
                            Review entries
                        </span>
                    </div>

                    {/* Template download buttons */}
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => downloadTemplate("xlsx")}
                            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
                        >
                            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Excel Template (.xlsx)</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => downloadTemplate("csv")}
                            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
                        >
                            <FileText className="h-3.5 w-3.5 text-blue-600" />
                            <span>CSV Template</span>
                        </button>
                    </div>
                </div>

                {/* Step 1: Upload */}
                {currentStep === "upload" && (
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-10 shadow-sm">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold tracking-tight text-slate-900">
                                Upload
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Drag and drop your file here or browse to upload your file.
                            </p>
                        </div>

                        {/* Drag and drop target container matching Screenshot 5 */}
                        <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                if (e.dataTransfer.files?.[0]) {
                                    processFile(e.dataTransfer.files[0]);
                                }
                            }}
                            className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-16 px-6 text-center"
                        >
                            {/* Orange File Type Badges */}
                            <div className="mb-6 flex items-center justify-center gap-4">
                                <div className="flex h-16 w-14 flex-col items-center justify-center rounded-lg border border-orange-200 bg-white shadow-sm">
                                    <span className="rounded bg-orange-500 px-1.5 py-0.5 text-[9px] font-black text-white uppercase tracking-wider">
                                        XLS(X)
                                    </span>
                                </div>
                                <div className="flex h-16 w-14 flex-col items-center justify-center rounded-lg border border-orange-200 bg-white shadow-sm">
                                    <span className="rounded bg-orange-500 px-1.5 py-0.5 text-[9px] font-black text-white uppercase tracking-wider">
                                        CSV
                                    </span>
                                </div>
                                <div className="flex h-16 w-14 flex-col items-center justify-center rounded-lg border border-orange-200 bg-white shadow-sm">
                                    <span className="rounded bg-orange-500 px-1.5 py-0.5 text-[9px] font-black text-white uppercase tracking-wider">
                                        TSV
                                    </span>
                                </div>
                            </div>

                            <p className="text-base font-medium text-slate-700">
                                Drop file here
                            </p>

                            {/* Divider with 'or' */}
                            <div className="my-6 flex w-64 items-center justify-center gap-3">
                                <div className="h-px flex-1 bg-slate-200" />
                                <span className="text-xs font-medium text-slate-400">or</span>
                                <div className="h-px flex-1 bg-slate-200" />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".xlsx,.xls,.csv,.tsv"
                                    className="hidden"
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) {
                                            processFile(e.target.files[0]);
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="rounded-xl bg-orange-500 hover:bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white shadow transition-all cursor-pointer"
                                >
                                    Select file
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setRawRows([
                                            { Name: "New Document.pdf", Type: "ISO 9001", Supplier: "PRETTL", Status: "Valid" },
                                        ]);
                                        setSourceHeaders(["Name", "Type", "Supplier", "Status"]);
                                        setFieldMapping({ name: "Name", type: "Type", supplierName: "Supplier", status: "Status" });
                                        setCurrentStep("mapping");
                                    }}
                                    className="rounded-xl bg-orange-100 hover:bg-orange-200/80 px-6 py-2.5 text-sm font-semibold text-orange-800 transition-all cursor-pointer"
                                >
                                    Manual entry
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Sheet Selection */}
                {currentStep === "sheets" && (
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 mb-2">
                            Select Sheet from {fileName}
                        </h2>
                        <p className="text-sm text-slate-500 mb-6">
                            Choose the sheet containing document metadata.
                        </p>

                        <div className="space-y-2 mb-8 max-w-md">
                            {sheets.map((sheet) => (
                                <button
                                    key={sheet}
                                    type="button"
                                    onClick={() => setSelectedSheet(sheet)}
                                    className={cn(
                                        "w-full flex items-center justify-between p-3 rounded-xl border text-sm font-medium transition-all text-left",
                                        selectedSheet === sheet
                                            ? "border-orange-500 bg-orange-50/50 text-orange-900 font-semibold"
                                            : "border-slate-200 hover:bg-slate-50 text-slate-700"
                                    )}
                                >
                                    <span>{sheet}</span>
                                    {selectedSheet === sheet && <Check className="h-4 w-4 text-orange-600" />}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setCurrentStep("upload")}
                                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg border border-slate-200"
                            >
                                Back
                            </button>
                            <button
                                type="button"
                                onClick={handleSelectSheetAndContinue}
                                className="px-5 py-2 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg shadow"
                            >
                                Continue to Mapping
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Column Mapping */}
                {currentStep === "mapping" && (
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm">
                        <div className="mb-6">
                            <h2 className="text-lg font-bold text-slate-900">
                                Map Columns
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">
                                Match columns from your uploaded file to Axiom document fields.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            {REQUIRED_TARGET_FIELDS.map((field) => (
                                <div
                                    key={field.key}
                                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col gap-1.5"
                                >
                                    <label className="text-xs font-bold text-slate-700">
                                        {field.label}
                                    </label>
                                    <select
                                        value={fieldMapping[field.key] || ""}
                                        onChange={(e) =>
                                            setFieldMapping((prev) => ({
                                                ...prev,
                                                [field.key]: e.target.value,
                                            }))
                                        }
                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 focus:border-orange-500 focus:outline-none"
                                    >
                                        <option value="">-- Do not import --</option>
                                        {sourceHeaders.map((header) => (
                                            <option key={header} value={header}>
                                                {header}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setCurrentStep("upload")}
                                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg border border-slate-200"
                            >
                                Back
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmMapping}
                                className="px-5 py-2 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg shadow"
                            >
                                Review Entries ({rawRows.length} rows)
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4: Review entries */}
                {currentStep === "review" && (
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    Review Entries
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">
                                    Verify the mapped document metadata before saving to database ({parsedEntries.length} ready).
                                </p>
                            </div>
                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={handleFinalImport}
                                className="rounded-xl bg-orange-500 hover:bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white shadow disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
                            >
                                <Database className="h-4 w-4" />
                                <span>{isSubmitting ? "Importing..." : `Import ${parsedEntries.length} Documents`}</span>
                            </button>
                        </div>

                        <div className="overflow-x-auto max-h-96 rounded-xl border border-slate-200 mb-6">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                                        <th className="p-2.5">Name</th>
                                        <th className="p-2.5">Type</th>
                                        <th className="p-2.5">Supplier</th>
                                        <th className="p-2.5">Sources</th>
                                        <th className="p-2.5">Valid from</th>
                                        <th className="p-2.5">Expires at</th>
                                        <th className="p-2.5">Status</th>
                                        <th className="p-2.5">Created by</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {parsedEntries.slice(0, 50).map((row, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50">
                                            <td className="p-2.5 font-semibold text-slate-900">{row.name}</td>
                                            <td className="p-2.5 text-slate-600">{row.type || "Other"}</td>
                                            <td className="p-2.5 text-slate-600">{row.supplierName || "—"}</td>
                                            <td className="p-2.5 text-slate-600">{row.sources || "—"}</td>
                                            <td className="p-2.5 text-slate-600">{row.validFrom || "—"}</td>
                                            <td className="p-2.5 text-slate-600">{row.expiresAt || "—"}</td>
                                            <td className="p-2.5">
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded-full text-[10px] font-bold",
                                                    row.status === "Expired" ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                                                )}>
                                                    {row.status || "Valid"}
                                                </span>
                                            </td>
                                            <td className="p-2.5 text-slate-600">{row.createdByName || "—"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {parsedEntries.length > 50 && (
                            <p className="text-xs text-slate-400 mb-6 text-center">
                                Showing preview of first 50 of {parsedEntries.length} total entries.
                            </p>
                        )}

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setCurrentStep("mapping")}
                                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg border border-slate-200"
                            >
                                Back to Mapping
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
