import { describe, expect, it } from "vitest";
import { fill, t } from "@/lib/i18n/messages";

describe("messages", () => {
  it("has the same keys in English and Spanish and no hidden English button label", () => {
    const english = t("en");
    const spanish = t("es");
    expect(Object.keys(spanish).sort()).toEqual(Object.keys(english).sort());
    expect(spanish.next).toBe("Siguiente");
    expect(spanish.back).toBe("Atrás");
    expect(spanish.startGuide).not.toBe(english.startGuide);
    expect(fill(spanish.stepOf, { current: 2, total: 4 })).toBe("Paso 2 de 4");
    expect(spanish.fallbackBanner.length).toBeGreaterThan(20);
  });
});
