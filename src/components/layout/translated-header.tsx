"use client";

import { useLanguage } from "@/components/language-provider";
import { cn } from "@/lib/utils";

type TranslatedHeaderTitlesProps = {
  workspaceTitleKey: string;
  workspaceSubtitleKey: string;
};

/**
 * Client component that translates the header workspace title and subtitle.
 */
export function TranslatedHeaderTitles({
  workspaceTitleKey,
  workspaceSubtitleKey,
}: TranslatedHeaderTitlesProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col leading-none">
      <h2 className="text-[13px] font-bold text-foreground tracking-tight">
        {t(workspaceTitleKey)}
      </h2>
      <span className="hidden text-[10px] font-medium text-muted-foreground/55 md:block">
        {t(workspaceSubtitleKey)}
      </span>
    </div>
  );
}

type TranslatedHeaderBadgeProps = {
  badgeKey: string;
  className?: string;
};

/**
 * Client component that translates the session badge text.
 */
export function TranslatedHeaderBadge({
  badgeKey,
  className,
}: TranslatedHeaderBadgeProps) {
  const { t } = useLanguage();

  return (
    <span className={className}>
      {t(badgeKey)}
    </span>
  );
}
