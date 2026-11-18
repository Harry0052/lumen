import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { recordEvent } from "@/lib/audit";
import type { LumenDb } from "@/lib/db/client";
import { glossaryTerms, guideSteps, guideVersions, guides } from "@/lib/db/schema";
import { glossaryForVersion, latestVersion, stepsForVersion, versionsForGuide } from "@/lib/guides/catalog";
import { addDays, nowIso } from "@/lib/time";
import { cleanText, httpsUrl, slugify } from "@/lib/text";

const TOPICS = new Set(["accounts", "safety", "devices"]);

export type StepDraft = {
  heading: string;
  explanation: string;
  simpler: string;
  example: string;
  caution: string;
};

export type DraftInput = {
  title: string;
  summary: string;
  simplerSummary: string;
  sourceUrl: string;
  sourceTitle: string;
  topic: string;
  steps: StepDraft[];
};

function requireEditor(kind: string) {
  if (kind !== "editor") {
    return { ok: false as const, code: "forbidden" as const, message: "The editor desk is locked for this browser." };
  }
  return null;
}

function validateDraft(input: DraftInput) {
  const title = cleanText(input.title, 120);
  const summary = cleanText(input.summary, 500);
  const simplerSummary = cleanText(input.simplerSummary, 240);
  const sourceTitle = cleanText(input.sourceTitle, 160);
  const source = httpsUrl(input.sourceUrl);
  if (title.length < 3) return { ok: false as const, code: "invalid" as const, message: "Add a title of at least 3 characters." };
  if (summary.length < 10) return { ok: false as const, code: "invalid" as const, message: "Add a summary of at least 10 characters." };
  if (!source) return { ok: false as const, code: "url" as const, message: "The source must be an https link." };
  if (sourceTitle.length < 3) return { ok: false as const, code: "invalid" as const, message: "Name the source page." };
  if (!TOPICS.has(input.topic)) return { ok: false as const, code: "invalid" as const, message: "Choose accounts, safety, or devices." };
  if (input.steps.length < 1 || input.steps.length > 8) {
    return { ok: false as const, code: "invalid" as const, message: "A guide needs 1 to 8 steps." };
  }
  const steps = input.steps.map((step) => ({
    heading: cleanText(step.heading, 120),
    explanation: cleanText(step.explanation, 800),
    simpler: cleanText(step.simpler, 400),
    example: cleanText(step.example, 400),
    caution: cleanText(step.caution, 400),
  }));
  for (const step of steps) {
    if (step.heading.length < 2 || step.explanation.length < 10) {
      return { ok: false as const, code: "invalid" as const, message: "Each step needs a heading and an explanation." };
    }
  }
  return { ok: true as const, title, summary, simplerSummary, source, sourceTitle, topic: input.topic, steps };
}

function uniqueSlug(db: LumenDb, base: string) {
  let slug = slugify(base);
  let n = 2;
  while (db.select().from(guides).where(eq(guides.slug, slug)).get()) {
    slug = `${slugify(base).slice(0, 40)}-${n}`;
    n += 1;
  }
  return slug;
}

export function createDraftGuide(
  db: LumenDb,
  user: { id: string; kind: string },
  input: { title: string; topic: string; sourceUrl: string; sourceTitle: string },
) {
  const denied = requireEditor(user.kind);
  if (denied) return denied;
  const title = cleanText(input.title, 120);
  const source = httpsUrl(input.sourceUrl);
  const sourceTitle = cleanText(input.sourceTitle, 160);
  if (title.length < 3 || !source || sourceTitle.length < 3 || !TOPICS.has(input.topic)) {
    return { ok: false as const, code: "invalid" as const, message: "Title, https source, source name, and topic are required." };
  }
  const now = nowIso();
  const guideId = randomUUID();
  const versionId = randomUUID();
  const slug = uniqueSlug(db, title);
  db.transaction((tx) => {
    tx.insert(guides)
      .values({
        id: guideId,
        slug,
        topic: input.topic,
        sourceUrl: source,
        sourceTitle,
        status: "draft",
        reviewedAt: null,
        reviewDueAt: null,
        isDemo: 0,
        createdAt: now,
        updatedAt: now,
      })
      .run();
    tx.insert(guideVersions)
      .values({
        id: versionId,
        guideId,
        locale: "en",
        version: 1,
        status: "draft",
        title,
        summary: "Replace this summary before review. Lumen does not submit forms or sign in for anyone.",
        simplerSummary: null,
        translationNote: null,
        reviewedAt: null,
        createdAt: now,
      })
      .run();
    tx.insert(guideSteps)
      .values({
        id: randomUUID(),
        versionId,
        ordinal: 1,
        heading: "First step",
        explanation: "Replace this explanation with the plain-language step a person should take.",
        simplerExplanation: null,
        example: null,
        caution: "Lumen does not complete this step for the reader.",
      })
      .run();
  });
  recordEvent(db, user.id, "guide_created", { slug });
  return { ok: true as const, id: guideId, slug };
}

