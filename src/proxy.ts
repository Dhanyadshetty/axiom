import { auth } from "./auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  // Bypass static assets, icons, uploads, health probes, and API webhooks
  if (
    pathname.startsWith("/icons") ||
    pathname.startsWith("/uploads") ||
    pathname.startsWith("/api/health") ||
    pathname.startsWith("/api/cron") ||
    pathname.startsWith("/api/external") ||
    pathname === "/favicon.ico" ||
    pathname === "/manifest.json" ||
    pathname === "/pma-logo.svg" ||
    /\.(png|jpg|jpeg|svg|ico|json|css|js|woff|woff2|ttf|eot|webp)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  const isLoggedIn = !!req.auth?.user;
  const isOnLoginPage = pathname.startsWith("/login");
  const isOnRegisterPage = pathname === "/portal/register";
  const isOnExternalPage = pathname.startsWith("/external/");

  if (isOnRegisterPage || isOnExternalPage || pathname === "/api/health") {
    return NextResponse.next();
  }

  if (isOnLoginPage) {
    if (isLoggedIn) {
      const callbackUrl = nextUrl.searchParams.get("callbackUrl");
      const isValidCallback =
        callbackUrl &&
        callbackUrl.startsWith("/") &&
        !callbackUrl.startsWith("/login") &&
        !callbackUrl.startsWith("/icons") &&
        !/\.(png|jpg|jpeg|svg|ico|json|css|js)$/i.test(callbackUrl);

      if (isValidCallback) {
        return NextResponse.redirect(new URL(callbackUrl, nextUrl));
      }
      return NextResponse.redirect(new URL("/", nextUrl));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    const callbackUrl = pathname + nextUrl.search;
    const loginUrl = new URL("/login", nextUrl);
    const isStaticOrAuth =
      callbackUrl === "/" ||
      callbackUrl.startsWith("/login") ||
      callbackUrl.startsWith("/icons") ||
      /\.(png|jpg|jpeg|svg|ico|json|css|js)$/i.test(pathname);

    if (!isStaticOrAuth) {
      loginUrl.searchParams.set("callbackUrl", callbackUrl);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
