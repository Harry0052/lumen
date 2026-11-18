import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { CopyLink } from "@/components/product/copy-link";
import { ProgressForm } from "@/components/product/progress-form";
import { ReadAloud } from "@/components/product/read-aloud";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { inputClass } from "@/components/ui/field";
import { readSessionUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { getPublicGuide, isSaved } from "@/lib/guides/catalog";
import { errorText, fill, noticeText, t } from "@/lib/i18n/messages";
import { formatUtc } from "@/lib/time";
import { activeSessionForSlug, sessionDetail } from "@/lib/sessions/progress";

function mentions(text: string, term: string) {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|[^\\p{L}\\p{N}])${escaped}(?:$|[^\\p{L}\\p{N}])`, "iu").test(text);
}

function errorMap(locale: string) {
  const copy = t(locale);
  const codes = ["origin", "not_found", "forbidden", "invalid", "rate", "generic", "network"];
  const errors: Record<string, string> = { network: copy.networkError };
  for (const code of codes) {
    if (code === "network") continue;
    errors[code] = errorText(locale, code) ?? copy.errorBody;
  }
  return errors;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: slug };
}

export default async function GuidePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ step?: string; error?: string; notice?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const db = getDb();
  const user = await readSessionUser(db);
  const locale = user?.locale ?? "en";
  const copy = t(locale);
  const detail = getPublicGuide(db, slug, locale);
  if (!detail) notFound();

  const active = user ? activeSessionForSlug(db, user.id, slug) : null;
  const owned = active && user ? sessionDetail(db, user.id, active.id) : null;
  const steps = owned?.steps ?? detail.steps;
  const glossary = owned?.glossary ?? detail.glossary;
  const version = owned?.version ?? detail.version;
  const completed = new Set(owned?.completed ?? []);
  const requested = Number(query.step);
  const stepNumber = Math.min(steps.length, Math.max(1, Number.isInteger(requested) && requested > 0 ? requested : owned?.session.lastStepOrdinal ?? 1));
  const step = steps[stepNumber - 1];
  if (!step) notFound();
  const simpler = Boolean(user?.simpler);
  const body = simpler && step.simplerExplanation ? step.simplerExplanation : step.explanation;
  const simplerMode = simpler && step.simplerExplanation ? "simpler" : simpler ? "missing" : "standard";
  const summary = simpler && version?.simplerSummary ? version.simplerSummary : detail.card.summary;
  const blob = `${step.heading}\n${body}\n${step.example ?? ""}`;
  const terms = glossary.filter((term) => mentions(blob, term.term));
  const done = completed.has(step.ordinal);
  const last = stepNumber === steps.length;
  const message = noticeText(locale, query.notice) ?? errorText(locale, query.error);
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "localhost:3000";
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  const shareUrl = `${proto}://${host}/guides/${slug}`;
  const saved = user ? isSaved(db, user.id, detail.guide.id) : false;
  const speech = `${step.heading}. ${body}. ${step.example ?? ""}. ${step.caution ?? ""}`;
  const errors = errorMap(locale);

  return (
    <main id="main" className="mx-auto w-full max-w-3xl px-4 py-8">
      <Link href="/guides" className="text-base font-semibold text-blue-deep underline decoration-line underline-offset-4">
        {copy.backToGuides}
      </Link>
      <div className="mt-4 flex flex-wrap gap-2">
        {detail.card.isDemo ? <Badge>{copy.demoBadge}</Badge> : null}
        <Badge tone={detail.card.freshness === "current" ? "good" : "caution"}>
          {detail.card.freshness === "current" ? copy.reviewedBadge : detail.card.freshness === "stale" ? copy.staleBadge : copy.unverifiedBadge}
        </Badge>
        {detail.card.fallback ? <Badge tone="caution">{copy.englishOnly}</Badge> : null}
        {version?.locale === "es" ? <Badge>{copy.sampleSpanish}</Badge> : null}
      </div>
      <p className="mt-4 text-lg text-muted">{version?.title}</p>
      {message ? (
        <p role="status" className="mt-4 rounded-2xl bg-good-bg px-4 py-3 font-semibold">
          {message}
        </p>
      ) : null}
      {detail.card.freshness === "stale" ? (
        <p role="status" className="mt-4 rounded-2xl border border-caution bg-caution-bg px-4 py-3 text-lg font-semibold text-ink">
          {copy.staleDetail}
        </p>
      ) : null}
      {detail.card.fallback ? (
        <p role="status" className="mt-4 rounded-2xl border border-blue bg-white px-4 py-3 text-lg font-semibold text-ink">
          {copy.fallbackBanner}
        </p>
      ) : null}
      {version?.translationNote ? <p className="mt-3 text-base text-muted">{version.translationNote}</p> : null}

      {!owned ? (
        <section className="mt-6">
          <h1 className="font-display text-5xl leading-tight tracking-tight text-ink">{version?.title}</h1>
          <p className="mt-4 text-xl leading-9 text-ink">{summary}</p>
          <p className="mt-4 text-base text-muted">
            {copy.sourceLabel}:{" "}
            <a className="font-semibold text-blue-deep underline" href={detail.guide.sourceUrl} target="_blank" rel="noreferrer">
              {detail.guide.sourceTitle}
            </a>
            . {copy.opensSource}
          </p>
          <p className="text-base text-muted">
            {copy.reviewedOn}: {formatUtc(detail.guide.reviewedAt)} · {copy.reviewDue}: {formatUtc(detail.guide.reviewDueAt)}
          </p>
          <ol className="mt-6 list-decimal space-y-2 pl-6 text-lg">
            {steps.map((item) => (
              <li key={item.id}>{item.heading}</li>
            ))}
          </ol>
          <form method="post" action="/api/sessions" className="mt-6">
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="locale" value={locale} />
            <button type="submit" className={buttonClass("primary", "xl")}>
              {copy.startGuide}
            </button>
          </form>
        </section>
      ) : (
        <article className="mt-6" aria-labelledby="step-heading" data-session-id={owned.session.id} data-step={step.ordinal}>
          <p className="text-base font-semibold text-blue-deep">{fill(copy.stepOf, { current: step.ordinal, total: steps.length })}</p>
          <progress
            className="mt-3"
            value={step.ordinal}
            max={steps.length}
            aria-label={fill(copy.stepOf, { current: step.ordinal, total: steps.length })}
          />
          <h1 id="step-heading" className="mt-4 font-display text-5xl leading-tight tracking-tight text-ink">
            {step.heading}
          </h1>
          {simplerMode === "simpler" ? <p className="mt-3 font-semibold text-good">{copy.simplerOn}</p> : null}
          {simplerMode === "missing" ? <p className="mt-3 font-semibold text-caution">{copy.simplerMissing}</p> : null}
          <h2 className="mt-6 text-sm font-semibold uppercase tracking-[0.12em] text-blue-deep">{copy.why}</h2>
          <p className="mt-2 text-xl leading-9 text-ink">{body}</p>
          {step.example ? (
            <section className="mt-5 rounded-card bg-good-bg p-4">
              <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-good">{copy.exampleLabel}</h2>
              <p className="mt-2 text-lg leading-8 text-ink">{step.example}</p>
            </section>
          ) : null}
          {step.caution ? (
            <section className="mt-4 rounded-card bg-caution-bg p-4">
              <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-caution">{copy.cautionLabel}</h2>
              <p className="mt-2 text-lg leading-8 text-ink">{step.caution}</p>
            </section>
          ) : null}

          <details className="mt-5 rounded-card border border-line bg-white p-4">
            <summary className="cursor-pointer text-lg font-semibold">{copy.glossarySummary}</summary>
            {terms.length === 0 ? <p className="mt-3 text-lg">{copy.noGlossary}</p> : null}
            <dl className="mt-3 space-y-3">
              {terms.map((term) => (
                <div key={term.id}>
                  <dt className="font-semibold text-ink">{term.term}</dt>
                  <dd className="text-lg leading-8 text-ink">{term.definition}</dd>
                </div>
              ))}
            </dl>
          </details>

          <div className="mt-5">
            <ReadAloud
              text={speech}
              lang={version?.locale === "es" ? "es-ES" : "en-US"}
              readLabel={copy.readAloud}
              stopLabel={copy.readAloudStop}
              note={copy.readAloudNote}
              unsupported={copy.readAloudUnsupported}
              working={copy.readAloudWorking}
            />
          </div>

          {done ? <p className="mt-4 font-semibold text-good">{copy.markedDone}</p> : null}

          <div className="mt-6 grid gap-3">
            <ProgressForm action={`/api/sessions/${owned.session.id}/progress`} pendingLabel={copy.saving} errors={errors}>
              <input type="hidden" name="ordinal" value={step.ordinal} />
              <input type="hidden" name="intent" value={done ? "undo" : "complete"} />
              <button type="submit" className={buttonClass("secondary", "xl")}>
                {done ? copy.undoStep : copy.didThis}
              </button>
            </ProgressForm>
            <div className="grid gap-3 sm:grid-cols-2">
              <ProgressForm action={`/api/sessions/${owned.session.id}/progress`} pendingLabel={copy.saving} errors={errors}>
                <input type="hidden" name="ordinal" value={step.ordinal} />
                <input type="hidden" name="intent" value="back" />
                <button type="submit" className={buttonClass("secondary", "xl")} disabled={step.ordinal === 1}>
                  {copy.back}
                </button>
              </ProgressForm>
              <ProgressForm action={`/api/sessions/${owned.session.id}/progress`} pendingLabel={copy.saving} errors={errors}>
                <input type="hidden" name="ordinal" value={step.ordinal} />
                <input type="hidden" name="intent" value="next" />
                <button type="submit" className={buttonClass("primary", "xl")}>
                  {last ? copy.finish : copy.next}
                </button>
              </ProgressForm>
            </div>
          </div>

          <form method="post" action={`/api/guides/${slug}/feedback`} className="mt-8 rounded-card border border-line bg-white p-4">
            <h2 className="text-xl font-semibold">{copy.feedbackTitle}</h2>
            <input type="hidden" name="returnTo" value={`/guides/${slug}?step=${step.ordinal}`} />
            <input type="hidden" name="stepOrdinal" value={step.ordinal} />
            <label className="mt-3 flex min-h-12 items-center gap-3 text-lg">
              <input type="checkbox" name="confusing" value="1" className="size-5" />
              {copy.confusing}
            </label>
            <label htmlFor="note" className="mt-3 block font-semibold">
              {copy.noteLabel}
            </label>
            <textarea id="note" name="note" maxLength={400} className={`${inputClass} mt-2 min-h-28 py-3`} />
            <button type="submit" className={`${buttonClass("secondary")} mt-3`}>
              {copy.sendFeedback}
            </button>
          </form>
        </article>
      )}

      <div className="mt-8 grid gap-4">
        <form method="post" action="/api/saved">
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="returnTo" value={owned ? `/guides/${slug}?step=${stepNumber}` : `/guides/${slug}`} />
          <button type="submit" className={buttonClass("secondary")}>
            {saved ? copy.removeSaved : copy.saveGuide}
          </button>
        </form>
        <CopyLink url={shareUrl} label={copy.copyLink} copied={copy.copied} failed={copy.copyFailed} />
        <p className="text-base text-muted">
          {copy.sourceLabel}:{" "}
          <a className="font-semibold text-blue-deep underline" href={detail.guide.sourceUrl} target="_blank" rel="noreferrer">
            {detail.guide.sourceTitle}
          </a>
        </p>
      </div>
    </main>
  );
}
