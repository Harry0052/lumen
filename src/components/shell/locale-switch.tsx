"use client";

import { usePathname, useSearchParams } from "next/navigation";

export function LocaleSwitch({
  locale,
  label,
  english,
  spanish,
}: {
  locale: string;
  label: string;
  english: string;
  spanish: string;
}) {
  const pathname = usePathname();
  const params = useSearchParams();
  const query = params.toString();
  const returnTo = query ? `${pathname}?${query}` : pathname;
  const match = pathname.match(/^\/guides\/([^/]+)/);
  const guideSlug = match?.[1] ?? "";
  const button = (value: "en" | "es") =>
    `inline-flex min-h-12 items-center rounded-full px-3 text-base font-semibold ${
      locale === value ? "bg-blue text-white" : "bg-white text-ink"
    }`;

  return (
    <form method="post" action="/api/preferences" className="flex items-center gap-1" aria-label={label}>
      <input type="hidden" name="returnTo" value={returnTo} />
      <input type="hidden" name="guideSlug" value={guideSlug} />
      <button type="submit" name="locale" value="en" aria-pressed={locale === "en"} className={button("en")}>
        {english}
      </button>
      <button type="submit" name="locale" value="es" aria-pressed={locale === "es"} className={button("es")}>
        {spanish}
      </button>
    </form>
  );
}
