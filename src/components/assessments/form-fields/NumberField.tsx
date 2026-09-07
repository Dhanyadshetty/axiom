"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NumberFieldProps {
  value: number | "";
  onChange: (value: number | "") => void;
  label: string;
  required?: boolean;
  help?: string;
  disabled?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

export function NumberField({
  value,
  onChange,
  label,
  required,
  help,
  disabled,
  placeholder,
  min,
  max,
  step = 1,
}: NumberFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "" || val === "-") {
      onChange("");
      return;
    }
    const num = Number(val);
    if (!isNaN(num)) {
      onChange(num);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val !== "" && val !== "-") {
      const num = Number(val);
      if (!isNaN(num)) {
        let clamped = num;
        if (min !== undefined) clamped = Math.max(clamped, min);
        if (max !== undefined) clamped = Math.min(clamped, max);
        if (clamped !== num) {
          onChange(clamped);
        }
      }
    }
  };

  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
        {label}
        {required && <span className="text-rose-500" aria-hidden="true">*</span>}
      </Label>
      <Input
        type="number"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
      {help && <p className="text-xs text-slate-500">{help}</p>}
    </div>
  );
}