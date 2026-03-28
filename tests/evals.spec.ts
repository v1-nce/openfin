import { describe, expect, it } from "vitest";

import { getDemoCaseById } from "../fixtures/demo-cases";
import { analyzeProduct } from "@/orchestration";

const glowCase = getDemoCaseById("glow-recipe-sensitive-skin");

if (!glowCase) {
  throw new Error("Expected glow-recipe-sensitive-skin demo case to exist.");
}

describe("demo evals", () => {
  it("keeps the happy path evidence-backed and seller-aware", async () => {
    const report = await analyzeProduct(glowCase.request);

    expect(report.evidence.length).toBeGreaterThanOrEqual(8);
    expect(report.alternatives.length).toBeGreaterThanOrEqual(2);
    expect(report.sellerRankings.length).toBeGreaterThanOrEqual(3);
    expect(report.whatWeKnow.length).toBeGreaterThan(0);
    expect(report.lessCertainAbout.length).toBeGreaterThan(0);
  });
});
