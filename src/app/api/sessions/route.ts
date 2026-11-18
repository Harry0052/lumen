import { NextResponse } from "next/server";
import { recordEvent } from "@/lib/audit";
import { ensureUser, readSessionUser } from "@/lib/auth/session";
import { finish, readPayload, rejectOrigin, safeReturn } from "@/lib/api";
import { getDb } from "@/lib/db/client";
import { guides } from "@/lib/db/schema";
import { logFailure } from "@/lib/observability";
import { LIMITS, consumeRateLimit } from "@/lib/security/rate-limit";
import { listSessions, startGuide } from "@/lib/sessions/progress";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = getDb();
  const user = await readSessionUser(db);
  if (!user) return NextResponse.json({ ok: true, sessions: [] }, { headers: { "cache-control": "no-store" } });
  const rows = listSessions(db, user.id);
  const guideRows = db.select().from(guides).all();
  return NextResponse.json(
    {
      ok: true,
      sessions: rows.map((session) => ({
        id: session.id,
        slug: guideRows.find((guide) => guide.id === session.guideId)?.slug ?? null,
        status: session.status,
        lastStepOrdinal: session.lastStepOrdinal,
        updatedAt: session.updatedAt,
      })),
    },
    { headers: { "cache-control": "no-store" } },
  );
}

export async function POST(request: Request) {
  const blocked = rejectOrigin(request, "/guides");
  if (blocked) return blocked;
  try {
    const payload = await readPayload(request);
    const slug = payload.slug ?? "";
    const db = getDb();
    const identity = await ensureUser(db, request);
    if (!identity.ok) {
      return finish(request, 500, { ok: false, error: { code: "generic", message: identity.message } }, "/guides");
    }
    if (!consumeRateLimit(db, `session:${identity.user.id}`, LIMITS.session.limit, LIMITS.session.windowMs)) {
      return finish(request, 429, { ok: false, error: { code: "rate", message: "Too many starts." }, redirectTo: `/guides/${slug}` }, `/guides/${slug}`);
    }
    const locale = payload.locale === "es" || payload.locale === "en" ? payload.locale : identity.user.locale;
    const started = startGuide(db, identity.user.id, slug, locale);
    if (!started.ok) {
      return finish(request, 404, { ok: false, error: { code: started.code, message: started.message }, redirectTo: "/guides" }, "/guides");
    }
    const redirectTo = safeReturn(payload.returnTo, `/guides/${started.slug}?step=1`);
    if (payload.again === "1") {
      recordEvent(db, identity.user.id, "guide_restarted", { slug: started.slug });
    }
    return finish(request, 200, { ok: true, redirectTo, sessionId: started.sessionId } as never, redirectTo);
  } catch (error) {
    logFailure({ scope: "sessions", code: "unexpected", detail: error instanceof Error ? error.name : "error" });
    return finish(request, 500, { ok: false, error: { code: "generic", message: "Lumen could not start that guide." } }, "/guides");
  }
}
