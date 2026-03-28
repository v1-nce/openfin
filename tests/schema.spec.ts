import { describe, expect, it } from "vitest";

import { getDemoCaseById } from "../fixtures/demo-cases";
import { analyzeProduct } from "@/orchestration";
import {
  AnalyzeRequestSchema,
  AnalyzeResponseSchema
} from "@/schemas";

const glowCase = getDemoCaseById("glow-recipe-sensitive-skin");

if (!glowCase) {
  throw new Error("Expected glow-recipe-sensitive-skin demo case to exist.");
}

describe("schema contracts", () => {
  it("accepts the seeded demo request", () => {
    expect(() => AnalyzeRequestSchema.parse(glowCase.request)).not.toThrow();
  });

  it("rejects an empty product query", () => {
    expect(() =>
      AnalyzeRequestSchema.parse({
        ...glowCase.request,
        product: {
          ...glowCase.request.product,
          rawQuery: ""
        }
      })
    ).toThrow();
  });

  it("produces a response shape that passes schema validation", async () => {
    const report = await analyzeProduct(glowCase.request);
    expect(() => AnalyzeResponseSchema.parse({ report })).not.toThrow();
  });
});
