'use client';

import * as React from 'react';
import { Check, ChevronDown, Search, Tag, X } from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import {
    FILTER_OPERATORS,
    DEFAULT_ARTICLE_CATEGORIES,
    SAMPLE_ARTICLES_FILTER_OPTIONS,
    type FilterOperator,
} from './articles-schema';

export interface FilterChipState {
    id: string;
    fieldKey: string;
    fieldLabel: string;
    operator: FilterOperator;
    values: string[];
    textValue?: string;
    isRemovable?: boolean;
}

interface ArticlesFilterChipProps {
    filter: FilterChipState;
    onUpdateFilter: (updated: FilterChipState) => void;
    onRemoveFilter?: (id: string) => void;
}

export function ArticlesFilterChip({
    filter,
    onUpdateFilter,
    onRemoveFilter,
}: ArticlesFilterChipProps) {
    const [open, setOpen] = React.useState(false);
    const [selectedOperator, setSelectedOperator] = React.useState<FilterOperator>(filter.operator);
    const [selectedValues, setSelectedValues] = React.useState<string[]>(filter.values);
    const [textVal, setTextVal] = React.useState<string>(filter.textValue || '');
    const [searchQuery, setSearchQuery] = React.useState('');

    // Sync when popover opens
    React.useEffect(() => {
        if (open) {
            setSelectedOperator(filter.operator);
            setSelectedValues(filter.values);
            setTextVal(filter.textValue || '');
            setSearchQuery('');
        }
    }, [open, filter]);

    // Available options for selection based on field
    const availableOptions = React.useMemo(() => {
        if (filter.fieldKey === 'category') {
            return DEFAULT_ARTICLE_CATEGORIES.map((c) => ({ value: c, label: c, isCategory: true }));
        }
        if (filter.fieldKey === 'article' || filter.fieldKey === 'articleId' || filter.fieldKey === 'articleNumber') {
            return SAMPLE_ARTICLES_FILTER_OPTIONS;
        }
        if (filter.fieldKey === 'articleName' || filter.fieldKey === 'description') {
            return SAMPLE_ARTICLES_FILTER_OPTIONS.map((a) => ({ value: a.label, label: a.label }));
        }
        if (filter.fieldKey === 'netWeightUnit') {
            return ['G', 'KG', 'MG', 'LBS', 'OZ'].map((u) => ({ value: u, label: u }));
        }
        if (filter.fieldKey === 'costModel') {
            return ['Standard', 'Custom Tooling', 'Target Costing', 'Indexed'].map((m) => ({
                value: m,
                label: m,
            }));
        }
        return [];
    }, [filter.fieldKey]);

    const filteredOptions = React.useMemo(() => {
        if (!searchQuery.trim()) return availableOptions;
        const q = searchQuery.toLowerCase();
        return availableOptions.filter((opt) => opt.label.toLowerCase().includes(q));
    }, [availableOptions, searchQuery]);

    const handleToggleValue = (val: string) => {
        setSelectedValues((prev) =>
            prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
        );
    };

    const handleApply = () => {
        onUpdateFilter({
            ...filter,
            operator: selectedOperator,
            values: selectedValues,
            textValue: textVal,
        });
        setOpen(false);
    };

    const operatorLabel =
        FILTER_OPERATORS.find((op) => op.key === filter.operator)?.label || 'is one of';

    const renderValueDisplay = () => {
        if (filter.operator === 'blank') return 'blank';
        if (filter.operator === 'not_blank') return 'not blank';
        if (
            [
                'contains',
                'does_not_contain',
                'equals',
                'does_not_equal',
                'begins_with',
                'does_not_begin_with',
                'ends_with',
            ].includes(filter.operator)
        ) {
            return filter.textValue || 'all';
        }
        if (filter.values.length === 0) return 'all';
        if (filter.values.length === 1) {
            const opt = availableOptions.find((o) => o.value === filter.values[0]);
            return opt ? opt.label : filter.values[0];
        }
        return `${filter.values.length} selected`;
    };

    const isListOperator = selectedOperator === 'is_one_of' || selectedOperator === 'is_none_of';
    const isTextOperator = [
        'contains',
        'does_not_contain',
        'equals',
        'does_not_equal',
        'begins_with',
        'does_not_begin_with',
        'ends_with',
    ].includes(selectedOperator);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors group cursor-pointer">
                    <span className="font-semibold text-slate-900">{filter.fieldLabel}</span>
                    <span className="font-normal text-slate-600">{operatorLabel}</span>
                    <span className="font-semibold text-slate-900 max-w-[160px] truncate">
                        {renderValueDisplay()}
                    </span>
                    {filter.isRemovable && onRemoveFilter && (
                        <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemoveFilter(filter.id);
                            }}
                            className="ml-0.5 text-slate-400 hover:text-red-600 rounded p-0.5 hover:bg-slate-100"
                        >
                            <X className="h-3 w-3" />
                        </span>
                    )}
                </button>
            </PopoverTrigger>

            <PopoverContent
                align="start"
                sideOffset={6}
                className="w-80 p-0 rounded-xl shadow-xl border border-slate-200 bg-white text-slate-900 overflow-hidden"
            >
                {/* Operator Selector with Orange Focus Ring (matches Screenshot 3 & 4) */}
                <div className="p-3 border-b border-slate-100 bg-white">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="w-full flex items-center justify-between px-3.5 py-2 text-[13px] font-medium text-slate-800 bg-white border-2 border-orange-400 rounded-xl hover:border-orange-500 focus:outline-none ring-2 ring-orange-100 transition-all cursor-pointer">
                                <span>
                                    {FILTER_OPERATORS.find((op) => op.key === selectedOperator)?.label ||
                                        'is one of'}
                                </span>
                                <ChevronDown className="h-4 w-4 text-slate-600" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="start"
                            className="w-72 max-h-80 overflow-y-auto p-1.5 rounded-xl shadow-xl border border-slate-200 bg-white z-50"
                        >
                            {FILTER_OPERATORS.map((op) => {
                                const isSelected = selectedOperator === op.key;
                                return (
                                    <DropdownMenuItem
                                        key={op.key}
                                        onClick={() => setSelectedOperator(op.key)}
                                        className={cn(
                                            'flex items-center justify-between px-3 py-2 text-[13px] text-slate-700 cursor-pointer rounded-lg hover:bg-slate-100 transition-colors',
                                            isSelected && 'bg-slate-50 font-medium'
                                        )}
                                    >
                                        <span>{op.label}</span>
                                        {isSelected && (
                                            <div className="h-4 w-4 rounded-full bg-slate-800 text-white flex items-center justify-center">
                                                <Check className="h-3 w-3 stroke-[3]" />
                                            </div>
                                        )}
                                    </DropdownMenuItem>
                                );
                            })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Values Area */}
                <div className="p-3">
                    {isListOperator && (
                        <div className="space-y-2">
                            {availableOptions.length > 6 && (
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                    <Input
                                        placeholder="Search options..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="h-8 pl-8 text-xs bg-slate-50 border-slate-200"
                                    />
                                </div>
                            )}

                            <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                                {filteredOptions.length === 0 ? (
                                    <p className="py-4 text-center text-xs text-slate-400">
                                        No options found
                                    </p>
                                ) : (
                                    filteredOptions.map((opt: any) => {
                                        const isChecked = selectedValues.includes(opt.value);
                                        return (
                                            <label
                                                key={opt.value}
                                                className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-[13px] text-slate-700 select-none transition-colors"
                                            >
                                                <Checkbox
                                                    checked={isChecked}
                                                    onCheckedChange={() => handleToggleValue(opt.value)}
                                                    className="rounded border-slate-300 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
                                                />
                                                {opt.isCategory && (
                                                    <Tag className="h-3.5 w-3.5 text-rose-500 fill-rose-100 shrink-0" />
                                                )}
                                                <span className="truncate">{opt.label}</span>
                                            </label>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}

                    {isTextOperator && (
                        <div className="py-2">
                            <Input
                                placeholder="Enter value to match..."
                                value={textVal}
                                onChange={(e) => setTextVal(e.target.value)}
                                className="h-9 text-xs border-slate-300"
                                autoFocus
                            />
                        </div>
                    )}

                    {(selectedOperator === 'blank' || selectedOperator === 'not_blank') && (
                        <div className="py-4 text-center text-xs text-slate-500">
                            Filtering for records that are{' '}
                            <strong>{selectedOperator === 'blank' ? 'empty' : 'not empty'}</strong>.
                        </div>
                    )}
                </div>

                {/* Apply Button (matching Screenshot 3 & 4) */}
                <div className="border-t border-slate-200 bg-white">
                    <button
                        type="button"
                        onClick={handleApply}
                        className="w-full py-2.5 text-center text-[13px] font-semibold text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                        Apply
                    </button>
                </div>
            </PopoverContent>
        </Popover>
    );
}

