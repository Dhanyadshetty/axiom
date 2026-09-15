"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectSingleFieldProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  required?: boolean;
  help?: string;
  disabled?: boolean;
  options: SelectOption[];
  placeholder?: string;
  clearable?: boolean;
  validationErrors?: Record<string, string>;
  blockKey?: string;
  sectionKey?: string;
  triggerClassName?: string;
  contentClassName?: string;
  compact?: boolean;
}

export function SelectSingleField({
  value,
  onChange,
  label,
  required,
  help,
  disabled,
  options = [],
  placeholder,
  clearable,
  validationErrors = {},
  blockKey,
  sectionKey,
  triggerClassName,
  contentClassName,
  compact = false,
  field,
}: SelectSingleFieldProps & { field?: { label?: string } }) {
  const effectiveLabel = label ?? field?.label ?? "";
  const fieldKey = `${sectionKey}.${blockKey}.${effectiveLabel}`.toLowerCase().replace(/\s+/g, '_');
  const fieldError = validationErrors[fieldKey] || validationErrors[`${effectiveLabel.toLowerCase().replace(/\s+/g, '_')}`];

  // Radix <Select.Item /> cannot have an empty-string value, so the "clear"
  // action uses a sentinel that we map back to "" in onValueChange. Option
  // values that are empty are skipped for the same reason.
  const CLEAR_VALUE = "__clear__";

  return (
    <div className={cn("w-full", compact ? "space-y-0" : "space-y-1.5")}>
      {effectiveLabel && (
        <Label className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
          {effectiveLabel}
          {required && <span className="text-rose-600 font-bold" aria-hidden="true">*</span>}
        </Label>
      )}
      <Select
        value={value}
        onValueChange={(v) => onChange(v === CLEAR_VALUE ? "" : v)}
        disabled={disabled}
      >
        <SelectTrigger
          className={cn(
            "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition-colors hover:border-slate-300 focus:ring-0 focus-visible:ring-0 data-[placeholder]:text-slate-400",
            compact && "h-8 min-h-[2rem] py-1.5 text-sm",
            fieldError && "border-rose-500",
            triggerClassName
          )}
        >
          <SelectValue placeholder={placeholder || "Select..."} />
        </SelectTrigger>
        <SelectContent className={cn("rounded-xl border border-slate-200 bg-white shadow-lg", contentClassName)}>
          {clearable && (
            <SelectItem value={CLEAR_VALUE} className="flex items-center gap-2">
              <span className="text-slate-400">× Clear</span>
            </SelectItem>
          )}
          {options
            .filter((opt) => opt.value !== "")
            .map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
      {fieldError && (
        <p className="text-xs text-rose-500 flex items-center gap-1" role="alert">
          <span className="h-3 w-3 rounded-full bg-rose-500" />
          {fieldError}
        </p>
      )}
      {help && !fieldError && <p className="text-xs text-slate-500">{help}</p>}
    </div>
  );
}