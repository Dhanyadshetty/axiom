"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { ShortTextField } from "./ShortTextField";
import { SelectSingleField } from "./SelectSingleField";
import { NumberField } from "./NumberField";
import { FileUploadField } from "./FileUploadField";
import type { TableColumn, TableRowData } from "@/lib/assessment-templates/types";

interface ProductionSiteRowData {
  company_name: string;
  country: string;
  postal_code_city: string;
  production_area: number | "";
  contact_person_name: string;
  contact_email: string;
  contact_phone: string;
}

interface ProductionSitesFieldProps {
  value: ProductionSiteRowData[];
  onChange: (value: ProductionSiteRowData[]) => void;
  label: string;
  required?: boolean;
  help?: string;
  disabled?: boolean;
  validationErrors?: Record<string, string>;
  blockKey?: string;
  sectionKey?: string;
}

export function ProductionSitesField({
  value,
  onChange,
  label,
  required,
  help,
  disabled,
  validationErrors = {},
  blockKey,
  sectionKey,
}: ProductionSitesFieldProps) {
  const [expandedRows, setExpandedRows] = React.useState<Set<number>>(new Set());

  const countryOptions = [
    { value: "DE", label: "Germany" },
    { value: "US", label: "United States" },
    { value: "CN", label: "China" },
    { value: "IN", label: "India" },
    { value: "FR", label: "France" },
    { value: "GB", label: "United Kingdom" },
    { value: "IT", label: "Italy" },
    { value: "ES", label: "Spain" },
    { value: "PL", label: "Poland" },
    { value: "CZ", label: "Czech Republic" },
  ];

  const handleAddRow = () => {
    const newRow: ProductionSiteRowData = {
      company_name: "",
      country: "",
      postal_code_city: "",
      production_area: 0,
      contact_person_name: "",
      contact_email: "",
      contact_phone: "",
    };
    onChange([...value, newRow]);
  };

  const handleUpdateRow = (index: number, updates: Partial<ProductionSiteRowData>) => {
    const newValue = [...value];
    newValue[index] = { ...newValue[index], ...updates };
    onChange(newValue);
  };

  const handleDeleteRow = (index: number) => {
    const newValue = value.filter((_, i) => i !== index);
    onChange(newValue);
    setExpandedRows((prev) => {
      const next = new Set(prev);
      next.delete(index);
      return next;
    });
  };

  const handleToggleExpand = (index: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const generalErrorKey = "production_sites.general_error";
  const generalError = validationErrors[generalErrorKey];

  if (value.length === 0) {
    return (
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
          {label}
          {required && <span className="text-rose-500" aria-hidden="true">*</span>}
        </Label>
        <div
          className={cn(
            "rounded-xl border-2 border-dashed p-8 text-center",
            generalError ? "border-rose-400 bg-rose-50" : "border-slate-300 bg-white"
          )}
        >
          <p className="text-sm font-medium text-slate-600">No production or sales sites have been provided yet.</p>
          {generalError && (
            <p className="mt-2 text-sm text-rose-600 flex items-center justify-center gap-1">
              <span className="h-4 w-4 rounded-full bg-rose-500" />
              {generalError}
            </p>
          )}
          {!disabled && (
            <Button className="mt-3 gap-1.5 bg-slate-900 text-white hover:bg-slate-800" onClick={handleAddRow}>
              <Plus className="h-4 w-4" />
              Add site
            </Button>
          )}
        </div>
        {help && <p className="text-xs text-slate-500">{help}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
        {label}
        {required && <span className="text-rose-500" aria-hidden="true">*</span>}
      </Label>

      <div className="space-y-3">
        {value.map((row, index) => (
          <div
            key={index}
            className={cn(
              "rounded-lg border border-slate-200 bg-white p-4",
              expandedRows.has(index) && "bg-emerald-50 border-emerald-200"
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-medium text-slate-800">Production site #{index + 1}</h4>
                <p className="text-xs text-slate-500">{row.company_name || "Unnamed site"}</p>
              </div>
              <div className="flex items-center gap-2">
                {!disabled && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteRow(index)}
                    className="text-slate-500 hover:text-rose-600 h-8 w-8"
                    aria-label="Delete site"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToggleExpand(index)}
                  className="text-slate-500 hover:text-slate-700 h-8 w-8"
                  aria-label={expandedRows.has(index) ? "Collapse" : "Expand"}
                >
                  {expandedRows.has(index) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">
                  Company name* <span className="text-rose-500">*</span>
                </Label>
                <ShortTextField
                  value={row.company_name}
                  onChange={(val) => handleUpdateRow(index, { company_name: val })}
                  label=""
                  required={true}
                  disabled={disabled}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">
                  Country* <span className="text-rose-500">*</span>
                </Label>
                <SelectSingleField
                  value={row.country}
                  onChange={(val) => handleUpdateRow(index, { country: val })}
                  label=""
                  required={true}
                  disabled={disabled}
                  options={countryOptions}
                  placeholder="Select country"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">
                  Postal code & City* <span className="text-rose-500">*</span>
                </Label>
                <ShortTextField
                  value={row.postal_code_city}
                  onChange={(val) => handleUpdateRow(index, { postal_code_city: val })}
                  label=""
                  required={true}
                  disabled={disabled}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">
                  Production area (m²)
                </Label>
                <NumberField
                  value={row.production_area}
                  onChange={(val) => handleUpdateRow(index, { production_area: val })}
                  label=""
                  required={false}
                  disabled={disabled}
                  min={0}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">
                  Contact person name* <span className="text-rose-500">*</span>
                </Label>
                <ShortTextField
                  value={row.contact_person_name}
                  onChange={(val) => handleUpdateRow(index, { contact_person_name: val })}
                  label=""
                  required={true}
                  disabled={disabled}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">
                  Contact email* <span className="text-rose-500">*</span>
                </Label>
                <ShortTextField
                  value={row.contact_email}
                  onChange={(val) => handleUpdateRow(index, { contact_email: val })}
                  label=""
                  required={true}
                  disabled={disabled}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">
                  Contact phone* <span className="text-rose-500">*</span>
                </Label>
                <ShortTextField
                  value={row.contact_phone}
                  onChange={(val) => handleUpdateRow(index, { contact_phone: val })}
                  label=""
                  required={true}
                  disabled={disabled}
                />
              </div>
            </div>

            {expandedRows.has(index) && (
              <div className="mt-4 pt-4 border-t border-emerald-200">
                <h5 className="text-sm font-medium text-slate-700 mb-3">Additional info</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-700">Site type</Label>
                    <SelectSingleField
                      value=""
                      onChange={() => {}}
                      label=""
                      required={false}
                      disabled={disabled}
                      options={[{ value: "manufacturing", label: "Manufacturing" }, { value: "warehouse", label: "Warehouse" }, { value: "office", label: "Office" }]}
                      placeholder="Select type"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-700">Shift pattern</Label>
                    <SelectSingleField
                      value=""
                      onChange={() => {}}
                      label=""
                      required={false}
                      disabled={disabled}
                      options={[{ value: "1", label: "1 shift" }, { value: "2", label: "2 shifts" }, { value: "3", label: "3 shifts" }, { value: "continuous", label: "Continuous" }]}
                      placeholder="Select shift pattern"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {!disabled && (
          <Button className="gap-1.5 bg-slate-900 text-white hover:bg-slate-800 w-full" onClick={handleAddRow}>
            <Plus className="h-4 w-4" />
            Add site
          </Button>
        )}
      </div>

      {help && <p className="text-xs text-slate-500">{help}</p>}
    </div>
  );
}