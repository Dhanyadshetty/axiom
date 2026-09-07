"use client";

import * as React from "react";
import * as XLSX from "xlsx";
import { useVirtualizer } from "@tanstack/react-virtual";
import { toast } from "sonner";
import {
    Search,
    Plus,
    Check,
    Download,
    UploadCloud,
    AlertTriangle,
    X,
    Columns3,
    ChevronDown,
    Warehouse,
    Building2,
    Filter,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuCheckboxItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { SupplierNameLink, MailLink } from "./links";
import {
    importSuppliersToAssessment,
    addExistingContactsToAssessment,
    getSupplierOptionsForFilter,
    getContactsForAddSuppliersGrid,
    saveDefaultSuppliersFromExcel,
    hasDefaultSuppliers,
} from "@/app/actions/supplier-import";
import { addSuppliersToAssessment } from "@/app/actions/assessments";

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

type RowSource = "existing" | "manual" | "imported";

type CandidateRow = {
    id: string;
    source: RowSource;
    contact: string;
    email: string;
    phone: string;
    supplierId: string | null;
    supplierName: string;
    supplierNumber?: string | null;
    language: string;
    department: string;
    position: string;
    responsibility: string;
    status: string;
    isNewSupplier: boolean;
    /** For highlight animation on newly added/updated rows */
    highlight?: boolean;
};

export type ConfirmedContact = { email: string; name: string | null };
export type ConfirmedSupplier = {
    supplierId: string | null;
    supplierName: string;
    isNew: boolean;
    contacts: ConfirmedContact[];
};

type ColumnKey =
    | "contact" | "email" | "phone" | "supplier" | "language"
    | "department" | "position" | "responsibility" | "status";

const COLUMNS: { key: ColumnKey; label: string; width: string }[] = [
    { key: "contact", label: "Contact", width: "minmax(160px, 1.2fr)" },
    { key: "email", label: "Email", width: "minmax(180px, 1.4fr)" },
    { key: "phone", label: "Phone Number", width: "130px" },
    { key: "supplier", label: "Supplier", width: "minmax(160px, 1fr)" },
    { key: "language", label: "Language", width: "100px" },
    { key: "department", label: "Department", width: "130px" },
    { key: "position", label: "Position", width: "130px" },
    { key: "responsibility", label: "Responsibility", width: "150px" },
    { key: "status", label: "Status", width: "110px" },
];

const STATUSES = ["Active", "Inactive"];

const TEMPLATE_HEADERS = ["Contact", "Email", "Phone number", "Supplier", "Language", "Department", "Position", "Responsibility", "Status"];

function newId() {
    return Math.random().toString(36).slice(2);
}

function normalizeKey(value: string | null | undefined): string {
    return (value ?? "").trim().replace(/\s+/g, " ").toLowerCase();
}

function dedupeKey(email: string, supplierId: string | null, supplierName: string): string {
    const sup = supplierId ?? `name:${normalizeKey(supplierName)}`;
    return `${normalizeKey(email)}::${sup}`;
}

function emptyManualRow(): Omit<CandidateRow, "id" | "isNewSupplier"> {
    return {
        source: "manual",
        contact: "",
        email: "",
        phone: "",
        supplierId: null,
        supplierName: "",
        language: "",
        department: "",
        position: "",
        responsibility: "",
        status: "Active",
    };
}

function sourceBadge(source: RowSource, isNewSupplier: boolean) {
    if (isNewSupplier) {
        return <Badge className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50">New</Badge>;
    }
    if (source === "manual") {
        return <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600">Manual</Badge>;
    }
    if (source === "imported") {
        return <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">Imported</Badge>;
    }
    return null;
}

/* -------------------------------------------------------------------------- */
/* Excel helpers                                                              */
/* -------------------------------------------------------------------------- */

function downloadTemplate() {
    const example = ["Jane Doe", "jane.doe@acme.com", "+65 1234 5678", "Acme Components Pte Ltd", "English", "Procurement", "Buyer", "Primary contact", "Active"];
    const ws = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS, example]);
    const wsAny = ws as unknown as Record<string, unknown>;
    wsAny["!cols"] = TEMPLATE_HEADERS.map(() => ({ wch: 22 }));
    wsAny["!dataValidation"] = [
        { sqref: "I2:I1000", type: "list", formula1: '"Active,Inactive"', allowBlank: true } as unknown,
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Suppliers");
    XLSX.writeFile(wb, "supplier-contacts-template.xlsx");
}

const COLUMN_ALIASES: Record<ColumnKey, RegExp[]> = {
    contact: [/contact/, /name/],
    email: [/email/, /mail/],
    phone: [/phone/, /tel/, /mobile/],
    supplier: [/supplier/, /company/, /vendor/, /account/],
    language: [/language/, /lang/],
    department: [/department/, /dept/],
    position: [/position/, /title/, /jobtitle/, /designation/],
    responsibility: [/responsibilit/],
    status: [/status/],
};

