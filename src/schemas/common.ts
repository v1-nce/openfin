import { z } from "zod";

export const ModeSchema = z.enum(["demo", "mock", "live"]);
export const VerdictSchema = z.enum(["buy", "cautious_try", "skip"]);
export const ConfidenceSchema = z.enum(["high", "medium", "low"]);
export const SourceTypeSchema = z.enum([
  "official",
  "retailer",
  "editorial",
  "ingredient_reference",
  "seller",
  "social"
]);
export const ProductCategorySchema = z.enum([
  "moisturizer",
  "sunscreen",
  "serum",
  "cleanser",
  "other"
]);
export const SkinTypeSchema = z.enum([
  "dry",
  "oily",
  "combination",
  "normal",
  "sensitive",
  "acne_prone"
]);
export const SentimentPolaritySchema = z.enum(["positive", "negative", "mixed"]);
export const IngredientSeveritySchema = z.enum(["low", "medium", "high"]);
export const SellerTypeSchema = z.enum([
  "official",
  "authorized",
  "retailer",
  "marketplace",
  "unknown"
]);
export const AvailabilitySchema = z.enum([
  "in_stock",
  "limited",
  "unknown",
  "out_of_stock"
]);
export const ProgressStageSchema = z.enum([
  "validate",
  "plan",
  "extract",
  "normalize",
  "reason",
  "rank",
  "assemble"
]);
export const ProgressStatusSchema = z.enum([
  "pending",
  "running",
  "completed",
  "failed"
]);
export const SignalThemeSchema = z.enum([
  "hydration",
  "irritation",
  "texture",
  "finish",
  "white_cast",
  "pilling",
  "breakouts",
  "value",
  "wear_under_makeup"
]);

export const MoneySchema = z.object({
  amount: z.number().nonnegative(),
  currency: z.string().trim().length(3).default("USD")
});

export const SizeSchema = z.object({
  value: z.number().positive(),
  unit: z.enum(["ml", "g", "oz", "count"])
});

export const SourceMetadataSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: SourceTypeSchema,
  url: z.string().url().optional(),
  domain: z.string().optional()
});

export const PlannedSourceTaskSchema = z.object({
  id: z.string().min(1),
  type: SourceTypeSchema,
  label: z.string().min(1),
  rationale: z.string().min(1),
  priority: z.number().int().min(1).max(5)
});

export const SourcePlanSchema = z.object({
  mode: ModeSchema,
  tasks: z.array(PlannedSourceTaskSchema),
  expectedSourceTypes: z.array(SourceTypeSchema),
  fallbackUsed: z.boolean().default(false),
  warnings: z.array(z.string()).default([])
});

export const ProgressStepSchema = z.object({
  stage: ProgressStageSchema,
  label: z.string().min(1),
  status: ProgressStatusSchema,
  detail: z.string().optional()
});

export type Mode = z.infer<typeof ModeSchema>;
export type Verdict = z.infer<typeof VerdictSchema>;
export type ConfidenceLevel = z.infer<typeof ConfidenceSchema>;
export type SourceType = z.infer<typeof SourceTypeSchema>;
export type ProductCategory = z.infer<typeof ProductCategorySchema>;
export type SkinType = z.infer<typeof SkinTypeSchema>;
export type SentimentPolarity = z.infer<typeof SentimentPolaritySchema>;
export type IngredientSeverity = z.infer<typeof IngredientSeveritySchema>;
export type SellerType = z.infer<typeof SellerTypeSchema>;
export type Availability = z.infer<typeof AvailabilitySchema>;
export type ProgressStage = z.infer<typeof ProgressStageSchema>;
export type SignalTheme = z.infer<typeof SignalThemeSchema>;
export type Money = z.infer<typeof MoneySchema>;
export type Size = z.infer<typeof SizeSchema>;
export type SourceMetadata = z.infer<typeof SourceMetadataSchema>;
export type PlannedSourceTask = z.infer<typeof PlannedSourceTaskSchema>;
export type SourcePlan = z.infer<typeof SourcePlanSchema>;
export type ProgressStep = z.infer<typeof ProgressStepSchema>;
