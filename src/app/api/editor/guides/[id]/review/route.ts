import { readSessionUser } from "@/lib/auth/session";
import { asLocale, finish, readPayload, rejectOrigin } from "@/lib/api";
import { getDb } from "@/lib/db/client";
import { markReviewed } from "@/lib/guides/editor";
import { logFailure } from "@/lib/observability";

export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const fallback = `/editor/${id}`;
  const blocked = rejectOrigin(request, fallback);
  if (blocked) return blocked;
  try {
    const payload = await readPayload(request);
    const locale = asLocale(payload.locale) ?? "en";
    const db = getDb();
    const user = await readSessionUser(db);
    if (!user || user.kind !== "editor") {
      return finish(request, 403, { ok: false, error: { code: "forbidden", message: "The editor desk is locked." }, redirectTo: "/editor" }, "/editor");
    }
    const reviewed = markReviewed(db, user, id, locale, payload.checkedSource === "yes");
    if (!reviewed.ok) {
      return finish(
        request,
        400,
        { ok: false, error: { code: reviewed.code, message: reviewed.message }, redirectTo: `${fallback}?locale=${locale}` },
        fallback,
      );
    }
    return finish(request, 200, { ok: true, notice: "reviewed", redirectTo: `${fallback}?locale=${locale}` }, fallback);
  } catch (error) {
    logFailure({ scope: "editor-review", code: "unexpected", detail: error instanceof Error ? error.name : "error" });
    return finish(request, 500, { ok: false, error: { code: "generic", message: "Lumen could not mark that reviewed." } }, fallback);
  }
}
