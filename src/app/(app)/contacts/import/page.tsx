'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { ContactsImportWizard } from '@/components/contacts/contacts-import-wizard';

export default function ContactsImportPage() {
    const router = useRouter();

    return (
        <div className="flex min-h-[calc(100vh-3.5rem)] flex-col bg-slate-50/60 p-4 lg:p-8">
            <div className="mx-auto w-full max-w-6xl space-y-6">
                {/* Page Breadcrumbs */}
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <Link href="/contacts" className="hover:text-slate-900 transition-colors">
                        Contacts
                    </Link>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-slate-900 font-semibold">Contact Import</span>
                </div>

                {/* Import Wizard Card Container */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:p-8 shadow-sm">
                    <ContactsImportWizard
                        onSuccess={() => {
                            router.push('/contacts');
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
