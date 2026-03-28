import { findDemoCase, getDemoCaseById } from "../../../fixtures/demo-cases";
import type { AnalyzeRequest, SourcePlan } from "@/schemas";
import type {
  ExtractionProvider,
  ProviderExtractionBundle,
  ProviderUpdate
} from "@/providers/types";

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

  async extractWithUpdates(
    request: AnalyzeRequest,
    plan: SourcePlan,
    onUpdate: (update: ProviderUpdate) => void
  ): Promise<ProviderExtractionBundle> {
    onUpdate({
      type: "status",
      phase: "fallback",
      status: "running",
      detail: "Loading seeded SignalSkin evidence."
    });

    const result = await this.extract(request, plan);

    onUpdate({
      type: "status",
      phase: "fallback",
      status: "completed",
      detail: "Seeded evidence is ready.",
      preview: {
        providerName: this.name,
        product: result.product,
        ingredientCount: result.ingredientList.items.length,
        sellerOfferCount: result.sellerOffers.length,
        evidenceCount: result.evidence.length,
        coveredSourceTypes: Array.from(
          new Set(result.evidence.map((item) => item.source.type))
        ),
        pendingSourceTypes: plan.expectedSourceTypes.filter(
          (type) => !result.evidence.some((item) => item.source.type === type)
        ),
        recentActivity: ["Seeded mock evidence loaded."],
        topEvidence: result.evidence.slice(0, 4),
        sellerOffers: result.sellerOffers.slice(0, 3),
        reviewSignals: result.reviewSignals.slice(0, 2),
        editorialSignals: result.editorialSignals.slice(0, 2),
        socialSignals: result.socialSignals.slice(0, 2),
        alternatives: result.alternativeCandidates.slice(0, 3),
        warnings: result.warnings
      }
    });

    return result;
  }
}
