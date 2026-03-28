import { THEME_LABELS } from "@/lib/constants";
import { scoreToConfidence, uniqueStrings } from "@/lib/format";
import type { FitAssessment } from "@/domain/personal-fit";
import type {
  ContradictionFinding,
  IngredientFlag,
  NormalizedEditorialSignal,
  NormalizedReviewSignal
} from "@/schemas";

export function detectContradictions(options: {
  editorialSignals: NormalizedEditorialSignal[];
  reviewSignals: NormalizedReviewSignal[];
  socialSignals: NormalizedReviewSignal[];
  ingredientFlags: IngredientFlag[];
  fitAssessment: FitAssessment;
}): ContradictionFinding[] {
  const findings: ContradictionFinding[] = [];

  for (const editorialSignal of options.editorialSignals.filter(
    (signal) => signal.sentiment === "positive"
  )) {
    const opposingReview = options.reviewSignals.find(
      (signal) =>
        signal.theme === editorialSignal.theme && signal.sentiment === "negative"
    );

    if (!opposingReview) {
      continue;
    }

    findings.push({
      id: `editorial-vs-consumer-${editorialSignal.theme}`,
      title: `${THEME_LABELS[editorialSignal.theme]} looks stronger in editorial coverage than in consumer feedback`,
      summary:
        "Editorial praise is not fully mirrored by repeated retailer complaints, so the surface-level hype is less stable than it first appears.",
      severity:
        opposingReview.mentions >= 12 ? "high" : "medium",
      confidence: scoreToConfidence(70 + Math.min(opposingReview.mentions, 20)),
      supportingEvidenceIds: editorialSignal.evidenceIds,
      counterEvidenceIds: opposingReview.evidenceIds
    });
  }

  const highRiskFlags = options.ingredientFlags.filter(
    (flag) => flag.severity === "high"
  );
  const socialHype = options.socialSignals.filter(
    (signal) => signal.sentiment === "positive"
  );

  if (socialHype.length && (highRiskFlags.length || options.fitAssessment.score < 65)) {
    findings.push({
      id: "social-hype-vs-profile-fit",
      title: "Social enthusiasm is stronger than the personalized fit",
      summary:
        "Creator and discussion signals are positive, but the user's profile introduces caution that the hype does not address.",
      severity: highRiskFlags.length ? "high" : "medium",
      confidence: scoreToConfidence(68 + highRiskFlags.length * 8),
      supportingEvidenceIds: uniqueStrings(
        socialHype.flatMap((signal) => signal.evidenceIds)
      ),
      counterEvidenceIds: uniqueStrings(
        highRiskFlags.flatMap((flag) => flag.evidenceIds)
      )
    });
  }

  return findings.slice(0, 3);
}
