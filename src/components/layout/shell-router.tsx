'use client';

import { usePathname } from 'next/navigation';
import type { Session } from 'next-auth';
import { AppShell } from '@/components/layout/app-shell';

/**
 * Routes that must render without the internal application shell (sidebar /
 * header). These are public, standalone surfaces such as authentication and
 * external supplier-facing pages. Keeping them out of the App Shell prevents the
 * internal navigation chrome from wrapping the sign-in panel or supplier forms.
 */
const PUBLIC_PREFIXES = [
    '/login',
    '/forgot-password',
    '/reset-password',
    '/signout',
    '/external',
    '/access-denied',
    '/portal',
];

export function ShellRouter({
    session,
    children,
}: {
    session?: Session | null;
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isPublic =
        !!pathname &&
        PUBLIC_PREFIXES.some(
            (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
        );

    return (
        <AppShell session={session} forcePublic={isPublic}>
            {children}
        </AppShell>
    );
}
