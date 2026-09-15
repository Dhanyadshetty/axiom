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
            <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto p-6">
                <DialogHeader className="pb-2 border-b border-slate-100">
                    <DialogTitle>Import Contacts</DialogTitle>
                    <DialogDescription>
                        Upload an Excel (.xlsx) or CSV file with contact records.
                    </DialogDescription>
                </DialogHeader>
                <div className="pt-2">
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
