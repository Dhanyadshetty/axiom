"use client";

import React, { useState, useEffect, useTransition, useMemo, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
    ChevronRight,
    ChevronLeft,
    ChevronsRight,
    ChevronsLeft,
    ChevronDown,
    FileText,
    Calendar,
    User,
    Building2,
    GitFork,
    Edit2,
    Plus,
    Minus,
    Search,
    Maximize2,
    RotateCw,
    SlidersHorizontal,
    MoreHorizontal,
    Check,
    Loader2,
    ArrowLeft,
    Sparkles,
    Trash2,
    Archive,
    ExternalLink,
    X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
    getDocumentById,
    updateDocumentDetails,
    getSuppliersList,
    DocumentRecord,
    DocumentCreatorProfile,
} from "@/app/actions/documents";
import { parseDateToMidnight } from "@/lib/utils/document-filters";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

const DOCUMENT_TYPES = [
    "Verhaltenskodex (Code of Conduct)",
    "ISO 9001",
    "ISO 14001",
    "ISO 50001",
    "ISO 45001",
    "ISO 13485",
    "IATF 16949",
    "Contract",
    "Invoice",
    "Safety Data Sheet",
    "Other",
];

const STATUS_OPTIONS = [
    { label: "Valid", value: "Valid", color: "bg-emerald-500", text: "text-emerald-700" },
    { label: "Pending approval", value: "Pending approval", color: "bg-amber-500", text: "text-amber-700" },
    { label: "Expired", value: "Expired", color: "bg-rose-500", text: "text-rose-700" },
    { label: "Rejected", value: "Rejected", color: "bg-rose-500", text: "text-rose-700" },
    { label: "Not Valid", value: "Not Valid", color: "bg-rose-500", text: "text-rose-700" },
    { label: "Non-existent", value: "Non-existent", color: "bg-slate-400", text: "text-slate-600" },
];

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const SHORT_MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function TactoCalendarPicker({
    value,
    onChange,
    onClose,
}: {
    value: string;
    onChange: (dateStr: string) => void;
    onClose?: () => void;
}) {
    const parsedDate = useMemo(() => parseDateToMidnight(value), [value]);
    const today = useMemo(() => new Date(), []);

    const [viewYear, setViewYear] = useState<number>(() => {
        return parsedDate ? parsedDate.getFullYear() : today.getFullYear();
    });
    const [viewMonth, setViewMonth] = useState<number>(() => {
        return parsedDate ? parsedDate.getMonth() : today.getMonth();
    });
    const [selectorMode, setSelectorMode] = useState<"calendar" | "month" | "year">("calendar");

    useEffect(() => {
        if (parsedDate) {
            setViewYear(parsedDate.getFullYear());
            setViewMonth(parsedDate.getMonth());
        }
    }, [parsedDate]);

    const handlePrevYear = () => {
        setViewYear(y => y - 1);
    };

    const handleNextYear = () => {
        setViewYear(y => y + 1);
    };

    const handlePrevMonth = () => {
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear(y => y - 1);
        } else {
            setViewMonth(m => m - 1);
        }
    };

    const handleNextMonth = () => {
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear(y => y + 1);
        } else {
            setViewMonth(m => m + 1);
        }
    };

    const handleCurrentMonth = () => {
        const now = new Date();
        setViewYear(now.getFullYear());
        setViewMonth(now.getMonth());
        setSelectorMode("calendar");
    };

    // Generate days grid (Monday start matching Tacto screenshot)
    const calendarGrid = useMemo(() => {
        const days = [];
        const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
        let startDay = firstDayOfMonth.getDay();
        startDay = startDay === 0 ? 6 : startDay - 1; // 0=Mon, ..., 6=Sun

        const prevMonthLastDate = new Date(viewYear, viewMonth, 0).getDate();
        for (let i = startDay - 1; i >= 0; i--) {
            const d = prevMonthLastDate - i;
            const m = viewMonth === 0 ? 11 : viewMonth - 1;
            const y = viewMonth === 0 ? viewYear - 1 : viewYear;
            days.push({
                day: d,
                month: m,
                year: y,
                isCurrentMonth: false,
                dateStr: `${String(d).padStart(2, "0")}/${String(m + 1).padStart(2, "0")}/${y}`,
            });
        }

        const lastDate = new Date(viewYear, viewMonth + 1, 0).getDate();
        for (let d = 1; d <= lastDate; d++) {
            days.push({
                day: d,
                month: viewMonth,
                year: viewYear,
                isCurrentMonth: true,
                dateStr: `${String(d).padStart(2, "0")}/${String(viewMonth + 1).padStart(2, "0")}/${viewYear}`,
            });
        }

        const fillTo = days.length <= 35 ? (35 - days.length) : (42 - days.length);
        for (let d = 1; d <= fillTo; d++) {
            const m = viewMonth === 11 ? 0 : viewMonth + 1;
            const y = viewMonth === 11 ? viewYear + 1 : viewYear;
            days.push({
                day: d,
                month: m,
                year: y,
                isCurrentMonth: false,
                dateStr: `${String(d).padStart(2, "0")}/${String(m + 1).padStart(2, "0")}/${y}`,
            });
        }

        return days;
    }, [viewYear, viewMonth]);

    const formattedPreview = useMemo(() => {
        if (!parsedDate) return "dd/mm/yyyy";
        const d = parsedDate.getDate();
        const m = SHORT_MONTH_NAMES[parsedDate.getMonth()];
        const y = parsedDate.getFullYear();
        return `${d} ${m} ${y}`;
    }, [parsedDate]);

    // Quick year navigation range
    const yearRange = useMemo(() => {
        const start = viewYear - 5;
        return Array.from({ length: 12 }, (_, i) => start + i);
    }, [viewYear]);

    return (
        <div className="w-[300px] p-4 bg-white rounded-2xl shadow-2xl border border-slate-200 select-none text-slate-800">
            {/* Calendar Header with Title and << < > >> Buttons */}
            <div className="flex items-center justify-between mb-3 pb-1">
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => setSelectorMode(selectorMode === "month" ? "calendar" : "month")}
                        className="text-[14px] font-bold text-slate-900 hover:text-orange-600 hover:bg-orange-50 px-1.5 py-0.5 rounded-md transition-colors text-left"
                        title="Change month"
                    >
                        {MONTH_NAMES[viewMonth]}
                    </button>
                    <button
                        type="button"
                        onClick={() => setSelectorMode(selectorMode === "year" ? "calendar" : "year")}
                        className="text-[14px] font-bold text-slate-900 hover:text-orange-600 hover:bg-orange-50 px-1.5 py-0.5 rounded-md transition-colors text-left"
                        title="Change year"
                    >
                        {viewYear}
                    </button>
                </div>

                <div className="flex items-center gap-0.5">
                    <button
                        type="button"
                        onClick={handlePrevYear}
                        className="h-7 w-7 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                        title="Previous year"
                    >
                        <ChevronsLeft className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={handlePrevMonth}
                        className="h-7 w-7 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                        title="Previous month"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={handleNextMonth}
                        className="h-7 w-7 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                        title="Next month"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={handleNextYear}
                        className="h-7 w-7 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                        title="Next year"
                    >
                        <ChevronsRight className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {selectorMode === "calendar" && (
                <>
                    {/* Weekday headers: Mo Tu We Th Fr Sa Su */}
                    <div className="grid grid-cols-7 text-center text-[12px] font-medium text-slate-400 mb-2">
                        <span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span><span>Su</span>
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-y-1.5 gap-x-1 text-center text-[13px]">
                        {calendarGrid.map((item, idx) => {
                            const isSelected =
                                parsedDate &&
                                parsedDate.getDate() === item.day &&
                                parsedDate.getMonth() === item.month &&
                                parsedDate.getFullYear() === item.year;

                            const isToday =
                                today.getDate() === item.day &&
                                today.getMonth() === item.month &&
                                today.getFullYear() === item.year;

                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                        onChange(item.dateStr);
                                        onClose?.();
                                    }}
                                    className={cn(
                                        "h-8 w-8 mx-auto flex items-center justify-center rounded-lg text-[13px] transition-all cursor-pointer",
                                        !item.isCurrentMonth && "text-slate-300 hover:bg-slate-50",
                                        item.isCurrentMonth && !isSelected && "text-slate-800 hover:bg-slate-100 font-medium",
                                        isToday && !isSelected && "font-bold text-orange-600 underline decoration-orange-400 underline-offset-4",
                                        isSelected && "border-2 border-[#f97316] text-slate-900 font-semibold bg-white shadow-xs"
                                    )}
                                >
                                    {item.day}
                                </button>
                            );
                        })}
                    </div>
                </>
            )}

            {selectorMode === "month" && (
                <div className="grid grid-cols-3 gap-2 py-2">
                    {MONTH_NAMES.map((mName, idx) => (
                        <button
                            key={mName}
                            type="button"
                            onClick={() => {
                                setViewMonth(idx);
                                setSelectorMode("calendar");
                            }}
                            className={cn(
                                "py-2.5 text-xs font-semibold rounded-xl transition-colors",
                                viewMonth === idx
                                    ? "bg-orange-500 text-white shadow-xs"
                                    : "text-slate-700 hover:bg-slate-100"
                            )}
                        >
                            {mName.slice(0, 3)}
                        </button>
                    ))}
                </div>
            )}

            {selectorMode === "year" && (
                <div className="grid grid-cols-3 gap-2 py-2">
                    {yearRange.map((yVal) => (
                        <button
                            key={yVal}
                            type="button"
                            onClick={() => {
                                setViewYear(yVal);
                                setSelectorMode("calendar");
                            }}
                            className={cn(
                                "py-2.5 text-xs font-semibold rounded-xl transition-colors",
                                viewYear === yVal
                                    ? "bg-orange-500 text-white shadow-xs"
                                    : "text-slate-700 hover:bg-slate-100"
                            )}
                        >
                            {yVal}
                        </button>
                    ))}
                </div>
            )}

            {/* Footer with Selected Date Preview & Current Month Button */}
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-[12px]">
                <span className="text-slate-600 font-medium">
                    {formattedPreview}
                </span>
                <button
                    type="button"
                    onClick={handleCurrentMonth}
                    className="text-slate-600 hover:text-slate-950 font-semibold hover:underline transition-colors"
                >
                    Current month
                </button>
            </div>
        </div>
    );
}

