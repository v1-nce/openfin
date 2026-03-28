import type {
  AnalysisPreview,
  AlternativeCandidate,
  AnalyzeRequest,
  NormalizedEditorialSignal,
  NormalizedIngredientList,
  NormalizedProduct,
  NormalizedReviewSignal,
  NormalizedSellerOffer,
  SourceEvidence,
  SourcePlan
} from "@/schemas";

export type ProviderExtractionBundle = {
  product: NormalizedProduct;
  ingredientList: NormalizedIngredientList;
  reviewSignals: NormalizedReviewSignal[];
  editorialSignals: NormalizedEditorialSignal[];
  socialSignals: NormalizedReviewSignal[];
  sellerOffers: NormalizedSellerOffer[];
  alternativeCandidates: AlternativeCandidate[];
  evidence: SourceEvidence[];
  warnings: string[];
  usedFallback: boolean;
};

export type ProviderUpdate =
  | {
      type: "status";
      phase: "product" | "support" | "fallback";
      status: "running" | "completed" | "failed";
      detail: string;
      preview?: AnalysisPreview;
    }
  | {
      type: "preview";
      phase: "product" | "support" | "fallback";
      detail?: string;
      preview: AnalysisPreview;
    };

export interface ExtractionProvider {
  readonly name: string;
  readonly supportsLive: boolean;
  extract(
    request: AnalyzeRequest,
    plan: SourcePlan
  ): Promise<ProviderExtractionBundle>;
  extractWithUpdates?(
    request: AnalyzeRequest,
    plan: SourcePlan,
    onUpdate: (update: ProviderUpdate) => void
  ): Promise<ProviderExtractionBundle>;
}
