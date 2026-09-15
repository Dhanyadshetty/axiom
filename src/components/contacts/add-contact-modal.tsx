'use client';

import * as React from 'react';
import {
    ChevronDown,
    ChevronLeft,
    Search,
    Building2,
    Info,
    Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
    createContact,
    updateContact,
    listSuppliersLite,
} from '@/app/actions/contacts-detail';
import {
    DEFAULT_DEPARTMENT_OPTIONS,
    DEFAULT_LANGUAGE_OPTIONS,
    type ContactStatus,
} from '@/components/contacts/contacts-schema';

export interface AddContactModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    supplierId?: string;
    supplierName?: string;
    supplierLocked?: boolean;
    showSupplierPicker?: boolean;
    editing?: {
        id: string;
        name: string;
        email: string;
        phone: string | null;
        language: string | null;
        department: string | null;
        position: string | null;
        responsibility: string | null;
        status: ContactStatus;
    } | null;
    onSuccess?: () => void;
}

export function AddContactModal({
    open,
    onOpenChange,
    supplierId: initialSupplierId,
    supplierName: initialSupplierName,
    supplierLocked = false,
    showSupplierPicker = true,
    editing = null,
    onSuccess,
}: AddContactModalProps) {
    const [step, setStep] = React.useState<1 | 2>(1);
    const [firstName, setFirstName] = React.useState('');
    const [lastName, setLastName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [phone, setPhone] = React.useState('');
    const [language, setLanguage] = React.useState('');
    const [pickedSupplierId, setPickedSupplierId] = React.useState<string>(initialSupplierId ?? '');
    const [supplierSearch, setSupplierSearch] = React.useState('');
    const [supplierDropdownOpen, setSupplierDropdownOpen] = React.useState(false);
    const [supplierOptions, setSupplierOptions] = React.useState<Array<{ id: string; name: string; supplierNumber: string | null }>>([]);

    // Step 2 fields
    const [department, setDepartment] = React.useState('');
    const [newDepartment, setNewDepartment] = React.useState('');
    const [position, setPosition] = React.useState('');
    const [responsibility, setResponsibility] = React.useState('');
    const [newResponsibility, setNewResponsibility] = React.useState('');
    const [status, setStatus] = React.useState<ContactStatus>('active');
    const [saving, setSaving] = React.useState(false);

    React.useEffect(() => {
        if (open && supplierOptions.length === 0) {
            listSuppliersLite().then(setSupplierOptions).catch(() => {});
        }
    }, [open, supplierOptions.length]);

    const [supplierError, setSupplierError] = React.useState(false);

    React.useEffect(() => {
        if (!open) {
            setStep(1);
            setSupplierError(false);
            return;
        }
        if (editing) {
            const parts = (editing.name || '').trim().split(/\s+/);
            setFirstName(parts[0] || '');
            setLastName(parts.slice(1).join(' ') || '');
            setEmail(editing.email || '');
            setPhone(editing.phone || '');
            setLanguage(editing.language || '');
            setDepartment(editing.department || '');
            setNewDepartment('');
            setPosition(editing.position || '');
            setResponsibility(editing.responsibility || '');
            setNewResponsibility('');
            setStatus(editing.status || 'active');
            setPickedSupplierId(initialSupplierId ?? '');
        } else {
            setFirstName('');
            setLastName('');
            setEmail('');
            setPhone('');
            setLanguage('');
            setDepartment('');
            setNewDepartment('');
            setPosition('');
            setResponsibility('');
            setNewResponsibility('');
            setStatus('active');
            setPickedSupplierId(initialSupplierId ?? '');
        }
        setStep(1);
        setSupplierDropdownOpen(false);
        setSupplierSearch('');
        setSupplierError(false);
    }, [open, editing, initialSupplierId]);

    const selectedSupplier = supplierOptions.find((s) => s.id === pickedSupplierId);
    const filteredSuppliers = supplierOptions.filter((s) => {
        if (!supplierSearch.trim()) return true;
        const q = supplierSearch.toLowerCase();
        return (
            s.name.toLowerCase().includes(q) ||
            (s.supplierNumber && s.supplierNumber.toLowerCase().includes(q))
        );
    });

    const finalDepartment = department === '__new__' ? newDepartment : department;
    const finalResponsibility = responsibility === '__new__' ? newResponsibility : responsibility;
    const effectiveSupplierId = showSupplierPicker ? pickedSupplierId : initialSupplierId;

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) {
            toast.error('Business email is required');
            return;
        }
        if (!effectiveSupplierId) {
            setSupplierError(true);
            toast.error('Supplier is required');
            return;
        }
        setSupplierError(false);
        setStep(2);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!effectiveSupplierId) {
            setSupplierError(true);
            toast.error('Supplier is required');
            return;
        }
        setSaving(true);
        try {
            const fullName = `${firstName.trim()} ${lastName.trim()}`.trim() || firstName.trim() || lastName.trim() || email.trim();
            const payload = {
                name: fullName,
                email: email.trim(),
                phone: phone.trim() || null,
                supplierId: effectiveSupplierId || null,
                language: language || null,
                department: finalDepartment || null,
                position: position.trim() || null,
                responsibility: finalResponsibility || null,
                status,
            };
            const result = editing
                ? await updateContact({ id: editing.id, ...payload })
                : await createContact(payload);
            if (result.success) {
                toast.success(editing ? 'Contact updated' : 'Contact added');
                onSuccess?.();
            } else {
                toast.error(result.error);
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg p-6 rounded-2xl shadow-2xl bg-white border border-slate-200">
                <DialogHeader className="space-y-1">
                    <DialogTitle className="text-base font-bold tracking-tight text-slate-900">
                        {editing ? 'Edit Contact' : `(${step}/2) Add Contact`}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500 font-normal">
                        {step === 1
                            ? "Enter the Contact's information."
                            : 'Enter department, position, and role responsibilities.'}
                    </DialogDescription>
                </DialogHeader>

                {step === 1 ? (
                    /* Step 1 Form matching screenshot */
                    <form onSubmit={handleNext} className="space-y-4 pt-1">
                        {/* First name & Last name */}
                        <div className="grid grid-cols-2 gap-3.5">
                            <div className="space-y-1.5">
                                <Label className="text-[13px] font-medium text-slate-700">First name</Label>
                                <Input
                                    type="text"
                                    placeholder="Enter first name"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="h-10 text-[13px] rounded-lg border-slate-200 focus-visible:ring-1 focus-visible:ring-slate-400 placeholder:text-slate-400"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[13px] font-medium text-slate-700">Last name</Label>
                                <Input
                                    type="text"
                                    placeholder="Enter last name"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="h-10 text-[13px] rounded-lg border-slate-200 focus-visible:ring-1 focus-visible:ring-slate-400 placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        {/* Email * */}
                        <div className="space-y-1.5">
                            <Label className="text-[13px] font-medium text-slate-700">
                                Email <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                type="email"
                                required
                                placeholder="Enter business email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-10 text-[13px] rounded-lg border-slate-200 focus-visible:ring-1 focus-visible:ring-slate-400 placeholder:text-slate-400"
                            />
                        </div>

                        {/* Phone number */}
                        <div className="space-y-1.5">
                            <Label className="text-[13px] font-medium text-slate-700">Phone number</Label>
                            <Input
                                type="tel"
                                placeholder="Add phone numbers"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="h-10 text-[13px] rounded-lg border-slate-200 focus-visible:ring-1 focus-visible:ring-slate-400 placeholder:text-slate-400"
                            />
                        </div>

                        {/* Language */}
                        <div className="space-y-1.5">
                            <Label className="text-[13px] font-medium text-slate-700">
                                Language
                            </Label>
                            <div className="relative">
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 pr-14 text-[13px] text-slate-800 outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300 appearance-none cursor-pointer"
                                >
                                    <option value="" className="text-slate-400">Select language</option>
                                    {DEFAULT_LANGUAGE_OPTIONS.map((l) => (
                                        <option key={l} value={l}>{l}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-slate-400">
                                    <Info className="h-4 w-4 stroke-[1.5]" />
                                    <ChevronDown className="h-4 w-4 stroke-[1.5]" />
                                </div>
                            </div>
                        </div>

                        {/* Supplier * (Custom searchable selector matching screenshot) */}
                        <div className="space-y-1.5">
                            <Label className="text-[13px] font-medium text-slate-700">
                                Supplier <span className="text-red-500">*</span>
                            </Label>
                            {supplierLocked ? (
                                <Input
                                    value={initialSupplierName ?? ''}
                                    disabled
                                    className="h-10 text-[13px] bg-slate-50 border-slate-200"
                                />
                            ) : (
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setSupplierDropdownOpen((prev) => !prev)}
                                        className={cn(
                                            "flex items-center justify-between w-full h-10 px-3 text-[13px] bg-white rounded-lg border text-left transition-all",
                                            supplierError && !effectiveSupplierId
                                                ? "border-red-500 ring-2 ring-red-100 text-slate-900"
                                                : supplierDropdownOpen
                                                ? "border-orange-500 ring-2 ring-orange-100 text-slate-900"
                                                : "border-slate-200 hover:border-slate-300 text-slate-700"
                                        )}
                                    >
                                        <div className="flex items-center gap-2 truncate">
                                            {selectedSupplier ? (
                                                <>
                                                    <Building2 className="h-4 w-4 text-blue-600 shrink-0" />
                                                    {selectedSupplier.supplierNumber && (
                                                        <span className="text-slate-500">
                                                             {selectedSupplier.supplierNumber}
                                                        </span>
                                                    )}
                                                    <span className="truncate text-slate-900 font-semibold">{selectedSupplier.name}</span>
                                                </>
                                            ) : (
                                                <span className="text-slate-400">Search for Supplier ID or name</span>
                                            )}
                                        </div>
                                        <ChevronDown className="h-4 w-4 text-slate-400 shrink-0 ml-1 stroke-[1.5]" />
                                    </button>

                                    {/* Dropdown list of suppliers */}
                                    {supplierDropdownOpen && (
                                        <div className="absolute top-[44px] left-0 z-50 w-full rounded-xl border border-slate-200 bg-white p-2 shadow-xl space-y-2">
                                            <div className="relative flex items-center px-1">
                                                <Search className="h-4 w-4 text-slate-400 shrink-0 mr-2" />
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    placeholder="Search for Supplier ID or name"
                                                    value={supplierSearch}
                                                    onChange={(e) => setSupplierSearch(e.target.value)}
                                                    className="w-full h-8 text-[13px] bg-transparent border-0 outline-none text-slate-800 placeholder:text-slate-400"
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </div>

                                            <div className="border-t border-slate-100 max-h-56 overflow-y-auto space-y-0.5 pt-1.5">
                                                {filteredSuppliers.length === 0 ? (
                                                    <div className="py-4 text-center text-xs text-slate-400">No suppliers found</div>
                                                ) : (
                                                    filteredSuppliers.map((s) => {
                                                        const isSelected = pickedSupplierId === s.id;
                                                        return (
                                                            <button
                                                                key={s.id}
                                                                type="button"
                                                                onClick={() => {
                                                                    setPickedSupplierId(s.id);
                                                                    setSupplierError(false);
                                                                    setSupplierDropdownOpen(false);
                                                                    setSupplierSearch('');
                                                                }}
                                                                className={cn(
                                                                    "flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-[13px] text-left transition-colors",
                                                                    isSelected ? "bg-slate-100/80 text-slate-900" : "hover:bg-slate-50 text-slate-700"
                                                                )}
                                                            >
                                                                <Building2 className="h-4 w-4 text-blue-600 shrink-0" />
                                                                {s.supplierNumber && (
                                                                    <span className="text-slate-500">{s.supplierNumber}</span>
                                                                )}
                                                                <span className="truncate text-slate-900 font-semibold">{s.name}</span>
                                                                {isSelected && (
                                                                    <Check className="h-4 w-4 text-emerald-600 ml-auto shrink-0" />
                                                                )}
                                                            </button>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            {supplierError && !effectiveSupplierId && (
                                <p className="text-[11px] text-red-500 font-medium">Supplier is required</p>
                            )}
                        </div>

                        <DialogFooter className="pt-4 gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} className="h-9 px-4 text-xs font-medium text-slate-700">
                                Cancel
                            </Button>
                            <Button type="submit" size="sm" className="h-9 px-5 text-xs font-semibold bg-black text-white hover:bg-neutral-800">
                                Next
                            </Button>
                        </DialogFooter>
                    </form>
                ) : (
                    /* Step 2 Form: Department, Position, Responsibility, Status */
                    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                        {/* Department */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                                <span>Department</span>
                                <Info className="h-3.5 w-3.5 text-slate-400" />
                            </Label>
                            <select
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
                            >
                                <option value="">(none)</option>
                                {DEFAULT_DEPARTMENT_OPTIONS.map((d) => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                                <option value="__new__">+ Create new department...</option>
                            </select>
                            {department === '__new__' && (
                                <Input
                                    placeholder="Enter department name"
                                    value={newDepartment}
                                    onChange={(e) => setNewDepartment(e.target.value)}
                                    className="h-8 text-xs mt-1"
                                />
                            )}
                        </div>

                        {/* Position */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                                <span>Position</span>
                                <Info className="h-3.5 w-3.5 text-slate-400" />
                            </Label>
                            <Input
                                placeholder="e.g. Chief Executive Officer, Manager"
                                value={position}
                                onChange={(e) => setPosition(e.target.value)}
                                className="h-9 text-xs rounded-md border-slate-200 focus:border-slate-400 placeholder:text-slate-400"
                            />
                        </div>

                        {/* Responsibility */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                                <span>Responsibility</span>
                                <Info className="h-3.5 w-3.5 text-slate-400" />
                            </Label>
                            <select
                                value={responsibility}
                                onChange={(e) => setResponsibility(e.target.value)}
                                className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
                            >
                                <option value="">(none)</option>
                                <option value="Price Inquiries for Articles">Price Inquiries for Articles</option>
                                <option value="Automated Documentation">Automated Documentation</option>
                                <option value="Quality Issues">Quality Issues</option>
                                <option value="Logistics / Delivery">Logistics / Delivery</option>
                                <option value="Contracts & Legal">Contracts & Legal</option>
                                <option value="Compliance Queries">Compliance Queries</option>
                                <option value="Information Requests">Information Requests</option>
                                <option value="__new__">+ Create new responsibility...</option>
                            </select>
                            {responsibility === '__new__' && (
                                <Input
                                    placeholder="Enter responsibility tag"
                                    value={newResponsibility}
                                    onChange={(e) => setNewResponsibility(e.target.value)}
                                    className="h-8 text-xs mt-1"
                                />
                            )}
                        </div>

                        {/* Status */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-slate-700">Status</Label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as ContactStatus)}
                                className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
                            >
                                <option value="active">● Active</option>
                                <option value="inactive">● Deactivated</option>
                                <option value="on_hold">● Archived</option>
                            </select>
                        </div>

                        <DialogFooter className="pt-3 gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setStep(1)}
                                className="h-8 text-xs gap-1"
                            >
                                <ChevronLeft className="h-3.5 w-3.5" /> Back
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={saving}
                                className="h-8 text-xs font-semibold bg-black text-white hover:bg-neutral-800"
                            >
                                {saving ? 'Saving...' : editing ? 'Save changes' : 'Add Contact'}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
