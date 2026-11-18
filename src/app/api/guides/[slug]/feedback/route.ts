import { readSessionUser } from "@/lib/auth/session";
import { finish, readPayload, rejectOrigin, safeReturn } from "@/lib/api";
import { getDb } from "@/lib/db/client";
import { addFeedback } from "@/lib/feedback/feedback";
import { logFailure } from "@/lib/observability";
import { LIMITS, consumeRateLimit } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const fallback = `/guides/${slug}`;
  const blocked = rejectOrigin(request, fallback);
  if (blocked) return blocked;
  try {
    const payload = await readPayload(request);
    const redirectTo = safeReturn(payload.returnTo, fallback);
    const db = getDb();
    const user = await readSessionUser(db);
    if (!user) {
      return finish(request, 401, { ok: false, error: { code: "forbidden", message: "Start the guide in this browser first." }, redirectTo }, redirectTo);
    }
    if (!consumeRateLimit(db, `feedback:${user.id}`, LIMITS.feedback.limit, LIMITS.feedback.windowMs)) {
      return finish(request, 429, { ok: false, error: { code: "rate", message: "Too many notes." }, redirectTo }, redirectTo);
    }
    const rating = payload.clarityRating ? Number(payload.clarityRating) : null;
    const ordinal = payload.stepOrdinal ? Number(payload.stepOrdinal) : null;
    const saved = addFeedback(db, user.id, slug, {
      clarityRating: rating,
      stepOrdinal: ordinal,
      confusing: payload.confusing === "1" || payload.confusing === "true",
      note: payload.note ?? "",
    });
    if (!saved.ok) {
      return finish(request, 400, { ok: false, error: { code: saved.code, message: saved.message }, redirectTo }, redirectTo);
    }
    return finish(request, 200, { ok: true, notice: "feedback", redirectTo }, redirectTo);
  } catch (error) {
    logFailure({ scope: "feedback", code: "unexpected", detail: error instanceof Error ? error.name : "error" });
    return finish(request, 500, { ok: false, error: { code: "generic", message: "Lumen could not save that note." } }, fallback);
  }
}