function TactoDateField({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (dateStr: string) => void;
}) {
    const [open, setOpen] = useState(false);

    return (
        <div className="grid grid-cols-[110px_1fr] items-center gap-2">
            <span className="text-slate-500 font-medium text-[13px]">{label}</span>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        className={cn(
                            "w-fit min-w-[170px] flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all text-left",
                            open
                                ? "border border-[#f97316] ring-2 ring-orange-100 bg-white text-slate-900 shadow-xs"
                                : "border border-slate-200/80 hover:border-slate-300 bg-white/70 text-slate-800"
                        )}
                    >
                        <Calendar className="h-4 w-4 text-slate-500 shrink-0" />
                        <span className={cn(!value && "text-slate-400 font-normal")}>
                            {value || "dd/mm/yyyy"}
                        </span>
                    </button>
                </PopoverTrigger>
                <PopoverContent align="start" sideOffset={6} className="p-0 border-0 bg-transparent shadow-none w-auto">
                    <TactoCalendarPicker
                        value={value}
                        onChange={(newVal) => {
                            onChange(newVal);
                            setOpen(false);
                        }}
                        onClose={() => setOpen(false)}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}

export default function DocumentDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const docId = params?.id as string;

    const [doc, setDoc] = useState<DocumentRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();

    // Resizable Split Pane State (General info has strict max limit to prioritize PDF space)
    const [sidebarWidth, setSidebarWidth] = useState(380);
    const [isResizing, setIsResizing] = useState(false);
    const animationFrameRef = useRef<number | null>(null);

    useEffect(() => {
        if (!isResizing) return;

        const handleMouseMove = (e: MouseEvent) => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            animationFrameRef.current = requestAnimationFrame(() => {
                const newWidth = window.innerWidth - e.clientX;
                // Strict max limit (max 480px or 38% of window) so PDF canvas always gets the lion's share of space
                const maxSidebarWidth = Math.min(480, Math.floor(window.innerWidth * 0.38));
                const minSidebarWidth = 280;
                const clamped = Math.max(minSidebarWidth, Math.min(newWidth, maxSidebarWidth));
                setSidebarWidth(clamped);
            });
        };

        const handleMouseUp = () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            setIsResizing(false);
        };

        window.addEventListener("mousemove", handleMouseMove, { passive: true });
        window.addEventListener("mouseup", handleMouseUp);
        window.addEventListener("blur", handleMouseUp);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
            window.removeEventListener("blur", handleMouseUp);
        };
    }, [isResizing]);

    // Accordion fold states
    const [generalInfoOpen, setGeneralInfoOpen] = useState(true);
    const [relationshipsOpen, setRelationshipsOpen] = useState(true);

    // Editable form state
    const [name, setName] = useState("");
    const [validFrom, setValidFrom] = useState("");
    const [expiresAt, setExpiresAt] = useState("");
    const [status, setStatus] = useState("Valid");
    const [type, setType] = useState("Other");
    const [supplierId, setSupplierId] = useState<string | null>(null);
    const [supplierName, setSupplierName] = useState("");
    const [sources, setSources] = useState("");

    // Supplier modal
    const [suppliersList, setSuppliersList] = useState<{ id: string; name: string }[]>([]);
    const [supplierModalOpen, setSupplierModalOpen] = useState(false);
    const [supplierSearch, setSupplierSearch] = useState("");

    // Supply source edit mode
    const [isEditingSources, setIsEditingSources] = useState(false);

    // PDF viewer controls
    const [zoomLevel, setZoomLevel] = useState(100);
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = 5;

    // Load document data
    useEffect(() => {
        if (!docId) return;
        setLoading(true);
        getDocumentById(docId).then((data) => {
            if (data) {
                setDoc(data);
                setName(data.name || "");
                setValidFrom(data.validFrom && data.validFrom !== "—" ? data.validFrom : "");
                setExpiresAt(data.expiresAt && data.expiresAt !== "—" ? data.expiresAt : "");
                setStatus(data.status || "Valid");
                setType(data.type || "Other");
                setSupplierId(data.supplierId || null);
                setSupplierName(data.supplierName && data.supplierName !== "—" ? data.supplierName : "Prettl Mechatronics GmbH");
                setSources(data.sources && data.sources !== "—" ? data.sources : "");
            }
            setLoading(false);
        });

        getSuppliersList().then((list) => setSuppliersList(list));
    }, [docId]);

    // Save field updates to backend
    const handleSaveField = (fieldsToUpdate: Partial<{
        name: string;
        validFrom: string;
        expiresAt: string;
        status: string;
        type: string;
        supplierId: string | null;
        supplierName: string | null;
        sources: string | null;
    }>) => {
        if (!docId) return;

        startTransition(async () => {
            try {
                const res = await updateDocumentDetails(docId, fieldsToUpdate);
                if (res.success) {
                    toast.success("Details updated successfully");
                    // Refresh local doc
                    const fresh = await getDocumentById(docId);
                    if (fresh) setDoc(fresh);
                } else {
                    toast.error(res.error || "Failed to update details");
                }
            } catch (e) {
                console.error("Save error:", e);
                toast.error("Error saving document changes");
            }
        });
    };

    const creatorProfile: DocumentCreatorProfile = useMemo(() => {
        if (doc?.creatorProfile) return doc.creatorProfile;
        const nameDisplay = doc?.createdByName || "User";
        const parts = nameDisplay.trim().split(/\s+/);
        const initials = parts.length >= 2
            ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
            : (nameDisplay.slice(0, 2).toUpperCase() || "US");
        const isContact = Boolean(nameDisplay.toLowerCase().includes("contact") || (doc?.createdVia && doc.createdVia.toLowerCase().includes("contact")));
        const email = doc?.createdByEmail || `${nameDisplay.toLowerCase().replace(/[^a-z0-9]/g, ".")}@prettl.com`;
        return {
            name: nameDisplay,
            email: email,
            role: isContact ? "Contact" : "User",
            status: "Active",
            groups: isContact ? "Chief Executive +10" : "Administrator",
            department: "Purchasing +14",
            supplierName: supplierName || "851035 Prettl Mechatronics GmbH",
            isContact: isContact,
            initials: initials,
        };
    }, [doc, supplierName]);

    const formattedCreatedAt = useMemo(() => {
        if (!doc?.createdAt) return "22/09/2026, 10:04";
        const d = new Date(doc.createdAt);
        return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}, ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    }, [doc?.createdAt]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-white">
                <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
            </div>
        );
    }

    if (!doc) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-white text-slate-800 p-6">
                <h2 className="text-lg font-bold">Document Not Found</h2>
                <p className="text-sm text-slate-500 mt-1">The requested document could not be loaded.</p>
                <Link
                    href="/documents"
                    className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors"
                >
                    Back to Documents
                </Link>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full flex-col bg-[#f8fafc] text-slate-900 font-sans overflow-hidden">
            {/* Top Navigation Bar Matching Screenshot */}
            <div className="h-12 border-b border-slate-200/90 bg-white px-5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 text-[13px]">
                    <Link
                        href="/documents"
                        className="font-medium text-slate-500 hover:text-slate-900 transition-colors"
                    >
                        Documents
                    </Link>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 truncate max-w-[500px]">
                        <span className="text-red-600 font-black text-xs">📄</span>
                        <span className="truncate">{name || doc.name}</span>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-700 transition-colors ml-1"
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-48 p-1 rounded-xl shadow-xl border-slate-200">
                            {doc.url && (
                                <DropdownMenuItem
                                    onClick={() => window.open(doc.url!, "_blank")}
                                    className="text-xs cursor-pointer"
                                >
                                    <ExternalLink className="h-3.5 w-3.5 mr-2 text-slate-500" />
                                    Open Raw File
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                                onClick={() => router.push("/documents")}
                                className="text-xs cursor-pointer"
                            >
                                <ArrowLeft className="h-3.5 w-3.5 mr-2 text-slate-500" />
                                Back to List
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="flex items-center gap-2">
                    {isPending && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-600" />
                            <span>Saving changes...</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Split Screen Layout: Left = PDF Viewer, Right = General Info Sidebar */}
            <div className="flex flex-1 overflow-hidden relative">
                {/* Full screen overlay while dragging so iframes or fast mouse movements never steal events */}
                {isResizing && (
                    <div
                        className="fixed inset-0 z-[100] cursor-col-resize select-none bg-transparent"
                        onMouseUp={() => setIsResizing(false)}
                    />
                )}

                {/* LEFT PANEL: Document Previewer Matching Screenshot */}
                <div className={cn(
                    "flex-1 flex flex-col bg-[#e2e8f0]/40 border-r border-slate-200/90 overflow-hidden",
                    isResizing && "pointer-events-none select-none"
                )}>
                    {/* Viewer Toolbar */}
                    <div className="h-10 bg-white border-b border-slate-200/80 px-4 flex items-center justify-between text-xs text-slate-600 shrink-0 select-none">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800"
                                title="Page Thumbnails"
                            >
                                <SlidersHorizontal className="h-3.5 w-3.5" />
                            </button>
                            <button
                                type="button"
                                className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800"
                                title="Page View"
                            >
                                <ChevronDown className="h-3.5 w-3.5" />
                            </button>
                        </div>

                        {/* Page & Zoom Controls */}
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setZoomLevel(z => Math.max(50, z - 10))}
                                className="p-1 hover:bg-slate-100 rounded text-slate-600"
                                title="Zoom Out"
                            >
                                <Minus className="h-3.5 w-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setZoomLevel(z => Math.min(200, z + 10))}
                                className="p-1 hover:bg-slate-100 rounded text-slate-600"
                                title="Zoom In"
                            >
                                <Plus className="h-3.5 w-3.5" />
                            </button>

                            <div className="h-4 w-px bg-slate-200 mx-1" />

                            <button
                                type="button"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage <= 1}
                                className="px-1.5 py-0.5 hover:bg-slate-100 disabled:opacity-30 rounded text-xs font-medium"
                            >
                                &lt;
                            </button>
                            <span className="font-semibold text-slate-700">
                                {currentPage} <span className="font-normal text-slate-400">of {totalPages}</span>
                            </span>
                            <button
                                type="button"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage >= totalPages}
                                className="px-1.5 py-0.5 hover:bg-slate-100 disabled:opacity-30 rounded text-xs font-medium"
                            >
                                &gt;
                            </button>

                            <div className="h-4 w-px bg-slate-200 mx-1" />

                            <button
                                type="button"
                                onClick={() => setZoomLevel(100)}
                                className="p-1 hover:bg-slate-100 rounded text-slate-600"
                                title="Reset Zoom"
                            >
                                <RotateCw className="h-3.5 w-3.5" />
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800"
                                title="Search"
                            >
                                <Search className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* Document Render Canvas */}
                    <div className="flex-1 overflow-y-auto p-8 flex justify-center items-start">
                        {doc.url && doc.url.endsWith(".pdf") ? (
                            <div className="w-full max-w-4xl h-full rounded-lg shadow-xl overflow-hidden border border-slate-300 bg-white">
                                <iframe
                                    src={`${doc.url}#view=FitH`}
                                    className="w-full h-full min-h-[850px] border-0"
                                    title={doc.name}
                                />
                            </div>
                        ) : (
                            /* Authentic Tacto Preview Render matching Screenshot */
                            <div
                                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top center" }}
                                className="w-[780px] min-h-[1050px] bg-white rounded-lg shadow-2xl border border-slate-300 p-12 text-slate-900 transition-transform duration-150 relative"
                            >
                                {/* Top Red Banner Header Matching Screenshot */}
                                <div className="flex items-start justify-between gap-6 pb-8 border-b border-slate-200">
                                    <div className="bg-[#e11d48] text-white p-7 rounded-3xl flex-1 shadow-md">
                                        <h1 className="text-2xl font-black tracking-tight leading-none uppercase">
                                            Code of Conduct
                                        </h1>
                                        <p className="text-xs font-semibold tracking-wider uppercase mt-2 text-rose-100">
                                            Zur gesellschaftlichen Verantwortung
                                        </p>
                                    </div>

                                    {/* Supplier Logo Area */}
                                    <div className="text-right shrink-0">
                                        <div className="text-2xl font-black tracking-tighter text-[#e11d48] italic">
                                            {supplierName ? supplierName.split(" ")[0] : "Schlösser"}
                                        </div>
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                                            Dichtungen. Technik.
                                        </p>
                                    </div>
                                </div>

                                {/* German Content TOC Matching Screenshot */}
                                <div className="mt-10">
                                    <h2 className="text-base font-black text-[#e11d48] uppercase tracking-wide mb-6">
                                        Inhaltsverzeichnis
                                    </h2>

                                    <div className="space-y-2 text-xs font-medium text-slate-800">
                                        <div className="flex justify-between py-1.5 border-b border-slate-100">
                                            <span className="font-bold">1</span>
                                            <span className="flex-1 px-4">Grundverständnis über gesellschaftlich verantwortliche Unternehmensführung</span>
                                        </div>
                                        <div className="flex justify-between py-1.5 border-b border-slate-100">
                                            <span className="font-bold">2</span>
                                            <span className="flex-1 px-4">Geltungsbereich</span>
                                        </div>
                                        <div className="flex justify-between py-1.5 pl-6 border-b border-slate-100 text-slate-600">
                                            <span>2.1</span>
                                            <span className="flex-1 px-4">Lieferkette</span>
                                        </div>
                                        <div className="flex justify-between py-1.5 border-b border-slate-100">
                                            <span className="font-bold">3</span>
                                            <span className="flex-1 px-4">Eckpunkte gesellschaftlich verantwortlicher Unternehmensführung</span>
                                        </div>
                                        <div className="flex justify-between py-1.5 pl-6 border-b border-slate-100 text-slate-600">
                                            <span>3.1</span>
                                            <span className="flex-1 px-4">Einhaltung der Gesetze</span>
                                        </div>
                                        <div className="flex justify-between py-1.5 pl-6 border-b border-slate-100 text-slate-600">
                                            <span>3.2</span>
                                            <span className="flex-1 px-4">Integrität und Organizational Governance</span>
                                        </div>
                                        <div className="flex justify-between py-1.5 pl-6 border-b border-slate-100 text-slate-600">
                                            <span>3.3</span>
                                            <span className="flex-1 px-4">Datenschutz</span>
                                        </div>
                                        <div className="flex justify-between py-1.5 pl-6 border-b border-slate-100 text-slate-600">
                                            <span>3.4</span>
                                            <span className="flex-1 px-4">Ausfuhrkontrolle</span>
                                        </div>
                                        <div className="flex justify-between py-1.5 pl-6 border-b border-slate-100 text-slate-600">
                                            <span>3.5</span>
                                            <span className="flex-1 px-4">Verbraucherinteressen</span>
                                        </div>
                                        <div className="flex justify-between py-1.5 pl-6 border-b border-slate-100 text-slate-600">
                                            <span>3.6</span>
                                            <span className="flex-1 px-4">Kommunikation</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Page Number */}
                                <div className="absolute bottom-6 left-12 right-12 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 pt-4">
                                    <span>{supplierName || "Prettl Mechatronics"} • Compliance</span>
                                    <span>Seite 1 von 5</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* RESIZABLE DRAGGER / SPLITTER HANDLE */}
                <div
                    onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsResizing(true);
                    }}
                    onDoubleClick={() => setSidebarWidth(380)}
                    className={cn(
                        "w-2 relative z-30 cursor-col-resize select-none shrink-0 transition-colors flex items-center justify-center group -ml-1 -mr-1",
                        isResizing ? "bg-orange-500" : "hover:bg-orange-400 bg-slate-200/90"
                    )}
                    title="Drag to resize panel (Double-click to reset)"
                >
                    {/* Visual Center Grip Indicator */}
                    <div className={cn(
                        "w-1 h-8 rounded-full transition-colors flex flex-col items-center justify-center gap-0.5",
                        isResizing ? "bg-white" : "bg-slate-400 group-hover:bg-white"
                    )}>
                        <span className="h-0.5 w-0.5 rounded-full bg-slate-600 group-hover:bg-orange-600" />
                        <span className="h-0.5 w-0.5 rounded-full bg-slate-600 group-hover:bg-orange-600" />
                        <span className="h-0.5 w-0.5 rounded-full bg-slate-600 group-hover:bg-orange-600" />
                    </div>
                </div>

                {/* RIGHT SIDEBAR: General Information & Relationships Matching Screenshot */}
                <div
                    style={{ width: `${sidebarWidth}px` }}
                    className="bg-white border-l border-slate-200/90 overflow-y-auto flex flex-col shrink-0"
                >
                    
                    {/* SECTION 1: General Information (Collapsible) */}
                    <div className="border-b border-slate-200/80">
                        <button
                            type="button"
                            onClick={() => setGeneralInfoOpen(prev => !prev)}
                            className="w-full px-6 py-4 flex items-center justify-between text-[14px] font-bold text-slate-900 hover:bg-slate-50/50 transition-colors select-none"
                        >
                            <div className="flex items-center gap-1.5">
                                <span>General Information</span>
                                <ChevronDown className={cn("h-4 w-4 text-slate-500 transition-transform", !generalInfoOpen && "-rotate-90")} />
                            </div>
                        </button>

                        {generalInfoOpen && (
                            <div className="px-6 pb-6 space-y-4 text-[13px]">
                                {/* Name */}
                                <div className="grid grid-cols-[110px_1fr] items-center gap-2">
                                    <span className="text-slate-500 font-medium">Name</span>
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            onBlur={() => handleSaveField({ name })}
                                            className="w-full font-medium text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-slate-800 focus:outline-none px-1 py-0.5 text-[13px] transition-colors"
                                            placeholder="Document name"
                                        />
                                    </div>
                                </div>

                                {/* Valid from */}
                                <TactoDateField
                                    label="Valid from"
                                    value={validFrom}
                                    onChange={(newVal) => {
                                        setValidFrom(newVal);
                                        handleSaveField({ validFrom: newVal });
                                    }}
                                />

                                {/* Expires at */}
                                <TactoDateField
                                    label="Expires at"
                                    value={expiresAt}
                                    onChange={(newVal) => {
                                        setExpiresAt(newVal);
                                        handleSaveField({ expiresAt: newVal });
                                    }}
                                />

                                {/* Status */}
                                <div className="grid grid-cols-[110px_1fr] items-center gap-2">
                                    <span className="text-slate-500 font-medium">Status</span>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button
                                                type="button"
                                                className="flex items-center gap-2 font-medium text-slate-800 hover:bg-slate-50 px-1.5 py-0.5 rounded-md text-left transition-colors"
                                            >
                                                <span className={cn(
                                                    "h-2 w-2 rounded-full shrink-0",
                                                    STATUS_OPTIONS.find(s => s.value.toLowerCase() === status.toLowerCase())?.color || "bg-emerald-500"
                                                )} />
                                                <span className={cn(
                                                    "font-medium",
                                                    STATUS_OPTIONS.find(s => s.value.toLowerCase() === status.toLowerCase())?.text || "text-emerald-700"
                                                )}>
                                                    {status}
                                                </span>
                                                <ChevronDown className="h-3 w-3 text-slate-400 ml-1" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start" className="w-48 p-1 rounded-xl shadow-xl border-slate-200">
                                            {STATUS_OPTIONS.map((opt) => (
                                                <DropdownMenuItem
                                                    key={opt.value}
                                                    onClick={() => {
                                                        setStatus(opt.value);
                                                        handleSaveField({ status: opt.value });
                                                    }}
                                                    className="flex items-center gap-2 text-xs font-medium cursor-pointer"
                                                >
                                                    <span className={cn("h-2 w-2 rounded-full shrink-0", opt.color)} />
                                                    <span>{opt.label}</span>
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                {/* Created by */}
                                <div className="grid grid-cols-[110px_1fr] items-center gap-2">
                                    <span className="text-slate-500 font-medium">Created by</span>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button
                                                type="button"
                                                className="flex items-center gap-2 text-slate-800 hover:text-slate-950 font-medium text-left cursor-pointer group"
                                            >
                                                <div className="h-4 w-4 rounded-full bg-slate-800 text-white flex items-center justify-center text-[9px] font-bold shrink-0">
                                                    {creatorProfile.initials}
                                                </div>
                                                <span className="truncate group-hover:underline">
                                                    {creatorProfile.name}
                                                </span>
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent align="start" className="w-80 p-0 rounded-2xl border-slate-200 shadow-2xl z-50 overflow-hidden">
                                            <div className="p-4 bg-slate-50/70 border-b border-slate-100 flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-xs">
                                                    {creatorProfile.initials}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-1.5">
                                                        <h4 className="text-[13px] font-bold text-slate-900 truncate">
                                                            {creatorProfile.name}
                                                        </h4>
                                                        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                            <span>Active</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                                        {creatorProfile.role} • Prettl Group
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="p-4 space-y-2.5 text-xs">
                                                <div className="flex items-start justify-between gap-2">
                                                    <span className="text-slate-400 font-medium shrink-0">Email:</span>
                                                    <a href={`mailto:${creatorProfile.email}`} className="font-semibold text-slate-800 hover:text-blue-600 hover:underline truncate text-right text-[11px]">
                                                        {creatorProfile.email}
                                                    </a>
                                                </div>
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-slate-400 font-medium shrink-0">Groups:</span>
                                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-medium rounded-md border border-slate-200/80 text-[11px]">
                                                        {creatorProfile.groups || "Administrator"}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-slate-400 font-medium shrink-0">Department:</span>
                                                    <span className="font-semibold text-slate-700 text-[11px]">
                                                        {creatorProfile.department || "Purchasing +14"}
                                                    </span>
                                                </div>
                                                <div className="flex items-start justify-between gap-2 border-t border-slate-100 pt-2">
                                                    <span className="text-slate-400 font-medium shrink-0">Supplier:</span>
                                                    <span className="font-semibold text-slate-700 text-right truncate max-w-[170px] text-[11px]">
                                                        {supplierName}
                                                    </span>
                                                </div>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                {/* Created at */}
                                <div className="grid grid-cols-[110px_1fr] items-center gap-2">
                                    <span className="text-slate-500 font-medium">Created at</span>
                                    <div className="flex items-center gap-2 font-medium text-slate-800">
                                        <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                                        <span>{formattedCreatedAt}</span>
                                    </div>
                                </div>

                                {/* Created via */}
                                <div className="grid grid-cols-[110px_1fr] items-center gap-2">
                                    <span className="text-slate-500 font-medium">Created via</span>
                                    <span className="text-slate-800 font-medium text-[13px]">
                                        {doc.createdVia || "Axiom Copilot"}
                                    </span>
                                </div>

                                {/* Type */}
                                <div className="grid grid-cols-[110px_1fr] items-center gap-2">
                                    <span className="text-slate-500 font-medium">Type</span>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button
                                                type="button"
                                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-800 shadow-2xs hover:bg-slate-50 transition-colors w-fit"
                                            >
                                                <span>{type || "Select type"}</span>
                                                <ChevronDown className="h-3 w-3 text-slate-400 ml-1" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start" className="w-56 p-1 rounded-xl shadow-xl border-slate-200">
                                            {DOCUMENT_TYPES.map((t) => (
                                                <DropdownMenuItem
                                                    key={t}
                                                    onClick={() => {
                                                        setType(t);
                                                        handleSaveField({ type: t });
                                                    }}
                                                    className="text-xs font-medium cursor-pointer"
                                                >
                                                    {t}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* SECTION 2: Relationships (Collapsible) */}
                    <div className="border-b border-slate-200/80">
                        <button
                            type="button"
                            onClick={() => setRelationshipsOpen(prev => !prev)}
                            className="w-full px-6 py-4 flex items-center justify-between text-[14px] font-bold text-slate-900 hover:bg-slate-50/50 transition-colors select-none"
                        >
                            <div className="flex items-center gap-1.5">
                                <span>Relationships</span>
                                <ChevronDown className={cn("h-4 w-4 text-slate-500 transition-transform", !relationshipsOpen && "-rotate-90")} />
                            </div>
                        </button>

                        {relationshipsOpen && (
                            <div className="px-6 pb-6 space-y-4 text-[13px]">
                                {/* Supplier */}
                                <div className="grid grid-cols-[110px_1fr] items-center gap-2">
                                    <span className="text-slate-500 font-medium">Supplier</span>
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1.5 min-w-0 font-semibold text-slate-900">
                                            <div className="h-5 w-5 rounded bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                                <Building2 className="h-3.5 w-3.5" />
                                            </div>
                                            <span className="truncate text-xs text-blue-700">
                                                {supplierName || "851035 Prettl Mechatronics GmbH"}
                                            </span>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setSupplierModalOpen(true)}
                                            className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-2 py-1 rounded-lg transition-colors cursor-pointer shrink-0"
                                        >
                                            <Edit2 className="h-3 w-3" />
                                            <span>Edit</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Supply sources */}
                                <div className="grid grid-cols-[110px_1fr] items-center gap-2">
                                    <span className="text-slate-500 font-medium">Supply sources</span>
                                    <div>
                                        {isEditingSources ? (
                                            <div className="flex items-center gap-1.5">
                                                <input
                                                    type="text"
                                                    value={sources}
                                                    onChange={(e) => setSources(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") {
                                                            setIsEditingSources(false);
                                                            handleSaveField({ sources });
                                                        }
                                                    }}
                                                    placeholder="e.g. SSA-73683"
                                                    className="w-full text-xs font-medium text-slate-800 border border-slate-300 rounded-md px-2 py-1 focus:border-slate-800 focus:outline-none"
                                                    autoFocus
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsEditingSources(false);
                                                        handleSaveField({ sources });
                                                    }}
                                                    className="p-1 bg-slate-900 text-white rounded hover:bg-slate-800"
                                                >
                                                    <Check className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ) : sources ? (
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md">
                                                    <GitFork className="h-3 w-3 text-orange-500" />
                                                    <span>{sources}</span>
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsEditingSources(true)}
                                                    className="text-slate-400 hover:text-slate-700 text-xs font-medium"
                                                >
                                                    Edit
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => setIsEditingSources(true)}
                                                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                                            >
                                                <GitFork className="h-3.5 w-3.5 text-slate-400" />
                                                <span>+ Add sources</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* NOTE: Internal fields section omitted as per requirement #3 */}

                </div>
            </div>

            {/* Change Supplier Modal */}
            <Dialog open={supplierModalOpen} onOpenChange={setSupplierModalOpen}>
                <DialogContent className="sm:max-w-md p-6 rounded-2xl bg-white border border-slate-200 shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-slate-900">
                            Change Supplier
                        </DialogTitle>
                    </DialogHeader>

                    <div className="py-3 space-y-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                            <input
                                type="text"
                                value={supplierSearch}
                                onChange={(e) => setSupplierSearch(e.target.value)}
                                placeholder="Search suppliers..."
                                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-slate-800 focus:outline-none"
                            />
                        </div>

                        <div className="max-h-60 overflow-y-auto space-y-1 border border-slate-100 rounded-xl p-1">
                            {suppliersList
                                .filter(s => s.name.toLowerCase().includes(supplierSearch.toLowerCase()))
                                .map((s) => (
                                    <button
                                        key={s.id}
                                        type="button"
                                        onClick={() => {
                                            setSupplierId(s.id);
                                            setSupplierName(s.name);
                                            setSupplierModalOpen(false);
                                            handleSaveField({
                                                supplierId: s.id,
                                                supplierName: s.name,
                                            });
                                        }}
                                        className={cn(
                                            "w-full px-3 py-2 text-left rounded-lg text-xs font-medium flex items-center justify-between hover:bg-slate-50 transition-colors",
                                            supplierId === s.id && "bg-slate-100 text-slate-900 font-bold"
                                        )}
                                    >
                                        <div className="flex items-center gap-2 truncate">
                                            <Building2 className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                                            <span className="truncate">{s.name}</span>
                                        </div>
                                        {supplierId === s.id && <Check className="h-3.5 w-3.5 text-slate-900" />}
                                    </button>
                                ))}
                        </div>
                    </div>

                    <DialogFooter>
                        <button
                            type="button"
                            onClick={() => setSupplierModalOpen(false)}
                            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
