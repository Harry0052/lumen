import Link from "next/link";
import { buttonClass } from "@/components/ui/button";
import { completionStats } from "@/lib/account/account";
import { readSessionUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { listPublicGuides } from "@/lib/guides/catalog";
import { t } from "@/lib/i18n/messages";
import { formatUtc } from "@/lib/time";
import { completedOrdinals, listSessions } from "@/lib/sessions/progress";

export const metadata = { title: "Progress" };

export default async function ProgressPage() {
  const db = getDb();
  const user = await readSessionUser(db);
  const locale = user?.locale ?? "en";
  const copy = t(locale);
  const sessions = user ? listSessions(db, user.id) : [];
  const cards = listPublicGuides(db, { locale });
  const yours = user ? completionStats(db, user.id) : { started: 0, completed: 0, percent: null };
  const everyone = completionStats(db);

  return (
    <main id="main" className="mx-auto w-full max-w-3xl px-4 py-8">
      <h1 className="font-display text-5xl tracking-tight text-ink">{copy.progressTitle}</h1>
      <p className="mt-4 text-xl leading-9 text-ink">{copy.progressLead}</p>

      <section className="mt-6 grid gap-3 sm:grid-cols-2" aria-label={copy.yourMetric}>
        <Stat title={copy.yourMetric} stats={yours} empty={copy.noMetric} note={copy.metricNote} />
        <Stat title={copy.localMetric} stats={everyone} empty={copy.noMetric} note={copy.metricNote} />
      </section>

      {sessions.length === 0 ? (
        <div className="mt-8 rounded-card border border-line bg-card p-6">
          <p className="text-lg">{copy.progressEmpty}</p>
          <Link href="/guides" className={`${buttonClass("primary")} mt-4`}>
            {copy.openGuide}
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {sessions.map((session) => {
            const card = cards.find((item) => item.id === session.guideId);
            const done = completedOrdinals(db, session.id);
            if (!card) return null;
            return (
              <li key={session.id} className="rounded-card border border-line bg-card p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-blue-deep">
                  {session.status === "completed" ? copy.finished : copy.inProgress}
                </p>
                <h2 className="mt-2 font-display text-3xl text-ink">{card.title}</h2>
                <p className="mt-2 text-lg">
                  {copy.stepOf.replace("{current}", String(session.lastStepOrdinal)).replace("{total}", String(card.stepCount))}
                  {" · "}
                  {done.length} {copy.stepsWord}
                </p>
                <p className="text-base text-muted">{formatUtc(session.updatedAt)}</p>
                <Link
                  href={session.status === "completed" ? `/guides/${card.slug}/done?session=${session.id}` : `/guides/${card.slug}?step=${session.lastStepOrdinal}`}
                  className={`${buttonClass("primary")} mt-4`}
                >
                  {session.status === "completed" ? copy.finished : copy.resume}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}

function Stat({
  title,
  stats,
  empty,
  note,
}: {
  title: string;
  stats: { started: number; completed: number; percent: number | null };
  empty: string;
  note: string;
}) {
  return (
    <article className="rounded-card border border-line bg-card p-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      {stats.percent === null ? (
        <p className="mt-2 text-base leading-7">{empty}</p>
      ) : (
        <p className="mt-2 font-display text-4xl tabular-nums text-ink">{stats.percent}%</p>
      )}
      <p className="mt-1 text-base text-muted">
        {stats.completed} / {stats.started}
      </p>
      <p className="mt-2 text-sm leading-6 text-muted">{note}</p>
    </article>
  );
}
