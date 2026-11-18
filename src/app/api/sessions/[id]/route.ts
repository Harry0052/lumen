import { NextResponse } from "next/server";
import { readSessionUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { sessionDetail } from "@/lib/sessions/progress";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const db = getDb();
  const user = await readSessionUser(db);
  if (!user) {
    return NextResponse.json(
      { ok: false, error: { code: "forbidden", message: "This browser has no Lumen session." } },
      { status: 401, headers: { "cache-control": "no-store" } },
    );
  }
  const detail = sessionDetail(db, user.id, id);
  if (!detail) {
    return NextResponse.json(
      { ok: false, error: { code: "not_found", message: "That session is not on this account." } },
      { status: 404, headers: { "cache-control": "no-store" } },
    );
  }
  return NextResponse.json(
    {
      ok: true,
      session: {
        id: detail.session.id,
        slug: detail.guide.slug,
        status: detail.session.status,
        lastStepOrdinal: detail.session.lastStepOrdinal,
        completed: detail.completed,
      },
    },
    { headers: { "cache-control": "no-store" } },
  );
}
