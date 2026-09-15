'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const ArticlesTable = dynamic(
    () => import('@/components/articles/articles-table').then((m) => m.ArticlesTable),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-full flex-col space-y-4 p-4 lg:p-6 bg-white">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-7 w-32" />
                    <div className="flex gap-2">
                        <Skeleton className="h-9 w-48" />
                        <Skeleton className="h-9 w-28" />
                        <Skeleton className="h-9 w-28" />
                    </div>
                </div>
                <Skeleton className="h-[520px] w-full rounded-lg" />
            </div>
        ),
    },
);

export default function ArticlesPage() {
    return (
        <div className="flex h-[calc(100vh-3.5rem)] min-h-0 flex-col overflow-hidden bg-white">
            <ArticlesTable />
        </div>
    );
}
