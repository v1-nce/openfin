import { scoreToConfidence, uniqueStrings } from "@/lib/format";
import type {
  NormalizedEditorialSignal,
  NormalizedReviewSignal,
  SentimentTheme
} from "@/schemas";

type Signal =
  | NormalizedReviewSignal
  | NormalizedEditorialSignal;

export function synthesizeSentimentThemes(
  reviewSignals: NormalizedReviewSignal[],
  editorialSignals: NormalizedEditorialSignal[],
  socialSignals: NormalizedReviewSignal[]
): SentimentTheme[] {
  const grouped = new Map<string, Signal[]>();
  const allSignals: Signal[] = [
    ...reviewSignals,
    ...editorialSignals,
    ...socialSignals
  ];

  for (const signal of allSignals) {
    const current = grouped.get(signal.theme) ?? [];
    current.push(signal);
    grouped.set(signal.theme, current);
  }

  return Array.from(grouped.entries())
    .map(([theme, signals]) => {
      const positiveSignals = signals.filter((signal) => signal.sentiment === "positive");
      const negativeSignals = signals.filter((signal) => signal.sentiment === "negative");
      const positiveSummary = positiveSignals.sort(
        (left, right) => right.mentions - left.mentions
      )[0]?.summary;
      const negativeSummary = negativeSignals.sort(
        (left, right) => right.mentions - left.mentions
      )[0]?.summary;
      const polarity: SentimentTheme["polarity"] =
        positiveSignals.length && negativeSignals.length
          ? "mixed"
          : positiveSignals.length
            ? "positive"
            : "negative";
      const sourceTypes = uniqueStrings(
        signals.map((signal) => signal.source.type)
      );
      const evidenceIds = uniqueStrings(
        signals.flatMap((signal) => signal.evidenceIds)
      );
      const weight =
        signals.reduce((total, signal) => total + signal.mentions, 0) +
        sourceTypes.length * 4;

      return {
        theme: theme as SentimentTheme["theme"],
        polarity,
        positiveSummary,
        negativeSummary,
        confidence: scoreToConfidence(Math.min(92, 45 + weight / 2)),
        supportingSourceTypes: sourceTypes as SentimentTheme["supportingSourceTypes"],
        evidenceIds
      };
    })
    .sort((left, right) => right.evidenceIds.length - left.evidenceIds.length);
}
