import { describe, expect, it } from "vitest";
import { createTestDb } from "@/lib/db/client";
import { consumeRateLimit } from "@/lib/security/rate-limit";

describe("rate limit", () => {
  it("blocks the next call after the limit inside one window", () => {
    const db = createTestDb();
    const now = Date.parse("2026-11-18T12:00:00.000Z");
    expect(consumeRateLimit(db, "feedback:test", 2, 60_000, now)).toBe(true);
    expect(consumeRateLimit(db, "feedback:test", 2, 60_000, now + 10)).toBe(true);
    expect(consumeRateLimit(db, "feedback:test", 2, 60_000, now + 20)).toBe(false);
    expect(consumeRateLimit(db, "feedback:test", 2, 60_000, now + 60_000)).toBe(true);
  });
});
