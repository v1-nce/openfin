import type { ConfidenceLevel, Money, SourceType, Verdict } from "@/schemas";

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function formatMoney(money?: Money): string {
  if (!money) {
    return "Unknown";
  }

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: money.currency
    }).format(money.amount);
  } catch {
    return `${money.currency} ${money.amount.toFixed(2)}`;
  }
}

export function formatVerdictLabel(verdict: Verdict): string {
  return {
    buy: "Buy",
    cautious_try: "Cautious Try",
    skip: "Skip"
  }[verdict];
}

export function formatConfidenceLabel(confidence: ConfidenceLevel): string {
  return {
    high: "High confidence",
    medium: "Medium confidence",
    low: "Low confidence"
  }[confidence];
}

export function formatSourceTypeLabel(sourceType: SourceType): string {
  return sourceType
    .split("_")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

export function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

export function average(values: number[]): number {
  if (!values.length) {
    return 0;
  }

  return values.reduce((total, value) => total + value, 0) / values.length;
}

export function median(values: number[]): number {
  if (!values.length) {
    return 0;
  }

  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

export function confidenceToScore(confidence: ConfidenceLevel): number {
  return {
    high: 90,
    medium: 70,
    low: 45
  }[confidence];
}

export function scoreToConfidence(score: number): ConfidenceLevel {
  if (score >= 80) {
    return "high";
  }

  if (score >= 60) {
    return "medium";
  }

  return "low";
}
