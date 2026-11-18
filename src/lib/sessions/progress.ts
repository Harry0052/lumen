import { randomUUID } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { recordEvent } from "@/lib/audit";
import type { LumenDb } from "@/lib/db/client";
import { guideSessions, guideSteps, guides, metricEvents, sessionSteps } from "@/lib/db/schema";
import { getPublicGuide, glossaryForVersion, latestVersion, resolveReviewed, stepsForVersion, versionsForGuide } from "@/lib/guides/catalog";
import { nowIso } from "@/lib/time";

export type ProgressIntent = "back" | "next" | "complete" | "undo";

function recordMetric(db: LumenDb, userId: string, guideId: string, sessionId: string, kind: string) {
  db.insert(metricEvents)
    .values({ id: randomUUID(), userId, guideId, sessionId, kind, createdAt: nowIso() })
    .run();
}

export function listSessions(db: LumenDb, userId: string) {
  return db
    .select()
    .from(guideSessions)
    .where(eq(guideSessions.userId, userId))
    .orderBy(desc(guideSessions.updatedAt))
    .all();
}

export function completedOrdinals(db: LumenDb, sessionId: string) {
  return db
    .select()
    .from(sessionSteps)
    .where(eq(sessionSteps.sessionId, sessionId))
    .all()
    .map((row) => row.ordinal)
    .sort((a, b) => a - b);
}

export function getOwnedSession(db: LumenDb, userId: string, sessionId: string) {
  const session = db.select().from(guideSessions).where(eq(guideSessions.id, sessionId)).get();
  if (!session || session.userId !== userId) return null;
  const guide = db.select().from(guides).where(eq(guides.id, session.guideId)).get();
  if (!guide) return null;
  const steps = stepsForVersion(db, session.versionId);
  return { session, guide, steps, completed: completedOrdinals(db, session.id) };
}

export function startGuide(db: LumenDb, userId: string, slug: string, locale: string) {
  const detail = getPublicGuide(db, slug, locale);
  if (!detail) return { ok: false as const, code: "not_found" as const, message: "That guide is not on the public list." };
  const existing = db
    .select()
    .from(guideSessions)
    .where(
      and(
        eq(guideSessions.userId, userId),
        eq(guideSessions.guideId, detail.guide.id),
        eq(guideSessions.status, "in_progress"),
      ),
    )
    .get();
  if (existing) {
    const aligned = alignSessionVersion(db, existing.id, userId, locale);
    return { ok: true as const, sessionId: existing.id, slug, created: false, fallback: aligned?.fallback ?? detail.card.fallback };
  }
  const createdAt = nowIso();
  const id = randomUUID();
  db.insert(guideSessions)
    .values({
      id,
      userId,
      guideId: detail.guide.id,
      versionId: detail.version.id,
      status: "in_progress",
      lastStepOrdinal: 1,
      createdAt,
      updatedAt: createdAt,
    })
    .run();
  recordMetric(db, userId, detail.guide.id, id, "guide_started");
  recordEvent(db, userId, "guide_started", { slug, locale: detail.version.locale });
  return { ok: true as const, sessionId: id, slug, created: true, fallback: detail.card.fallback };
}

export function alignSessionVersion(db: LumenDb, sessionId: string, userId: string, locale: string) {
  const owned = getOwnedSession(db, userId, sessionId);
  if (!owned) return null;
  const versions = versionsForGuide(db, owned.guide.id);
  const resolved = resolveReviewed(versions, owned.guide.id, locale);
  if (!resolved.version) return { fallback: true, session: owned.session };
  if (resolved.version.id === owned.session.versionId) {
    return { fallback: resolved.fallback, session: owned.session };
  }
  const nextSteps = stepsForVersion(db, resolved.version.id);
  const max = Math.max(1, nextSteps.length);
  const ordinal = Math.min(owned.session.lastStepOrdinal, max);
  db.transaction((tx) => {
    const done = tx.select().from(sessionSteps).where(eq(sessionSteps.sessionId, sessionId)).all();
    for (const row of done) {
      if (row.ordinal > nextSteps.length) {
        tx.delete(sessionSteps).where(eq(sessionSteps.id, row.id)).run();
        continue;
      }
      const match = nextSteps.find((step) => step.ordinal === row.ordinal);
      tx.update(sessionSteps)
        .set({ stepId: match?.id ?? null })
        .where(eq(sessionSteps.id, row.id))
        .run();
    }
    tx.update(guideSessions)
      .set({ versionId: resolved.version!.id, lastStepOrdinal: ordinal, updatedAt: nowIso() })
      .where(eq(guideSessions.id, sessionId))
      .run();
  });
  const fresh = db.select().from(guideSessions).where(eq(guideSessions.id, sessionId)).get();
  return { fallback: resolved.fallback, session: fresh ?? owned.session };
}

