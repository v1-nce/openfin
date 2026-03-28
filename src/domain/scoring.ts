import { average, clampScore, confidenceToScore, scoreToConfidence } from "@/lib/format";
import type {
  FinalVerdict,
  IngredientFlag,
  ScoreBreakdown,
  SellerRankingItem,
  SentimentTheme,
  SourceEvidence,
  UserProfile
} from "@/schemas";
import type { FitAssessment } from "@/domain/personal-fit";

function ingredientCompatibilityScore(flags: IngredientFlag[]): number {
  let score = 92;

  for (const flag of flags) {
    if (flag.severity === "high") {
      score -= 22;
    } else if (flag.severity === "medium") {
      score -= 12;
    } else {
      score -= 6;
    }
  }

  return clampScore(score);
}

function sentimentScore(themes: SentimentTheme[]): number {
  if (!themes.length) {
    return 55;
  }

  let score = 60;

  for (const theme of themes) {
    if (theme.polarity === "positive") {
      score += 8;
    } else if (theme.polarity === "mixed") {
      score += 2;
    } else {
      score -= 8;
    }
  }

  return clampScore(score);
}

function evidenceConfidenceScore(evidence: SourceEvidence[]): number {
  if (!evidence.length) {
    return 45;
  }

  const diversityBonus = new Set(evidence.map((item) => item.source.type)).size * 6;
  const averageConfidence = average(
    evidence.map((item) => confidenceToScore(item.confidence))
  );
  return clampScore(averageConfidence * 0.75 + diversityBonus);
}

export function scoreRecommendation(options: {
  userProfile: UserProfile;
  fitAssessment: FitAssessment;
  ingredientFlags: IngredientFlag[];
  sentimentThemes: SentimentTheme[];
  sellerRankings: SellerRankingItem[];
  evidence: SourceEvidence[];
}): {
  breakdown: ScoreBreakdown;
  verdict: FinalVerdict;
} {
  const ingredientCompatibility = ingredientCompatibilityScore(
    options.ingredientFlags
  );
  const sentiment = sentimentScore(options.sentimentThemes);
  const evidenceConfidence = evidenceConfidenceScore(options.evidence);
  const sellerTrustValue = options.sellerRankings[0]?.purchaseScore ?? 58;

  const weights = options.userProfile.preferenceWeights;
  const weightTotal =
    weights.fit +
    weights.ingredients +
    weights.sentiment +
    weights.evidence +
    weights.seller;

  const normalizedWeights = {
    fit: weights.fit / weightTotal,
    ingredients: weights.ingredients / weightTotal,
    sentiment: weights.sentiment / weightTotal,
    evidence: weights.evidence / weightTotal,
    seller: weights.seller / weightTotal
  };

  const total = clampScore(
    options.fitAssessment.score * normalizedWeights.fit +
      ingredientCompatibility * normalizedWeights.ingredients +
      sentiment * normalizedWeights.sentiment +
      evidenceConfidence * normalizedWeights.evidence +
      sellerTrustValue * normalizedWeights.seller
  );

  const verdict =
    total >= 80 ? "buy" : total >= 60 ? "cautious_try" : "skip";
  const topReasons = [
    ...options.fitAssessment.reasons,
    ...options.sentimentThemes
      .filter((theme) => theme.polarity === "positive")
      .map((theme) => theme.positiveSummary)
      .filter(Boolean)
      .slice(0, 2)
  ] as string[];
  const topCautions = [
    ...options.fitAssessment.cautions,
    ...options.ingredientFlags.map((flag) => flag.reason)
  ].slice(0, 3);

  const summary =
    verdict === "buy"
      ? "Strong enough multi-source support and profile fit to recommend buying."
      : verdict === "cautious_try"
        ? "There is real upside here, but profile-specific caution keeps this in trial-first territory."
        : "The current evidence points to more downside than upside for this user profile.";

  return {
    breakdown: {
      personalFit: options.fitAssessment.score,
      ingredientCompatibility,
      sentiment,
      evidenceConfidence,
      sellerTrustValue,
      total,
      notes: [
        "Scores are heuristic and intentionally explainable.",
        "Evidence confidence drops when sources are sparse or conflicting."
      ]
    },
    verdict: {
      verdict,
      confidence: scoreToConfidence(
        average([evidenceConfidence, sellerTrustValue, total])
      ),
      summary,
      topReasons,
      topCautions,
      supportingEvidenceIds: options.sentimentThemes
        .flatMap((theme) => theme.evidenceIds)
        .slice(0, 4),
      counterEvidenceIds: options.ingredientFlags
        .flatMap((flag) => flag.evidenceIds)
        .slice(0, 4)
    }
  };
}
