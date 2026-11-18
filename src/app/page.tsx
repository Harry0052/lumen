import Link from "next/link";
import { GuideCardView } from "@/components/product/guide-card";
import { buttonClass } from "@/components/ui/button";
import { inputClass } from "@/components/ui/field";
import { readSessionUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { listPublicGuides } from "@/lib/guides/catalog";
import { errorText, noticeText, t, topicLabel } from "@/lib/i18n/messages";
import { flags } from "@/lib/flags";
import { listSessions } from "@/lib/sessions/progress";
import { guides } from "@/lib/db/schema";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const params = await searchParams;
  const db = getDb();
  const user = await readSessionUser(db);
  const locale = user?.locale ?? "en";
  const copy = t(locale);
  const cards = listPublicGuides(db, { locale });
  const sessions = user ? listSessions(db, user.id) : [];
  const current = sessions.find((session) => session.status === "in_progress");
  const guideRows = db.select().from(guides).all();
  const currentGuide = current ? guideRows.find((guide) => guide.id === current.guideId) : null;
  const currentCard = currentGuide ? cards.find((card) => card.id === currentGuide.id) : null;
  const topics = ["accounts", "safety", "devices"];
  const message = noticeText(locale, params.notice) ?? errorText(locale, params.error);

  return (
    <main id="main" className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-12">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-deep">{copy.homeKicker}</p>
      <h1 className="mt-3 max-w-3xl font-display text-5xl leading-tight tracking-tight text-ink sm:text-6xl">{copy.homeTitle}</h1>
      <p className="mt-4 max-w-2xl text-xl leading-9 text-ink">{copy.homeLead}</p>
      <p className="mt-3 max-w-2xl text-lg text-muted">{user?.displayName ? copy.welcomeBack : copy.firstVisit}</p>
      {message ? (
        <p role="status" className="mt-6 max-w-2xl rounded-2xl bg-good-bg px-4 py-3 font-semibold text-ink">
          {message}
        </p>
      ) : null}

      {current && currentCard ? (
        <section className="mt-8 rounded-card border-2 border-blue bg-card p-5" aria-labelledby="continue-heading">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-blue-deep">{copy.continueEyebrow}</p>
          <h2 id="continue-heading" className="mt-2 font-display text-3xl text-ink">
            {currentCard.title}
          </h2>
          <p className="mt-2 text-lg text-ink">
            {copy.stepOf.replace("{current}", String(current.lastStepOrdinal)).replace("{total}", String(currentCard.stepCount))}
          </p>
          <Link href={`/guides/${currentCard.slug}?step=${current.lastStepOrdinal}`} className={`${buttonClass("primary", "xl")} mt-4 sm:w-auto`}>
            {copy.continueAction}
          </Link>
        </section>
      ) : null}

      <form method="get" action="/guides" className="mt-8 rounded-card border border-line bg-card p-5" role="search">
        <label htmlFor="q" className="text-lg font-semibold text-ink">
          {copy.searchLabel}
        </label>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input id="q" name="q" className={inputClass} placeholder={copy.searchPlaceholder} maxLength={80} />
          <button type="submit" className={`${buttonClass("primary")} sm:min-w-40`}>
            {copy.searchButton}
          </button>
        </div>
      </form>

      <section className="mt-4 rounded-card border border-line bg-white p-5" aria-labelledby="llm-heading">
        <h2 id="llm-heading" className="text-xl font-semibold text-ink">
          {copy.llmTitle}
        </h2>
        <p className="mt-2 text-lg leading-8 text-muted">{copy.llmBody}</p>
        <button type="button" disabled className={`${buttonClass("secondary")} mt-4`} aria-describedby="llm-heading">
          {copy.llmTitle}
        </button>
        {flags.llmRewrite ? null : <p className="sr-only">Disabled</p>}
      </section>

      <nav className="mt-8 flex flex-wrap gap-3" aria-label={copy.topic}>
        {topics.map((topic) => (
          <Link key={topic} href={`/guides?topic=${topic}`} className={buttonClass("secondary")}>
            {topicLabel(locale, topic)}
          </Link>
        ))}
      </nav>

      <h2 className="mt-10 font-display text-4xl tracking-tight text-ink">{copy.guidesTitle}</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <GuideCardView key={card.id} card={card} locale={locale} />
        ))}
      </div>
    </main>
  );
}
