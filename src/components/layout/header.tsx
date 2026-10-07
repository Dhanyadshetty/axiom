"use client";

import { useSession, signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { AxiomLogo } from "@/components/shared/axiom-logo";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { NotificationBell } from "@/components/layout/notification-bell";
import { useLanguage } from "@/components/i18n/language-provider";
import { t } from "@/lib/i18n";

export function Header() {
  const { data: session, status } = useSession();
  const { language } = useLanguage();

  if (status === "loading") {
    return (
      <header className="z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-sm lg:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <div className="h-5 w-5 animate-pulse rounded bg-primary-foreground/20" />
          </div>
          <div className="leading-tight">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-2 w-16 animate-pulse rounded bg-muted mt-1" />
          </div>
        </div>
        <div className="flex items-center gap-2 lg:gap-3">
          <div className="h-9 w-9 animate-pulse rounded-xl bg-muted" />
          <div className="h-9 w-9 animate-pulse rounded-xl bg-muted" />
          <div className="h-9 w-24 animate-pulse rounded-full bg-muted" />
          <div className="h-9 w-9 animate-pulse rounded-xl bg-muted" />
        </div>
      </header>
    );
  }

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: "/login" });
  };

  const user = session?.user;
  const role = user?.role;

  const roleLabel =
    role === "admin"
      ? t(language, "dashboard").adminSession
      : role === "supplier"
        ? t(language, "portal").welcome
        : t(language, "dashboard").internalSession;

  const brand =
    role === "admin"
      ? t(language, "header").adminConsole
      : role === "supplier"
        ? t(language, "header").supplierPortal
        : t(language, "header").operationsWorkspace;

  return (
    <header className="z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-sm lg:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <AxiomLogo className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-black tracking-tight text-foreground">Axiom</p>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            {brand}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-3">
        <NotificationBell />
        <LanguageToggle />

        <div className="hidden items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1.5 sm:flex">
          <span className="text-xs font-semibold text-foreground">{user?.name || "User"}</span>
          {roleLabel ? (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
              {roleLabel}
            </span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          title="Sign out"
          aria-label="Sign out"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-muted"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
