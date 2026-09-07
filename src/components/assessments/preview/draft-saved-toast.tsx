"use client";

import * as React from "react";
import { CheckCircle2, X } from "lucide-react";

/**
 * Bottom-left toast shown when a request is saved as draft.
 * Auto-dismisses after a few seconds but can be closed manually.
 */
export function DraftSavedToast({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    React.useEffect(() => {
        if (!open) return;
        const t = window.setTimeout(onClose, 3800);
        return () => window.clearTimeout(t);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed bottom-5 left-5 z-[80] animate-in fade-in-0 slide-in-from-bottom-3 duration-200">
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-xl">
                <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-emerald-500 text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                </span>
                <p className="text-sm font-medium text-slate-800">
                    The Request was saved as draft.
                </p>
                <button
                    onClick={onClose}
                    className="ml-2 rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                    aria-label="Dismiss"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
