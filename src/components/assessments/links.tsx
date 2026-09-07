import Link from "next/link";
import * as React from "react";

export function SupplierNameLink({ id, name, className, onClick }: { id: string; name: string | null | undefined; className?: string; onClick?: React.MouseEventHandler<HTMLAnchorElement> }) {
    const handleClick: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
        // Prevent any enclosing row-level click handlers (e.g. selection toggle)
        // from firing when the user clicks the supplier name link.
        e.stopPropagation();
        onClick?.(e);
    };
    return (
        <Link
            href={`/suppliers/${id}/overview`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
            className={`text-blue-600 hover:underline ${className ?? ""}`}
        >
            {name ?? "Unknown supplier"}
        </Link>
    );
}

export function MailLink({ email, className }: { email: string; className?: string }) {
    if (!email) return <span className="text-slate-400">—</span>;
    return (
        <a href={`mailto:${email}`} className={`text-blue-600 hover:underline ${className ?? ""}`}>
            {email}
        </a>
    );
}
