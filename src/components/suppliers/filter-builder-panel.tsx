"use client";

import * as React from "react";
import { Filter, Plus, X } from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { COUNTRIES } from "@/lib/utils/countryFlags";

export type FilterField =
    | "status"
    | "lifecycle"
    | "country"
    | "supplierType"
    | "strategicClassification"
    | "abc"
    | "riskScore"
    | "areaOfNeed"
    | "commodityGroup"
    | "responsibleBuyer";

export type FilterOperator = "is" | "is not" | "contains" | ">=" | "<=";

export interface FilterCondition {
    id: string;
    field: FilterField;
    operator: FilterOperator;
    value: string;
}

export const FILTER_FIELD_LABELS: Record<FilterField, string> = {
    status: "Supplier Status",
    lifecycle: "Lifecycle",
    country: "Country",
    supplierType: "Supplier Type",
    strategicClassification: "Strategic Classification",
    abc: "ABC Class",
    riskScore: "Risk Score",
    areaOfNeed: "Area of Need",
    commodityGroup: "Commodity Group",
    responsibleBuyer: "Responsible Buyer",
};

const SELECT_FIELDS: Partial<Record<FilterField, string[]>> = {
    status: ["active", "inactive", "blacklisted"],
    lifecycle: ["prospect", "onboarding", "active", "suspended", "terminated"],
    abc: ["A", "B", "C", "None"],
};

const NUMERIC_FIELDS = new Set<FilterField>(["riskScore"]);

function defaultValueFor(field: FilterField): string {
    if (field === "status") return "active";
    if (field === "lifecycle") return "active";
    if (field === "abc") return "A";
    if (field === "riskScore") return "60";
    return "";
}

export function FilterBuilderPanel({
    filters,
    onChange,
    activeCount,
}: {
    filters: FilterCondition[];
    onChange: (filters: FilterCondition[]) => void;
    activeCount: number;
}) {
    const addCondition = () => {
        const condition: FilterCondition = {
            id: `f_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            field: "status",
            operator: "is",
            value: defaultValueFor("status"),
        };
        onChange([...filters, condition]);
    };

    const updateCondition = (id: string, patch: Partial<FilterCondition>) => {
        onChange(filters.map((condition) => (condition.id === id ? { ...condition, ...patch } : condition)));
    };

    const removeCondition = (id: string) => {
        onChange(filters.filter((condition) => condition.id !== id));
    };

    const operatorOptions = (field: FilterField): FilterOperator[] => {
        if (NUMERIC_FIELDS.has(field)) return [">=", "<="];
        if (field === "country" || field === "supplierType" || field === "strategicClassification") {
            return ["is", "is not", "contains"];
        }
        if (field === "areaOfNeed" || field === "commodityGroup" || field === "responsibleBuyer") {
            return ["contains"];
        }
        return ["is", "is not"];
    };

    return (
        <Popover.Root>
            <Popover.Trigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Add filter
                    {activeCount > 0 ? (
                        <span className="ml-1 rounded-full bg-primary px-1.5 text-[11px] font-bold text-white">
                            {activeCount}
                        </span>
                    ) : null}
                </Button>
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content
                    align="start"
                    sideOffset={8}
                    className="z-50 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-xl"
                >
                    <div className="mb-2 flex items-center justify-between">
                        <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Filters</p>
                        <Button variant="ghost" size="sm" className="h-7 gap-1" onClick={addCondition}>
                            <Plus className="h-3.5 w-3.5" /> Add
                        </Button>
                    </div>
                    <div className="max-h-80 space-y-2 overflow-y-auto">
                        {filters.length === 0 ? (
                            <p className="py-4 text-center text-sm text-slate-400">No filters applied.</p>
                        ) : (
                            filters.map((condition) => (
                                <div key={condition.id} className="rounded-lg border border-slate-200 p-2">
                                    <div className="flex items-center gap-1.5">
                                        <select
                                            className="h-8 flex-1 rounded-md border border-slate-200 bg-white px-2 text-xs"
                                            value={condition.field}
                                            onChange={(event) => {
                                                const field = event.target.value as FilterField;
                                                updateCondition(condition.id, {
                                                    field,
                                                    operator: operatorOptions(field)[0],
                                                    value: defaultValueFor(field),
                                                });
                                            }}
                                        >
                                            {(Object.keys(FILTER_FIELD_LABELS) as FilterField[]).map((field) => (
                                                <option key={field} value={field}>
                                                    {FILTER_FIELD_LABELS[field]}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => removeCondition(condition.id)}
                                            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-rose-600"
                                            aria-label="Remove filter"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <div className="mt-1.5 flex items-center gap-1.5">
                                        <select
                                            className="h-8 w-24 rounded-md border border-slate-200 bg-white px-1 text-xs"
                                            value={condition.operator}
                                            onChange={(event) =>
                                                updateCondition(condition.id, { operator: event.target.value as FilterOperator })
                                            }
                                        >
                                            {operatorOptions(condition.field).map((op) => (
                                                <option key={op} value={op}>
                                                    {op}
                                                </option>
                                            ))}
                                        </select>
                                        {condition.field === "country" ? (
                                            <select
                                                className="h-8 flex-1 rounded-md border border-slate-200 bg-white px-2 text-xs"
                                                value={condition.value}
                                                onChange={(event) => updateCondition(condition.id, { value: event.target.value })}
                                            >
                                                <option value="">Any country</option>
                                                {COUNTRIES.map((country) => (
                                                    <option key={country.code} value={country.code}>
                                                        {country.flag} {country.name}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : SELECT_FIELDS[condition.field] ? (
                                            <select
                                                className="h-8 flex-1 rounded-md border border-slate-200 bg-white px-2 text-xs"
                                                value={condition.value}
                                                onChange={(event) => updateCondition(condition.id, { value: event.target.value })}
                                            >
                                                {SELECT_FIELDS[condition.field]!.map((option) => (
                                                    <option key={option} value={option}>
                                                        {option}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <Input
                                                className="h-8 flex-1 text-xs"
                                                value={condition.value}
                                                placeholder="Value"
                                                onChange={(event) => updateCondition(condition.id, { value: event.target.value })}
                                            />
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}
