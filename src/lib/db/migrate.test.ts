import { describe, expect, it } from "vitest";
import { createTestDb, openDatabase } from "./client";
import { seedDemo } from "./seed";

describe("migrations", () => {
  it("creates the lumen tables and can run twice", () => {
    const sqlite = openDatabase(":memory:");
    const tables = sqlite
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
      .all()
      .map((row) => (row as { name: string }).name);
    expect(tables).toEqual(
      expect.arrayContaining([
        "users",
        "sessions",
        "guides",
        "guide_versions",
        "guide_steps",
        "guide_sessions",
        "session_steps",
        "feedback",
        "schema_migrations",
      ]),
    );
    const db = createTestDb();
    seedDemo(db);
    seedDemo(db);
    expect(db).toBeTruthy();
  });
});
