'use client';

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, Home, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global application error:", {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <html lang="en">
      <body
        className="min-h-[100dvh] bg-background text-foreground antialiased"
        style={{
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
        }}
      >
        <div className="flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center">
          <div className="mb-6 rounded-full bg-red-50 p-6 dark:bg-red-950/20">
            <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
          </div>

          <h1 className="mb-3 text-3xl font-bold tracking-tight">
            Unexpected System Interruption
          </h1>

          <p className="mx-auto mb-8 max-w-md text-sm leading-relaxed text-muted-foreground">
            Something went wrong while loading this workspace. You can retry without
            leaving the application, or return to the dashboard.
            {error.digest ? (
              <span className="mt-2 block font-mono text-[10px] opacity-50">
                Error ID: {error.digest}
              </span>
            ) : null}
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              onClick={() => reset()}
              className="flex items-center gap-2 px-6"
            >
              <RefreshCcw className="h-4 w-4" />
              Attempt Recovery
            </Button>

            <Button variant="outline" asChild className="px-6">
              <Link href="/" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Go to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
