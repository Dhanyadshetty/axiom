'use client';

import * as React from 'react';
import Link from 'next/link';
import {
    Plus,
    Search,
    ChevronDown,
    MoreHorizontal,
    Pencil,
    Trash2,
    Archive,
    PowerOff,
    Mail,
    Phone,
    Settings2,
    X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuCheckboxItem,
    DropdownMenuLabel,
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
    updateContactStatus,
    type ContactRow,
} from '@/app/actions/contacts-detail';
import { AddContactModal } from '@/components/contacts/add-contact-modal';

export interface ContactsTableProps {
    supplierId?: string;
    supplierName?: string;
    supplierNumber?: string;
    showSupplierColumn?: boolean;
    scopeAll?: boolean;
}

interface FilterChip {
    id: string;
    field: ContactColumnKey;
    operator: 'is_one_of' | 'is_none_of' | 'contains' | 'does_not_contain' | 'is' | 'is_not' | 'is_blank' | 'is_not_blank';
    values: string[];
}

const STATUS_COLORS: Record<ContactStatus, string> = {
    active: 'bg-emerald-500',
    inactive: 'bg-slate-400',
    on_hold: 'bg-rose-500',
};

function defaultFilters(): FilterChip[] {
    return [
        { id: 'default-status', field: 'status', operator: 'is_one_of', values: ['active'] },
    ];
}

