import Link from "next/link";
import { GuideCardView } from "@/components/product/guide-card";
import { buttonClass } from "@/components/ui/button";
import { inputClass } from "@/components/ui/field";
import { readSessionUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { listPublicGuides } from "@/lib/guides/catalog";
import { t, topicLabel } from "@/lib/i18n/messages";

export const metadata = { title: "Guides" };

export default async function GuidesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; topic?: string }>;
}) {
  const params = await searchParams;
  const db = getDb();
  const user = await readSessionUser(db);
  const locale = user?.locale ?? "en";
  const copy = t(locale);
  const q = params.q ?? "";
  const topic = params.topic ?? "";
  const cards = listPublicGuides(db, { locale, q, topic });
  const topics = ["", "accounts", "safety", "devices"];

  return (
    <main id="main" className="mx-auto w-full max-w-5xl px-4 py-8">
      <h1 className="font-display text-5xl tracking-tight text-ink">{copy.guidesTitle}</h1>
      <form method="get" action="/guides" className="mt-6 flex flex-col gap-3 sm:flex-row" role="search">
        {topic ? <input type="hidden" name="topic" value={topic} /> : null}
        <label className="sr-only" htmlFor="guide-search">
          {copy.searchLabel}
        </label>
        <input id="guide-search" name="q" defaultValue={q} maxLength={80} placeholder={copy.searchPlaceholder} className={inputClass} />
        <button type="submit" className={buttonClass("primary")}>
          {copy.searchButton}
        </button>
      </form>
      <div className="mt-4 flex flex-wrap gap-2">
        {topics.map((item) => {
          const active = item === topic;
          const href = item ? `/guides?topic=${item}${q ? `&q=${encodeURIComponent(q)}` : ""}` : `/guides${q ? `?q=${encodeURIComponent(q)}` : ""}`;
          return (
            <Link
              key={item || "all"}
              href={href}
              aria-current={active ? "page" : undefined}
              className={buttonClass(active ? "primary" : "secondary")}
            >
              {item ? topicLabel(locale, item) : copy.allTopics}
            </Link>
          );
        })}
      </div>
      <p className="mt-6 text-lg font-semibold text-ink" role="status">
        {copy.resultsFor}: {cards.length}
      </p>
      {cards.length === 0 ? (
        <div className="mt-4 rounded-card border border-line bg-card p-6">
          <h2 className="font-display text-3xl text-ink">{copy.emptyTitle}</h2>
          <p className="mt-3 text-lg leading-8 text-muted">{copy.emptyBody}</p>
          <Link href="/guides" className={`${buttonClass("secondary")} mt-5`}>
            {copy.clearSearch}
          </Link>
        </div>
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {cards.map((card) => (
            <GuideCardView key={card.id} card={card} locale={locale} />
          ))}
        </div>
      )}
    </main>
  );
}
