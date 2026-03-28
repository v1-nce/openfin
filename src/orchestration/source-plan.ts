import { ANALYSIS_STAGE_LABELS, SOURCE_TYPE_LABELS } from "@/lib/constants";
import type {
  AnalyzeRequest,
  ProgressStep,
  SourcePlan,
  SourceType
} from "@/schemas";

export function buildSourcePlan(request: AnalyzeRequest): SourcePlan {
  const requestedTypes: SourceType[] = [
    "official",
    "retailer",
    "editorial",
    "seller"
  ];

  if (
    request.userProfile.sensitivities.length ||
    request.userProfile.dislikedProducts.length
  ) {
    requestedTypes.push("ingredient_reference");
  }

  if (
    request.product.category === "moisturizer" ||
    request.product.category === "sunscreen"
  ) {
    requestedTypes.push("social");
  }

  const tasks = Array.from(new Set(requestedTypes)).map((type, index) => ({
    id: `${type}-${index + 1}`,
    type,
    label: SOURCE_TYPE_LABELS[type],
    rationale:
      type === "official"
        ? "Needed for product facts, claims, and ingredients."
        : type === "retailer"
          ? "Needed for repeated consumer themes and complaints."
          : type === "editorial"
            ? "Needed for narrative context and comparisons."
            : type === "ingredient_reference"
              ? "Needed to support ingredient caution explanations."
              : type === "seller"
                ? "Needed to rank buying options on trust and value."
                : "Useful as a secondary trend and anecdote layer.",
    priority: index < 3 ? 1 : type === "seller" ? 2 : 3
  }));

  const warnings =
    request.mode === "live"
      ? []
      : [
          "Demo-safe provider mode is enabled, so the pipeline will use seeded evidence instead of live crawling."
        ];

  return {
    mode: request.mode,
    tasks,
    expectedSourceTypes: tasks.map((task) => task.type),
    fallbackUsed: request.mode !== "live",
    warnings
  };
}

export function buildCompletedProgress(): ProgressStep[] {
  const stages = [
    "validate",
    "plan",
    "extract",
    "normalize",
    "reason",
    "rank",
    "assemble"
  ] as const;

  return stages.map((stage) => ({
    stage,
    label: ANALYSIS_STAGE_LABELS[stage],
    status: "completed"
  }));
}
