import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonClass } from "@/components/ui/button";
import { inputClass } from "@/components/ui/field";
import { readSessionUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { getPublicGuide } from "@/lib/guides/catalog";
import { noticeText, t } from "@/lib/i18n/messages";
import { listSessions } from "@/lib/sessions/progress";

export const metadata = { title: "Finished" };

export default async function DonePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ session?: string; notice?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const db = getDb();
  const user = await readSessionUser(db);
  const locale = user?.locale ?? "en";
  const copy = t(locale);
  const detail = getPublicGuide(db, slug, locale);
  if (!detail) notFound();
  const sessions = user ? listSessions(db, user.id).filter((session) => session.guideId === detail.guide.id) : [];
  const match = sessions.find((session) => session.id === query.session) ?? sessions.find((session) => session.status === "completed");
  const finished = match?.status === "completed";
  const message = noticeText(locale, query.notice);

  return (
    <main id="main" className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="font-display text-5xl tracking-tight text-ink">{finished ? copy.doneTitle : copy.notDoneTitle}</h1>
      <p className="mt-4 text-xl leading-9 text-ink">{finished ? copy.doneBody : copy.notDoneBody}</p>
      <p className="mt-3 text-lg text-muted">{detail.card.title}</p>
      {message ? (
        <p role="status" className="mt-4 rounded-2xl bg-good-bg px-4 py-3 font-semibold">
          {message}
        </p>
      ) : null}
      {finished ? (
        <form method="post" action={`/api/guides/${slug}/feedback`} className="mt-8 rounded-card border border-line bg-card p-5">
          <fieldset>
            <legend className="text-xl font-semibold">{copy.clarityLegend}</legend>
            <div className="mt-3 grid gap-2">
              {[
                ["1", copy.clarity1],
                ["2", copy.clarity2],
                ["3", copy.clarity3],
                ["4", copy.clarity4],
                ["5", copy.clarity5],
              ].map(([value, label]) => (
                <label key={value} className="flex min-h-12 items-center gap-3 text-lg">
                  <input type="radio" name="clarityRating" value={value} className="size-5" />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="mt-4 flex min-h-12 items-center gap-3 text-lg">
            <input type="checkbox" name="confusing" value="1" className="size-5" />
            {copy.confusing}
          </label>
          <label htmlFor="done-note" className="mt-3 block font-semibold">
            {copy.noteLabel}
          </label>
          <textarea id="done-note" name="note" maxLength={400} className={`${inputClass} mt-2 min-h-28 py-3`} />
          <input type="hidden" name="returnTo" value={`/guides/${slug}/done?session=${match?.id ?? ""}`} />
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button type="submit" className={buttonClass("primary")}>
              {copy.sendFeedback}
            </button>
            <Link href="/progress" className={buttonClass("secondary")}>
              {copy.skipFeedback}
            </Link>
          </div>
        </form>
      ) : (
        <Link href={`/guides/${slug}`} className={`${buttonClass("primary")} mt-8`}>
          {copy.startGuide}
        </Link>
      )}
      {finished ? (
        <form method="post" action="/api/sessions" className="mt-6">
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="again" value="1" />
          <button type="submit" className={buttonClass("secondary")}>
            {copy.startGuide}
          </button>
        </form>
      ) : null}
    </main>
  );
}