function normalizeHeader(value: string | null | undefined): string {
    return (value ?? "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

function findColumnIndex(header: string[], key: ColumnKey): number {
    const norm = header.map(normalizeHeader);
    for (let i = 0; i < norm.length; i++) {
        const h = norm[i];
        if (COLUMN_ALIASES[key].some((re) => re.test(h))) return i;
    }
    return -1;
}

function parseFile(file: File): Promise<{ supplierName: string; contact: string; email: string; phone: string; language: string; department: string; position: string; responsibility: string; status: string }[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const wb = XLSX.read(data, { type: "array" });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const matrix = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" }) as (string | number)[][];
                if (matrix.length < 2) { resolve([]); return; }
                const header = matrix[0].map((h) => String(h ?? ""));
                const idx: Record<ColumnKey, number> = {
                    contact: findColumnIndex(header, "contact"),
                    email: findColumnIndex(header, "email"),
                    phone: findColumnIndex(header, "phone"),
                    supplier: findColumnIndex(header, "supplier"),
                    language: findColumnIndex(header, "language"),
                    department: findColumnIndex(header, "department"),
                    position: findColumnIndex(header, "position"),
                    responsibility: findColumnIndex(header, "responsibility"),
                    status: findColumnIndex(header, "status"),
                };
                const out: { supplierName: string; contact: string; email: string; phone: string; language: string; department: string; position: string; responsibility: string; status: string }[] = [];
                for (let i = 1; i < matrix.length; i++) {
                    const row = matrix[i];
                    if (!row || row.every((c) => !String(c ?? "").trim())) continue;
                    const get = (i2: number) => (i2 >= 0 ? String(row[i2] ?? "").trim() : "");
                    out.push({
                        contact: get(idx.contact),
                        email: get(idx.email),
                        phone: get(idx.phone),
                        supplierName: get(idx.supplier),
                        language: get(idx.language),
                        department: get(idx.department),
                        position: get(idx.position),
                        responsibility: get(idx.responsibility),
                        status: ["Active", "Inactive"].includes(get(idx.status)) ? get(idx.status) : "Active",
                    });
                }
                resolve(out);
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(file);
    });
}

/* -------------------------------------------------------------------------- */
/* Entry control: "+ Add suppliers" + caret menu                              */
/* -------------------------------------------------------------------------- */

export function AddSuppliersControl({
    assessmentId,
    requestTitle,
    templateName,
    onAdded,
    onReconcile,
    onRollback,
}: {
    assessmentId: string;
    requestTitle?: string | null;
    templateName?: string | null;
    onAdded: (merged: ConfirmedSupplier[]) => void;
    onReconcile: () => void;
    onRollback: () => void;
}) {
    const [chooseOpen, setChooseOpen] = React.useState(false);
    const [listsOpen, setListsOpen] = React.useState(false);

    return (
        <>
            <div className="flex items-center gap-1">
                <Button className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setChooseOpen(true)}>
                    <Plus className="h-4 w-4" /> Add suppliers
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="px-2" aria-label="More options">
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setListsOpen(true)}>
                            <Warehouse className="mr-2 h-4 w-4" /> Supplier lists
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <UnifiedAddSuppliersModal open={chooseOpen} onOpenChange={setChooseOpen} assessmentId={assessmentId} requestTitle={requestTitle} templateName={templateName} onConfirmed={onAdded} onReconcile={onReconcile} onRollback={onRollback} />
            <SupplierListsFlow open={listsOpen} onOpenChange={setListsOpen} />
        </>
    );
}

/* -------------------------------------------------------------------------- */
/* Unified single-grid modal                                                  */
/* -------------------------------------------------------------------------- */

const STATUS_FILTERS = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "on_hold", label: "On hold" },
    { value: "all", label: "Any" },
];

