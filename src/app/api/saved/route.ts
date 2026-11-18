import { recordEvent } from "@/lib/audit";
import { ensureUser } from "@/lib/auth/session";
import { finish, readPayload, rejectOrigin, safeReturn } from "@/lib/api";
import { getDb } from "@/lib/db/client";
import { getGuideBySlug, toggleSaved } from "@/lib/guides/catalog";
import { logFailure } from "@/lib/observability";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const blocked = rejectOrigin(request, "/saved");
  if (blocked) return blocked;
  try {
    const payload = await readPayload(request);
    const redirectTo = safeReturn(payload.returnTo, "/saved");
    const db = getDb();
    const identity = await ensureUser(db, request);
    if (!identity.ok) {
      return finish(request, 500, { ok: false, error: { code: "generic", message: identity.message }, redirectTo }, redirectTo);
    }
    const guide = getGuideBySlug(db, payload.slug ?? "");
    if (!guide) {
      return finish(request, 404, { ok: false, error: { code: "not_found", message: "That guide is not on the public list." }, redirectTo }, redirectTo);
    }
    const saved = toggleSaved(db, identity.user.id, guide.id);
    if (!saved.ok) {
      return finish(request, 404, { ok: false, error: { code: saved.code, message: saved.message }, redirectTo }, redirectTo);
    }
    recordEvent(db, identity.user.id, saved.saved ? "guide_saved" : "guide_unsaved", { slug: guide.slug });
    return finish(request, 200, { ok: true, notice: "saved", redirectTo, saved: saved.saved } as never, redirectTo);
  } catch (error) {
    logFailure({ scope: "saved", code: "unexpected", detail: error instanceof Error ? error.name : "error" });
    return finish(request, 500, { ok: false, error: { code: "generic", message: "Lumen could not save that guide." } }, "/saved");
  }
}
