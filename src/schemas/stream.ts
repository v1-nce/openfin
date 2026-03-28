import { z } from "zod";

import { ProgressStepSchema, SourceTypeSchema } from "@/schemas/common";
import {
  AlternativeCandidateSchema,
  NormalizedEditorialSignalSchema,
  NormalizedProductSchema,
  NormalizedReviewSignalSchema,
  NormalizedSellerOfferSchema,
  SourceEvidenceSchema
} from "@/schemas/extraction";
import { ProductReportSchema } from "@/schemas/report";

export const AnalysisPreviewSchema = z.object({
  providerName: z.string().min(1),
  product: NormalizedProductSchema.optional(),
  ingredientCount: z.number().int().nonnegative().default(0),
  sellerOfferCount: z.number().int().nonnegative().default(0),
  evidenceCount: z.number().int().nonnegative().default(0),
  coveredSourceTypes: z.array(SourceTypeSchema).default([]),
  pendingSourceTypes: z.array(SourceTypeSchema).default([]),
  recentActivity: z.array(z.string()).default([]),
  topEvidence: z.array(SourceEvidenceSchema).default([]),
  sellerOffers: z.array(NormalizedSellerOfferSchema).default([]),
  reviewSignals: z.array(NormalizedReviewSignalSchema).default([]),
  editorialSignals: z.array(NormalizedEditorialSignalSchema).default([]),
  socialSignals: z.array(NormalizedReviewSignalSchema).default([]),
  alternatives: z.array(AlternativeCandidateSchema).default([]),
  warnings: z.array(z.string()).default([])
});

export const AnalysisStreamProgressEventSchema = z.object({
  type: z.literal("progress"),
  progress: z.array(ProgressStepSchema),
  detail: z.string().optional(),
  preview: AnalysisPreviewSchema.optional()
});

export const AnalysisStreamPreviewEventSchema = z.object({
  type: z.literal("preview"),
  preview: AnalysisPreviewSchema
});

export const AnalysisStreamCompleteEventSchema = z.object({
  type: z.literal("complete"),
  report: ProductReportSchema
});

export const AnalysisStreamErrorEventSchema = z.object({
  type: z.literal("error"),
  error: z.string().min(1)
});

export const AnalysisStreamEventSchema = z.discriminatedUnion("type", [
  AnalysisStreamProgressEventSchema,
  AnalysisStreamPreviewEventSchema,
  AnalysisStreamCompleteEventSchema,
  AnalysisStreamErrorEventSchema
]);

export type AnalysisPreview = z.infer<typeof AnalysisPreviewSchema>;
export type AnalysisStreamProgressEvent = z.infer<
  typeof AnalysisStreamProgressEventSchema
>;
export type AnalysisStreamPreviewEvent = z.infer<
  typeof AnalysisStreamPreviewEventSchema
>;
export type AnalysisStreamCompleteEvent = z.infer<
  typeof AnalysisStreamCompleteEventSchema
>;
export type AnalysisStreamErrorEvent = z.infer<
  typeof AnalysisStreamErrorEventSchema
>;
export type AnalysisStreamEvent = z.infer<typeof AnalysisStreamEventSchema>;
