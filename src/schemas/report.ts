import { z } from "zod";

import { AnalyzeRequestSchema } from "@/schemas/input";
import {
  ConfidenceSchema,
  IngredientSeveritySchema,
  ProgressStepSchema,
  SignalThemeSchema,
  SourcePlanSchema,
  SourceTypeSchema,
  VerdictSchema
} from "@/schemas/common";
import {
  NormalizedProductSchema,
  NormalizedSellerOfferSchema,
  SourceEvidenceSchema
} from "@/schemas/extraction";

export const IngredientFlagSchema = z.object({
  ingredientName: z.string().min(1),
  severity: IngredientSeveritySchema,
  reason: z.string().min(1),
  matchedSensitivity: z.string().optional(),
  relatedDislikedProducts: z.array(z.string()).default([]),
  evidenceIds: z.array(z.string()).default([])
});

export const SentimentThemeSchema = z.object({
  theme: SignalThemeSchema,
  polarity: z.enum(["positive", "negative", "mixed"]),
  positiveSummary: z.string().optional(),
  negativeSummary: z.string().optional(),
  confidence: ConfidenceSchema,
  supportingSourceTypes: z.array(SourceTypeSchema),
  evidenceIds: z.array(z.string()).default([])
});

export const ContradictionFindingSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  severity: IngredientSeveritySchema,
  confidence: ConfidenceSchema,
  supportingEvidenceIds: z.array(z.string()).default([]),
  counterEvidenceIds: z.array(z.string()).default([])
});

export const AlternativeRecommendationSchema = z.object({
  id: z.string().min(1),
  productName: z.string().min(1),
  brand: z.string().min(1),
  reason: z.string().min(1),
  tradeoff: z.string().optional(),
  confidence: ConfidenceSchema,
  priceSummary: z.string().optional()
});

export const SellerRankingItemSchema = z.object({
  offer: NormalizedSellerOfferSchema,
  rank: z.number().int().positive(),
  purchaseScore: z.number().min(0).max(100),
  valuePerUnit: z.number().positive().optional(),
  rationale: z.array(z.string()).default([]),
  confidence: ConfidenceSchema
});

export const ScoreBreakdownSchema = z.object({
  personalFit: z.number().min(0).max(100),
  ingredientCompatibility: z.number().min(0).max(100),
  sentiment: z.number().min(0).max(100),
  evidenceConfidence: z.number().min(0).max(100),
  sellerTrustValue: z.number().min(0).max(100),
  total: z.number().min(0).max(100),
  notes: z.array(z.string()).default([])
});

export const FinalVerdictSchema = z.object({
  verdict: VerdictSchema,
  confidence: ConfidenceSchema,
  summary: z.string().min(1),
  topReasons: z.array(z.string()).default([]),
  topCautions: z.array(z.string()).default([]),
  supportingEvidenceIds: z.array(z.string()).default([]),
  counterEvidenceIds: z.array(z.string()).default([])
});

export const SourceCoverageSchema = z.object({
  coveredSourceTypes: z.array(SourceTypeSchema),
  missingSourceTypes: z.array(SourceTypeSchema),
  sourceCount: z.number().int().nonnegative()
});

export const ProductReportSchema = z.object({
  request: AnalyzeRequestSchema,
  sourcePlan: SourcePlanSchema,
  progress: z.array(ProgressStepSchema),
  product: NormalizedProductSchema,
  ingredientFlags: z.array(IngredientFlagSchema),
  sentimentThemes: z.array(SentimentThemeSchema),
  contradictionFindings: z.array(ContradictionFindingSchema),
  alternatives: z.array(AlternativeRecommendationSchema),
  sellerRankings: z.array(SellerRankingItemSchema),
  scoreBreakdown: ScoreBreakdownSchema,
  finalVerdict: FinalVerdictSchema,
  evidence: z.array(SourceEvidenceSchema),
  sourceCoverage: SourceCoverageSchema,
  whatWeKnow: z.array(z.string()).default([]),
  lessCertainAbout: z.array(z.string()).default([]),
  providerName: z.string().min(1),
  warnings: z.array(z.string()).default([])
});

export const AnalyzeResponseSchema = z.object({
  report: ProductReportSchema
});

export type IngredientFlag = z.infer<typeof IngredientFlagSchema>;
export type SentimentTheme = z.infer<typeof SentimentThemeSchema>;
export type ContradictionFinding = z.infer<typeof ContradictionFindingSchema>;
export type AlternativeRecommendation = z.infer<
  typeof AlternativeRecommendationSchema
>;
export type SellerRankingItem = z.infer<typeof SellerRankingItemSchema>;
export type ScoreBreakdown = z.infer<typeof ScoreBreakdownSchema>;
export type FinalVerdict = z.infer<typeof FinalVerdictSchema>;
export type SourceCoverage = z.infer<typeof SourceCoverageSchema>;
export type ProductReport = z.infer<typeof ProductReportSchema>;
export type AnalyzeResponse = z.infer<typeof AnalyzeResponseSchema>;
