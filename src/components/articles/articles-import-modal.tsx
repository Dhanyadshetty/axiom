'use client';

import * as React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { ArticlesImportWizard } from '@/components/articles/articles-import-wizard';

export interface ArticlesImportModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function ArticlesImportModal({
    open,
    onOpenChange,
    onSuccess,
}: ArticlesImportModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto p-6 md:p-8 rounded-2xl bg-white shadow-2xl border border-slate-200">
                <DialogHeader className="sr-only">
                    <DialogTitle>Import Articles</DialogTitle>
                    <DialogDescription>
                        Upload an Excel (.xlsx) or CSV file with article records.
                    </DialogDescription>
                </DialogHeader>
                <div>
                    {open && (
                        <ArticlesImportWizard
                            onSuccess={() => {
                                onSuccess?.();
                                onOpenChange(false);
                            }}
                            onCancel={() => onOpenChange(false)}
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
