import { z } from "zod";

import {
  ModeSchema,
  MoneySchema,
  ProductCategorySchema,
  SkinTypeSchema
} from "@/schemas/common";

const BudgetRangeSchema = z.object({
  min: z.number().nonnegative().optional(),
  max: z.number().positive().optional(),
  currency: MoneySchema.shape.currency
}).default({
  currency: "USD"
});

const PreferenceWeightsSchema = z.object({
  fit: z.number().min(0).max(1).default(0.3),
  ingredients: z.number().min(0).max(1).default(0.24),
  sentiment: z.number().min(0).max(1).default(0.18),
  evidence: z.number().min(0).max(1).default(0.14),
  seller: z.number().min(0).max(1).default(0.14)
}).default({});

const UserPreferencesSchema = z.object({
  fragranceFree: z.boolean().optional(),
  crueltyFree: z.boolean().optional(),
  lightweight: z.boolean().optional(),
  samplePreferred: z.boolean().optional(),
  finish: z.enum(["natural", "matte", "glowy"]).optional()
}).default({});

const ProductMemorySchema = z.object({
  productName: z.string().min(1),
  notes: z.string().optional(),
  suspectedIngredients: z.array(z.string()).default([])
});

export const ProductQuerySchema = z.object({
  rawQuery: z.string().trim().min(2),
  queryType: z.enum(["name", "url"]).default("name"),
  category: ProductCategorySchema.optional(),
  country: z.string().trim().min(2).default("US")
});

export const UserProfileSchema = z.object({
  id: z.string().min(1),
  name: z.string().optional(),
  market: z.string().trim().min(2).default("US"),
  skinType: SkinTypeSchema,
  concerns: z.array(z.string()).default([]),
  sensitivities: z.array(z.string()).default([]),
  likedProducts: z.array(ProductMemorySchema).default([]),
  dislikedProducts: z.array(ProductMemorySchema).default([]),
  desiredCharacteristics: z.array(z.string()).default([]),
  currentRoutine: z.array(z.string()).default([]),
  budgetRange: BudgetRangeSchema,
  preferences: UserPreferencesSchema,
  preferenceWeights: PreferenceWeightsSchema
});

export const AnalyzeRequestSchema = z.object({
  mode: ModeSchema.default("demo"),
  demoCaseId: z.string().optional(),
  product: ProductQuerySchema,
  userProfile: UserProfileSchema
});

export type BudgetRange = z.infer<typeof BudgetRangeSchema>;
export type ProductMemory = z.infer<typeof ProductMemorySchema>;
export type UserPreferences = z.infer<typeof UserPreferencesSchema>;
export type PreferenceWeights = z.infer<typeof PreferenceWeightsSchema>;
export type ProductQuery = z.infer<typeof ProductQuerySchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;
