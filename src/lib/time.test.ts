import { describe, expect, it } from "vitest";
import { formatUtc, isPast } from "@/lib/time";

describe("time", () => {
  it("prints UTC and treats a missing date as past", () => {
    expect(formatUtc("2026-09-15T15:00:00.000Z")).toContain("UTC");
    expect(isPast("2025-08-01T15:00:00.000Z", new Date("2026-11-18T00:00:00.000Z"))).toBe(true);
    expect(isPast("2027-03-15T15:00:00.000Z", new Date("2026-11-18T00:00:00.000Z"))).toBe(false);
    expect(isPast(null)).toBe(true);
  });
});
