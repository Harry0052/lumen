import { describe, expect, it } from "vitest";
import { safeMetadata } from "@/lib/audit";
import { sameOrigin } from "@/lib/http";

describe("http guards", () => {
  it("requires a matching origin and strips notes from the audit log", () => {
    const request = new Request("http://localhost:3000/api/sessions", {
      headers: { origin: "http://localhost:3000", host: "localhost:3000" },
    });
    expect(sameOrigin(request)).toBe(true);
    const foreign = new Request("http://localhost:3000/api/sessions", {
      headers: { origin: "https://example.test", host: "localhost:3000" },
    });
    expect(sameOrigin(foreign)).toBe(false);
    expect(safeMetadata({ note: "secret phrase", slug: "check-email", confusing: true }).note).toBeUndefined();
    expect(safeMetadata({ note: "secret phrase", slug: "check-email" }).slug).toBe("check-email");
  });
});
