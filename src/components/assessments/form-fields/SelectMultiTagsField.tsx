"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectMultiTagsFieldProps {
  value: string[];
  onChange: (value: string[]) => void;
  label: string;
  required?: boolean;
  help?: string;
  disabled?: boolean;
  options: SelectOption[];
  placeholder?: string;
  triggerClassName?: string;
  contentClassName?: string;
  compact?: boolean;
}

export function SelectMultiTagsField({
  value,
  onChange,
  label,
  required,
  help,
  disabled,
  options = [],
  placeholder,
  triggerClassName,
  contentClassName,
  compact = false,
}: SelectMultiTagsFieldProps) {
  const [open, setOpen] = React.useState(false);

  const handleToggle = (val: string) => {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  return (
    <div className={cn("w-full", compact ? "space-y-0" : "space-y-1.5")}>
      {label && (
        <Label className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
          {label}
          {required && <span className="text-rose-600 font-bold" aria-hidden="true">*</span>}
        </Label>
      )}

      <div className={cn("flex flex-wrap gap-1.5", compact ? "min-h-[2rem]" : "min-h-[42px]")}>
        {value.map((v) => {
          const opt = options.find((o) => o.value === v);
          return (
            <span
              key={v}
              className={cn(
                "inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-0.5 text-sm font-medium",
                disabled && "opacity-50"
              )}
            >
              {opt?.label || v}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleToggle(v)}
                  className="p-0.5 rounded-full hover:bg-emerald-100"
                  aria-label={`Remove ${opt?.label || v}`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </span>
          );
        })}
        <Select open={open} onOpenChange={setOpen} disabled={disabled}>
          <SelectTrigger
            className={cn(
              "h-9 min-w-[150px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition-colors hover:border-slate-300 focus:ring-0 focus-visible:ring-0 data-[placeholder]:text-slate-400",
              compact && "h-8 min-h-[2rem] py-1.5",
              triggerClassName
            )}
            onClick={() => setOpen(!open)}
          >
            <SelectValue placeholder={placeholder || "Select..."} />
          </SelectTrigger>
          <SelectContent className={cn("rounded-xl border border-slate-200 bg-white shadow-lg", contentClassName)}>
            {options.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                onSelect={(e) => {
                  e.preventDefault();
                  handleToggle(opt.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex items-center gap-2",
                  value.includes(opt.value) && "bg-emerald-50 text-emerald-700"
                )}
              >
                {value.includes(opt.value) && <span className="text-emerald-600">✓</span>}
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {help && <p className="text-xs text-slate-500">{help}</p>}
    </div>
  );
}