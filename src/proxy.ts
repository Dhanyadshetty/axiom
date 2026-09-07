import { auth } from "./auth";

// Next.js 16 "proxy" file — the successor to the `middleware` convention.
// Reuse the real `auth` instance (created in `auth.ts` with the full provider
// set) and let Next invoke it as middleware. The authorization logic (redirects
// for unauthenticated users, role-based access) lives in the `authorized`
// callback in `auth.config.ts`.
//
// The external supplier self-assessment flow authenticates via magic-link
// session cookies (see `/api/external/login`), NOT via NextAuth, so every
// `/external/**` page and `/api/external/**` API route is excluded from this
// proxy below.
export default auth;

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, manifest.json (static assets)
     * - external/ (public supplier assessment pages)
     * - api/external (public supplier magic-link + assessment APIs)
     * - login, portal/register (public auth pages)
     * - onboarding (public onboarding page)
     */
    "/((?!api/auth|api/external|_next/static|_next/image|favicon.ico|manifest.json|external|login|portal/register|onboarding).*)",
  ],
};
