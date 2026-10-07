'use client';

import * as React from 'react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import {
    ArrowUpDown,
    ArrowUpAZ,
    ArrowDownZA,
    Pin,
    EyeOff,
    Filter,
    Search,
    Download,
    Undo2,
    Redo2,
    Plus,
    Trash2,
    Loader2,
    ChevronLeft,
    AlertCircle,
    MoreHorizontal,
    Check,
    X,
    Replace,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export interface ManualSpreadsheetColumn {
    key: string;
    label: string;
    required?: boolean;
    placeholder?: string;
    minWidth?: number;
    validator?: (val: string, row: Record<string, string>) => string | null;
}

export interface ManualEntrySpreadsheetProps {
    title: string;
    columns: ManualSpreadsheetColumn[];
    initialRows?: Array<Record<string, string>>;
    onBack: () => void;
    onCommit: (validRows: Array<Record<string, string>>) => Promise<{ success: boolean; count?: number; error?: string }>;
    entityNameSingular?: string;
    entityNamePlural?: string;
}

export function ManualEntrySpreadsheet({
    title,
    columns,
    initialRows,
    onBack,
    onCommit,
    entityNameSingular = 'item',
    entityNamePlural = 'items',
}: ManualEntrySpreadsheetProps) {
    // Initial rows generation (default 6 empty rows if none provided)
    const createEmptyRow = React.useCallback((): Record<string, string> => {
        const row: Record<string, string> = { __id: `row-${Date.now()}-${Math.random().toString(36).substring(2, 7)}` };
        columns.forEach((c) => {
            row[c.key] = '';
        });
        return row;
    }, [columns]);

    const [rows, setRows] = React.useState<Array<Record<string, string>>>(() => {
        if (initialRows && initialRows.length > 0) {
            return initialRows.map((r, i) => ({
                ...r,
                __id: r.__id || `row-${i}-${Date.now()}`,
            }));
        }
        return Array.from({ length: 6 }, () => createEmptyRow());
    });

    // History Stack for Undo / Redo
    const [history, setHistory] = React.useState<Array<Array<Record<string, string>>>>([]);
    const [historyIndex, setHistoryIndex] = React.useState<number>(-1);

    const pushHistory = (newRows: Array<Record<string, string>>) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newRows);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };

    // Filter & View Mode state: 'all' | 'errors'
    const [viewMode, setViewMode] = React.useState<'all' | 'errors'>('all');

    // Column Controls: Pinned columns, Hidden columns, Column filters, Sorting
    const [pinnedKeys, setPinnedKeys] = React.useState<Set<string>>(new Set());
    const [hiddenKeys, setHiddenKeys] = React.useState<Set<string>>(new Set());
    const [columnFilters, setColumnFilters] = React.useState<Record<string, string>>({});
    const [activeFilterColumn, setActiveFilterColumn] = React.useState<string | null>(null);
    const [sortState, setSortState] = React.useState<{ key: string; dir: 'asc' | 'desc' } | null>(null);

    // Search & Replace Dialog state
    const [searchReplaceOpen, setSearchReplaceOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [replaceQuery, setReplaceQuery] = React.useState('');

    // Active Cell state for keyboard navigation and paste
    const [activeCell, setActiveCell] = React.useState<{ rowIndex: number; colKey: string } | null>(null);
    const [submitting, setSubmitting] = React.useState(false);

    // Visible columns list (accounting for hidden columns and keeping pinned columns at left)
    const visibleColumns = React.useMemo(() => {
        const unhidden = columns.filter((c) => !hiddenKeys.has(c.key));
        const pinned = unhidden.filter((c) => pinnedKeys.has(c.key));
        const unpinned = unhidden.filter((c) => !pinnedKeys.has(c.key));
        return [...pinned, ...unpinned];
    }, [columns, hiddenKeys, pinnedKeys]);

    // Validation engine: returns error map per row __id -> Record<colKey, string>
    const errorsMap = React.useMemo(() => {
        const map = new Map<string, Record<string, string>>();
        for (const row of rows) {
            // Check if row is completely empty
            const isCompletelyEmpty = columns.every((c) => !row[c.key]?.trim());
            if (isCompletelyEmpty) continue;

            const rowErrors: Record<string, string> = {};
            for (const col of columns) {
                const val = (row[col.key] ?? '').trim();
                if (col.required && !val) {
                    rowErrors[col.key] = `${col.label} is required`;
                } else if (col.validator && val) {
                    const err = col.validator(val, row);
                    if (err) rowErrors[col.key] = err;
                }
            }
            if (Object.keys(rowErrors).length > 0) {
                map.set(row.__id, rowErrors);
            }
        }
        return map;
    }, [rows, columns]);

    const totalErrorsCount = React.useMemo(() => {
        let count = 0;
        errorsMap.forEach((errs) => {
            count += Object.keys(errs).length;
        });
        return count;
    }, [errorsMap]);

    // Filtered & Sorted Rows
    const displayRows = React.useMemo(() => {
        let result = [...rows];

        // Filter: Errors only
        if (viewMode === 'errors') {
            result = result.filter((r) => errorsMap.has(r.__id));
        }

        // Column-level filters
        for (const [colKey, filterVal] of Object.entries(columnFilters)) {
            if (!filterVal.trim()) continue;
            const q = filterVal.toLowerCase().trim();
            result = result.filter((r) => (r[colKey] || '').toLowerCase().includes(q));
        }

        // Sort
        if (sortState) {
            result.sort((a, b) => {
                const va = (a[sortState.key] || '').toLowerCase();
                const vb = (b[sortState.key] || '').toLowerCase();
                const cmp = va.localeCompare(vb, undefined, { numeric: true });
                return sortState.dir === 'asc' ? cmp : -cmp;
            });
        }

        return result;
    }, [rows, viewMode, errorsMap, columnFilters, sortState]);

    // Cell value updater
    const updateCell = (rowId: string, colKey: string, value: string) => {
        setRows((prev) => {
            const next = prev.map((r) => (r.__id === rowId ? { ...r, [colKey]: value } : r));
            pushHistory(next);
            return next;
        });
    };

    // Add row action
    const handleAddRow = () => {
        setRows((prev) => {
            const next = [...prev, createEmptyRow()];
            pushHistory(next);
            return next;
        });
    };

    // Delete row action
    const handleDeleteRow = (rowId: string) => {
        setRows((prev) => {
            const next = prev.filter((r) => r.__id !== rowId);
            const finalRows = next.length === 0 ? [createEmptyRow()] : next;
            pushHistory(finalRows);
            return finalRows;
        });
    };

    // Undo / Redo Handlers
    const handleUndo = () => {
        if (historyIndex > 0) {
            const prev = history[historyIndex - 1];
            setHistoryIndex(historyIndex - 1);
            setRows(prev);
        }
    };

    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            const next = history[historyIndex + 1];
            setHistoryIndex(historyIndex + 1);
            setRows(next);
        }
    };

    // Search and Replace Handler
    const handleSearchReplace = () => {
        if (!searchQuery) return;
        let count = 0;
        setRows((prev) => {
            const next = prev.map((r) => {
                const updated = { ...r };
                for (const col of columns) {
                    if (updated[col.key] && updated[col.key].includes(searchQuery)) {
                        updated[col.key] = updated[col.key].replaceAll(searchQuery, replaceQuery);
                        count++;
                    }
                }
                return updated;
            });
            pushHistory(next);
            return next;
        });
        toast.success(`Replaced ${count} occurrence${count !== 1 ? 's' : ''}`);
        setSearchReplaceOpen(false);
    };

    // Export current manual spreadsheet to Excel (.xlsx)
    const handleExportExcel = () => {
        const exportData = rows
            .filter((r) => columns.some((c) => (r[c.key] || '').trim() !== ''))
            .map((r) => {
                const item: Record<string, string> = {};
                columns.forEach((c) => {
                    item[c.label] = r[c.key] || '';
                });
                return item;
            });

        if (exportData.length === 0) {
            toast.error('No data to export.');
            return;
        }

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, title);
        XLSX.writeFile(wb, `${title.toLowerCase().replace(/\s+/g, '_')}_manual_entry.xlsx`);
        toast.success(`Exported ${exportData.length} rows to Excel`);
    };

    // Paste Multi-Cell / Excel Grid Clipboard Handler
    const handlePaste = (e: React.ClipboardEvent, startRowIndex: number, startColKey: string) => {
        const text = e.clipboardData.getData('text/plain');
        if (!text || !text.includes('\t') && !text.includes('\n')) return;

        e.preventDefault();
        const pasteRows = text
            .split(/\r?\n/)
            .map((r) => r.split('\t'))
            .filter((r) => r.length > 0 && r.some((c) => c.trim() !== ''));

        if (!pasteRows.length) return;

        const startColIdx = visibleColumns.findIndex((c) => c.key === startColKey);
        if (startColIdx < 0) return;

        setRows((prev) => {
            const next = [...prev];
            // Expand rows if needed to accommodate paste
            while (next.length < startRowIndex + pasteRows.length) {
                next.push(createEmptyRow());
            }

            for (let r = 0; r < pasteRows.length; r++) {
                const targetRowIdx = startRowIndex + r;
                const pasteCols = pasteRows[r];
                const currentRow = { ...next[targetRowIdx] };

                for (let c = 0; c < pasteCols.length; c++) {
                    const targetColIdx = startColIdx + c;
                    if (targetColIdx < visibleColumns.length) {
                        const targetKey = visibleColumns[targetColIdx].key;
                        currentRow[targetKey] = pasteCols[c]?.trim() ?? '';
                    }
                }
                next[targetRowIdx] = currentRow;
            }

            pushHistory(next);
            return next;
        });

        toast.success(`Pasted ${pasteRows.length} rows`);
    };

    // Find Errors Button Handler
    const handleFindErrors = () => {
        if (totalErrorsCount > 0) {
            setViewMode('errors');
            toast.error(`Found ${totalErrorsCount} error${totalErrorsCount !== 1 ? 's' : ''}. Switched to Error rows.`);
        } else {
            const hasData = rows.some((r) => columns.some((c) => (r[c.key] || '').trim() !== ''));
            if (!hasData) {
                toast.info('Spreadsheet is empty. Add entries to validate.');
            } else {
                toast.success('No errors found! All entries are valid.');
            }
        }
    };

    // Complete Import action
    const handleCompleteImport = async () => {
        // Collect non-empty rows
        const filledRows = rows.filter((r) => columns.some((c) => (r[c.key] || '').trim() !== ''));

        if (filledRows.length === 0) {
            toast.error('No entries to import. Please add at least one row.');
            return;
        }

        // Check if there are blocking errors in filled rows
        const hasBlockingErrors = filledRows.some((r) => errorsMap.has(r.__id));
        if (hasBlockingErrors) {
            setViewMode('errors');
            toast.error('Please fix all highlighted errors before completing the import.');
            return;
        }

        setSubmitting(true);
        try {
            const cleanRows = filledRows.map((r) => {
                const cleaned: Record<string, string> = {};
                columns.forEach((c) => {
                    cleaned[c.key] = (r[c.key] || '').trim();
                });
                return cleaned;
            });

            const res = await onCommit(cleanRows);
            if (res.success) {
                toast.success(`Successfully imported ${res.count ?? cleanRows.length} ${entityNamePlural}!`);
            } else {
                toast.error(res.error || 'Failed to complete import.');
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Import failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="w-full space-y-4 text-slate-800">
            {/* Top Bar matching Tacto Screenshot 2 */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                {/* Title / Breadcrumb */}
                <h1 className="text-base font-bold text-slate-900">{title}</h1>

                {/* Toolbar Items */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* Find Errors Button (Orange / Peach) */}
                    <Button
                        type="button"
                        onClick={handleFindErrors}
                        className={cn(
                            'h-8 px-3.5 text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5',
                            totalErrorsCount > 0
                                ? 'bg-[#FF7A00] hover:bg-[#EA6C00] text-white'
                                : 'bg-[#FFD2B8] hover:bg-[#FFC4A3] text-[#C45500]',
                        )}
                    >
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span>Find errors</span>
                        {totalErrorsCount > 0 && (
                            <span className="ml-1 rounded-full bg-white text-[#EA6C00] px-1.5 py-0.2 text-[10px] font-bold">
                                {totalErrorsCount}
                            </span>
                        )}
                    </Button>

                    {/* All Rows / Error Rows Segmented Toggle */}
                    <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs">
                        <button
                            type="button"
                            onClick={() => setViewMode('all')}
                            className={cn(
                                'px-3 py-1 rounded-md font-medium transition-all cursor-pointer',
                                viewMode === 'all'
                                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                                    : 'text-slate-500 hover:text-slate-800',
                            )}
                        >
                            All rows ({rows.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('errors')}
                            className={cn(
                                'px-3 py-1 rounded-md font-medium transition-all cursor-pointer flex items-center gap-1',
                                viewMode === 'errors'
                                    ? 'bg-white text-rose-700 shadow-2xs font-semibold'
                                    : 'text-slate-500 hover:text-slate-800',
                                totalErrorsCount > 0 && 'text-rose-600',
                            )}
                        >
                            <span>Error rows</span>
                            <span
                                className={cn(
                                    'rounded px-1 text-[10px] font-bold',
                                    totalErrorsCount > 0 ? 'bg-rose-100 text-rose-700' : 'text-slate-400',
                                )}
                            >
                                ({Array.from(errorsMap.keys()).length})
                            </span>
                        </button>
                    </div>

                    {/* Undo / Redo Buttons */}
                    <div className="flex items-center gap-0.5 border border-slate-200 rounded-lg p-0.5 bg-white">
                        <button
                            type="button"
                            onClick={handleUndo}
                            disabled={historyIndex <= 0}
                            title="Undo (Ctrl+Z)"
                            className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                        >
                            <Undo2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                            type="button"
                            onClick={handleRedo}
                            disabled={historyIndex >= history.length - 1}
                            title="Redo (Ctrl+Y)"
                            className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                        >
                            <Redo2 className="h-3.5 w-3.5" />
                        </button>
                    </div>

                    {/* Search & Replace Button */}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSearchReplaceOpen(true)}
                        className="h-8 px-2.5 text-xs text-slate-700 border-slate-200 hover:bg-slate-50 gap-1.5 rounded-lg cursor-pointer"
                    >
                        <Search className="h-3.5 w-3.5 text-slate-400" />
                        <span>Search &amp; Replace</span>
                    </Button>

                    {/* Export to Excel Button */}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleExportExcel}
                        className="h-8 px-2.5 text-xs text-slate-700 border-slate-200 hover:bg-slate-50 gap-1.5 rounded-lg cursor-pointer"
                    >
                        <Download className="h-3.5 w-3.5 text-slate-400" />
                        <span>Export to Excel</span>
                    </Button>
                </div>
            </div>

            {/* Interactive Spreadsheet Grid Container */}
            <div className="border border-slate-200 rounded-xl bg-white shadow-xs overflow-hidden relative">
                <div className="overflow-x-auto max-h-[500px] custom-table-scrollbar">
                    <table className="w-full text-xs border-collapse">
                        {/* Table Header Row */}
                        <thead className="bg-slate-50/90 sticky top-0 z-20 border-b border-slate-200 select-none text-[11px] font-semibold text-slate-600">
                            <tr>
                                {/* Row Number / Add Row Column */}
                                <th className="w-12 px-2 py-2.5 text-center bg-slate-100/90 border-r border-slate-200 sticky left-0 z-30 font-mono text-slate-400">
                                    #
                                </th>

                                {visibleColumns.map((col) => {
                                    const isPinned = pinnedKeys.has(col.key);
                                    const isFilterActive = !!columnFilters[col.key];

                                    return (
                                        <th
                                            key={`th-${col.key}`}
                                            className={cn(
                                                'px-3 py-2 border-r border-slate-200 min-w-[160px] text-left font-medium relative group bg-slate-50/90',
                                                isPinned && 'bg-amber-50/60 sticky z-20',
                                            )}
                                        >
                                            <div className="flex items-center justify-between gap-1.5">
                                                <span className="truncate text-slate-800 font-semibold" title={col.label}>
                                                    {col.label}
                                                    {col.required && <span className="text-rose-500 ml-0.5">*</span>}
                                                </span>

                                                {/* 3-Dots Dropdown Trigger (Matching Screenshot 3) */}
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button
                                                            type="button"
                                                            className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-200/80 transition-colors cursor-pointer"
                                                            title={`Options for ${col.label}`}
                                                        >
                                                            <MoreHorizontal className="h-3.5 w-3.5" />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent
                                                        align="start"
                                                        side="bottom"
                                                        className="w-48 p-1 rounded-xl shadow-xl border border-slate-200 bg-white z-50 text-xs"
                                                    >
                                                        {/* Sort Ascending */}
                                                        <DropdownMenuItem
                                                            onClick={() => setSortState({ key: col.key, dir: 'asc' })}
                                                            className="flex items-center gap-2.5 px-2.5 py-1.5 cursor-pointer rounded-lg hover:bg-slate-100"
                                                        >
                                                            <ArrowUpAZ className="h-3.5 w-3.5 text-slate-500" />
                                                            <span>Sort ascending</span>
                                                        </DropdownMenuItem>

                                                        {/* Sort Descending */}
                                                        <DropdownMenuItem
                                                            onClick={() => setSortState({ key: col.key, dir: 'desc' })}
                                                            className="flex items-center gap-2.5 px-2.5 py-1.5 cursor-pointer rounded-lg hover:bg-slate-100"
                                                        >
                                                            <ArrowDownZA className="h-3.5 w-3.5 text-slate-500" />
                                                            <span>Sort descending</span>
                                                        </DropdownMenuItem>

                                                        <DropdownMenuSeparator className="my-1 bg-slate-100" />

                                                        {/* Pin / Unpin Column */}
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                setPinnedKeys((prev) => {
                                                                    const next = new Set(prev);
                                                                    if (next.has(col.key)) next.delete(col.key);
                                                                    else next.add(col.key);
                                                                    return next;
                                                                });
                                                            }}
                                                            className="flex items-center gap-2.5 px-2.5 py-1.5 cursor-pointer rounded-lg hover:bg-slate-100"
                                                        >
                                                            <Pin className={cn('h-3.5 w-3.5', isPinned ? 'text-[#FF7A00]' : 'text-slate-500')} />
                                                            <span>{isPinned ? 'Unpin column' : 'Pin column'}</span>
                                                        </DropdownMenuItem>

                                                        {/* Hide Column */}
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                if (visibleColumns.length > 1) {
                                                                    setHiddenKeys((prev) => new Set(prev).add(col.key));
                                                                } else {
                                                                    toast.error('Cannot hide the only visible column');
                                                                }
                                                            }}
                                                            className="flex items-center gap-2.5 px-2.5 py-1.5 cursor-pointer rounded-lg hover:bg-slate-100"
                                                        >
                                                            <EyeOff className="h-3.5 w-3.5 text-slate-500" />
                                                            <span>Hide column</span>
                                                        </DropdownMenuItem>

                                                        <DropdownMenuSeparator className="my-1 bg-slate-100" />

                                                        {/* Filter Column */}
                                                        <DropdownMenuItem
                                                            onClick={() => setActiveFilterColumn(activeFilterColumn === col.key ? null : col.key)}
                                                            className="flex items-center gap-2.5 px-2.5 py-1.5 cursor-pointer rounded-lg hover:bg-slate-100"
                                                        >
                                                            <Filter className={cn('h-3.5 w-3.5', isFilterActive ? 'text-[#FF7A00]' : 'text-slate-500')} />
                                                            <span>Filter</span>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>

                                            {/* Column Filter Input Bar */}
                                            {activeFilterColumn === col.key && (
                                                <div className="mt-1.5 flex items-center gap-1">
                                                    <Input
                                                        type="text"
                                                        placeholder={`Filter ${col.label}...`}
                                                        value={columnFilters[col.key] || ''}
                                                        onChange={(e) =>
                                                            setColumnFilters((prev) => ({ ...prev, [col.key]: e.target.value }))
                                                        }
                                                        className="h-6 text-[11px] px-2 rounded border-slate-300 bg-white"
                                                        autoFocus
                                                    />
                                                    {columnFilters[col.key] && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setColumnFilters((prev) => {
                                                                    const next = { ...prev };
                                                                    delete next[col.key];
                                                                    return next;
                                                                })
                                                            }
                                                            className="text-slate-400 hover:text-slate-700 p-0.5"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>

                        {/* Table Body */}
                        <tbody className="divide-y divide-slate-100">
                            {displayRows.map((row, rowIdx) => {
                                const rowErrors = errorsMap.get(row.__id);
                                const hasRowErrors = !!rowErrors && Object.keys(rowErrors).length > 0;

                                return (
                                    <tr
                                        key={row.__id}
                                        className={cn(
                                            'transition-colors group',
                                            hasRowErrors ? 'bg-rose-50/40 hover:bg-rose-50/70' : 'hover:bg-slate-50/60',
                                        )}
                                    >
                                        {/* Row Number & Delete Action */}
                                        <td className="w-12 px-2 py-1 text-center font-mono border-r border-slate-200 sticky left-0 z-10 select-none bg-slate-50/80 text-slate-400 group-hover:bg-slate-100/90">
                                            <div className="relative flex items-center justify-center">
                                                <span className="group-hover:hidden text-[11px]">{rowIdx + 1}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteRow(row.__id)}
                                                    className="hidden group-hover:flex p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                                    title="Delete row"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </div>
                                        </td>

                                        {/* Editable Cells */}
                                        {visibleColumns.map((col) => {
                                            const cellValue = row[col.key] ?? '';
                                            const cellError = rowErrors?.[col.key];
                                            const isPinned = pinnedKeys.has(col.key);
                                            const isFocused =
                                                activeCell?.rowIndex === rowIdx && activeCell?.colKey === col.key;

                                            return (
                                                <td
                                                    key={`cell-${row.__id}-${col.key}`}
                                                    className={cn(
                                                        'px-0 py-0 border-r border-slate-200 relative',
                                                        isPinned && 'bg-amber-50/20 sticky',
                                                        cellError && 'bg-rose-100/70',
                                                    )}
                                                >
                                                    <input
                                                        type="text"
                                                        value={cellValue}
                                                        placeholder={col.placeholder}
                                                        onFocus={() => setActiveCell({ rowIndex: rowIdx, colKey: col.key })}
                                                        onChange={(e) => updateCell(row.__id, col.key, e.target.value)}
                                                        onPaste={(e) => handlePaste(e, rowIdx, col.key)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                if (rowIdx === displayRows.length - 1) {
                                                                    handleAddRow();
                                                                }
                                                            }
                                                        }}
                                                        className={cn(
                                                            'w-full h-8 px-3 py-1 bg-transparent text-xs text-slate-800 outline-none border border-transparent font-sans',
                                                            isFocused && 'ring-2 ring-[#FF7A00] ring-inset bg-white z-10',
                                                            cellError && 'text-rose-900 font-medium placeholder:text-rose-300',
                                                        )}
                                                        title={cellError || undefined}
                                                    />
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}

                            {/* Blank Append Row with (+) in row number column */}
                            <tr className="bg-slate-50/30 hover:bg-slate-50/60 transition-colors">
                                <td className="w-12 px-2 py-1 text-center font-mono border-r border-slate-200 sticky left-0 z-10 bg-slate-50/80">
                                    <button
                                        type="button"
                                        onClick={handleAddRow}
                                        className="w-full h-7 flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                                        title="Add new row"
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                    </button>
                                </td>
                                <td colSpan={visibleColumns.length} className="px-3 py-1.5 text-xs text-slate-400 select-none">
                                    <span className="text-[11px] text-slate-400 italic">
                                        Click + or type on the last row to add a new line
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bottom Action Bar matching Tacto Screenshot 2 */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 bg-white">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onBack}
                    className="h-9 px-4 text-xs font-medium rounded-lg text-slate-700 border-slate-200 hover:bg-slate-50 cursor-pointer"
                >
                    <ChevronLeft className="h-4 w-4 mr-1 text-slate-500" />
                    Back
                </Button>

                <Button
                    type="button"
                    size="sm"
                    onClick={handleCompleteImport}
                    disabled={submitting}
                    className="h-9 px-6 text-xs font-semibold bg-[#FF7A00] hover:bg-[#EA6C00] text-white rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                    {submitting ? (
                        <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                            Completing import...
                        </>
                    ) : (
                        `Complete import`
                    )}
                </Button>
            </div>

            {/* Search & Replace Modal Dialog */}
            <Dialog open={searchReplaceOpen} onOpenChange={setSearchReplaceOpen}>
                <DialogContent className="max-w-md p-6 rounded-2xl bg-white shadow-xl">
                    <DialogHeader className="text-left">
                        <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <Replace className="h-4 w-4 text-[#FF7A00]" />
                            Search &amp; Replace
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-500">
                            Find text across all cells and replace with new values.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 my-3 text-xs">
                        <div>
                            <label className="font-medium text-slate-700 block mb-1">Find:</label>
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search string..."
                                className="h-8 text-xs"
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="font-medium text-slate-700 block mb-1">Replace with:</label>
                            <Input
                                value={replaceQuery}
                                onChange={(e) => setReplaceQuery(e.target.value)}
                                placeholder="Replacement string..."
                                className="h-8 text-xs"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSearchReplaceOpen(false)}
                            className="h-8 text-xs"
                        >
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleSearchReplace}
                            disabled={!searchQuery}
                            className="h-8 text-xs font-semibold bg-[#FF7A00] hover:bg-[#EA6C00] text-white"
                        >
                            Replace All
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
