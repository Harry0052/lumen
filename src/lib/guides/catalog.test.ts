import { describe, expect, it } from "vitest";
import { createGuest } from "@/lib/auth/users";
import { createTestDb } from "@/lib/db/client";
import { seedDemo } from "@/lib/db/seed";
import { guides } from "@/lib/db/schema";
import { freshnessOf, getPublicGuide, listPublicGuides, toggleSaved } from "@/lib/guides/catalog";

function seeded() {
  const db = createTestDb();
  seedDemo(db);
  return db;
}

describe("catalog", () => {
  it("filters real guide text and hides drafts", () => {
    const db = seeded();
    const password = listPublicGuides(db, { locale: "en", q: "passphrase" });
    expect(password.map((guide) => guide.slug)).toEqual(["stronger-password"]);
    expect(password[0]?.sourceUrl).toContain("https://www.cisa.gov/");
    expect(password[0]?.reviewedAt).toBeTruthy();
    expect(password[0]?.freshness).toBe("current");

    const phishing = listPublicGuides(db, { locale: "en", q: "phishing", topic: "safety" });
    expect(phishing.map((guide) => guide.slug)).toEqual(["check-email"]);

    expect(listPublicGuides(db, { locale: "en", q: "zzzz-not-a-guide" })).toEqual([]);
    expect(listPublicGuides(db, { locale: "en" }).some((guide) => guide.slug === "paper-form")).toBe(false);
    expect(getPublicGuide(db, "paper-form", "en")).toBeNull();
  });

  it("labels a past review date and falls back when Spanish is missing", () => {
    const db = seeded();
    const stale = getPublicGuide(db, "update-software", "en");
    expect(stale?.card.freshness).toBe("stale");
    expect(freshnessOf({ status: "unverified", reviewedAt: null, reviewDueAt: null })).toBe("unverified");
    expect(freshnessOf({ status: "draft", reviewedAt: null, reviewDueAt: null })).toBe("draft");

    const spanish = getPublicGuide(db, "update-software", "es");
    expect(spanish?.card.fallback).toBe(true);
    expect(spanish?.card.localeUsed).toBe("en");
    expect(spanish?.version.title).toMatch(/Install an update/);

    const translated = getPublicGuide(db, "stronger-password", "es");
    expect(translated?.card.fallback).toBe(false);
    expect(translated?.version.locale).toBe("es");
    expect(translated?.version.translationNote).toMatch(/not certified/i);
  });

  it("does not save a draft and only toggles public guides for the owner", () => {
    const db = seeded();
    const guest = createGuest(db);
    expect(guest.ok).toBe(true);
    if (!guest.ok) return;
    const draft = db.select().from(guides).all().find((guide) => guide.slug === "paper-form");
    expect(draft).toBeTruthy();
    if (!draft) return;
    expect(toggleSaved(db, guest.user.id, draft.id).ok).toBe(false);
    const guide = getPublicGuide(db, "check-email", "en");
    expect(guide).toBeTruthy();
    if (!guide) return;
    const saved = toggleSaved(db, guest.user.id, guide.guide.id);
    expect(saved.ok && saved.saved).toBe(true);
    const removed = toggleSaved(db, guest.user.id, guide.guide.id);
    expect(removed.ok && removed.saved).toBe(false);
  });
});
