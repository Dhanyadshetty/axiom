"use client";

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, X, CheckCircle2, AlertTriangle, Users, Trash2 } from 'lucide-react';
import { ShortTextField } from './ShortTextField';
import { SelectSingleField } from './SelectSingleField';
import { SelectMultiTagsField } from './SelectMultiTagsField';
import type { TableColumn, ContactRowData, ModalField } from '@/lib/assessment-templates/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';

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

  // Get all unique departments from contacts
  React.useEffect(() => {
    const allDepartments = value.flatMap(contact => contact.department || []);
    setDepartmentFilter([...new Set(allDepartments)]);
  }, [value]);

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
    const newContact: ContactRowData = { name: '', email: '', ...editValues };
    // Combine first/last name if needed
    if (editValues.firstName || editValues.lastName) {
      newContact.name = `${editValues.firstName || ''} ${editValues.lastName || ''}`.trim();
    }
    onChange([...value, newContact]);
    setModalOpen(false);
    setEditValues({});
  };

  const handleUpdateRow = (index: number, updates: Partial<ContactRowData>) => {
    const newValue = [...value];
    newValue[index] = { ...newValue[index], ...updates };
    onChange(newValue);
  };

  const handleDeleteRow = (index: number) => {
    const newValue = value.filter((_, i) => i !== index);
    onChange(newValue);
    if (editingIndex === index) setEditingIndex(null);
    
    // Update department filter
    const allDepartments = newValue.flatMap(contact => contact.department || []);
    setDepartmentFilter([...new Set(allDepartments)]);
  };

  const handleEditRow = (index: number) => {
    setEditingIndex(index);
    setEditValues({ ...value[index] });
  };

  const handleSaveEdit = (index: number) => {
    handleUpdateRow(index, editValues);
    setEditingIndex(null);
    
    // Update department filter
    const allDepartments = value.flatMap(contact => contact.department || []);
    setDepartmentFilter([...new Set(allDepartments)]);
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
      
      // Update department filter
      const allDepartments = value.flatMap(contact => contact.department || []);
      setDepartmentFilter([...new Set(allDepartments)]);
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
    const val = contact[column.key as keyof ContactRowData] as string | string[];
    const commonProps = {
      label: '',
      disabled,
      required: column.required,
    };

    switch (column.type) {
      case 'short_text':
        return <ShortTextField {...commonProps} value={typeof val === 'string' ? val : ''} onChange={(v) => handleCellChange(index, column.key, v)} placeholder={`Enter ${column.label.toLowerCase()}`} />;
      case 'select_single':
        return <SelectSingleField {...commonProps} value={typeof val === 'string' ? val : ''} onChange={(v) => handleCellChange(index, column.key, v)} options={column.options || []} placeholder={`Select ${column.label.toLowerCase()}`} />;
      case 'select_multi_tags':
        return <SelectMultiTagsField {...commonProps} value={Array.isArray(val) ? val : []} onChange={(v) => handleCellChange(index, column.key, v)} options={column.options || []} placeholder={`Select ${column.label.toLowerCase()}`} />;
      default:
        return <ShortTextField {...commonProps} value={typeof val === 'string' ? val : ''} onChange={(v) => handleCellChange(index, column.key, v)} placeholder={`Enter ${column.label.toLowerCase()}`} />;
    }
  };

  const renderModalField = (field: ModalField) => {
    const val = editValues[field.key as keyof ContactRowData] as string | string[];
    const commonProps = {
      label: field.label,
      required: field.required,
      disabled: false,
    };

    switch (field.type) {
      case 'short_text':
        return <ShortTextField {...commonProps} value={typeof val === 'string' ? val : ''} onChange={(v) => setEditValues((prev) => ({ ...prev, [field.key]: v }))} placeholder={`Enter ${field.label.toLowerCase()}`} />;
      case 'select_single':
        return <SelectSingleField {...commonProps} value={typeof val === 'string' ? val : ''} onChange={(v) => setEditValues((prev) => ({ ...prev, [field.key]: v }))} options={field.options || []} placeholder={`Select ${field.label.toLowerCase()}`} />;
      case 'select_multi_tags':
        return <SelectMultiTagsField {...commonProps} value={Array.isArray(val) ? val : []} onChange={(v) => setEditValues((prev) => ({ ...prev, [field.key]: v }))} options={field.options || []} placeholder={`Select ${field.label.toLowerCase()}`} />;
      default:
        return <ShortTextField {...commonProps} value={typeof val === 'string' ? val : ''} onChange={(v) => setEditValues((prev) => ({ ...prev, [field.key]: v }))} placeholder={`Enter ${field.label.toLowerCase()}`} />;
    }
  };

  if (value.length === 0) {
    return (
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
          {label}
          {required && <span className="text-rose-500" aria-hidden="true">*</span>}
        </Label>
        <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="text-sm font-medium text-slate-600">No contacts added yet</p>
          {!disabled && (
            <Button className="mt-3 gap-1.5 bg-slate-900 text-white hover:bg-slate-800" onClick={handleAddContact}>
              <Plus className="h-4 w-4" />
              {addButtonLabel}
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

      {/* Department pills */}
      <div className="mb-4">
        <p className="text-xs font-medium text-slate-700 mb-2 flex items-center gap-1">
          Department filter
          {departmentFilter.length < departmentOptions.length && (
            <AlertTriangle className="h-3 w-3 text-rose-500" aria-label="Department requirement not met" />
          )}
        </p>
        <div className="flex flex-wrap gap-2">
          {departmentOptions.map((dept) => {
            const isMet = departmentFilter.includes(dept.value);
            return (
              <span
                key={dept.value}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
                  isMet
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-rose-50 text-rose-700 border border-rose-200"
                )}
              >
                {dept.label}
                {!isMet && <AlertTriangle className="h-3 w-3" />}
              </span>
            );
          })}
        </div>
        <p className="text-xs text-slate-500 mt-1">
          {departmentFilter.length < departmentOptions.length
            ? `Please add contacts for: ${departmentOptions.filter(d => !departmentFilter.includes(d.value)).map(d => d.label).join(', ')}`
            : 'All departments have at least one contact'}
      </p>
      </div>

      <div className="rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                {columns.map((col) => (
                  <th key={col.key} className="px-4 py-3 text-left whitespace-nowrap min-w-[150px]">
                    {col.label}
                  </th>
                ))}
                <th className="w-24 px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {value.map((contact, idx) => (
                <tr key={idx} className={cn("border-b border-slate-100 last:border-0", editingIndex === idx && "bg-emerald-50")}>                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      {editingIndex === idx ? (
                        renderCellInput(col, contact, idx)
                      ) : (
                        <span className="text-slate-700">
                          {contact[col.key as keyof ContactRowData] !== undefined &&
                          contact[col.key as keyof ContactRowData] !== "" &&
                          !(Array.isArray(contact[col.key as keyof ContactRowData]) &&
                            (contact[col.key as keyof ContactRowData] as string[]).length === 0)
                            ? Array.isArray(contact[col.key as keyof ContactRowData])
                              ? (contact[col.key as keyof ContactRowData] as string[]).join(", ")
                              : String(contact[col.key as keyof ContactRowData])
                            : <span className="text-slate-400">—</span>}
                        </span>
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {editingIndex === idx ? (
                        <>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleSaveEdit(idx)}
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
                                onClick={() => handleEditRow(idx)}
                                className="text-slate-500 hover:text-slate-700 h-8 w-8"
                                aria-label="Edit contact"
                              >
                                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M11 4H4a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-7" />
                                  <path d="M14.304 9.646a.5.5 0 011.414-.293L19 12l-1.293 1.293a.5.5 0 01-.293 1.414M14 11l3 3M9 14l1 5" />
                                </svg>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteRow(idx)}
                                className="text-slate-500 hover:text-rose-600 h-8 w-8"
                                aria-label="Delete contact"
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
          <div className="p-4 border-t border-slate-200 bg-slate-50">
            <Button className="gap-1.5 bg-slate-900 text-white hover:bg-slate-800" onClick={handleAddContact}>
              <Plus className="h-4 w-4" />
              {addButtonLabel}
            </Button>
          </div>
        )}
      </div>

      {help && <p className="text-xs text-slate-500">{help}</p>}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Contact</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {modalFields.map((field) => (
              <div key={field.key}>{renderModalField(field)}</div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveModal} className="bg-emerald-600 hover:bg-emerald-700">
              Add Contact
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}