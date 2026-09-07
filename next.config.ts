import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// NOTE: Strict-Transport-Security + upgrade-insecure-requests are intentionally NOT set here.
// They are applied at request time by src/middleware.ts ONLY when the connection is HTTPS, so
// a plain-HTTP local/dev deployment does not break the browser with ERR_SSL_PROTOCOL_ERROR.
const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      // 'unsafe-eval' is only permitted in development (needed by Next.js HMR/React DevTools).
      // It is intentionally excluded from production to harden against XSS escalation.
      isDev ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'" : "script-src 'self' 'unsafe-inline'",
      "connect-src 'self' http: https: ws: wss: blob:",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    return [
      {
        source: "/api/runtime/version",
        destination: "/api/system/version",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
