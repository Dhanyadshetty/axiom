"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit2, X, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { ShortTextField } from "./ShortTextField";
import { NumberField } from "./NumberField";
import { SelectSingleField } from "./SelectSingleField";
import { SelectMultiTagsField } from "./SelectMultiTagsField";
import { FieldRenderer } from "./FieldRenderer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import type { TableColumn, TableRowData, Field, SubBlock, ModalField } from "@/lib/assessment-templates/types";

interface TableRowsFieldProps {
  value: TableRowData[];
  onChange: (value: TableRowData[]) => void;
  label: string;
  required?: boolean;
  help?: string;
  disabled?: boolean;
  columns: TableColumn[];
  emptyState?: string;
  addButtonLabel?: string;
  subBlocks?: SubBlock[];
  blockKey?: string;
  sectionKey?: string;
  validationErrors?: Record<string, string>;
  addRowModalTitle?: string;
  addRowModalSubtitle?: string;
  addRowModalFields?: ModalField[];
  addRowPrimaryButtonLabel?: string;
  addRowCancelButtonLabel?: string;
}

function renderCellInput(
  column: TableColumn,
  value: string | number | boolean | string[],
  onChange: (val: string | number | boolean | string[]) => void,
  disabled: boolean
) {
  const commonProps = {
    label: "",
    disabled,
    required: column.required,
  };

  switch (column.type) {
    case "short_text":
      return <ShortTextField {...commonProps} value={typeof value === "string" ? value : String(value)} onChange={onChange} placeholder={`Enter ${column.label.toLowerCase()}`} />;
    case "number":
      return <NumberField {...commonProps} value={typeof value === "number" ? value : value === "" ? "" : Number(value) || ""} onChange={onChange} min={column.min} max={column.max} step={column.step} />;
    case "select_single":
      return (
        <SelectSingleField
          {...commonProps}
          value={typeof value === "string" ? value : ""}
          onChange={onChange}
          options={column.options || []}
          placeholder={`Select ${column.label.toLowerCase()}`}
        />
      );
    case "select_multi_tags":
      return (
        <SelectMultiTagsField
          {...commonProps}
          value={Array.isArray(value) ? value : typeof value === "string" ? [value] : []}
          onChange={(vals) => onChange(vals)}
          options={column.options || []}
          placeholder={`Select ${column.label.toLowerCase()}`}
        />
      );
    default:
      return <ShortTextField {...commonProps} value={typeof value === "string" ? value : String(value)} onChange={onChange} placeholder={`Enter ${column.label.toLowerCase()}`} />;
  }
}