export function alignLatestSession(db: LumenDb, userId: string, slug: string, locale: string) {
  const guide = db.select().from(guides).where(eq(guides.slug, slug)).get();
  if (!guide) return null;
  const inProgress = db
    .select()
    .from(guideSessions)
    .where(and(eq(guideSessions.userId, userId), eq(guideSessions.guideId, guide.id), eq(guideSessions.status, "in_progress")))
    .get();
  const target =
    inProgress ??
    db
      .select()
      .from(guideSessions)
      .where(and(eq(guideSessions.userId, userId), eq(guideSessions.guideId, guide.id)))
      .orderBy(desc(guideSessions.updatedAt))
      .get();
  if (!target) return null;
  return alignSessionVersion(db, target.id, userId, locale);
}

export function moveStep(db: LumenDb, userId: string, sessionId: string, ordinal: number, intent: ProgressIntent) {
  return db.transaction((tx) => {
    const session = tx.select().from(guideSessions).where(eq(guideSessions.id, sessionId)).get();
    if (!session || session.userId !== userId) {
      return { ok: false as const, code: "not_found" as const, message: "That session is not on this account." };
    }
    const guide = tx.select().from(guides).where(eq(guides.id, session.guideId)).get();
    if (!guide) {
      return { ok: false as const, code: "not_found" as const, message: "That guide is no longer available." };
    }
    const steps = tx
      .select()
      .from(guideSteps)
      .where(eq(guideSteps.versionId, session.versionId))
      .all()
      .sort((a, b) => a.ordinal - b.ordinal);
    if (!Number.isInteger(ordinal) || ordinal < 1 || ordinal > steps.length) {
      return { ok: false as const, code: "invalid" as const, message: "That step is not in this guide." };
    }

    const mark = (stepOrdinal: number) => {
      const step = steps.find((item) => item.ordinal === stepOrdinal);
      tx.insert(sessionSteps)
        .values({
          id: randomUUID(),
          sessionId,
          stepId: step?.id ?? null,
          ordinal: stepOrdinal,
          completedAt: nowIso(),
        })
        .onConflictDoNothing()
        .run();
    };
    const clear = (stepOrdinal: number) => {
      const row = tx
        .select()
        .from(sessionSteps)
        .where(and(eq(sessionSteps.sessionId, sessionId), eq(sessionSteps.ordinal, stepOrdinal)))
        .get();
      if (row) tx.delete(sessionSteps).where(eq(sessionSteps.id, row.id)).run();
    };

    if (intent === "next" && session.lastStepOrdinal > ordinal && session.status !== "completed") {
      return {
        ok: true as const,
        slug: guide.slug,
        step: session.lastStepOrdinal,
        status: session.status,
        duplicate: true,
      };
    }

    let nextOrdinal = ordinal;
    let status = session.status;

    if (intent === "complete") {
      mark(ordinal);
      nextOrdinal = ordinal;
    } else if (intent === "undo") {
      clear(ordinal);
      status = "in_progress";
      nextOrdinal = ordinal;
    } else if (intent === "back") {
      nextOrdinal = Math.max(1, ordinal - 1);
    } else {
      mark(ordinal);
      if (ordinal >= steps.length) {
        status = "completed";
        nextOrdinal = ordinal;
      } else {
        nextOrdinal = ordinal + 1;
        status = "in_progress";
      }
    }

    tx.update(guideSessions)
      .set({ lastStepOrdinal: nextOrdinal, status, updatedAt: nowIso() })
      .where(eq(guideSessions.id, sessionId))
      .run();

    if (status === "completed" && session.status !== "completed") {
      tx.insert(metricEvents)
        .values({
          id: randomUUID(),
          userId,
          guideId: guide.id,
          sessionId,
          kind: "guide_completed",
          createdAt: nowIso(),
        })
        .run();
    }

    return {
      ok: true as const,
      slug: guide.slug,
      step: nextOrdinal,
      status,
      duplicate: false,
    };
  });
}

export function sessionDetail(db: LumenDb, userId: string, sessionId: string) {
  const owned = getOwnedSession(db, userId, sessionId);
  if (!owned) return null;
  const glossary = glossaryForVersion(db, owned.session.versionId);
  const version = versionsForGuide(db, owned.guide.id).find((item) => item.id === owned.session.versionId) ?? null;
  return { ...owned, glossary, version };
}

export function activeSessionForSlug(db: LumenDb, userId: string, slug: string) {
  const guide = db.select().from(guides).where(eq(guides.slug, slug)).get();
  if (!guide) return null;
  return (
    db
      .select()
      .from(guideSessions)
      .where(and(eq(guideSessions.userId, userId), eq(guideSessions.guideId, guide.id), eq(guideSessions.status, "in_progress")))
      .orderBy(desc(guideSessions.updatedAt))
      .get() ?? null
  );
}

export function workingVersion(db: LumenDb, guideId: string, locale: string) {
  const versions = versionsForGuide(db, guideId);
  return latestVersion(versions, guideId, locale, "any");
}
