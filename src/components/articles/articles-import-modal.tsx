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
            <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto p-6 rounded-2xl bg-white shadow-xl border border-slate-200">
                <DialogHeader className="pb-2 border-b border-slate-100 text-left">
                    <DialogTitle className="text-lg font-bold text-slate-900">
                        Import Articles
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500 font-normal">
                        Upload an Excel (.xlsx) or CSV file with article records.
                    </DialogDescription>
                </DialogHeader>
                <div className="pt-2">
                    <ArticlesImportWizard
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
