import type { ProgressStage, SignalTheme, SourceType } from "@/schemas";

export const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  official: "Official product page",
  retailer: "Retailer reviews",
  editorial: "Editorial coverage",
  ingredient_reference: "Ingredient reference",
  seller: "Seller listings",
  social: "Social signal"
};

export const THEME_LABELS: Record<SignalTheme, string> = {
  hydration: "Hydration",
  irritation: "Irritation",
  texture: "Texture",
  finish: "Finish",
  white_cast: "White cast",
  pilling: "Pilling",
  breakouts: "Breakouts",
  value: "Value",
  wear_under_makeup: "Wear under makeup"
};

export const ANALYSIS_STAGE_LABELS: Record<ProgressStage, string> = {
  validate: "Validate request",
  plan: "Plan source coverage",
  extract: "Gather evidence",
  normalize: "Normalize inputs",
  reason: "Reason over evidence",
  rank: "Rank sellers and alternatives",
  assemble: "Assemble final report"
};

export const INGREDIENT_ALIASES: Record<string, string> = {
  parfum: "fragrance",
  fragrance: "fragrance",
  "sodium hyaluronate": "hyaluronic acid",
  "niacinamide ": "niacinamide",
  tocopherol: "vitamin e",
  "citrullus lanatus fruit extract": "watermelon extract"
};
