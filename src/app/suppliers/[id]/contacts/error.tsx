'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function SupplierContactsError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Supplier contacts page error:', error);
    }, [error]);
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 p-8 text-center">
            <h2 className="text-xl font-semibold text-slate-800">Something went wrong loading this page</h2>
            <p className="max-w-md text-sm text-slate-600">
                {error.message || 'An unexpected error occurred while rendering the contacts tab.'}
            </p>
            {error.digest ? (
                <p className="font-mono text-xs text-slate-400">Error ID: {error.digest}</p>
            ) : null}
            <div className="flex gap-2">
                <Button onClick={reset}>Try again</Button>
                <Button variant="outline" onClick={() => (window.location.href = '/suppliers')}>
                    Back to suppliers
                </Button>
            </div>
        </div>
    );
}