function renderSubBlockFields(
  subBlock: SubBlock,
  rowData: TableRowData,
  onRowChange: (updates: Partial<TableRowData>) => void,
  disabled: boolean,
  validationErrors?: Record<string, string>
) {
  return (
    <div className="mt-4 ml-4 border-l-2 border-emerald-200 pl-4 space-y-4">
      <h4 className="font-medium text-slate-700 flex items-center gap-1.5">
        <span className="text-lg">{subBlock.icon || "📍"}</span>
        {subBlock.title}
      </h4>
      { (subBlock.fields ?? []).map((field) => (
        <div
          key={field.key}
          className={cn(
            "space-y-1.5",
            validationErrors?.[field.key] && "border-l-2 border-rose-500 pl-3"
          )}
        >
          <FieldRenderer
            field={field}
            value={rowData[field.key]}
            onChange={(val) => onRowChange({ [field.key]: val as string | number | boolean })}
            disabled={disabled}
          />
          {validationErrors?.[field.key] && (
            <p className="text-xs text-rose-500 flex items-center gap-1" role="alert">
              <span className="h-3 w-3 rounded-full bg-rose-500" />
              {validationErrors[field.key]}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export function TableRowsField({
  value,
  onChange,
  label,
  required,
  help,
  disabled,
  columns,
  emptyState = "No data provided yet.",
  addButtonLabel = "+ Add row",
  subBlocks,
  blockKey,
  sectionKey,
  validationErrors = {},
  addRowModalTitle,
  addRowModalSubtitle,
  addRowModalFields = [],
  addRowPrimaryButtonLabel = "Add",
  addRowCancelButtonLabel = "Cancel",
}: TableRowsFieldProps) {
  // Guard against undefined value
  const rows = value ?? [];
  const [expandedRow, setExpandedRow] = React.useState<number | null>(null);
  const [editingRow, setEditingRow] = React.useState<number | null>(null);
  const [editValues, setEditValues] = React.useState<TableRowData>({});
  const [modalOpen, setModalOpen] = React.useState(false);
  const [draftValues, setDraftValues] = React.useState<TableRowData>({});

  const handleAddRow = () => {
    if (addRowModalFields.length > 0) {
      setDraftValues({});
      setModalOpen(true);
      return;
    }

    const newRow: TableRowData = {};
    columns.forEach((col) => {
      if (col.type === "number") newRow[col.key] = col.min || 0;
      else newRow[col.key] = "";
    });
    onChange([...rows, newRow]);
  };

  const handleSaveDraftRow = () => {
    if (addRowModalFields.length === 0) {
      handleAddRow();
      return;
    }

    const newRow: TableRowData = { ...draftValues };
    addRowModalFields.forEach((field) => {
      const current = draftValues[field.key];
      if (field.type === "select_multi_tags") {
        newRow[field.key] = Array.isArray(current) ? current : [];
      } else if (field.type === "number") {
        newRow[field.key] = current === undefined || current === "" ? 0 : Number(current);
      } else {
        newRow[field.key] = typeof current === "string" ? current : "";
      }
    });

    onChange([...rows, newRow]);
    setModalOpen(false);
    setDraftValues({});
  };

  const handleUpdateRow = (index: number, updates: Partial<TableRowData>) => {
    const newValue = [...rows];
    newValue[index] = { ...newValue[index], ...updates } as TableRowData;
    onChange(newValue);
  };

  const handleDeleteRow = (index: number) => {
    const newValue = rows.filter((_, i) => i !== index);
    onChange(newValue);
    if (expandedRow === index) setExpandedRow(null);
    if (editingRow === index) setEditingRow(null);
  };

  const handleEditRow = (index: number) => {
    setEditingRow(index);
    setEditValues({ ...rows[index] });
  };

  const handleSaveEdit = (index: number) => {
    handleUpdateRow(index, editValues);
    setEditingRow(null);
  };

  const handleCancelEdit = () => {
    setEditingRow(null);
    setEditValues({});
  };

  const handleToggleExpand = (index: number) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  const handleCellChange = (index: number, columnKey: string, val: string | number | boolean | string[]) => {
    if (editingRow === index) {
      setEditValues((prev) => ({ ...prev, [columnKey]: val }));
    } else {
      handleUpdateRow(index, { [columnKey]: val } as Partial<TableRowData>);
    }
  };

  const rowErrorKey = `${blockKey}.${label}.${"sites_table"}`;

  const isEmptyFieldValue = (value: string | number | boolean | string[] | undefined | null) => {
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === "string") return value.trim().length === 0;
    if (typeof value === "number") return Number.isNaN(value);
    if (typeof value === "boolean") return !value;
    return value === undefined || value === null;
  };

  const isAddDisabled = addRowModalFields.some((field) => {
    if (!field.required) return false;
    return isEmptyFieldValue(draftValues[field.key]);
  });

  const renderAddModalField = (field: ModalField) => {
    const value = draftValues[field.key];
    const placeholder = field.placeholder ?? `Enter ${field.label.toLowerCase()}`;

    switch (field.type) {
      case "short_text":
        return (
          <ShortTextField
            label={field.label}
            required={field.required}
            value={typeof value === "string" ? value : ""}
            onChange={(v) => setDraftValues((prev) => ({ ...prev, [field.key]: v }))}
            placeholder={placeholder}
          />
        );
      case "select_single": {
        const selectedValue = typeof value === "string" ? value : "";
        return (
          <SelectSingleField
            label={field.label}
            required={field.required}
            value={selectedValue}
            onChange={(v) => setDraftValues((prev) => ({ ...prev, [field.key]: v }))}
            options={field.options || []}
            placeholder={placeholder}
          />
        );
      }
      case "select_multi_tags": {
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <SelectMultiTagsField
            label={field.label}
            required={field.required}
            value={selectedValues}
            onChange={(v) => setDraftValues((prev) => ({ ...prev, [field.key]: v }))}
            options={field.options || []}
            placeholder={placeholder}
          />
        );
      }
      default:
        return (
          <ShortTextField
            label={field.label}
            required={field.required}
            value={typeof value === "string" ? value : ""}
            onChange={(v) => setDraftValues((prev) => ({ ...prev, [field.key]: v }))}
            placeholder={placeholder}
          />
        );
    }
  };

return (
     <>
         {rows.length === 0 ? (
             <div className="space-y-1.5">
                 <Label className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
                     {label}
                     {required && <span className="text-rose-600 font-bold" aria-hidden="true">*</span>}
                 </Label>
                 <div
                     className={cn(
                         "rounded-xl border-2 border-dashed p-8 text-center",
                         validationErrors[rowErrorKey] ? "border-rose-400 bg-rose-50" : "border-slate-300 bg-white"
                     )}
                 >
                     <p className="text-sm font-medium text-slate-600">{emptyState}</p>
                     {validationErrors[rowErrorKey] && (
                         <p className="mt-2 text-sm text-rose-600 flex items-center justify-center gap-1">
                             <span className="h-4 w-4 rounded-full bg-rose-500" />
                             {validationErrors[rowErrorKey]}
                         </p>
                     )}
                     {!disabled && (
                         <Button className="mt-3 gap-1.5 bg-slate-900 text-white hover:bg-slate-800" onClick={handleAddRow}>
                             <Plus className="h-4 w-4" />
                             {addButtonLabel}
                         </Button>
                     )}
                 </div>
                 {help && <p className="text-xs text-slate-500">{help}</p>}
             </div>
         ) : (
             <div className="space-y-1.5">
                 <Label className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
                     {label}
                     {required && <span className="text-rose-600 font-bold" aria-hidden="true">*</span>}
                 </Label>
                 <div className={cn("rounded-xl border overflow-hidden", validationErrors[rowErrorKey] && "border-rose-400")}>
                     <div className="overflow-x-auto">
                         <table className="w-full text-sm">
                             <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                 <tr className="border-b border-slate-200">
                                     {columns.map((col) => (
                                         <th key={col.key} className="px-4 py-3 text-left whitespace-nowrap min-w-[150px]">
                                             {col.label}
                                         </th>
                                     ))}
                                     <th className="w-24 px-4 py-3 text-right">Actions</th>
                                 </tr>
                             </thead>
                             <tbody>
                                 {rows.map((row, rowIdx) => (
                                     <React.Fragment key={rowIdx}>
                                         <tr className={cn("border-b border-slate-100 last:border-0", editingRow === rowIdx && "bg-emerald-50")}>
                                             {columns.map((col) => (
                                                 <td key={col.key} className="px-4 py-3">
                                                     {editingRow === rowIdx ? (
                                                         renderCellInput(
                                                             col,
                                                             row[col.key] ?? "",
                                                             (val) => handleCellChange(rowIdx, col.key, val),
                                                             disabled ?? false
                                                         )
                                                     ) : (
                                                         <span className="text-slate-700">
                                                             {row[col.key] !== undefined && row[col.key] !== ""
                                                               ? String(row[col.key])
                                                               : <span className="text-slate-400">—</span>}
                                                         </span>
                                                     )}
                                                 </td>
                                             ))}
                                             <td className="px-4 py-3">
                                                 <div className="flex items-center justify-end gap-1">
                                                     {editingRow === rowIdx ? (
                                                         <>
                                                             <Button
                                                                 variant="secondary"
                                                                 size="sm"
                                                                 onClick={() => handleSaveEdit(rowIdx)}
                                                                 disabled={disabled}
                                                                 className="gap-1 h-8"
                                                             >
                                                                 <CheckCircle2 className="h-3.5 w-3.5" /> Save
                                                             </Button>
                                                             <Button
                                                                 variant="ghost"
                                                                 size="sm"
                                                                 onClick={handleCancelEdit}
                                                                 disabled={disabled}
                                                                 className="h-8"
                                                             >
                                                                 <X className="h-3.5 w-3.5" />
                                                             </Button>
                                                         </>
                                                     ) : (
                                                         <>
                                                             {!disabled && (
                                                                 <>
                                                                     <Button
                                                                         variant="ghost"
                                                                         size="icon"
                                                                         onClick={() => handleEditRow(rowIdx)}
                                                                         className="text-slate-500 hover:text-slate-700 h-8 w-8"
                                                                         aria-label="Edit row"
                                                                     >
                                                                         <Edit2 className="h-3.5 w-3.5" />
                                                                     </Button>
                                                                     <Button
                                                                         variant="ghost"
                                                                         size="icon"
                                                                         onClick={() => handleDeleteRow(rowIdx)}
                                                                         className="text-slate-500 hover:text-rose-600 h-8 w-8"
                                                                         aria-label="Delete row"
                                                                     >
                                                                         <Trash2 className="h-3.5 w-3.5" />
                                                                     </Button>
                                                                 </>
                                                             )}
                                                             <Button
                                                                 variant="ghost"
                                                                 size="icon"
                                                                 onClick={() => handleToggleExpand(rowIdx)}
                                                                 className="text-slate-500 hover:text-slate-700 h-8 w-8"
                                                                 aria-label={expandedRow === rowIdx ? "Collapse" : "Expand"}
                                                             >
                                                                 {expandedRow === rowIdx ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                                                             </Button>
                                                         </>
                                                     )}
                                                 </div>
                                             </td>
                                         </tr>
                                         {expandedRow === rowIdx && subBlocks && (
                                             <tr>
                                                 <td colSpan={columns.length + 1} className="px-4 py-4 bg-slate-50 border-t border-slate-100">
                                                     {subBlocks.map((sb) => (
                                                         renderSubBlockFields(sb, row, (updates) => handleUpdateRow(rowIdx, updates), disabled ?? false, validationErrors)
                                                     ))}
                                                 </td>
                                             </tr>
                                         )}
                                     </React.Fragment>
                                 ))}
                             </tbody>
                         </table>
                     </div>
                     {!disabled && (
                         <div className="p-4 border-t border-slate-200 bg-slate-50">
                             <Button className="gap-1.5 bg-slate-900 text-white hover:bg-slate-800" onClick={handleAddRow}>
                                 <Plus className="h-4 w-4" />
                                 {addButtonLabel}
                             </Button>
                         </div>
                     )}
                 </div>

                 {help && <p className="text-xs text-slate-500">{help}</p>}
             </div>
         )}

         <Dialog open={modalOpen} onOpenChange={setModalOpen}>
             <DialogContent className="max-w-xl max-h-[85vh] overflow-hidden p-0 flex flex-col">
                 <div className="flex-1 min-h-0 max-h-[80vh] overflow-y-auto p-6">
                     <DialogHeader className="mb-4 space-y-2 text-left">
                         <DialogTitle className="text-2xl font-semibold text-slate-900">{addRowModalTitle || "Add row"}</DialogTitle>
                         {addRowModalSubtitle && <DialogDescription className="text-sm text-slate-600">{addRowModalSubtitle}</DialogDescription>}
                     </DialogHeader>
                     <div className="space-y-4">
                         {addRowModalFields.map((field) => (
                             <div key={field.key}>{renderAddModalField(field)}</div>
                         ))}
                     </div>
                 </div>
                 <DialogFooter className="border-t border-slate-200 bg-slate-50 px-6 py-4 sm:justify-end">
                     <Button variant="outline" onClick={() => setModalOpen(false)}>
                         {addRowCancelButtonLabel}
                     </Button>
                     <Button onClick={handleSaveDraftRow} disabled={isAddDisabled} className="bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-300 disabled:text-slate-500">
                         {addRowPrimaryButtonLabel}
                     </Button>
                 </DialogFooter>
             </DialogContent>
         </Dialog>
     </>
 );
}