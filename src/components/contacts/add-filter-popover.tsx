'use client';

import * as React from 'react';
import {
    Plus,
    Search,
    ChevronDown,
    ChevronLeft,
    Check,
    X,
    Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
    CONTACT_COLUMNS,
    DEFAULT_DEPARTMENT_OPTIONS,
    DEFAULT_LANGUAGE_OPTIONS,
    type ContactColumnKey,
} from '@/components/contacts/contacts-schema';
import {
    listSuppliersLite,
    type FilterOperator,
    type AdvancedFilterRule,
} from '@/app/actions/contacts-detail';

export interface FilterChipData extends AdvancedFilterRule {
    id: string;
}

export const TEXT_OPERATORS: Array<{ key: FilterOperator; label: string }> = [
    { key: 'contains', label: 'contains' },
    { key: 'does_not_contain', label: 'does not contain' },
    { key: 'equals', label: 'equals' },
    { key: 'does_not_equal', label: 'does not equal' },
    { key: 'begins with' as any, label: 'begins with' },
    { key: 'does_not_begin_with', label: 'does not begin with' },
    { key: 'ends_with', label: 'ends with' },
    { key: 'does_not_end_with', label: 'does not end with' },
    { key: 'blank', label: 'blank' },
    { key: 'not_blank', label: 'not blank' },
];

export const ENUM_OPERATORS: Array<{ key: FilterOperator; label: string }> = [
    { key: 'is_one_of', label: 'is one of' },
    { key: 'is_none_of', label: 'is none of' },
    { key: 'blank', label: 'blank' },
    { key: 'not_blank', label: 'not blank' },
];

const DEFAULT_POSITION_OPTIONS = [
    'Chief Executive Officer',
    'Manager',
    'Specialist/Officer',
    'Department Head/Manager',
    'Division Head/Director',
    'Executive Management',
    'Buyer / Procurement Specialist',
    'Key Account Manager',
];

const DEFAULT_RESPONSIBILITY_OPTIONS = [
    'Price Inquiries for Articles',
    'Compliance Queries',
    'Information Requests',
    'Automated Documentation',
    'Quality Issues',
    'Logistics / Delivery',
    'Contracts & Legal',
];

const STATUS_ITEMS = [
    { value: 'active', label: 'Active', dotClass: 'bg-emerald-500' },
    { value: 'inactive', label: 'Deactivated', dotClass: 'bg-slate-400' },
    { value: 'on_hold', label: 'Archived', dotClass: 'bg-amber-500' },
];

