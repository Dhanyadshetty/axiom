'use client';

import * as React from 'react';
import * as XLSX from 'xlsx';
import {
    Plus,
    Search,
    ChevronDown,
    ChevronRight,
    ArrowUpDown,
    Tag,
    Upload,
    Package,
    Check,
    FilePlus2,
    Loader2,
    Trash2,
    X,
    FileText,
    ArrowLeftRight,
    Handshake,
    Download,
    Command,
    FileSpreadsheet,
    MoreVertical,
    ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
    ARTICLE_COLUMNS,
    type ArticleColumnKey,
    type ArticleItem,
    type FilterableField,
} from './articles-schema';
import { AddArticleModal } from './add-article-modal';
import { ArticlesImportModal } from './articles-import-modal';
import { ArticlesFilterChip, type FilterChipState } from './articles-filter-chip';
import { AddFilterPopover } from './add-filter-popover';
import { ColumnsVisibilityDropdown } from './columns-visibility-dropdown';
import {
    listArticles,
    deleteArticle,
    bulkDeleteArticles,
    createRFQFromArticles,
    createRequestFromArticles,
} from '@/app/actions/articles';
import { toast } from 'sonner';

export interface ArticlesTableProps {
    className?: string;
    initialData?: ArticleItem[];
}

export function ArticlesTable({ className, initialData = [] }: ArticlesTableProps) {
    const [rawArticles, setRawArticles] = React.useState<ArticleItem[]>(initialData);
    const [loading, setLoading] = React.useState(true);
    const [search, setSearch] = React.useState('');
    const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
    const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);

    // Active column visibility
    const [visibleColumns, setVisibleColumns] = React.useState<Set<ArticleColumnKey>>(
        () => new Set(ARTICLE_COLUMNS.map((c) => c.key))
    );

    // Filter connector: 'and' | 'or' (matches Screenshot 1)
    const [filterConnector, setFilterConnector] = React.useState<'and' | 'or'>('and');

    // Default filters: Article and Category (matches Screenshot 1, 2, 3)
    const [filterChips, setFilterChips] = React.useState<FilterChipState[]>([
        {
            id: 'filter-article',
            fieldKey: 'article',
            fieldLabel: 'Article',
            operator: 'is_one_of',
            values: [],
            isRemovable: false,
        },
        {
            id: 'filter-category',
            fieldKey: 'category',
            fieldLabel: 'Category',
            operator: 'is_one_of',
            values: [],
            isRemovable: false,
        },
    ]);

    // Sorting
    const [sortField, setSortField] = React.useState<ArticleColumnKey | null>('article');
    const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');

    // Load data from backend
    const loadArticlesData = React.useCallback(async () => {
        setLoading(true);
        try {
            const res = await listArticles({
                search,
                sortBy: sortField || 'article',
                sortDir: sortDirection,
            });
            setRawArticles(res.rows);
        } catch (error) {
            console.error('[ArticlesTable] Error loading articles:', error);
        } finally {
            setLoading(false);
        }
    }, [search, sortField, sortDirection]);

    React.useEffect(() => {
        loadArticlesData();
    }, [loadArticlesData]);

    // Client-side multi-filter evaluation matching all 11 operators & AND/OR connectors
    const filteredArticles = React.useMemo(() => {
        return rawArticles.filter((item) => {
            // Global search query
            if (search.trim()) {
                const q = search.toLowerCase().trim();
                const matchesSearch =
                    item.articleNumber.toLowerCase().includes(q) ||
                    (item.description && item.description.toLowerCase().includes(q)) ||
                    (item.longText && item.longText.toLowerCase().includes(q)) ||
                    (item.cnCode && item.cnCode.toLowerCase().includes(q)) ||
                    (item.category && item.category.toLowerCase().includes(q));
                if (!matchesSearch) return false;
            }

            // Filter chips evaluation
            const activeChips = filterChips.filter(
                (c) =>
                    c.values.length > 0 ||
                    c.textValue?.trim() ||
                    c.operator === 'blank' ||
                    c.operator === 'not_blank'
            );

            if (activeChips.length === 0) return true;

            const evaluateChip = (chip: FilterChipState): boolean => {
                let fieldValue: string | number | null | undefined = '';
                if (chip.fieldKey === 'article' || chip.fieldKey === 'articleNumber') {
                    fieldValue = item.articleNumber;
                } else if (chip.fieldKey === 'description') {
                    fieldValue = item.description;
                } else if (chip.fieldKey === 'longText') {
                    fieldValue = item.longText;
                } else if (chip.fieldKey === 'cnCode') {
                    fieldValue = item.cnCode;
                } else if (chip.fieldKey === 'category') {
                    fieldValue = item.category;
                } else if (chip.fieldKey === 'createdAt') {
                    fieldValue = item.createdAt;
                } else if (chip.fieldKey === 'lastUpdated') {
                    fieldValue = item.lastUpdated;
                } else if (chip.fieldKey === 'budgetPrice') {
                    fieldValue = item.budgetPrice;
                } else if (chip.fieldKey === 'netWeight') {
                    fieldValue = item.netWeight;
                } else if (chip.fieldKey === 'netWeightUnit') {
                    fieldValue = item.netWeightUnit;
                } else if (chip.fieldKey === 'costModel') {
                    fieldValue = item.costModel;
                }

                const strVal = fieldValue != null ? String(fieldValue).toLowerCase().trim() : '';

                switch (chip.operator) {
                    case 'is_one_of':
                        if (chip.values.length === 0) return true;
                        return chip.values.some((v) => {
                            const valLower = v.toLowerCase();
                            return (
                                strVal === valLower ||
                                (chip.fieldKey === 'article' && item.articleNumber.toLowerCase() === valLower)
                            );
                        });
                    case 'is_none_of':
                        if (chip.values.length === 0) return true;
                        return !chip.values.some((v) => {
                            const valLower = v.toLowerCase();
                            return (
                                strVal === valLower ||
                                (chip.fieldKey === 'article' && item.articleNumber.toLowerCase() === valLower)
                            );
                        });
                    case 'blank':
                        return fieldValue == null || strVal === '';
                    case 'not_blank':
                        return fieldValue != null && strVal !== '';
                    case 'contains':
                        return !chip.textValue || strVal.includes(chip.textValue.toLowerCase().trim());
                    case 'does_not_contain':
                        return !chip.textValue || !strVal.includes(chip.textValue.toLowerCase().trim());
                    case 'equals':
                        return !chip.textValue || strVal === chip.textValue.toLowerCase().trim();
                    case 'does_not_equal':
                        return !chip.textValue || strVal !== chip.textValue.toLowerCase().trim();
                    case 'begins_with':
                        return !chip.textValue || strVal.startsWith(chip.textValue.toLowerCase().trim());
                    case 'does_not_begin_with':
                        return !chip.textValue || !strVal.startsWith(chip.textValue.toLowerCase().trim());
                    case 'ends_with':
                        return !chip.textValue || strVal.endsWith(chip.textValue.toLowerCase().trim());
                    default:
                        return true;
                }
            };

            if (filterConnector === 'or') {
                return activeChips.some(evaluateChip);
            } else {
                return activeChips.every(evaluateChip);
            }
        });
    }, [rawArticles, search, filterChips, filterConnector]);

    const handleSort = (key: ArticleColumnKey) => {
        if (sortField === key) {
            setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(key);
            setSortDirection('asc');
        }
    };

    const toggleColumn = (key: ArticleColumnKey) => {
        setVisibleColumns((prev) => {
            const next = new Set(prev);
            if (next.has(key)) {
                if (next.size > 1 && key !== 'article') {
                    next.delete(key);
                }
            } else {
                next.add(key);
            }
            return next;
        });
    };

    const handleToggleAllColumns = (selectAll: boolean) => {
        if (selectAll) {
            setVisibleColumns(new Set(ARTICLE_COLUMNS.map((c) => c.key)));
        } else {
            // Keep required primary column 'article'
            setVisibleColumns(new Set(['article']));
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(new Set(filteredArticles.map((a) => a.id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleClearSelection = () => {
        setSelectedIds(new Set());
    };

    const handleSelectRow = (id: string, checked: boolean) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (checked) {
                next.add(id);
            } else {
                next.delete(id);
            }
            return next;
        });
    };

    const handleArticleCreated = (newArticle: ArticleItem) => {
        setRawArticles((prev) => [newArticle, ...prev]);
        loadArticlesData();
    };

    const handleImportSuccess = () => {
        loadArticlesData();
        toast.success('Articles refreshed from database');
    };

    // Single Article Delete with database persistence
    const handleDeleteSingleArticle = async (id: string, articleNumber: string) => {
        try {
            const res = await deleteArticle(id || articleNumber);
            if (res.success) {
                setRawArticles((prev) => prev.filter((a) => a.id !== id && a.articleNumber !== articleNumber));
                setSelectedIds((prev) => {
                    const next = new Set(prev);
                    next.delete(id);
                    next.delete(articleNumber);
                    return next;
                });
                toast.success(`Article ${articleNumber} deleted`);
                await loadArticlesData();
            } else {
                toast.error(res.error || 'Failed to delete article');
            }
        } catch {
            toast.error('Failed to delete article');
        }
    };

    // Open article in new tab
    const handleOpenInNewTab = (item: ArticleItem) => {
        const targetUrl = `/articles/${encodeURIComponent(item.articleNumber || item.id)}`;
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
    };

    // Real backend Bulk Delete
    const handleBulkDelete = async () => {
        if (!selectedIds.size) return;
        const ids = Array.from(selectedIds);
        try {
            const res = await bulkDeleteArticles(ids);
            if (res.success) {
                // Optimistically update local state immediately
                setRawArticles((prev) => prev.filter((a) => !selectedIds.has(a.id) && !selectedIds.has(a.articleNumber)));
                setSelectedIds(new Set());
                toast.success(`Deleted ${res.count} article${res.count !== 1 ? 's' : ''}`);
                await loadArticlesData();
            } else {
                toast.error(res.error || 'Failed to delete articles');
            }
        } catch {
            toast.error('Failed to delete articles');
        }
    };

    // Real backend Create Request
    const handleCreateRequest = async () => {
        const ids = Array.from(selectedIds);
        try {
            const res = await createRequestFromArticles(ids);
            if (res.success) {
                toast.success(res.message);
                handleClearSelection();
            } else {
                toast.error(res.message);
            }
        } catch {
            toast.error('Failed to create request');
        }
    };

    // Real backend Create RFQ
    const handleCreateRFQ = async () => {
        const ids = Array.from(selectedIds);
        try {
            const res = await createRFQFromArticles(ids);
            if (res.success) {
                toast.success(res.message);
                handleClearSelection();
            } else {
                toast.error(res.message);
            }
        } catch {
            toast.error('Failed to draft RFQ');
        }
    };

    // Export CSV
    const handleExportCSV = () => {
        const selectedArticles = filteredArticles.filter((a) => selectedIds.has(a.id));
        const itemsToExport = selectedArticles.length > 0 ? selectedArticles : filteredArticles;

        const data = itemsToExport.map((a) => ({
            'Article number': a.articleNumber || '',
            'Description': a.description || '',
            'Long text': a.longText || '',
            'CN code': a.cnCode || '',
            'Category': a.category || '',
            'Net weight': a.netWeight != null ? a.netWeight : '',
            'Net weight unit': a.netWeightUnit || '',
            'Created At': a.createdAt || '',
            'Last Updated': a.lastUpdated || '',
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
        const blob = new Blob(['\uFEFF' + csvOutput], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `articles_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success(`Exported ${itemsToExport.length} articles to CSV`);
    };

    // Export Excel (.xlsx) using native OpenXML format
    const handleExportExcel = () => {
        const selectedArticles = filteredArticles.filter((a) => selectedIds.has(a.id));
        const itemsToExport = selectedArticles.length > 0 ? selectedArticles : filteredArticles;

        const data = itemsToExport.map((a) => ({
            'Article number': a.articleNumber || '',
            'Description': a.description || '',
            'Long text': a.longText || '',
            'CN code': a.cnCode || '',
            'Category': a.category || '',
            'Net weight': a.netWeight != null ? a.netWeight : '',
            'Net weight unit': a.netWeightUnit || '',
            'Created At': a.createdAt || '',
            'Last Updated': a.lastUpdated || '',
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Articles');

        // Column widths for optimal presentation
        worksheet['!cols'] = [
            { wch: 18 },
            { wch: 32 },
            { wch: 35 },
            { wch: 14 },
            { wch: 25 },
            { wch: 12 },
            { wch: 15 },
            { wch: 14 },
            { wch: 14 },
        ];

        XLSX.writeFile(workbook, `articles_${new Date().toISOString().slice(0, 10)}.xlsx`);
        toast.success(`Exported ${itemsToExport.length} articles to Excel (.xlsx)`);
    };

    // Update existing filter chip
    const handleUpdateFilter = (updated: FilterChipState) => {
        setFilterChips((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
    };

    // Remove custom filter chip
    const handleRemoveFilter = (id: string) => {
        setFilterChips((prev) => prev.filter((f) => f.id !== id));
    };

    // Add new filter from + Add filter popover (matches Screenshot 2 & 5)
    const handleSelectFieldToAdd = (field: FilterableField) => {
        const newChip: FilterChipState = {
            id: `filter-${field.key}-${Date.now()}`,
            fieldKey: field.key,
            fieldLabel: field.label,
            operator: field.kind === 'select' ? 'is_one_of' : 'contains',
            values: [],
            textValue: '',
            isRemovable: true,
        };
        setFilterChips((prev) => [...prev, newChip]);
    };

    const isAllSelected = filteredArticles.length > 0 && selectedIds.size === filteredArticles.length;
    const isSomeSelected = selectedIds.size > 0 && selectedIds.size < filteredArticles.length;

    const displaySelectedCount = selectedIds.size.toLocaleString();

    return (
        <div className={cn('relative flex flex-col h-full bg-white text-slate-900', className)}>
            {/* Top Title (matches Screenshot 1) */}
            <div className="px-6 pt-5 pb-3">
                <h1 className="text-[22px] font-bold tracking-tight text-slate-900">Articles</h1>
            </div>

            {/* Filter & Action Controls Bar (matches Screenshot 1) */}
            <div className="px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 bg-white">
                {/* Left Side: Filter Chips with and/or Connector and Add Filter Button */}
                <div className="flex flex-wrap items-center gap-2">
                    {filterChips.map((chip, index) => (
                        <React.Fragment key={chip.id}>
                            {index > 0 && (
                                /* and / or connector dropdown (matches Screenshot 1) */
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="px-2 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer inline-flex items-center gap-1">
                                            <span>{filterConnector}</span>
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-24 p-1 rounded-xl shadow-lg border border-slate-200 bg-white z-50">
                                        <DropdownMenuItem
                                            onClick={() => setFilterConnector('and')}
                                            className="flex items-center justify-between px-3 py-1.5 text-xs font-medium cursor-pointer rounded-lg hover:bg-slate-100"
                                        >
                                            <span>and</span>
                                            {filterConnector === 'and' && <Check className="h-3.5 w-3.5 text-slate-800" />}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => setFilterConnector('or')}
                                            className="flex items-center justify-between px-3 py-1.5 text-xs font-medium cursor-pointer rounded-lg hover:bg-slate-100"
                                        >
                                            <span>or</span>
                                            {filterConnector === 'or' && <Check className="h-3.5 w-3.5 text-slate-800" />}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}

                            {/* Filter Chip (matches Screenshot 1, 3 & 4) */}
                            <ArticlesFilterChip
                                filter={chip}
                                onUpdateFilter={handleUpdateFilter}
                                onRemoveFilter={handleRemoveFilter}
                            />
                        </React.Fragment>
                    ))}

                    {/* + Add Filter Popover (matches Screenshot 2 & 5) */}
                    <AddFilterPopover onSelectField={handleSelectFieldToAdd} />
                </div>

                {/* Right Side: Search, Columns, Add new */}
                <div className="flex items-center gap-2.5">
                    {/* Search Bar (matches Screenshot 1) */}
                    <div className="relative w-56 sm:w-64">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                        <Input
                            type="text"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-8.5 pl-8.5 pr-3 text-xs bg-white border-slate-200 rounded-lg focus-visible:ring-1 focus-visible:ring-slate-400 placeholder:text-slate-400"
                        />
                    </div>

                    {/* Columns Selector (matches Screenshot 1: Columns 8/8 ⌄) */}
                    <ColumnsVisibilityDropdown
                        visibleColumns={visibleColumns}
                        onToggleColumn={toggleColumn}
                        onToggleAll={handleToggleAllColumns}
                    />

                    {/* + Add new Button (matches Screenshot 1: + Add new ⌄) */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                size="sm"
                                className="h-8.5 px-3.5 bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold gap-1.5 rounded-lg shadow-2xs cursor-pointer"
                            >
                                <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                                <span>Add new</span>
                                <ChevronDown className="h-3.5 w-3.5 text-slate-300" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 p-1 rounded-xl shadow-xl border border-slate-200 bg-white z-50">
                            <DropdownMenuItem
                                onClick={() => setIsAddModalOpen(true)}
                                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-800 cursor-pointer rounded-lg hover:bg-slate-100"
                            >
                                <FilePlus2 className="h-4 w-4 text-slate-600" />
                                <span>Create article</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setIsImportModalOpen(true)}
                                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-800 cursor-pointer rounded-lg hover:bg-slate-100"
                            >
                                <Upload className="h-4 w-4 text-slate-600" />
                                <span>Import articles</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Table Area (matches Screenshot 1 layout) */}
            <div className="flex-1 overflow-x-auto overflow-y-auto relative">
                <table className="w-full text-left text-xs border-collapse">
                    <thead>
                        <tr className="border-b border-slate-200 bg-white text-slate-600 font-medium select-none sticky top-0 z-10 shadow-2xs">
                            {/* Checkbox Header */}
                            <th className="w-10 px-3 py-2.5 text-center">
                                <Checkbox
                                    checked={isAllSelected || (isSomeSelected ? 'indeterminate' : false)}
                                    onCheckedChange={handleSelectAll}
                                    aria-label="Select all"
                                    className="translate-y-[1px] rounded border-slate-300 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
                                />
                            </th>

                            {/* Article Header (matches Screenshot 1) */}
                            {visibleColumns.has('article') && (
                                <th
                                    onClick={() => handleSort('article')}
                                    className="px-4 py-2.5 text-[12px] font-semibold text-slate-700 whitespace-nowrap cursor-pointer hover:text-slate-900"
                                >
                                    <div className="inline-flex items-center gap-1.5">
                                        <span>Article</span>
                                        <ArrowUpDown className="h-3 w-3 text-slate-400" />
                                    </div>
                                </th>
                            )}

                            {/* Empty header for description column (matches Screenshot 1) */}
                            {visibleColumns.has('article') && (
                                <th className="px-4 py-2.5 text-[12px] font-semibold text-slate-700 whitespace-nowrap min-w-[160px]">
                                    {/* Empty / Description spacer matching Tacto */}
                                </th>
                            )}

                            {visibleColumns.has('longText') && (
                                <th className="px-4 py-2.5 text-[12px] font-semibold text-slate-700 whitespace-nowrap">
                                    Long text
                                </th>
                            )}

                            {visibleColumns.has('cnCode') && (
                                <th className="px-4 py-2.5 text-[12px] font-semibold text-slate-700 whitespace-nowrap">
                                    CN code
                                </th>
                            )}

                            {visibleColumns.has('category') && (
                                <th className="px-4 py-2.5 text-[12px] font-semibold text-slate-700 whitespace-nowrap">
                                    <div className="inline-flex items-center gap-1.5">
                                        <Tag className="h-3.5 w-3.5 text-rose-500 fill-rose-100" />
                                        <span>Category</span>
                                    </div>
                                </th>
                            )}

                            {visibleColumns.has('createdAt') && (
                                <th
                                    onClick={() => handleSort('createdAt')}
                                    className="px-4 py-2.5 text-[12px] font-semibold text-slate-700 whitespace-nowrap cursor-pointer hover:text-slate-900"
                                >
                                    Created at
                                </th>
                            )}

                            {visibleColumns.has('lastUpdated') && (
                                <th
                                    onClick={() => handleSort('lastUpdated')}
                                    className="px-4 py-2.5 text-[12px] font-semibold text-slate-700 whitespace-nowrap cursor-pointer hover:text-slate-900"
                                >
                                    Last update...
                                </th>
                            )}

                            {visibleColumns.has('netWeight') && (
                                <th
                                    onClick={() => handleSort('netWeight')}
                                    className="px-4 py-2.5 text-[12px] font-semibold text-slate-700 whitespace-nowrap text-right cursor-pointer hover:text-slate-900"
                                >
                                    Net weight
                                </th>
                            )}

                            {visibleColumns.has('netWeightUnit') && (
                                <th className="px-4 py-2.5 text-[12px] font-semibold text-slate-700 whitespace-nowrap">
                                    Net weight unit
                                </th>
                            )}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan={visibleColumns.size + 2} className="py-20 text-center">
                                    <div className="flex flex-col items-center justify-center space-y-2 text-slate-400">
                                        <Loader2 className="h-6 w-6 animate-spin text-slate-600" />
                                        <span className="text-xs">Loading articles...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredArticles.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={visibleColumns.size + 2}
                                    className="py-24 text-center text-slate-500"
                                >
                                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-3">
                                        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                            <Package className="h-6 w-6" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-semibold text-slate-800">No matching articles</p>
                                            <p className="text-xs text-slate-500">
                                                No articles found or all selected articles have been deleted.
                                            </p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredArticles.map((item) => {
                                const isSelected = selectedIds.has(item.id);
                                return (
                                    <tr
                                        key={item.id}
                                        className={cn(
                                            'hover:bg-slate-50/80 transition-colors cursor-pointer group text-slate-700',
                                            isSelected && 'bg-slate-50'
                                        )}
                                        onClick={() => handleSelectRow(item.id, !isSelected)}
                                    >
                                        <td className="w-10 px-3 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={(checked) => handleSelectRow(item.id, !!checked)}
                                                aria-label={`Select article ${item.articleNumber}`}
                                                className="translate-y-[1px] rounded border-slate-300 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
                                            />
                                        </td>

                                        {/* Article Number Column (matches Screenshot 1) */}
                                        {visibleColumns.has('article') && (
                                            <td className="px-4 py-2 font-normal text-slate-900 whitespace-nowrap">
                                                {item.articleNumber}
                                            </td>
                                        )}

                                        {/* Article Description Column (matches Screenshot 1: ISOLIERSCHLAUCH, 3-dots menu...) */}
                                        {visibleColumns.has('article') && (
                                            <td className="px-4 py-2 font-normal text-slate-800 whitespace-nowrap">
                                                <div className="flex items-center justify-between gap-3">
                                                    <span className="truncate">{item.description || ''}</span>
                                                    <div onClick={(e) => e.stopPropagation()}>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <button
                                                                    type="button"
                                                                    aria-label={`Actions for article ${item.articleNumber}`}
                                                                    className="opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100 transition-opacity h-6 w-6 flex items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 shadow-2xs cursor-pointer focus:outline-none focus:opacity-100"
                                                                >
                                                                    <MoreVertical className="h-3.5 w-3.5" />
                                                                </button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent
                                                                align="start"
                                                                side="bottom"
                                                                sideOffset={4}
                                                                className="w-48 p-1.5 rounded-xl shadow-xl border border-slate-200 bg-white text-slate-800 z-50 animate-in fade-in zoom-in-95 duration-100"
                                                            >
                                                                <DropdownMenuItem
                                                                    onClick={() => handleOpenInNewTab(item)}
                                                                    className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-slate-700 hover:text-slate-900 cursor-pointer rounded-lg hover:bg-slate-100 transition-colors"
                                                                >
                                                                    <ExternalLink className="h-4 w-4 text-slate-500" />
                                                                    <span>Open in new tab</span>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => handleDeleteSingleArticle(item.id, item.articleNumber)}
                                                                    className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer rounded-lg transition-colors font-medium"
                                                                >
                                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                                    <span>Delete Article</span>
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </div>
                                            </td>
                                        )}

                                        {/* Long Text Column */}
                                        {visibleColumns.has('longText') && (
                                            <td className="px-4 py-2 text-slate-600 max-w-[200px] truncate">
                                                {item.longText || ''}
                                            </td>
                                        )}

                                        {/* CN Code Column */}
                                        {visibleColumns.has('cnCode') && (
                                            <td className="px-4 py-2 text-slate-700 whitespace-nowrap font-normal">
                                                {item.cnCode || ''}
                                            </td>
                                        )}

                                        {/* Category Column (matches Screenshot 1 with red tag icon) */}
                                        {visibleColumns.has('category') && (
                                            <td className="px-4 py-2 whitespace-nowrap">
                                                {item.category ? (
                                                    <span className="inline-flex items-center gap-1.5 text-slate-800 font-normal">
                                                        <Tag className="h-3.5 w-3.5 text-rose-500 fill-rose-100 shrink-0" />
                                                        <span>{item.category}</span>
                                                    </span>
                                                ) : (
                                                    ''
                                                )}
                                            </td>
                                        )}

                                        {/* Created At Column */}
                                        {visibleColumns.has('createdAt') && (
                                            <td className="px-4 py-2 text-slate-600 whitespace-nowrap">
                                                {item.createdAt || ''}
                                            </td>
                                        )}

                                        {/* Last Updated Column */}
                                        {visibleColumns.has('lastUpdated') && (
                                            <td className="px-4 py-2 text-slate-600 whitespace-nowrap">
                                                {item.lastUpdated || ''}
                                            </td>
                                        )}

                                        {/* Net Weight Column */}
                                        {visibleColumns.has('netWeight') && (
                                            <td className="px-4 py-2 text-right font-normal text-slate-800 whitespace-nowrap">
                                                {item.netWeight != null ? item.netWeight : ''}
                                            </td>
                                        )}

                                        {/* Net Weight Unit Column */}
                                        {visibleColumns.has('netWeightUnit') && (
                                            <td className="px-4 py-2 text-slate-700 whitespace-nowrap">
                                                {item.netWeightUnit || ''}
                                            </td>
                                        )}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>

                {/* Floating Bulk Selection Pill & Actions Dropdown (matches Tacto screenshot) */}
                {selectedIds.size > 0 && (
                    <div className="pointer-events-auto absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-200">
                        {/* Selected count with clear X */}
                        <div className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-slate-800 bg-slate-50/80 border border-slate-200/80 rounded-lg select-none">
                            <span>{displaySelectedCount} selected</span>
                            <button
                                type="button"
                                onClick={handleClearSelection}
                                aria-label="Clear selection"
                                className="ml-1 p-0.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>

                        {/* Actions Menu Dropdown Trigger (with Command icon ⌘ matching screenshot) */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    type="button"
                                    className="flex items-center gap-2 px-3 py-1.5 text-[13px] font-medium text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-300"
                                >
                                    <Command className="h-3.5 w-3.5 text-slate-700 stroke-[2.2]" />
                                    <span>Actions</span>
                                </button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                                align="end"
                                side="top"
                                sideOffset={8}
                                className="w-52 p-1.5 rounded-xl shadow-2xl border border-slate-200 bg-white text-slate-800 z-50 animate-in fade-in zoom-in-95 duration-150"
                            >
                                {/* Create Request (with ⇆ ArrowLeftRight icon matching screenshot) */}
                                <DropdownMenuItem
                                    onClick={handleCreateRequest}
                                    className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-slate-700 hover:text-slate-900 cursor-pointer rounded-lg hover:bg-slate-100 transition-colors"
                                >
                                    <ArrowLeftRight className="h-4 w-4 text-slate-400" />
                                    <span>Create Request</span>
                                </DropdownMenuItem>

                                {/* Create RFQ (with 🤝 Handshake icon matching screenshot) */}
                                <DropdownMenuItem
                                    onClick={handleCreateRFQ}
                                    className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-slate-700 hover:text-slate-900 cursor-pointer rounded-lg hover:bg-slate-100 transition-colors"
                                >
                                    <Handshake className="h-4 w-4 text-slate-400" />
                                    <span>Create RFQ</span>
                                </DropdownMenuItem>

                                {/* Export Submenu (matches Screenshot with CSV and green Microsoft Excel) */}
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger className="flex items-center justify-between px-3 py-2 text-[13px] text-slate-700 hover:text-slate-900 cursor-pointer rounded-lg hover:bg-slate-100 transition-colors">
                                        <div className="flex items-center gap-2.5">
                                            <Download className="h-4 w-4 text-slate-400" />
                                            <span>Export</span>
                                        </div>
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent
                                        sideOffset={8}
                                        className="w-52 p-1.5 rounded-xl shadow-xl border border-slate-200 bg-white"
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

                                {/* Delete (with red Trash2 icon) */}
                                <DropdownMenuItem
                                    onClick={handleBulkDelete}
                                    className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer rounded-lg transition-colors font-medium"
                                >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                    <span>Delete</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}
            </div>

            {/* Bottom Status Bar */}
            <div className="px-6 py-2.5 border-t border-slate-200 bg-white text-xs font-semibold text-slate-700 flex items-center justify-between">
                <div>
                    Articles: {filteredArticles.length.toLocaleString()}
                </div>
            </div>

            {/* Create Article Modal */}
            <AddArticleModal
                open={isAddModalOpen}
                onOpenChange={setIsAddModalOpen}
                onArticleCreated={handleArticleCreated}
            />

            {/* Import Articles Wizard Modal */}
            <ArticlesImportModal
                open={isImportModalOpen}
                onOpenChange={setIsImportModalOpen}
                onSuccess={handleImportSuccess}
            />
        </div>
    );
}



