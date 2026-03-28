import { z } from "zod";

import {
  AvailabilitySchema,
  ConfidenceSchema,
  MoneySchema,
  ProductCategorySchema,
  SellerTypeSchema,
  SentimentPolaritySchema,
  SignalThemeSchema,
  SizeSchema,
  SourceMetadataSchema
} from "@/schemas/common";

export const SourceEvidenceSchema = z.object({
  id: z.string().min(1),
  source: SourceMetadataSchema,
  title: z.string().optional(),
  snippet: z.string().trim().min(8),
  confidence: ConfidenceSchema,
  claimType: z.enum([
    "fact",
    "ingredient",
    "sentiment",
    "seller",
    "claim",
    "comparison"
  ]),
  supports: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([])
});

export const NormalizedIngredientSchema = z.object({
  name: z.string().min(1),
  normalizedName: z.string().min(1),
  tags: z.array(z.string()).default([]),
  confidence: ConfidenceSchema.default("medium")
});

export const NormalizedIngredientListSchema = z.object({
  items: z.array(NormalizedIngredientSchema),
  declaredFragrance: z.boolean().default(false),
  confidence: ConfidenceSchema,
  evidenceIds: z.array(z.string()).default([])
});

export const NormalizedProductSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  brand: z.string().min(1),
  category: ProductCategorySchema,
  tagline: z.string().optional(),
  size: SizeSchema.optional(),
  price: MoneySchema.optional(),
  ingredients: z.array(NormalizedIngredientSchema).default([]),
  officialClaims: z.array(z.string()).default([]),
  textureTags: z.array(z.string()).default([]),
  finishTags: z.array(z.string()).default([]),
  crueltyFree: z.boolean().optional(),
  confidence: ConfidenceSchema,
  evidenceIds: z.array(z.string()).default([])
});

const BaseSignalSchema = z.object({
  id: z.string().min(1),
  source: SourceMetadataSchema,
  theme: SignalThemeSchema,
  sentiment: SentimentPolaritySchema,
  summary: z.string().min(1),
  mentions: z.number().int().positive().default(1),
  confidence: ConfidenceSchema,
  evidenceIds: z.array(z.string()).default([])
});

export const NormalizedReviewSignalSchema = BaseSignalSchema.extend({
  averageRating: z.number().min(0).max(5).optional()
});

export const NormalizedEditorialSignalSchema = BaseSignalSchema.extend({
  comparisonProducts: z.array(z.string()).default([])
});

export const AlternativeCandidateSchema = z.object({
  id: z.string().min(1),
  productName: z.string().min(1),
  brand: z.string().min(1),
  category: ProductCategorySchema,
  price: MoneySchema.optional(),
  reasonHints: z.array(z.string()).default([]),
  fitTags: z.array(z.string()).default([]),
  riskTags: z.array(z.string()).default([]),
  confidence: ConfidenceSchema
});

export const NormalizedSellerOfferSchema = z.object({
  id: z.string().min(1),
  sellerName: z.string().min(1),
  sellerType: SellerTypeSchema,
  url: z.string().url().optional(),
  price: MoneySchema,
  size: SizeSchema.optional(),
  sampleAvailable: z.boolean().default(false),
  availability: AvailabilitySchema.default("unknown"),
  returnPolicyVisible: z.boolean().default(false),
  contactInfoVisible: z.boolean().default(false),
  shippingSummary: z.string().optional(),
  trustSignals: z.array(z.string()).default([]),
  riskSignals: z.array(z.string()).default([]),
  confidence: ConfidenceSchema,
  evidenceIds: z.array(z.string()).default([])
});

export type SourceEvidence = z.infer<typeof SourceEvidenceSchema>;
export type NormalizedIngredient = z.infer<typeof NormalizedIngredientSchema>;
export type NormalizedIngredientList = z.infer<
  typeof NormalizedIngredientListSchema
>;
export type NormalizedProduct = z.infer<typeof NormalizedProductSchema>;
export type NormalizedReviewSignal = z.infer<typeof NormalizedReviewSignalSchema>;
export type NormalizedEditorialSignal = z.infer<
  typeof NormalizedEditorialSignalSchema
>;
export type AlternativeCandidate = z.infer<typeof AlternativeCandidateSchema>;
export type NormalizedSellerOffer = z.infer<typeof NormalizedSellerOfferSchema>;
