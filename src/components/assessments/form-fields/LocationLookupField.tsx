"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Edit2 } from "lucide-react";

interface LocationLookupFieldProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  required?: boolean;
  help?: string;
  disabled?: boolean;
  placeholder?: string;
}

export function LocationLookupField({
  value,
  onChange,
  label,
  required,
  help,
  disabled,
  placeholder,
}: LocationLookupFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
        {label}
        {required && <span className="text-rose-500" aria-hidden="true">*</span>}
      </Label>
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder={placeholder || "Enter address or use map pin"}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => {
              // In a real implementation, this would open a map/geocoding modal
              alert("Geocoding autocomplete would open here");
            }}
            disabled={disabled}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors"
            aria-label="Open location picker"
          >
            <MapPin className="h-4 w-4" />
          </button>
        </div>
      </div>
      {help && <p className="text-xs text-slate-500">{help}</p>}
    </div>
  );
}