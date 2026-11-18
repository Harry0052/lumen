import { createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { recordEvent } from "@/lib/audit";
import type { LumenDb } from "@/lib/db/client";
import { sessions, users } from "@/lib/db/schema";
import { nowIso } from "@/lib/time";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export type PublicUser = {
  id: string;
  displayName: string;
  kind: string;
  locale: "en" | "es";
  textScale: "1" | "1.15" | "1.3";
  contrast: "standard" | "high";
  simpler: boolean;
  reducedMotion: boolean;
};

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function sessionExpiry(from = new Date()) {
  return new Date(from.getTime() + THIRTY_DAYS_MS).toISOString();
}

export function toPublicUser(row: typeof users.$inferSelect): PublicUser {
  return {
    id: row.id,
    displayName: row.displayName,
    kind: row.kind,
    locale: row.locale === "es" ? "es" : "en",
    textScale: row.textScale === "1.15" || row.textScale === "1.3" ? row.textScale : "1",
    contrast: row.contrast === "high" ? "high" : "standard",
    simpler: row.simpler === 1,
    reducedMotion: row.reducedMotion === 1,
  };
}

export function editorCode() {
  const configured = process.env.LUMEN_EDITOR_CODE?.trim();
  if (configured) return { code: configured, sandbox: false };
  return { code: "local-desk", sandbox: true };
}

export function codesMatch(input: string, expected: string) {
  const left = createHash("sha256").update(input).digest();
  const right = createHash("sha256").update(expected).digest();
  return timingSafeEqual(left, right);
}

function issueSession(db: LumenDb, userId: string) {
  const token = randomBytes(32).toString("base64url");
  const createdAt = nowIso();
  db.insert(sessions)
    .values({
      id: randomUUID(),
      userId,
      tokenHash: hashToken(token),
      createdAt,
      expiresAt: sessionExpiry(),
    })
    .run();
  return token;
}

export function createGuest(db: LumenDb) {
  const id = randomUUID();
  const createdAt = nowIso();
  db.insert(users)
    .values({
      id,
      displayName: "",
      kind: "guest",
      locale: "en",
      textScale: "1",
      contrast: "standard",
      simpler: 0,
      reducedMotion: 0,
      createdAt,
    })
    .run();
  const token = issueSession(db, id);
  recordEvent(db, id, "guest_created", {});
  const row = db.select().from(users).where(eq(users.id, id)).get();
  if (!row) return { ok: false as const, message: "Lumen could not start a session." };
  return { ok: true as const, user: toPublicUser(row), token };
}

export function readUserByToken(db: LumenDb, token: string) {
  const row = db
    .select({ user: users })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.tokenHash, hashToken(token)), gt(sessions.expiresAt, nowIso())))
    .get();
  if (!row || row.user.kind === "deleted") return null;
  return toPublicUser(row.user);
}

const namePattern = /^[\p{L}\p{M}][\p{L}\p{M} .'-]{0,38}[\p{L}\p{M}.]$/u;

export function updateDisplayName(db: LumenDb, userId: string, displayName: string) {
  const trimmed = displayName.trim().replace(/\s+/g, " ");
  if (trimmed.includes("@")) {
    return { ok: false as const, code: "short_name" as const, message: "Use a first name, not an email address." };
  }
  if (trimmed.length < 2 || trimmed.length > 40 || !namePattern.test(trimmed)) {
    return {
      ok: false as const,
      code: "short_name" as const,
      message: "Use 2 to 40 letters. You can include spaces, hyphens, and apostrophes.",
    };
  }
  const existing = db.select().from(users).where(eq(users.id, userId)).get();
  if (!existing || existing.kind === "deleted") {
    return { ok: false as const, code: "forbidden" as const, message: "That session is not on this server." };
  }
  db.update(users).set({ displayName: trimmed }).where(eq(users.id, userId)).run();
  recordEvent(db, userId, "name_set", {});
  const row = db.select().from(users).where(eq(users.id, userId)).get();
  if (!row) return { ok: false as const, code: "generic" as const, message: "Lumen could not store that name." };
  return { ok: true as const, user: toPublicUser(row) };
}

export type PreferencePatch = {
  locale?: "en" | "es";
  textScale?: "1" | "1.15" | "1.3";
  contrast?: "standard" | "high";
  simpler?: boolean;
  reducedMotion?: boolean;
};

export function updatePreferences(db: LumenDb, userId: string, patch: PreferencePatch) {
  const existing = db.select().from(users).where(eq(users.id, userId)).get();
  if (!existing || existing.kind === "deleted") {
    return { ok: false as const, code: "forbidden" as const, message: "That session is not on this server." };
  }
  db.update(users)
    .set({
      locale: patch.locale ?? existing.locale,
      textScale: patch.textScale ?? existing.textScale,
      contrast: patch.contrast ?? existing.contrast,
      simpler: patch.simpler === undefined ? existing.simpler : patch.simpler ? 1 : 0,
      reducedMotion: patch.reducedMotion === undefined ? existing.reducedMotion : patch.reducedMotion ? 1 : 0,
    })
    .where(eq(users.id, userId))
    .run();
  recordEvent(db, userId, "preferences_saved", {
    locale: patch.locale ?? existing.locale,
    textScale: patch.textScale ?? existing.textScale,
    contrast: patch.contrast ?? existing.contrast,
    simpler: patch.simpler === undefined ? existing.simpler === 1 : patch.simpler,
    reducedMotion: patch.reducedMotion === undefined ? existing.reducedMotion === 1 : patch.reducedMotion,
  });
  const row = db.select().from(users).where(eq(users.id, userId)).get();
  if (!row) return { ok: false as const, code: "generic" as const, message: "Lumen could not store those settings." };
  return { ok: true as const, user: toPublicUser(row) };
}

export function unlockEditor(db: LumenDb, userId: string, code: string) {
  const existing = db.select().from(users).where(eq(users.id, userId)).get();
  if (!existing || existing.kind === "deleted") {
    return { ok: false as const, code: "forbidden" as const, message: "That session is not on this server." };
  }
  const desk = editorCode();
  if (!codesMatch(code.trim(), desk.code)) {
    recordEvent(db, userId, "editor_rejected", {});
    return { ok: false as const, code: "code" as const, message: "That desk code does not match." };
  }
  db.update(users).set({ kind: "editor" }).where(eq(users.id, userId)).run();
  recordEvent(db, userId, "editor_unlocked", { sandbox: desk.sandbox });
  const row = db.select().from(users).where(eq(users.id, userId)).get();
  if (!row) return { ok: false as const, code: "generic" as const, message: "Lumen could not unlock the desk." };
  return { ok: true as const, user: toPublicUser(row), sandbox: desk.sandbox };
}
