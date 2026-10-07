"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import {
    Search,
    Plus,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Check,
    Building2,
    GitFork,
    User,
    FileText,
    SlidersHorizontal,
    UploadCloud,
    FolderPlus,
    X,
    Clock,
    Calendar,
    Code2,
    CheckSquare,
    Square,
    Loader2,
    Trash2,
    File,
    MoreVertical,
    ExternalLink,
    Archive,
    ArchiveRestore,
    Command,
    Download,
    FileSpreadsheet,
    ChevronsLeft,
    ChevronsRight,
    Mail,
    Briefcase,
    Bell,
    Send,
    CalendarClock,
    CheckCircle2,
    AlertCircle,
    Sparkles,
    RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
    getAllDocuments,
    uploadDocumentFiles,
    stageUploadedDocumentFiles,
    archiveDocument,
    deleteDocument,
    deleteDocuments,
    sendDocumentReminderNow,
    scheduleDocumentReminder,
    cancelDocumentReminder,
    DocumentRecord,
    DocumentCreatorProfile,
} from "@/app/actions/documents";
import {
    matchesFilter,
    parseDateToMidnight,
    type AppliedDocumentFilter,
} from "@/lib/utils/document-filters";

// Filter keys available in Tacto Documents
const FILTER_OPTIONS = [
    { key: "name", label: "Name" },
    { key: "archived", label: "Archived" },
    { key: "type", label: "Type" },
    { key: "supplier", label: "Supplier" },
    { key: "supply_sources", label: "Supply sources" },
    { key: "valid_from", label: "Valid from" },
    { key: "expires_at", label: "Expires at" },
    { key: "created_at", label: "Created at" },
    { key: "created_by", label: "Created by" },
    { key: "created_via", label: "Created via" },
    { key: "status", label: "Status" },
];

const TEXT_OPERATORS = [
    "contains",
    "does not contain",
    "equals",
    "does not equal",
    "begins with",
    "does not begin with",
    "ends with",
    "does not end with",
    "blank",
    "not blank",
];

const ARCHIVED_OPERATORS = [
    "equals",
    "does not equal",
    "blank",
    "not blank",
];

const DATE_OPERATORS = [
    "on",
    "not on",
    "before",
    "before or on",
    "after",
    "after or on",
    "blank",
    "not blank",
];

const STATUS_OPERATORS = [
    "is one of",
    "is none of",
    "blank",
    "not blank",
];

const DOCUMENT_STATUS_OPTIONS = [
    { label: "(Blanks)", value: "(Blanks)", color: null },
    { label: "Rejected", value: "Rejected", color: "bg-rose-500" },
    { label: "Pending approval", value: "Pending approval", color: "bg-amber-500" },
    { label: "Non-existent", value: "Non-existent", color: "bg-slate-400" },
    { label: "Valid", value: "Valid", color: "bg-emerald-500" },
    { label: "Not Valid", value: "Not Valid", color: "bg-rose-500" },
    { label: "Expired", value: "Expired", color: "bg-rose-500" },
];

const SELECT_OPERATORS = ["is", "is not", "equals", "does not equal", "blank", "not blank"];

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

