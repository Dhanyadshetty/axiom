"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Upload,
    File as FileIcon,
    X,
    Download,
    Eye,
    MoreVertical,
    Ban,
    ShieldCheck,
    ScanLine,
    FileText,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { DocumentUploadData, FileUploadData } from "@/lib/assessment-templates/types";

interface DocumentUploadFieldProps {
    value: DocumentUploadData | null;
    onChange: (value: DocumentUploadData | null) => void;
    label: string;
    required?: boolean;
    help?: string;
    disabled?: boolean;
    helperText?: string;
}

function formatDateDisplay(dateStr?: string): string {
    if (!dateStr) return "";
    return dateStr;
}

export function DocumentUploadField({
    value,
    onChange,
    label,
    required,
    help,
    disabled,
    helperText,
}: DocumentUploadFieldProps) {
    const [sharedFiles, setSharedFiles] = React.useState<FileUploadData[]>([]);
    const [uploadModalOpen, setUploadModalOpen] = React.useState(false);
    const [naModalOpen, setNaModalOpen] = React.useState(false);
    const [menuOpen, setMenuOpen] = React.useState(false);
    const [dragActive, setDragActive] = React.useState(false);
    const [pendingFile, setPendingFile] = React.useState<FileUploadData | null>(null);
    const [validFrom, setValidFrom] = React.useState("");
    const [validUntil, setValidUntil] = React.useState("");
    const [naReason, setNaReason] = React.useState("");
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const hasFile = !!value?.file;
    const isNa = !!value?.notApplicable;

    function isExpired(dateStr: string): boolean {
        const parts = dateStr.split("/");
        if (parts.length !== 3) return false;
        const d = new Date(Number(parts[2]), Number(parts[0]) - 1, Number(parts[1]));
        return d.getTime() < Date.now();
    }

    const registerFile = (file: FileUploadData) => {
        setSharedFiles(prev => [...prev, file]);
    };

    const statusLine = React.useCallback(() => {
        if (isNa) return { text: "Not applicable", className: "text-slate-500" };
        if (hasFile && value?.validUntil) {
            const expired = isExpired(value.validUntil);
            if (expired) {
                return {
                    text: `File uploaded · Expired (${formatDateDisplay(value.validUntil)})`,
                    className: "text-rose-600 font-medium",
                };
            }
            return {
                text: `File uploaded · Valid until ${formatDateDisplay(value.validUntil)}`,
                className: "text-emerald-700",
            };
        }
        if (hasFile) {
            return { text: "File uploaded", className: "text-emerald-700" };
        }
        return null;
    }, [isNa, hasFile, value]);

    const handleFiles = (fileList: FileList | null) => {
        if (!fileList || fileList.length === 0) return;
        const file = fileList[0];
        const data: FileUploadData = {
            name: file.name,
            url: URL.createObjectURL(file),
            size: file.size,
            type: file.type,
        };
        setPendingFile(data);
        setValidFrom("");
        setValidUntil("");
        setUploadModalOpen(false);
        setNaModalOpen(false);
    };

    const handleUseSharedFile = (file: FileUploadData) => {
        setPendingFile(file);
        setValidFrom("");
        setValidUntil("");
        setUploadModalOpen(false);
        setNaModalOpen(false);
    };

    const submitDocument = () => {
        if (!pendingFile) return;
        registerFile(pendingFile);
        onChange({
            file: pendingFile,
            validFrom: validFrom || undefined,
            validUntil: validUntil || undefined,
            notApplicable: false,
            naReason: undefined,
        });
        setPendingFile(null);
    };

    const confirmNa = () => {
        if (!naReason.trim()) return;
        onChange({ file: null, notApplicable: true, naReason: naReason.trim(), validFrom: undefined, validUntil: undefined });
        setNaModalOpen(false);
        setNaReason("");
    };

    const removeFile = () => {
        onChange({ file: null, notApplicable: false, validFrom: undefined, validUntil: undefined });
    };

    const status = statusLine();

    return (
        <div className="space-y-1.5">
            <div className="flex items-start justify-between gap-3">
                <Label className="text-sm font-medium text-slate-800 flex items-center gap-1.5 pt-0.5">
                    {label}
                    {required && <span className="text-rose-500" aria-hidden="true">*</span>}
                </Label>
                <div className="relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-slate-500"
                        onClick={() => setMenuOpen((o) => !o)}
                        disabled={disabled}
                        aria-label="More options"
                    >
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                    {menuOpen && !disabled && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                            <div className="absolute right-0 z-20 mt-1 w-44 rounded-md border border-slate-200 bg-white shadow-lg py-1">
                                <button
                                    type="button"
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                    onClick={() => {
                                        setMenuOpen(false);
                                        setNaModalOpen(true);
                                    }}
                                >
                                    <Ban className="h-4 w-4 text-amber-600" />
                                    Not applicable
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Status line */}
            {status && (
                <p className={cn("text-sm flex items-center gap-1.5", status.className)}>
                    {isNa ? <Ban className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                    {status.text}
                </p>
            )}

            {/* Main action button */}
            {!hasFile && !isNa && (
                <div className="flex items-center gap-2 flex-wrap">
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => setUploadModalOpen(true)}
                        disabled={disabled}
                    >
                        <Upload className="h-4 w-4" />
                        Upload document
                    </Button>
                </div>
            )}

            {/* Document properties panel after upload (pending or saved) */}
            {hasFile && (
                <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-3">
                    <div className="flex items-center gap-3">
                        <FileIcon className="h-5 w-5 text-slate-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{value?.file?.name}</p>
                            <p className="text-xs text-slate-500">
                                {value?.file ? `${(value.file.size / 1024).toFixed(1)} KB` : ""}
                            </p>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" aria-label="Preview" disabled={disabled}>
                                <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" aria-label="Download" disabled={disabled}>
                                <Download className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={removeFile}
                                className="h-8 w-8 text-rose-500 hover:text-rose-600"
                                aria-label="Remove"
                                disabled={disabled}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs font-medium text-slate-600">Validity start (optional)</Label>
                            <Input
                                type="text"
                                placeholder="mm/dd/yyyy"
                                value={value?.validFrom ?? ""}
                                disabled={disabled}
                                onChange={(e) => onChange({ ...value!, validFrom: e.target.value })}
                                className="w-full"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-medium text-slate-600">
                                Expiration date <span className="text-rose-500">*</span>
                            </Label>
                            <Input
                                type="text"
                                placeholder="mm/dd/yyyy"
                                value={value?.validUntil ?? ""}
                                disabled={disabled}
                                onChange={(e) => onChange({ ...value!, validUntil: e.target.value })}
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Small scan/preview + View upload */}
            {hasFile && (
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" className="gap-1.5 text-slate-500 px-0" disabled={disabled}>
                        <ScanLine className="h-4 w-4" />
                        View upload
                    </Button>
                </div>
            )}

            {help && <p className="text-xs text-slate-500">{help}</p>}
            {helperText && !help && <p className="text-xs text-slate-500">{helperText}</p>}

            {/* Upload modal */}
            <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Requested Document: {label}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        {/* Option A: Use file */}
                        {sharedFiles.length > 0 && (
                            <div className="rounded-lg border border-slate-200 p-3 space-y-2">
                                <p className="text-sm font-medium text-slate-700">Use file</p>
                                {sharedFiles.map((f, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => handleUseSharedFile(f)}
                                        className="w-full flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-left text-sm hover:bg-slate-50"
                                    >
                                        <Download className="h-4 w-4 text-slate-400" />
                                        <span className="flex-1 truncate">{f.name}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Option B: upload zone */}
                        <div
                            onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                            onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                setDragActive(false);
                                handleFiles(e.dataTransfer.files);
                            }}
                            onClick={() => fileInputRef.current?.click()}
                            className={cn(
                                "rounded-lg border-2 border-dashed p-6 text-center transition-colors cursor-pointer",
                                dragActive ? "border-emerald-400 bg-emerald-50" : "border-slate-300 hover:border-emerald-400 hover:bg-slate-50"
                            )}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                onChange={(e) => handleFiles(e.target.files)}
                            />
                            <Upload className="mx-auto mb-2 h-8 w-8 text-slate-400" />
                            <p className="text-sm font-medium text-slate-700">Click to upload or drag and drop one file here</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setUploadModalOpen(false)}>Cancel</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Document properties modal (after picking a file) */}
            <Dialog open={!!pendingFile} onOpenChange={(o) => { if (!o) setPendingFile(null); }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Document properties</DialogTitle>
                    </DialogHeader>
                    {pendingFile && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
                                <FileIcon className="h-5 w-5 text-slate-400" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-900 truncate">{pendingFile.name}</p>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" aria-label="Preview">
                                    <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" aria-label="Download">
                                    <Download className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => setPendingFile(null)} className="h-8 w-8 text-slate-500" aria-label="Remove">
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-xs font-medium text-slate-600">Validity start (optional)</Label>
                                    <Input type="text" placeholder="mm/dd/yyyy" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs font-medium text-slate-600">
                                        Expiration date <span className="text-rose-500">*</span>
                                    </Label>
                                    <Input type="text" placeholder="mm/dd/yyyy" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPendingFile(null)}>Cancel</Button>
                        <Button onClick={submitDocument} disabled={!validUntil.trim()} className="bg-emerald-600 hover:bg-emerald-700">
                            Submit document
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Not applicable modal */}
            <Dialog open={naModalOpen} onOpenChange={setNaModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Mark document as not applicable</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700">
                            Reason <span className="text-rose-500">*</span>
                        </Label>
                        <textarea
                            className="w-full rounded-md border border-slate-300 p-2 text-sm"
                            rows={3}
                            value={naReason}
                            onChange={(e) => setNaReason(e.target.value)}
                            placeholder="Please provide a reason"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setNaModalOpen(false)}>Cancel</Button>
                        <Button onClick={confirmNa} disabled={!naReason.trim()} variant="destructive">Confirm</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}