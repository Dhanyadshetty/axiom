"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { CheckCircle2, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface YesNoConfirmFieldProps {
  value: "yes" | "no" | "";
  onChange: (value: "yes" | "no" | "") => void;
  label: string;
  required?: boolean;
  help?: string;
  disabled?: boolean;
  clearable?: boolean;
}

// Radix <Select.Item /> cannot have an empty-string value, so the "clear"
// action uses a sentinel that we map back to "" in onValueChange.
const CLEAR_VALUE = "__clear__";

export function YesNoConfirmField({
  value,
  onChange,
  label,
  required,
  help,
  disabled,
  clearable,
}: YesNoConfirmFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
        {label}
        {required && <span className="text-rose-500" aria-hidden="true">*</span>}
        {value === "yes" && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
      </Label>
      <Select
        value={value}
        onValueChange={(v) => onChange(v === CLEAR_VALUE ? "" : (v as "yes" | "no"))}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent>
          {clearable && (
            <SelectItem value={CLEAR_VALUE} className="flex items-center gap-2">
              <X className="h-4 w-4 text-slate-400" />
              <span className="text-slate-400">Clear</span>
            </SelectItem>
          )}
          <SelectItem value="yes" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Yes</span>
          </SelectItem>
          <SelectItem value="no" className="flex items-center gap-2">
            <span className="w-4" />
            <span>No</span>
          </SelectItem>
        </SelectContent>
      </Select>
      {help && <p className="text-xs text-slate-500">{help}</p>}
    </div>
  );
}