import { formatMoney, scoreToConfidence } from "@/lib/format";
import type {
  AlternativeCandidate,
  AlternativeRecommendation,
  UserProfile
} from "@/schemas";

export function recommendAlternatives(
  candidates: AlternativeCandidate[],
  userProfile: UserProfile
): AlternativeRecommendation[] {
  return candidates
    .map((candidate) => {
      let score = 52;
      let reason =
        candidate.reasonHints[0] ?? "Potential alternative with a similar role.";
      let tradeoff = candidate.riskTags[0];

      if (
        userProfile.preferences.fragranceFree &&
        candidate.reasonHints.some((hint) =>
          hint.toLowerCase().includes("fragrance-free")
        )
      ) {
        score += 18;
        reason = "Better match for fragrance sensitivity while staying close to the same use case.";
      }

      if (
        userProfile.preferences.lightweight &&
        candidate.fitTags.some((tag) => tag.toLowerCase().includes("lightweight"))
      ) {
        score += 10;
        if (!reason.toLowerCase().includes("lightweight")) {
          reason = "Keeps the lightweight feel the user asked for.";
        }
      }

      if (
        userProfile.budgetRange.max &&
        candidate.price &&
        candidate.price.amount <= userProfile.budgetRange.max
      ) {
        score += 8;
      }

      if (
        userProfile.sensitivities.length &&
        candidate.fitTags.some((tag) => tag.includes("sensitive"))
      ) {
        score += 10;
      }

      if (
        candidate.riskTags.some((tag) => tag.toLowerCase().includes("richer")) &&
        userProfile.skinType === "oily"
      ) {
        score -= 6;
        tradeoff = candidate.riskTags[0];
      }

      return {
        id: candidate.id,
        productName: candidate.productName,
        brand: candidate.brand,
        reason,
        tradeoff,
        confidence: scoreToConfidence(score),
        priceSummary: formatMoney(candidate.price)
      };
    })
    .sort((left, right) =>
      ["high", "medium", "low"].indexOf(left.confidence) -
      ["high", "medium", "low"].indexOf(right.confidence)
    )
    .slice(0, 3);
}
