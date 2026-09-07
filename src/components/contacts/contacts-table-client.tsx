'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const ContactsTable = dynamic(
    () => import('@/components/contacts/contacts-table').then((m) => m.ContactsTable),
    { ssr: false, loading: () => <Skeleton className="h-96 w-full" /> },
);

export interface ContactsTableClientProps {
    supplierId?: string;
    supplierName?: string;
    supplierNumber?: string;
    showSupplierColumn?: boolean;
    scopeAll?: boolean;
}

export default function ContactsTableClient(props: ContactsTableClientProps) {
    return <ContactsTable {...props} />;
}
