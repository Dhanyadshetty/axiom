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

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
    { checked = false, onCheckedChange, disabled, className, ...props },
    ref,
) {
    const isChecked = checked === true;
    const isIndeterminate = checked === "indeterminate";

    return (
        <span className={`relative inline-flex h-4 w-4 items-center justify-center ${className ?? ""}`}>
            <input
                ref={ref}
                type="checkbox"
                checked={isChecked}
                disabled={disabled}
                onChange={(event) => onCheckedChange?.(event.target.checked)}
                className="peer h-4 w-4 cursor-pointer appearance-none rounded-[5px] border border-slate-300 bg-white transition-colors checked:border-primary checked:bg-primary hover:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                {...props}
            />
            {isChecked ? (
                <svg
                    viewBox="0 0 24 24"
                    className="pointer-events-none absolute h-3 w-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                >
                    <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ) : isIndeterminate ? (
                <span className="pointer-events-none absolute h-0.5 w-2 rounded bg-primary" />
            ) : null}
        </span>
    );
});
