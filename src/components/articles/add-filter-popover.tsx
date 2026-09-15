'use client';

import * as React from 'react';
import { Plus, Search } from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { FILTERABLE_FIELDS, type FilterableField } from './articles-schema';

interface AddFilterPopoverProps {
    onSelectField: (field: FilterableField) => void;
    activeFieldKeys?: string[];
}

export function AddFilterPopover({ onSelectField }: AddFilterPopoverProps) {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState('');

    const filteredFields = React.useMemo(() => {
        if (!search.trim()) return FILTERABLE_FIELDS;
        const q = search.toLowerCase();
        return FILTERABLE_FIELDS.filter((f) => f.label.toLowerCase().includes(q));
    }, [search]);

    const handleSelect = (field: FilterableField) => {
        onSelectField(field);
        setOpen(false);
        setSearch('');
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
                    <Plus className="h-3.5 w-3.5 text-slate-700 stroke-[2.5]" />
                    <span>Add filter</span>
                </button>
            </PopoverTrigger>

            <PopoverContent
                align="start"
                sideOffset={6}
                className="w-56 p-0 rounded-xl shadow-xl border border-slate-200 bg-white text-slate-900 overflow-hidden z-50"
            >
                {/* Search Bar at Top (matches Screenshot 2 & 5) */}
                <div className="p-2 border-b border-slate-100 bg-white">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <Input
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-8 pl-8 text-xs bg-slate-50/80 border-slate-200 focus-visible:ring-1 focus-visible:ring-slate-400 placeholder:text-slate-400"
                            autoFocus
                        />
                    </div>
                </div>

                {/* Field List (matches Screenshot 2 & 5) */}
                <div className="max-h-72 overflow-y-auto p-1.5 space-y-0.5">
                    {filteredFields.length === 0 ? (
                        <p className="py-3 text-center text-xs text-slate-400">No fields found</p>
                    ) : (
                        filteredFields.map((field) => (
                            <button
                                key={field.key}
                                type="button"
                                onClick={() => handleSelect(field)}
                                className="w-full text-left px-3 py-2 text-[13px] text-slate-700 hover:bg-slate-100/90 rounded-lg transition-colors cursor-pointer"
                            >
                                {field.label}
                            </button>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}

