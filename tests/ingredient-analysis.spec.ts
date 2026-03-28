import { describe, expect, it } from "vitest";

import { getDemoCaseById } from "../fixtures/demo-cases";
import { analyzeIngredients } from "@/domain/ingredient-analysis";

const glowCase = getDemoCaseById("glow-recipe-sensitive-skin");

if (!glowCase) {
  throw new Error("Expected glow-recipe-sensitive-skin demo case to exist.");
}

describe("ingredient analysis", () => {
  it("flags fragrance for the sensitive demo profile", () => {
    const analysis = analyzeIngredients(
      glowCase.extraction.ingredientList,
      glowCase.request.userProfile
    );

    const fragranceFlag = analysis.flags.find((flag) =>
      flag.ingredientName.toLowerCase().includes("fragrance")
    );

    expect(fragranceFlag).toBeDefined();
    expect(fragranceFlag?.severity).toBe("high");
    expect(fragranceFlag?.matchedSensitivity).toBe("fragrance");
  });
});