function UnifiedAddSuppliersModal({
    open,
    onOpenChange,
    assessmentId,
    requestTitle,
    templateName,
    onConfirmed,
    onReconcile,
    onRollback,
}: {
    open: boolean;
    onOpenChange: (o: boolean) => void;
    assessmentId: string;
    requestTitle?: string | null;
    templateName?: string | null;
    onConfirmed: (merged: ConfirmedSupplier[]) => void;
    onReconcile: () => void;
    onRollback: () => void;
}) {
    const [rows, setRows] = React.useState<CandidateRow[]>([]);
    const [selected, setSelected] = React.useState<Set<string>>(new Set());
    const [search, setSearch] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState<string>("active");
    const [supplierFilter, setSupplierFilter] = React.useState<string>("all");
    const [languageFilter, setLanguageFilter] = React.useState<string>("");
    const [departmentFilter, setDepartmentFilter] = React.useState<string>("");
    const [hiddenCols, setHiddenCols] = React.useState<Set<ColumnKey>>(new Set());

    const [supplierOptions, setSupplierOptions] = React.useState<{ id: string; name: string | null }[]>([]);
    const [existingMap, setExistingMap] = React.useState<Map<string, { id: string; name: string | null }>>(new Map());
    const [, startTransition] = React.useTransition();

    const [manualOpen, setManualOpen] = React.useState(false);
    const [uploadOpen, setUploadOpen] = React.useState(false);
    const [existingSupplierOpen, setExistingSupplierOpen] = React.useState(false);
    const [saveAsDefaultOpen, setSaveAsDefaultOpen] = React.useState(false);
    const [hasDefaultSuppliersLoaded, setHasDefaultSuppliersLoaded] = React.useState(false);
    const [lastUploadedData, setLastUploadedData] = React.useState<{ supplierName: string; contact: string; email: string; phone: string; language: string; department: string; position: string; responsibility: string; status: string }[] | null>(null);
    const [activeTab, setActiveTab] = React.useState<"grid" | "existing-suppliers">("grid");
    const [existingSuppliers, setExistingSuppliers] = React.useState<{ supplierName: string; contacts: { contact: string; email: string; phone: string; language: string; department: string; position: string; responsibility: string; status: string }[] }[]>([]);
    const [existingSuppliersLoading, setExistingSuppliersLoading] = React.useState(false);
    const [existingSuppliersSaving, setExistingSuppliersSaving] = React.useState(false);

    const parentRef = React.useRef<HTMLDivElement>(null);

    // Load default contacts for the grid on modal open
    React.useEffect(() => {
        if (!open) return;
        let active = true;
        startTransition(async () => {
            const [contactsData, supplierOpts, hasDefaults] = await Promise.all([
                getContactsForAddSuppliersGrid({ status: "active", limit: 10000 }),
                getSupplierOptionsForFilter(),
                hasDefaultSuppliers(),
            ]);
            if (!active) return;
            const mappedRows: CandidateRow[] = contactsData.map((c) => ({
                id: `ex-${c.id}`,
                source: "existing",
                contact: c.name ?? "",
                email: c.email,
                phone: c.phone ?? "",
                supplierId: c.supplierId,
                supplierName: c.supplierName ?? "",
                supplierNumber: c.supplierNumber ?? null,
                language: c.language ?? "",
                department: c.department ?? "",
                position: c.position ?? "",
                responsibility: c.responsibility ?? "",
                status: c.status ?? "active",
                isNewSupplier: false,
            }));
            setRows(mappedRows);
            const m = new Map<string, { id: string; name: string | null }>();
            for (const o of supplierOpts) m.set(normalizeKey(o.name ?? ""), { id: o.id, name: o.name });
            setExistingMap(m);
            setSupplierOptions(supplierOpts);
            setHasDefaultSuppliersLoaded(hasDefaults);
        });
        return () => { active = false; };
    }, [open]);

    // Load Excel suppliers when tab is activated
    React.useEffect(() => {
        if (activeTab === "existing-suppliers" && existingSuppliers.length === 0) {
            loadExistingSuppliers();
        }
    }, [activeTab]);

    const loadExistingSuppliers = async () => {
        setExistingSuppliersLoading(true);
        try {
            // Call the server action to get default suppliers
            const { getDefaultSuppliersForGrid } = await import("@/app/actions/supplier-import");
            const data = await getDefaultSuppliersForGrid({ limit: 10000 });
            
            // Group by supplierName
            const grouped = new Map<string, { supplierName: string; contacts: any[] }>();
            for (const item of data) {
                if (!item.supplierName) continue;
                const key = item.supplierName.toLowerCase();
                if (!grouped.has(key)) {
                    grouped.set(key, { supplierName: item.supplierName, contacts: [] });
                }
                grouped.get(key)!.contacts.push({
                    contact: item.name,
                    email: item.email,
                    phone: item.phone,
                    language: item.language,
                    department: item.department,
                    position: item.position,
                    responsibility: item.responsibility,
                    status: item.status,
                });
            }
            setExistingSuppliers(Array.from(grouped.values()));
        } catch (error) {
            console.error("Failed to load existing suppliers:", error);
            toast.error("Failed to load existing suppliers");
        } finally {
            setExistingSuppliersLoading(false);
        }
    };

    const saveExistingSuppliers = async (updatedSuppliers: typeof existingSuppliers) => {
        setExistingSuppliersSaving(true);
        try {
            // Flatten the data for saving
            const flatData = updatedSuppliers.flatMap(supplier =>
                supplier.contacts.map(contact => ({
                    supplierName: supplier.supplierName,
                    contact: contact.contact,
                    email: contact.email,
                    phone: contact.phone,
                    language: contact.language,
                    department: contact.department,
                    position: contact.position,
                    responsibility: contact.responsibility,
                    status: contact.status,
                }))
            );
            
            const { saveDefaultSuppliersFromExcel } = await import("@/app/actions/supplier-import");
            const result = await saveDefaultSuppliersFromExcel(flatData);
            if (result.success) {
                toast.success(`Saved ${result.count} existing suppliers`);
                setExistingSuppliers(updatedSuppliers);
            } else {
                toast.error(result.error || "Failed to save existing suppliers");
            }
        } catch (error) {
            console.error("Failed to save existing suppliers:", error);
            toast.error("Failed to save existing suppliers");
        } finally {
            setExistingSuppliersSaving(false);
        }
    };

    // Append (deduped) candidate rows from manual / import / existing-supplier.
    // `select` controls whether the appended rows are pre-checked: bulk Excel
    // imports are NOT pre-checked (the user picks the few suppliers to add),
    // while deliberate single adds (manual / existing supplier) are.
    const mergeRows = React.useCallback((incoming: CandidateRow[], select = true) => {
        setRows((prev) => {
            const byKey = new Map(prev.map((r) => [dedupeKey(r.email, r.supplierId, r.supplierName), r]));
            const next = [...prev];
            for (const r of incoming) {
                const key = dedupeKey(r.email, r.supplierId, r.supplierName);
                const existing = byKey.get(key);
                if (existing) {
                    const idx = next.findIndex((x) => x.id === existing.id);
                    if (idx >= 0) next[idx] = { ...existing, ...r, id: existing.id, highlight: true };
                } else {
                    byKey.set(key, r);
                    next.push({ ...r, highlight: true });
                }
            }
            return next;
        });
        if (select) {
            setSelected((prev) => {
                const next = new Set(prev);
                incoming.forEach((r) => next.add(r.id));
                return next;
            });
        }
    }, []);

    // Clear highlight after animation completes
    React.useEffect(() => {
        const highlightedRows = rows.filter((r) => r.highlight);
        if (highlightedRows.length > 0) {
            const timer = setTimeout(() => {
                setRows((prev) => prev.map((r) => (r.highlight ? { ...r, highlight: false } : r)));
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [rows]);

    const addManual = (data: Omit<CandidateRow, "id" | "isNewSupplier">) => {
        const isNew = !existingMap.has(normalizeKey(data.supplierName));
        mergeRows([{ ...data, id: newId(), isNewSupplier: isNew && !data.supplierId }]);
        toast.success("Added to the grid");
    };

    const addImported = (parsed: { supplierName: string; contact: string; email: string; phone: string; language: string; department: string; position: string; responsibility: string; status: string }[]) => {
        const mapped: CandidateRow[] = parsed.map((p) => {
            const isNew = !existingMap.has(normalizeKey(p.supplierName));
            return {
                id: newId(),
                source: "imported",
                contact: p.contact,
                email: p.email,
                phone: p.phone,
                supplierId: null,
                supplierName: p.supplierName,
                language: p.language,
                department: p.department,
                position: p.position,
                responsibility: p.responsibility,
                status: p.status,
                isNewSupplier: isNew,
            };
        });
        mergeRows(mapped, false);
        
        // Auto-save as default suppliers for future use
        const flatData = parsed.map(p => ({
            supplierName: p.supplierName,
            contact: p.contact,
            email: p.email,
            phone: p.phone,
            language: p.language,
            department: p.department,
            position: p.position,
            responsibility: p.responsibility,
            status: p.status,
        }));
        
        // Save in background
        import("@/app/actions/supplier-import").then(({ saveDefaultSuppliersFromExcel }) => {
            saveDefaultSuppliersFromExcel(flatData).then(result => {
                if (result.success) {
                    toast.success(`Saved ${result.count} suppliers as default for future requests`);
                }
            }).catch(() => {
                // Silent fail - user can manually save if needed
            });
        });
        
        // Show import summary
        const newSuppliers = new Set(mapped.map((r) => normalizeKey(r.supplierName)).filter(Boolean)).size;
        toast.success(`Parsed ${mapped.length} row(s) across ${newSuppliers} supplier(s)`);
    };

    const addExistingSupplier = (supplierId: string, supplierName: string) => {
        mergeRows([{
            id: newId(),
            source: "imported",
            contact: "",
            email: "",
            phone: "",
            supplierId,
            supplierName,
            language: "",
            department: "",
            position: "",
            responsibility: "",
            status: "Active",
            isNewSupplier: false,
        }]);
        toast.success("Added supplier to the grid");
    };

    // Filtering for the grid.
    const q = search.trim().toLowerCase();
    const filtered = React.useMemo(() => {
        return rows.filter((r) => {
            if (supplierFilter !== "all" && r.supplierId !== supplierFilter) return false;
            if (statusFilter !== "all" && normalizeKey(r.status) !== statusFilter) return false;
            if (languageFilter && !normalizeKey(r.language).includes(normalizeKey(languageFilter))) return false;
            if (departmentFilter && !normalizeKey(r.department).includes(normalizeKey(departmentFilter))) return false;
            if (!q) return true;
            return (
                (r.contact ?? "").toLowerCase().includes(q) ||
                (r.email ?? "").toLowerCase().includes(q) ||
                (r.phone ?? "").toLowerCase().includes(q) ||
                (r.supplierName ?? "").toLowerCase().includes(q) ||
                (r.language ?? "").toLowerCase().includes(q) ||
                (r.department ?? "").toLowerCase().includes(q) ||
                (r.position ?? "").toLowerCase().includes(q) ||
                (r.responsibility ?? "").toLowerCase().includes(q)
            );
        });
    }, [rows, supplierFilter, statusFilter, languageFilter, departmentFilter, q]);

    const visibleColumns = COLUMNS.filter((c) => !hiddenCols.has(c.key));
    const gridTemplate = `40px ${visibleColumns.map((c) => c.width).join(" ")}`;

    const selectedVisible = filtered.filter((r) => selected.has(r.id));
    const allVisibleSelected = filtered.length > 0 && filtered.every((r) => selected.has(r.id));
    const someVisibleSelected = selectedVisible.length > 0 && !allVisibleSelected;

    const toggle = (id: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };
    const toggleAll = () => {
        setSelected((prev) => {
            if (allVisibleSelected) {
                const next = new Set(prev);
                filtered.forEach((r) => next.delete(r.id));
                return next;
            }
            const next = new Set(prev);
            filtered.forEach((r) => next.add(r.id));
            return next;
        });
    };

    const rowVirtualizer = useVirtualizer({
        count: filtered.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 44,
        overscan: 14,
    });

    const handleConfirm = () => {
        const chosen = rows.filter((r) => selected.has(r.id));
        if (chosen.length === 0) {
            toast.error("Select at least one contact to add");
            return;
        }

        // Separate existing contacts (source === "existing" with supplierId) from new/manual/imported/default rows
        const existingContacts = chosen
            .filter((r) => r.source === "existing" && r.contact && r.supplierId)
            .map((r) => ({ contactId: r.id.replace(/^ex-/, ""), supplierId: r.supplierId as string }));
        const supplierOnly = chosen
            .filter((r) => !r.contact.trim() && r.supplierId)
            .map((r) => r.supplierId as string);
        // Include default suppliers from Excel (source === "existing" but supplierId === null) in newRows
        const newRows = chosen.filter((r) => (r.source !== "existing" || !r.supplierId) && r.contact.trim());

        // Build optimistic payload for the parent (grouped by supplier).
        const grouped = new Map<string, ConfirmedSupplier>();
        for (const r of chosen) {
            const key = r.supplierId ?? `name:${normalizeKey(r.supplierName)}`;
            if (!grouped.has(key)) {
                grouped.set(key, {
                    supplierId: r.supplierId,
                    supplierName: r.supplierName,
                    isNew: !r.supplierId,
                    contacts: [],
                });
            }
            if (r.contact.trim() || r.email.trim()) {
                grouped.get(key)!.contacts.push({ email: r.email, name: r.contact || null });
            }
        }
        const merged = Array.from(grouped.values());

        // Optimistic: merge into the parent's local state immediately and close.
        // The server write happens in the background; we reconcile or roll back.
        onConfirmed(merged);
        onOpenChange(false);

        void (async () => {
            let ok = true;
            let errMsg = "";
            try {
                // 1. Link existing contacts to the assessment request
                if (existingContacts.length) {
                    const res = await addExistingContactsToAssessment(assessmentId, existingContacts);
                    if (!res.success) { ok = false; errMsg = res.error || "Failed to add existing contacts"; }
                }
                // 2. Add supplier-only rows (no contact) as participants
                if (ok && supplierOnly.length) {
                    const res = await addSuppliersToAssessment(assessmentId, supplierOnly);
                    if (!res.success) { ok = false; errMsg = res.error || "Failed to add suppliers"; }
                }
                // 3. For new rows (manual/imported), create permanent Contact + Supplier records
                //    and link them as participants. This persists the contacts to the org DB.
                if (ok && newRows.length) {
                    const payload = Array.from(
                        newRows.reduce((m, r) => {
                            const k = normalizeKey(r.supplierName) || newId();
                            if (!m.has(k)) m.set(k, { supplierName: r.supplierName || "(unnamed)", status: "active", contacts: [] as { contact: string; email: string; phone: string; language: string; department: string; position: string; responsibility: string; status: string }[] });
                            m.get(k)!.contacts.push({ contact: r.contact, email: r.email, phone: r.phone, language: r.language, department: r.department, position: r.position, responsibility: r.responsibility, status: r.status });
                            return m;
                        }, new Map<string, { supplierName: string; status: string; contacts: { contact: string; email: string; phone: string; language: string; department: string; position: string; responsibility: string; status: string }[] }>()).values()
                    );
                    const res = await importSuppliersToAssessment(assessmentId, payload);
                    if (!res.success) { ok = false; errMsg = res.error || "Failed to import suppliers"; }
                }
            } catch (_e) {
                ok = false;
                errMsg = "Failed to save suppliers";
            }
            if (ok) {
                toast.success(`${chosen.length} contacts added to this request.`);
                onReconcile();
            } else {
                onRollback();
                toast.error(errMsg || "Failed to add suppliers");
            }
        })();
    };

    const cellTitle = (r: CandidateRow, key: ColumnKey): string => {
        if (key === "email") return r.email;
        if (key === "supplier") return r.supplierName;
        if (key === "contact") return r.contact;
        return (r as unknown as Record<string, string>)[key] || "";
    };

    const renderCell = (r: CandidateRow, key: ColumnKey) => {
        if (key === "email") return r.email ? <MailLink email={r.email} /> : <span className="italic text-slate-400">—</span>;
        if (key === "supplier") {
            // Prefer the internal supplier UUID; fall back to the human-readable
            // supplier number (e.g. "PMA-9001") so Excel-imported rows still
            // link to the supplier overview page.
            const linkRef = r.supplierId || r.supplierNumber;
            if (linkRef) return <SupplierNameLink id={linkRef} name={r.supplierName || "Unnamed"} />;
            return <span className="text-slate-700">{r.supplierName || "—"}</span>;
        }
        if (key === "status") return <Badge variant="outline" className={normalizeKey(r.status) === "active" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-600"}>{r.status}</Badge>;
        if (key === "contact" && !r.contact.trim()) return <span className="italic text-slate-400">Supplier only</span>;
        const value = (r as unknown as Record<string, string>)[key];
        return <span className="text-slate-700">{value || "—"}</span>;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[92vh] max-w-6xl flex-col overflow-hidden p-0">
                <DialogHeader className="border-b border-slate-200 px-5 py-3">
                    <DialogTitle>Add suppliers</DialogTitle>
                    <DialogDescription>
                        {requestTitle ? (
                            <span>
                                Inviting to <span className="font-semibold text-slate-700">{requestTitle}</span>
                                {templateName ? <span className="text-slate-400"> · {templateName}</span> : null}
                                {" — "}
                            </span>
                        ) : null}
                        Choose contacts from the grid. Add manually, import from Excel, or filter by supplier — every row lands in the same table.
                    </DialogDescription>
                </DialogHeader>

                {/* Tab Bar */}
                <div className="flex border-b border-slate-200 px-5">
                    <button
                        onClick={() => setActiveTab("grid")}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === "grid"
                                ? "border-emerald-600 text-emerald-600"
                                : "border-transparent text-slate-500 hover:text-slate-700"
                        }`}
                    >
                        Add Contacts
                    </button>
                    <button
                        onClick={() => setActiveTab("existing-suppliers")}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === "existing-suppliers"
                                ? "border-emerald-600 text-emerald-600"
                                : "border-transparent text-slate-500 hover:text-slate-700"
                        }`}
                    >
                        Existing Suppliers
                        {existingSuppliers.length > 0 && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-emerald-100 text-emerald-700 rounded-full">
                                {existingSuppliers.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Filter bar */}
                <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-5 py-3">
                    <FilterChip label="Supplier" onRemove={supplierFilter !== "all" ? () => setSupplierFilter("all") : undefined}>
                        <Select value={supplierFilter} onValueChange={setSupplierFilter}>
                            <SelectTrigger className="h-8 w-48 border-0 bg-transparent p-0 shadow-none focus:ring-0">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                {supplierOptions.map((s) => (
                                    <SelectItem key={s.id} value={s.id}>{s.name ?? "Unnamed"}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FilterChip>

                    <FilterChip label="Status" dot onRemove={statusFilter !== "active" ? () => setStatusFilter("active") : undefined}>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="h-8 w-36 border-0 bg-transparent p-0 shadow-none focus:ring-0">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {STATUS_FILTERS.map((s) => (
                                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FilterChip>

                    {languageFilter ? (
                        <FilterChip label="Language" onRemove={() => setLanguageFilter("")}>
                            <Input value={languageFilter} onChange={(e) => setLanguageFilter(e.target.value)} className="h-7 w-32 border-0 bg-transparent p-0 shadow-none focus:ring-0" placeholder="Language" />
                        </FilterChip>
                    ) : null}
                    {departmentFilter ? (
                        <FilterChip label="Department" onRemove={() => setDepartmentFilter("")}>
                            <Input value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} className="h-7 w-32 border-0 bg-transparent p-0 shadow-none focus:ring-0" placeholder="Department" />
                        </FilterChip>
                    ) : null}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="gap-1.5 text-slate-600">
                                <Filter className="h-3.5 w-3.5" /> Add filter
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            {!languageFilter ? <DropdownMenuItem onClick={() => setLanguageFilter(" ")}>Language</DropdownMenuItem> : null}
                            {!departmentFilter ? <DropdownMenuItem onClick={() => setDepartmentFilter(" ")}>Department</DropdownMenuItem> : null}
                            {languageFilter && departmentFilter ? <DropdownMenuItem disabled>All filters added</DropdownMenuItem> : null}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="ml-auto flex items-center gap-2">
                        <div className="relative w-56">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="pl-9" />
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-1.5">
                                    <Columns3 className="h-3.5 w-3.5" /> Columns {COLUMNS.length - hiddenCols.size}/{COLUMNS.length}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {COLUMNS.map((c) => (
                                    <DropdownMenuCheckboxItem
                                        key={c.key}
                                        checked={!hiddenCols.has(c.key)}
                                        onCheckedChange={(v) => setHiddenCols((prev) => {
                                            const next = new Set(prev);
                                            if (v) next.delete(c.key);
                                            else next.add(c.key);
                                            return next;
                                        })}
                                    >
                                        {c.label}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white" size="sm">
                                    <Plus className="h-4 w-4" /> Add
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setManualOpen(true)}>
                                    <Plus className="mr-2 h-4 w-4" /> Add contact manually
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setUploadOpen(true)}>
                                    <UploadCloud className="mr-2 h-4 w-4" /> Upload Excel
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setExistingSupplierOpen(true)}>
                                    <Building2 className="mr-2 h-4 w-4" /> Add existing supplier
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={downloadTemplate}>
                                    <Download className="mr-2 h-4 w-4" /> Download template
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Grid */}
                <div className="flex min-h-0 flex-1 flex-col px-5 py-3">
                    <div className="overflow-hidden rounded-xl border border-slate-200">
                        <div
                            ref={parentRef}
                            className="max-h-[46vh] overflow-auto"
                        >
                            <div style={{ minWidth: 1180 }}>
                                {/* sticky header */}
                                <div
                                    className="sticky top-0 z-10 grid border-b border-slate-200 bg-slate-50 text-xs font-black uppercase tracking-wider text-slate-500"
                                    style={{ gridTemplateColumns: gridTemplate }}
                                >
                                    <div className="flex items-center justify-center px-2 py-2.5">
                                        <button onClick={toggleAll} className={`flex h-5 w-5 items-center justify-center rounded border ${allVisibleSelected ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300"}`} aria-label="Select all visible">
                                            {allVisibleSelected ? <Check className="h-3.5 w-3.5" /> : (someVisibleSelected ? <span className="h-2 w-2 rounded-sm bg-emerald-500" /> : null)}
                                        </button>
                                    </div>
                                    {visibleColumns.map((c) => (
                                        <div key={c.key} className="px-3 py-2.5 text-left">{c.label}</div>
                                    ))}
                                </div>

                                {filtered.length === 0 ? (
                                    <div className="px-4 py-10 text-center text-sm text-slate-400">
                                        {rows.length === 0
                                            ? "No contacts yet — upload an Excel file or add a contact manually to populate the grid."
                                            : "No rows match your filters."}
                                    </div>
                                ) : (
                                    <div style={{ height: rowVirtualizer.getTotalSize(), position: "relative" }}>
{rowVirtualizer.getVirtualItems().map((vi) => {
                                                const r = filtered[vi.index];
                                                const checked = selected.has(r.id);
                                                return (
                                                    <div
                                                        key={r.id}
                                                        className={`absolute left-0 top-0 grid w-full items-center border-b border-slate-100 text-sm transition-all duration-1000 ${checked ? "bg-emerald-50/40" : "hover:bg-slate-50/70"} ${r.highlight ? "bg-emerald-100/50" : ""}`}
                                                        style={{ gridTemplateColumns: gridTemplate, height: vi.size, transform: `translateY(${vi.start}px)` }}
                                                    >
                                                    <div className="flex items-center justify-center px-2">
                                                        <button onClick={() => toggle(r.id)} className={`flex h-5 w-5 items-center justify-center rounded border ${checked ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300"}`} aria-label="Select row">
                                                            {checked ? <Check className="h-3.5 w-3.5" /> : null}
                                                        </button>
                                                    </div>
                                                    {visibleColumns.map((c) => {
                                                        const title = cellTitle(r, c.key);
                                                        return (
                                                            <div key={c.key} className="flex min-w-0 items-center gap-2 overflow-hidden px-3 py-1.5" title={title}>
                                                                {c.key === "contact" ? (
                                                                    <>
                                                                        <span className="min-w-0 truncate text-slate-700">{r.contact.trim() ? r.contact : "Supplier only"}</span>
                                                                        {sourceBadge(r.source, r.isNewSupplier)}
                                                                    </>
                                                                ) : (
                                                                    <span className="block min-w-0 truncate">{renderCell(r, c.key)}</span>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <p className="mt-2 text-xs text-slate-400">
                        Rows: {rows.length} of {rows.length}
                        {selected.size ? ` · ${selected.size} selected` : ""}
                    </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-slate-200 bg-white px-5 py-3">
                    <span className="text-sm font-medium text-slate-600">{selected.size} selected</span>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button onClick={handleConfirm} disabled={selected.size === 0} className="bg-slate-900 hover:bg-slate-800 text-white">
                            {`Add contacts${selected.size ? ` (${selected.size})` : ""}`}
                        </Button>
                    </div>
                </div>
            </DialogContent>

            <ManualAddDialog open={manualOpen} onOpenChange={setManualOpen} onAdd={addManual} existingMap={existingMap} />
            <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} onParsed={addImported} onSaveAsDefault={(parsed) => { setLastUploadedData(parsed); setSaveAsDefaultOpen(true); }} />
            <SaveAsDefaultDialog open={saveAsDefaultOpen} onOpenChange={setSaveAsDefaultOpen} parsedData={lastUploadedData || []} onConfirm={async (data) => { const res = await saveDefaultSuppliersFromExcel(data); if (res.success) { setHasDefaultSuppliersLoaded(true); toast.success(`Saved ${res.count} default suppliers`); setRows([]); /* Will reload on next open */ } else { toast.error(res.error || "Failed to save"); } }} />
            <ExistingSupplierDialog open={existingSupplierOpen} onOpenChange={setExistingSupplierOpen} supplierOptions={supplierOptions} onAdd={addExistingSupplier} />
        </Dialog>
    );
}

function FilterChip({
    label,
    dot,
    onRemove,
    children,
}: {
    label: string;
    dot?: boolean;
    onRemove?: () => void;
    children: React.ReactNode;
}) {
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-2.5 py-1 text-sm text-slate-700">
            <span className="font-medium text-slate-500">{label}</span>
            {dot ? <span className="h-2 w-2 rounded-full bg-emerald-500" /> : null}
            {children}
            {onRemove ? (
                <button onClick={onRemove} className="ml-1 rounded-full p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="Remove filter">
                    <X className="h-3.5 w-3.5" />
                </button>
            ) : null}
        </span>
    );
}

/* -------------------------------------------------------------------------- */
/* Manual add dialog                                                          */
/* -------------------------------------------------------------------------- */

function ManualAddDialog({
    open,
    onOpenChange,
    onAdd,
    existingMap,
}: {
    open: boolean;
    onOpenChange: (o: boolean) => void;
    onAdd: (data: Omit<CandidateRow, "id" | "isNewSupplier">) => void;
    existingMap: Map<string, { id: string; name: string | null }>;
}) {
    const [row, setRow] = React.useState<Omit<CandidateRow, "id" | "isNewSupplier">>(emptyManualRow());
    React.useEffect(() => { if (open) setRow(emptyManualRow()); }, [open]);

    const set = (field: ColumnKey, value: string) => setRow((prev) => {
        // Map "supplier" column key to "supplierName" field
        const actualField = field === "supplier" ? "supplierName" : field;
        return { ...prev, [actualField]: value };
    });

    const submit = () => {
        if (!row.contact.trim() || !row.supplierName.trim()) {
            toast.error("Add at least a contact name and supplier");
            return;
        }
        const known = existingMap.get(normalizeKey(row.supplierName));
        onAdd({ ...row, supplierId: known?.id ?? null });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Add contact manually</DialogTitle>
                    <DialogDescription>New suppliers and contacts are appended to the grid and pre-checked.</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {COLUMNS.map((c) => (
                        <div key={c.key} className="space-y-1">
                            <label className="text-xs font-medium text-slate-600">{c.label}{c.key === "contact" || c.key === "email" || c.key === "supplier" ? " *" : ""}</label>
                            {c.key === "status" ? (
                                <Select value={row.status} onValueChange={(v) => set("status", v)}>
                                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Input value={c.key === "supplier" ? row.supplierName : (row as unknown as Record<string, string>)[c.key]} onChange={(e) => set(c.key, e.target.value)} className="h-9" placeholder={c.label} />
                            )}
                        </div>
                    ))}
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={submit} className="bg-emerald-600 hover:bg-emerald-700 text-white">Add to grid</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

/* -------------------------------------------------------------------------- */
/* Upload Excel dialog (merges into the shared grid)                          */
/* -------------------------------------------------------------------------- */

interface UploadDialogProps {
    open: boolean;
    onOpenChange: (o: boolean) => void;
    onParsed: (rows: { supplierName: string; contact: string; email: string; phone: string; language: string; department: string; position: string; responsibility: string; status: string }[]) => void;
    onSaveAsDefault?: (rows: { supplierName: string; contact: string; email: string; phone: string; language: string; department: string; position: string; responsibility: string; status: string }[]) => void;
}

function UploadDialog({
    open,
    onOpenChange,
    onParsed,
    onSaveAsDefault,
}: UploadDialogProps) {
    const [processing, setProcessing] = React.useState(false);

    React.useEffect(() => { if (!open) setProcessing(false); }, [open]);

    const handleFile = (file: File) => {
        setProcessing(true);
        window.setTimeout(() => {
            parseFile(file)
                .then((parsed) => {
                    setProcessing(false);
                    if (parsed.length === 0) {
                        toast.error("No rows found in the file");
                        return;
                    }
                    const suppliers = new Set(parsed.map((p) => normalizeKey(p.supplierName)).filter(Boolean));
                    toast.success(`Parsed ${parsed.length} row(s) across ${suppliers.size} supplier(s)`);
                    onParsed(parsed);
                    // Close the dialog after successful parse
                    onOpenChange(false);
                    // If there's a save-as-default callback, open that dialog
                    if (onSaveAsDefault) {
                        // Small delay to let the upload dialog close first
                        setTimeout(() => onSaveAsDefault(parsed), 100);
                    }
                })
                .catch(() => {
                    setProcessing(false);
                    toast.error("Could not parse the Excel file");
                });
        }, 350);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Upload Excel</DialogTitle>
                    <DialogDescription>Headers are detected automatically. Parsed rows are merged into the grid.</DialogDescription>
                </DialogHeader>
                <label className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors ${processing ? "border-amber-400 bg-amber-50" : "border-slate-300 bg-white hover:border-emerald-400 hover:bg-emerald-50/40"}`}>
                    {processing ? (
                        <>
                            <UploadCloud className="h-7 w-7 text-amber-500" />
                            <p className="text-sm font-semibold text-amber-700">Processing file…</p>
                        </>
                    ) : (
                        <>
                            <UploadCloud className="h-7 w-7 text-slate-400" />
                            <p className="text-sm font-medium text-slate-600">Click to upload an Excel file</p>
                            <p className="text-xs text-slate-400">.xlsx / .xls — headers are detected automatically</p>
                        </>
                    )}
                    <input type="file" accept=".xlsx,.xls" className="hidden" disabled={processing} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
                </label>
                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
                    Template headers: {TEMPLATE_HEADERS.join(", ")}.
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={downloadTemplate}>
                        <Download className="h-4 w-4" /> Download template
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

/* -------------------------------------------------------------------------- */
/* Save as Default Suppliers dialog                                           */
/* -------------------------------------------------------------------------- */

function SaveAsDefaultDialog({
    open,
    onOpenChange,
    parsedData,
    onConfirm,
}: {
    open: boolean;
    onOpenChange: (o: boolean) => void;
    parsedData: { supplierName: string; contact: string; email: string; phone: string; language: string; department: string; position: string; responsibility: string; status: string }[];
    onConfirm: (data: { supplierName: string; contact: string; email: string; phone: string; language: string; department: string; position: string; responsibility: string; status: string }[]) => void;
}) {
    const [saving, setSaving] = React.useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            // Convert parsed data to DefaultSupplierContact format
            const defaultData = parsedData.map(p => ({
                contact: p.contact,
                email: p.email,
                phone: p.phone,
                language: p.language,
                department: p.department,
                position: p.position,
                responsibility: p.responsibility,
                status: p.status,
                supplierName: p.supplierName,
            }));
            await onConfirm(defaultData);
            onOpenChange(false);
            toast.success("Default suppliers saved successfully");
        } catch {
            toast.error("Failed to save default suppliers");
        } finally {
            setSaving(false);
        }
    };

    const supplierCount = new Set(parsedData.map(p => normalizeKey(p.supplierName)).filter(Boolean)).size;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Save as Default Suppliers</DialogTitle>
                    <DialogDescription>
                        This will replace the current default suppliers list. The uploaded {parsedData.length} contact(s) across {supplierCount} supplier(s) will be available in the grid for all future assessment requests.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
                        <p className="font-medium text-slate-700">Preview of data to save:</p>
                        <ul className="mt-2 space-y-1 max-h-40 overflow-auto">
                            {parsedData.slice(0, 10).map((p, i) => (
                                <li key={i} className="text-xs text-slate-600 flex items-center gap-2">
                                    <span className="w-6 text-slate-400">{i + 1}.</span>
                                    <span>{p.supplierName}</span>
                                    <span className="text-slate-400">—</span>
                                    <span>{p.contact || p.email}</span>
                                </li>
                            ))}
                            {parsedData.length > 10 && (
                                <li className="text-xs text-slate-400">… and {parsedData.length - 10} more</li>
                            )}
                        </ul>
                    </div>
                    <p className="text-xs text-amber-600 bg-amber-50 rounded p-2">
                        ⚠ This will overwrite any previously saved default suppliers. This action cannot be undone.
                    </p>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
                    <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        {saving ? "Saving…" : "Save as Default"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

/* -------------------------------------------------------------------------- */
/* Add existing supplier dialog                                              */
/* -------------------------------------------------------------------------- */

function ExistingSupplierDialog({
    open,
    onOpenChange,
    supplierOptions,
    onAdd,
}: {
    open: boolean;
    onOpenChange: (o: boolean) => void;
    supplierOptions: { id: string; name: string | null }[];
    onAdd: (supplierId: string, supplierName: string) => void;
}) {
    const [supplierId, setSupplierId] = React.useState<string>("");
    React.useEffect(() => { if (open) setSupplierId(""); }, [open]);

    const submit = () => {
        if (!supplierId) { toast.error("Select a supplier"); return; }
        const opt = supplierOptions.find((s) => s.id === supplierId);
        onAdd(supplierId, opt?.name ?? "");
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Add existing supplier</DialogTitle>
                    <DialogDescription>Adds the supplier to the request without a contact; assign one later in Participants.</DialogDescription>
                </DialogHeader>
                <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Supplier</label>
                    <Select value={supplierId} onValueChange={setSupplierId}>
                        <SelectTrigger className="h-9"><SelectValue placeholder="Select a supplier" /></SelectTrigger>
                        <SelectContent>
                            {supplierOptions.map((s) => (
                                <SelectItem key={s.id} value={s.id}>{s.name ?? "Unnamed"}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={submit} className="bg-emerald-600 hover:bg-emerald-700 text-white">Add supplier</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

/* -------------------------------------------------------------------------- */
/* Supplier lists (caret menu)                                                */
/* -------------------------------------------------------------------------- */

function SupplierListsFlow({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
    const [creating, setCreating] = React.useState(false);

    return (
        <>
            <Dialog open={open && !creating} onOpenChange={(o) => { if (!o) onOpenChange(false); }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Supplier lists</DialogTitle>
                        <DialogDescription>Reuse saved groups of contacts in RFQs and Requests.</DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
                        <Warehouse className="h-9 w-9 text-slate-300" />
                        <p className="text-sm font-semibold text-slate-700">No Supplier lists found</p>
                        <p className="text-xs text-slate-400">
                            Create a Supplier list to save Contacts and use them in RFQs and Requests. You can group by category, region, or more with lists.
                        </p>
                        <div className="mt-1 flex gap-2">
                            <Button variant="ghost" onClick={() => onOpenChange(false)}>Dismiss</Button>
                            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setCreating(true)}>
                                Create Supplier list <span aria-hidden>↗</span>
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <CreateListDialog open={creating} onOpenChange={(o) => { setCreating(o); if (!o) onOpenChange(false); }} />
        </>
    );
}

function CreateListDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
    const [name, setName] = React.useState("");
    const [description, setDescription] = React.useState("");

    React.useEffect(() => { if (open) { setName(""); setDescription(""); } }, [open]);

    const submit = () => {
        if (!name.trim()) {
            toast.error("Enter a list name");
            return;
        }
        toast.success(`Supplier list "${name.trim()}" created`);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Create new list</DialogTitle>
                    <DialogDescription>Save a reusable group of supplier contacts.</DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Name</label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} className="h-9" placeholder="e.g. APAC Electronics" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Description</label>
                        <Input value={description} onChange={(e) => setDescription(e.target.value)} className="h-9" placeholder="Optional" />
                    </div>
                    <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                        <p>Add contacts to supplier list — to add additional contacts to the list, please go to the suppliers page and select them there.</p>
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={submit} className="bg-emerald-600 hover:bg-emerald-700 text-white">Add</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
