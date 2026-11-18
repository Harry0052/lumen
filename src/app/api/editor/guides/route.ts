import { readSessionUser } from "@/lib/auth/session";
import { finish, readPayload, rejectOrigin, safeReturn } from "@/lib/api";
import { getDb } from "@/lib/db/client";
import { createDraftGuide } from "@/lib/guides/editor";
import { logFailure } from "@/lib/observability";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const blocked = rejectOrigin(request, "/editor");
  if (blocked) return blocked;
  try {
    const payload = await readPayload(request);
    const redirectTo = safeReturn(payload.returnTo, "/editor");
    const db = getDb();
    const user = await readSessionUser(db);
    if (!user || user.kind !== "editor") {
      return finish(request, 403, { ok: false, error: { code: "forbidden", message: "The editor desk is locked." }, redirectTo }, redirectTo);
    }
    const created = createDraftGuide(db, user, {
      title: payload.title ?? "",
      topic: payload.topic ?? "",
      sourceUrl: payload.sourceUrl ?? "",
      sourceTitle: payload.sourceTitle ?? "",
    });
    if (!created.ok) {
      return finish(request, 400, { ok: false, error: { code: created.code, message: created.message }, redirectTo }, redirectTo);
    }
    return finish(request, 200, { ok: true, notice: "draft", redirectTo: `/editor/${created.id}` }, `/editor/${created.id}`);
  } catch (error) {
    logFailure({ scope: "editor-create", code: "unexpected", detail: error instanceof Error ? error.name : "error" });
    return finish(request, 500, { ok: false, error: { code: "generic", message: "Lumen could not create that draft." } }, "/editor");
  }
}