export function AddFilterPopover({
    onAddFilter,
    existingFields = [],
}: {
    onAddFilter: (rule: Omit<FilterChipData, 'id'>) => void;
    existingFields?: ContactColumnKey[];
}) {
    const [open, setOpen] = React.useState(false);
    const [selectedField, setSelectedField] = React.useState<ContactColumnKey | null>(null);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [itemSearchQuery, setItemSearchQuery] = React.useState('');
    const [operator, setOperator] = React.useState<FilterOperator>('is_one_of');
    const [operatorOpen, setOperatorOpen] = React.useState(false);
    const [textValue, setTextValue] = React.useState('');
    const [selectedItems, setSelectedItems] = React.useState<string[]>([]);
    const [supplierList, setSupplierList] = React.useState<Array<{ id: string; name: string; supplierNumber: string | null }>>([]);

    React.useEffect(() => {
        if (open && supplierList.length === 0) {
            listSuppliersLite().then(setSupplierList).catch(() => {});
        }
    }, [open, supplierList.length]);

    const isSelectionField = (key: ContactColumnKey | null) => {
        return key === 'supplier' || key === 'status' || key === 'language' || key === 'department' || key === 'position' || key === 'responsibility';
    };

    const filterableColumns = CONTACT_COLUMNS.map((col) => ({
        key: col.key,
        label: col.key === 'name' ? 'Name' : col.label,
        kind: col.kind,
    }));

    const activeCol = filterableColumns.find((c) => c.key === selectedField);

    const handleSelectField = (col: typeof filterableColumns[number]) => {
        setSelectedField(col.key);
        setSearchQuery('');
        setItemSearchQuery('');
        setOperatorOpen(false);
        if (isSelectionField(col.key)) {
            setOperator('is_one_of');
            setSelectedItems([]);
        } else {
            setOperator('contains');
            setTextValue('');
        }
    };

    const handleBack = () => {
        setSelectedField(null);
        setOperatorOpen(false);
        setItemSearchQuery('');
    };

    const handleApply = () => {
        if (!selectedField) return;
        const col = activeCol;
        if (!col) return;

        if (isSelectionField(selectedField)) {
            onAddFilter({
                field: selectedField,
                operator,
                values: selectedItems,
            });
        } else {
            onAddFilter({
                field: selectedField,
                operator,
                value: textValue,
            });
        }

        setOpen(false);
        setSelectedField(null);
        setTextValue('');
        setSelectedItems([]);
        setItemSearchQuery('');
    };

    const toggleItem = (val: string) => {
        setSelectedItems((prev) =>
            prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
        );
    };

    const isSelecting = isSelectionField(selectedField);
    const currentOperators = isSelecting ? ENUM_OPERATORS : TEXT_OPERATORS;
    const currentOperatorObj = currentOperators.find((o) => o.key === operator) || currentOperators[0];
    const isBlankOperator = operator === 'blank' || operator === 'not_blank';

    // Build selectable items list for active parameter
    const getSelectableItems = () => {
        if (!selectedField) return [];
        const items: Array<{ id: string; label: string; prefixNode?: React.ReactNode }> = [
            { id: '(Blanks)', label: '(Blanks)' },
        ];

        if (selectedField === 'supplier') {
            supplierList.forEach((s) => {
                items.push({
                    id: s.id,
                    label: `${s.supplierNumber ? s.supplierNumber + ' ' : ''}${s.name}`,
                    prefixNode: <Building2 className="h-3.5 w-3.5 text-sky-500 shrink-0" />,
                });
            });
        } else if (selectedField === 'status') {
            STATUS_ITEMS.forEach((s) => {
                items.push({
                    id: s.value,
                    label: s.label,
                    prefixNode: <span className={cn('h-2 w-2 rounded-full shrink-0', s.dotClass)} />,
                });
            });
        } else if (selectedField === 'language') {
            DEFAULT_LANGUAGE_OPTIONS.forEach((l) => {
                items.push({ id: l, label: l });
            });
        } else if (selectedField === 'department') {
            DEFAULT_DEPARTMENT_OPTIONS.forEach((d) => {
                items.push({ id: d, label: d });
            });
        } else if (selectedField === 'position') {
            DEFAULT_POSITION_OPTIONS.forEach((p) => {
                items.push({ id: p, label: p });
            });
        } else if (selectedField === 'responsibility') {
            DEFAULT_RESPONSIBILITY_OPTIONS.forEach((r) => {
                items.push({ id: r, label: r });
            });
        }

        if (!itemSearchQuery.trim()) return items;
        return items.filter((item) =>
            item.label.toLowerCase().includes(itemSearchQuery.toLowerCase().trim())
        );
    };

    const selectableItems = getSelectableItems();
    const filteredFields = filterableColumns.filter((col) =>
        col.label.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );

    return (
        <DropdownMenu open={open} onOpenChange={(v) => {
            setOpen(v);
            if (!v) {
                setSelectedField(null);
                setSearchQuery('');
                setItemSearchQuery('');
                setOperatorOpen(false);
            }
        }}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-1.5 text-xs font-normal border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-xs"
                >
                    <Plus className="h-3.5 w-3.5 text-slate-500" />
                    Add filter
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="start"
                className="w-64 p-2 rounded-xl shadow-xl border-slate-200/90 bg-white space-y-1 text-xs"
            >
                {!selectedField ? (
                    /* Step 1: Search and select field */
                    <div className="space-y-1">
                        <div className="relative mb-1">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-8 pl-8 pr-2 text-xs bg-slate-50/90 hover:bg-slate-100/90 focus:bg-white border border-transparent focus:border-slate-300 rounded-md outline-none text-slate-800 placeholder:text-slate-400 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => e.stopPropagation()}
                            />
                        </div>

                        <div className="max-h-60 overflow-y-auto space-y-0.5">
                            {filteredFields.map((col) => (
                                <button
                                    key={col.key}
                                    type="button"
                                    onClick={() => handleSelectField(col)}
                                    className="flex items-center w-full px-2.5 py-1.5 rounded-md hover:bg-slate-100/80 text-xs text-slate-800 text-left transition-colors cursor-pointer"
                                >
                                    {col.label}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* Step 2: Configure Operator and Value */
                    <div className="space-y-2 pt-0.5">
                        {/* Header: < Field Name */}
                        <div className="flex items-center gap-1 text-xs font-semibold text-slate-900 pb-1 border-b border-slate-100">
                            <button
                                type="button"
                                onClick={handleBack}
                                className="p-0.5 -ml-1 rounded hover:bg-slate-100 text-slate-600 transition-colors"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <span>{activeCol?.label}</span>
                        </div>

                        {/* Operator Select Box */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setOperatorOpen((prev) => !prev)}
                                className="flex items-center justify-between w-full h-9 px-3 text-xs bg-white rounded-md border border-orange-300 ring-2 ring-orange-100/70 text-slate-800 font-normal hover:bg-slate-50/50 transition-colors text-left"
                            >
                                <span>{currentOperatorObj.label}</span>
                                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                            </button>

                            {/* Operator dropdown menu */}
                            {operatorOpen && (
                                <div className="absolute top-10 left-0 z-50 w-full rounded-md border border-slate-200 bg-white p-1 shadow-xl max-h-52 overflow-y-auto space-y-0.5">
                                    {currentOperators.map((op) => (
                                        <button
                                            key={op.key}
                                            type="button"
                                            onClick={() => {
                                                setOperator(op.key);
                                                setOperatorOpen(false);
                                            }}
                                            className={cn(
                                                "flex items-center justify-between w-full px-2.5 py-1.5 text-xs rounded hover:bg-slate-100 text-left transition-colors",
                                                operator === op.key ? "bg-slate-50 font-medium text-slate-900" : "text-slate-700"
                                            )}
                                        >
                                            <span>{op.label}</span>
                                            {operator === op.key && (
                                                <div className="h-3.5 w-3.5 rounded-full bg-zinc-800 text-white flex items-center justify-center">
                                                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Categorical checklist matching screenshots */}
                        {isSelecting && !isBlankOperator && (
                            <div className="space-y-1.5">
                                {/* Search input inside parameter checklist */}
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={itemSearchQuery}
                                        onChange={(e) => setItemSearchQuery(e.target.value)}
                                        className="w-full h-8 pl-8 pr-2 text-xs bg-slate-50/90 hover:bg-slate-100/90 focus:bg-white border border-transparent focus:border-slate-300 rounded-md outline-none text-slate-800 placeholder:text-slate-400 transition-colors"
                                        onClick={(e) => e.stopPropagation()}
                                        onKeyDown={(e) => e.stopPropagation()}
                                    />
                                </div>

                                {/* Items checklist */}
                                <div className="max-h-48 overflow-y-auto space-y-0.5 border border-slate-100 rounded-md p-1 bg-white">
                                    {selectableItems.length === 0 ? (
                                        <div className="py-3 text-center text-xs text-slate-400">No options found</div>
                                    ) : (
                                        selectableItems.map((item, itemIdx) => {
                                            const isChecked = selectedItems.includes(item.id);
                                            return (
                                                <button
                                                    key={`filter-opt-${item.id}-${itemIdx}`}
                                                    type="button"
                                                    onClick={() => toggleItem(item.id)}
                                                    className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md hover:bg-slate-50 text-xs text-left transition-colors cursor-pointer select-none"
                                                >
                                                    <div className={cn(
                                                        "h-3.5 w-3.5 rounded flex items-center justify-center border transition-colors shrink-0",
                                                        isChecked ? "bg-zinc-800 border-zinc-800 text-white" : "border-slate-300 bg-white"
                                                    )}>
                                                        {isChecked && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                                                    </div>
                                                    {item.prefixNode}
                                                    <span className="truncate text-slate-700 font-normal">{item.label}</span>
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Value Input (for text fields like Name, Email, Phone number) */}
                        {!isSelecting && !isBlankOperator && (
                            <div>
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Enter a value"
                                    value={textValue}
                                    onChange={(e) => setTextValue(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleApply();
                                    }}
                                    className="w-full h-9 px-3 text-xs rounded-md border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-300 outline-none text-slate-800 placeholder:text-slate-400 transition-colors"
                                />
                            </div>
                        )}

                        {/* Apply Button */}
                        <div className="pt-1">
                            <Button
                                type="button"
                                onClick={handleApply}
                                className="w-full h-8 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-md transition-colors"
                            >
                                Apply
                            </Button>
                        </div>
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function FilterChipView({
    chip,
    onChange,
    onRemove,
}: {
    chip: FilterChipData;
    onChange: (patch: Partial<FilterChipData>) => void;
    onRemove: () => void;
}) {
    const col = CONTACT_COLUMNS.find((c) => c.key === chip.field);
    const label = col?.key === 'name' ? 'Name' : col?.label || chip.field;
    const operatorObj = [...TEXT_OPERATORS, ...ENUM_OPERATORS].find((o) => o.key === chip.operator);
    const operatorLabel = operatorObj?.label || chip.operator.replace(/_/g, ' ');

    const valDisplay = (() => {
        if (chip.operator === 'blank' || chip.operator === 'not_blank') return '';
        if (chip.values && chip.values.length) {
            return chip.values.map((v) => v === 'active' ? 'Active' : v === 'inactive' ? 'Deactivated' : v === 'on_hold' ? 'Archived' : v).join(', ');
        }
        if (chip.value) return `"${chip.value}"`;
        return '';
    })();

    return (
        <div className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs shadow-xs text-slate-700">
            <span className="font-semibold text-slate-800">{label}</span>
            <span className="text-slate-500">{operatorLabel}</span>
            {valDisplay && (
                <span className="font-medium text-slate-900">{valDisplay}</span>
            )}
            <button
                type="button"
                onClick={onRemove}
                className="ml-0.5 rounded-full p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
                <X className="h-3 w-3" />
            </button>
        </div>
    );
}
