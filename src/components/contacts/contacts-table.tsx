'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Plus,
    Search,
    ChevronDown,
    ChevronUp,
    Check,
    MoreHorizontal,
    MoreVertical,
    UserX,
    Pencil,
    Trash2,
    Archive,
    PowerOff,
    Phone,
    X,
    Building2,
    Languages,
    Info,
    RotateCcw,
    UserPlus,
    Upload,
    Send,
    Handshake,
    Download,
    FilePlus2,
    FileText,
    FileSpreadsheet,
    Command,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import {
    CONTACT_COLUMNS,
    type ContactColumnKey,
    type ContactStatus,
} from '@/components/contacts/contacts-schema';
import {
    listContacts,
    deleteContact,
    bulkDeleteContacts,
    updateContactStatus,
    type ContactRow,
} from '@/app/actions/contacts-detail';

import { AddContactModal } from '@/components/contacts/add-contact-modal';
import { CreateRequestModal } from '@/components/assessments/create-request-modal';
import { AddToExistingRequestModal } from '@/components/assessments/add-to-existing-request-modal';
import {
    AddFilterPopover,
    FilterChipView,
    type FilterChipData,
} from '@/components/contacts/add-filter-popover';
import { ContactHoverCard } from '@/components/contacts/contact-hover-card';

export interface ContactsTableProps {
    supplierId?: string;
    supplierName?: string;
    supplierNumber?: string;
    showSupplierColumn?: boolean;
    scopeAll?: boolean;
    showPageTitle?: boolean;
}

const STATUS_COLORS: Record<ContactStatus, string> = {
    active: 'bg-emerald-500',
    inactive: 'bg-slate-400',
    on_hold: 'bg-amber-500',
};

const STATUS_LABELS: Record<ContactStatus, string> = {
    active: 'Active',
    inactive: 'Deactivated',
    on_hold: 'On Hold',
};

