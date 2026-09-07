"use client";

import * as React from "react";
import { Plus, RotateCcw, Search, X, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    BLANK_TOKEN,
    NOT_BLANK_TOKEN,
    chipLabel,
    operatorsForType,
    type AppliedFilter,
    type FilterFieldDef,
    type FilterOperator,
} from "./field-filter-engine";

function makeId(): string {
    return `flt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function PerFieldFilter({
    fields,
    filters,
    onChange,
    getOptions,
}: {
    fields: FilterFieldDef[];
    filters: AppliedFilter[];
    onChange: (filters: AppliedFilter[]) => void;
    /** Returns the distinct values for a categorical field, derived from the data. */
    getOptions: (key: string) => string[];
}) {
    const [open, setOpen] = React.useState(false);
    const [view, setView] = React.useState<"list" | "detail">("list");
    const [search, setSearch] = React.useState("");
    const [activeField, setActiveField] = React.useState<FilterFieldDef | null>(null);
    const [operator, setOperator] = React.useState<FilterOperator>("contains");
    const [value, setValue] = React.useState("");
    const [selectedValues, setSelectedValues] = React.useState<string[]>([]);

    const close = React.useCallback(() => {
        setOpen(false);
        setView("list");
        setSearch("");
        setActiveField(null);
        setOperator("contains");
        setValue("");
        setSelectedValues([]);
    }, []);

    const openField = (field: FilterFieldDef) => {
        setActiveField(field);
        setOperator(field.type === "number" ? "equals" : "contains");
        setValue("");
        setSelectedValues([]);
        setView("detail");
    };

    const isBlankOp = operator === "blank" || operator === "not blank";
    const needsValue = activeField?.type !== "categorical" && !isBlankOp;

    const apply = () => {
        if (!activeField) return;
        if (activeField.type === "categorical") {
            if (selectedValues.length === 0) return;
        } else if (!value.trim()) {
            return;
        }

        const next: AppliedFilter = {
            id: makeId(),
            fieldKey: activeField.key,
            fieldLabel: activeField.label,
            operator,
            value: value.trim(),
        };
        if (activeField.type === "categorical") {
            next.selectedValues = [...selectedValues];
            next.value = "";
        }
        onChange([...filters, next]);
        close();
    };

    const removeFilter = (id: string) => {
        onChange(filters.filter((f) => f.id !== id));
    };

    const resetAll = () => onChange([]);

    const filteredFields = React.useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return fields;
        return fields.filter((f) => f.label.toLowerCase().includes(q));
    }, [fields, search]);

    const options = activeField?.type === "categorical" && activeField ? getOptions(activeField.key) : [];

    const toggleOption = (val: string) => {
        setSelectedValues((prev) => (prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]));
    };

    return (
        <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => {
                        setOpen((o) => !o);
                        setView("list");
                        setSearch("");
                    }}
                >
                    <Plus className="h-4 w-4" />
                    Add filter
                    {filters.length > 0 ? (
                        <span className="ml-1 rounded-full bg-primary px-1.5 text-[11px] font-bold text-white">
                            {filters.length}
                        </span>
                    ) : null}
                </Button>

                {open ? (
                    <>
                        <div className="fixed inset-0 z-40" onClick={close} />
                        <div className="absolute left-0 z-50 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
                            {view === "list" ? (
                                <div className="flex max-h-80 flex-col">
                                    <div className="relative mb-2">
                                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            autoFocus
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            placeholder="Search..."
                                            className="pl-9"
                                        />
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {filteredFields.length === 0 ? (
                                            <p className="px-1 py-3 text-center text-sm text-slate-400">
                                                No fields found
                                            </p>
                                        ) : (
                                            filteredFields.map((field) => (
                                                <button
                                                    key={field.key}
                                                    type="button"
                                                    onClick={() => openField(field)}
                                                    className="block w-full rounded-md px-2 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-100"
                                                >
                                                    {field.label}
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setView("list");
                                                setActiveField(null);
                                            }}
                                            className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
                                            aria-label="Back to fields"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </button>
                                        <p className="text-sm font-semibold text-slate-800">
                                            {activeField?.label}
                                        </p>
                                    </div>

                                    {activeField?.type === "categorical" ? (
                                        <div className="max-h-64 overflow-y-auto rounded-md border border-slate-200 p-1">
                                            {options.map((opt) => (
                                                <label
                                                    key={opt}
                                                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4 rounded border-slate-300"
                                                        checked={selectedValues.includes(opt)}
                                                        onChange={() => toggleOption(opt)}
                                                    />
                                                    <span className="truncate">{opt}</span>
                                                </label>
                                            ))}
                                            <div className="my-1 border-t border-slate-100" />
                                            <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-100">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 rounded border-slate-300"
                                                    checked={selectedValues.includes(BLANK_TOKEN)}
                                                    onChange={() => toggleOption(BLANK_TOKEN)}
                                                />
                                                <span>blank</span>
                                            </label>
                                            <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-100">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 rounded border-slate-300"
                                                    checked={selectedValues.includes(NOT_BLANK_TOKEN)}
                                                    onChange={() => toggleOption(NOT_BLANK_TOKEN)}
                                                />
                                                <span>not blank</span>
                                            </label>
                                        </div>
                                    ) : (
                                        <>
                                            <select
                                                value={operator}
                                                onChange={(e) => setOperator(e.target.value as FilterOperator)}
                                                className="h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-sm"
                                            >
                                                {operatorsForType(activeField?.type ?? "text").map((op) => (
                                                    <option key={op} value={op}>
                                                        {op}
                                                    </option>
                                                ))}
                                            </select>
                                            {needsValue ? (
                                                <Input
                                                    value={value}
                                                    onChange={(e) => setValue(e.target.value)}
                                                    placeholder="Value"
                                                    type={activeField?.type === "number" ? "number" : "text"}
                                                    autoFocus
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") apply();
                                                    }}
                                                />
                                            ) : null}
                                        </>
                                    )}

                                    <Button
                                        size="sm"
                                        onClick={apply}
                                        disabled={
                                            activeField?.type === "categorical"
                                                ? selectedValues.length === 0
                                                : !value.trim()
                                        }
                                        className="w-full bg-primary text-white hover:bg-primary/90"
                                    >
                                        Apply
                                    </Button>
                                </div>
                            )}
                        </div>
                    </>
                ) : null}
            </div>

            <Button
                variant="ghost"
                size="sm"
                className="gap-1.5"
                onClick={resetAll}
                disabled={filters.length === 0}
            >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
            </Button>

            {filters.length > 0 ? (
                <div className="flex w-full flex-wrap items-center gap-2">
                    {filters.map((filter) => (
                        <span
                            key={filter.id}
                            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white py-1 pl-3 pr-1.5 text-xs font-medium text-slate-700 shadow-sm"
                        >
                            {chipLabel(filter)}
                            <button
                                type="button"
                                onClick={() => removeFilter(filter.id)}
                                className="rounded-full p-0.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600"
                                aria-label={`Remove ${filter.fieldLabel} filter`}
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
