import { NextResponse } from "next/server";
import { readSessionUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { listPublicGuides } from "@/lib/guides/catalog";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const db = getDb();
  const user = await readSessionUser(db);
  const locale = url.searchParams.get("locale") === "es" ? "es" : url.searchParams.get("locale") === "en" ? "en" : user?.locale ?? "en";
  const topic = url.searchParams.get("topic") ?? undefined;
  const q = url.searchParams.get("q") ?? undefined;
  const guides = listPublicGuides(db, { locale, topic, q });
  return NextResponse.json(
    { ok: true, locale, guides },
    { headers: { "cache-control": "no-store" } },
  );
}
