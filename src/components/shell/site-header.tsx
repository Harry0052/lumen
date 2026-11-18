import Link from "next/link";
import { Suspense } from "react";
import { LocaleSwitch } from "@/components/shell/locale-switch";
import { PrimaryNav } from "@/components/shell/primary-nav";
import type { NavItem } from "@/components/shell/nav";

export function SiteHeader({
  displayName,
  locale,
  items,
  languageLabel,
  english,
  spanish,
}: {
  displayName: string;
  locale: string;
  items: NavItem[];
  languageLabel: string;
  english: string;
  spanish: string;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex min-h-12 items-center gap-2 rounded-full pr-2" aria-label="Lumen">
            <span className="lumen-mark" aria-hidden />
            <span className="font-display text-3xl leading-none tracking-tight text-ink">Lumen</span>
          </Link>
          <PrimaryNav items={items} variant="desktop" />
        </div>
        <div className="flex items-center gap-3">
          <Suspense fallback={<span className="text-sm font-semibold text-muted">{languageLabel}</span>}>
            <LocaleSwitch locale={locale} label={languageLabel} english={english} spanish={spanish} />
          </Suspense>
          <p className="max-w-32 truncate text-sm font-semibold text-muted sm:max-w-xs">{displayName}</p>
        </div>
      </div>
    </header>
  );
}
