import { describe, expect, it } from "vitest";
import { contrastRatio, palette } from "@/lib/contrast";

describe("contrast", () => {
  it("meets WCAG AA for the pairs Lumen uses as text", () => {
    expect(contrastRatio(palette.ink, palette.paper)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(palette.white, palette.blue)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(palette.blue, palette.paper)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(palette.muted, palette.paper)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(palette.caution, palette.cautionBg)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(palette.white, palette.highBlue)).toBeGreaterThanOrEqual(7);
  });
});
