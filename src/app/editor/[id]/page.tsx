import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonClass } from "@/components/ui/button";
import { Field, inputClass } from "@/components/ui/field";
import { readSessionUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { feedbackForGuide } from "@/lib/feedback/feedback";
import { getGuideById, latestVersion, stepsForVersion, versionsForGuide } from "@/lib/guides/catalog";
import { errorText, noticeText, t } from "@/lib/i18n/messages";
import { formatUtc } from "@/lib/time";

export const metadata = { title: "Edit guide" };

export default async function EditGuidePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ locale?: string; steps?: string; error?: string; notice?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const db = getDb();
  const user = await readSessionUser(db);
  if (!user || user.kind !== "editor") {
    return (
      <main id="main" className="mx-auto w-full max-w-3xl px-4 py-10">
        <h1 className="font-display text-4xl">Editor desk</h1>
        <p className="mt-4 text-lg">The editor desk is locked for this browser.</p>
        <Link href="/editor" className={`${buttonClass("primary")} mt-6`}>
          Unlock editor desk
        </Link>
      </main>
    );
  }
  const guide = getGuideById(db, id);
  if (!guide) notFound();
  const locale = query.locale === "es" ? "es" : "en";
  const copy = t(user.locale);
  const versions = versionsForGuide(db, guide.id);
  const latest = latestVersion(versions, guide.id, locale, "any");
  const storedSteps = latest ? stepsForVersion(db, latest.id) : [];
  const requested = Number(query.steps);
  const count = Math.min(8, Math.max(1, Number.isInteger(requested) && requested > 0 ? requested : storedSteps.length || 1));
  const message = noticeText(user.locale, query.notice) ?? errorText(user.locale, query.error);
  const notes = feedbackForGuide(db, guide.id);
  const reviewedExists = versions.some((version) => version.locale === locale && version.status === "reviewed");

  return (
    <main id="main" className="mx-auto w-full max-w-3xl px-4 py-8">
      <Link href="/editor" className="font-semibold text-blue-deep underline">
        {copy.editorTitle}
      </Link>
      <h1 className="mt-3 font-display text-4xl tracking-tight text-ink">{guide.slug}</h1>
      <p className="mt-2 text-lg text-muted">
        {copy.reviewedOn}: {formatUtc(guide.reviewedAt)} · {guide.status}
      </p>
      {guide.status === "draft" ? <p className="mt-3 font-semibold text-caution">{copy.draftHidden}</p> : null}
      {latest?.status === "draft" && reviewedExists ? <p className="mt-3 text-lg">{copy.publicCopy}</p> : null}
      {message ? (
        <p role="status" className="mt-4 rounded-2xl bg-good-bg px-4 py-3 font-semibold">
          {message}
        </p>
      ) : null}
      <div className="mt-4 flex gap-2">
        <Link href={`/editor/${id}?locale=en`} className={buttonClass(locale === "en" ? "primary" : "secondary")} aria-current={locale === "en" ? "page" : undefined}>
          {copy.english}
        </Link>
        <Link href={`/editor/${id}?locale=es`} className={buttonClass(locale === "es" ? "primary" : "secondary")} aria-current={locale === "es" ? "page" : undefined}>
          {copy.spanish}
        </Link>
      </div>

      <form method="post" action={`/api/editor/guides/${id}`} className="mt-6 space-y-4">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="stepCount" value={count} />
        <Field id="title" label={copy.guideTitle}>
          <input id="title" name="title" required defaultValue={latest?.title ?? ""} className={inputClass} />
        </Field>
        <Field id="summary" label={copy.summary}>
          <textarea id="summary" name="summary" required defaultValue={latest?.summary ?? ""} className={`${inputClass} min-h-28 py-3`} />
        </Field>
        <Field id="simpler-summary" label={copy.simplerSummary}>
          <textarea id="simpler-summary" name="simplerSummary" defaultValue={latest?.simplerSummary ?? ""} className={`${inputClass} min-h-24 py-3`} />
        </Field>
        <Field id="source-title" label={copy.sourceTitle}>
          <input id="source-title" name="sourceTitle" required defaultValue={guide.sourceTitle} className={inputClass} />
        </Field>
        <Field id="source-url" label={copy.sourceUrl}>
          <input id="source-url" name="sourceUrl" required type="url" defaultValue={guide.sourceUrl} className={inputClass} />
        </Field>
        <Field id="topic" label={copy.topic}>
          <select id="topic" name="topic" defaultValue={guide.topic} className={inputClass}>
            <option value="accounts">{copy.topicAccounts}</option>
            <option value="safety">{copy.topicSafety}</option>
            <option value="devices">{copy.topicDevices}</option>
          </select>
        </Field>
        {Array.from({ length: count }, (_, index) => {
          const step = storedSteps[index];
          const n = index + 1;
          return (
            <fieldset key={n} className="space-y-3 rounded-card border border-line p-4">
              <legend className="px-2 font-semibold">
                {n}. {copy.stepHeading}
              </legend>
              <input name={`heading_${n}`} required defaultValue={step?.heading ?? ""} className={inputClass} aria-label={`${copy.stepHeading} ${n}`} />
              <textarea name={`explanation_${n}`} required defaultValue={step?.explanation ?? ""} className={`${inputClass} min-h-28 py-3`} aria-label={`${copy.stepExplanation} ${n}`} />
              <textarea name={`simpler_${n}`} defaultValue={step?.simplerExplanation ?? ""} className={`${inputClass} min-h-20 py-3`} aria-label={`${copy.stepSimpler} ${n}`} />
              <textarea name={`example_${n}`} defaultValue={step?.example ?? ""} className={`${inputClass} min-h-20 py-3`} aria-label={`${copy.stepExample} ${n}`} />
              <textarea name={`caution_${n}`} defaultValue={step?.caution ?? ""} className={`${inputClass} min-h-20 py-3`} aria-label={`${copy.stepCaution} ${n}`} />
            </fieldset>
          );
        })}
        <div className="flex flex-wrap gap-3">
          {count < 8 ? (
            <Link href={`/editor/${id}?locale=${locale}&steps=${count + 1}`} className={buttonClass("secondary")}>
              {copy.addStep}
            </Link>
          ) : null}
          {count > 1 ? (
            <Link href={`/editor/${id}?locale=${locale}&steps=${count - 1}`} className={buttonClass("secondary")}>
              {copy.removeStep}
            </Link>
          ) : null}
        </div>
        <button type="submit" className={buttonClass("primary", "xl")}>
          {copy.saveDraft}
        </button>
      </form>

      <form method="post" action={`/api/editor/guides/${id}/review`} className="mt-6 space-y-4 rounded-card border border-line bg-white p-5">
        <input type="hidden" name="locale" value={locale} />
        <label className="flex items-start gap-3 text-lg">
          <input type="checkbox" name="checkedSource" value="yes" className="mt-1 size-5" />
          <span>{copy.reviewCheck}</span>
        </label>
        <button type="submit" className={buttonClass("primary")}>
          {copy.markReviewed}
        </button>
      </form>

      <section className="mt-8">
        <h2 className="text-2xl font-semibold">{copy.editorFeedback}</h2>
        <p className="mt-2 text-lg">
          {notes.count} · {copy.confusing}: {notes.confusing}
        </p>
        {notes.notes.length === 0 ? <p className="mt-2">{copy.noFeedback}</p> : null}
        <ul className="mt-3 space-y-3">
          {notes.notes.map((note) => (
            <li key={`${note.createdAt}-${note.stepOrdinal}`} className="rounded-2xl border border-line p-4">
              <p className="text-sm text-muted">
                {copy.someoneWrote} · {formatUtc(note.createdAt)}
                {note.stepOrdinal ? ` · ${note.stepOrdinal}` : ""}
              </p>
              <p className="mt-2 text-lg">{note.note}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
