import { describe, expect, it } from "vitest";
import { createGuest, updateDisplayName } from "@/lib/auth/users";
import { createTestDb } from "@/lib/db/client";
import { seedDemo } from "@/lib/db/seed";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { addFeedback } from "@/lib/feedback/feedback";
import { completionStats, deleteAccount, exportAccount } from "@/lib/account/account";
import { moveStep, startGuide } from "@/lib/sessions/progress";

describe("account privacy", () => {
  it("exports one person and deletes only that person", () => {
    const db = createTestDb();
    seedDemo(db);
    const first = createGuest(db);
    const second = createGuest(db);
    if (!first.ok || !second.ok) throw new Error("guest");
    updateDisplayName(db, first.user.id, "Mina Chen");
    const started = startGuide(db, first.user.id, "check-email", "en");
    if (!started.ok) throw new Error("start");
    moveStep(db, first.user.id, started.sessionId, 1, "next");
    moveStep(db, first.user.id, started.sessionId, 2, "next");
    moveStep(db, first.user.id, started.sessionId, 3, "next");
    const done = moveStep(db, first.user.id, started.sessionId, 4, "next");
    expect(done.ok && done.status).toBe("completed");
    addFeedback(db, first.user.id, "check-email", { confusing: true, note: "The sender part was fuzzy.", clarityRating: 4, stepOrdinal: 2 });

    const exported = exportAccount(db, first.user.id);
    expect(JSON.stringify(exported)).not.toMatch(/tokenHash/);
    expect(exported?.profile).not.toHaveProperty("password");
    expect(exported?.profile.displayName).toBe("Mina Chen");
    expect(exported?.sessions).toHaveLength(1);
    expect(exported?.feedback[0]?.note).toMatch(/fuzzy/);
    expect(exportAccount(db, second.user.id)?.sessions).toEqual([]);

    const stats = completionStats(db, first.user.id);
    expect(stats.completed).toBe(1);
    expect(stats.percent).toBe(100);

    expect(deleteAccount(db, first.user.id).ok).toBe(true);
    expect(db.select().from(users).where(eq(users.id, first.user.id)).get()).toBeUndefined();
    expect(db.select().from(users).where(eq(users.id, second.user.id)).get()).toBeTruthy();
    expect(exportAccount(db, second.user.id)?.profile.displayName).toBe("");
  });

  it("rejects an email address as a display name and a rating outside 1 to 5", () => {
    const db = createTestDb();
    seedDemo(db);
    const guest = createGuest(db);
    if (!guest.ok) throw new Error("guest");
    expect(updateDisplayName(db, guest.user.id, "a@example.com").ok).toBe(false);
    expect(addFeedback(db, guest.user.id, "check-email", { confusing: false, note: "", clarityRating: 9 }).ok).toBe(false);
    expect(addFeedback(db, guest.user.id, "paper-form", { confusing: true, note: "hidden", clarityRating: null }).ok).toBe(false);
  });
});
