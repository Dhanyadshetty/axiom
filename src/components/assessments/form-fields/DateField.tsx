"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DateFieldProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  label: string;
  required?: boolean;
  help?: string;
  disabled?: boolean;
  placeholder?: string;
  validationErrors?: Record<string, string>;
  error?: string;
  fieldKey?: string;
  blockKey?: string;
}

function formatDateInput(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
}

export function DateField({
  id,
  value,
  onChange,
  label,
  required,
  help,
  disabled,
  placeholder,
  validationErrors,
  error,
  fieldKey,
  blockKey,
}: DateFieldProps) {
  const [inputValue, setInputValue] = React.useState(value);

  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  const hasError = !!error || (validationErrors &&
    (validationErrors[fieldKey!] || validationErrors[`${blockKey}.${fieldKey}`]));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatted = formatDateInput(raw);
    setInputValue(formatted);
    const digits = formatted.replace(/\D/g, "");
    if (digits.length >= 8) {
      const day = digits.slice(0, 2);
      const month = digits.slice(2, 4);
      const year = digits.slice(4, 8);
      onChange(`${day}/${month}/${year}`);
    } else {
      onChange(formatted);
    }
  };

  const handleBlur = () => {
    const digits = inputValue.replace(/\D/g, "");
    if (digits.length >= 8) {
      const day = digits.slice(0, 2);
      const month = digits.slice(2, 4);
      const year = digits.slice(4, 8);
      const formatted = `${day}/${month}/${year}`;
      setInputValue(formatted);
      onChange(formatted);
    }
  };

  return (
    <div className={label ? "space-y-1.5" : "space-y-0 w-full"}>
      {label ? (
        <Label className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
          {label}
          {required && <span className="text-rose-600 font-bold" aria-hidden="true">*</span>}
        </Label>
      ) : null}
      <Input
        id={id}
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder={placeholder || "dd/mm/yyyy"}
        className={cn("w-full", hasError && "border-rose-500 bg-rose-50")}
        maxLength={10}
      />
      {help && <p className="text-xs text-slate-500">{help}</p>}
      {hasError && (
        <p className="text-sm text-rose-600 flex items-center gap-1 mt-1">
          <span className="text-rose-500">•</span> {error || validationErrors?.[fieldKey!] || validationErrors?.[`${blockKey}.${fieldKey}`] || ""}
        </p>
      )}
    </div>
  );
}
