import { randomUUID } from "node:crypto";
import { and, desc, eq, inArray } from "drizzle-orm";
import type { LumenDb } from "@/lib/db/client";
import { glossaryTerms, guideSteps, guideVersions, guides, savedGuides } from "@/lib/db/schema";
import { isPast } from "@/lib/time";

export type Freshness = "current" | "stale" | "unverified" | "draft";

export type GuideRow = typeof guides.$inferSelect;
export type VersionRow = typeof guideVersions.$inferSelect;
export type StepRow = typeof guideSteps.$inferSelect;

export function freshnessOf(guide: Pick<GuideRow, "status" | "reviewedAt" | "reviewDueAt">, now = new Date()): Freshness {
  if (guide.status === "draft" || guide.status === "archived") return "draft";
  if (guide.status === "unverified") return "unverified";
  if (!guide.reviewedAt || !guide.reviewDueAt || isPast(guide.reviewDueAt, now)) return "stale";
  return "current";
}

export function normalizeQuery(q: string | undefined) {
  return (q ?? "").trim().toLowerCase().slice(0, 80);
}

export function textMatches(haystack: string, query: string) {
  if (!query) return true;
  return haystack.toLowerCase().includes(query);
}

export function latestVersion(versions: VersionRow[], guideId: string, locale: string, status: "reviewed" | "draft" | "any") {
  return versions
    .filter((version) => {
      if (version.guideId !== guideId) return false;
      if (version.locale !== locale) return false;
      if (status === "any") return true;
      return version.status === status;
    })
    .sort((a, b) => b.version - a.version)[0] ?? null;
}

export function resolveReviewed(versions: VersionRow[], guideId: string, locale: string) {
  const exact = latestVersion(versions, guideId, locale, "reviewed");
  if (exact) return { version: exact, fallback: false as const };
  if (locale !== "en") {
    const english = latestVersion(versions, guideId, "en", "reviewed");
    if (english) return { version: english, fallback: true as const };
  }
  return { version: null, fallback: locale !== "en" };
}

export type GuideCard = {
  id: string;
  slug: string;
  topic: string;
  sourceUrl: string;
  sourceTitle: string;
  status: string;
  reviewedAt: string | null;
  reviewDueAt: string | null;
  isDemo: boolean;
  freshness: Freshness;
  title: string;
  summary: string;
  simplerSummary: string | null;
  localeUsed: string;
  fallback: boolean;
  translationNote: string | null;
  stepCount: number;
};

function loadVersions(db: LumenDb) {
  return db.select().from(guideVersions).all();
}

function loadSteps(db: LumenDb) {
  return db.select().from(guideSteps).all();
}

export function listPublicGuides(
  db: LumenDb,
  input: { locale: string; topic?: string; q?: string },
  now = new Date(),
): GuideCard[] {
  const query = normalizeQuery(input.q);
  const topic = input.topic?.trim().toLowerCase() ?? "";
  const publicGuides = db
    .select()
    .from(guides)
    .where(inArray(guides.status, ["verified", "unverified"]))
    .all();
  const versions = loadVersions(db);
  const steps = loadSteps(db);

  const cards: GuideCard[] = [];
  for (const guide of publicGuides) {
    if (topic && guide.topic !== topic) continue;
    const resolved = resolveReviewed(versions, guide.id, input.locale);
    if (!resolved.version) continue;
    const versionSteps = steps.filter((step) => step.versionId === resolved.version?.id);
    const blob = [
      guide.slug,
      guide.topic,
      guide.sourceTitle,
      resolved.version.title,
      resolved.version.summary,
      resolved.version.simplerSummary ?? "",
      ...versionSteps.map((step) => `${step.heading} ${step.explanation}`),
    ].join("\n");
    if (!textMatches(blob, query)) continue;
    cards.push(toCard(guide, resolved.version, resolved.fallback, versionSteps.length, now));
  }

  return cards.sort((a, b) => a.title.localeCompare(b.title));
}

