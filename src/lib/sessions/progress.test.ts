import { describe, expect, it } from "vitest";
import { createGuest } from "@/lib/auth/users";
import { createTestDb } from "@/lib/db/client";
import { seedDemo } from "@/lib/db/seed";
import { securityEvents } from "@/lib/db/schema";
import { alignLatestSession, completedOrdinals, getOwnedSession, moveStep, startGuide } from "@/lib/sessions/progress";

function setup() {
  const db = createTestDb();
  seedDemo(db);
  const first = createGuest(db);
  const second = createGuest(db);
  if (!first.ok || !second.ok) throw new Error("guest");
  return { db, first: first.user, second: second.user };
}

describe("guide progress", () => {
  it("keeps a completed step after it is read again", () => {
    const { db, first } = setup();
    const started = startGuide(db, first.id, "stronger-password", "en");
    expect(started.ok).toBe(true);
    if (!started.ok) return;
    const marked = moveStep(db, first.id, started.sessionId, 1, "complete");
    expect(marked.ok).toBe(true);
    expect(completedOrdinals(db, started.sessionId)).toEqual([1]);
    const again = getOwnedSession(db, first.id, started.sessionId);
    expect(again?.completed).toEqual([1]);
    expect(again?.session.lastStepOrdinal).toBe(1);
  });

  it("rejects another person and treats a repeated Next as the same place", () => {
    const { db, first, second } = setup();
    const started = startGuide(db, first.id, "check-email", "en");
    if (!started.ok) throw new Error("start");
    const moved = moveStep(db, first.id, started.sessionId, 1, "next");
    expect(moved.ok && moved.step).toBe(2);
    const duplicate = moveStep(db, first.id, started.sessionId, 1, "next");
    expect(duplicate.ok && duplicate.duplicate).toBe(true);
    expect(duplicate.ok && duplicate.step).toBe(2);
    const denied = moveStep(db, second.id, started.sessionId, 2, "complete");
    expect(denied.ok).toBe(false);
    if (!denied.ok) expect(denied.code).toBe("not_found");
    expect(getOwnedSession(db, second.id, started.sessionId)).toBeNull();
  });

  it("keeps the step when the language changes and falls back clearly", () => {
    const { db, first } = setup();
    const started = startGuide(db, first.id, "stronger-password", "en");
    if (!started.ok) throw new Error("start");
    moveStep(db, first.id, started.sessionId, 1, "next");
    moveStep(db, first.id, started.sessionId, 2, "complete");
    const aligned = alignLatestSession(db, first.id, "stronger-password", "es");
    expect(aligned?.fallback).toBe(false);
    const owned = getOwnedSession(db, first.id, started.sessionId);
    expect(owned?.session.lastStepOrdinal).toBe(2);
    expect(owned?.completed).toContain(1);
    expect(owned?.completed).toContain(2);

    const software = startGuide(db, first.id, "update-software", "en");
    if (!software.ok) throw new Error("software");
    moveStep(db, first.id, software.sessionId, 1, "next");
    const fallback = alignLatestSession(db, first.id, "update-software", "es");
    expect(fallback?.fallback).toBe(true);
    expect(getOwnedSession(db, first.id, software.sessionId)?.session.lastStepOrdinal).toBe(2);

    const metadata = db.select().from(securityEvents).all().map((row) => row.metadataJson).join("\n");
    expect(metadata).not.toMatch(/tokenHash|"note"/);
  });
});
