import { NextResponse } from "next/server";
import { readSessionUser } from "@/lib/auth/session";
import { exportAccount } from "@/lib/account/account";
import { getDb } from "@/lib/db/client";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = getDb();
  const user = await readSessionUser(db);
  if (!user) {
    return NextResponse.json(
      { ok: false, error: { code: "forbidden", message: "This browser has no Lumen session." } },
      { status: 401, headers: { "cache-control": "no-store" } },
    );
  }
  const data = exportAccount(db, user.id);
  if (!data) {
    return NextResponse.json(
      { ok: false, error: { code: "not_found", message: "Nothing to export." } },
      { status: 404, headers: { "cache-control": "no-store" } },
    );
  }
  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": "attachment; filename=\"lumen-data.json\"",
      "cache-control": "no-store",
    },
  });
}
