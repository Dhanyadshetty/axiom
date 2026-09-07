import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { validateMagicToken } from "@/lib/services/magic-tokens";

function getBrowserOrigin(req: NextRequest): URL {
    const configuredOrigin = process.env.APP_BASE_URL || process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL;
    const origin = new URL(configuredOrigin || req.nextUrl.origin);
    if (origin.hostname === "0.0.0.0" || origin.hostname === "::") {
        origin.hostname = "localhost";
    }
    return origin;
}

// Route Handler counterpart to the in-page magic-token bootstrap. Server
// Components cannot mutate cookies (Next.js throws
// "Cookies can only be modified in a Server Action or Route Handler"), so
// when the form URL is opened with `?magictoken=...` we 302 through this
// endpoint instead of doing the cookie set + redirect from the page render.
//
// After validating the token we set the external_session cookie and redirect
// back to the original form URL with the token stripped.
//
// NOTE: The form page (app/external/.../form/page.tsx) redirects here when
// a magic token is present on the form URL. This handler validates the token,
// sets the external_session cookie, and 302s back to the form URL with the
// token stripped. The whole body is wrapped in a try/catch that ALWAYS
// returns a 302 — never a 5xx — so the surrounding Server Component render
// can never surface a Server Components render error from this hop.
export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const token = url.searchParams.get("magictoken");
        const redirectTo = url.searchParams.get("redirect") ?? "/";
        const browserOrigin = getBrowserOrigin(req);

        if (!token) {
            return NextResponse.redirect(new URL(redirectTo, browserOrigin));
        }

        const validation = await validateMagicToken(token);
        if (!validation.valid) {
            // Token invalid: send the supplier back to the request page without
            // setting a session cookie. The page will render the not-found state.
            return NextResponse.redirect(new URL(redirectTo, browserOrigin));
        }

        const sessionToken = randomBytes(32).toString("hex");
        const response = NextResponse.redirect(new URL(redirectTo, browserOrigin));
        response.cookies.set("external_session", sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 24 * 60 * 60,
            path: "/",
        });
        return response;
    } catch (error) {
        console.error("[magic-bootstrap] unexpected error:", error);
        // Never propagate a 500 here — fall back to the supplied redirect so
        // the supplier lands on the form page (which can render its own
        // not-found state) instead of seeing the generic Next.js error overlay.
        const url = new URL(req.url);
        const fallback = url.searchParams.get("redirect") ?? "/";
        return NextResponse.redirect(new URL(fallback, getBrowserOrigin(req)));
    }
}