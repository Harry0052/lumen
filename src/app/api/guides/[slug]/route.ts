import { NextResponse } from "next/server";
import { readSessionUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { getPublicGuide } from "@/lib/guides/catalog";

export const dynamic = "force-dynamic";

export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const url = new URL(request.url);
  const db = getDb();
  const user = await readSessionUser(db);
  const locale = url.searchParams.get("locale") === "es" ? "es" : url.searchParams.get("locale") === "en" ? "en" : user?.locale ?? "en";
  const detail = getPublicGuide(db, slug, locale);
  if (!detail) {
    return NextResponse.json(
      { ok: false, error: { code: "not_found", message: "That guide is not on the public list." } },
      { status: 404, headers: { "cache-control": "no-store" } },
    );
  }
  return NextResponse.json(
    {
      ok: true,
      guide: detail.card,
      steps: detail.steps.map((step) => ({
        ordinal: step.ordinal,
        heading: step.heading,
        caution: step.caution,
      })),
    },
    { headers: { "cache-control": "no-store" } },
  );
}
