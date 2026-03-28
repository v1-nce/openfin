import { INGREDIENT_ALIASES } from "@/lib/constants";
import { uniqueStrings } from "@/lib/format";
import type {
  IngredientFlag,
  IngredientSeverity,
  NormalizedIngredientList,
  UserProfile
} from "@/schemas";

export type IngredientAnalysisResult = {
  flags: IngredientFlag[];
  normalizedIngredientNames: string[];
};

export function normalizeIngredientName(value: string): string {
  const cleaned = value.trim().toLowerCase();
  return INGREDIENT_ALIASES[cleaned] ?? cleaned;
}

function severityRank(severity: IngredientSeverity): number {
  return {
    low: 1,
    medium: 2,
    high: 3
  }[severity];
}

function mergeSeverity(
  current: IngredientSeverity,
  incoming: IngredientSeverity
): IngredientSeverity {
  return severityRank(incoming) > severityRank(current) ? incoming : current;
}

export function analyzeIngredients(
  ingredientList: NormalizedIngredientList,
  userProfile: UserProfile
): IngredientAnalysisResult {
  const sensitivitySet = new Set(
    userProfile.sensitivities.map((value) => normalizeIngredientName(value))
  );
  const results = new Map<string, IngredientFlag>();

  for (const item of ingredientList.items) {
    const normalizedName = normalizeIngredientName(
      item.normalizedName || item.name
    );
    const directSensitivity = sensitivitySet.has(normalizedName);
    const prefersFragranceFree =
      userProfile.preferences.fragranceFree && normalizedName === "fragrance";
    const dislikedOverlap = userProfile.dislikedProducts.filter((product) =>
      product.suspectedIngredients
        .map((ingredient) => normalizeIngredientName(ingredient))
        .includes(normalizedName)
    );

    if (!directSensitivity && !prefersFragranceFree && !dislikedOverlap.length) {
      continue;
    }

    const relatedDislikedProducts = dislikedOverlap.map(
      (product) => product.productName
    );

    const reasonParts: string[] = [];
    let severity: IngredientSeverity = "medium";

    if (directSensitivity) {
      reasonParts.push(
        `Contains ${item.name}, which the user marked as a sensitivity.`
      );
      severity = "high";
    }

    if (prefersFragranceFree) {
      reasonParts.push(
        "Contains added fragrance, which conflicts with the user's fragrance-free preference."
      );
      severity = mergeSeverity(severity, "high");
    }

    if (relatedDislikedProducts.length) {
      reasonParts.push(
        `This ingredient overlaps with products the user previously disliked: ${relatedDislikedProducts.join(", ")}.`
      );
      severity = mergeSeverity(
        severity,
        directSensitivity ? "high" : "medium"
      );
    }

    const existing = results.get(normalizedName);

    if (existing) {
      existing.severity = mergeSeverity(existing.severity, severity);
      existing.relatedDislikedProducts = uniqueStrings([
        ...existing.relatedDislikedProducts,
        ...relatedDislikedProducts
      ]);
      existing.reason = uniqueStrings([existing.reason, ...reasonParts]).join(" ");
      existing.evidenceIds = uniqueStrings([
        ...existing.evidenceIds,
        ...ingredientList.evidenceIds
      ]);
      continue;
    }

    results.set(normalizedName, {
      ingredientName: item.name,
      severity,
      reason: reasonParts.join(" "),
      matchedSensitivity: directSensitivity ? normalizedName : undefined,
      relatedDislikedProducts,
      evidenceIds: ingredientList.evidenceIds
    });
  }

  return {
    flags: Array.from(results.values()),
    normalizedIngredientNames: uniqueStrings(
      ingredientList.items.map((item) =>
        normalizeIngredientName(item.normalizedName || item.name)
      )
    )
  };
}
