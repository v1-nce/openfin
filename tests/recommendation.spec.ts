import { describe, expect, it } from "vitest";

import { getDemoCaseById } from "../fixtures/demo-cases";
import { profileShiftRequest } from "../fixtures/eval-cases";
import { analyzeProduct } from "@/orchestration";

const glowCase = getDemoCaseById("glow-recipe-sensitive-skin");
const bojCase = getDemoCaseById("boj-sunscreen-budget");

if (!glowCase || !bojCase) {
  throw new Error("Expected seeded demo cases to exist.");
}

describe("recommendation consistency", () => {
  it("keeps the fragrance-sensitive Glow Recipe demo in cautious territory", async () => {
    const report = await analyzeProduct(glowCase.request);

    expect(report.finalVerdict.verdict).toBe("cautious_try");
    expect(report.contradictionFindings.length).toBeGreaterThan(0);
  });

  it("improves the verdict when the same product is evaluated for a more tolerant profile", async () => {
    const cautiousReport = await analyzeProduct(glowCase.request);
    const shiftedReport = await analyzeProduct(profileShiftRequest);

    expect(shiftedReport.scoreBreakdown.total).toBeGreaterThan(
      cautiousReport.scoreBreakdown.total
    );
    expect(shiftedReport.finalVerdict.verdict).toBe("buy");
  });

  it("does not let the cheapest suspicious seller win the ranking", async () => {
    const report = await analyzeProduct(bojCase.request);

    expect(report.sellerRankings[0].offer.sellerName).not.toBe("SunSale Outlet");
    expect(
      report.sellerRankings[report.sellerRankings.length - 1].offer.sellerName
    ).toBe("SunSale Outlet");
  });
});