function toCard(guide: GuideRow, version: VersionRow, fallback: boolean, stepCount: number, now: Date): GuideCard {
  return {
    id: guide.id,
    slug: guide.slug,
    topic: guide.topic,
    sourceUrl: guide.sourceUrl,
    sourceTitle: guide.sourceTitle,
    status: guide.status,
    reviewedAt: guide.reviewedAt,
    reviewDueAt: guide.reviewDueAt,
    isDemo: guide.isDemo === 1,
    freshness: freshnessOf(guide, now),
    title: version.title,
    summary: version.summary,
    simplerSummary: version.simplerSummary,
    localeUsed: version.locale,
    fallback,
    translationNote: version.translationNote,
    stepCount,
  };
}

export function getPublicGuide(db: LumenDb, slug: string, locale: string, now = new Date()) {
  const guide = db.select().from(guides).where(eq(guides.slug, slug)).get();
  if (!guide || (guide.status !== "verified" && guide.status !== "unverified")) return null;
  const versions = db.select().from(guideVersions).where(eq(guideVersions.guideId, guide.id)).all();
  const resolved = resolveReviewed(versions, guide.id, locale);
  if (!resolved.version) return null;
  const steps = db
    .select()
    .from(guideSteps)
    .where(eq(guideSteps.versionId, resolved.version.id))
    .all()
    .sort((a, b) => a.ordinal - b.ordinal);
  const glossary = db.select().from(glossaryTerms).where(eq(glossaryTerms.versionId, resolved.version.id)).all();
  return {
    guide,
    card: toCard(guide, resolved.version, resolved.fallback, steps.length, now),
    version: resolved.version,
    steps,
    glossary,
  };
}

export function getGuideBySlug(db: LumenDb, slug: string) {
  return db.select().from(guides).where(eq(guides.slug, slug)).get() ?? null;
}

export function getGuideById(db: LumenDb, id: string) {
  return db.select().from(guides).where(eq(guides.id, id)).get() ?? null;
}

export function isSaved(db: LumenDb, userId: string, guideId: string) {
  return Boolean(
    db
      .select()
      .from(savedGuides)
      .where(and(eq(savedGuides.userId, userId), eq(savedGuides.guideId, guideId)))
      .get(),
  );
}

export function listSaved(db: LumenDb, userId: string, locale: string) {
  const rows = db.select().from(savedGuides).where(eq(savedGuides.userId, userId)).all();
  const cards = listPublicGuides(db, { locale });
  const ids = new Set(rows.map((row) => row.guideId));
  return cards.filter((card) => ids.has(card.id));
}

export function toggleSaved(db: LumenDb, userId: string, guideId: string) {
  const guide = getGuideById(db, guideId);
  if (!guide || (guide.status !== "verified" && guide.status !== "unverified")) {
    return { ok: false as const, code: "not_found" as const, message: "That guide is not on the public list." };
  }
  const existing = db
    .select()
    .from(savedGuides)
    .where(and(eq(savedGuides.userId, userId), eq(savedGuides.guideId, guideId)))
    .get();
  if (existing) {
    db.delete(savedGuides).where(eq(savedGuides.id, existing.id)).run();
    return { ok: true as const, saved: false };
  }
  db.insert(savedGuides)
    .values({ id: randomUUID(), userId, guideId, createdAt: new Date().toISOString() })
    .run();
  return { ok: true as const, saved: true };
}

export function editorGuideList(db: LumenDb) {
  return db.select().from(guides).orderBy(desc(guides.updatedAt)).all();
}

export function versionsForGuide(db: LumenDb, guideId: string) {
  return db.select().from(guideVersions).where(eq(guideVersions.guideId, guideId)).all();
}

export function stepsForVersion(db: LumenDb, versionId: string) {
  return db
    .select()
    .from(guideSteps)
    .where(eq(guideSteps.versionId, versionId))
    .all()
    .sort((a, b) => a.ordinal - b.ordinal);
}

export function glossaryForVersion(db: LumenDb, versionId: string) {
  return db.select().from(glossaryTerms).where(eq(glossaryTerms.versionId, versionId)).all();
}
