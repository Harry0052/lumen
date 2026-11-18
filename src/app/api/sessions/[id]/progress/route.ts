import { recordEvent } from "@/lib/audit";
import { readSessionUser } from "@/lib/auth/session";
import { finish, readPayload, rejectOrigin } from "@/lib/api";
import { getDb } from "@/lib/db/client";
import { logFailure } from "@/lib/observability";
import { LIMITS, consumeRateLimit } from "@/lib/security/rate-limit";
import { moveStep, type ProgressIntent } from "@/lib/sessions/progress";

export const dynamic = "force-dynamic";

function intentOf(value: string | undefined): ProgressIntent | null {
  if (value === "back" || value === "next" || value === "complete" || value === "undo") return value;
  return null;
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  return update(request, context);
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  return update(request, context);
}

async function update(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const fallback = "/progress";
  const blocked = rejectOrigin(request, fallback);
  if (blocked) return blocked;
  try {
    const payload = await readPayload(request);
    const db = getDb();
    const user = await readSessionUser(db);
    if (!user) {
      return finish(request, 401, { ok: false, error: { code: "forbidden", message: "This browser has no Lumen session." } }, fallback);
    }
    if (!consumeRateLimit(db, `progress:${user.id}`, LIMITS.session.limit, LIMITS.session.windowMs)) {
      return finish(request, 429, { ok: false, error: { code: "rate", message: "Too many tries." } }, fallback);
    }
    const intent = intentOf(payload.intent);
    const ordinal = Number(payload.ordinal);
    if (!intent) {
      return finish(request, 400, { ok: false, error: { code: "invalid", message: "Choose Back, Next, or done." } }, fallback);
    }
    const moved = moveStep(db, user.id, id, ordinal, intent);
    if (!moved.ok) {
      const status = moved.code === "not_found" ? 404 : 400;
      return finish(request, status, { ok: false, error: { code: moved.code, message: moved.message } }, fallback);
    }
    recordEvent(db, user.id, "step_updated", { intent, ordinal, status: moved.status, duplicate: moved.duplicate });
    let redirectTo =
      moved.status === "completed" && intent === "next"
        ? `/guides/${moved.slug}/done?session=${id}`
        : `/guides/${moved.slug}?step=${moved.step}`;
    if (intent === "complete" || intent === "undo") {
      redirectTo += redirectTo.includes("?") ? "&notice=saved" : "?notice=saved";
    }
    return finish(request, 200, { ok: true, redirectTo }, redirectTo);
  } catch (error) {
    logFailure({ scope: "progress", code: "unexpected", detail: error instanceof Error ? error.name : "error" });
    return finish(request, 500, { ok: false, error: { code: "generic", message: "Lumen could not save that step." } }, fallback);
  }
}
