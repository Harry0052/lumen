import { eq } from "drizzle-orm";
import { demoGuides } from "@/lib/db/demo-content";
import type { LumenDb } from "@/lib/db/client";
import { glossaryTerms, guideSteps, guideVersions, guides } from "@/lib/db/schema";

const SEEDED_AT = "2026-09-15T15:00:00.000Z";

export function seedDemo(db: LumenDb) {
  const existing = db.select().from(guides).where(eq(guides.slug, "stronger-password")).get();
  if (existing) return;

  db.transaction((tx) => {
    for (const guide of demoGuides) {
      const guideId = `guide_${guide.slug}`;
      tx.insert(guides)
        .values({
          id: guideId,
          slug: guide.slug,
          topic: guide.topic,
          sourceUrl: guide.sourceUrl,
          sourceTitle: guide.sourceTitle,
          status: guide.status,
          reviewedAt: guide.reviewedAt,
          reviewDueAt: guide.reviewDueAt,
          isDemo: 1,
          createdAt: SEEDED_AT,
          updatedAt: SEEDED_AT,
        })
        .run();

      for (const version of guide.versions) {
        const versionId = `${guideId}_${version.locale}`;
        const reviewed = guide.status !== "draft";
        tx.insert(guideVersions)
          .values({
            id: versionId,
            guideId,
            locale: version.locale,
            version: 1,
            status: reviewed ? "reviewed" : "draft",
            title: version.title,
            summary: version.summary,
            simplerSummary: version.simplerSummary,
            translationNote: version.translationNote,
            reviewedAt: reviewed ? guide.reviewedAt : null,
            createdAt: SEEDED_AT,
          })
          .run();

        version.steps.forEach((step, index) => {
          tx.insert(guideSteps)
            .values({
              id: `${versionId}_s${index + 1}`,
              versionId,
              ordinal: index + 1,
              heading: step.heading,
              explanation: step.explanation,
              simplerExplanation: step.simpler,
              example: step.example,
              caution: step.caution,
            })
            .run();
        });

        version.glossary.forEach((term, index) => {
          tx.insert(glossaryTerms)
            .values({
              id: `${versionId}_g${index + 1}`,
              versionId,
              term: term.term,
              definition: term.definition,
            })
            .run();
        });
      }
    }
  });
}
