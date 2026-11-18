import { describe, expect, it } from "vitest";
import { createGuest, unlockEditor } from "@/lib/auth/users";
import { createTestDb } from "@/lib/db/client";
import { seedDemo } from "@/lib/db/seed";
import { guides } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getPublicGuide } from "@/lib/guides/catalog";
import { createDraftGuide, markReviewed, saveDraft } from "@/lib/guides/editor";

describe("editor review state", () => {
  it("keeps an unreviewed draft off the public list", () => {
    const db = createTestDb();
    seedDemo(db);
    const guest = createGuest(db);
    if (!guest.ok) throw new Error("guest");
    expect(unlockEditor(db, guest.user.id, "nope").ok).toBe(false);
    const editor = unlockEditor(db, guest.user.id, "local-desk");
    expect(editor.ok).toBe(true);
    if (!editor.ok) return;

    const created = createDraftGuide(db, editor.user, {
      title: "A new plain guide",
      topic: "devices",
      sourceUrl: "https://www.cisa.gov/secure-our-world/update-software",
      sourceTitle: "CISA — Update software",
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    expect(getPublicGuide(db, created.slug, "en")).toBeNull();

    const tooSoon = markReviewed(db, editor.user, created.id, "en", true);
    expect(tooSoon.ok).toBe(false);

    const guide = db.select().from(guides).where(eq(guides.id, created.id)).get();
    expect(guide?.status).toBe("draft");
  });

  it("does not replace a reviewed public guide with an unsaved draft", () => {
    const db = createTestDb();
    seedDemo(db);
    const guest = createGuest(db);
    if (!guest.ok) throw new Error("guest");
    const editor = unlockEditor(db, guest.user.id, "local-desk");
    if (!editor.ok) throw new Error("editor");
    const before = getPublicGuide(db, "stronger-password", "en");
    expect(before?.version.title).toMatch(/hard to guess/);
    const saved = saveDraft(db, editor.user, before!.guide.id, "en", {
      title: "Unreviewed replacement title",
      summary: "This draft should not replace the reviewed page yet.",
      simplerSummary: "",
      sourceUrl: before!.guide.sourceUrl,
      sourceTitle: before!.guide.sourceTitle,
      topic: "accounts",
      steps: [
        {
          heading: "Draft step",
          explanation: "This explanation is long enough to be a real step, but it is not reviewed.",
          simpler: "",
          example: "",
          caution: "",
        },
      ],
    });
    expect(saved.ok).toBe(true);
    const after = getPublicGuide(db, "stronger-password", "en");
    expect(after?.version.title).toBe(before?.version.title);
    expect(after?.guide.status).toBe("verified");

    const paper = db.select().from(guides).all().find((guide) => guide.slug === "paper-form");
    expect(paper).toBeTruthy();
    const reviewed = markReviewed(db, editor.user, paper!.id, "en", false);
    expect(reviewed.ok).toBe(false);
    const published = markReviewed(db, editor.user, paper!.id, "en", true);
    expect(published.ok).toBe(true);
    const live = getPublicGuide(db, "paper-form", "en");
    expect(live?.guide.status).toBe("verified");
    expect(live?.card.freshness).toBe("current");
  });

  it("refuses a source that is not https", () => {
    const db = createTestDb();
    seedDemo(db);
    const guest = createGuest(db);
    if (!guest.ok) throw new Error("guest");
    const editor = unlockEditor(db, guest.user.id, "local-desk");
    if (!editor.ok) throw new Error("editor");
    const created = createDraftGuide(db, editor.user, {
      title: "Bad link",
      topic: "safety",
      sourceUrl: "javascript:alert(1)",
      sourceTitle: "Not a source",
    });
    expect(created.ok).toBe(false);
  });
});
