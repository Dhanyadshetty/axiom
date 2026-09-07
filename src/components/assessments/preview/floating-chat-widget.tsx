"use client";

import * as React from "react";
import {
    MessageSquare,
    X,
    ChevronDown,
    Home,
    Sparkles,
    Send,
} from "lucide-react";

/**
 * Bottom-left floating support chat widget shown over the preview modal.
 * Clicking the FAB expands a small chat panel.
 */
export function FloatingChatWidget() {
    const [open, setOpen] = React.useState(false);

    return (
        <div className="fixed bottom-5 left-5 z-[70]">
            {open ? (
                <div className="mb-3 w-[340px] animate-in fade-in-0 zoom-in-95 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                    <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
                        <Sparkles className="h-4 w-4 text-violet-500" />
                        <div className="flex -space-x-2">
                            {["VT", "AK", "JS"].map((a) => (
                                <span
                                    key={a}
                                    className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-700 text-[10px] font-semibold text-white"
                                >
                                    {a}
                                </span>
                            ))}
                        </div>
                        <button
                            onClick={() => setOpen(false)}
                            className="ml-auto rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            aria-label="Close chat"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="px-4 py-5">
                        <p className="text-lg font-bold text-slate-900">Hi Vinay 👋</p>
                        <p className="text-sm text-slate-500">How can we help?</p>
                    </div>

                    <div className="flex items-center gap-2 border-t border-slate-100 px-4 py-3">
                        <input
                            className="h-10 flex-1 rounded-full border border-slate-200 px-4 text-sm outline-none focus:border-emerald-400"
                            placeholder="Start a conversation"
                        />
                        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white">
                            <Send className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="flex items-center justify-around border-t border-slate-100 py-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Home className="h-4 w-4" /> Home</span>
                        <span className="flex items-center gap-1 font-semibold text-slate-700"><MessageSquare className="h-4 w-4" /> Messages</span>
                        <span className="flex items-center gap-1"><MessageSquare className="h-4 w-4" /> Help</span>
                    </div>
                </div>
            ) : null}

            <button
                onClick={() => setOpen((v) => !v)}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-2xl transition-transform hover:scale-105"
                aria-label="Open support chat"
            >
                <MessageSquare className="h-6 w-6" />
            </button>
        </div>
    );
}

/** Small downward chevron used by the language selector. */
export function LangChevron() {
    return <ChevronDown className="h-3.5 w-3.5 opacity-70" />;
}
