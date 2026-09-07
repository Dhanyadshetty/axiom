'use client';

import { useSession } from 'next-auth/react';
import type { Session } from 'next-auth';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { CommandPalette } from '@/components/layout/command-palette';
import { InactivityTracker } from '@/components/shared/inactivity-tracker';
import { resolveShellMode } from '@/lib/shell-mode';

export function AppShell({
    session,
    forcePublic = false,
    children,
}: {
    session?: Session | null;
    forcePublic?: boolean;
    children: React.ReactNode;
}) {
    const { status } = useSession();
    const mode = forcePublic ? 'public' : resolveShellMode(status, session);

    if (mode === 'public') {
        return (
            <div className="flex h-[100dvh] w-full min-w-0 flex-1 flex-col overflow-hidden">
                <main className="flex-1 overflow-auto">{children}</main>
            </div>
        );
    }

    return <AuthenticatedShell>{children}</AuthenticatedShell>;
}

function AuthenticatedShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-[100dvh] w-full overflow-hidden">
            <Sidebar className="hidden h-[100dvh] shrink-0 self-stretch lg:flex" />
            <div className="flex h-[100dvh] min-w-0 flex-1 flex-col overflow-hidden">
                <Header />
                <main className="min-h-0 flex-1 overflow-auto">{children}</main>
                <CommandPalette />
            </div>
            <InactivityTracker />
        </div>
    );
}
