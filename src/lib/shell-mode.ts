import type { Session } from 'next-auth';

export type ShellMode = 'authenticated' | 'public';

/**
 * Decide whether the full authenticated shell (sidebar + header) should render.
 *
 * The decision is driven by the *client* session (via useSession), not the
 * server-rendered session prop, so it stays correct across soft client-side
 * navigations (e.g. login -> dashboard) where the root layout server component
 * is not re-executed.
 *
 * - `authenticated`: always render the full shell.
 * - `loading` + a server session was present: this is an authenticated route
 *   whose client session is still resolving — render the full shell (the
 *   Sidebar/Header show their own skeletons) instead of nothing.
 * - otherwise (unauthenticated, or still loading on a public route with no
 *   server session): render the bare shell so the login screen never flashes a
 *   sidebar skeleton.
 */
export function resolveShellMode(
    status: 'loading' | 'authenticated' | 'unauthenticated',
    serverSession: Session | null | undefined,
): ShellMode {
    if (status === 'authenticated') return 'authenticated';
    if (status === 'loading' && serverSession) return 'authenticated';
    return 'public';
}
