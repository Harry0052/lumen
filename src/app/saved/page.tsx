import Link from "next/link";
import { GuideCardView } from "@/components/product/guide-card";
import { buttonClass } from "@/components/ui/button";
import { readSessionUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { listSaved } from "@/lib/guides/catalog";
import { noticeText, t } from "@/lib/i18n/messages";

export const metadata = { title: "Saved" };

export default async function SavedPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  const params = await searchParams;
  const db = getDb();
  const user = await readSessionUser(db);
  const locale = user?.locale ?? "en";
  const copy = t(locale);
  const cards = user ? listSaved(db, user.id, locale) : [];
  const message = noticeText(locale, params.notice);

  return (
    <main id="main" className="mx-auto w-full max-w-5xl px-4 py-8">
      <h1 className="font-display text-5xl tracking-tight text-ink">{copy.savedTitle}</h1>
      {message ? (
        <p role="status" className="mt-4 rounded-2xl bg-good-bg px-4 py-3 font-semibold">
          {message}
        </p>
      ) : null}
      {cards.length === 0 ? (
        <div className="mt-6 rounded-card border border-line bg-card p-6">
          <p className="text-lg leading-8">{copy.savedEmpty}</p>
          <Link href="/guides" className={`${buttonClass("primary")} mt-4`}>
            {copy.openGuide}
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {cards.map((card) => (
            <GuideCardView key={card.id} card={card} locale={locale} />
          ))}
        </div>
      )}
    </main>
  );
}
