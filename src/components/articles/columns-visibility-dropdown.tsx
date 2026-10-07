'use client';

import * as React from 'react';
import { Columns3, ChevronDown, ChevronUp, Search } from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ARTICLE_COLUMNS, type ArticleColumnKey } from './articles-schema';
import { cn } from '@/lib/utils';

interface ColumnsVisibilityDropdownProps {
    visibleColumns: Set<ArticleColumnKey>;
    onToggleColumn: (key: ArticleColumnKey) => void;
    onToggleAll: (selectAll: boolean) => void;
}

export function ColumnsVisibilityDropdown({
    visibleColumns,
    onToggleColumn,
    onToggleAll,
}: ColumnsVisibilityDropdownProps) {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState('');

    const filteredColumns = React.useMemo(() => {
        if (!search.trim()) return ARTICLE_COLUMNS;
        const q = search.toLowerCase();
        return ARTICLE_COLUMNS.filter((col) => col.label.toLowerCase().includes(q));
    }, [search]);

    // Check if all non-required columns are selected
    const allSelected = ARTICLE_COLUMNS.every((c) => visibleColumns.has(c.key));
    const isIndeterminate = !allSelected && visibleColumns.size > 1;

    const handleSelectAllChange = (checked: boolean) => {
        onToggleAll(checked);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className="inline-flex items-center gap-1.5 h-8.5 px-3 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
                >
                    <Columns3 className="h-3.5 w-3.5 text-slate-500" />
                    <span>
                        Columns {visibleColumns.size}/{ARTICLE_COLUMNS.length}
                    </span>
                    {open ? (
                        <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
                    ) : (
                        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                    )}
                </button>
            </PopoverTrigger>

            <PopoverContent
                align="end"
                sideOffset={6}
                className="w-56 p-0 rounded-xl shadow-lg border border-slate-200 bg-white text-slate-900 overflow-hidden"
            >
                {/* Search Bar at Top (matches Screenshot) */}
                <div className="p-2 border-b border-slate-100 bg-white">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <Input
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-8 pl-8 text-xs bg-slate-50/70 border-slate-200 focus-visible:ring-1 focus-visible:ring-slate-400 placeholder:text-slate-400"
                            autoFocus
                        />
                    </div>
                </div>

                {/* Select All Row */}
                <div className="px-2 py-1.5 border-b border-slate-100">
                    <label className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-100 cursor-pointer text-[13px] font-medium text-slate-800 select-none">
                        <Checkbox
                            checked={allSelected ? true : isIndeterminate ? 'indeterminate' : false}
                            onCheckedChange={(checked) => handleSelectAllChange(!!checked)}
                            className="rounded border-slate-300"
                        />
                        <span>Select all</span>
                    </label>
                </div>

                {/* Columns List with Checkboxes */}
                <div className="max-h-72 overflow-y-auto p-1 space-y-0.5">
                    {filteredColumns.map((col) => {
                        const isChecked = visibleColumns.has(col.key);

                        return (
                            <label
                                key={col.key}
                                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[13px] transition-colors select-none cursor-pointer hover:bg-slate-100 text-slate-700"
                            >
                                <Checkbox
                                    checked={isChecked}
                                    onCheckedChange={() => onToggleColumn(col.key)}
                                    className="rounded border-slate-300 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
                                />
                                <span className="text-slate-700 font-normal">
                                    {col.label === 'Last update...' ? 'Last updated at' : col.label}
                                </span>
                            </label>
                        );
                    })}
                </div>
            </PopoverContent>
        </Popover>
    );
}
