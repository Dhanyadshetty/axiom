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
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
        {effectiveLabel}
        {required && <span className="text-rose-500" aria-hidden="true">*</span>}
      </Label>
      <Select
        value={value}
        onValueChange={(v) => onChange(v === CLEAR_VALUE ? "" : v)}
        disabled={disabled}
      >
        <SelectTrigger className={cn("w-full", fieldError && "border-rose-500")}>
          <SelectValue placeholder={placeholder || "Select..."} />
        </SelectTrigger>
        <SelectContent>
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