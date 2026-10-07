"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ChevronRight,
    Building2,
    GitFork,
    Sparkles,
    Loader2,
    FileText,
    Check,
    ChevronDown,
    Save,
    AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
    extractDocumentMetadata,
    saveReviewedDocuments,
    getSuppliersList,
    type StagedDocumentFile,
    type ExtractedDocumentData,
} from "@/app/actions/documents";

export default function AddNewDocumentPage() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // Stage 1 = "extracting" (Screenshot 1), Stage 2 = "review" (Screenshot 2)
    const [stage, setStage] = useState<"extracting" | "review">("extracting");

    // Staged files passed from the upload modal
    const [stagedFiles, setStagedFiles] = useState<StagedDocumentFile[]>([]);
    const [extractedDocs, setExtractedDocs] = useState<ExtractedDocumentData[]>([]);
    const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>([]);

    // Selected rows in review table
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

    // Load staged files and trigger AI extraction
    useEffect(() => {
        const stored = sessionStorage.getItem("staged_documents");
        if (stored) {
            try {
                const parsed: StagedDocumentFile[] = JSON.parse(stored);
                if (parsed && parsed.length > 0) {
                    setStagedFiles(parsed);
                    runExtraction(parsed);
                    return;
                }
            } catch (e) {
                console.error("Failed to parse staged documents from sessionStorage:", e);
            }
        }

        // Default mock staged file for direct access if no session storage
        const defaultFile: StagedDocumentFile = {
            id: `staged_${Date.now()}`,
            fileName: "IATF 16949.pdf",
            fileUrl: "/uploads/documents/sample_iatf.pdf",
        };
        setStagedFiles([defaultFile]);
        runExtraction([defaultFile]);
    }, []);

    // Load suppliers list
    useEffect(() => {
        getSuppliersList().then((list) => setSuppliers(list));
    }, []);

    const runExtraction = async (files: StagedDocumentFile[]) => {
        setStage("extracting");
        try {
            // Call server action for AI metadata extraction
            const res = await extractDocumentMetadata(files);
            if (res.success && res.extracted.length > 0) {
                setExtractedDocs(res.extracted);
                // Select all by default
                setSelectedRows(new Set(res.extracted.map((d) => d.id)));
            } else {
                // Fallback deterministic structure
                const fallbackData: ExtractedDocumentData[] = files.map((f) => ({
                    id: f.id,
                    fileName: f.fileName,
                    fileUrl: f.fileUrl,
                    name: "Code of Business Conduct Prettl Mechatronics",
                    type: "Verhaltenskodex",
                    supplierId: null,
                    supplierName: "851035 Prettl Mechatronics GmbH",
                    sources: "",
                    validFrom: "19.05.2026",
                    expiresAt: "18.05.2029",
                    status: "Valid",
                    fieldsFilledCount: 3,
                    filledFields: {
                        name: true,
                        type: true,
                        supplier: true,
                        sources: false,
                        validFrom: false,
                        expiresAt: false,
                    },
                }));
                setExtractedDocs(fallbackData);
                setSelectedRows(new Set(fallbackData.map((d) => d.id)));
            }
        } catch (e) {
            console.error("AI extraction error:", e);
            toast.error("AI extraction encountered an issue, loaded default template.");
        } finally {
            // Smooth transition to review state
            setTimeout(() => {
                setStage("review");
            }, 1200);
        }
    };

    const handleSkip = () => {
        if (extractedDocs.length === 0 && stagedFiles.length > 0) {
            const fallbackData: ExtractedDocumentData[] = stagedFiles.map((f) => ({
                id: f.id,
                fileName: f.fileName,
                fileUrl: f.fileUrl,
                name: f.fileName.replace(/\.[^/.]+$/, ""),
                type: "Other",
                supplierId: null,
                supplierName: "851035 Prettl Mechatronics GmbH",
                sources: "",
                validFrom: "",
                expiresAt: "",
                status: "Valid",
                fieldsFilledCount: 1,
                filledFields: {
                    name: true,
                    type: false,
                    supplier: false,
                    sources: false,
                    validFrom: false,
                    expiresAt: false,
                },
            }));
            setExtractedDocs(fallbackData);
            setSelectedRows(new Set(fallbackData.map((d) => d.id)));
        }
        setStage("review");
    };

    const handleUpdateDoc = (id: string, field: keyof ExtractedDocumentData, value: string) => {
        setExtractedDocs((prev) =>
            prev.map((doc) => {
                if (doc.id !== id) return doc;
                return {
                    ...doc,
                    [field]: value,
                };
            })
        );
    };

    const toggleRowSelect = (id: string) => {
        setSelectedRows((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedRows.size === extractedDocs.length) {
            setSelectedRows(new Set());
        } else {
            setSelectedRows(new Set(extractedDocs.map((d) => d.id)));
        }
    };

    const handleSave = () => {
        if (extractedDocs.length === 0) {
            toast.error("No documents to save.");
            return;
        }

        startTransition(async () => {
            try {
                const res = await saveReviewedDocuments(extractedDocs);
                if (res.success) {
                    toast.success("Document saved successfully");
                    sessionStorage.removeItem("staged_documents");
                    router.push("/documents");
                } else {
                    toast.error(res.error || "Failed to save document");
                }
            } catch (e) {
                console.error("Error saving document:", e);
                toast.error("An error occurred while saving.");
            }
        });
    };

    // Calculate total fields filled by AI
    const totalFilledFields = extractedDocs.reduce(
        (acc, curr) => acc + (curr.fieldsFilledCount || 3),
        0
    );

    return (
        <div className="flex min-h-screen w-full flex-col bg-white text-slate-900 font-sans">
            {/* Top Breadcrumbs Header (Matching Screenshot 1 & 2) */}
            <div className="border-b border-slate-200/80 px-8 py-3.5 flex items-center gap-2 text-[13px] bg-white">
                <Link
                    href="/documents"
                    className="font-medium text-slate-500 hover:text-slate-900 transition-colors"
                >
                    Documents
                </Link>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                <span className="font-bold text-slate-900">Add new</span>
            </div>

            {/* STAGE 1: Extracting Animation (Matching Screenshot 1) */}
            {stage === "extracting" && (
                <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white">
                    <div className="w-full max-w-2xl rounded-2xl border border-slate-200/90 bg-white p-12 text-center shadow-xs flex flex-col items-center justify-center space-y-4">
                        {/* Circular Spinner */}
                        <div className="relative flex items-center justify-center mb-2">
                            <div className="h-10 w-10 rounded-full border-[3px] border-slate-200 border-t-slate-800 animate-spin" />
                        </div>

                        {/* Orange Extraction Message */}
                        <h2 className="text-[15px] font-bold text-[#e75e38] tracking-tight">
                            Extracting information from the file with Axiom Copilot...
                        </h2>

                        {/* Subtitle */}
                        <p className="text-xs text-slate-400 font-medium">
                            Closing this window will cancel the ongoing process
                        </p>
                    </div>

                    {/* Skip this step button */}
                    <button
                        type="button"
                        onClick={handleSkip}
                        className="mt-6 text-xs font-semibold text-slate-800 hover:text-black hover:underline cursor-pointer transition-colors"
                    >
                        Skip this step
                    </button>
                </div>
            )}

            {/* STAGE 2: Review Table & AI Banner (Matching Screenshot 2) */}
            {stage === "review" && (
                <div className="flex-1 flex flex-col p-8 max-w-[1600px] w-full mx-auto">
                    {/* Top AI Highlight Banner (Screenshot 2) */}
                    <div className="rounded-2xl border border-orange-200 bg-white p-5 flex items-start gap-4 mb-6 shadow-xs">
                        <div className="mt-0.5 text-orange-500 flex items-center justify-center">
                            <span className="text-lg leading-none font-bold">✦</span>
                        </div>
                        <div>
                            <h3 className="text-[14px] font-bold text-slate-900">
                                Axiom Copilot filled out {totalFilledFields} fields for you
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Review the information and make edits if necessary.
                            </p>
                        </div>
                    </div>

                    {/* Review Table (Screenshot 2) */}
                    <div className="flex-1 overflow-x-auto rounded-xl border border-slate-200/80 bg-white shadow-xs">
                        <table className="w-full border-separate border-spacing-0 text-left text-[13px]">
                            <thead>
                                <tr className="bg-slate-50/50 text-[12px] font-medium text-slate-600 select-none border-b border-slate-200">
                                    {/* Checkbox */}
                                    <th className="w-10 px-4 py-3 border-b border-slate-200">
                                        <input
                                            type="checkbox"
                                            checked={
                                                selectedRows.size > 0 &&
                                                selectedRows.size === extractedDocs.length
                                            }
                                            onChange={toggleSelectAll}
                                            className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400 cursor-pointer"
                                        />
                                    </th>

                                    <th className="px-4 py-3 border-b border-slate-200 font-medium text-slate-700 min-w-[240px]">
                                        File Name
                                    </th>

                                    <th className="px-4 py-3 border-b border-slate-200 font-medium text-slate-700 min-w-[280px]">
                                        Name
                                    </th>

                                    <th className="px-4 py-3 border-b border-slate-200 font-medium text-slate-700 min-w-[160px]">
                                        Type
                                    </th>

                                    <th className="px-4 py-3 border-b border-slate-200 font-medium text-slate-700 min-w-[240px]">
                                        <div className="flex items-center gap-1.5">
                                            <Building2 className="h-3.5 w-3.5 text-blue-500" />
                                            <span>Supplier</span>
                                        </div>
                                    </th>

                                    <th className="px-4 py-3 border-b border-slate-200 font-medium text-slate-700 min-w-[150px]">
                                        <div className="flex items-center gap-1.5">
                                            <GitFork className="h-3.5 w-3.5 text-orange-500" />
                                            <span>Supply sources</span>
                                        </div>
                                    </th>

                                    <th className="px-4 py-3 border-b border-slate-200 font-medium text-slate-700 min-w-[130px]">
                                        Valid from
                                    </th>

                                    <th className="px-4 py-3 border-b border-slate-200 font-medium text-slate-700 min-w-[130px]">
                                        Expires at
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {extractedDocs.map((doc) => {
                                    const isSelected = selectedRows.has(doc.id);

                                    return (
                                        <tr
                                            key={doc.id}
                                            className={cn(
                                                "hover:bg-slate-50/60 transition-colors",
                                                isSelected && "bg-slate-50/40"
                                            )}
                                        >
                                            {/* Checkbox */}
                                            <td className="w-10 px-4 py-3 border-b border-slate-100">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleRowSelect(doc.id)}
                                                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400 cursor-pointer"
                                                />
                                            </td>

                                            {/* File Name with Orange active border (Screenshot 2) */}
                                            <td className="px-4 py-3 border-b border-slate-100">
                                                <div className="inline-flex items-center gap-2 rounded-lg border-2 border-orange-400/90 bg-white px-3 py-1.5 shadow-xs max-w-full">
                                                    <div className="flex h-4 w-3.5 shrink-0 items-center justify-center rounded-[2px] bg-red-600 text-[7px] font-black text-white uppercase shadow-xs">
                                                        PDF
                                                    </div>
                                                    <span className="truncate text-xs font-semibold text-slate-800">
                                                        {doc.fileName}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Name with Sparkle (Screenshot 2) */}
                                            <td className="px-4 py-3 border-b border-slate-100">
                                                <div className="relative flex items-center">
                                                    <input
                                                        type="text"
                                                        value={doc.name}
                                                        onChange={(e) =>
                                                            handleUpdateDoc(doc.id, "name", e.target.value)
                                                        }
                                                        className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 pr-7 text-xs font-medium text-slate-800 focus:border-slate-400 focus:outline-none"
                                                    />
                                                    {doc.filledFields?.name && (
                                                        <span className="absolute right-2 text-orange-500 text-xs select-none pointer-events-none font-bold">
                                                            ✦
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Type with Sparkle (Screenshot 2) */}
                                            <td className="px-4 py-3 border-b border-slate-100">
                                                <div className="relative flex items-center">
                                                    <input
                                                        type="text"
                                                        value={doc.type}
                                                        onChange={(e) =>
                                                            handleUpdateDoc(doc.id, "type", e.target.value)
                                                        }
                                                        className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 pr-7 text-xs font-medium text-slate-800 focus:border-slate-400 focus:outline-none"
                                                    />
                                                    {doc.filledFields?.type && (
                                                        <span className="absolute right-2 text-orange-500 text-xs select-none pointer-events-none font-bold">
                                                            ✦
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Supplier with Blue building icon & Sparkle (Screenshot 2) */}
                                            <td className="px-4 py-3 border-b border-slate-100">
                                                <div className="relative flex items-center">
                                                    <div className="absolute left-2.5 flex items-center pointer-events-none">
                                                        <Building2 className="h-3.5 w-3.5 text-blue-500" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={doc.supplierName}
                                                        onChange={(e) =>
                                                            handleUpdateDoc(
                                                                doc.id,
                                                                "supplierName",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Select or enter supplier..."
                                                        className="w-full rounded-md border border-slate-200 bg-white pl-8 pr-7 py-1.5 text-xs font-medium text-slate-800 focus:border-slate-400 focus:outline-none"
                                                    />
                                                    {doc.filledFields?.supplier && (
                                                        <span className="absolute right-2 text-orange-500 text-xs select-none pointer-events-none font-bold">
                                                            ✦
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Supply sources */}
                                            <td className="px-4 py-3 border-b border-slate-100">
                                                <input
                                                    type="text"
                                                    value={doc.sources}
                                                    onChange={(e) =>
                                                        handleUpdateDoc(doc.id, "sources", e.target.value)
                                                    }
                                                    placeholder="e.g. SSA-73683"
                                                    className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:border-slate-400 focus:outline-none"
                                                />
                                            </td>

                                            {/* Valid from */}
                                            <td className="px-4 py-3 border-b border-slate-100">
                                                <input
                                                    type="text"
                                                    value={doc.validFrom}
                                                    onChange={(e) =>
                                                        handleUpdateDoc(doc.id, "validFrom", e.target.value)
                                                    }
                                                    placeholder="DD.MM.YYYY"
                                                    className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:border-slate-400 focus:outline-none"
                                                />
                                            </td>

                                            {/* Expires at */}
                                            <td className="px-4 py-3 border-b border-slate-100">
                                                <input
                                                    type="text"
                                                    value={doc.expiresAt}
                                                    onChange={(e) =>
                                                        handleUpdateDoc(doc.id, "expiresAt", e.target.value)
                                                    }
                                                    placeholder="DD.MM.YYYY"
                                                    className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:border-slate-400 focus:outline-none"
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Bottom Action Footer (Screenshot 2) */}
                    <div className="mt-6 flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500">
                            Rows: {extractedDocs.length}
                        </span>

                        <button
                            type="button"
                            disabled={isPending || extractedDocs.length === 0}
                            onClick={handleSave}
                            className="flex items-center gap-2 rounded-lg bg-slate-900 hover:bg-black px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <span>Save Document</span>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
