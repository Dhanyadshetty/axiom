import type { Metadata, Viewport } from "next";
import { Geist_Mono } from "next/font/google";
import type { Session } from "next-auth";

import { auth } from "@/auth";
import { ShellRouter } from "@/components/layout/shell-router";
import { CurrencyProvider } from "@/components/currency-provider";
import { PageTransition } from "@/components/shared/page-transition";
import { SessionProvider } from "@/components/shared/session-provider";
import { VersionShield } from "@/components/shared/version-shield";
import { ThemeProvider } from "@/components/theme-provider";
import { getRuntimeVersionSnapshot } from "@/lib/build-info";
import { Toaster } from "sonner";
import { getPlatformSettingsForLayout } from "@/app/actions/settings";
import { cookies } from "next/headers";
import { LanguageProvider } from "@/components/i18n/language-provider";
import { LANGUAGE_COOKIE, normalizeLanguage } from "@/lib/i18n";

import "./globals.css";

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
});

export const metadata: Metadata = {
  title: "Axiom Platform",
  description: "Advanced procurement intelligence platform.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#10634a",
};

export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let session: Session | null = null;
  let settings: Awaited<ReturnType<typeof getPlatformSettingsForLayout>> | null = null;
  const runtimeVersion = getRuntimeVersionSnapshot();
  let initialLanguage: ReturnType<typeof normalizeLanguage> = "en";

  try {
    session = await auth();
  } catch (error) {
    console.error("Root layout: auth() failed, continuing without a session", error);
  }

  try {
    settings = await getPlatformSettingsForLayout();
  } catch (error) {
    console.error("Root layout: failed to load platform settings", error);
  }

  try {
    const cookieStore = await cookies();
    initialLanguage = normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE)?.value);
  } catch (error) {
    console.error("Root layout: failed to read language cookie", error);
  }

return (
    <html lang={initialLanguage} suppressHydrationWarning>
      <body
        className={`${geistMono.variable} min-h-[100dvh] overflow-hidden bg-background text-foreground antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider session={session}>
            <LanguageProvider initialLanguage={initialLanguage}>
                <CurrencyProvider initialSettings={settings ?? undefined}>
                  <ShellRouter session={session}>
                    <PageTransition>{children}</PageTransition>
                  </ShellRouter>
                  <VersionShield
                    initialVersion={runtimeVersion.version}
                    initialLabel={runtimeVersion.label}
                  />
                  <Toaster position="top-right" richColors />
                </CurrencyProvider>
            </LanguageProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
