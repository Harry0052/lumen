import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { Field, inputClass } from "@/components/ui/field";
import { editorCode } from "@/lib/auth/users";
import { readSessionUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { editorGuideList, freshnessOf } from "@/lib/guides/catalog";
import { errorText, noticeText, t, topicLabel } from "@/lib/i18n/messages";
import { formatUtc } from "@/lib/time";

export const metadata = { title: "Editor" };

export default async function EditorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const params = await searchParams;
  const db = getDb();
  const user = await readSessionUser(db);
  const locale = user?.locale ?? "en";
  const copy = t(locale);
  const desk = editorCode();
  const message = noticeText(locale, params.notice) ?? errorText(locale, params.error);
  const rows = user?.kind === "editor" ? editorGuideList(db) : [];

  return (
    <main id="main" className="mx-auto w-full max-w-3xl px-4 py-8">
      <h1 className="font-display text-5xl tracking-tight text-ink">{copy.editorTitle}</h1>
      <p className="mt-4 text-xl leading-9">{copy.editorLead}</p>
      <p className="mt-4 rounded-2xl border border-caution bg-caution-bg px-4 py-3 text-lg font-semibold">
        {desk.sandbox ? copy.editorSandbox : copy.editorConfigured}
      </p>
      {message ? (
        <p role="status" className="mt-4 rounded-2xl bg-good-bg px-4 py-3 font-semibold">
          {message}
        </p>
      ) : null}

      {user?.kind !== "editor" ? (
        <form method="post" action="/api/editor/unlock" className="mt-8 space-y-4">
          <input type="hidden" name="returnTo" value="/editor" />
          <Field id="desk-code" label={copy.editorCodeLabel} error={params.error === "code" ? message : null}>
            <input
              id="desk-code"
              name="code"
              type="password"
              autoComplete="off"
              className={inputClass}
              aria-invalid={params.error === "code"}
              aria-describedby={params.error === "code" ? "desk-code-error" : undefined}
            />
          </Field>
          <button type="submit" className={buttonClass("primary", "xl")}>
            {copy.editorUnlock}
          </button>
        </form>
      ) : (
        <>
          <ul className="mt-8 space-y-3">
            {rows.map((guide) => {
              const freshness = freshnessOf(guide);
              return (
                <li key={guide.id} className="rounded-card border border-line bg-card p-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge tone={guide.status === "draft" ? "caution" : freshness === "stale" ? "caution" : "good"}>
                      {guide.status === "draft" ? copy.draftBadge : freshness === "stale" ? copy.staleBadge : guide.status === "verified" ? copy.reviewedBadge : copy.unverifiedBadge}
                    </Badge>
                    {guide.isDemo === 1 ? <Badge>{copy.demoBadge}</Badge> : null}
                    <Badge>{topicLabel(locale, guide.topic)}</Badge>
                  </div>
                  <h2 className="mt-2 text-2xl font-semibold">{guide.slug}</h2>
                  <p className="text-base text-muted">
                    {copy.reviewedOn}: {formatUtc(guide.reviewedAt)}
                  </p>
                  {guide.status === "draft" ? <p className="mt-2 font-semibold">{copy.draftHidden}</p> : null}
                  <Link href={`/editor/${guide.id}`} className={`${buttonClass("secondary")} mt-3`}>
                    {copy.workingCopy}
                  </Link>
                </li>
              );
            })}
          </ul>
          <form method="post" action="/api/editor/guides" className="mt-8 space-y-4 rounded-card border border-line bg-white p-5">
            <h2 className="text-2xl font-semibold">{copy.newGuide}</h2>
            <Field id="new-title" label={copy.guideTitle}>
              <input id="new-title" name="title" required minLength={3} className={inputClass} />
            </Field>
            <Field id="new-topic" label={copy.topic}>
              <select id="new-topic" name="topic" className={inputClass} defaultValue="safety">
                <option value="accounts">{copy.topicAccounts}</option>
                <option value="safety">{copy.topicSafety}</option>
                <option value="devices">{copy.topicDevices}</option>
              </select>
            </Field>
            <Field id="new-source-title" label={copy.sourceTitle}>
              <input id="new-source-title" name="sourceTitle" required minLength={3} className={inputClass} />
            </Field>
            <Field id="new-source-url" label={copy.sourceUrl}>
              <input id="new-source-url" name="sourceUrl" required type="url" className={inputClass} placeholder="https://" />
            </Field>
            <button type="submit" className={buttonClass("primary")}>
              {copy.createGuide}
            </button>
          </form>
        </>
      )}
    </main>
  );
}
