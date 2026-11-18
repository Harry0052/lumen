import { readSessionUser } from "@/lib/auth/session";
import { asLocale, finish, readPayload, rejectOrigin } from "@/lib/api";
import { getDb } from "@/lib/db/client";
import { saveDraft, type StepDraft } from "@/lib/guides/editor";
import { logFailure } from "@/lib/observability";

export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const fallback = `/editor/${id}`;
  const blocked = rejectOrigin(request, fallback);
  if (blocked) return blocked;
  try {
    const payload = await readPayload(request);
    const db = getDb();
    const user = await readSessionUser(db);
    if (!user || user.kind !== "editor") {
      return finish(request, 403, { ok: false, error: { code: "forbidden", message: "The editor desk is locked." }, redirectTo: "/editor" }, "/editor");
    }
    const locale = asLocale(payload.locale) ?? "en";
    const count = Math.min(8, Math.max(1, Number(payload.stepCount) || 1));
    const steps: StepDraft[] = [];
    for (let index = 1; index <= count; index += 1) {
      steps.push({
        heading: payload[`heading_${index}`] ?? "",
        explanation: payload[`explanation_${index}`] ?? "",
        simpler: payload[`simpler_${index}`] ?? "",
        example: payload[`example_${index}`] ?? "",
        caution: payload[`caution_${index}`] ?? "",
      });
    }
    const saved = saveDraft(db, user, id, locale, {
      title: payload.title ?? "",
      summary: payload.summary ?? "",
      simplerSummary: payload.simplerSummary ?? "",
      sourceUrl: payload.sourceUrl ?? "",
      sourceTitle: payload.sourceTitle ?? "",
      topic: payload.topic ?? "",
      steps,
    });
    if (!saved.ok) {
      return finish(request, 400, { ok: false, error: { code: saved.code, message: saved.message }, redirectTo: `${fallback}?locale=${locale}` }, `${fallback}?locale=${locale}`);
    }
    return finish(request, 200, { ok: true, notice: "draft", redirectTo: `${fallback}?locale=${locale}` }, fallback);
  } catch (error) {
    logFailure({ scope: "editor-save", code: "unexpected", detail: error instanceof Error ? error.name : "error" });
    return finish(request, 500, { ok: false, error: { code: "generic", message: "Lumen could not save that draft." } }, fallback);
  }
}
