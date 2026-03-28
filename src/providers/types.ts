import type {
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

export interface ExtractionProvider {
  readonly name: string;
  readonly supportsLive: boolean;
  extract(
    request: AnalyzeRequest,
    plan: SourcePlan
  ): Promise<ProviderExtractionBundle>;
}
