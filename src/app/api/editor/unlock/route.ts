import { ensureUser } from "@/lib/auth/session";
import { unlockEditor } from "@/lib/auth/users";
import { finish, readPayload, rejectOrigin, safeReturn } from "@/lib/api";
import { getDb } from "@/lib/db/client";
import { clientIp } from "@/lib/http";
import { logFailure } from "@/lib/observability";
import { LIMITS, consumeRateLimit } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const blocked = rejectOrigin(request, "/editor");
  if (blocked) return blocked;
  try {
    const payload = await readPayload(request);
    const redirectTo = safeReturn(payload.returnTo, "/editor");
    const db = getDb();
    if (!consumeRateLimit(db, `editor:${clientIp(request)}`, LIMITS.editor.limit, LIMITS.editor.windowMs)) {
      return finish(request, 429, { ok: false, error: { code: "rate", message: "Too many tries." }, redirectTo }, redirectTo);
    }
    const identity = await ensureUser(db, request);
    if (!identity.ok) {
      return finish(request, 500, { ok: false, error: { code: "generic", message: identity.message }, redirectTo }, redirectTo);
    }
    const unlocked = unlockEditor(db, identity.user.id, payload.code ?? "");
    if (!unlocked.ok) {
      return finish(request, 403, { ok: false, error: { code: unlocked.code, message: unlocked.message }, redirectTo }, redirectTo);
    }
    return finish(request, 200, { ok: true, notice: "unlocked", redirectTo }, redirectTo);
  } catch (error) {
    logFailure({ scope: "editor", code: "unexpected", detail: error instanceof Error ? error.name : "error" });
    return finish(request, 500, { ok: false, error: { code: "generic", message: "Lumen could not open the desk." } }, "/editor");
  }
}
