"use client";

import * as React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Download,
    ExternalLink,
    FileText,
    Image as ImageIcon,
    Loader2,
    RotateCw,
    ZoomIn,
    ZoomOut,
    RefreshCcw,
    AlertCircle,
    FileQuestion,
    X,
} from "lucide-react";
import { renderAsync } from "docx-preview";

export type DocumentPreviewItem = {
    url: string;
    name?: string | null;
    type?: string | null;
    size?: number | null;
};

interface DocumentPreviewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    document: DocumentPreviewItem | null;
}

export type DetectedDocType = "pdf" | "image" | "docx" | "text" | "unknown";

export function detectDocumentType(item?: DocumentPreviewItem | null): DetectedDocType {
    if (!item) return "unknown";

    const { url = "", name = "", type = "" } = item;

    // 1. Check MIME type if present
    if (type) {
        const lowerType = type.toLowerCase();
        if (lowerType === "application/pdf") return "pdf";
        if (lowerType.startsWith("image/")) return "image";
        if (
            lowerType.includes("wordprocessingml") ||
            lowerType === "application/msword" ||
            lowerType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
            return "docx";
        }
        if (lowerType.startsWith("text/")) return "text";
    }

    // 2. Check name extension
    const cleanName = (name || "").split("?")[0].split("#")[0].toLowerCase();
    if (/\.(png|jpe?g|webp|gif|svg|bmp|ico)$/i.test(cleanName)) return "image";
    if (/\.pdf$/i.test(cleanName)) return "pdf";
    if (/\.docx?$/i.test(cleanName)) return "docx";
    if (/\.(txt|csv|log|json|md)$/i.test(cleanName)) return "text";

    // 3. Check URL path extension (handles cases where name is requirement title like "SEDEX/SMETA")
    try {
        const pathname = new URL(url, "http://localhost").pathname.toLowerCase();
        if (/\.(png|jpe?g|webp|gif|svg|bmp|ico)$/i.test(pathname)) return "image";
        if (/\.pdf$/i.test(pathname)) return "pdf";
        if (/\.docx?$/i.test(pathname)) return "docx";
        if (/\.(txt|csv|log|json|md)$/i.test(pathname)) return "text";
    } catch {
        const cleanUrl = url.split("?")[0].split("#")[0].toLowerCase();
        if (/\.(png|jpe?g|webp|gif|svg|bmp|ico)$/i.test(cleanUrl)) return "image";
        if (/\.pdf$/i.test(cleanUrl)) return "pdf";
        if (/\.docx?$/i.test(cleanUrl)) return "docx";
        if (/\.(txt|csv|log|json|md)$/i.test(cleanUrl)) return "text";
    }

    // 4. Check data URLs
    if (url.startsWith("data:image/")) return "image";
    if (url.startsWith("data:application/pdf")) return "pdf";

    return "unknown";
}

