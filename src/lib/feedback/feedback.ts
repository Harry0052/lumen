import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { recordEvent } from "@/lib/audit";
import type { LumenDb } from "@/lib/db/client";
import { feedback, guides } from "@/lib/db/schema";
import { cleanText } from "@/lib/text";
import { nowIso } from "@/lib/time";

export function addFeedback(
  db: LumenDb,
  userId: string,
  slug: string,
  input: { stepOrdinal?: number | null; clarityRating?: number | null; confusing: boolean; note: string },
) {
  const guide = db.select().from(guides).where(eq(guides.slug, slug)).get();
  if (!guide || (guide.status !== "verified" && guide.status !== "unverified")) {
    return { ok: false as const, code: "not_found" as const, message: "That guide is not on the public list." };
  }
  const note = cleanText(input.note, 400);
  const rating = input.clarityRating ?? null;
  if (rating !== null && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
    return { ok: false as const, code: "rating" as const, message: "Choose a clarity rating from 1 to 5, or leave it blank." };
  }
  const ordinal = input.stepOrdinal ?? null;
  if (ordinal !== null && (!Number.isInteger(ordinal) || ordinal < 1 || ordinal > 12)) {
    return { ok: false as const, code: "invalid" as const, message: "That step number is not valid." };
  }
  if (!input.confusing && rating === null && note.length === 0) {
    return { ok: false as const, code: "invalid" as const, message: "Add a rating, mark the step confusing, or write a short note." };
  }
  db.insert(feedback)
    .values({
      id: randomUUID(),
      userId,
      guideId: guide.id,
      stepOrdinal: ordinal,
      clarityRating: rating,
      confusing: input.confusing ? 1 : 0,
      note: note || null,
      createdAt: nowIso(),
    })
    .run();
  recordEvent(db, userId, "feedback_saved", {
    slug,
    confusing: input.confusing,
    hasNote: note.length > 0,
    rating: rating ?? 0,
  });
  return { ok: true as const };
}

export function feedbackForGuide(db: LumenDb, guideId: string) {
  const rows = db.select().from(feedback).where(eq(feedback.guideId, guideId)).all();
  return {
    count: rows.length,
    confusing: rows.filter((row) => row.confusing === 1).length,
    notes: rows
      .filter((row) => row.note)
      .map((row) => ({ note: row.note as string, stepOrdinal: row.stepOrdinal, createdAt: row.createdAt })),
  };
}
