'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { SupplierHeader } from '@/components/suppliers/detail/supplier-header';
import Link from 'next/link';

const ContactsTable = dynamic(
    () => import('@/components/contacts/contacts-table').then((m) => m.ContactsTable),
    {
        ssr: false,
        loading: () => (
            <div className="space-y-3">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-96 w-full" />
            </div>
        ),
    },
);

export interface SupplierContactsClientProps {
    supplier: {
        id: string;
        supplierNumber: string;
        name: string;
        countryCode?: string | null;
        countryName?: string | null;
        city?: string | null;
        website?: string | null;
    };
    notFound?: boolean;
}

export default function SupplierContactsClient({ supplier, notFound }: SupplierContactsClientProps) {
    if (notFound) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 p-8 text-center">
                <p className="text-lg font-semibold text-slate-700">Supplier not found</p>
                <Link href="/suppliers" className="text-emerald-600 hover:underline">Back to suppliers</Link>
            </div>
        );
    }
    return (
        <div className="flex min-h-screen flex-col bg-slate-50">
            <SupplierHeader
                supplier={supplier}
                section="contacts"
                supplierNumber={supplier.supplierNumber}
                sidebarCollapsed={false}
                onToggleSidebar={() => {}}
            />
            <main className="flex-1 px-6 py-6">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <ContactsTable
                        supplierId={supplier.id}
                        supplierName={supplier.name}
                        supplierNumber={supplier.supplierNumber}
                        showSupplierColumn={false}
                    />
                </div>
            </main>
        </div>
    );
}
