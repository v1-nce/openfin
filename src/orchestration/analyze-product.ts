import { analyzeIngredients } from "@/domain/ingredient-analysis";
import { recommendAlternatives } from "@/domain/alternatives";
import { detectContradictions } from "@/domain/contradictions";
import { assessPersonalFit } from "@/domain/personal-fit";
import { scoreRecommendation } from "@/domain/scoring";
import { rankSellerOffers } from "@/domain/seller-ranking";
import { synthesizeSentimentThemes } from "@/domain/sentiment";
import { runProviderExtraction } from "@/providers";
import {
  AnalyzeRequestSchema,
  type AnalyzeRequest,
  type ProductReport,
  type SourceType
} from "@/schemas";
import { buildCompletedProgress, buildSourcePlan } from "@/orchestration/source-plan";

function buildSourceCoverage(
  report: Pick<ProductReport, "evidence" | "sourcePlan">
): ProductReport["sourceCoverage"] {
  const covered = Array.from(
    new Set(report.evidence.map((item) => item.source.type))
  ) as SourceType[];
  const missing = report.sourcePlan.expectedSourceTypes.filter(
    (type) => !covered.includes(type)
  );

  return {
    coveredSourceTypes: covered,
    missingSourceTypes: missing,
    sourceCount: report.evidence.length
  };
}

function buildKnowledgeSummary(report: {
  product: ProductReport["product"];
  ingredientFlags: ProductReport["ingredientFlags"];
  sentimentThemes: ProductReport["sentimentThemes"];
  contradictionFindings: ProductReport["contradictionFindings"];
  sellerRankings: ProductReport["sellerRankings"];
  sourceCoverage: ProductReport["sourceCoverage"];
}) {
  const whatWeKnow = [
    `The official product data supports ${report.product.name} as a ${report.product.category} from ${report.product.brand}.`,
    ...report.sentimentThemes
      .filter((theme) => theme.polarity === "positive")
      .slice(0, 2)
      .map(
        (theme) =>
          theme.positiveSummary ?? `There is positive evidence around ${theme.theme}.`
      )
  ];

  if (report.sellerRankings[0]) {
    whatWeKnow.push(
      `${report.sellerRankings[0].offer.sellerName} is the best-ranked current seller option in the available market set.`
    );
  }

  const lessCertainAbout = [
    ...report.ingredientFlags.slice(0, 2).map((flag) => flag.reason),
    ...report.contradictionFindings.map((finding) => finding.summary)
  ];

  if (report.sourceCoverage.missingSourceTypes.length) {
    lessCertainAbout.push(
      `Some planned source classes were unavailable: ${report.sourceCoverage.missingSourceTypes.join(", ")}.`
    );
  }

  return {
    whatWeKnow: whatWeKnow.slice(0, 4),
    lessCertainAbout: lessCertainAbout.slice(0, 4)
  };
}

export async function analyzeProduct(
  requestInput: AnalyzeRequest
): Promise<ProductReport> {
  const request = AnalyzeRequestSchema.parse(requestInput);
  const sourcePlan = buildSourcePlan(request);
  const extraction = await runProviderExtraction(request, sourcePlan);
  const ingredientAnalysis = analyzeIngredients(
    extraction.ingredientList,
    request.userProfile
  );
  const fitAssessment = assessPersonalFit(
    extraction.product,
    request.userProfile,
    ingredientAnalysis.flags
  );
  const sentimentThemes = synthesizeSentimentThemes(
    extraction.reviewSignals,
    extraction.editorialSignals,
    extraction.socialSignals
  );
  const contradictionFindings = detectContradictions({
    editorialSignals: extraction.editorialSignals,
    reviewSignals: extraction.reviewSignals,
    socialSignals: extraction.socialSignals,
    ingredientFlags: ingredientAnalysis.flags,
    fitAssessment
  });
  const sellerRankings = rankSellerOffers(extraction.sellerOffers);
  const alternatives = recommendAlternatives(
    extraction.alternativeCandidates,
    request.userProfile
  );
  const scored = scoreRecommendation({
    userProfile: request.userProfile,
    fitAssessment,
    ingredientFlags: ingredientAnalysis.flags,
    sentimentThemes,
    sellerRankings,
    evidence: extraction.evidence
  });

  const provisionalReport = {
    request,
    sourcePlan: {
      ...sourcePlan,
      warnings: [...sourcePlan.warnings, ...extraction.warnings],
      fallbackUsed: sourcePlan.fallbackUsed || extraction.usedFallback
    },
    progress: buildCompletedProgress(),
    product: extraction.product,
    ingredientFlags: ingredientAnalysis.flags,
    sentimentThemes,
    contradictionFindings,
    alternatives,
    sellerRankings,
    scoreBreakdown: scored.breakdown,
    finalVerdict: scored.verdict,
    evidence: extraction.evidence,
    sourceCoverage: {
      coveredSourceTypes: [],
      missingSourceTypes: [],
      sourceCount: 0
    },
    whatWeKnow: [],
    lessCertainAbout: [],
    providerName: extraction.providerName,
    warnings: [...sourcePlan.warnings, ...extraction.warnings]
  } satisfies Omit<ProductReport, "sourceCoverage" | "whatWeKnow" | "lessCertainAbout"> & {
    sourceCoverage: ProductReport["sourceCoverage"];
    whatWeKnow: string[];
    lessCertainAbout: string[];
  };

  const sourceCoverage = buildSourceCoverage(provisionalReport);
  const knowledge = buildKnowledgeSummary({
    product: provisionalReport.product,
    ingredientFlags: provisionalReport.ingredientFlags,
    sentimentThemes: provisionalReport.sentimentThemes,
    contradictionFindings: provisionalReport.contradictionFindings,
    sellerRankings: provisionalReport.sellerRankings,
    sourceCoverage
  });

  return {
    ...provisionalReport,
    sourceCoverage,
    whatWeKnow: knowledge.whatWeKnow,
    lessCertainAbout: knowledge.lessCertainAbout
  };
}
