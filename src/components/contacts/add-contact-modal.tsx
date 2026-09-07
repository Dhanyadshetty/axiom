'use client';

import * as React from 'react';
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
    supplierName,
    supplierLocked = false,
    showSupplierPicker = false,
    editing = null,
    onSuccess,
}: AddContactModalProps) {
    const [pickedSupplierId, setPickedSupplierId] = React.useState<string>(initialSupplierId ?? '');
    const [supplierOptions, setSupplierOptions] = React.useState<Array<{ id: string; name: string; supplierNumber: string | null }>>([]);
    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [phone, setPhone] = React.useState('');
    const [language, setLanguage] = React.useState('');
    const [department, setDepartment] = React.useState('');
    const [newDepartment, setNewDepartment] = React.useState('');
    const [position, setPosition] = React.useState('');
    const [responsibility, setResponsibility] = React.useState('');
    const [newResponsibility, setNewResponsibility] = React.useState('');
    const [status, setStatus] = React.useState<ContactStatus>('active');
    const [saving, setSaving] = React.useState(false);

    React.useEffect(() => {
        if (open && showSupplierPicker && supplierOptions.length === 0) {
            listSuppliersLite().then(setSupplierOptions).catch(() => {});
        }
    }, [open, showSupplierPicker, supplierOptions.length]);

    React.useEffect(() => {
        if (!open) return;
        setName(editing?.name ?? '');
        setEmail(editing?.email ?? '');
        setPhone(editing?.phone ?? '');
        setLanguage(editing?.language ?? '');
        setDepartment(editing?.department ?? '');
        setNewDepartment('');
        setPosition(editing?.position ?? '');
        setResponsibility(editing?.responsibility ?? '');
        setNewResponsibility('');
        setStatus(editing?.status ?? 'active');
        setPickedSupplierId(initialSupplierId ?? '');
    }, [open, editing, initialSupplierId]);

    const finalDepartment = department === '__new__' ? newDepartment : department;
    const finalResponsibility = responsibility === '__new__' ? newResponsibility : responsibility;
    const effectiveSupplierId = showSupplierPicker ? pickedSupplierId : initialSupplierId;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                name: name.trim(),
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
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{editing ? 'Edit Contact' : 'Add Contact'}</DialogTitle>
                    <DialogDescription>
                        {editing ? 'Update the contact details below.' : supplierName ? `Adding a new contact to ${supplierName}.` : 'Manually create a contact record.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold">Name *</Label>
                            <Input value={name} onChange={(e) => setName(e.target.value)} required className="h-9" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold">Email *</Label>
                            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-9" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold">Phone number</Label>
                            <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="h-9" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold">Supplier</Label>
                            {showSupplierPicker ? (
                                <select
                                    value={pickedSupplierId}
                                    onChange={(e) => setPickedSupplierId(e.target.value)}
                                    required
                                    className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                                >
                                    <option value="">Select supplier...</option>
                                    {supplierOptions.map((s) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            ) : (
                                <Input
                                    value={supplierName ?? ''}
                                    disabled={supplierLocked}
                                    placeholder="(none)"
                                    className="h-9 bg-slate-50"
                                />
                            )}
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold">Language</Label>
                            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="h-9 w-full rounded-md border bg-background px-3 text-sm">
                                <option value="">(none)</option>
                                {DEFAULT_LANGUAGE_OPTIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold">Department</Label>
                            <select value={department} onChange={(e) => setDepartment(e.target.value)} className="h-9 w-full rounded-md border bg-background px-3 text-sm">
                                <option value="">(none)</option>
                                {DEFAULT_DEPARTMENT_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                                <option value="__new__">+ Create new...</option>
                            </select>
                            {department === '__new__' && (
                                <Input
                                    value={newDepartment}
                                    onChange={(e) => setNewDepartment(e.target.value)}
                                    placeholder="New department value"
                                    className="h-9 mt-1"
                                />
                            )}
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold">Position</Label>
                            <Input value={position} onChange={(e) => setPosition(e.target.value)} className="h-9" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold">Responsibility</Label>
                            <select value={responsibility} onChange={(e) => setResponsibility(e.target.value)} className="h-9 w-full rounded-md border bg-background px-3 text-sm">
                                <option value="">(none)</option>
                                <option value="Price Inquiries for Articles">Price Inquiries for Articles</option>
                                <option value="Automated Documentation">Automated Documentation</option>
                                <option value="Quality Issues">Quality Issues</option>
                                <option value="Logistics / Delivery">Logistics / Delivery</option>
                                <option value="Contracts & Legal">Contracts & Legal</option>
                                <option value="__new__">+ Create new...</option>
                            </select>
                            {responsibility === '__new__' && (
                                <Input
                                    value={newResponsibility}
                                    onChange={(e) => setNewResponsibility(e.target.value)}
                                    placeholder="New responsibility value"
                                    className="h-9 mt-1"
                                />
                            )}
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold">Status</Label>
                            <select value={status} onChange={(e) => setStatus(e.target.value as ContactStatus)} className="h-9 w-full rounded-md border bg-background px-3 text-sm">
                                <option value="active">Active</option>
                                <option value="inactive">Deactivated</option>
                                <option value="on_hold">Archived</option>
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={saving}>{saving ? 'Saving...' : editing ? 'Save changes' : 'Add contact'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