function CalendarPicker({
    value,
    onChange,
}: {
    value: string;
    onChange: (dateStr: string) => void;
}) {
    const initialDate = useMemo(() => {
        return parseDateToMidnight(value) || new Date();
    }, [value]);

    const [viewYear, setViewYear] = useState(initialDate.getFullYear());
    const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

    useEffect(() => {
        const parsed = parseDateToMidnight(value);
        if (parsed) {
            setViewYear(parsed.getFullYear());
            setViewMonth(parsed.getMonth());
        }
    }, [value]);

    const handlePrevYear = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setViewYear((y) => y - 1);
    };
    const handleNextYear = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setViewYear((y) => y + 1);
    };
    const handlePrevMonth = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear((y) => y - 1);
        } else {
            setViewMonth((m) => m - 1);
        }
    };
    const handleNextMonth = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear((y) => y + 1);
        } else {
            setViewMonth((m) => m + 1);
        }
    };

    const calendarGrid = useMemo(() => {
        const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
        let startDay = firstDayOfMonth.getDay() - 1; // Mon=0, Sun=6
        if (startDay === -1) startDay = 6;

        const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
        const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

        const grid: Array<{
            day: number;
            month: number;
            year: number;
            isCurrentMonth: boolean;
            dateStr: string;
        }> = [];

        // Prev month days
        for (let i = startDay - 1; i >= 0; i--) {
            const d = daysInPrevMonth - i;
            const pm = viewMonth === 0 ? 11 : viewMonth - 1;
            const py = viewMonth === 0 ? viewYear - 1 : viewYear;
            const dateStr = `${String(d).padStart(2, "0")}/${String(pm + 1).padStart(2, "0")}/${py}`;
            grid.push({ day: d, month: pm, year: py, isCurrentMonth: false, dateStr });
        }

        // Current month days
        for (let d = 1; d <= daysInCurrentMonth; d++) {
            const dateStr = `${String(d).padStart(2, "0")}/${String(viewMonth + 1).padStart(2, "0")}/${viewYear}`;
            grid.push({ day: d, month: viewMonth, year: viewYear, isCurrentMonth: true, dateStr });
        }

        // Next month days to reach 35 or 42 slots
        const totalSlots = grid.length <= 35 ? 35 : 42;
        const remaining = totalSlots - grid.length;
        for (let d = 1; d <= remaining; d++) {
            const nm = viewMonth === 11 ? 0 : viewMonth + 1;
            const ny = viewMonth === 11 ? viewYear + 1 : viewYear;
            const dateStr = `${String(d).padStart(2, "0")}/${String(nm + 1).padStart(2, "0")}/${ny}`;
            grid.push({ day: d, month: nm, year: ny, isCurrentMonth: false, dateStr });
        }

        return grid;
    }, [viewYear, viewMonth]);

    const selectedDateMidnight = useMemo(() => parseDateToMidnight(value), [value]);

    return (
        <div className="space-y-2 select-none pt-1">
            {/* Header: Month Year + Navigation arrows */}
            <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-800">
                    {MONTH_NAMES[viewMonth]} {viewYear}
                </span>
                <div className="flex items-center gap-0.5 text-slate-500">
                    <button
                        type="button"
                        onClick={handlePrevYear}
                        title="Previous Year"
                        className="p-1 rounded hover:bg-slate-100 hover:text-slate-800 transition-colors"
                    >
                        <ChevronsLeft className="h-3.5 w-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={handlePrevMonth}
                        title="Previous Month"
                        className="p-1 rounded hover:bg-slate-100 hover:text-slate-800 transition-colors"
                    >
                        <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={handleNextMonth}
                        title="Next Month"
                        className="p-1 rounded hover:bg-slate-100 hover:text-slate-800 transition-colors"
                    >
                        <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={handleNextYear}
                        title="Next Year"
                        className="p-1 rounded hover:bg-slate-100 hover:text-slate-800 transition-colors"
                    >
                        <ChevronsRight className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            {/* Weekdays header: Mo Tu We Th Fr Sa Su */}
            <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-slate-400">
                <span>Mo</span>
                <span>Tu</span>
                <span>We</span>
                <span>Th</span>
                <span>Fr</span>
                <span>Sa</span>
                <span>Su</span>
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
                {calendarGrid.map((item, idx) => {
                    const isSelected =
                        selectedDateMidnight &&
                        selectedDateMidnight.getDate() === item.day &&
                        selectedDateMidnight.getMonth() === item.month &&
                        selectedDateMidnight.getFullYear() === item.year;

                    return (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => {
                                onChange(item.dateStr);
                                if (!item.isCurrentMonth) {
                                    setViewMonth(item.month);
                                    setViewYear(item.year);
                                }
                            }}
                            className={cn(
                                "h-7 w-7 mx-auto flex items-center justify-center rounded-lg text-xs transition-colors",
                                !item.isCurrentMonth && "text-slate-300",
                                item.isCurrentMonth && !isSelected && "text-slate-800 hover:bg-slate-100 font-medium",
                                isSelected && "border-2 border-orange-400 bg-orange-50/50 text-slate-900 font-bold shadow-xs"
                            )}
                        >
                            {item.day}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export function CreatorProfileCell({ doc }: { doc: DocumentRecord }) {
    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleOutsideClick(e: MouseEvent) {
            if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener("mousedown", handleOutsideClick);
        }
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, [isOpen]);

    const rawName = doc.createdByName || "User";
    const nameParts = rawName.trim().split(/\s+/);
    const dynInitials = nameParts.length >= 2
        ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
        : (rawName.slice(0, 2).toUpperCase() || "US");

    const isContact = Boolean(rawName.toLowerCase().includes("contact") || (doc.createdVia && doc.createdVia.toLowerCase().includes("contact")));
    const dynEmail = doc.createdByEmail || `${rawName.toLowerCase().replace(/[^a-z0-9]/g, ".")}@prettl.com`;

    const profile: DocumentCreatorProfile = doc.creatorProfile || {
        name: rawName,
        email: dynEmail,
        role: isContact ? "Contact" : "User",
        status: "Active",
        groups: isContact ? "Chief Executive +10" : "Administrator",
        department: "Purchasing +14",
        supplierName: doc.supplierName && doc.supplierName !== "—" ? doc.supplierName : "851035 Prettl Mechatronics GmbH",
        isContact: isContact,
        initials: dynInitials,
    };

    return (
        <div ref={popoverRef} className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen((prev) => !prev);
                }}
                className="flex items-center gap-1.5 text-slate-700 hover:text-slate-950 focus:outline-none group text-left cursor-pointer transition-colors p-1 rounded-md hover:bg-slate-100"
            >
                <div className={cn(
                    "h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 shadow-2xs",
                    isContact ? "bg-blue-600 text-white" : "bg-slate-800 text-white"
                )}>
                    {profile.initials}
                </div>
                <span className="truncate max-w-[130px] font-medium text-xs text-slate-700 group-hover:underline">
                    {profile.name}
                </span>
            </button>

            {isOpen && (
                <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute left-0 top-full mt-2 w-80 rounded-2xl border border-slate-200/90 bg-white shadow-2xl z-50 text-slate-900 overflow-hidden animate-in fade-in-0 zoom-in-95"
                >
                    {/* Header Card (Matching Tacto Screenshot) */}
                    <div className="p-4 bg-slate-50/70 border-b border-slate-100 flex items-center gap-3">
                        <div className={cn(
                            "h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 shadow-xs",
                            isContact ? "bg-blue-600 text-white" : "bg-slate-900 text-white"
                        )}>
                            {profile.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1.5">
                                <h4 className="text-[13px] font-bold text-slate-900 truncate">
                                    {profile.name}
                                </h4>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                    <span>Active</span>
                                </div>
                            </div>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                {profile.role || "User"} • Prettl Group
                            </p>
                        </div>
                    </div>

                    {/* Profile Details List */}
                    <div className="p-4 space-y-2.5 text-xs">
                        {/* Email */}
                        <div className="flex items-start justify-between gap-2">
                            <span className="text-slate-400 font-medium shrink-0">Email:</span>
                            <a
                                href={`mailto:${profile.email}`}
                                className="font-semibold text-slate-800 hover:text-blue-600 hover:underline truncate text-right text-[11px]"
                            >
                                {profile.email}
                            </a>
                        </div>

                        {/* Groups / Roles */}
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-slate-400 font-medium shrink-0">Groups:</span>
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-medium rounded-md border border-slate-200/80 text-[11px]">
                                {profile.groups || "Administrator"}
                            </span>
                        </div>

                        {/* Department */}
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-slate-400 font-medium shrink-0">Department:</span>
                            <span className="font-semibold text-slate-700 text-[11px]">
                                {profile.department || "Purchasing +14"}
                            </span>
                        </div>

                        {/* Supplier */}
                        <div className="flex items-start justify-between gap-2 border-t border-slate-100 pt-2">
                            <span className="text-slate-400 font-medium shrink-0">Supplier:</span>
                            <span className="font-semibold text-slate-700 text-right truncate max-w-[170px] text-[11px]">
                                {profile.supplierName || "851035 Prettl Mechatronics GmbH"}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Column definition matching Screenshot 2 & Reminder feature
const ALL_COLUMNS = [
    { id: "name", label: "Name", required: true },
    { id: "type", label: "Type", required: false },
    { id: "supplier", label: "Supplier", required: false },
    { id: "sources", label: "Sources", required: false },
    { id: "valid_from", label: "Valid from", required: false },
    { id: "expires_at", label: "Expires at", required: false },
    { id: "status", label: "Status", required: false },
    { id: "created_by", label: "Created by", required: false },
    { id: "created_via", label: "Created via", required: false },
    { id: "created_at", label: "Created at", required: false },
    { id: "reminder", label: "Reminder", required: false },
];

function ScheduleReminderModal({
    doc,
    isOpen,
    onClose,
    onScheduled,
    onSendNow,
}: {
    doc: DocumentRecord | null;
    isOpen: boolean;
    onClose: () => void;
    onScheduled: (scheduledAt: string) => void;
    onSendNow?: (doc: DocumentRecord) => Promise<void>;
}) {
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [selectedTime, setSelectedTime] = useState<string>("09:00");
    const [selectedPreset, setSelectedPreset] = useState<number | null>(1);
    const [isSaving, setIsSaving] = useState(false);
    const [isSendingNow, setIsSendingNow] = useState(false);

    // Calculate default business rule: 1 day before expiry at 09:00 AM
    useEffect(() => {
        if (!isOpen || !doc) return;

        let targetDate = new Date();
        if (doc.expiresAt) {
            const parsed = parseDateToMidnight(doc.expiresAt);
            if (parsed) {
                targetDate = new Date(parsed);
                targetDate.setDate(targetDate.getDate() - 1); // 1 day prior
            } else {
                targetDate.setDate(targetDate.getDate() + 1);
            }
        } else {
            targetDate.setDate(targetDate.getDate() + 1);
        }

        const yyyy = targetDate.getFullYear();
        const mm = String(targetDate.getMonth() + 1).padStart(2, "0");
        const dd = String(targetDate.getDate()).padStart(2, "0");
        setSelectedDate(`${yyyy}-${mm}-${dd}`);
        setSelectedTime("09:00");
        setSelectedPreset(1);
    }, [isOpen, doc]);

    if (!doc) return null;

    const recipientName = doc.createdByName || doc.creatorProfile?.name || "Axiom User";
    const recipientEmail = doc.createdByEmail || doc.creatorProfile?.email || "dhanya.shetty@prettl.com";

    const handleApplyPreset = (daysBefore: number) => {
        if (!doc.expiresAt) return;
        const parsed = parseDateToMidnight(doc.expiresAt);
        if (!parsed) return;
        const date = new Date(parsed);
        date.setDate(date.getDate() - daysBefore);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        setSelectedDate(`${yyyy}-${mm}-${dd}`);
        setSelectedPreset(daysBefore);
    };

    const handleSendNowAction = async () => {
        if (!onSendNow) return;
        setIsSendingNow(true);
        try {
            await onSendNow(doc);
            onClose();
        } catch (e) {
            console.error(e);
        } finally {
            setIsSendingNow(false);
        }
    };

    const handleSave = async () => {
        if (!selectedDate) {
            toast.error("Please select a date for the reminder schedule");
            return;
        }

        const [hours, minutes] = selectedTime.split(":").map(Number);
        const [y, m, d] = selectedDate.split("-").map(Number);
        const scheduledDateTime = new Date(y, m - 1, d, hours || 9, minutes || 0);

        if (isNaN(scheduledDateTime.getTime())) {
            toast.error("Invalid scheduled date/time");
            return;
        }

        setIsSaving(true);
        try {
            const res = await scheduleDocumentReminder(doc.id, scheduledDateTime.toISOString());
            if (res.success) {
                toast.success(`Reminder scheduled for ${scheduledDateTime.toLocaleDateString()} at ${selectedTime}`);
                onScheduled(scheduledDateTime.toISOString());
                onClose();
            } else {
                toast.error(res.error || "Failed to schedule reminder");
            }
        } catch (e) {
            console.error(e);
            toast.error("Failed to save reminder schedule");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 pointer-events-auto">
                <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-800 p-6 text-white">
                    <div className="flex items-center gap-2 text-orange-400 text-xs font-semibold uppercase tracking-wider mb-1">
                        <CalendarClock className="h-4 w-4" />
                        <span>Document Expiry Alert</span>
                    </div>
                    <DialogTitle className="text-lg font-bold text-white tracking-tight">
                        Schedule Expiry Reminder
                    </DialogTitle>
                    <p className="text-xs text-slate-300 mt-1">
                        Configure automated email trigger for this compliance document.
                    </p>
                </div>

                <div className="p-6 space-y-5">
                    {/* Document & Recipient Information */}
                    <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/80 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-medium">Document:</span>
                            <span className="font-semibold text-slate-800 truncate max-w-[260px]">{doc.name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-medium">Expiry Date:</span>
                            <span className="font-bold text-red-600">{doc.expiresAt || "Not specified"}</span>
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-200/60 pt-2">
                            <span className="text-slate-500 font-medium">Recipient (Created by):</span>
                            <span className="font-semibold text-slate-800">{recipientName} ({recipientEmail})</span>
                        </div>
                    </div>

                    {/* Quick Presets */}
                    {doc.expiresAt && (
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Recommended Presets
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleApplyPreset(1)}
                                    className={cn(
                                        "px-2.5 py-2.5 text-xs rounded-xl border transition-all text-center cursor-pointer select-none",
                                        selectedPreset === 1
                                            ? "border-orange-500 bg-orange-50/90 text-orange-950 font-bold ring-2 ring-orange-400/50 shadow-xs"
                                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                                    )}
                                >
                                    <span className="flex items-center justify-center gap-1">
                                        ⚡ 1 day prior
                                    </span>
                                    <span className={cn(
                                        "block text-[10px] mt-0.5 font-medium",
                                        selectedPreset === 1 ? "text-orange-700 font-semibold" : "text-slate-400"
                                    )}>
                                        Default Rule
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleApplyPreset(3)}
                                    className={cn(
                                        "px-2.5 py-2.5 text-xs rounded-xl border transition-all text-center cursor-pointer select-none",
                                        selectedPreset === 3
                                            ? "border-amber-500 bg-amber-50/90 text-amber-950 font-bold ring-2 ring-amber-400/50 shadow-xs"
                                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                                    )}
                                >
                                    <span>3 days prior</span>
                                    <span className={cn(
                                        "block text-[10px] mt-0.5 font-medium",
                                        selectedPreset === 3 ? "text-amber-700 font-semibold" : "text-slate-400"
                                    )}>
                                        Early Notice
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleApplyPreset(7)}
                                    className={cn(
                                        "px-2.5 py-2.5 text-xs rounded-xl border transition-all text-center cursor-pointer select-none",
                                        selectedPreset === 7
                                            ? "border-blue-500 bg-blue-50/90 text-blue-950 font-bold ring-2 ring-blue-400/50 shadow-xs"
                                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                                    )}
                                >
                                    <span>1 week prior</span>
                                    <span className={cn(
                                        "block text-[10px] mt-0.5 font-medium",
                                        selectedPreset === 7 ? "text-blue-700 font-semibold" : "text-slate-400"
                                    )}>
                                        Advance Notice
                                    </span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Date & Time Selectors */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Reminder Date
                            </label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => {
                                    setSelectedDate(e.target.value);
                                    setSelectedPreset(null);
                                }}
                                className="w-full h-10 px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800 font-medium cursor-pointer shadow-2xs hover:border-slate-300 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Trigger Time
                            </label>
                            <select
                                value={selectedTime}
                                onChange={(e) => setSelectedTime(e.target.value)}
                                className="w-full h-10 px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800 font-medium cursor-pointer shadow-2xs hover:border-slate-300 transition-colors"
                            >
                                <option value="08:00">08:00 AM</option>
                                <option value="09:00">09:00 AM (Standard)</option>
                                <option value="10:00">10:00 AM</option>
                                <option value="12:00">12:00 PM (Noon)</option>
                                <option value="14:00">02:00 PM</option>
                                <option value="15:00">03:00 PM</option>
                                <option value="17:00">05:00 PM</option>
                                <option value="18:00">06:00 PM</option>
                            </select>
                        </div>
                    </div>

                    <p className="text-[11px] text-slate-500 flex items-center gap-1.5 bg-slate-50/80 p-2.5 rounded-lg border border-slate-100">
                        <AlertCircle className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>The automated email will be sent at this scheduled time directly to <strong className="text-slate-700">{recipientEmail}</strong>.</span>
                    </p>
                </div>

                <DialogFooter className="p-4 bg-slate-50 border-t border-slate-100 flex flex-row items-center justify-between gap-2">
                    {onSendNow ? (
                        <button
                            type="button"
                            onClick={handleSendNowAction}
                            disabled={isSaving || isSendingNow}
                            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-orange-700 hover:text-orange-900 hover:bg-orange-100/70 border border-orange-200/80 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                        >
                            {isSendingNow ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                            <span>Send Email Now</span>
                        </button>
                    ) : (
                        <div />
                    )}

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSaving || isSendingNow}
                            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={isSaving || isSendingNow}
                            className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98]"
                        >
                            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CalendarClock className="h-3.5 w-3.5" />}
                            <span>Save Schedule</span>
                        </button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function ReminderCell({
    doc,
    isSending,
    onSendNow,
    onOpenSchedule,
    onCancelSchedule,
}: {
    doc: DocumentRecord;
    isSending: boolean;
    onSendNow: (doc: DocumentRecord) => void;
    onOpenSchedule: (doc: DocumentRecord) => void;
    onCancelSchedule: (doc: DocumentRecord) => void;
}) {
    const isSent = doc.reminderStatus === "sent" || !!doc.expiryReminderSentAt;
    const isScheduled = doc.reminderStatus === "scheduled" && !!doc.scheduledReminderAt;

    const formattedSentDate = useMemo(() => {
        if (!doc.expiryReminderSentAt) return null;
        const d = new Date(doc.expiryReminderSentAt);
        return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
    }, [doc.expiryReminderSentAt]);

    const formattedScheduledDate = useMemo(() => {
        if (!doc.scheduledReminderAt) return null;
        const d = new Date(doc.scheduledReminderAt);
        return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    }, [doc.scheduledReminderAt]);

    return (
        <div className="flex items-center gap-1.5">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        type="button"
                        onClick={(e) => e.stopPropagation()}
                        disabled={isSending}
                        className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11.5px] font-semibold transition-all shadow-xs outline-none cursor-pointer",
                            isSent && "bg-emerald-50 text-emerald-700 border border-emerald-200/90 hover:bg-emerald-100",
                            isScheduled && "bg-amber-50 text-amber-700 border border-amber-200/90 hover:bg-amber-100",
                            !isSent && !isScheduled && "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                        )}
                    >
                        {isSending ? (
                            <>
                                <Loader2 className="h-3 w-3 animate-spin text-slate-600" />
                                <span>Sending...</span>
                            </>
                        ) : isSent ? (
                            <>
                                <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                                <span>Sent {formattedSentDate ? `(${formattedSentDate})` : ""}</span>
                                <ChevronDown className="h-3 w-3 text-emerald-500 opacity-70" />
                            </>
                        ) : isScheduled ? (
                            <>
                                <Clock className="h-3 w-3 text-amber-600 shrink-0" />
                                <span>Scheduled</span>
                                <ChevronDown className="h-3 w-3 text-amber-500 opacity-70" />
                            </>
                        ) : (
                            <>
                                <Bell className="h-3 w-3 text-slate-400 shrink-0" />
                                <span>Reminder</span>
                                <ChevronDown className="h-3 w-3 text-slate-400 opacity-70" />
                            </>
                        )}
                    </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    align="start"
                    sideOffset={4}
                    className="w-56 p-1.5 shadow-2xl border border-slate-200 bg-white text-slate-900 rounded-xl z-50 animate-in fade-in-0 zoom-in-95"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Status Info Header */}
                    <div className="px-2.5 py-1.5 mb-1 text-[11px] font-medium text-slate-500 bg-slate-50 rounded-lg border border-slate-100">
                        {isSent ? (
                            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                                <CheckCircle2 className="h-3 w-3" />
                                <span>Sent on {formattedSentDate}</span>
                            </div>
                        ) : isScheduled ? (
                            <div className="flex items-center gap-1.5 text-amber-700 font-semibold">
                                <Clock className="h-3 w-3" />
                                <span>Scheduled for {formattedScheduledDate}</span>
                            </div>
                        ) : (
                            <span>No reminder sent yet</span>
                        )}
                    </div>

                    {/* Send Reminder Immediately */}
                    <DropdownMenuItem
                        onClick={() => onSendNow(doc)}
                        className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-semibold cursor-pointer rounded-lg hover:bg-slate-100 text-slate-800"
                    >
                        <Send className="h-3.5 w-3.5 text-orange-500" />
                        <div className="flex flex-col">
                            <span>Send reminder</span>
                            <span className="text-[10px] text-slate-400 font-normal">Dispatch email immediately</span>
                        </div>
                    </DropdownMenuItem>

                    {/* Schedule Reminder Modal Trigger */}
                    <DropdownMenuItem
                        onClick={() => onOpenSchedule(doc)}
                        className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-semibold cursor-pointer rounded-lg hover:bg-slate-100 text-slate-800"
                    >
                        <CalendarClock className="h-3.5 w-3.5 text-blue-500" />
                        <div className="flex flex-col">
                            <span>Schedule</span>
                            <span className="text-[10px] text-slate-400 font-normal">1 day prior (default) or custom</span>
                        </div>
                    </DropdownMenuItem>

                    {/* If scheduled, allow cancel */}
                    {isScheduled && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => onCancelSchedule(doc)}
                                className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-semibold cursor-pointer rounded-lg hover:bg-red-50 text-red-700"
                            >
                                <X className="h-3.5 w-3.5 text-red-500" />
                                <span>Cancel schedule</span>
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

export default function DocumentsPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State for live documents list
    const [docs, setDocs] = useState<DocumentRecord[]>([]);
    const [loading, setLoading] = useState(true);

    // Upload Modal State (Screenshot 4)
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // Search query in main toolbar
    const [searchQuery, setSearchQuery] = useState("");

    // Active filters state
    const [appliedFilters, setAppliedFilters] = useState<AppliedDocumentFilter[]>([]);
    const [filterSearch, setFilterSearch] = useState("");
    const [filterMenuOpen, setFilterMenuOpen] = useState(false);

    // Current filter config in popover (drill-down state)
    const [selectedFilterKey, setSelectedFilterKey] = useState<string | null>(null);
    const [selectedOperator, setSelectedOperator] = useState<string>("contains");
    const [filterValueInput, setFilterValueInput] = useState<string>("");
    const [operatorDropdownOpen, setOperatorDropdownOpen] = useState<boolean>(false);
    const [statusSearch, setStatusSearch] = useState("");

    const selectedStatusValues = useMemo(() => {
        if (!filterValueInput) return [];
        return filterValueInput
            .split(",")
            .map((s) => s.trim().toLowerCase())
            .filter(Boolean);
    }, [filterValueInput]);

    const filteredStatusOptions = useMemo(() => {
        if (!statusSearch.trim()) return DOCUMENT_STATUS_OPTIONS;
        return DOCUMENT_STATUS_OPTIONS.filter((s) =>
            s.label.toLowerCase().includes(statusSearch.toLowerCase())
        );
    }, [statusSearch]);

    const handleToggleStatusOption = (val: string) => {
        const rawList = filterValueInput
            ? filterValueInput
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
            : [];
        const normalized = val.toLowerCase();
        const exists = rawList.some((s) => s.toLowerCase() === normalized);
        let nextList: string[];
        if (exists) {
            nextList = rawList.filter((s) => s.toLowerCase() !== normalized);
        } else {
            nextList = [...rawList, val];
        }
        setFilterValueInput(nextList.join(", "));
    };

    // Column visibility state (Default all enabled including reminder)
    const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
        name: true,
        type: true,
        supplier: true,
        sources: true,
        valid_from: true,
        expires_at: true,
        status: true,
        created_by: true,
        created_via: true,
        created_at: true,
        reminder: true,
    });
    const [columnSearch, setColumnSearch] = useState("");
    const [columnMenuOpen, setColumnMenuOpen] = useState(false);

    // Reminder Action & Scheduling State
    const [sendingReminderMap, setSendingReminderMap] = useState<Record<string, boolean>>({});
    const [scheduleModalDoc, setScheduleModalDoc] = useState<DocumentRecord | null>(null);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

    const handleSendReminderNow = async (doc: DocumentRecord) => {
        setSendingReminderMap((prev) => ({ ...prev, [doc.id]: true }));
        try {
            const res = await sendDocumentReminderNow(doc.id);
            if (res.success) {
                toast.success(`Expiry reminder sent to ${res.recipientEmail}`);
                setDocs((prev) =>
                    prev.map((d) =>
                        d.id === doc.id
                            ? {
                                  ...d,
                                  expiryReminderSentAt: res.sentAt ? new Date(res.sentAt) : new Date(),
                                  reminderStatus: "sent",
                                  scheduledReminderAt: null,
                              }
                            : d
                    )
                );
            } else {
                toast.error(res.error || "Failed to send reminder email");
            }
        } catch (e) {
            console.error(e);
            toast.error("Failed to trigger reminder email");
        } finally {
            setSendingReminderMap((prev) => ({ ...prev, [doc.id]: false }));
        }
    };

    const handleOpenScheduleModal = (doc: DocumentRecord) => {
        setScheduleModalDoc(doc);
        setIsScheduleModalOpen(true);
    };

    const handleScheduleSuccess = (scheduledAtIso: string) => {
        if (!scheduleModalDoc) return;
        setDocs((prev) =>
            prev.map((d) =>
                d.id === scheduleModalDoc.id
                    ? {
                          ...d,
                          scheduledReminderAt: new Date(scheduledAtIso),
                          reminderStatus: "scheduled",
                      }
                    : d
            )
        );
    };

    const handleCancelSchedule = async (doc: DocumentRecord) => {
        try {
            const res = await cancelDocumentReminder(doc.id);
            if (res.success) {
                toast.success("Reminder schedule cancelled");
                setDocs((prev) =>
                    prev.map((d) =>
                        d.id === doc.id
                            ? {
                                  ...d,
                                  scheduledReminderAt: null,
                                  reminderStatus: "idle",
                              }
                            : d
                    )
                );
            } else {
                toast.error(res.error || "Failed to cancel reminder schedule");
            }
        } catch (e) {
            console.error(e);
            toast.error("Error cancelling schedule");
        }
    };

    // Selected rows
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [singleDeleteDoc, setSingleDeleteDoc] = useState<DocumentRecord | null>(null);

    // Container width observer for centering empty state relative to visible screen
    const tableContainerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState<number | undefined>(undefined);

    useEffect(() => {
        if (!tableContainerRef.current) return;
        const updateWidth = () => {
            if (tableContainerRef.current) {
                setContainerWidth(tableContainerRef.current.clientWidth);
            }
        };
        updateWidth();
        const observer = new ResizeObserver(updateWidth);
        observer.observe(tableContainerRef.current);
        return () => observer.disconnect();
    }, []);

    // Fetch documents on mount
    const loadDocuments = async () => {
        setLoading(true);
        try {
            const data = await getAllDocuments();
            setDocs(data);
        } catch (e) {
            console.error("Failed to load documents", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDocuments();
    }, []);

    // Total and visible column counts
    const totalColumnCount = ALL_COLUMNS.length;
    const visibleColumnCount = useMemo(
        () => Object.values(visibleColumns).filter(Boolean).length,
        [visibleColumns]
    );

    // Toggle single column (Name cannot be toggled because it's required & fixed)
    const toggleColumn = (colId: string) => {
        if (colId === "name") return; // Name is locked
        setVisibleColumns((prev) => ({
            ...prev,
            [colId]: !prev[colId],
        }));
    };

    // Toggle select all columns (Name always stays true)
    const isAllSelected = visibleColumnCount === totalColumnCount;
    const toggleSelectAllColumns = () => {
        const nextVal = !isAllSelected;
        const nextState: Record<string, boolean> = {};
        ALL_COLUMNS.forEach((col) => {
            nextState[col.id] = col.required ? true : nextVal;
        });
        setVisibleColumns(nextState);
    };

    // Filter Step Handlers
    const handleSelectFilterKey = (key: string) => {
        setSelectedFilterKey(key);
        const existing = appliedFilters.find((f) => f.key === key);
        if (existing) {
            setSelectedOperator(existing.operator);
            setFilterValueInput(existing.value);
        } else {
            if (key === "archived") {
                setSelectedOperator("equals");
                setFilterValueInput("");
            } else if (key === "valid_from" || key === "expires_at" || key === "created_at") {
                setSelectedOperator("on");
                const today = new Date();
                const dStr = `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear()}`;
                setFilterValueInput(dStr);
            } else if (key === "status") {
                setSelectedOperator("is one of");
                setFilterValueInput("");
                setStatusSearch("");
            } else {
                setSelectedOperator("contains");
                setFilterValueInput("");
            }
        }
        setOperatorDropdownOpen(false);
    };

    const handleApplyFilter = () => {
        if (!selectedFilterKey) return;
        const isBlankOp = selectedOperator === "blank" || selectedOperator === "not blank";
        if (!isBlankOp && !filterValueInput.trim()) {
            toast.error("Please enter a value to filter.");
            return;
        }

        setAppliedFilters((prev) => {
            const filtered = prev.filter((f) => f.key !== selectedFilterKey);
            return [
                ...filtered,
                {
                    key: selectedFilterKey,
                    operator: selectedOperator,
                    value: isBlankOp ? "" : filterValueInput.trim(),
                },
            ];
        });

        // Reset and close
        setSelectedFilterKey(null);
        setFilterValueInput("");
        setFilterMenuOpen(false);
    };

    const handleRemoveFilter = (filterKey: string) => {
        setAppliedFilters((prev) => prev.filter((f) => f.key !== filterKey));
    };

    // Upload handling for Screenshot 4 Modal -> Redirects to /documents/new (Screenshot 1 & 2)
    const handleFileUpload = async (files: FileList | File[]) => {
        if (!files || files.length === 0) return;
        setIsUploading(true);
        try {
            const formData = new FormData();
            for (let i = 0; i < files.length; i++) {
                formData.append("files", files[i]);
            }
            const res = await stageUploadedDocumentFiles(formData);
            if (res.success && res.stagedFiles && res.stagedFiles.length > 0) {
                // Store staged files in sessionStorage for the /documents/new extraction pipeline
                sessionStorage.setItem("staged_documents", JSON.stringify(res.stagedFiles));
                setUploadModalOpen(false);
                router.push("/documents/new");
            } else {
                toast.error(res.error || "Upload failed.");
            }
        } catch (e) {
            console.error(e);
            toast.error("Error uploading file.");
        } finally {
            setIsUploading(false);
        }
    };

    // Row Actions: Open in new tab & Archive Document (from Screenshot)
    const handleOpenInNewTab = (doc: DocumentRecord) => {
        window.open(`/documents/${doc.id}/details`, "_blank");
    };

    const handleToggleArchive = async (doc: DocumentRecord) => {
        const nextState = !doc.archived;
        try {
            const res = await archiveDocument(doc.id, nextState);
            if (res.success) {
                toast.success(nextState ? `"${doc.name}" archived.` : `"${doc.name}" restored.`);
                loadDocuments();
            } else {
                toast.error("Failed to update archive state.");
            }
        } catch (e) {
            console.error(e);
            toast.error("Error archiving document.");
        }
    };

    // Single Document Delete
    const handleDeleteSingleDoc = async (doc: DocumentRecord) => {
        try {
            const res = await deleteDocument(doc.id, doc.supplierId || undefined);
            if (res.success) {
                setDocs((prev) => prev.filter((d) => d.id !== doc.id));
                setSelectedIds((prev) => {
                    const next = new Set(prev);
                    next.delete(doc.id);
                    return next;
                });
                toast.success(`"${doc.name}" deleted.`);
                await loadDocuments();
            } else {
                toast.error(res.error || "Failed to delete document.");
            }
        } catch (e) {
            console.error(e);
            toast.error("Error deleting document.");
        }
    };

    // Export CSV
    const handleExportCSV = () => {
        const selectedDocs = filteredDocs.filter((d) => selectedIds.has(d.id));
        const docsToExport = selectedDocs.length > 0 ? selectedDocs : filteredDocs;

        const data = docsToExport.map((d) => ({
            "Name": d.name || "",
            "Type": d.type || "",
            "Supplier": d.supplierName || "",
            "Sources": d.sources || "",
            "Valid from": d.validFrom || "",
            "Expires at": d.expiresAt || "",
            "Status": d.status || "",
            "Created by": d.createdByName || "",
            "Created via": d.createdVia || "",
            "Created at": d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "",
            "Reminder": d.reminderStatus === "sent" || d.expiryReminderSentAt ? "Sent" : d.reminderStatus === "scheduled" ? "Scheduled" : "Not sent",
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
        const blob = new Blob(["\uFEFF" + csvOutput], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `documents_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success(`Exported ${docsToExport.length} document(s) to CSV`);
    };

    // Export Excel (.xlsx)
    const handleExportExcel = () => {
        const selectedDocs = filteredDocs.filter((d) => selectedIds.has(d.id));
        const docsToExport = selectedDocs.length > 0 ? selectedDocs : filteredDocs;

        const data = docsToExport.map((d) => ({
            "Name": d.name || "",
            "Type": d.type || "",
            "Supplier": d.supplierName || "",
            "Sources": d.sources || "",
            "Valid from": d.validFrom || "",
            "Expires at": d.expiresAt || "",
            "Status": d.status || "",
            "Created by": d.createdByName || "",
            "Created via": d.createdVia || "",
            "Created at": d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "",
            "Reminder": d.reminderStatus === "sent" || d.expiryReminderSentAt ? "Sent" : d.reminderStatus === "scheduled" ? "Scheduled" : "Not sent",
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Documents");

        worksheet["!cols"] = [
            { wch: 30 },
            { wch: 18 },
            { wch: 25 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 12 },
            { wch: 18 },
            { wch: 18 },
            { wch: 15 },
            { wch: 15 },
        ];

        XLSX.writeFile(workbook, `documents_${new Date().toISOString().slice(0, 10)}.xlsx`);
        toast.success(`Exported ${docsToExport.length} document(s) to Excel`);
    };

    // Bulk Delete with backend persistence
    const handleConfirmBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        const ids = Array.from(selectedIds);
        setIsDeleting(true);
        try {
            const res = await deleteDocuments(ids);
            if (res.success) {
                setDocs((prev) => prev.filter((d) => !selectedIds.has(d.id)));
                setSelectedIds(new Set());
                setIsDeleteDialogOpen(false);
                toast.success(`Deleted ${res.count} document${res.count !== 1 ? "s" : ""}`);
                await loadDocuments();
            } else {
                toast.error(res.error || "Failed to delete documents");
            }
        } catch (e) {
            console.error(e);
            toast.error("Error deleting documents");
        } finally {
            setIsDeleting(false);
        }
    };

    // Filtered documents calculation
    const filteredDocs = useMemo(() => {
        return docs.filter((doc) => {
            // Search query filter
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matches =
                    doc.name.toLowerCase().includes(q) ||
                    (doc.type && doc.type.toLowerCase().includes(q)) ||
                    (doc.supplierName && doc.supplierName.toLowerCase().includes(q)) ||
                    (doc.status && doc.status.toLowerCase().includes(q));
                if (!matches) return false;
            }

            // Applied filters with operators
            for (const filter of appliedFilters) {
                let targetValue: string = "";
                if (filter.key === "name") targetValue = doc.name;
                else if (filter.key === "type") targetValue = doc.type || "";
                else if (filter.key === "supplier") targetValue = doc.supplierName || "";
                else if (filter.key === "supply_sources" || filter.key === "sources") targetValue = doc.sources || "";
                else if (filter.key === "valid_from" || filter.key === "validFrom") targetValue = doc.validFrom || "";
                else if (filter.key === "expires_at" || filter.key === "expiresAt") targetValue = doc.expiresAt || "";
                else if (filter.key === "created_at" || filter.key === "createdAt") targetValue = doc.createdAt ? (doc.createdAt instanceof Date ? doc.createdAt.toISOString() : String(doc.createdAt)) : "";
                else if (filter.key === "status") targetValue = doc.status || "";
                else if (filter.key === "created_by" || filter.key === "createdByName") targetValue = doc.createdByName || "";
                else if (filter.key === "created_via" || filter.key === "createdVia") targetValue = doc.createdVia || "";
                else if (filter.key === "archived") targetValue = doc.archived ? "true" : "false";

                if (!matchesFilter(targetValue, filter.operator, filter.value)) {
                    return false;
                }
            }

            return true;
        });
    }, [docs, searchQuery, appliedFilters]);

    // Select all / toggle rows
    const isAllRowsSelected = filteredDocs.length > 0 && selectedIds.size === filteredDocs.length;
    const toggleSelectAllRows = () => {
        if (isAllRowsSelected) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredDocs.map((d) => d.id)));
        }
    };

    const toggleRowSelect = (id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    // Filtered column list for dropdown search
    const filteredColumns = useMemo(() => {
        if (!columnSearch.trim()) return ALL_COLUMNS;
        return ALL_COLUMNS.filter((col) =>
            col.label.toLowerCase().includes(columnSearch.toLowerCase())
        );
    }, [columnSearch]);

    // Filtered options list for filter dropdown search
    const filteredFilterOptions = useMemo(() => {
        if (!filterSearch.trim()) return FILTER_OPTIONS;
        return FILTER_OPTIONS.filter((opt) =>
            opt.label.toLowerCase().includes(filterSearch.toLowerCase())
        );
    }, [filterSearch]);

    const isDateKey =
        selectedFilterKey === "valid_from" ||
        selectedFilterKey === "expires_at" ||
        selectedFilterKey === "created_at";

    const activeOperators =
        selectedFilterKey === "archived"
            ? ARCHIVED_OPERATORS
            : isDateKey
            ? DATE_OPERATORS
            : selectedFilterKey === "status"
            ? STATUS_OPERATORS
            : TEXT_OPERATORS;
    const selectedFilterLabel = FILTER_OPTIONS.find((f) => f.key === selectedFilterKey)?.label || selectedFilterKey;

    return (
        <div className="flex h-full min-h-screen w-full flex-col bg-white text-slate-900">
            {/* Top Title Bar */}
            <div className="border-b border-slate-200/80 px-6 py-3.5">
                <h1 className="text-[17px] font-bold tracking-tight text-slate-900">
                    Documents
                </h1>
            </div>

            {/* Action Bar / Controls Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 px-6 py-2.5">
                {/* Left side: + Add filter */}
                <div className="flex flex-wrap items-center gap-2">
                    <Popover
                        open={filterMenuOpen}
                        onOpenChange={(open) => {
                            setFilterMenuOpen(open);
                            if (!open) {
                                setSelectedFilterKey(null);
                                setFilterSearch("");
                                setStatusSearch("");
                            }
                        }}
                    >
                        <PopoverTrigger asChild>
                            <button
                                type="button"
                                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[13px] font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
                            >
                                <Plus className="h-3.5 w-3.5 text-slate-500" />
                                <span>Add filter</span>
                            </button>
                        </PopoverTrigger>
                        <PopoverContent
                            align="start"
                            sideOffset={6}
                            className="w-[280px] p-3 shadow-2xl border border-slate-200 bg-white text-slate-900 rounded-2xl z-50 animate-in fade-in-0 zoom-in-95"
                        >
                            {!selectedFilterKey ? (
                                /* View 1: Filter List (Screenshot 2) */
                                <div>
                                    {/* Search inside filter dropdown */}
                                    <div className="relative mb-2">
                                        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                                        <input
                                            type="text"
                                            value={filterSearch}
                                            onChange={(e) => setFilterSearch(e.target.value)}
                                            placeholder="Search..."
                                            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-1.5 pl-8 pr-2.5 text-[12.5px] text-slate-800 placeholder-slate-400 focus:border-slate-300 focus:bg-white focus:outline-none"
                                        />
                                    </div>

                                    {/* Filter items list */}
                                    <div className="max-h-64 overflow-y-auto space-y-0.5 py-1">
                                        {filteredFilterOptions.map((opt) => (
                                            <button
                                                key={opt.key}
                                                type="button"
                                                onClick={() => handleSelectFilterKey(opt.key)}
                                                className="w-full flex items-center justify-between px-2.5 py-1.5 text-left text-[13px] font-medium text-slate-700 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors"
                                            >
                                                <span>{opt.label}</span>
                                                {appliedFilters.some((f) => f.key === opt.key) && (
                                                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                /* View 2: Filter Detail for Attribute (Screenshots 1 & 3) */
                                <div className="space-y-3">
                                    {/* Header with Back Chevron and Name Title */}
                                    <div className="flex items-center gap-1.5 pb-1">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedFilterKey(null)}
                                            className="h-6 w-6 rounded-md hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors -ml-1"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </button>
                                        <h3 className="text-sm font-bold text-slate-800">
                                            {selectedFilterLabel}
                                        </h3>
                                    </div>

                                    {/* Operator Dropdown Box (Screenshot 1) */}
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setOperatorDropdownOpen(!operatorDropdownOpen)}
                                            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl border-2 border-orange-400 bg-white text-xs font-semibold text-slate-800 shadow-xs focus:outline-none"
                                        >
                                            <span>{selectedOperator}</span>
                                            <ChevronDown className={cn("h-4 w-4 text-slate-500 transition-transform", operatorDropdownOpen && "rotate-180")} />
                                        </button>

                                        {/* Operator menu popdown */}
                                        {operatorDropdownOpen && (
                                            <div className="mt-1 rounded-xl border border-slate-200 bg-white shadow-xl max-h-48 overflow-y-auto p-1 space-y-0.5 animate-in fade-in-0 zoom-in-95">
                                                {activeOperators.map((op) => (
                                                    <button
                                                        key={op}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedOperator(op);
                                                            setOperatorDropdownOpen(false);
                                                        }}
                                                        className={cn(
                                                            "w-full flex items-center justify-between px-3 py-1.5 text-left text-xs font-medium rounded-lg transition-colors",
                                                            selectedOperator === op
                                                                ? "bg-slate-100 text-slate-900 font-bold"
                                                                : "hover:bg-slate-50 text-slate-700"
                                                        )}
                                                    >
                                                        <span>{op}</span>
                                                        {selectedOperator === op && (
                                                            <div className="h-4 w-4 rounded-full bg-slate-900 text-white flex items-center justify-center">
                                                                <Check className="h-2.5 w-2.5 stroke-[3]" />
                                                            </div>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Value Inputs / Status Checklist / Calendar (Screenshot 1, 2 & 3) */}
                                    {selectedOperator !== "blank" && selectedOperator !== "not blank" && (
                                        selectedFilterKey === "status" ? (
                                            <div className="space-y-2">
                                                {/* Status sub-search */}
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value={statusSearch}
                                                        onChange={(e) => setStatusSearch(e.target.value)}
                                                        placeholder="Search..."
                                                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-slate-400 focus:outline-none shadow-xs"
                                                    />
                                                </div>

                                                {/* Status Options Checklist with colored dots matching Screenshot 1 */}
                                                <div className="max-h-52 overflow-y-auto space-y-0.5 py-1 pr-0.5">
                                                    {filteredStatusOptions.map((st) => {
                                                        const isChecked = selectedStatusValues.includes(st.value.toLowerCase());
                                                        return (
                                                            <button
                                                                key={st.value}
                                                                type="button"
                                                                onClick={() => handleToggleStatusOption(st.value)}
                                                                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors text-left text-xs font-medium text-slate-700"
                                                            >
                                                                <div
                                                                    className={cn(
                                                                        "h-4 w-4 rounded border flex items-center justify-center transition-colors shrink-0",
                                                                        isChecked
                                                                            ? "bg-slate-900 border-slate-900 text-white"
                                                                            : "border-slate-300 bg-white"
                                                                    )}
                                                                >
                                                                    {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                                                                </div>
                                                                {st.color ? (
                                                                    <div className={cn("h-2 w-2 rounded-full shrink-0", st.color)} />
                                                                ) : (
                                                                    <div className="h-2 w-2 shrink-0" />
                                                                )}
                                                                <span className={cn("truncate", st.value === "(Blanks)" && "text-slate-600 font-normal")}>
                                                                    {st.label}
                                                                </span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <input
                                                    type="text"
                                                    value={filterValueInput}
                                                    onChange={(e) => setFilterValueInput(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") handleApplyFilter();
                                                    }}
                                                    placeholder={isDateKey ? "DD/MM/YYYY" : "Enter a value"}
                                                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-slate-400 focus:outline-none shadow-xs"
                                                    autoFocus={!isDateKey}
                                                />

                                                {/* Calendar Picker for Date attributes */}
                                                {isDateKey && (
                                                    <CalendarPicker
                                                        value={filterValueInput}
                                                        onChange={(dateStr) => setFilterValueInput(dateStr)}
                                                    />
                                                )}
                                            </div>
                                        )
                                    )}

                                    {/* Apply Button (Screenshot 3) */}
                                    <div className="pt-1 flex justify-center">
                                        <button
                                            type="button"
                                            onClick={handleApplyFilter}
                                            className="w-full rounded-xl bg-slate-900 hover:bg-black px-4 py-2 text-xs font-bold text-white transition-colors shadow-xs"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                </div>
                            )}
                        </PopoverContent>
                    </Popover>

                    {/* Active Filter Chips */}
                    {appliedFilters.map((filter) => {
                        const opt = FILTER_OPTIONS.find((o) => o.key === filter.key);
                        const isBlankOp = filter.operator === "blank" || filter.operator === "not blank";
                        return (
                            <div
                                key={filter.key}
                                onClick={() => {
                                    handleSelectFilterKey(filter.key);
                                    setFilterMenuOpen(true);
                                }}
                                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 shadow-xs cursor-pointer hover:bg-slate-100 transition-colors"
                            >
                                <span className="font-semibold text-slate-900">
                                    {opt?.label || filter.key}:
                                </span>
                                <span className="text-slate-500 font-mono text-[11px]">
                                    {filter.operator}
                                </span>
                                {!isBlankOp && (
                                    <span className="font-bold text-slate-900">
                                        &quot;{filter.value}&quot;
                                    </span>
                                )}
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveFilter(filter.key);
                                    }}
                                    className="ml-0.5 text-slate-400 hover:text-slate-700 p-0.5 rounded"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Right side: Search, Columns dropdown, + Add new split button */}
                <div className="flex items-center gap-2.5">
                    {/* Search bar */}
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search..."
                            className="h-8 w-44 md:w-56 rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-[13px] text-slate-800 placeholder-slate-400 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
                        />
                    </div>

                    {/* Columns 10/10 Dropdown (Screenshot 2 & 3) */}
                    <Popover open={columnMenuOpen} onOpenChange={setColumnMenuOpen}>
                        <PopoverTrigger asChild>
                            <button
                                type="button"
                                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[13px] font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900 focus:outline-none"
                            >
                                <SlidersHorizontal className="h-3.5 w-3.5 text-slate-500 rotate-90" />
                                <span>
                                    Columns {visibleColumnCount}/{totalColumnCount}
                                </span>
                                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                            </button>
                        </PopoverTrigger>
                        <PopoverContent
                            align="end"
                            sideOffset={6}
                            className="w-56 p-1.5 shadow-xl border border-slate-200 bg-white text-slate-900 rounded-xl z-50"
                        >
                            {/* Search inside columns */}
                            <div className="relative mb-1 px-1 pt-1">
                                <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-400" />
                                <input
                                    type="text"
                                    value={columnSearch}
                                    onChange={(e) => setColumnSearch(e.target.value)}
                                    placeholder="Search..."
                                    className="w-full rounded-md border border-slate-200 bg-slate-50/50 py-1 pl-8 pr-2.5 text-[12.5px] text-slate-800 placeholder-slate-400 focus:border-slate-300 focus:bg-white focus:outline-none"
                                />
                            </div>

                            <div className="space-y-0.5 py-1">
                                {/* Select all checkbox */}
                                <button
                                    type="button"
                                    onClick={toggleSelectAllColumns}
                                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-left text-[13px] font-medium text-slate-800 rounded-md hover:bg-slate-100 transition-colors"
                                >
                                    <div
                                        className={cn(
                                            "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                                            isAllSelected
                                                ? "bg-slate-900 border-slate-900 text-white"
                                                : "border-slate-300 bg-white"
                                        )}
                                    >
                                        {isAllSelected && <Check className="h-3 w-3 stroke-[3]" />}
                                    </div>
                                    <span>Select all</span>
                                </button>

                                <div className="my-1 border-t border-slate-100" />

                                {/* Individual Columns list */}
                                <div className="max-h-64 overflow-y-auto space-y-0.5">
                                    {filteredColumns.map((col) => {
                                        const isRequired = col.required;
                                        const isChecked = visibleColumns[col.id] !== false;

                                        return (
                                            <button
                                                key={col.id}
                                                type="button"
                                                disabled={isRequired}
                                                onClick={() => toggleColumn(col.id)}
                                                className={cn(
                                                    "w-full flex items-center gap-2.5 px-2.5 py-1.5 text-left text-[13px] font-medium rounded-md transition-colors",
                                                    isRequired
                                                        ? "opacity-50 cursor-not-allowed text-slate-400"
                                                        : "hover:bg-slate-100 text-slate-700 hover:text-slate-900"
                                                )}
                                            >
                                                <div
                                                    className={cn(
                                                        "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                                                        isChecked
                                                            ? isRequired
                                                                ? "bg-slate-400 border-slate-400 text-white"
                                                                : "bg-slate-900 border-slate-900 text-white"
                                                            : "border-slate-300 bg-white"
                                                    )}
                                                >
                                                    {isChecked && (
                                                        <Check className="h-3 w-3 stroke-[3]" />
                                                    )}
                                                </div>
                                                <span className={cn(isRequired && "text-slate-400")}>
                                                    {col.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>

                    {/* Split Button: + Add new | ⌵ (Screenshots 1 & 2) */}
                    <div className="flex items-center rounded-lg bg-slate-900 text-white shadow-sm">
                        {/* Main Button */}
                        <button
                            type="button"
                            onClick={() => setUploadModalOpen(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-black rounded-l-lg"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Add new</span>
                        </button>

                        {/* Divider */}
                        <div className="h-4 w-[1px] bg-slate-700" />

                        {/* Dropdown Chevron */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    type="button"
                                    className="px-2 py-1.5 text-white transition-colors hover:bg-black rounded-r-lg"
                                >
                                    <ChevronDown className="h-3.5 w-3.5 opacity-80" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                sideOffset={6}
                                className="w-48 p-1.5 shadow-xl border border-slate-200 bg-white text-slate-900 rounded-xl z-50"
                            >
                                <DropdownMenuItem
                                    onClick={() => setUploadModalOpen(true)}
                                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold cursor-pointer rounded-lg hover:bg-slate-100 text-slate-800"
                                >
                                    <Plus className="h-4 w-4 text-slate-500" />
                                    <span>Add new</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => router.push("/documents/import")}
                                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold cursor-pointer rounded-lg hover:bg-slate-100 text-slate-800"
                                >
                                    <Code2 className="h-4 w-4 text-slate-500" />
                                    <span>Import Metadata</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {/* Main Table Area with FIXED Sticky First Column */}
            <div ref={tableContainerRef} className="flex-1 overflow-x-auto overflow-y-auto relative bg-white">
                <table className="w-full border-separate border-spacing-0 text-left text-[13px]">
                    <thead className="sticky top-0 z-30 bg-white">
                        <tr className="bg-white text-[12.5px] font-medium text-slate-600 select-none">
                            {/* Checkbox column - Sticky */}
                            <th className="w-[48px] min-w-[48px] max-w-[48px] px-3.5 py-3 sticky top-0 left-0 z-40 bg-white border-b border-slate-200">
                                <input
                                    type="checkbox"
                                    checked={isAllRowsSelected}
                                    onChange={toggleSelectAllRows}
                                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400 cursor-pointer"
                                />
                            </th>

                            {/* Name column - FIXED / Sticky Horizontally & Vertically with crisp boundary line & elevation shadow */}
                            {visibleColumns.name && (
                                <th className="px-4 py-3 font-medium text-slate-700 min-w-[280px] max-w-[340px] sticky top-0 left-[48px] z-40 bg-white border-b border-r border-slate-200 shadow-[6px_0_16px_-3px_rgba(0,0,0,0.12),2px_0_6px_rgba(0,0,0,0.06)]">
                                    Name
                                </th>
                            )}

                            {/* Other Columns */}
                            {visibleColumns.type && (
                                <th className="px-4 py-3 font-medium text-slate-700 min-w-[140px] border-b border-slate-200">
                                    Type
                                </th>
                            )}
                            {visibleColumns.supplier && (
                                <th className="px-4 py-3 font-medium text-slate-700 min-w-[220px] border-b border-slate-200">
                                    <div className="flex items-center gap-1.5">
                                        <Building2 className="h-3.5 w-3.5 text-blue-500" />
                                        <span>Supplier</span>
                                    </div>
                                </th>
                            )}
                            {visibleColumns.sources && (
                                <th className="px-4 py-3 font-medium text-slate-700 min-w-[130px] border-b border-slate-200">
                                    <div className="flex items-center gap-1.5">
                                        <GitFork className="h-3.5 w-3.5 text-orange-500" />
                                        <span>Sources</span>
                                    </div>
                                </th>
                            )}
                            {visibleColumns.valid_from && (
                                <th className="px-4 py-3 font-medium text-slate-700 min-w-[120px] border-b border-slate-200">
                                    Valid from
                                </th>
                            )}
                            {visibleColumns.expires_at && (
                                <th className="px-4 py-3 font-medium text-slate-700 min-w-[120px] border-b border-slate-200">
                                    Expires at
                                </th>
                            )}
                            {visibleColumns.status && (
                                <th className="px-4 py-3 font-medium text-slate-700 min-w-[110px] border-b border-slate-200">
                                    Status
                                </th>
                            )}
                            {visibleColumns.created_by && (
                                <th className="px-4 py-3 font-medium text-slate-700 min-w-[140px] border-b border-slate-200">
                                    Created by
                                </th>
                            )}
                            {visibleColumns.created_via && (
                                <th className="px-4 py-3 font-medium text-slate-700 min-w-[140px] border-b border-slate-200">
                                    Created via
                                </th>
                            )}
                            {visibleColumns.created_at && (
                                <th className="px-4 py-3 font-medium text-slate-700 min-w-[140px] border-b border-slate-200">
                                    Created at
                                </th>
                            )}
                            {visibleColumns.reminder && (
                                <th className="px-4 py-3 font-medium text-slate-700 min-w-[160px] border-b border-slate-200">
                                    <div className="flex items-center gap-1.5">
                                        <Bell className="h-3.5 w-3.5 text-orange-500" />
                                        <span>Reminder</span>
                                    </div>
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={visibleColumnCount + 1} className="p-0 border-none">
                                    <div
                                        className="sticky left-0 flex items-center justify-center gap-2 py-28 text-center text-slate-400"
                                        style={{ width: containerWidth ? `${containerWidth}px` : "100%" }}
                                    >
                                        <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
                                        <span>Loading documents...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredDocs.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={visibleColumnCount + 1}
                                    className="p-0 border-none"
                                >
                                    <div
                                        className="sticky left-0 flex flex-col items-center justify-center py-28 text-center text-slate-500"
                                        style={{ width: containerWidth ? `${containerWidth}px` : "100%" }}
                                    >
                                        <div className="mx-auto flex max-w-sm flex-col items-center justify-center">
                                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                                <FileText className="h-6 w-6" />
                                            </div>
                                            <p className="text-sm font-semibold text-slate-700">
                                                No documents found
                                            </p>
                                            <p className="mt-1 text-xs text-slate-400">
                                                Click &quot;Add new&quot; to upload files or import metadata from spreadsheets.
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => setUploadModalOpen(true)}
                                                className="mt-4 rounded-xl bg-slate-900 hover:bg-black px-4 py-2 text-xs font-semibold text-white shadow"
                                            >
                                                Upload Document
                                            </button>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredDocs.map((doc) => {
                                const isSelected = selectedIds.has(doc.id);
                                const isExpired = doc.status?.toLowerCase() === "expired";

                                return (
                                    <tr
                                        key={doc.id}
                                        onClick={() => window.open(`/documents/${doc.id}/details`, "_blank")}
                                        className={cn(
                                            "hover:bg-slate-50/80 transition-colors group cursor-pointer",
                                            isSelected && "bg-slate-50"
                                        )}
                                    >
                                        {/* Checkbox - Sticky */}
                                        <td
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-[48px] min-w-[48px] max-w-[48px] px-3.5 py-2.5 sticky left-0 z-20 bg-white group-hover:bg-slate-50/80 border-b border-slate-100"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggleRowSelect(doc.id)}
                                                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400 cursor-pointer"
                                            />
                                        </td>

                                        {/* Name - FIXED Sticky First Column with Red PDF badge, border-r, elevation shadow, & 3-dots action menu */}
                                        {visibleColumns.name && (
                                            <td className="px-4 py-2 sticky left-[48px] z-20 bg-white group-hover:bg-slate-50/80 min-w-[280px] max-w-[340px] border-b border-r border-slate-200 shadow-[6px_0_16px_-3px_rgba(0,0,0,0.12),2px_0_6px_rgba(0,0,0,0.06)]">
                                                <div className="flex items-center justify-between gap-2 min-w-0">
                                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                                        {/* Red PDF Icon */}
                                                        <div className="flex h-5 w-4 shrink-0 items-center justify-center rounded-[2px] bg-red-600 text-[8px] font-black text-white uppercase shadow-xs">
                                                            PDF
                                                        </div>
                                                        <Link
                                                            href={`/documents/${doc.id}/details`}
                                                            target="_blank"
                                                            className="truncate font-medium text-slate-800 hover:text-blue-600 hover:underline"
                                                        >
                                                            {doc.name}
                                                        </Link>
                                                    </div>

                                                    {/* 3-Dots Action Dropdown Menu (Screenshot) */}
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="h-7 w-7 shrink-0 rounded-md border border-slate-200 bg-white p-1 text-slate-500 shadow-xs transition-colors hover:bg-slate-100 hover:text-slate-800 flex items-center justify-center outline-none"
                                                            >
                                                                <MoreVertical className="h-3.5 w-3.5" />
                                                            </button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent
                                                            align="start"
                                                            sideOffset={6}
                                                            className="w-48 p-1.5 shadow-2xl border border-slate-200 bg-white text-slate-900 rounded-xl z-50 animate-in fade-in-0 zoom-in-95"
                                                        >
                                                            {/* Open in new tab */}
                                                            <DropdownMenuItem
                                                                onClick={() => handleOpenInNewTab(doc)}
                                                                className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold cursor-pointer rounded-lg hover:bg-slate-100 text-slate-800"
                                                            >
                                                                <ExternalLink className="h-4 w-4 text-slate-600" />
                                                                <span>Open in new tab</span>
                                                            </DropdownMenuItem>

                                                            {/* Archive / Restore Document */}
                                                            <DropdownMenuItem
                                                                onClick={() => handleToggleArchive(doc)}
                                                                className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold cursor-pointer rounded-lg hover:bg-slate-100 text-slate-700"
                                                            >
                                                                <Archive className="h-4 w-4 text-slate-600" />
                                                                <span>{doc.archived ? "Restore Document" : "Archive Document"}</span>
                                                            </DropdownMenuItem>

                                                            <DropdownMenuSeparator />

                                                            {/* Delete Document */}
                                                            <DropdownMenuItem
                                                                onClick={() => handleDeleteSingleDoc(doc)}
                                                                className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold cursor-pointer rounded-lg hover:bg-red-50 text-red-700"
                                                            >
                                                                <Trash2 className="h-4 w-4 text-red-600" />
                                                                <span>Delete Document</span>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </td>
                                        )}

                                        {/* Type - Pill Badge (Screenshot) */}
                                        {visibleColumns.type && (
                                            <td className="px-4 py-2 border-b border-slate-100">
                                                {doc.type && doc.type !== "—" ? (
                                                    <span className="inline-block rounded-full border border-slate-200/90 bg-white px-3 py-0.5 text-xs font-medium text-slate-700 shadow-xs max-w-[130px] truncate">
                                                        {doc.type}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400">—</span>
                                                )}
                                            </td>
                                        )}

                                        {/* Supplier Badge with blue building icon (Screenshot) */}
                                        {visibleColumns.supplier && (
                                            <td className="px-4 py-2 border-b border-slate-100">
                                                {doc.supplierName && doc.supplierName !== "—" ? (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/70 px-3 py-0.5 text-xs font-medium text-blue-700 shadow-xs max-w-[200px] truncate">
                                                        <Building2 className="h-3 w-3 shrink-0 text-blue-500" />
                                                        <span className="truncate">{doc.supplierName}</span>
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400">—</span>
                                                )}
                                            </td>
                                        )}

                                        {/* Sources */}
                                        {visibleColumns.sources && (
                                            <td className="px-4 py-2 text-slate-600 text-xs font-mono border-b border-slate-100">
                                                {doc.sources && doc.sources !== "—" ? (
                                                    <span className="inline-flex items-center gap-1 text-slate-600">
                                                        <GitFork className="h-3 w-3 text-orange-500" />
                                                        <span>{doc.sources}</span>
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400">—</span>
                                                )}
                                            </td>
                                        )}

                                        {/* Valid from */}
                                        {visibleColumns.valid_from && (
                                            <td className="px-4 py-2 text-slate-600 border-b border-slate-100">
                                                {doc.validFrom || "—"}
                                            </td>
                                        )}

                                        {/* Expires at */}
                                        {visibleColumns.expires_at && (
                                            <td className={cn(
                                                "px-4 py-2 font-medium border-b border-slate-100",
                                                isExpired ? "text-red-600" : "text-slate-700"
                                            )}>
                                                {doc.expiresAt || "—"}
                                            </td>
                                        )}

                                        {/* Status */}
                                        {visibleColumns.status && (
                                            <td className="px-4 py-2 border-b border-slate-100">
                                                <div className="flex items-center gap-1.5">
                                                    <div
                                                        className={cn(
                                                            "h-2 w-2 rounded-full shrink-0",
                                                            doc.status?.toLowerCase() === "valid" && "bg-emerald-500",
                                                            doc.status?.toLowerCase() === "pending approval" && "bg-amber-500",
                                                            (doc.status?.toLowerCase() === "rejected" || doc.status?.toLowerCase() === "not valid" || doc.status?.toLowerCase() === "expired" || isExpired) && "bg-rose-500",
                                                            doc.status?.toLowerCase() === "non-existent" && "bg-slate-400",
                                                            (!doc.status || doc.status === "—") && "bg-slate-300"
                                                        )}
                                                    />
                                                    <span
                                                        className={cn(
                                                            "font-medium text-xs",
                                                            doc.status?.toLowerCase() === "valid" && "text-emerald-700",
                                                            doc.status?.toLowerCase() === "pending approval" && "text-amber-700",
                                                            (doc.status?.toLowerCase() === "rejected" || doc.status?.toLowerCase() === "not valid" || doc.status?.toLowerCase() === "expired" || isExpired) && "text-rose-700",
                                                            doc.status?.toLowerCase() === "non-existent" && "text-slate-600",
                                                            (!doc.status || doc.status === "—") && "text-slate-500"
                                                        )}
                                                    >
                                                        {doc.status || "Valid"}
                                                    </span>
                                                </div>
                                            </td>
                                        )}

                                        {/* Created by with Tacto Profile Popover */}
                                        {visibleColumns.created_by && (
                                            <td className="px-4 py-2 border-b border-slate-100">
                                                <CreatorProfileCell doc={doc} />
                                            </td>
                                        )}

                                        {/* Created via */}
                                        {visibleColumns.created_via && (
                                            <td className="px-4 py-2 text-xs text-slate-600 border-b border-slate-100">
                                                {doc.createdVia || "Direct Upload"}
                                            </td>
                                        )}

                                        {/* Created at */}
                                        {visibleColumns.created_at && (
                                            <td className="px-4 py-2 text-xs text-slate-500 border-b border-slate-100">
                                                {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : "—"}
                                            </td>
                                        )}

                                        {/* Reminder Column - Directly after Created at */}
                                        {visibleColumns.reminder && (
                                            <td
                                                className="px-4 py-2 border-b border-slate-100"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <ReminderCell
                                                    doc={doc}
                                                    isSending={!!sendingReminderMap[doc.id]}
                                                    onSendNow={handleSendReminderNow}
                                                    onOpenSchedule={handleOpenScheduleModal}
                                                    onCancelSchedule={handleCancelSchedule}
                                                />
                                            </td>
                                        )}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Bottom Footer Bar */}
            <div className="border-t border-slate-200/80 bg-white px-6 py-2 flex items-center justify-between">
                <span className="text-[12px] font-medium text-slate-500">
                    Documents: {filteredDocs.length}
                </span>
                {selectedIds.size > 0 && (
                    <span className="text-[12px] font-semibold text-slate-700">
                        {selectedIds.size} document(s) selected
                    </span>
                )}
            </div>

            {/* Floating Selection Bar & Actions Dropdown (matches Tacto screenshot) */}
            {selectedIds.size > 0 && (
                <div className="pointer-events-auto fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-2xl border border-slate-200/90 bg-white/95 p-1.5 shadow-2xl backdrop-blur supports-[backdrop-filter]:bg-white/90 animate-in fade-in slide-in-from-bottom-3 duration-200">
                    {/* Selected count badge with clear X */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-slate-800 bg-slate-100/80 border border-slate-200/80 rounded-xl select-none">
                        <span>{selectedIds.size} selected</span>
                        <button
                            type="button"
                            onClick={() => setSelectedIds(new Set())}
                            aria-label="Clear selection"
                            className="ml-1 p-0.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>

                    {/* Actions Menu Dropdown Trigger */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                className="flex items-center gap-2 px-3 py-1.5 text-[13px] font-medium text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-300"
                            >
                                <Command className="h-3.5 w-3.5 text-slate-700 stroke-[2.2]" />
                                <span>Actions</span>
                                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                            </button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                            align="end"
                            side="top"
                            sideOffset={8}
                            className="w-56 p-1.5 rounded-xl shadow-2xl border border-slate-200 bg-white text-slate-800 z-50 animate-in fade-in zoom-in-95 duration-150"
                        >
                            {/* Export Submenu */}
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger className="flex items-center justify-between px-3 py-2 text-[13px] text-slate-700 hover:text-slate-900 cursor-pointer rounded-lg hover:bg-slate-100 transition-colors">
                                    <div className="flex items-center gap-2.5">
                                        <Download className="h-4 w-4 text-slate-500" />
                                        <span>Export</span>
                                    </div>
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent
                                    sideOffset={8}
                                    className="w-56 p-1.5 rounded-xl shadow-xl border border-slate-200 bg-white"
                                >
                                    <DropdownMenuItem
                                        onClick={handleExportCSV}
                                        className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-slate-700 hover:text-slate-900 cursor-pointer rounded-lg hover:bg-slate-100"
                                    >
                                        <FileText className="h-4 w-4 text-slate-500" />
                                        <span>CSV</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={handleExportExcel}
                                        className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-slate-700 hover:text-slate-900 cursor-pointer rounded-lg hover:bg-slate-100"
                                    >
                                        <div className="h-4 w-4 rounded bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] leading-none shrink-0">
                                            X
                                        </div>
                                        <span>Microsoft Excel (.xlsx)</span>
                                    </DropdownMenuItem>
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>

                            <div className="h-px bg-slate-100 my-1" />

                            {/* Delete Option (replaces Archive as requested) */}
                            <DropdownMenuItem
                                onClick={() => setIsDeleteDialogOpen(true)}
                                className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer rounded-lg transition-colors font-medium"
                            >
                                <Trash2 className="h-4 w-4 text-red-500" />
                                <span>Delete</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}

            {/* Confirm Bulk Delete Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent className="rounded-2xl bg-white border border-slate-200 shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-base font-bold text-slate-900">
                            Delete {selectedIds.size} selected document{selectedIds.size !== 1 ? "s" : ""}?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm text-slate-500">
                            This action cannot be undone. The selected documents will be permanently removed from the system.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4 gap-2">
                        <AlertDialogCancel
                            disabled={isDeleting}
                            className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100"
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            disabled={isDeleting}
                            onClick={(e) => {
                                e.preventDefault();
                                handleConfirmBulkDelete();
                            }}
                            className="rounded-xl bg-red-600 text-white hover:bg-red-700 font-semibold flex items-center gap-1.5"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Deleting...</span>
                                </>
                            ) : (
                                <span>Delete</span>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Add New Documents Modal (Screenshot 4) */}
            <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
                <DialogContent className="sm:max-w-xl p-6 rounded-2xl bg-white border border-slate-200 shadow-2xl">
                    <DialogHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                        <DialogTitle className="text-base font-bold text-slate-900">
                            Add new documents
                        </DialogTitle>
                    </DialogHeader>

                    <div className="py-6">
                        {/* Drag and drop zone */}
                        <div
                            onDragOver={(e) => {
                                e.preventDefault();
                                setIsDragging(true);
                            }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={(e) => {
                                e.preventDefault();
                                setIsDragging(false);
                                if (e.dataTransfer.files) {
                                    handleFileUpload(e.dataTransfer.files);
                                }
                            }}
                            onClick={() => fileInputRef.current?.click()}
                            className={cn(
                                "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition-all cursor-pointer",
                                isDragging
                                    ? "border-slate-900 bg-slate-50"
                                    : "border-slate-200 bg-white hover:bg-slate-50/60"
                            )}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                className="hidden"
                                onChange={(e) => {
                                    if (e.target.files) {
                                        handleFileUpload(e.target.files);
                                    }
                                }}
                            />

                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                                {isUploading ? (
                                    <Loader2 className="h-6 w-6 animate-spin text-slate-700" />
                                ) : (
                                    <UploadCloud className="h-7 w-7 text-slate-600" />
                                )}
                            </div>

                            <p className="text-sm font-semibold text-slate-800">
                                {isUploading ? "Uploading files..." : "Click to upload files"} <span className="font-normal text-slate-500">or drag and drop here</span>
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                                You can upload files with a maximum size of 100 MB each.
                            </p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Schedule Reminder Modal */}
            <ScheduleReminderModal
                doc={scheduleModalDoc}
                isOpen={isScheduleModalOpen}
                onClose={() => {
                    setIsScheduleModalOpen(false);
                    setScheduleModalDoc(null);
                }}
                onScheduled={handleScheduleSuccess}
                onSendNow={handleSendReminderNow}
            />
        </div>
    );
}
