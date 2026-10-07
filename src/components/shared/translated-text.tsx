"use client";

import { useLanguage } from "@/components/language-provider";

/**
 * Drop-in client component that renders a translated string.
 * Use inside server components where you need a translated label:
 *
 *   <TranslatedText tKey="dashboard.purchaseRequests" />
 *
 * Optionally pass `as` to render a different element (defaults to <span>).
 * Passes through className and other HTML attributes.
 */
export function TranslatedText({
  tKey,
  fallback,
  as: Tag = "span",
  className,
  ...rest
}: {
  tKey: string;
  fallback?: string;
  as?: React.ElementType;
  className?: string;
} & Record<string, unknown>) {
  const { t } = useLanguage();
  const text = t(tKey);
  // If translation returns the key itself (missing), show fallback if provided
  const display = text === tKey && fallback ? fallback : text;

  return <Tag className={className} {...rest}>{display}</Tag>;
}
