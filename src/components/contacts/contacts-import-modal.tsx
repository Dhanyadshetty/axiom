'use client';

import * as React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { ContactsImportWizard } from '@/components/contacts/contacts-import-wizard';

export interface ContactsImportModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    supplierId?: string;
    onSuccess?: () => void;
}

export function ContactsImportModal({
    open,
    onOpenChange,
    supplierId,
    onSuccess,
}: ContactsImportModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto p-6 md:p-8 rounded-2xl bg-white shadow-2xl border border-slate-200">
                <DialogHeader className="sr-only">
                    <DialogTitle>Import Contacts</DialogTitle>
                    <DialogDescription>
                        Upload an Excel (.xlsx) or CSV file with contact records.
                    </DialogDescription>
                </DialogHeader>
                <div>
                    <ContactsImportWizard
                        embeddedSupplierId={supplierId}
                        onSuccess={() => {
                            onSuccess?.();
                            onOpenChange(false);
                        }}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