export function ContactsTable({
    supplierId,
    supplierName,
    supplierNumber,
    showSupplierColumn,
    scopeAll = false,
    showPageTitle = true,
}: ContactsTableProps) {
    const router = useRouter();
    const [rows, setRows] = React.useState<ContactRow[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [total, setTotal] = React.useState(0);
    const [search, setSearch] = React.useState('');
    const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
    const [filters, setFilters] = React.useState<FilterChipData[]>([]);
    const [visibleColumns, setVisibleColumns] = React.useState<Set<ContactColumnKey>>(
        () => new Set<ContactColumnKey>([
            'name', 'email', 'phone',
            ...((showSupplierColumn ?? scopeAll) ? ['supplier' as ContactColumnKey] : []),
            'language', 'department', 'position', 'responsibility', 'status',
        ]),
    );
    const [addOpen, setAddOpen] = React.useState(false);
    const [createRequestModalOpen, setCreateRequestModalOpen] = React.useState(false);
    const [addToExistingModalOpen, setAddToExistingModalOpen] = React.useState(false);
    const [editing, setEditing] = React.useState<ContactRow | null>(null);
    const [deletingId, setDeletingId] = React.useState<string | null>(null);
    const [bulkDeleting, setBulkDeleting] = React.useState(false);
    const [columnWidths, setColumnWidths] = React.useState<Record<ContactColumnKey, number>>(() => {
        const out = {} as Record<ContactColumnKey, number>;
        CONTACT_COLUMNS.forEach((c) => { out[c.key] = c.defaultWidth; });
        return out;
    });
    const [hoverLeftShadow, setHoverLeftShadow] = React.useState(false);
    const scrollRef = React.useRef<HTMLDivElement | null>(null);

    const handleScroll = React.useCallback((e: React.UIEvent<HTMLDivElement>) => {
        setHoverLeftShadow(e.currentTarget.scrollLeft > 4);
    }, []);

    const refresh = React.useCallback(async () => {
        setLoading(true);
        const result = await listContacts({
            supplierId: scopeAll ? undefined : supplierId,
            advancedFilters: filters,
            search: search.trim() || undefined,
            limit: 2000,
        });
        setRows(result.rows);
        setTotal(result.total);
        setLoading(false);
    }, [scopeAll, supplierId, filters, search]);

    React.useEffect(() => {
        const t = setTimeout(refresh, 200);
        return () => clearTimeout(t);
    }, [refresh]);

    const handleReset = () => {
        setSearch('');
        setFilters([]);
        setSelectedIds(new Set());
    };

    const addFilter = (chip: Omit<FilterChipData, 'id'>) => {
        setFilters((prev) => [...prev, { ...chip, id: `${chip.field}-${Date.now()}` }]);
    };

    const removeFilter = (id: string) => setFilters((prev) => prev.filter((f) => f.id !== id));

    const updateFilter = (id: string, patch: Partial<FilterChipData>) => {
        setFilters((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
    };

    const handleStatusChange = async (id: string, status: ContactStatus) => {
        const result = await updateContactStatus(id, status);
        if (result.success) {
            toast.success('Status updated');
            refresh();
        } else {
            toast.error(result.error);
        }
    };

    const handleDelete = async () => {
        if (!deletingId) return;
        const result = await deleteContact(deletingId);
        if (result.success) {
            toast.success('Contact deleted');
            setDeletingId(null);
            refresh();
        } else {
            toast.error(result.error);
        }
    };

    const handleBulkDelete = async () => {
        const ids = Array.from(selectedIds);
        if (!ids.length) return;
        const result = await bulkDeleteContacts(ids);
        if (result.success) {
            toast.success(`Deleted ${result.count} contacts`);
            setSelectedIds(new Set());
            setBulkDeleting(false);
            refresh();
        } else {
            toast.error(result.error);
        }
    };

    const handleExport = (format: 'csv' | 'xlsx') => {
        const selectedRows = rows.filter((r) => selectedIds.has(r.id));
        const exportData = (selectedRows.length > 0 ? selectedRows : rows).map((r) => ({
            'Contact': r.name,
            'Email': r.email,
            'Phone number': r.phone || '',
            'Supplier': r.supplierName || r.supplierNumber || '',
            'Language': r.language || '',
            'Department': r.department || '',
            'Position': r.position || '',
            'Responsibility': r.responsibility || '',
            'Status': STATUS_LABELS[r.status] || r.status,
        }));

        if (format === 'csv') {
            const headers = Object.keys(exportData[0] || {});
            const csvRows = [headers.join(',')];
            for (const row of exportData) {
                csvRows.push(headers.map((h) => `"${(row[h as keyof typeof row] || '').replace(/"/g, '""')}"`).join(','));
            }
            const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `contacts_export_${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success(`Exported ${exportData.length} contacts as CSV`);
        } else {
            import('xlsx').then((XLSX) => {
                const ws = XLSX.utils.json_to_sheet(exportData);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, 'Contacts');
                XLSX.writeFile(wb, `contacts_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
                toast.success(`Exported ${exportData.length} contacts as Excel`);
            });
        }
    };

    const toggleColumn = (key: ContactColumnKey) => {
        setVisibleColumns((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const handleSelectAllColumns = () => {
        setVisibleColumns(new Set(allColumns.map((c) => c.key)));
    };

    const handleDeselectAllColumns = () => {
        const frozenKeys = allColumns.filter((c) => c.frozen).map((c) => c.key);
        setVisibleColumns(new Set(frozenKeys));
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === rows.length && rows.length > 0) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(rows.map((r) => r.id)));
        }
    };

    const toggleSelectRow = (id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const allColumns = CONTACT_COLUMNS.filter((c) => showSupplierColumn || c.key !== 'supplier');
    const visibleColDefs = allColumns.filter((c) => visibleColumns.has(c.key));
    const visibleCount = visibleColDefs.length;
    const ROW_HEIGHT = 44;
    const CHECKBOX_WIDTH = 44;

    const frozenOffsets: Partial<Record<ContactColumnKey, number>> = {};
    let frozenRunning = CHECKBOX_WIDTH;
    let lastFrozenKey: ContactColumnKey | null = null;
    for (const col of visibleColDefs) {
        if (col.frozen) {
            frozenOffsets[col.key] = frozenRunning;
            frozenRunning += columnWidths[col.key];
            lastFrozenKey = col.key;
        }
    }
    const totalTableWidth = CHECKBOX_WIDTH + visibleColDefs.reduce((w, c) => w + columnWidths[c.key], 0);

    const startResizeFor = (key: ContactColumnKey, current: number) => {
        return (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            const startX = e.clientX;
            const startW = current;
            const onMove = (ev: MouseEvent) => {
                const next = Math.max(80, startW + (ev.clientX - startX));
                setColumnWidths((prev) => ({ ...prev, [key]: next }));
            };
            const onUp = () => {
                window.removeEventListener('mousemove', onMove);
                window.removeEventListener('mouseup', onUp);
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            };
            window.addEventListener('mousemove', onMove);
            window.addEventListener('mouseup', onUp);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        };
    };

    return (
        <div className="flex flex-col h-full space-y-4 relative">
            {/* Title */}
            {showPageTitle && (
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold tracking-tight text-slate-900">Contacts</h1>
                </div>
            )}

            {/* Top Controls: Left (Add filter, Reset, Chips), Right (Search, Columns, + Add new) */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <AddFilterPopover onAddFilter={addFilter} />
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleReset}
                        className="h-9 px-2.5 text-xs text-slate-500 hover:text-slate-900 hover:bg-slate-100 gap-1.5"
                    >
                        <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
                        Reset
                    </Button>
                    {filters.map((f) => (
                        <FilterChipView
                            key={f.id}
                            chip={f}
                            onChange={(patch) => updateFilter(f.id, patch)}
                            onRemove={() => removeFilter(f.id)}
                        />
                    ))}
                </div>

                <div className="flex items-center gap-2.5 ml-auto">
                    {/* Search Input */}
                    <div className="relative w-56 sm:w-64">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 h-9 text-xs rounded-md bg-white border-slate-200 placeholder:text-slate-400"
                        />
                    </div>

                    {/* Custom Columns Dropdown matching Tacto screenshot */}
                    <ColumnsDropdown
                        allColumns={allColumns}
                        visibleColumns={visibleColumns}
                        onToggleColumn={toggleColumn}
                        onSelectAll={handleSelectAllColumns}
                        onDeselectAll={handleDeselectAllColumns}
                    />

                    {/* + Add new Button */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className="h-9 bg-black text-white hover:bg-neutral-800 text-xs font-medium px-3.5 gap-1.5 shadow-sm rounded-md">
                                <Plus className="h-3.5 w-3.5" />
                                Add new
                                <ChevronDown className="h-3 w-3 opacity-70 ml-0.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 p-1">
                            <DropdownMenuItem onSelect={() => setAddOpen(true)} className="text-xs font-medium cursor-pointer">
                                <UserPlus className="h-4 w-4 mr-2 text-slate-600" />
                                Add Contact
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onSelect={() => router.push(supplierId ? `/contacts/import?supplierId=${supplierId}` : '/contacts/import')}
                                className="text-xs font-medium cursor-pointer"
                            >
                                <Upload className="h-4 w-4 mr-2 text-slate-600" />
                                Contact import
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Main Table Container */}
            <div className="flex flex-col flex-1 min-h-0 rounded-lg border border-slate-200/90 bg-white shadow-sm overflow-hidden relative">
                <div className="relative flex-1 min-h-0">
                    <div
                        ref={scrollRef}
                        className="relative h-full overflow-auto custom-table-scrollbar"
                        onScroll={handleScroll}
                    >
                        {hoverLeftShadow && (
                            <div
                                aria-hidden
                                className="pointer-events-none absolute left-0 top-0 z-40 h-full w-3 bg-gradient-to-r from-slate-400/20 to-transparent"
                            />
                        )}

                        {loading ? (
                            <div className="flex h-64 items-center justify-center text-sm text-slate-400">
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
                                    <span>Loading contacts...</span>
                                </div>
                            </div>
                        ) : rows.length === 0 ? (
                            <div className="flex h-64 flex-col items-center justify-center text-sm text-slate-400 gap-2">
                                <p>No contacts found.</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setAddOpen(true)}
                                    className="h-8 text-xs gap-1.5"
                                >
                                    <Plus className="h-3.5 w-3.5" /> Add Contact
                                </Button>
                            </div>
                        ) : (
                            <div style={{ minWidth: totalTableWidth }}>
                                {/* Header Row */}
                                <div className="sticky top-0 z-20 flex border-b border-slate-200 bg-white">
                                    {/* Select All Checkbox */}
                                    <div
                                        style={{ width: CHECKBOX_WIDTH }}
                                        className="sticky left-0 z-30 flex shrink-0 items-center justify-center bg-white border-r border-slate-100 cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleSelectAll();
                                        }}
                                    >
                                        <Checkbox
                                            checked={
                                                selectedIds.size > 0 && selectedIds.size < rows.length
                                                    ? 'indeterminate'
                                                    : selectedIds.size === rows.length && rows.length > 0
                                            }
                                            onCheckedChange={toggleSelectAll}
                                            aria-label="Select all"
                                        />
                                    </div>

                                    {/* Column Headers */}
                                    {visibleColDefs.map((col) => {
                                        const leftOffset = frozenOffsets[col.key] ?? null;
                                        return (
                                            <div
                                                key={col.key}
                                                style={{
                                                    width: columnWidths[col.key],
                                                    ...(leftOffset !== null ? { left: leftOffset, position: 'sticky', zIndex: 30 } : {}),
                                                }}
                                                className={cn(
                                                    'relative flex shrink-0 items-center px-3 py-2.5 text-xs font-normal text-slate-600 select-none bg-white',
                                                    col.frozen && 'border-r border-slate-100',
                                                )}
                                                title={col.label}
                                            >
                                                <div className="flex items-center gap-1.5 truncate">
                                                    {getHeaderIcon(col.key)}
                                                    <span className="truncate">{col.label}</span>
                                                </div>
                                                <span
                                                    role="separator"
                                                    aria-orientation="vertical"
                                                    onMouseDown={startResizeFor(col.key, columnWidths[col.key])}
                                                    className="absolute right-0 top-0 z-10 h-full w-1.5 cursor-col-resize hover:bg-slate-300"
                                                />
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Body Rows */}
                                {rows.map((c) => (
                                    <ContactTableRow
                                        key={c.id}
                                        contact={c}
                                        isSelected={selectedIds.has(c.id)}
                                        visibleColDefs={visibleColDefs}
                                        frozenOffsets={frozenOffsets}
                                        lastFrozenKey={lastFrozenKey}
                                        columnWidths={columnWidths}
                                        onToggleSelect={toggleSelectRow}
                                        onEdit={setEditing}
                                        onStatusChange={handleStatusChange}
                                        onDelete={setDeletingId}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Bar matching Tacto screenshot (Rows: X) */}
                <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                        <span>Rows: <span className="font-normal text-slate-700">{total.toLocaleString()}</span></span>
                        {selectedIds.size > 0 && (
                            <span className="text-slate-400">· {selectedIds.size} selected</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Floating Selection & Actions Pill (matches screenshots 1, 2, 3!) */}
            {selectedIds.size > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 rounded-xl bg-white p-1 shadow-2xl border border-slate-200/90 animate-in fade-in-0 slide-in-from-bottom-3 duration-200">
                    <div className="flex items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50/90 px-3 py-1 text-xs font-medium text-slate-800">
                        <span>{selectedIds.size.toLocaleString()} selected</span>
                        <button
                            type="button"
                            onClick={() => setSelectedIds(new Set())}
                            className="text-slate-400 hover:text-slate-700 p-0.5 rounded hover:bg-slate-200/70 transition-colors cursor-pointer"
                            aria-label="Clear selection"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5 rounded-lg text-xs font-semibold text-slate-800 border-slate-200 bg-white hover:bg-slate-50 shadow-xs cursor-pointer"
                            >
                                <Command className="h-3.5 w-3.5 text-slate-600" />
                                Actions
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            side="top"
                            align="end"
                            sideOffset={8}
                            className="w-56 p-1 rounded-xl shadow-2xl border border-slate-200 bg-white space-y-0.5 text-xs"
                        >
                            {/* Request (Submenu) */}
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger className="flex items-center justify-between py-2 px-2.5 rounded-lg text-slate-800 hover:bg-slate-100/80 cursor-pointer">
                                    <div className="flex items-center gap-2.5">
                                        <Send className="h-4 w-4 text-slate-600 shrink-0 stroke-[1.75]" />
                                        <span>Request</span>
                                    </div>
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent className="w-56 p-1 rounded-xl shadow-xl border border-slate-200 bg-white space-y-0.5 text-xs">
                                    <DropdownMenuItem
                                        onSelect={() => setCreateRequestModalOpen(true)}
                                        className="py-2 px-2.5 rounded-lg text-slate-800 hover:bg-slate-100/80 cursor-pointer flex items-center gap-2.5"
                                    >
                                        <FilePlus2 className="h-4 w-4 text-slate-600 shrink-0 stroke-[1.75]" />
                                        <span>Create new Request</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onSelect={() => setAddToExistingModalOpen(true)}
                                        className="py-2 px-2.5 rounded-lg text-slate-800 hover:bg-slate-100/80 cursor-pointer flex items-center gap-2.5"
                                    >
                                        <FileText className="h-4 w-4 text-slate-600 shrink-0 stroke-[1.75]" />
                                        <span>Add to existing Request</span>
                                    </DropdownMenuItem>
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>

                            {/* Create RFQ */}
                            <DropdownMenuItem
                                onSelect={() => router.push(`/sourcing/rfqs/new?contacts=${Array.from(selectedIds).join(',')}`)}
                                className="py-2 px-2.5 rounded-lg text-slate-800 hover:bg-slate-100/80 cursor-pointer flex items-center gap-2.5"
                            >
                                <Handshake className="h-4 w-4 text-slate-600 shrink-0 stroke-[1.75]" />
                                <span>Create RFQ</span>
                            </DropdownMenuItem>

                            {/* Export (Submenu) */}
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger className="flex items-center justify-between py-2 px-2.5 rounded-lg text-slate-800 hover:bg-slate-100/80 cursor-pointer">
                                    <div className="flex items-center gap-2.5">
                                        <Download className="h-4 w-4 text-slate-600 shrink-0 stroke-[1.75]" />
                                        <span>Export</span>
                                    </div>
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent className="w-56 p-1 rounded-xl shadow-xl border border-slate-200 bg-white space-y-0.5 text-xs">
                                    <DropdownMenuItem
                                        onSelect={() => handleExport('csv')}
                                        className="py-2 px-2.5 rounded-lg text-slate-800 hover:bg-slate-100/80 cursor-pointer flex items-center gap-2.5"
                                    >
                                        <FileText className="h-4 w-4 text-slate-600 shrink-0 stroke-[1.75]" />
                                        <span>CSV</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onSelect={() => handleExport('xlsx')}
                                        className="py-2 px-2.5 rounded-lg text-slate-800 hover:bg-slate-100/80 cursor-pointer flex items-center gap-2.5"
                                    >
                                        <FileSpreadsheet className="h-4 w-4 text-emerald-600 shrink-0 stroke-[1.75]" />
                                        <span>Microsoft Excel (.xlsx)</span>
                                    </DropdownMenuItem>
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>

                            {/* Delete */}
                            <DropdownMenuItem
                                onSelect={() => setBulkDeleting(true)}
                                className="py-2 px-2.5 rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700 cursor-pointer flex items-center gap-2.5"
                            >
                                <Trash2 className="h-4 w-4 text-rose-600 shrink-0 stroke-[1.75]" />
                                <span>Delete</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}

            {/* Modals */}
            <AddContactModal
                open={addOpen}
                onOpenChange={setAddOpen}
                supplierId={supplierId}
                supplierName={supplierName}
                supplierLocked={!scopeAll}
                showSupplierPicker={scopeAll}
                onSuccess={() => { setAddOpen(false); refresh(); }}
            />
            <AddContactModal
                open={!!editing}
                onOpenChange={(o) => { if (!o) setEditing(null); }}
                supplierId={supplierId}
                supplierName={supplierName}
                supplierLocked={!scopeAll}
                showSupplierPicker={scopeAll}
                editing={editing ? {
                    id: editing.id,
                    name: editing.name,
                    email: editing.email,
                    phone: editing.phone,
                    language: editing.language,
                    department: editing.department,
                    position: editing.position,
                    responsibility: editing.responsibility,
                    status: editing.status,
                } : null}
                onSuccess={() => { setEditing(null); refresh(); }}
            />

            <AlertDialog open={!!deletingId} onOpenChange={(o) => { if (!o) setDeletingId(null); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete contact?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-rose-600 hover:bg-rose-700">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <AlertDialog open={bulkDeleting} onOpenChange={setBulkDeleting}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete {selectedIds.size} contacts?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {selectedIds.size} selected contact{selectedIds.size > 1 ? 's' : ''}? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleBulkDelete} className="bg-rose-600 hover:bg-rose-700">
                            Delete {selectedIds.size} contacts
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <CreateRequestModal
                open={createRequestModalOpen}
                onOpenChange={setCreateRequestModalOpen}
                contactIds={Array.from(selectedIds)}
                trigger={null}
            />
            <AddToExistingRequestModal
                open={addToExistingModalOpen}
                onOpenChange={setAddToExistingModalOpen}
                contactIds={Array.from(selectedIds)}
            />
        </div>
    );
}

interface ContactTableRowProps {
    contact: ContactRow;
    isSelected: boolean;
    visibleColDefs: typeof CONTACT_COLUMNS;
    frozenOffsets: Partial<Record<ContactColumnKey, number>>;
    lastFrozenKey: ContactColumnKey | null;
    columnWidths: Record<ContactColumnKey, number>;
    onToggleSelect: (id: string) => void;
    onEdit: (c: ContactRow) => void;
    onStatusChange: (id: string, status: ContactStatus) => void;
    onDelete: (id: string) => void;
}

const ContactTableRow = React.memo(function ContactTableRow({
    contact: c,
    isSelected,
    visibleColDefs,
    frozenOffsets,
    lastFrozenKey,
    columnWidths,
    onToggleSelect,
    onEdit,
    onStatusChange,
    onDelete,
}: ContactTableRowProps) {
    const CHECKBOX_WIDTH = 44;
    const ROW_HEIGHT = 44;

    return (
        <div
            onClick={() => onToggleSelect(c.id)}
            className={cn(
                'group flex border-b border-slate-100 text-xs transition-colors hover:bg-slate-50/70 cursor-pointer select-none',
                isSelected && 'bg-sky-50/70 font-medium',
            )}
            style={{ height: ROW_HEIGHT }}
        >
            {/* Row Selection Checkbox */}
            <div
                style={{ width: CHECKBOX_WIDTH }}
                className={cn(
                    'sticky left-0 z-10 flex shrink-0 items-center justify-center border-r border-slate-100 transition-colors cursor-pointer',
                    isSelected ? 'bg-sky-50/70' : 'bg-white group-hover:bg-slate-50/70'
                )}
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleSelect(c.id);
                }}
            >
                <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggleSelect(c.id)}
                    aria-label={`Select ${c.name}`}
                />
            </div>

            {/* Cells */}
            {visibleColDefs.map((col) => {
                const leftOffset = frozenOffsets[col.key] ?? null;
                const isLastFrozen = col.key === lastFrozenKey;
                const w = columnWidths[col.key];
                const stickyStyle: React.CSSProperties | undefined = leftOffset !== null
                    ? { position: 'sticky', left: leftOffset, zIndex: 10 }
                    : undefined;
                const frozenClass = col.frozen
                    ? cn(isSelected ? 'bg-sky-50/70' : 'bg-white group-hover:bg-slate-50/70', !isLastFrozen && 'border-r border-slate-100')
                    : '';

                return (
                    <div
                        key={col.key}
                        style={{ width: w, height: ROW_HEIGHT, ...(stickyStyle ?? {}) }}
                        className={cn('flex shrink-0 items-center text-xs', col.key === 'name' ? 'px-1' : 'px-3', frozenClass)}
                    >
                        <div className="w-full min-w-0 truncate">
                            {renderCellContent(c, col.key, onEdit, onStatusChange, onDelete)}
                        </div>
                    </div>
                );
            })}
        </div>
    );
});

const RowActionsMenu = React.memo(function RowActionsMenu({
    contact: c,
    onStatusChange,
    onDelete,
}: {
    contact: ContactRow;
    onStatusChange: (id: string, status: ContactStatus) => void;
    onDelete: (id: string) => void;
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    aria-label="Contact actions"
                    className="h-6 w-6 shrink-0 flex items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-slate-50 opacity-0 group-hover/hover-cell:opacity-100 group-hover:opacity-100 data-[state=open]:opacity-100 transition-opacity shadow-2xs cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                >
                    <MoreVertical className="h-3.5 w-3.5 text-slate-700" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" sideOffset={4} className="w-48 p-1 rounded-xl shadow-lg border border-slate-200/90 bg-white space-y-0.5 z-50">
                <DropdownMenuItem
                    onSelect={() => onStatusChange(c.id, c.status === 'inactive' ? 'active' : 'inactive')}
                    className="text-xs font-normal py-2 px-2.5 rounded-lg text-slate-800 hover:bg-slate-100/80 cursor-pointer flex items-center gap-2.5"
                >
                    <UserX className="h-4 w-4 text-slate-700 shrink-0 stroke-[1.75]" />
                    <span>{c.status === 'inactive' ? 'Activate Contact' : 'Deactivate Contact'}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onSelect={() => onDelete(c.id)}
                    className="text-xs font-normal py-2 px-2.5 rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700 cursor-pointer flex items-center gap-2.5"
                >
                    <Trash2 className="h-4 w-4 text-rose-600 shrink-0 stroke-[1.75]" />
                    <span>Delete Contact</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
});

function renderCellContent(
    c: ContactRow,
    key: ContactColumnKey,
    onEdit: (c: ContactRow) => void,
    onStatusChange: (id: string, status: ContactStatus) => void,
    onDelete: (id: string) => void,
) {
    switch (key) {
        case 'name':
            return (
                <ContactHoverCard contact={c} onEdit={onEdit}>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(c);
                        }}
                        className="truncate text-left font-normal text-slate-900 hover:underline hover:text-slate-700 mr-1.5 cursor-pointer flex-1 min-w-0"
                        title={c.name || c.email}
                    >
                        {c.name || c.email}
                    </button>
                    <RowActionsMenu
                        contact={c}
                        onStatusChange={onStatusChange}
                        onDelete={onDelete}
                    />
                </ContactHoverCard>
            );
        case 'email':
            return c.email ? (
                <a
                    href={`mailto:${c.email}`}
                    onClick={(e) => e.stopPropagation()}
                    className="block w-full truncate text-slate-800 hover:text-blue-600 hover:underline"
                    title={c.email}
                >
                    {c.email}
                </a>
            ) : null;
        case 'phone':
            return c.phone ? (
                <span className="block w-full truncate text-slate-800" title={c.phone}>
                    {c.phone}
                </span>
            ) : null;
        case 'supplier':
            return c.supplierId ? (
                <Link
                    href={`/suppliers/${c.supplierNumber || c.supplierId}/overview`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex max-w-full items-center gap-1.5 rounded border border-sky-200/90 bg-sky-50 px-2 py-0.5 text-xs font-normal text-sky-700 hover:bg-sky-100 transition-colors"
                    title={c.supplierName || c.supplierNumber || c.supplierId}
                >
                    <Building2 className="h-3 w-3 text-sky-600 shrink-0" />
                    <span className="truncate">{c.supplierName || c.supplierNumber || c.supplierId.slice(0, 8)}</span>
                </Link>
            ) : null;
        case 'language':
            return c.language ? (
                <span className="block w-full truncate text-slate-700" title={c.language}>
                    {c.language}
                </span>
            ) : null;
        case 'department':
            if (!c.department) return null;
            const depts = c.department.split(/[,;|]/).map((d) => d.trim()).filter(Boolean);
            return (
                <div className="flex flex-wrap items-center gap-1 max-w-full overflow-hidden">
                    {depts.map((d, i) => (
                        <span
                            key={i}
                            className="inline-flex max-w-full items-center truncate rounded border border-slate-200/80 bg-slate-100/90 px-2 py-0.5 text-xs font-normal text-slate-700"
                            title={d}
                        >
                            <span className="truncate">{d}</span>
                        </span>
                    ))}
                </div>
            );
        case 'position':
            if (!c.position) return null;
            return (
                <span
                    className="inline-flex max-w-full items-center truncate rounded border border-slate-200/80 bg-slate-100/90 px-2 py-0.5 text-xs font-normal text-slate-700"
                    title={c.position}
                >
                    <span className="truncate">{c.position}</span>
                </span>
            );
        case 'responsibility':
            if (!c.responsibility) return null;
            const respTags = c.responsibility.split(/[,;|]/).map((t) => t.trim()).filter(Boolean);
            return (
                <span
                    className="inline-flex max-w-full items-center truncate rounded border border-slate-200/80 bg-slate-100/90 px-2 py-0.5 text-xs font-normal text-slate-700"
                    title={respTags.join(', ')}
                >
                    <span className="truncate">{respTags[0]}</span>
                    {respTags.length > 1 && (
                        <span className="ml-1 text-slate-400">+{respTags.length - 1}</span>
                    )}
                </span>
            );
        case 'status':
            return (
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-700">
                    <span className={cn('h-2 w-2 rounded-full shrink-0', STATUS_COLORS[c.status])} />
                    <span className="truncate">{STATUS_LABELS[c.status] || c.status}</span>
                </span>
            );
        default:
            return null;
    }
}

function getHeaderIcon(key: ContactColumnKey) {
    switch (key) {
        case 'phone':
            return <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />;
        case 'supplier':
            return <Building2 className="h-3.5 w-3.5 text-sky-500 shrink-0" />;
        case 'language':
            return <Languages className="h-3.5 w-3.5 text-slate-400 shrink-0" />;
        case 'department':
        case 'position':
        case 'responsibility':
            return <Info className="h-3.5 w-3.5 text-slate-400 shrink-0" />;
        default:
            return null;
    }
}

function ColumnsDropdown({
    allColumns,
    visibleColumns,
    onToggleColumn,
    onSelectAll,
    onDeselectAll,
}: {
    allColumns: typeof CONTACT_COLUMNS;
    visibleColumns: Set<ContactColumnKey>;
    onToggleColumn: (key: ContactColumnKey) => void;
    onSelectAll: () => void;
    onDeselectAll: () => void;
}) {
    const [open, setOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');

    const visibleCount = visibleColumns.size;
    const allSelectable = allColumns.filter((c) => !c.frozen);
    const allSelected = allSelectable.every((c) => visibleColumns.has(c.key));
    const isIndeterminate = !allSelected && allSelectable.some((c) => visibleColumns.has(c.key));

    const filteredColumns = allColumns.filter((c) =>
        c.label.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );

    const columnsWithInfo: ContactColumnKey[] = ['language', 'department', 'position', 'responsibility', 'status'];

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-1.5 text-xs font-normal border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs"
                >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600">
                        <rect width="18" height="18" x="3" y="3" rx="2" />
                        <path d="M9 3v18" />
                        <path d="M15 3v18" />
                    </svg>
                    <span>Columns {visibleCount}/{allColumns.length}</span>
                    {open ? (
                        <ChevronUp className="h-3.5 w-3.5 text-slate-400 ml-0.5" />
                    ) : (
                        <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-0.5" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl shadow-xl border-slate-200/90 bg-white space-y-1">
                {/* Search input matching Tacto screenshot */}
                <div className="relative mb-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-8 pl-8 pr-2 text-xs bg-slate-50/90 hover:bg-slate-100/90 focus:bg-white border border-transparent focus:border-slate-300 rounded-md outline-none text-slate-800 placeholder:text-slate-400 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                    />
                </div>

                {/* Select all */}
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        if (allSelected) onDeselectAll();
                        else onSelectAll();
                    }}
                    className="flex items-center w-full gap-2.5 px-2 py-1.5 rounded-md hover:bg-slate-50 text-xs transition-colors cursor-pointer select-none"
                >
                    <div className={cn(
                        "h-4 w-4 rounded flex items-center justify-center transition-colors shrink-0",
                        allSelected ? "bg-zinc-800 text-white" : isIndeterminate ? "bg-zinc-800 text-white" : "border border-slate-300 bg-white"
                    )}>
                        {(allSelected || isIndeterminate) && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                    <span className="font-medium text-slate-800">Select all</span>
                </button>

                <div className="h-px bg-slate-100 my-1" />

                {/* Columns List */}
                <div className="max-h-64 overflow-y-auto space-y-0.5">
                    {filteredColumns.map((col) => {
                        const isVisible = visibleColumns.has(col.key);
                        const isFrozen = col.frozen;
                        const hasInfo = columnsWithInfo.includes(col.key);

                        return (
                            <button
                                key={col.key}
                                type="button"
                                disabled={isFrozen}
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (!isFrozen) onToggleColumn(col.key);
                                }}
                                className={cn(
                                    "flex items-center justify-between w-full px-2 py-1.5 rounded-md text-xs transition-colors select-none",
                                    isFrozen ? "opacity-60 cursor-not-allowed" : "hover:bg-slate-50 cursor-pointer text-slate-800"
                                )}
                            >
                                <div className="flex items-center gap-2.5 truncate">
                                    <div className={cn(
                                        "h-4 w-4 rounded flex items-center justify-center transition-colors shrink-0",
                                        isFrozen
                                            ? "bg-slate-400 text-white"
                                            : isVisible
                                                ? "bg-zinc-800 text-white"
                                                : "border border-slate-300 bg-white"
                                    )}>
                                        {(isVisible || isFrozen) && <Check className="h-3 w-3 stroke-[3]" />}
                                    </div>
                                    <span className={cn(
                                        "truncate",
                                        isFrozen ? "text-slate-400 font-normal" : isVisible ? "text-slate-800 font-normal" : "text-slate-600 font-normal"
                                    )}>
                                        {col.label}
                                    </span>
                                </div>
                                {hasInfo && (
                                    <Info className="h-3.5 w-3.5 text-slate-400/80 shrink-0 ml-1.5" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