export function saveDraft(db: LumenDb, user: { id: string; kind: string }, guideId: string, locale: "en" | "es", input: DraftInput) {
  const denied = requireEditor(user.kind);
  if (denied) return denied;
  const guide = db.select().from(guides).where(eq(guides.id, guideId)).get();
  if (!guide || guide.status === "archived") {
    return { ok: false as const, code: "not_found" as const, message: "That guide is not on this server." };
  }
  const parsed = validateDraft(input);
  if (!parsed.ok) return parsed;
  const versions = versionsForGuide(db, guideId);
  const latest = latestVersion(versions, guideId, locale, "any");
  const glossaryCopy = latest ? glossaryForVersion(db, latest.id) : [];
  const now = nowIso();

  const writeSteps = (tx: LumenDb, versionId: string, steps: DraftInput["steps"]) => {
    tx.delete(guideSteps).where(eq(guideSteps.versionId, versionId)).run();
    steps.forEach((step, index) => {
      tx.insert(guideSteps)
        .values({
          id: randomUUID(),
          versionId,
          ordinal: index + 1,
          heading: step.heading,
          explanation: step.explanation,
          simplerExplanation: step.simpler || null,
          example: step.example || null,
          caution: step.caution || null,
        })
        .run();
    });
  };

  let versionId = latest?.id ?? "";
  db.transaction((tx) => {
    tx.update(guides)
      .set({
        topic: parsed.topic,
        sourceUrl: parsed.source,
        sourceTitle: parsed.sourceTitle,
        updatedAt: now,
      })
      .where(eq(guides.id, guideId))
      .run();

    if (!latest || latest.status === "reviewed") {
      versionId = randomUUID();
      const nextNumber = (latest?.version ?? 0) + 1;
      tx.insert(guideVersions)
        .values({
          id: versionId,
          guideId,
          locale,
          version: nextNumber,
          status: "draft",
          title: parsed.title,
          summary: parsed.summary,
          simplerSummary: parsed.simplerSummary || null,
          translationNote: latest?.translationNote ?? (locale === "es" ? "Sample Spanish edited on this server." : null),
          reviewedAt: null,
          createdAt: now,
        })
        .run();
      writeSteps(tx, versionId, parsed.steps);
      for (const term of glossaryCopy) {
        tx.insert(glossaryTerms)
          .values({ id: randomUUID(), versionId, term: term.term, definition: term.definition })
          .run();
      }
    } else {
      versionId = latest.id;
      tx.update(guideVersions)
        .set({
          title: parsed.title,
          summary: parsed.summary,
          simplerSummary: parsed.simplerSummary || null,
          status: "draft",
        })
        .where(eq(guideVersions.id, latest.id))
        .run();
      writeSteps(tx, latest.id, parsed.steps);
    }
  });

  recordEvent(db, user.id, "guide_draft_saved", { slug: guide.slug, locale });
  return { ok: true as const, versionId };
}

export function markReviewed(
  db: LumenDb,
  user: { id: string; kind: string },
  guideId: string,
  locale: "en" | "es",
  checkedSource: boolean,
) {
  const denied = requireEditor(user.kind);
  if (denied) return denied;
  if (!checkedSource) {
    return {
      ok: false as const,
      code: "review" as const,
      message: "Confirm that you looked at the source page before marking this reviewed.",
    };
  }
  const guide = db.select().from(guides).where(eq(guides.id, guideId)).get();
  if (!guide) return { ok: false as const, code: "not_found" as const, message: "That guide is not on this server." };
  const latest = latestVersion(versionsForGuide(db, guideId), guideId, locale, "any");
  if (!latest) return { ok: false as const, code: "invalid" as const, message: "There is no version in that language." };
  const steps = stepsForVersion(db, latest.id);
  if (latest.title.trim().length < 3 || latest.summary.trim().length < 10 || steps.length < 1) {
    return { ok: false as const, code: "review" as const, message: "A reviewed guide needs a title, a summary, and a step." };
  }
  if (steps.some((step) => step.heading.trim().length < 2 || step.explanation.trim().length < 20)) {
    return { ok: false as const, code: "review" as const, message: "Each step needs a real explanation before review." };
  }
  if (steps.some((step) => step.explanation.startsWith("Replace this"))) {
    return { ok: false as const, code: "review" as const, message: "Replace the placeholder step before review." };
  }
  const source = httpsUrl(guide.sourceUrl);
  if (!source) return { ok: false as const, code: "url" as const, message: "The source must be an https link." };

  const now = nowIso();
  const due = addDays(now, 180);
  db.transaction((tx) => {
    tx.update(guideVersions)
      .set({ status: "reviewed", reviewedAt: now })
      .where(and(eq(guideVersions.id, latest.id), eq(guideVersions.status, "draft")))
      .run();
    if (latest.status === "reviewed") {
      tx.update(guideVersions).set({ reviewedAt: now }).where(eq(guideVersions.id, latest.id)).run();
    }
    tx.update(guides)
      .set({ status: "verified", reviewedAt: now, reviewDueAt: due, updatedAt: now })
      .where(eq(guides.id, guideId))
      .run();
  });
  recordEvent(db, user.id, "guide_reviewed", { slug: guide.slug, locale });
  return { ok: true as const, reviewDueAt: due };
}
