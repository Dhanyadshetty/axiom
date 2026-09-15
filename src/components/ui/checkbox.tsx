"use client";

import * as React from "react";

export interface CheckboxProps {
    checked?: boolean | "indeterminate";
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
    className?: string;
    "aria-label"?: string;
    id?: string;
}

export const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(function Checkbox(
    { checked = false, onCheckedChange, disabled, className, ...props },
    ref,
) {
    const isChecked = checked === true;
    const isIndeterminate = checked === "indeterminate";

    return (
        <button
            ref={ref}
            type="button"
            role="checkbox"
            aria-checked={isIndeterminate ? "mixed" : isChecked}
            disabled={disabled}
            onClick={(e) => {
                e.stopPropagation();
                if (!disabled) onCheckedChange?.(!isChecked);
            }}
            className={`relative inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors cursor-pointer select-none focus:outline-none focus:ring-1 focus:ring-slate-400 ${
                isChecked || isIndeterminate
                    ? "border-slate-900 bg-slate-900 text-white shadow-2xs"
                    : "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50"
            } ${disabled ? "cursor-not-allowed opacity-50" : ""} ${className ?? ""}`}
            {...(props as any)}
        >
            {isChecked ? (
                <svg
                    viewBox="0 0 24 24"
                    className="pointer-events-none h-3 w-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                >
                    <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ) : isIndeterminate ? (
                <span className="pointer-events-none h-0.5 w-2 rounded-full bg-white" />
            ) : null}
        </button>
    );
});
