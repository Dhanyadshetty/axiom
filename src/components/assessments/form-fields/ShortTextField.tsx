"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ShortTextFieldProps {
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

export function ShortTextField({
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
}: ShortTextFieldProps) {
  const hasError = !!error || (validationErrors && 
    (validationErrors[fieldKey!] || validationErrors[`${blockKey}.${fieldKey}`]));
  
  React.useEffect(() => {
    if (hasError) {
      const element = document.getElementById(`field-${fieldKey}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.focus();
      }
    }
  }, [hasError, fieldKey]);

  const getErrorMessage = () => {
    if (error) return error;
    if (!validationErrors) return "";
    return validationErrors[fieldKey!] || validationErrors[`${blockKey}.${fieldKey}`] || "";
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
        id={`field-${fieldKey}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className={cn("w-full", hasError && "border-rose-500 bg-rose-50")}
      />
      {help && <p className="text-xs text-slate-500">{help}</p>}
      {hasError && (
        <p className="text-sm text-rose-600 flex items-center gap-1 mt-1">
          <span className="text-rose-500">•</span> {getErrorMessage()}
        </p>
      )}
    </div>
  );
}