function formatBytes(bytes?: number | null): string {
    if (!bytes || bytes <= 0) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentPreviewModal({
    open,
    onOpenChange,
    document: docItem,
}: DocumentPreviewModalProps) {
    const [docType, setDocType] = React.useState<DetectedDocType>("unknown");
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [zoom, setZoom] = React.useState(100);
    const [rotation, setRotation] = React.useState(0);
    const docxContainerRef = React.useRef<HTMLDivElement>(null);

    const displayName = docItem?.name || docItem?.url.split("/").pop() || "Document";
    const sizeFormatted = formatBytes(docItem?.size);

    React.useEffect(() => {
        if (!open || !docItem) {
            setZoom(100);
            setRotation(0);
            setError(null);
            setLoading(false);
            return;
        }

        const detected = detectDocumentType(docItem);
        setDocType(detected);
        setZoom(100);
        setRotation(0);
        setError(null);

        // If docx, load and render via docx-preview
        if (detected === "docx" && docItem.url) {
            setLoading(true);
            let isCancelled = false;

            const renderDocx = async () => {
                try {
                    const response = await fetch(docItem.url);
                    if (!response.ok) {
                        throw new Error(`Failed to fetch document (${response.status})`);
                    }
                    const arrayBuffer = await response.arrayBuffer();
                    if (isCancelled) return;

                    if (docxContainerRef.current) {
                        docxContainerRef.current.innerHTML = "";
                        await renderAsync(arrayBuffer, docxContainerRef.current, undefined, {
                            inWrapper: true,
                            ignoreWidth: false,
                            className: "docx-preview-content",
                            breakPages: true,
                        });
                    }
                } catch (err) {
                    if (!isCancelled) {
                        console.error("DOCX preview render error:", err);
                        setError("Could not render DOCX preview in browser. Please use download.");
                    }
                } finally {
                    if (!isCancelled) {
                        setLoading(false);
                    }
                }
            };

            // Small delay to ensure DOM container ref is mounted
            const timer = setTimeout(() => {
                void renderDocx();
            }, 50);

            return () => {
                isCancelled = true;
                clearTimeout(timer);
            };
        }
    }, [open, docItem]);

    const handleDownload = () => {
        if (!docItem?.url) return;
        const anchor = document.createElement("a");
        anchor.href = docItem.url;
        anchor.download = displayName;
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
        window.document.body.appendChild(anchor);
        anchor.click();
        window.document.body.removeChild(anchor);
    };

    const handleOpenNewTab = () => {
        if (!docItem?.url) return;
        window.open(docItem.url, "_blank", "noopener,noreferrer");
    };

    const getBadge = () => {
        switch (docType) {
            case "pdf":
                return <Badge variant="outline" className="border-rose-200 bg-rose-50 text-rose-700">PDF</Badge>;
            case "image":
                return <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">IMAGE</Badge>;
            case "docx":
                return <Badge variant="outline" className="border-sky-200 bg-sky-50 text-sky-700">DOCX</Badge>;
            case "text":
                return <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">TEXT</Badge>;
            default:
                return <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600">FILE</Badge>;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex h-[90vh] max-w-5xl flex-col p-0 overflow-hidden sm:rounded-xl">
                {/* Header */}
                <DialogHeader className="flex flex-row items-center justify-between border-b border-slate-200 px-6 py-3.5 space-y-0 bg-white">
                    <div className="flex items-center gap-3 min-w-0 pr-4">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                            {docType === "image" ? (
                                <ImageIcon className="h-5 w-5 text-emerald-600" />
                            ) : (
                                <FileText className="h-5 w-5 text-sky-600" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <DialogTitle className="truncate text-base font-semibold text-slate-900">
                                    {displayName}
                                </DialogTitle>
                                {getBadge()}
                            </div>
                            {sizeFormatted && (
                                <p className="text-xs text-slate-500">{sizeFormatted}</p>
                            )}
                        </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center gap-1.5 shrink-0">
                        {(docType === "image" || docType === "docx") && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-slate-600"
                                    title="Zoom out"
                                    onClick={() => setZoom((z) => Math.max(40, z - 15))}
                                >
                                    <ZoomOut className="h-4 w-4" />
                                </Button>
                                <span className="w-11 text-center text-xs font-medium text-slate-500 select-none">
                                    {zoom}%
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-slate-600"
                                    title="Zoom in"
                                    onClick={() => setZoom((z) => Math.min(250, z + 15))}
                                >
                                    <ZoomIn className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-slate-600"
                                    title="Reset zoom"
                                    onClick={() => {
                                        setZoom(100);
                                        setRotation(0);
                                    }}
                                >
                                    <RefreshCcw className="h-3.5 w-3.5" />
                                </Button>
                                {docType === "image" && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-slate-600"
                                        title="Rotate 90°"
                                        onClick={() => setRotation((r) => (r + 90) % 360)}
                                    >
                                        <RotateCw className="h-4 w-4" />
                                    </Button>
                                )}
                                <div className="h-4 w-px bg-slate-200 mx-1" />
                            </>
                        )}

                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 text-xs text-slate-700"
                            onClick={handleOpenNewTab}
                            title="Open in new tab"
                        >
                            <ExternalLink className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">New tab</span>
                        </Button>

                        <Button
                            variant="default"
                            size="sm"
                            className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium"
                            onClick={handleDownload}
                        >
                            <Download className="h-3.5 w-3.5" />
                            <span>Download</span>
                        </Button>
                    </div>
                </DialogHeader>

                {/* Body Content */}
                <div className="relative flex-1 min-h-0 overflow-auto bg-slate-100/70 p-4 flex items-center justify-center">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center gap-3 p-8 text-center text-slate-600">
                            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                            <p className="text-sm font-medium">Preparing document preview...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center gap-3 p-8 text-center max-w-md">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                                <AlertCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-900">{error}</p>
                                <p className="mt-1 text-xs text-slate-500">
                                    You can download the file to view it in your desktop application.
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                className="mt-2 gap-2"
                                onClick={handleDownload}
                            >
                                <Download className="h-4 w-4" /> Download document
                            </Button>
                        </div>
                    ) : docType === "image" ? (
                        <div className="flex h-full w-full items-center justify-center overflow-auto p-4">
                            <img
                                src={docItem?.url}
                                alt={displayName}
                                className="max-h-[75vh] w-auto max-w-full rounded-lg object-contain shadow-sm transition-transform duration-200"
                                style={{
                                    transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                                    transformOrigin: "center center",
                                }}
                                onError={() => setError("Could not display image. The file may be corrupted or unavailable.")}
                            />
                        </div>
                    ) : docType === "pdf" ? (
                        <iframe
                            src={`${docItem?.url}#toolbar=1&navpanes=0`}
                            title={displayName}
                            className="h-full w-full rounded-lg border border-slate-200 bg-white shadow-sm"
                            onError={() => setError("Could not render PDF preview in browser. Please use download.")}
                        />
                    ) : docType === "docx" ? (
                        <div className="h-full w-full overflow-auto flex justify-center py-4">
                            <div
                                style={{
                                    transform: `scale(${zoom / 100})`,
                                    transformOrigin: "top center",
                                }}
                                className="transition-transform duration-150"
                            >
                                <div
                                    ref={docxContainerRef}
                                    className="docx-preview-container bg-white rounded-lg shadow-md p-4 min-w-[700px] border border-slate-200"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-3 p-8 text-center max-w-md">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-slate-600">
                                <FileQuestion className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-900">
                                    Preview is not available for this format ({displayName.split(".").pop()?.toUpperCase() || "file"}).
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                    Preview is supported for PDF, JPG, JPEG, PNG, and DOCX files. Use Download to open this file.
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                className="mt-2 gap-2"
                                onClick={handleDownload}
                            >
                                <Download className="h-4 w-4" /> Download file
                            </Button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <DialogFooter className="flex flex-row items-center justify-between border-t border-slate-200 bg-white px-6 py-3">
                    <span className="text-xs text-slate-500">
                        {displayName}
                    </span>
                    <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