export function ContactsTable({
    supplierId,
    supplierName,
    supplierNumber,
    showSupplierColumn,
    scopeAll = false,
}: ContactsTableProps) {
    // router reference available if you need to push from this table
    const [rows, setRows] = React.useState<ContactRow[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [total, setTotal] = React.useState(0);
    const [search, setSearch] = React.useState('');
    const [filters, setFilters] = React.useState<FilterChip[]>(defaultFilters);
    const [visibleColumns, setVisibleColumns] = React.useState<Set<ContactColumnKey>>(
        () => new Set<ContactColumnKey>([
            'name', 'email', 'phone',
            ...((showSupplierColumn ?? scopeAll) ? ['supplier' as ContactColumnKey] : []),
            'language', 'department', 'position', 'responsibility', 'status',
        ]),
    );
    const [addOpen, setAddOpen] = React.useState(false);
    const [editing, setEditing] = React.useState<ContactRow | null>(null);
    const [deletingId, setDeletingId] = React.useState<string | null>(null);
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
        const statusValues = filters.find((f) => f.field === 'status')?.values as ContactStatus[] | undefined;
        const languageValues = filters.find((f) => f.field === 'language')?.values;
        const departmentValues = filters.find((f) => f.field === 'department')?.values;
        const result = await listContacts({
            supplierId: scopeAll ? undefined : supplierId,
            status: statusValues,
            language: languageValues,
            department: departmentValues,
            search: search.trim() || undefined,
            limit: 500,
        });
        setRows(result.rows);
        setTotal(result.total);
        setLoading(false);
    }, [scopeAll, supplierId, filters, search]);

    React.useEffect(() => {
        const t = setTimeout(refresh, 200);
        return () => clearTimeout(t);
    }, [refresh]);

    const addFilter = (chip: Omit<FilterChip, 'id'>) => {
        setFilters((prev) => [...prev, { ...chip, id: `${chip.field}-${Date.now()}` }]);
    };

    const removeFilter = (id: string) => setFilters((prev) => prev.filter((f) => f.id !== id));

    const updateFilter = (id: string, patch: Partial<FilterChip>) => {
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

    const toggleColumn = (key: ContactColumnKey) => {
        setVisibleColumns((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const allColumns = CONTACT_COLUMNS.filter((c) => showSupplierColumn || c.key !== 'supplier');
    const visibleColDefs = allColumns.filter((c) => visibleColumns.has(c.key));
    const visibleCount = visibleColDefs.length;
    const ROW_HEIGHT = 46;
    const ROW_ACTIONS_WIDTH = 40;

    // Frozen column stacking offsets: frozen columns stick on the left in the
    // order they appear, each one offset by the sum of preceding frozen widths.
    const frozenOffsets: Partial<Record<ContactColumnKey, number>> = {};
    let frozenRunning = 0;
    let lastFrozenKey: ContactColumnKey | null = null;
    for (const col of visibleColDefs) {
        if (col.frozen) {
            frozenOffsets[col.key] = frozenRunning;
            frozenRunning += columnWidths[col.key];
            lastFrozenKey = col.key;
        }
    }
    const totalTableWidth = visibleColDefs.reduce((w, c) => w + columnWidths[c.key], 0) + ROW_ACTIONS_WIDTH;

    const startResizeFor = (key: ContactColumnKey, current: number) => {
        return (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            const startX = e.clientX;
            const startW = current;
            const onMove = (ev: MouseEvent) => {
                const next = Math.max(60, startW + (ev.clientX - startX));
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
        <div className="space-y-3">
            {/* Filter chips + actions row */}
            <div className="flex flex-wrap items-center gap-2">
                {filters.map((f) => (
                    <FilterChipView
                        key={f.id}
                        chip={f}
                        onChange={(patch) => updateFilter(f.id, patch)}
                        onRemove={() => removeFilter(f.id)}
                    />
                ))}
                <AddFilterMenu onAdd={addFilter} existing={filters.map((f) => f.field)} />
                <div className="ml-auto flex items-center gap-2">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 h-9"
                        />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 gap-2">
                                <Settings2 className="h-4 w-4" />
                                Columns {visibleCount}/{allColumns.length}
                                <ChevronDown className="h-3.5 w-3.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {allColumns.map((col) => (
                                <DropdownMenuCheckboxItem
                                    key={col.key}
                                    checked={visibleColumns.has(col.key)}
                                    onCheckedChange={() => toggleColumn(col.key)}
                                    onSelect={(e) => e.preventDefault()}
                                >
                                    {col.label}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <AddNewSplitButton
                        supplierId={supplierId}
                        supplierName={supplierName ?? ''}
                        supplierNumber={supplierNumber ?? ''}
                        onAddManual={() => setAddOpen(true)}
                    />
                </div>
            </div>

            {/* Scrollable table — fixed-height container, sticky header, frozen leading column */}
            <div className="flex flex-col rounded-lg border border-slate-200 bg-white shadow-sm" style={{ height: 'calc(100vh - 280px)', minHeight: 420 }}>
                {/* Inner scroll container — both vertical and horizontal */}
                <div className="relative flex-1 min-h-0">
                    <div
                        ref={scrollRef}
                        className="relative h-full overflow-auto"
                        onScroll={handleScroll}
                    >
                        {hoverLeftShadow ? (
                            <div
                                aria-hidden
                                className="pointer-events-none absolute left-0 top-0 z-40 h-full w-3 bg-gradient-to-r from-slate-400/40 to-transparent"
                            />
                        ) : null}
                    {loading ? (
                        <div className="flex h-full items-center justify-center text-sm text-slate-400">Loading contacts...</div>
                    ) : rows.length === 0 ? (
                        <div className="flex h-full items-center justify-center text-sm text-slate-400">No contacts yet.</div>
                    ) : (
                        <div style={{ minWidth: totalTableWidth }}>
                            {/* Sticky header row */}
                            <div className="sticky top-0 z-20 flex border-b border-slate-200 bg-slate-50">
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
                                                "relative shrink-0 px-3 py-2.5 text-[11px] font-black uppercase tracking-wide text-slate-500",
                                                col.frozen && "bg-slate-50 border-r border-slate-200",
                                            )}
                                            title={col.label}
                                        >
                                            <span className="truncate block">{col.label}</span>
                                            <span
                                                role="separator"
                                                aria-orientation="vertical"
                                                onMouseDown={startResizeFor(col.key, columnWidths[col.key])}
                                                className="absolute right-0 top-0 z-10 h-full w-1.5 cursor-col-resize hover:bg-emerald-400/60"
                                            />
                                        </div>
                                    );
                                })}
                                {/* Row actions column header */}
                                <div className="w-10 shrink-0 border-l border-slate-200 bg-slate-50" />
                            </div>

                            {/* Body rows */}
                            {rows.map((c) => (
                                <div
                                    key={c.id}
                                    className="group flex border-b border-slate-100 text-sm hover:bg-slate-50/60"
                                    style={{ height: ROW_HEIGHT }}
                                >
                                    {visibleColDefs.map((col) => {
                                        const leftOffset = frozenOffsets[col.key] ?? null;
                                        const isLastFrozen = col.key === lastFrozenKey;
                                        return renderCell(c, col, leftOffset, isLastFrozen);
                                    })}
                                    <div className="w-10 shrink-0 flex items-center justify-center border-l border-slate-100">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-44">
                                                <DropdownMenuItem onSelect={() => setEditing(c)}>
                                                    <Pencil className="h-4 w-4 mr-2" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onSelect={() => handleStatusChange(c.id, 'active')}>
                                                    <PowerOff className="h-4 w-4 mr-2" /> Set Active
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onSelect={() => handleStatusChange(c.id, 'inactive')}>
                                                    <PowerOff className="h-4 w-4 mr-2" /> Deactivate
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onSelect={() => handleStatusChange(c.id, 'on_hold')}>
                                                    <Archive className="h-4 w-4 mr-2" /> Archive
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onSelect={() => setDeletingId(c.id)}
                                                    className="text-rose-600 focus:text-rose-700"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    </div>
                </div>

                {/* Persistent footer — total count, unaffected by scroll position */}
                <div className="flex items-center justify-between border-t border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">
                    <span>Contacts: <span className="font-semibold text-slate-700">{total.toLocaleString()}</span></span>
                    <span className="text-slate-400">Showing {rows.length} of {total.toLocaleString()}</span>
                </div>
            </div>

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
        </div>
    );

    // --- Cell renderer (must live inside the component to close over state) ---
    function renderCell(
        c: ContactRow,
        col: typeof visibleColDefs[number],
        leftOffset: number | null,
        isLastFrozen: boolean,
    ) {
        const w = columnWidths[col.key];
        const stickyStyle: React.CSSProperties | undefined = leftOffset !== null
            ? { position: 'sticky', left: leftOffset, zIndex: 10 }
            : undefined;
        const frozenClass = col.frozen
            ? cn('bg-white', !isLastFrozen && 'border-r border-slate-200')
            : '';
        const cellInner = (() => {
            switch (col.key) {
                case 'name':
                    return (
                        <button
                            onClick={() => setEditing(c)}
                            className="block w-full truncate text-left font-medium text-slate-900 hover:text-emerald-700"
                            title={c.name}
                        >
                            {c.name}
                        </button>
                    );
                case 'email':
                    return c.email ? (
                        <a href={`mailto:${c.email}`} className="block w-full truncate text-blue-600 hover:underline" title={c.email}>
                            {c.email}
                        </a>
                    ) : <DashCell />;
                case 'phone':
                    return c.phone ? (
                        <span className="inline-flex w-full items-center gap-1.5 truncate text-slate-700" title={c.phone}>
                            <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                            <span className="truncate">{c.phone}</span>
                        </span>
                    ) : <DashCell />;
                case 'supplier':
                    return c.supplierId ? (
                        <Link
                            href={`/suppliers/${c.supplierNumber || c.supplierId}/overview`}
                            className="inline-flex max-w-full items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                            title={c.supplierName || c.supplierNumber || c.supplierId}
                        >
                            <span className="truncate">{c.supplierName || c.supplierNumber || c.supplierId.slice(0, 8)}</span>
                        </Link>
                    ) : <DashCell />;
                case 'language':
                    return <PlainCell value={c.language} title={c.language ?? ''} />;
                case 'department':
                    return c.department ? (
                        <span className="inline-flex max-w-full items-center truncate rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700" title={c.department}>
                            <span className="truncate">{c.department}</span>
                        </span>
                    ) : <DashCell />;
                case 'position':
                    return <PlainCell value={c.position} title={c.position ?? ''} />;
                case 'responsibility':
                    if (!c.responsibility) return <DashCell />;
                    const tags = c.responsibility.split(/[,;|]/).map((t) => t.trim()).filter(Boolean);
                    const joined = tags.join(' • ');
                    return (
                        <span className="block w-full truncate text-slate-700" title={joined}>
                            {tags[0]}
                            {tags.length > 1 ? <span className="text-slate-400"> +{tags.length - 1}</span> : null}
                        </span>
                    );
                case 'status':
                    return (
                        <span className="inline-flex items-center gap-1.5 text-xs">
                            <span className={cn('h-2 w-2 rounded-full shrink-0', STATUS_COLORS[c.status])} />
                            <span className="capitalize text-slate-700 truncate">{c.status.replace('_', ' ')}</span>
                        </span>
                    );
                default:
                    return null;
            }
        })();
        return (
            <div
                key={col.key}
                style={{ width: w, height: ROW_HEIGHT, ...(stickyStyle ?? {}) }}
                className={cn(
                    'flex shrink-0 items-center px-3 text-sm',
                    frozenClass,
                )}
            >
                <div className="w-full min-w-0 truncate">{cellInner}</div>
            </div>
        );
    }
}

function PlainCell({ value, title }: { value: string | null | undefined; title: string }) {
    if (!value) return <DashCell />;
    return <span className="block w-full truncate text-slate-700" title={title}>{value}</span>;
}

function DashCell() {
    return <span className="text-slate-300">—</span>;
}

function AddNewSplitButton({
    supplierId,
    supplierName,
    supplierNumber,
    onAddManual,
}: {
    supplierId?: string;
    supplierName: string;
    supplierNumber: string;
    onAddManual: () => void;
}) {
    const importHref = supplierId
        ? `/contacts/import?supplierId=${encodeURIComponent(supplierId)}&supplierNumber=${encodeURIComponent(supplierNumber)}&supplierName=${encodeURIComponent(supplierName)}`
        : '/contacts/import';
    return (
        <div className="inline-flex">
            <Button onClick={onAddManual} className="h-9 rounded-r-none gap-2">
                <Plus className="h-4 w-4" /> Add new
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button className="h-9 rounded-l-none px-2 border-l border-emerald-700/30">
                        <ChevronDown className="h-3.5 w-3.5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onSelect={onAddManual}>
                        <Plus className="h-4 w-4 mr-2" /> Add Contact
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href={importHref}>
                            <span className="inline-flex items-center">
                                <Mail className="h-4 w-4 mr-2" /> Contact Import
                            </span>
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

function AddFilterMenu({ onAdd, existing }: { onAdd: (c: Omit<FilterChip, 'id'>) => void; existing: ContactColumnKey[] }) {
    const enumFields: ContactColumnKey[] = ['status', 'language', 'department'];
    const textFields: ContactColumnKey[] = ['name', 'email', 'position', 'responsibility'];
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-1.5">
                    <Plus className="h-3.5 w-3.5" /> Add filter
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 p-1">
                {[...enumFields, ...textFields].filter((f) => !existing.includes(f)).map((f) => {
                    const col = CONTACT_COLUMNS.find((c) => c.key === f)!;
                    return (
                        <DropdownMenuItem
                            key={f}
                            onSelect={() => {
                                if (enumFields.includes(f)) {
                                    onAdd({ field: f, operator: 'is_one_of', values: [] });
                                } else {
                                    onAdd({ field: f, operator: 'contains', values: [] });
                                }
                            }}
                        >
                            {col.label}
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function FilterChipView({ chip, onChange, onRemove }: { chip: FilterChip; onChange: (patch: Partial<FilterChip>) => void; onRemove: () => void }) {
    const col = CONTACT_COLUMNS.find((c) => c.key === chip.field)!;
    const isEnum = col.kind === 'enum';
    const options = col.enumValues || [];
    const operatorLabel = isEnum ? (chip.operator === 'is_one_of' ? 'is one of' : chip.operator === 'is_none_of' ? 'is none of' : 'is blank') : chip.operator.replace(/_/g, ' ');

    return (
        <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs">
            <span className="font-semibold text-slate-700">{col.label}</span>
            <span className="text-slate-500">{operatorLabel}</span>
            {isEnum && chip.operator !== 'is_blank' && chip.operator !== 'is_not_blank' ? (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="rounded bg-white px-1.5 py-0.5 border border-slate-200 hover:bg-slate-50">
                            {chip.values.length ? chip.values.join(', ') : 'Select…'}
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64 p-1 max-h-72 overflow-y-auto">
                        {options.map((opt) => (
                            <DropdownMenuCheckboxItem
                                key={opt}
                                checked={chip.values.includes(opt)}
                                onCheckedChange={(checked) => {
                                    const next = checked
                                        ? [...chip.values, opt]
                                        : chip.values.filter((v) => v !== opt);
                                    onChange({ values: next });
                                }}
                                onSelect={(e) => e.preventDefault()}
                            >
                                {opt}
                            </DropdownMenuCheckboxItem>
                        ))}
                        <div className="flex items-center gap-2 pt-2 mt-1 border-t px-1">
                            <button onClick={() => onChange({ operator: 'is_one_of' })} className="text-xs text-slate-500 hover:underline">is one of</button>
                            <button onClick={() => onChange({ operator: 'is_none_of' })} className="text-xs text-slate-500 hover:underline">is none of</button>
                            <button onClick={() => onChange({ operator: 'is_blank', values: [] })} className="text-xs text-slate-500 hover:underline ml-auto">is blank</button>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : !isEnum ? (
                <Input
                    value={chip.values[0] ?? ''}
                    onChange={(e) => onChange({ values: [e.target.value] })}
                    placeholder="value"
                    className="h-6 w-32 text-xs"
                />
            ) : null}
            <button onClick={onRemove} className="ml-1 rounded-full p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700">
                <X className="h-3 w-3" />
            </button>
        </div>
    );
}
