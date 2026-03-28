import { clampScore } from "@/lib/format";
import type {
  IngredientFlag,
  NormalizedProduct,
  UserProfile
} from "@/schemas";

export type FitAssessment = {
  score: number;
  reasons: string[];
  cautions: string[];
};

export function assessPersonalFit(
  product: NormalizedProduct,
  userProfile: UserProfile,
  ingredientFlags: IngredientFlag[]
): FitAssessment {
  let score = 68;
  const reasons: string[] = [];
  const cautions: string[] = [];
  const desired = userProfile.desiredCharacteristics.map((value) =>
    value.toLowerCase()
  );
  const productTags = [
    ...product.textureTags.map((value) => value.toLowerCase()),
    ...product.finishTags.map((value) => value.toLowerCase())
  ];

  if (
    userProfile.preferences.lightweight &&
    productTags.some((tag) => ["lightweight", "gel"].includes(tag))
  ) {
    score += 10;
    reasons.push("The texture profile looks aligned with the user's lightweight preference.");
  }

  if (
    userProfile.skinType === "oily" &&
    productTags.some((tag) => ["dewy", "glowy"].includes(tag))
  ) {
    score -= 6;
    cautions.push("The finish leans dewy, which may feel shinier on oily skin.");
  }

  if (
    ["dry", "normal"].includes(userProfile.skinType) &&
    productTags.some((tag) => ["dewy", "cream"].includes(tag))
  ) {
    score += 5;
    reasons.push("The finish looks supportive for skin that can tolerate a little more moisture.");
  }

  if (
    desired.includes("layers under makeup") &&
    product.officialClaims.some((claim) => claim.toLowerCase().includes("makeup"))
  ) {
    score += 6;
    reasons.push("Official claims suggest it is designed to layer under makeup.");
  }

  if (userProfile.preferences.crueltyFree && product.crueltyFree) {
    score += 4;
    reasons.push("The product appears to meet the user's cruelty-free preference.");
  }

  if (
    userProfile.preferences.finish &&
    !productTags.includes(userProfile.preferences.finish)
  ) {
    score -= 3;
    cautions.push("The finish profile is not a perfect match for the user's preferred look.");
  }

  if (
    userProfile.budgetRange.max &&
    product.price &&
    product.price.amount > userProfile.budgetRange.max
  ) {
    const overageRatio =
      (product.price.amount - userProfile.budgetRange.max) /
      userProfile.budgetRange.max;
    score -= Math.min(18, 6 + overageRatio * 20);
    cautions.push("The product sits above the user's preferred budget.");
  } else if (
    userProfile.budgetRange.max &&
    product.price &&
    product.price.amount <= userProfile.budgetRange.max
  ) {
    score += 4;
    reasons.push("The product stays within the user's budget ceiling.");
  }

  for (const flag of ingredientFlags) {
    if (flag.severity === "high") {
      score -= 16;
    } else if (flag.severity === "medium") {
      score -= 9;
    } else {
      score -= 4;
    }
  }

  if (!ingredientFlags.length) {
    reasons.push("There are no direct ingredient matches against the user's stated sensitivities.");
  }

  return {
    score: clampScore(score),
    reasons,
    cautions
  };
}
