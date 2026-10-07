'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { User, Building2 } from 'lucide-react';
import { type ContactRow } from '@/app/actions/contacts-detail';
import { type ContactStatus } from '@/components/contacts/contacts-schema';
import { cn } from '@/lib/utils';

const STATUS_COLORS: Record<ContactStatus, string> = {
    active: 'bg-emerald-500',
    inactive: 'bg-slate-400',
    on_hold: 'bg-amber-500',
};

const STATUS_LABELS: Record<ContactStatus, string> = {
    active: 'Active',
    inactive: 'Deactivated',
    on_hold: 'On Hold',
};

interface ContactHoverCardProps {
    contact: ContactRow;
    children: React.ReactNode;
    className?: string;
    onEdit?: (c: ContactRow) => void;
}

export function ContactHoverCard({
    contact,
    children,
    className,
    onEdit,
}: ContactHoverCardProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [coords, setCoords] = React.useState<{ top: number; left: number }>({ top: 0, left: 0 });
    const triggerRef = React.useRef<HTMLDivElement>(null);
    const leaveTimerRef = React.useRef<NodeJS.Timeout | null>(null);
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
        return () => {
            if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
        };
    }, []);

    const updatePosition = React.useCallback(() => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        const cardWidth = 320;
        const estimatedCardHeight = 200;
        
        // Horizontal clamp within window
        const left = Math.max(16, Math.min(rect.left, window.innerWidth - cardWidth - 20));
        
        // Vertical positioning: flip above if not enough room below
        const spaceBelow = window.innerHeight - rect.bottom;
        const top = (spaceBelow < estimatedCardHeight && rect.top > estimatedCardHeight)
            ? Math.max(12, rect.top - estimatedCardHeight - 4)
            : rect.bottom + 6;

        setCoords({ top, left });
    }, []);

    const handleMouseEnter = () => {
        if (leaveTimerRef.current) {
            clearTimeout(leaveTimerRef.current);
            leaveTimerRef.current = null;
        }
        updatePosition();
        setIsOpen(true);
    };

    const handleMouseLeave = () => {
        if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
        leaveTimerRef.current = setTimeout(() => {
            setIsOpen(false);
        }, 220);
    };

    const handleCardMouseEnter = () => {
        if (leaveTimerRef.current) {
            clearTimeout(leaveTimerRef.current);
            leaveTimerRef.current = null;
        }
        setIsOpen(true);
    };

    const handleCardMouseLeave = () => {
        if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
        leaveTimerRef.current = setTimeout(() => {
            setIsOpen(false);
        }, 220);
    };

    const departments = React.useMemo(() => {
        if (!contact.department) return [];
        return contact.department.split(/[,;|]/).map((d) => d.trim()).filter(Boolean);
    }, [contact.department]);

    return (
        <>
            <div
                ref={triggerRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className={cn(
                    'group/hover-cell relative flex items-center justify-between w-full h-[32px] px-2 rounded-md border border-transparent transition-all cursor-pointer select-none',
                    'hover:border-amber-400 hover:bg-amber-50/20',
                    isOpen && 'border-amber-400 bg-amber-50/20 shadow-xs',
                    className
                )}
            >
                {children}
            </div>

            {mounted && isOpen && createPortal(
                <div
                    style={{
                        position: 'fixed',
                        top: coords.top,
                        left: coords.left,
                        zIndex: 999999,
                        pointerEvents: 'auto',
                    }}
                    onMouseEnter={handleCardMouseEnter}
                    onMouseLeave={handleCardMouseLeave}
                    className="w-[340px] p-4 rounded-xl border border-slate-200 bg-white shadow-2xl space-y-3.5 animate-in fade-in-0 zoom-in-95 duration-100 select-text"
                >
                    {/* Header */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                            <User className="h-3.5 w-3.5 stroke-[2.2]" />
                            <span className="text-slate-600 font-medium">Contact</span>
                        </div>
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit?.(contact);
                            }}
                            className="text-sm font-semibold text-slate-900 leading-snug break-all hover:text-blue-600 hover:underline cursor-pointer"
                            title={contact.name || contact.email}
                        >
                            {contact.name || contact.email}
                        </div>
                    </div>

                    {/* Key-Value Details */}
                    <div className="space-y-2 text-xs pt-1 border-t border-slate-100">
                        {/* Status */}
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-slate-500 font-normal w-24 shrink-0">Status</span>
                            <div className="flex items-center gap-1.5 font-medium text-slate-800">
                                <span className={cn('h-2 w-2 rounded-full shrink-0', STATUS_COLORS[contact.status])} />
                                <span>{STATUS_LABELS[contact.status] || contact.status}</span>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-slate-500 font-normal w-24 shrink-0">Email</span>
                            {contact.email ? (
                                <a
                                    href={`mailto:${contact.email}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="font-medium text-amber-600 hover:text-amber-700 hover:underline truncate max-w-[200px]"
                                    title={contact.email}
                                >
                                    {contact.email}
                                </a>
                            ) : (
                                <span className="text-slate-400">-</span>
                            )}
                        </div>

                        {/* Supplier */}
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-slate-500 font-normal w-24 shrink-0">Supplier</span>
                            {contact.supplierName || contact.supplierNumber ? (
                                <Link
                                    href={`/suppliers/${contact.supplierNumber || contact.supplierId}/overview`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-flex items-center gap-1.5 rounded border border-sky-200/90 bg-sky-50 px-2 py-0.5 font-normal text-sky-700 hover:bg-sky-100 transition-colors max-w-[200px] truncate"
                                    title={contact.supplierName || contact.supplierNumber || ''}
                                >
                                    <Building2 className="h-3 w-3 text-sky-600 shrink-0" />
                                    <span className="truncate">{contact.supplierName || contact.supplierNumber}</span>
                                </Link>
                            ) : (
                                <span className="text-slate-400">-</span>
                            )}
                        </div>

                        {/* Departments */}
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-slate-500 font-normal w-24 shrink-0">Departments</span>
                            {departments.length > 0 ? (
                                <div className="flex flex-wrap items-center justify-end gap-1 max-w-[200px]">
                                    {departments.map((dept, i) => (
                                        <span
                                            key={i}
                                            className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100/90 px-2 py-0.5 text-xs font-medium text-slate-700 truncate"
                                            title={dept}
                                        >
                                            {dept}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <span className="text-slate-400">-</span>
                            )}
                        </div>

                        {/* Phone (if available) */}
                        {contact.phone && (
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-slate-500 font-normal w-24 shrink-0">Phone</span>
                                <span className="text-slate-700 font-normal truncate max-w-[200px]" title={contact.phone}>
                                    {contact.phone}
                                </span>
                            </div>
                        )}

                        {/* Position (if available) */}
                        {contact.position && (
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-slate-500 font-normal w-24 shrink-0">Position</span>
                                <span className="text-slate-700 font-normal truncate max-w-[200px]" title={contact.position}>
                                    {contact.position}
                                </span>
                            </div>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
