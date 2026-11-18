import { clearSessionCookie, readSessionUser } from "@/lib/auth/session";
import { deleteAccount } from "@/lib/account/account";
import { finish, readPayload, rejectOrigin } from "@/lib/api";
import { getDb } from "@/lib/db/client";
import { logFailure } from "@/lib/observability";
import { LIMITS, consumeRateLimit } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const blocked = rejectOrigin(request, "/account");
  if (blocked) return blocked;
  try {
    const payload = await readPayload(request);
    const db = getDb();
    const user = await readSessionUser(db);
    if (!user) {
      return finish(request, 401, { ok: false, error: { code: "forbidden", message: "This browser has no Lumen session." }, redirectTo: "/account" }, "/account");
    }
    if (!consumeRateLimit(db, `delete:${user.id}`, LIMITS.account.limit, LIMITS.account.windowMs)) {
      return finish(request, 429, { ok: false, error: { code: "rate", message: "Too many tries." }, redirectTo: "/account" }, "/account");
    }
    if (payload.confirm !== "DELETE") {
      return finish(request, 400, { ok: false, error: { code: "invalid", message: "Type DELETE to confirm." }, redirectTo: "/account" }, "/account");
    }
    const removed = deleteAccount(db, user.id);
    if (!removed.ok) {
      return finish(request, 404, { ok: false, error: { code: removed.code, message: removed.message }, redirectTo: "/account" }, "/account");
    }
    await clearSessionCookie(request);
    return finish(request, 200, { ok: true, notice: "deleted", redirectTo: "/?notice=deleted" }, "/");
  } catch (error) {
    logFailure({ scope: "account", code: "unexpected", detail: error instanceof Error ? error.name : "error" });
    return finish(request, 500, { ok: false, error: { code: "generic", message: "Lumen could not delete that data." } }, "/account");
  }
}
