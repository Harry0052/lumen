import { eq } from "drizzle-orm";
import { recordEvent } from "@/lib/audit";
import type { LumenDb } from "@/lib/db/client";
import {
  feedback,
  guideSessions,
  guides,
  metricEvents,
  savedGuides,
  securityEvents,
  sessionSteps,
  sessions,
  users,
} from "@/lib/db/schema";
import { nowIso } from "@/lib/time";

export function completionStats(db: LumenDb, userId?: string) {
  const rows = userId
    ? db.select().from(guideSessions).where(eq(guideSessions.userId, userId)).all()
    : db.select().from(guideSessions).all();
  const started = rows.length;
  const completed = rows.filter((row) => row.status === "completed").length;
  return {
    started,
    completed,
    percent: started === 0 ? null : Math.round((completed / started) * 100),
  };
}

export function exportAccount(db: LumenDb, userId: string) {
  const user = db.select().from(users).where(eq(users.id, userId)).get();
  if (!user || user.kind === "deleted") return null;
  const ownedSessions = db.select().from(guideSessions).where(eq(guideSessions.userId, userId)).all();
  const steps = ownedSessions.flatMap((session) =>
    db.select().from(sessionSteps).where(eq(sessionSteps.sessionId, session.id)).all(),
  );
  const saved = db.select().from(savedGuides).where(eq(savedGuides.userId, userId)).all();
  const notes = db.select().from(feedback).where(eq(feedback.userId, userId)).all();
  const guideRows = db.select().from(guides).all();
  const slugFor = (id: string) => guideRows.find((guide) => guide.id === id)?.slug ?? null;
  recordEvent(db, userId, "account_exported", {});
  return {
    exportedAt: nowIso(),
    note: "Lumen stores progress and preferences for this browser. It does not store passwords, form answers, or documents.",
    profile: {
      displayName: user.displayName,
      locale: user.locale,
      textScale: user.textScale,
      contrast: user.contrast,
      simpler: user.simpler === 1,
      reducedMotion: user.reducedMotion === 1,
      kind: user.kind,
      createdAt: user.createdAt,
    },
    sessions: ownedSessions.map((session) => ({
      id: session.id,
      guide: slugFor(session.guideId),
      status: session.status,
      lastStepOrdinal: session.lastStepOrdinal,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      completedSteps: steps.filter((step) => step.sessionId === session.id).map((step) => step.ordinal),
    })),
    savedGuides: saved.map((row) => slugFor(row.guideId)),
    feedback: notes.map((row) => ({
      guide: slugFor(row.guideId),
      stepOrdinal: row.stepOrdinal,
      clarityRating: row.clarityRating,
      confusing: row.confusing === 1,
      note: row.note,
      createdAt: row.createdAt,
    })),
  };
}

export function deleteAccount(db: LumenDb, userId: string) {
  const user = db.select().from(users).where(eq(users.id, userId)).get();
  if (!user || user.kind === "deleted") return { ok: false as const, code: "not_found" as const, message: "Nothing to delete for this browser." };
  db.transaction((tx) => {
    const owned = tx.select().from(guideSessions).where(eq(guideSessions.userId, userId)).all();
    for (const session of owned) {
      tx.delete(sessionSteps).where(eq(sessionSteps.sessionId, session.id)).run();
    }
    tx.delete(guideSessions).where(eq(guideSessions.userId, userId)).run();
    tx.delete(savedGuides).where(eq(savedGuides.userId, userId)).run();
    tx.delete(feedback).where(eq(feedback.userId, userId)).run();
    tx.delete(metricEvents).where(eq(metricEvents.userId, userId)).run();
    tx.delete(securityEvents).where(eq(securityEvents.userId, userId)).run();
    tx.delete(sessions).where(eq(sessions.userId, userId)).run();
    tx.delete(users).where(eq(users.id, userId)).run();
  });
  return { ok: true as const };
}
