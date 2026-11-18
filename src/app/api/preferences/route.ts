import { ensureUser } from "@/lib/auth/session";
import { updateDisplayName, updatePreferences, type PreferencePatch } from "@/lib/auth/users";
import { asLocale, finish, readPayload, rejectOrigin, safeReturn } from "@/lib/api";
import { getDb } from "@/lib/db/client";
import { LIMITS, consumeRateLimit } from "@/lib/security/rate-limit";
import { alignLatestSession } from "@/lib/sessions/progress";
import { logFailure } from "@/lib/observability";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const blocked = rejectOrigin(request, "/");
  if (blocked) return blocked;
  try {
    const payload = await readPayload(request);
    const fallback = safeReturn(payload.returnTo, "/");
    const db = getDb();
    const identity = await ensureUser(db, request);
    if (!identity.ok) {
      return finish(request, 500, { ok: false, error: { code: "generic", message: identity.message } }, fallback);
    }
    if (!consumeRateLimit(db, `prefs:${identity.user.id}`, LIMITS.preferences.limit, LIMITS.preferences.windowMs)) {
      return finish(request, 429, { ok: false, error: { code: "rate", message: "Too many tries." }, redirectTo: fallback }, fallback);
    }

    if (payload.displayName !== undefined && payload.intent === "name") {
      const named = updateDisplayName(db, identity.user.id, payload.displayName);
      if (!named.ok) {
        return finish(request, 400, { ok: false, error: { code: named.code, message: named.message }, redirectTo: fallback }, fallback);
      }
      return finish(request, 200, { ok: true, notice: "name", redirectTo: fallback }, fallback);
    }

    const patch: PreferencePatch = {};
    const locale = asLocale(payload.locale);
    if (payload.locale) {
      if (!locale) {
        return finish(request, 400, { ok: false, error: { code: "invalid", message: "Choose English or Spanish." }, redirectTo: fallback }, fallback);
      }
      patch.locale = locale;
    }
    if (payload.textScale === "1" || payload.textScale === "1.15" || payload.textScale === "1.3") patch.textScale = payload.textScale;
    if (payload.contrast === "standard" || payload.contrast === "high") patch.contrast = payload.contrast;
    if (payload.simpler === "0" || payload.simpler === "1") patch.simpler = payload.simpler === "1";
    if (payload.reducedMotion === "0" || payload.reducedMotion === "1") patch.reducedMotion = payload.reducedMotion === "1";
    if (Object.keys(patch).length === 0) {
      return finish(request, 400, { ok: false, error: { code: "invalid", message: "Choose a setting to save." }, redirectTo: fallback }, fallback);
    }
    const saved = updatePreferences(db, identity.user.id, patch);
    if (!saved.ok) {
      return finish(request, 400, { ok: false, error: { code: saved.code, message: saved.message }, redirectTo: fallback }, fallback);
    }
    if (payload.guideSlug && patch.locale) {
      alignLatestSession(db, identity.user.id, payload.guideSlug, patch.locale);
    }
    return finish(request, 200, { ok: true, notice: "settings", redirectTo: fallback }, fallback);
  } catch (error) {
    logFailure({ scope: "preferences", code: "unexpected", detail: error instanceof Error ? error.name : "error" });
    return finish(request, 500, { ok: false, error: { code: "generic", message: "Lumen could not save that." } }, "/");
  }
}
