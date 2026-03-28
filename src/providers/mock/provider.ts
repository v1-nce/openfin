import { findDemoCase, getDemoCaseById } from "../../../fixtures/demo-cases";
import type { AnalyzeRequest, SourcePlan } from "@/schemas";
import type { ExtractionProvider, ProviderExtractionBundle } from "@/providers/types";

export class MockProvider implements ExtractionProvider {
  readonly name = "MockProvider";
  readonly supportsLive = false;

  async extract(
    request: AnalyzeRequest,
    plan: SourcePlan
  ): Promise<ProviderExtractionBundle> {
    void plan;

    const demoCase = request.demoCaseId
      ? getDemoCaseById(request.demoCaseId) ?? findDemoCase(request.product.rawQuery)
      : findDemoCase(request.product.rawQuery);

    return structuredClone({
      ...demoCase.extraction,
      warnings: demoCase.extraction.warnings ?? [],
      usedFallback: false
    });
  }
}
