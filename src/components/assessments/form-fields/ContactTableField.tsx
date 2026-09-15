"use client";

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X, CheckCircle2, AlertTriangle, Trash2 } from 'lucide-react';
import { ShortTextField } from './ShortTextField';
import { SelectSingleField } from './SelectSingleField';
import { SelectMultiTagsField } from './SelectMultiTagsField';
import type { TableColumn, ContactRowData, ModalField } from '@/lib/assessment-templates/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

function SearchableOptionField({
  label,
  required,
  value,
  onChange,
  options,
  multiple,
  placeholder,
  disabled,
}: {
  label: string;
  required?: boolean;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  options: { value: string; label: string }[];
  multiple?: boolean;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');

  const currentValues = React.useMemo(() => {
    if (multiple) {
      return Array.isArray(value) ? value : [];
    }

    return typeof value === 'string' && value ? [value] : [];
  }, [multiple, value]);

  const filteredOptions = React.useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return options;
    return options.filter((option) => option.label.toLowerCase().includes(normalized));
  }, [options, query]);

  const selectedLabels = React.useMemo(() => {
    const selected = options.filter((option) => currentValues.includes(option.value));
    if (!multiple) {
      return selected[0]?.label ?? placeholder ?? 'Select...';
    }
    return selected.length ? selected.map((option) => option.label).join(', ') : placeholder ?? 'Select...';
  }, [currentValues, multiple, options, placeholder]);

  const toggleValue = (nextValue: string) => {
    if (multiple) {
      const current = Array.isArray(value) ? value : [];
      const next = current.includes(nextValue)
        ? current.filter((item) => item !== nextValue)
        : [...current, nextValue];
      onChange(next);
      return;
    }

    onChange(nextValue);
    setOpen(false);
  };

  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
        {label}
        {required && <span className="text-rose-600 font-bold" aria-hidden="true">*</span>}
      </Label>
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setOpen((prev) => !prev)}
          className="flex w-full items-center justify-between rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-left text-sm text-slate-700 shadow-sm transition hover:border-slate-400"
        >
          <span className={cn('truncate', currentValues.length === 0 && 'text-slate-400')}>{selectedLabels}</span>
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 text-slate-500">
            <path d="M5 7.5l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {open && !disabled && (
          <div className="absolute z-30 mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm text-slate-700 outline-none ring-0 placeholder:text-slate-400 focus:border-slate-300"
            />
            <div className="mt-2 max-h-60 space-y-1 overflow-y-auto">
              {filteredOptions.length ? filteredOptions.map((option) => {
                const checked = multiple ? currentValues.includes(option.value) : currentValues[0] === option.value;
                return (
                  <label
                    key={option.value}
                    className={cn(
                      'flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-100',
                      checked && 'bg-slate-100'
                    )}
                  >
                    <input
                      type={multiple ? 'checkbox' : 'radio'}
                      checked={checked}
                      onChange={() => toggleValue(option.value)}
                      className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                    />
                    <span className="flex-1">{option.label}</span>
                  </label>
                );
              }) : (
                <div className="px-2 py-3 text-sm text-slate-500">No options found</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface ContactTableFieldProps {
  value: ContactRowData[];
  onChange: (value: ContactRowData[]) => void;
  label: string;
  required?: boolean;
  help?: string;
  disabled?: boolean;
  columns: TableColumn[];
  addButtonLabel?: string;
  modalFields?: ModalField[];
  modalTitle?: string;
  modalSubtitle?: string;
  modalPrimaryButtonLabel?: string;
  modalCancelButtonLabel?: string;
  blockKey?: string;
  sectionKey?: string;
  validationErrors?: Record<string, string>;
}

export function ContactTableField({
  value,
  onChange,
  label,
  required,
  help,
  disabled,
  columns,
  addButtonLabel = '+ Add Contact',
  modalFields = [],
  modalTitle = 'Add Contact',
  modalSubtitle = "Enter the Contact's information.",
  modalPrimaryButtonLabel = 'Create',
  modalCancelButtonLabel = 'Cancel',
  blockKey,
  sectionKey,
  validationErrors = {},
}: ContactTableFieldProps) {
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
  const [editValues, setEditValues] = React.useState<Partial<ContactRowData>>({});
  const [modalOpen, setModalOpen] = React.useState(false);
  const [departmentFilter, setDepartmentFilter] = React.useState<string[]>([]);

  const departmentOptions = [
    { value: 'sales', label: 'Sales' },
    { value: 'quality_management', label: 'Quality Management' },
    { value: 'logistics_supply_chain', label: 'Logistics/Supply Chain' },
    { value: 'executive_management', label: 'Executive Management' },
    { value: 'complaints', label: 'Complaints' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'purchasing_procurement', label: 'Purchasing/Procurement' },
  ];

  const allDepartments = React.useMemo(
    () => [...new Set(value.flatMap((contact) => contact.department || []))],
    [value]
  );

  const filteredContacts = React.useMemo(() => {
    if (departmentFilter.length === 0) return value;
    return value.filter((contact) => {
      const departments = contact.department || [];
      return departments.some((department) => departmentFilter.includes(department));
    });
  }, [departmentFilter, value]);

  const handleAddContact = () => {
    if (modalFields.length > 0) {
      setEditValues({});
      setModalOpen(true);
    } else {
      const newContact: ContactRowData = { name: '', email: '' };
      columns.forEach((col) => {
        if (!newContact[col.key as keyof ContactRowData]) {
          (newContact as any)[col.key] = col.type === 'select_multi_tags' ? [] : '';
        }
      });
      onChange([...value, newContact]);
    }
  };

  const handleSaveModal = () => {
    const emailValue = (editValues.email ?? '').toString().trim();
    if (!emailValue) return;

    const firstName = (editValues.first_name ?? editValues.firstName ?? '').toString().trim();
    const lastName = (editValues.last_name ?? editValues.lastName ?? '').toString().trim();
    const newContact: ContactRowData = { name: '', email: emailValue, ...editValues };

    if (firstName || lastName) {
      newContact.name = `${firstName} ${lastName}`.trim();
    }

    if (firstName) newContact.firstName = firstName;
    if (lastName) newContact.lastName = lastName;

    onChange([...value, newContact]);
    setModalOpen(false);
    setEditValues({});
  };

  const isSaveDisabled = !((editValues.email ?? '').toString().trim());

  const handleUpdateRow = (index: number, updates: Partial<ContactRowData>) => {
    const newValue = [...value];
    newValue[index] = { ...newValue[index], ...updates };
    onChange(newValue);
  };

  const handleDeleteRow = (index: number) => {
    const newValue = value.filter((_, i) => i !== index);
    onChange(newValue);
    if (editingIndex === index) setEditingIndex(null);
  };

  const handleEditRow = (index: number) => {
    setEditingIndex(index);
    setEditValues({ ...value[index] });
  };

  const handleSaveEdit = (index: number) => {
    handleUpdateRow(index, editValues);
    setEditingIndex(null);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditValues({});
  };

  const handleCellChange = (index: number, columnKey: string, val: string | string[]) => {
    if (editingIndex === index) {
      setEditValues((prev) => ({ ...prev, [columnKey]: val }));
    } else {
      handleUpdateRow(index, { [columnKey]: val } as Partial<ContactRowData>);
    }
  };

  const getDepartmentDisplay = (contact: ContactRowData) => {
    if (!contact.department || contact.department.length === 0) return '—';
    return contact.department.map(dept => {
      const option = departmentOptions.find(opt => opt.value === dept);
      return option ? option.label : dept;
    }).join(', ');
  };

  const isDepartmentMet = (contact: ContactRowData) => {
    const dept = contact.department || [];
    return dept.length > 0 && dept.every(d => departmentFilter.includes(d));
  };

  const renderCellInput = (column: TableColumn, contact: ContactRowData, index: number) => {
    const rawVal = editValues[column.key as keyof ContactRowData] !== undefined
      ? editValues[column.key as keyof ContactRowData]
      : contact[column.key as keyof ContactRowData];

    switch (column.type) {
      case 'short_text':
        return (
          <Input
            value={typeof rawVal === 'string' ? rawVal : ''}
            onChange={(e) => handleCellChange(index, column.key, e.target.value)}
            placeholder={`Enter ${column.label.toLowerCase()}`}
            disabled={disabled}
            className="h-8 min-h-[2rem] w-full rounded-lg border-slate-300 bg-white px-2.5 py-1 text-sm shadow-sm focus:border-slate-400 focus:ring-0"
          />
        );
      case 'select_single':
        return (
          <SelectSingleField
            label=""
            disabled={disabled}
            required={column.required}
            value={typeof rawVal === 'string' ? rawVal : ''}
            onChange={(v) => handleCellChange(index, column.key, v)}
            options={column.options || []}
            placeholder={`Select ${column.label.toLowerCase()}`}
            triggerClassName="h-8 min-h-[2rem] py-1 text-sm rounded-lg border-slate-300 bg-white text-slate-700 shadow-sm"
            contentClassName="rounded-xl border border-slate-200 bg-white shadow-lg"
            compact
          />
        );
      case 'select_multi_tags':
        return (
          <SelectMultiTagsField
            label=""
            disabled={disabled}
            required={column.required}
            value={Array.isArray(rawVal) ? rawVal : []}
            onChange={(v) => handleCellChange(index, column.key, v)}
            options={column.options || []}
            placeholder={`Select ${column.label.toLowerCase()}`}
            triggerClassName="h-8 min-h-[2rem] py-1 text-sm rounded-lg border-slate-300 bg-white text-slate-700 shadow-sm"
            contentClassName="rounded-xl border border-slate-200 bg-white shadow-lg"
            compact
          />
        );
      default:
        return (
          <Input
            value={typeof rawVal === 'string' ? rawVal : ''}
            onChange={(e) => handleCellChange(index, column.key, e.target.value)}
            placeholder={`Enter ${column.label.toLowerCase()}`}
            disabled={disabled}
            className="h-8 min-h-[2rem] w-full rounded-lg border-slate-300 bg-white px-2.5 py-1 text-sm shadow-sm focus:border-slate-400 focus:ring-0"
          />
        );
    }
  };

  const renderViewCellValue = (column: TableColumn, contact: ContactRowData) => {
    const rawVal = contact[column.key as keyof ContactRowData];
    if (rawVal === undefined || rawVal === null || rawVal === "" || (Array.isArray(rawVal) && rawVal.length === 0)) {
      return <span className="text-slate-400">—</span>;
    }
    if (Array.isArray(rawVal)) {
      const formatted = rawVal.map((v) => column.options?.find((opt) => opt.value === v)?.label || v).join(", ");
      return <span>{formatted || "—"}</span>;
    }
    if (typeof rawVal === "string" && column.options) {
      const opt = column.options.find((o) => o.value === rawVal);
      return <span>{opt?.label || rawVal}</span>;
    }
    return <span>{String(rawVal)}</span>;
  };

  const renderModalField = (field: ModalField) => {
    const val = editValues[field.key as keyof ContactRowData] as string | string[];
    const commonProps = {
      label: field.label,
      required: field.required,
      disabled: false,
    };
    const placeholder = field.placeholder ?? (
      field.key === 'email' ? 'Enter business email' :
      field.key === 'phone' ? 'Add phone numbers' :
      field.key === 'first_name' ? 'Enter first name' :
      field.key === 'last_name' ? 'Enter last name' :
      `Enter ${field.label.toLowerCase()}`
    );

    switch (field.type) {
      case 'short_text':
        return <ShortTextField {...commonProps} value={typeof val === 'string' ? val : ''} onChange={(v) => setEditValues((prev) => ({ ...prev, [field.key]: v }))} placeholder={placeholder} />;
      case 'select_single':
        return (
          <SelectSingleField
            label={field.label}
            required={field.required}
            value={typeof val === 'string' ? val : ''}
            onChange={(v) => setEditValues((prev) => ({ ...prev, [field.key]: v }))}
            options={field.options || []}
            placeholder={placeholder}
          />
        );
      case 'select_multi_tags':
        return (
          <SelectMultiTagsField
            label={field.label}
            required={field.required}
            value={Array.isArray(val) ? val : []}
            onChange={(v) => setEditValues((prev) => ({ ...prev, [field.key]: v }))}
            options={field.options || []}
            placeholder={placeholder}
          />
        );
      default:
        return <ShortTextField {...commonProps} value={typeof val === 'string' ? val : ''} onChange={(v) => setEditValues((prev) => ({ ...prev, [field.key]: v }))} placeholder={placeholder} />;
    }
  };

  const cleanButtonLabel = (addButtonLabel || "Add Contact").replace(/^\+\s*/, "");

  return (
    <>
      {value.length === 0 ? (
        <div className="w-full space-y-3">
          {/* Required departments tracking */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              Required departments
              {allDepartments.length < departmentOptions.length && (
                <AlertTriangle className="h-3.5 w-3.5 text-rose-500" aria-label="Department requirement not met" />
              )}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {departmentOptions.map((dept) => {
                const isSelected = departmentFilter.includes(dept.value);
                const isMet = allDepartments.includes(dept.value);
                return (
                  <button
                    key={dept.value}
                    type="button"
                    onClick={() => {
                      setDepartmentFilter((current) =>
                        current.includes(dept.value)
                          ? current.filter((item) => item !== dept.value)
                          : [...current, dept.value]
                      );
                    }}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
                      isSelected
                        ? "border-slate-800 bg-slate-900 text-white"
                        : isMet
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-rose-200 bg-rose-50 text-rose-700"
                    )}
                  >
                    {dept.label}
                    {isMet ? null : <AlertTriangle className="h-3 w-3" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
            <p className="text-sm font-medium text-slate-600">No contacts added yet</p>
            {!disabled && (
              <Button type="button" className="mt-3 gap-1.5 bg-slate-900 text-white hover:bg-slate-800 h-8 text-xs font-medium" onClick={handleAddContact}>
                <Plus className="h-3.5 w-3.5" />
                {cleanButtonLabel}
              </Button>
            )}
          </div>
          {help && <p className="text-xs text-slate-500">{help}</p>}
        </div>
      ) : (
        <div className="w-full space-y-3">
          {/* Required departments tracking */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              Required departments
              {allDepartments.length < departmentOptions.length && (
                <AlertTriangle className="h-3.5 w-3.5 text-rose-500" aria-label="Department requirement not met" />
              )}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {departmentOptions.map((dept) => {
                const isSelected = departmentFilter.includes(dept.value);
                const isMet = allDepartments.includes(dept.value);
                return (
                  <button
                    key={dept.value}
                    type="button"
                    onClick={() => {
                      setDepartmentFilter((current) =>
                        current.includes(dept.value)
                          ? current.filter((item) => item !== dept.value)
                          : [...current, dept.value]
                      );
                    }}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
                      isSelected
                        ? "border-slate-800 bg-slate-900 text-white"
                        : isMet
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-rose-200 bg-rose-50 text-rose-700"
                    )}
                  >
                    {dept.label}
                    {isMet ? null : <AlertTriangle className="h-3 w-3" />}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-500">
              {allDepartments.length < departmentOptions.length
                ? `Please add contacts for: ${departmentOptions.filter((d) => !allDepartments.includes(d.value)).map((d) => d.label).join(', ')}`
                : 'All required departments have at least one contact'}
            </p>
          </div>

          {/* Table */}
          <div className="w-full min-w-0 rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
            <div className="w-full overflow-x-auto">
              <table className="w-full border-separate border-spacing-0 text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    {columns.map((col) => (
                      <th key={col.key} className="min-w-[140px] whitespace-nowrap px-3.5 py-2.5 text-left align-middle font-semibold text-slate-600">
                        {col.label}
                      </th>
                    ))}
                    <th className="w-[110px] min-w-[110px] whitespace-nowrap px-3.5 py-2.5 text-right align-middle font-semibold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredContacts.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-sm text-slate-500 align-middle">
                        No contacts match the selected department filter.
                      </td>
                    </tr>
                  ) : filteredContacts.map((contact, idx) => (
                    <tr key={idx} className={cn("transition-colors align-middle", editingIndex === idx ? "bg-emerald-50/50" : "hover:bg-slate-50/60")}>
                      {columns.map((col) => (
                        <td key={col.key} className="px-3.5 py-2.5 align-middle text-slate-700 leading-normal">
                          {editingIndex === idx ? (
                            <div className="flex items-center min-h-[32px]">
                              {renderCellInput(col, contact, idx)}
                            </div>
                          ) : (
                            <div className="flex items-center min-h-[32px] text-slate-700">
                              {renderViewCellValue(col, contact)}
                            </div>
                          )}
                        </td>
                      ))}
                      <td className="w-[110px] min-w-[110px] px-3.5 py-2.5 align-middle text-right">
                        <div className="flex items-center justify-end gap-1 min-h-[32px] whitespace-nowrap">
                          {editingIndex === idx ? (
                            <>
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => handleSaveEdit(idx)}
                                disabled={disabled}
                                className="h-8 px-2.5 gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm shrink-0"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>Save</span>
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={handleCancelEdit}
                                disabled={disabled}
                                className="h-8 w-8 text-slate-500 hover:text-slate-800 shrink-0"
                                title="Cancel edit"
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          ) : (
                            <>
                              {!disabled && (
                                <>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditRow(idx)}
                                    className="h-8 w-8 text-slate-500 hover:text-slate-800 hover:bg-slate-100 shrink-0"
                                    aria-label="Edit contact"
                                    title="Edit contact"
                                  >
                                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M11 4H4a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-7" />
                                      <path d="M14.304 9.646a.5.5 0 011.414-.293L19 12l-1.293 1.293a.5.5 0 01-.293 1.414M14 11l3 3M9 14l1 5" />
                                    </svg>
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteRow(idx)}
                                    className="h-8 w-8 text-slate-500 hover:text-rose-600 hover:bg-rose-50 shrink-0"
                                    aria-label="Delete contact"
                                    title="Delete contact"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!disabled && (
              <div className="p-3 border-t border-slate-200 bg-slate-50/70">
                <Button type="button" className="gap-1.5 bg-slate-900 text-white hover:bg-slate-800 h-8 text-xs font-medium" onClick={handleAddContact}>
                  <Plus className="h-3.5 w-3.5" />
                  {cleanButtonLabel}
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
                         <DialogTitle className="text-2xl font-semibold text-slate-900">{modalTitle}</DialogTitle>
                         <DialogDescription className="text-sm text-slate-600">{modalSubtitle}</DialogDescription>
                     </DialogHeader>
                     <div className="space-y-4">
                         {modalFields.map((field) => (
                             <div key={field.key}>{renderModalField(field)}</div>
                         ))}
                     </div>
                 </div>
                 <DialogFooter className="border-t border-slate-200 bg-slate-50 px-6 py-4 sm:justify-end">
                     <Button variant="outline" onClick={() => setModalOpen(false)}>
                         Cancel
                     </Button>
                     <Button onClick={handleSaveModal} disabled={isSaveDisabled} className="bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-300 disabled:text-slate-500">
                         Create
                     </Button>
                 </DialogFooter>
             </DialogContent>
         </Dialog>
     </>
 );
}