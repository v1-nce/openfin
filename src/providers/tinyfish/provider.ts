import { SOURCE_TYPE_LABELS, THEME_LABELS } from "@/lib/constants";
import { slugify, uniqueStrings } from "@/lib/format";
import { MockProvider } from "@/providers/mock/provider";
import type {
  ExtractionProvider,
  ProviderExtractionBundle,
  ProviderUpdate
} from "@/providers/types";
import type {
  AnalysisPreview,
  AlternativeCandidate,
  AnalyzeRequest,
  ConfidenceLevel,
  NormalizedEditorialSignal,
  NormalizedReviewSignal,
  SourceEvidence,
  SourcePlan,
  SourceType
} from "@/schemas";

const TINYFISH_ENDPOINT = "https://mino.ai/v1/automation/run-sse";
const DEFAULT_TINYFISH_TIMEOUT_MS = 180_000;
const DEFAULT_TINYFISH_INACTIVITY_TIMEOUT_MS = 45_000;
const DEFAULT_DIRECT_URL_PRODUCT_PASS_TIMEOUT_MS = 32_000;
const DEFAULT_DIRECT_URL_PRODUCT_PASS_INACTIVITY_TIMEOUT_MS = 20_000;
const DEFAULT_SEARCH_FIRST_PRODUCT_PASS_TIMEOUT_MS = 55_000;
const DEFAULT_SEARCH_FIRST_PRODUCT_PASS_INACTIVITY_TIMEOUT_MS = 30_000;
const DEFAULT_DIRECT_URL_SUPPORT_PASS_TIMEOUT_MS = 24_000;
const DEFAULT_DIRECT_URL_SUPPORT_PASS_INACTIVITY_TIMEOUT_MS = 15_000;
const DEFAULT_SEARCH_FIRST_SUPPORT_PASS_TIMEOUT_MS = 36_000;
const DEFAULT_SEARCH_FIRST_SUPPORT_PASS_INACTIVITY_TIMEOUT_MS = 20_000;
const PRIORITY_SUPPORT_DOMAINS = {
  retailer: [
    "sephora.com",
    "ulta.com",
    "target.com",
    "dermstore.com",
    "amazon.com"
  ],
  editorial: [
    "allure.com",
    "byrdie.com",
    "whowhatwear.com",
    "harpersbazaar.com",
    "stylecaster.com"
  ],
  social: ["reddit.com", "makeupalley.com"],
  ingredient_reference: [
    "incidecoder.com",
    "paulaschoice.com",
    "cosmeticsinfo.org"
  ]
} as const;

type TinyFishCitation = {
  title?: string;
  snippet?: string;
  url?: string;
  sourceName?: string;
  source_name?: string;
  sourceType?: string;
  source_type?: string;
};

type TinyFishSellerOffer = {
  sellerName?: string;
  seller_name?: string;
  sellerType?: string;
  seller_type?: string;
  url?: string;
  price?: number | string;
  currency?: string;
  sizeValue?: number | string;
  size_value?: number | string;
  sizeUnit?: string;
  size_unit?: string;
  sampleAvailable?: boolean;
  sample_available?: boolean;
  returnPolicyVisible?: boolean;
  return_policy_visible?: boolean;
  contactInfoVisible?: boolean;
  contact_info_visible?: boolean;
  shippingSummary?: string;
  shipping_summary?: string;
};

type TinyFishProductResult = {
  productName?: string;
  product_name?: string;
  brand?: string;
  category?: string;
  price?: number | string;
  currency?: string;
  sizeValue?: number | string;
  size_value?: number | string;
  sizeUnit?: string;
  size_unit?: string;
  ingredients?: string[] | string;
  officialClaims?: string[] | string;
  official_claims?: string[] | string;
  textureTags?: string[] | string;
  texture_tags?: string[] | string;
  finishTags?: string[] | string;
  finish_tags?: string[] | string;
  pageUrl?: string;
  page_url?: string;
  citations?: TinyFishCitation[];
  sellerOffers?: TinyFishSellerOffer[];
  seller_offers?: TinyFishSellerOffer[];
};

type TinyFishSignal = {
  theme?: string;
  sentiment?: string;
  summary?: string;
  mentions?: number | string;
  averageRating?: number | string;
  average_rating?: number | string;
  sourceName?: string;
  source_name?: string;
  sourceUrl?: string;
  source_url?: string;
  snippet?: string;
  confidence?: string;
  comparisonProducts?: string[] | string;
  comparison_products?: string[] | string;
};

type TinyFishIngredientReference = {
  ingredientName?: string;
  ingredient_name?: string;
  finding?: string;
  summary?: string;
  tags?: string[] | string;
  sourceName?: string;
  source_name?: string;
  sourceUrl?: string;
  source_url?: string;
  snippet?: string;
  confidence?: string;
};

type TinyFishAlternative = {
  productName?: string;
  product_name?: string;
  brand?: string;
  category?: string;
  price?: number | string;
  currency?: string;
  reasonHints?: string[] | string;
  reason_hints?: string[] | string;
  fitTags?: string[] | string;
  fit_tags?: string[] | string;
  riskTags?: string[] | string;
  risk_tags?: string[] | string;
  sourceName?: string;
  source_name?: string;
  sourceUrl?: string;
  source_url?: string;
  snippet?: string;
  confidence?: string;
};

type TinyFishSignalsResult = {
  retailerSignals?: TinyFishSignal[];
  retailer_signals?: TinyFishSignal[];
  editorialSignals?: TinyFishSignal[];
  editorial_signals?: TinyFishSignal[];
  socialSignals?: TinyFishSignal[];
  social_signals?: TinyFishSignal[];
  ingredientReferences?: TinyFishIngredientReference[];
  ingredient_references?: TinyFishIngredientReference[];
  alternatives?: TinyFishAlternative[];
};

type SupportSourceType =
  | "retailer"
  | "editorial"
  | "social"
  | "ingredient_reference";

type TinyFishRunOptions = {
  apiKey: string;
  startUrl: string;
  goal: string;
  overallTimeoutMs?: number;
  inactivityTimeoutMs?: number;
  onStreamEvent?: (event: {
    type?: string;
    status?: string;
    message?: string;
    url?: string;
    currentUrl?: string;
    current_url?: string;
  }) => void;
};

type ProductContext = {
  productName: string;
  brand: string;
  category: "moisturizer" | "sunscreen" | "serum" | "cleanser" | "other";
  pageUrl?: string;
  ingredients: string[];
  currency: string;
};

function isSearchFirstRequest(request: AnalyzeRequest): boolean {
  return request.product.queryType !== "url";
}

function getProductPassTimeoutMs(request: AnalyzeRequest): number {
  return Number(
    process.env.SIGNALSKIN_TINYFISH_PRODUCT_TIMEOUT_MS ??
      process.env.SIGNALSKIN_TINYFISH_TIMEOUT_MS ??
      (isSearchFirstRequest(request)
        ? DEFAULT_SEARCH_FIRST_PRODUCT_PASS_TIMEOUT_MS
        : DEFAULT_DIRECT_URL_PRODUCT_PASS_TIMEOUT_MS)
  );
}

function getProductPassInactivityTimeoutMs(request: AnalyzeRequest): number {
  return Number(
    process.env.SIGNALSKIN_TINYFISH_PRODUCT_INACTIVITY_TIMEOUT_MS ??
      process.env.SIGNALSKIN_TINYFISH_INACTIVITY_TIMEOUT_MS ??
      (isSearchFirstRequest(request)
        ? DEFAULT_SEARCH_FIRST_PRODUCT_PASS_INACTIVITY_TIMEOUT_MS
        : DEFAULT_DIRECT_URL_PRODUCT_PASS_INACTIVITY_TIMEOUT_MS)
  );
}

function getSupportPassTimeoutMs(request: AnalyzeRequest): number {
  return Number(
    process.env.SIGNALSKIN_TINYFISH_SUPPORT_TIMEOUT_MS ??
      process.env.SIGNALSKIN_TINYFISH_TIMEOUT_MS ??
      (isSearchFirstRequest(request)
        ? DEFAULT_SEARCH_FIRST_SUPPORT_PASS_TIMEOUT_MS
        : DEFAULT_DIRECT_URL_SUPPORT_PASS_TIMEOUT_MS)
  );
}

function getSupportPassInactivityTimeoutMs(request: AnalyzeRequest): number {
  return Number(
    process.env.SIGNALSKIN_TINYFISH_SUPPORT_INACTIVITY_TIMEOUT_MS ??
      process.env.SIGNALSKIN_TINYFISH_INACTIVITY_TIMEOUT_MS ??
      (isSearchFirstRequest(request)
        ? DEFAULT_SEARCH_FIRST_SUPPORT_PASS_INACTIVITY_TIMEOUT_MS
        : DEFAULT_DIRECT_URL_SUPPORT_PASS_INACTIVITY_TIMEOUT_MS)
  );
}

type EvidenceBuilderInput = {
  prefix: string;
  sourceType: SourceType;
  sourceName: string;
  url?: string;
  title?: string;
  snippet: string;
  confidence: ConfidenceLevel;
  claimType: SourceEvidence["claimType"];
  supports?: string[];
  tags?: string[];
};

function getTinyFishApiKey(): string | undefined {
  return process.env.TINYFISH_API_KEY ?? process.env.MINO_API_KEY;
}

function normalizeUrl(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }

  try {
    return new URL(value.trim()).toString();
  } catch {
    return undefined;
  }
}

function getDomain(url: string | undefined): string | undefined {
  if (!url) {
    return undefined;
  }

  try {
    return new URL(url).hostname;
  } catch {
    return undefined;
  }
}

function buildSearchUrl(query: string): string {
  return `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
}

function deriveProductSearchSeed(request: AnalyzeRequest): string {
  if (request.product.queryType === "name") {
    return request.product.rawQuery;
  }

  const safeUrl = normalizeUrl(request.product.rawQuery);

  if (!safeUrl) {
    return request.product.rawQuery;
  }

  try {
    const parsed = new URL(safeUrl);
    const slugTerms = parsed.pathname
      .split("/")
      .filter(Boolean)
      .at(-1)
      ?.replace(/\.[a-z0-9]+$/i, "")
      .replace(/[-_]+/g, " ")
      .replace(/[^\w\s]+/g, " ")
      .trim();
    const hostnameTerms = parsed.hostname
      .replace(/^www\./, "")
      .split(".")
      .slice(0, 2)
      .join(" ");

    return [slugTerms, hostnameTerms].filter(Boolean).join(" ").trim() || safeUrl;
  } catch {
    return request.product.rawQuery;
  }
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/[\n,;]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^0-9.]+/g, ""));
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (["true", "yes", "1"].includes(normalized)) {
      return true;
    }

    if (["false", "no", "0"].includes(normalized)) {
      return false;
    }
  }

  return undefined;
}

function inferCurrency(value: unknown, fallback = "USD"): string {
  if (typeof value === "string") {
    if (value.includes("£")) {
      return "GBP";
    }

    if (value.includes("€")) {
      return "EUR";
    }

    if (value.includes("$")) {
      return "USD";
    }

    const trimmed = value.trim().toUpperCase();
    if (trimmed.length === 3) {
      return trimmed;
    }
  }

  return fallback;
}

function pickText(...values: Array<unknown>): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
}

function formatTinyFishStreamActivity(
  label: string,
  event: {
    type?: string;
    status?: string;
    message?: string;
    url?: string;
    currentUrl?: string;
    current_url?: string;
  }
): string | undefined {
  const resolvedUrl = normalizeUrl(
    event.currentUrl ?? event.current_url ?? event.url
  );
  const domain = getDomain(resolvedUrl);
  const message = typeof event.message === "string" ? event.message.trim() : "";

  if (event.type === "STREAMING_URL" && domain) {
    return `${label} opened ${domain}.`;
  }

  if (event.type === "STARTED") {
    return `${label} started.`;
  }

  if (message) {
    return `${label}: ${message}`;
  }

  if (event.status === "COMPLETED") {
    return `${label} completed.`;
  }

  return undefined;
}

function normalizeCategory(
  value: string | undefined,
  fallback: AnalyzeRequest["product"]["category"]
): "moisturizer" | "sunscreen" | "serum" | "cleanser" | "other" {
  const normalized = value?.trim().toLowerCase();

  if (
    normalized === "moisturizer" ||
    normalized === "sunscreen" ||
    normalized === "serum" ||
    normalized === "cleanser" ||
    normalized === "other"
  ) {
    return normalized;
  }

  return fallback ?? "other";
}

function normalizeSizeUnit(
  value: string | undefined
): "ml" | "g" | "oz" | "count" | undefined {
  const normalized = value?.trim().toLowerCase();

  if (
    normalized === "ml" ||
    normalized === "g" ||
    normalized === "oz" ||
    normalized === "count"
  ) {
    return normalized;
  }

  return undefined;
}

function normalizeSellerType(
  value: string | undefined
): "official" | "authorized" | "retailer" | "marketplace" | "unknown" {
  const normalized = value?.trim().toLowerCase();

  if (
    normalized === "official" ||
    normalized === "authorized" ||
    normalized === "retailer" ||
    normalized === "marketplace" ||
    normalized === "unknown"
  ) {
    return normalized;
  }

  return "unknown";
}

function normalizeConfidence(
  value: string | undefined,
  fallback: ConfidenceLevel = "medium"
): ConfidenceLevel {
  const normalized = value?.trim().toLowerCase();

  if (normalized === "high" || normalized === "medium" || normalized === "low") {
    return normalized;
  }

  return fallback;
}

function normalizeSentiment(
  value: string | undefined
): "positive" | "negative" | "mixed" | undefined {
  const normalized = value?.trim().toLowerCase();

  if (
    normalized === "positive" ||
    normalized === "negative" ||
    normalized === "mixed"
  ) {
    return normalized;
  }

  if (normalized && ["good", "liked", "love", "praised"].includes(normalized)) {
    return "positive";
  }

  if (
    normalized &&
    ["bad", "disliked", "hate", "complaint", "complaints"].includes(normalized)
  ) {
    return "negative";
  }

  return undefined;
}

function normalizeTheme(value: string | undefined) {
  const normalized = value?.trim().toLowerCase().replace(/\s+/g, "_");

  if (!normalized) {
    return undefined;
  }

  if (normalized === "hydration" || normalized === "hydrating") {
    return "hydration" as const;
  }

  if (
    normalized === "irritation" ||
    normalized === "stinging" ||
    normalized === "burning" ||
    normalized === "redness"
  ) {
    return "irritation" as const;
  }

  if (
    normalized === "texture" ||
    normalized === "sticky" ||
    normalized === "greasy" ||
    normalized === "tacky"
  ) {
    return "texture" as const;
  }

  if (normalized === "finish" || normalized === "glow" || normalized === "dewy") {
    return "finish" as const;
  }

  if (normalized === "white_cast" || normalized === "white-cast") {
    return "white_cast" as const;
  }

  if (normalized === "pilling" || normalized === "pill" || normalized === "pills") {
    return "pilling" as const;
  }

  if (
    normalized === "breakouts" ||
    normalized === "breakout" ||
    normalized === "acne"
  ) {
    return "breakouts" as const;
  }

  if (
    normalized === "value" ||
    normalized === "price" ||
    normalized === "value_for_money"
  ) {
    return "value" as const;
  }

  if (
    normalized === "wear_under_makeup" ||
    normalized === "under_makeup" ||
    normalized === "makeup"
  ) {
    return "wear_under_makeup" as const;
  }

  return undefined;
}

function inferAvailability(
  value: string | undefined
): "in_stock" | "limited" | "unknown" | "out_of_stock" {
  const normalized = value?.trim().toLowerCase();

  if (!normalized) {
    return "unknown";
  }

  if (normalized.includes("out of stock") || normalized.includes("sold out")) {
    return "out_of_stock";
  }

  if (normalized.includes("limited")) {
    return "limited";
  }

  if (normalized.includes("in stock") || normalized.includes("available")) {
    return "in_stock";
  }

  return "unknown";
}

function buildSourceMetadata(
  sourceName: string,
  sourceType: SourceType,
  url: string | undefined
) {
  const safeUrl = normalizeUrl(url);

  return {
    id: slugify(`${sourceType}-${sourceName}`) || `${sourceType}-source`,
    name: sourceName,
    type: sourceType,
    url: safeUrl,
    domain: getDomain(safeUrl)
  };
}

function createEvidenceCollector() {
  const evidence: SourceEvidence[] = [];
  const idsByKey = new Map<string, string>();

  return {
    evidence,
    add(input: EvidenceBuilderInput): string | undefined {
      const snippet = input.snippet.trim();

      if (snippet.length < 8) {
        return undefined;
      }

      const safeUrl = normalizeUrl(input.url);
      const key = [
        input.sourceType,
        safeUrl ?? input.sourceName,
        input.title?.trim() ?? "",
        snippet
      ].join("|");
      const existingId = idsByKey.get(key);

      if (existingId) {
        return existingId;
      }

      const id = `${input.prefix}-${evidence.length + 1}`;
      evidence.push({
        id,
        source: buildSourceMetadata(input.sourceName, input.sourceType, safeUrl),
        title: input.title?.trim() || undefined,
        snippet,
        confidence: input.confidence,
        claimType: input.claimType,
        supports: input.supports ?? [],
        tags: uniqueStrings(input.tags ?? [])
      });
      idsByKey.set(key, id);
      return id;
    }
  };
}

function getProductStartUrl(request: AnalyzeRequest): string {
  if (request.product.queryType === "url") {
    return request.product.rawQuery;
  }

  return buildSearchUrl(
    `${request.product.rawQuery} official product ${request.product.country}`
  );
}

function getProductGoal(request: AnalyzeRequest): string {
  const searchInstruction =
    request.product.queryType === "url"
      ? "Extract facts from this product page."
      : `Find the most likely official product page for "${request.product.rawQuery}", open it, then extract product facts from that page.`;

  return `${searchInstruction}

Also identify up to 3 trustworthy current seller offers for the same product from the official site, authorized retailers, or major beauty retailers. Do not invent seller offers.

Return strict JSON only with this shape:
{
  "productName": string | null,
  "brand": string | null,
  "category": "moisturizer" | "sunscreen" | "serum" | "cleanser" | "other" | null,
  "price": number | null,
  "currency": string | null,
  "sizeValue": number | null,
  "sizeUnit": "ml" | "g" | "oz" | "count" | null,
  "ingredients": string[],
  "officialClaims": string[],
  "textureTags": string[],
  "finishTags": string[],
  "pageUrl": string | null,
  "citations": [{
    "title": string | null,
    "snippet": string | null,
    "url": string | null,
    "sourceName": string | null,
    "sourceType": "official" | null
  }],
  "sellerOffers": [{
    "sellerName": string | null,
    "sellerType": "official" | "authorized" | "retailer" | "marketplace" | "unknown" | null,
    "url": string | null,
    "price": number | null,
    "currency": string | null,
    "sizeValue": number | null,
    "sizeUnit": "ml" | "g" | "oz" | "count" | null,
    "sampleAvailable": boolean | null,
    "returnPolicyVisible": boolean | null,
    "contactInfoVisible": boolean | null,
    "shippingSummary": string | null
  }]
}

Only include facts visible on pages you actually opened.`;
}

function buildSignalsSearchUrl(
  request: AnalyzeRequest,
  sourceType: SupportSourceType,
  context?: ProductContext
): string {
  const querySeed = context
    ? `${context.brand} ${context.productName}`
    : deriveProductSearchSeed(request);
  const sourceTerms =
    sourceType === "retailer"
      ? ["reviews", ...PRIORITY_SUPPORT_DOMAINS.retailer.slice(0, 3)]
      : sourceType === "editorial"
        ? ["review", "comparison", ...PRIORITY_SUPPORT_DOMAINS.editorial.slice(0, 3)]
        : sourceType === "social"
          ? ["reddit", "makeupalley", "discussion"]
          : ["ingredient", "incidecoder", "paulas choice"];
  const query = [
    querySeed,
    context?.category ?? request.product.category,
    ...sourceTerms,
    request.userProfile.market
  ]
    .filter(Boolean)
    .join(" ");

  return buildSearchUrl(query);
}

function getSignalsGoal(
  request: AnalyzeRequest,
  sourceType: SupportSourceType,
  context?: ProductContext
): string {
  const productLabel = context
    ? `${context.brand} ${context.productName}`
    : deriveProductSearchSeed(request);
  const relevantIngredients = uniqueStrings([
    ...request.userProfile.sensitivities,
    ...(context?.ingredients.slice(0, 8) ?? [])
  ]).slice(0, 8);
  const userContext = [
    `Skin type: ${request.userProfile.skinType}.`,
    request.userProfile.concerns.length
      ? `Concerns: ${request.userProfile.concerns.join(", ")}.`
      : undefined,
    request.userProfile.sensitivities.length
      ? `Known sensitivities: ${request.userProfile.sensitivities.join(", ")}.`
      : undefined,
    request.userProfile.desiredCharacteristics.length
      ? `Desired characteristics: ${request.userProfile.desiredCharacteristics.join(", ")}.`
      : undefined
  ]
    .filter(Boolean)
    .join(" ");
  const domainList = PRIORITY_SUPPORT_DOMAINS[sourceType].join(", ");
  const sourceLabel =
    sourceType === "retailer"
      ? "retailer review"
      : sourceType === "editorial"
        ? "editorial or blog review/comparison"
        : sourceType === "social"
          ? "discussion/social"
          : "ingredient reference";

  const commonPrefix = `Investigate this exact product on the live web: ${productLabel}.

Market focus: ${request.userProfile.market}.
${userContext}
Important ingredients to cross-check when possible: ${relevantIngredients.join(", ") || "use the most noteworthy visible ingredients from the product page"}.

Focus only on the ${sourceLabel} layer for this run.
Open at most 1 strong working ${sourceLabel} page, with 1 backup only if the first result is broken or irrelevant.

Prefer these reputable domains when they clearly match the exact product:
${domainList}

If a result is a broken link, soft-404, login wall, duplicate, or clearly about a different product or variant, skip it quickly and move on. Do not spend time browsing other source classes in this run.
`;

  if (sourceType === "retailer") {
    return `${commonPrefix}
Return strict JSON only with this shape:
{
  "retailerSignals": [{
    "theme": "hydration" | "irritation" | "texture" | "finish" | "white_cast" | "pilling" | "breakouts" | "value" | "wear_under_makeup",
    "sentiment": "positive" | "negative" | "mixed",
    "summary": string | null,
    "mentions": number | null,
    "averageRating": number | null,
    "sourceName": string | null,
    "sourceUrl": string | null,
    "snippet": string | null,
    "confidence": "high" | "medium" | "low" | null
  }]
}

Use only information from pages you actually opened. Prefer repeated themes over one-off claims.`;
  }

  if (sourceType === "editorial") {
    return `${commonPrefix}
Return strict JSON only with this shape:
{
  "editorialSignals": [{
    "theme": "hydration" | "irritation" | "texture" | "finish" | "white_cast" | "pilling" | "breakouts" | "value" | "wear_under_makeup",
    "sentiment": "positive" | "negative" | "mixed",
    "summary": string | null,
    "mentions": number | null,
    "sourceName": string | null,
    "sourceUrl": string | null,
    "snippet": string | null,
    "comparisonProducts": string[],
    "confidence": "high" | "medium" | "low" | null
  }],
  "alternatives": [{
    "productName": string | null,
    "brand": string | null,
    "category": "moisturizer" | "sunscreen" | "serum" | "cleanser" | "other" | null,
    "price": number | null,
    "currency": string | null,
    "reasonHints": string[],
    "fitTags": string[],
    "riskTags": string[],
    "sourceName": string | null,
    "sourceUrl": string | null,
    "snippet": string | null,
    "confidence": "high" | "medium" | "low" | null
  }]
}

Use only information from pages you actually opened.`;
  }

  if (sourceType === "social") {
    return `${commonPrefix}
Return strict JSON only with this shape:
{
  "socialSignals": [{
    "theme": "hydration" | "irritation" | "texture" | "finish" | "white_cast" | "pilling" | "breakouts" | "value" | "wear_under_makeup",
    "sentiment": "positive" | "negative" | "mixed",
    "summary": string | null,
    "mentions": number | null,
    "sourceName": string | null,
    "sourceUrl": string | null,
    "snippet": string | null,
    "confidence": "high" | "medium" | "low" | null
  }]
}

Use only information from pages you actually opened.`;
  }

  return `${commonPrefix}
Return strict JSON only with this shape:
{
  "ingredientReferences": [{
    "ingredientName": string | null,
    "finding": string | null,
    "tags": string[],
    "sourceName": string | null,
    "sourceUrl": string | null,
    "snippet": string | null,
    "confidence": "high" | "medium" | "low" | null
  }]
}

Use only information from pages you actually opened. Keep claims descriptive and non-medical.`;
}

async function runTinyFishAutomation(
  options: TinyFishRunOptions
): Promise<unknown> {
  const controller = new AbortController();
  const overallTimeoutMs = Number(
    options.overallTimeoutMs ??
      process.env.SIGNALSKIN_TINYFISH_TIMEOUT_MS ??
      DEFAULT_TINYFISH_TIMEOUT_MS
  );
  const inactivityTimeoutMs = Number(
    options.inactivityTimeoutMs ??
      process.env.SIGNALSKIN_TINYFISH_INACTIVITY_TIMEOUT_MS ??
      DEFAULT_TINYFISH_INACTIVITY_TIMEOUT_MS
  );
  let abortReason = "TinyFish request was aborted.";
  const overallTimeout = setTimeout(() => {
    abortReason = `TinyFish exceeded the ${Math.round(
      overallTimeoutMs / 1000
    )}s overall timeout.`;
    controller.abort();
  }, overallTimeoutMs);
  let inactivityTimeout: ReturnType<typeof setTimeout> | undefined;
  const resetInactivityTimeout = () => {
    if (inactivityTimeout) {
      clearTimeout(inactivityTimeout);
    }

    inactivityTimeout = setTimeout(() => {
      abortReason = `TinyFish stream went quiet for ${Math.round(
        inactivityTimeoutMs / 1000
      )}s.`;
      controller.abort();
    }, inactivityTimeoutMs);
  };

  try {
    resetInactivityTimeout();

    const response = await fetch(TINYFISH_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": options.apiKey
      },
      body: JSON.stringify({
        url: options.startUrl,
        goal: options.goal,
        browser_profile: "stealth"
      }),
      signal: controller.signal
    });
    resetInactivityTimeout();

    if (!response.ok) {
      throw new Error(`TinyFish returned HTTP ${response.status}.`);
    }

    if (!response.body) {
      throw new Error("TinyFish returned no response body.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      resetInactivityTimeout();
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) {
          continue;
        }

        const event = JSON.parse(line.slice(6)) as {
          type?: string;
          status?: string;
          message?: string;
          error?: string;
          url?: string;
          currentUrl?: string;
          current_url?: string;
          resultJson?: unknown;
          result?: unknown;
        };

        options.onStreamEvent?.({
          type: event.type,
          status: event.status,
          message: event.message,
          url: event.url,
          currentUrl: event.currentUrl,
          current_url: event.current_url
        });

        if (event.type === "ERROR" || event.status === "FAILED") {
          throw new Error(event.error ?? event.message ?? "TinyFish run failed.");
        }

        if (event.type === "COMPLETE" && event.status === "COMPLETED") {
          const result = event.resultJson ?? event.result;

          if (!result) {
            throw new Error("TinyFish completed without structured JSON output.");
          }

          return typeof result === "string" ? JSON.parse(result) : result;
        }
      }
    }

    throw new Error("TinyFish stream ended before a COMPLETE event.");
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === "AbortError" || error.message === "This operation was aborted")
    ) {
      throw new Error(abortReason);
    }

    throw error;
  } finally {
    clearTimeout(overallTimeout);
    if (inactivityTimeout) {
      clearTimeout(inactivityTimeout);
    }
  }
}

function normalizeSellerOffers(result: TinyFishProductResult): TinyFishSellerOffer[] {
  if (Array.isArray(result.sellerOffers) && result.sellerOffers.length) {
    return result.sellerOffers;
  }

  if (Array.isArray(result.seller_offers) && result.seller_offers.length) {
    return result.seller_offers;
  }

  return [];
}

function buildProductContext(
  request: AnalyzeRequest,
  result: TinyFishProductResult
): ProductContext {
  return {
    productName:
      pickText(result.productName, result.product_name) ?? request.product.rawQuery,
    brand: pickText(result.brand) ?? "Unknown brand",
    category: normalizeCategory(result.category, request.product.category),
    pageUrl:
      normalizeUrl(pickText(result.pageUrl, result.page_url)) ??
      (request.product.queryType === "url"
        ? normalizeUrl(request.product.rawQuery)
        : undefined),
    ingredients: asStringArray(result.ingredients),
    currency: inferCurrency(result.currency ?? result.price, "USD")
  };
}

function buildFallbackProductResult(
  request: AnalyzeRequest
): TinyFishProductResult {
  const safeUrl = normalizeUrl(request.product.rawQuery);
  const querySeed = deriveProductSearchSeed(request);

  return {
    productName: querySeed || request.product.rawQuery,
    brand:
      request.product.queryType === "url" && safeUrl
        ? getDomain(safeUrl)?.split(".")[0]?.replace(/-/g, " ")
        : "Unknown brand",
    category: request.product.category ?? "other",
    pageUrl: safeUrl,
    ingredients: [],
    officialClaims: [],
    textureTags: [],
    finishTags: [],
    citations: safeUrl
      ? [
          {
            title: querySeed || request.product.rawQuery,
            snippet:
              "SignalSkin timed out before TinyFish returned a full official product extraction, so this report is using the original user query as the product anchor.",
            url: safeUrl,
            sourceName: "SignalSkin fallback anchor",
            sourceType: "official"
          }
        ]
      : []
  };
}

function mergeSignalsResults(
  results: Partial<Record<SupportSourceType, TinyFishSignalsResult>>
): TinyFishSignalsResult | undefined {
  const merged: TinyFishSignalsResult = {
    retailerSignals: [],
    editorialSignals: [],
    socialSignals: [],
    ingredientReferences: [],
    alternatives: []
  };

  for (const result of Object.values(results)) {
    if (!result) {
      continue;
    }

    merged.retailerSignals = [
      ...(merged.retailerSignals ?? []),
      ...getSignalItems(result.retailerSignals, result.retailer_signals)
    ];
    merged.editorialSignals = [
      ...(merged.editorialSignals ?? []),
      ...getSignalItems(result.editorialSignals, result.editorial_signals)
    ];
    merged.socialSignals = [
      ...(merged.socialSignals ?? []),
      ...getSignalItems(result.socialSignals, result.social_signals)
    ];
    merged.ingredientReferences = [
      ...(merged.ingredientReferences ?? []),
      ...getSignalItems(
        result.ingredientReferences,
        result.ingredient_references
      )
    ];
    merged.alternatives = [
      ...(merged.alternatives ?? []),
      ...(result.alternatives ?? [])
    ];
  }

  const hasContent =
    (merged.retailerSignals?.length ?? 0) +
      (merged.editorialSignals?.length ?? 0) +
      (merged.socialSignals?.length ?? 0) +
      (merged.ingredientReferences?.length ?? 0) +
      (merged.alternatives?.length ?? 0) >
    0;

  return hasContent ? merged : undefined;
}

function toEvidenceSnippet(...values: Array<unknown>): string | undefined {
  const text = pickText(...values);
  return text && text.length >= 8 ? text : undefined;
}

function mapProductEvidence(
  request: AnalyzeRequest,
  context: ProductContext,
  result: TinyFishProductResult,
  collector: ReturnType<typeof createEvidenceCollector>
) {
  const safePageUrl =
    context.pageUrl ??
    (request.product.queryType === "url"
      ? normalizeUrl(request.product.rawQuery)
      : undefined);
  const citations =
    Array.isArray(result.citations) && result.citations.length
      ? result.citations
      : [
          {
            title: `${context.brand} ${context.productName}`,
            snippet:
              "TinyFish completed a live extraction run and returned product facts from the target page.",
            url: safePageUrl,
            sourceName: context.brand,
            sourceType: "official"
          }
        ];

  return citations
    .map((citation) =>
      collector.add({
        prefix: "tinyfish-evidence",
        sourceType: "official",
        sourceName:
          pickText(citation.sourceName, citation.source_name, context.brand) ??
          context.brand,
        url: citation.url ?? safePageUrl,
        title: citation.title ?? `${context.brand} ${context.productName}`,
        snippet:
          toEvidenceSnippet(citation.snippet) ??
          "TinyFish returned structured product data from the live web.",
        confidence: "medium",
        claimType: "fact",
        supports: ["product facts", "official claims"],
        tags: ["tinyfish", "live", "official"]
      })
    )
    .filter((id): id is string => Boolean(id));
}

function mapSellerOffers(
  productName: string,
  productCurrency: string,
  offers: TinyFishSellerOffer[],
  collector: ReturnType<typeof createEvidenceCollector>
) {
  return offers
    .map((offer, index) => {
      const sellerName = pickText(offer.sellerName, offer.seller_name);
      const price = asNumber(offer.price);
      const sizeValue = asNumber(offer.sizeValue ?? offer.size_value);
      const sizeUnit = normalizeSizeUnit(
        pickText(offer.sizeUnit, offer.size_unit)
      );
      const sellerType = normalizeSellerType(
        pickText(offer.sellerType, offer.seller_type)
      );
      const url = normalizeUrl(offer.url);

      if (!sellerName || price === undefined) {
        return null;
      }

      const confidence: ConfidenceLevel =
        sellerType === "official" || sellerType === "authorized"
          ? "high"
          : sellerType === "retailer"
            ? "medium"
            : "low";
      const evidenceId = collector.add({
        prefix: "tinyfish-seller",
        sourceType: "seller",
        sourceName: sellerName,
        url,
        title: `${sellerName} listing`,
        snippet: `${sellerName} lists ${productName} at ${price} ${inferCurrency(
          offer.currency ?? offer.price,
          productCurrency
        )}${offer.shippingSummary ? ` with shipping notes: ${offer.shippingSummary}.` : "."}`,
        confidence,
        claimType: "seller",
        supports: ["seller ranking", "price check"],
        tags: ["tinyfish", "live", sellerType]
      });
      const trustSignals = uniqueStrings(
        [
          sellerType === "official" ? "Official brand storefront" : undefined,
          sellerType === "authorized" ? "Authorized retailer signal" : undefined,
          sellerType === "retailer" ? "Established retailer listing" : undefined,
          asBoolean(offer.returnPolicyVisible ?? offer.return_policy_visible)
            ? "Return policy visible"
            : undefined,
          asBoolean(offer.contactInfoVisible ?? offer.contact_info_visible)
            ? "Contact information visible"
            : undefined,
          asBoolean(offer.sampleAvailable ?? offer.sample_available)
            ? "Sample or trial availability mentioned"
            : undefined
        ].filter((value): value is string => Boolean(value))
      );
      const riskSignals = uniqueStrings(
        [
          sellerType === "marketplace"
            ? "Marketplace listing needs extra authenticity checks"
            : undefined,
          !asBoolean(offer.returnPolicyVisible ?? offer.return_policy_visible)
            ? "Return policy not clearly visible"
            : undefined,
          !asBoolean(offer.contactInfoVisible ?? offer.contact_info_visible)
            ? "Contact information not clearly visible"
            : undefined
        ].filter((value): value is string => Boolean(value))
      );

      return {
        id: `tinyfish-offer-${index + 1}`,
        sellerName,
        sellerType,
        url,
        price: {
          amount: price,
          currency: inferCurrency(offer.currency ?? offer.price, productCurrency)
        },
        size:
          sizeValue !== undefined && sizeUnit
            ? {
                value: sizeValue,
                unit: sizeUnit
              }
            : undefined,
        sampleAvailable: Boolean(
          asBoolean(offer.sampleAvailable ?? offer.sample_available)
        ),
        availability: inferAvailability(
          pickText(offer.shippingSummary, offer.shipping_summary)
        ),
        returnPolicyVisible: Boolean(
          asBoolean(offer.returnPolicyVisible ?? offer.return_policy_visible)
        ),
        contactInfoVisible: Boolean(
          asBoolean(offer.contactInfoVisible ?? offer.contact_info_visible)
        ),
        shippingSummary:
          pickText(offer.shippingSummary, offer.shipping_summary) ?? undefined,
        trustSignals,
        riskSignals,
        confidence,
        evidenceIds: evidenceId ? [evidenceId] : []
      };
    })
    .filter((offer): offer is NonNullable<typeof offer> => Boolean(offer));
}

function getSignalItems<T>(
  camelValue: T[] | undefined,
  snakeValue: T[] | undefined
): T[] {
  if (Array.isArray(camelValue) && camelValue.length) {
    return camelValue;
  }

  if (Array.isArray(snakeValue) && snakeValue.length) {
    return snakeValue;
  }

  return [];
}

function defaultSourceName(sourceType: SourceType, url: string | undefined): string {
  return getDomain(url) ?? SOURCE_TYPE_LABELS[sourceType];
}

function mapReviewSignalsByType(options: {
  signals: TinyFishSignal[];
  sourceType: "retailer" | "social";
  collector: ReturnType<typeof createEvidenceCollector>;
}): NormalizedReviewSignal[] {
  return options.signals
    .map((signal, index) => {
      const theme = normalizeTheme(signal.theme);
      const sentiment = normalizeSentiment(signal.sentiment);
      const summary = pickText(signal.summary, signal.snippet);
      const url = normalizeUrl(pickText(signal.sourceUrl, signal.source_url));
      const sourceName =
        pickText(signal.sourceName, signal.source_name) ??
        defaultSourceName(options.sourceType, url);

      if (!theme || !sentiment || !summary) {
        return null;
      }

      const evidenceId = options.collector.add({
        prefix: `tinyfish-${options.sourceType}`,
        sourceType: options.sourceType,
        sourceName,
        url,
        title: `${sourceName} on ${THEME_LABELS[theme]}`,
        snippet: toEvidenceSnippet(signal.snippet, signal.summary) ?? summary,
        confidence: normalizeConfidence(signal.confidence),
        claimType: "sentiment",
        supports: [THEME_LABELS[theme]],
        tags: ["tinyfish", "live", options.sourceType, theme, sentiment]
      });

      return {
        id: `${options.sourceType}-signal-${index + 1}`,
        source: buildSourceMetadata(sourceName, options.sourceType, url),
        theme,
        sentiment,
        summary,
        mentions: Math.max(1, Math.round(asNumber(signal.mentions) ?? 1)),
        averageRating: asNumber(signal.averageRating ?? signal.average_rating),
        confidence: normalizeConfidence(signal.confidence),
        evidenceIds: evidenceId ? [evidenceId] : []
      };
    })
    .filter((signal): signal is NonNullable<typeof signal> => Boolean(signal));
}

function mapEditorialSignals(
  signals: TinyFishSignal[],
  collector: ReturnType<typeof createEvidenceCollector>
): NormalizedEditorialSignal[] {
  return signals
    .map((signal, index) => {
      const theme = normalizeTheme(signal.theme);
      const sentiment = normalizeSentiment(signal.sentiment);
      const summary = pickText(signal.summary, signal.snippet);
      const url = normalizeUrl(pickText(signal.sourceUrl, signal.source_url));
      const sourceName =
        pickText(signal.sourceName, signal.source_name) ??
        defaultSourceName("editorial", url);

      if (!theme || !sentiment || !summary) {
        return null;
      }

      const evidenceId = collector.add({
        prefix: "tinyfish-editorial",
        sourceType: "editorial",
        sourceName,
        url,
        title: `${sourceName} on ${THEME_LABELS[theme]}`,
        snippet: toEvidenceSnippet(signal.snippet, signal.summary) ?? summary,
        confidence: normalizeConfidence(signal.confidence),
        claimType: "sentiment",
        supports: [THEME_LABELS[theme]],
        tags: ["tinyfish", "live", "editorial", theme, sentiment]
      });

      return {
        id: `editorial-signal-${index + 1}`,
        source: buildSourceMetadata(sourceName, "editorial", url),
        theme,
        sentiment,
        summary,
        mentions: Math.max(1, Math.round(asNumber(signal.mentions) ?? 1)),
        confidence: normalizeConfidence(signal.confidence),
        comparisonProducts: uniqueStrings(
          asStringArray(signal.comparisonProducts ?? signal.comparison_products)
        ),
        evidenceIds: evidenceId ? [evidenceId] : []
      };
    })
    .filter((signal): signal is NonNullable<typeof signal> => Boolean(signal));
}

function mapIngredientReferenceEvidence(
  references: TinyFishIngredientReference[],
  collector: ReturnType<typeof createEvidenceCollector>
) {
  const ids: string[] = [];
  const tagsByIngredient = new Map<string, string[]>();

  for (const reference of references) {
    const ingredientName = pickText(
      reference.ingredientName,
      reference.ingredient_name
    );
    const finding = pickText(reference.finding, reference.summary, reference.snippet);
    const url = normalizeUrl(pickText(reference.sourceUrl, reference.source_url));
    const sourceName =
      pickText(reference.sourceName, reference.source_name) ??
      defaultSourceName("ingredient_reference", url);
    const tags = uniqueStrings(asStringArray(reference.tags));

    if (!ingredientName || !finding) {
      continue;
    }

    const evidenceId = collector.add({
      prefix: "tinyfish-ingredient",
      sourceType: "ingredient_reference",
      sourceName,
      url,
      title: `${ingredientName} reference note`,
      snippet: toEvidenceSnippet(reference.snippet, reference.finding, reference.summary) ?? finding,
      confidence: normalizeConfidence(reference.confidence),
      claimType: "ingredient",
      supports: [ingredientName],
      tags: ["tinyfish", "live", "ingredient_reference", ...tags]
    });

    if (evidenceId) {
      ids.push(evidenceId);
    }

    const normalizedIngredient = ingredientName.trim().toLowerCase();
    tagsByIngredient.set(
      normalizedIngredient,
      uniqueStrings([...(tagsByIngredient.get(normalizedIngredient) ?? []), ...tags])
    );
  }

  return {
    evidenceIds: ids,
    tagsByIngredient
  };
}

function mapAlternativeCandidates(
  alternatives: TinyFishAlternative[]
): AlternativeCandidate[] {
  return alternatives
    .map((alternative, index) => {
      const productName = pickText(
        alternative.productName,
        alternative.product_name
      );
      const brand = pickText(alternative.brand);

      if (!productName || !brand) {
        return null;
      }

      const price = asNumber(alternative.price);
      const currency = inferCurrency(alternative.currency ?? alternative.price, "USD");

      return {
        id: `tinyfish-alternative-${index + 1}`,
        productName,
        brand,
        category: normalizeCategory(alternative.category, "other"),
        price:
          price !== undefined
            ? {
                amount: price,
                currency
              }
            : undefined,
        reasonHints: uniqueStrings(
          asStringArray(alternative.reasonHints ?? alternative.reason_hints)
        ),
        fitTags: uniqueStrings(
          asStringArray(alternative.fitTags ?? alternative.fit_tags)
        ),
        riskTags: uniqueStrings(
          asStringArray(alternative.riskTags ?? alternative.risk_tags)
        ),
        confidence: normalizeConfidence(alternative.confidence)
      };
    })
    .filter(
      (alternative): alternative is NonNullable<typeof alternative> =>
        Boolean(alternative)
    );
}

function createLiveBundle(
  request: AnalyzeRequest,
  productResult: TinyFishProductResult,
  signalsResult: TinyFishSignalsResult | undefined
): ProviderExtractionBundle {
  const context = buildProductContext(request, productResult);
  const collector = createEvidenceCollector();
  const productEvidenceIds = mapProductEvidence(
    request,
    context,
    productResult,
    collector
  );
  const ingredients = context.ingredients.map((name) => ({
    name,
    normalizedName: name.trim().toLowerCase(),
    tags: [] as string[],
    confidence: "medium" as const
  }));
  const sellerOffers = mapSellerOffers(
    context.productName,
    context.currency,
    normalizeSellerOffers(productResult),
    collector
  );
  const retailerSignals = signalsResult
    ? mapReviewSignalsByType({
        signals: getSignalItems(
          signalsResult.retailerSignals,
          signalsResult.retailer_signals
        ),
        sourceType: "retailer",
        collector
      })
    : [];
  const editorialSignals = signalsResult
    ? mapEditorialSignals(
        getSignalItems(
          signalsResult.editorialSignals,
          signalsResult.editorial_signals
        ),
        collector
      )
    : [];
  const socialSignals = signalsResult
    ? mapReviewSignalsByType({
        signals: getSignalItems(
          signalsResult.socialSignals,
          signalsResult.social_signals
        ),
        sourceType: "social",
        collector
      })
    : [];
  const ingredientReferenceResult = signalsResult
    ? mapIngredientReferenceEvidence(
        getSignalItems(
          signalsResult.ingredientReferences,
          signalsResult.ingredient_references
        ),
        collector
      )
    : {
        evidenceIds: [],
        tagsByIngredient: new Map<string, string[]>()
      };

  for (const ingredient of ingredients) {
    ingredient.tags = uniqueStrings([
      ...ingredient.tags,
      ...(ingredientReferenceResult.tagsByIngredient.get(ingredient.normalizedName) ??
        [])
    ]);
  }

  const alternativeCandidates = signalsResult
    ? mapAlternativeCandidates(signalsResult.alternatives ?? [])
    : [];
  const productPrice = asNumber(productResult.price);
  const productSizeValue = asNumber(productResult.sizeValue ?? productResult.size_value);
  const productSizeUnit = normalizeSizeUnit(
    pickText(productResult.sizeUnit, productResult.size_unit)
  );
  const officialClaims = uniqueStrings(
    asStringArray(productResult.officialClaims ?? productResult.official_claims)
  );
  const textureTags = uniqueStrings(
    asStringArray(productResult.textureTags ?? productResult.texture_tags)
  );
  const finishTags = uniqueStrings(
    asStringArray(productResult.finishTags ?? productResult.finish_tags)
  );

  return {
    product: {
      productId: slugify(context.productName),
      name: context.productName,
      brand: context.brand,
      category: context.category,
      tagline: "Live TinyFish extraction",
      size:
        productSizeValue !== undefined && productSizeUnit
          ? {
              value: productSizeValue,
              unit: productSizeUnit
            }
          : undefined,
      price:
        productPrice !== undefined
          ? {
              amount: productPrice,
              currency: context.currency
            }
          : undefined,
      ingredients,
      officialClaims,
      textureTags,
      finishTags,
      crueltyFree: undefined,
      confidence: retailerSignals.length || editorialSignals.length ? "high" : "medium",
      evidenceIds: productEvidenceIds
    },
    ingredientList: {
      items: ingredients,
      declaredFragrance: ingredients.some((ingredient) =>
        ["fragrance", "parfum"].includes(ingredient.normalizedName)
      ),
      confidence: ingredientReferenceResult.evidenceIds.length ? "high" : "medium",
      evidenceIds: uniqueStrings([
        ...productEvidenceIds,
        ...ingredientReferenceResult.evidenceIds
      ])
    },
    reviewSignals: retailerSignals,
    editorialSignals,
    socialSignals,
    sellerOffers,
    alternativeCandidates,
    evidence: collector.evidence,
    warnings: [],
    usedFallback: false
  };
}

function buildSignalPreviewSnapshot(signalsResult: TinyFishSignalsResult) {
  const collector = createEvidenceCollector();
  const retailerSignals = mapReviewSignalsByType({
    signals: getSignalItems(
      signalsResult.retailerSignals,
      signalsResult.retailer_signals
    ),
    sourceType: "retailer",
    collector
  });
  const editorialSignals = mapEditorialSignals(
    getSignalItems(
      signalsResult.editorialSignals,
      signalsResult.editorial_signals
    ),
    collector
  );
  const socialSignals = mapReviewSignalsByType({
    signals: getSignalItems(
      signalsResult.socialSignals,
      signalsResult.social_signals
    ),
    sourceType: "social",
    collector
  });
  const ingredientReferenceResult = mapIngredientReferenceEvidence(
    getSignalItems(
      signalsResult.ingredientReferences,
      signalsResult.ingredient_references
    ),
    collector
  );
  const coveredSourceTypes: SourceType[] = uniqueStrings(
    [
      retailerSignals.length ? "retailer" : undefined,
      editorialSignals.length ? "editorial" : undefined,
      socialSignals.length ? "social" : undefined,
      ingredientReferenceResult.evidenceIds.length
        ? "ingredient_reference"
        : undefined
    ].filter((value): value is SourceType => Boolean(value))
  ) as SourceType[];

  return {
    evidenceCount: collector.evidence.length,
    coveredSourceTypes,
    evidence: collector.evidence.slice(0, 4),
    reviewSignals: retailerSignals.slice(0, 2),
    editorialSignals: editorialSignals.slice(0, 2),
    socialSignals: socialSignals.slice(0, 2),
    alternatives: mapAlternativeCandidates(signalsResult.alternatives ?? []).slice(0, 3)
  };
}

function buildPreviewFromLiveState(options: {
  request: AnalyzeRequest;
  plan: SourcePlan;
  productResult?: TinyFishProductResult;
  signalsResult?: TinyFishSignalsResult;
  warnings?: string[];
  recentActivity?: string[];
}): AnalysisPreview {
  const productBundle = options.productResult
    ? createLiveBundle(options.request, options.productResult, undefined)
    : undefined;
  const signalSnapshot = options.signalsResult
    ? buildSignalPreviewSnapshot(options.signalsResult)
    : {
        evidenceCount: 0,
        coveredSourceTypes: [] as SourceType[],
        evidence: [] as SourceEvidence[],
        reviewSignals: [] as NormalizedReviewSignal[],
        editorialSignals: [] as NormalizedEditorialSignal[],
        socialSignals: [] as NormalizedReviewSignal[],
        alternatives: [] as AlternativeCandidate[]
      };
  const coveredSourceTypes = uniqueStrings([
    ...(productBundle?.evidence.map((item) => item.source.type) ?? []),
    ...signalSnapshot.coveredSourceTypes
  ]) as SourceType[];
  const topEvidence = Array.from(
    new Map(
      [...(productBundle?.evidence ?? []), ...signalSnapshot.evidence].map((item) => [
        item.id,
        item
      ])
    ).values()
  ).slice(0, 4);

  return {
    providerName: "TinyFishProvider",
    product: productBundle?.product,
    ingredientCount: productBundle?.ingredientList.items.length ?? 0,
    sellerOfferCount: productBundle?.sellerOffers.length ?? 0,
    evidenceCount:
      (productBundle?.evidence.length ?? 0) + signalSnapshot.evidenceCount,
    coveredSourceTypes,
    pendingSourceTypes: options.plan.expectedSourceTypes.filter(
      (type) => !coveredSourceTypes.includes(type)
    ),
    recentActivity: options.recentActivity ?? [],
    topEvidence,
    sellerOffers: productBundle?.sellerOffers.slice(0, 3) ?? [],
    reviewSignals: signalSnapshot.reviewSignals,
    editorialSignals: signalSnapshot.editorialSignals,
    socialSignals: signalSnapshot.socialSignals,
    alternatives: signalSnapshot.alternatives,
    warnings: options.warnings ?? []
  };
}

function buildLiveWarnings(
  request: AnalyzeRequest,
  plan: SourcePlan,
  bundle: ProviderExtractionBundle,
  partialFailures: string[] = []
) {
  const warnings: string[] = [];

  if (request.product.queryType === "name") {
    warnings.push(
      "TinyFish live mode is active in search-first mode. Direct product URLs remain the most reliable starting point for exact source matching."
    );
  }

  warnings.push(...partialFailures);

  const coveredTypes = new Set(bundle.evidence.map((item) => item.source.type));
  const missingTypes = plan.expectedSourceTypes.filter((type) => !coveredTypes.has(type));

  if (missingTypes.length) {
    warnings.push(
      `Live coverage was thinner than planned for: ${missingTypes
        .map((type) => SOURCE_TYPE_LABELS[type])
        .join(", ")}. SignalSkin used only verified live evidence instead of fabricating missing sources.`
    );
  }

  return warnings;
}

export class TinyFishProvider implements ExtractionProvider {
  readonly name = "TinyFishProvider";
  readonly supportsLive = true;

  private readonly fallbackProvider = new MockProvider();

  private emitUpdate(
    update: ProviderUpdate,
    onUpdate?: (update: ProviderUpdate) => void
  ) {
    onUpdate?.(update);
  }

  private async extractInternal(
    request: AnalyzeRequest,
    plan: SourcePlan,
    onUpdate?: (update: ProviderUpdate) => void
  ): Promise<ProviderExtractionBundle> {
    let updatesClosed = false;
    const safeEmit = (update: ProviderUpdate) => {
      if (!updatesClosed) {
        this.emitUpdate(update, onUpdate);
      }
    };
    const apiKey = getTinyFishApiKey();

    if (!apiKey) {
      const base = await this.fallbackProvider.extract(
        {
          ...request,
          mode: "mock"
        },
        plan
      );
      const preview = {
        providerName: this.fallbackProvider.name,
        product: base.product,
        ingredientCount: base.ingredientList.items.length,
        sellerOfferCount: base.sellerOffers.length,
        evidenceCount: base.evidence.length,
        coveredSourceTypes: Array.from(
          new Set(base.evidence.map((item) => item.source.type))
        ),
        pendingSourceTypes: plan.expectedSourceTypes.filter(
          (type) => !base.evidence.some((item) => item.source.type === type)
        ),
        recentActivity: ["Mock provider returned the seeded SignalSkin demo bundle."],
        topEvidence: base.evidence.slice(0, 4),
        sellerOffers: base.sellerOffers.slice(0, 3),
        reviewSignals: base.reviewSignals.slice(0, 2),
        editorialSignals: base.editorialSignals.slice(0, 2),
        socialSignals: base.socialSignals.slice(0, 2),
        alternatives: base.alternativeCandidates.slice(0, 3),
        warnings: [
          ...base.warnings,
          "TinyFish API key is not configured in a runtime env file, so SignalSkin is using the reliable mock provider fallback."
        ]
      } satisfies AnalysisPreview;

      safeEmit(
        {
          type: "status",
          phase: "fallback",
          status: "completed",
          detail:
            "TinyFish API key is not configured, so SignalSkin switched to the seeded fallback.",
          preview
        }
      );

      const result = {
        ...base,
        warnings: preview.warnings,
        usedFallback: true
      };
      updatesClosed = true;
      return result;
    }

    try {
      const supportAgentTypes: SupportSourceType[] = [
        "retailer",
        "editorial",
        "social",
        "ingredient_reference"
      ];
      let productResult: TinyFishProductResult | undefined;
      const supportResults: Partial<Record<SupportSourceType, TinyFishSignalsResult>> = {};
      const partialFailures: string[] = [];
      const recentActivity: string[] = [];
      let lastActivityPreviewAt = 0;
      const rememberActivity = (message: string) => {
        const normalized = message.trim();

        if (!normalized) {
          return false;
        }

        if (recentActivity[0] === normalized) {
          return false;
        }

        recentActivity.splice(
          0,
          recentActivity.length,
          ...[normalized, ...recentActivity.filter((item) => item !== normalized)].slice(
            0,
            8
          )
        );

        return true;
      };
      const getPreview = (warnings?: string[]) =>
        buildPreviewFromLiveState({
          request,
          plan,
          productResult,
          signalsResult: mergeSignalsResults(supportResults),
          warnings,
          recentActivity
        });
      const emitActivityPreview = (
        phase: "product" | "support",
        detail: string,
        force = false
      ) => {
        const now = Date.now();

        if (!force && now - lastActivityPreviewAt < 900) {
          return;
        }

        lastActivityPreviewAt = now;
        safeEmit({
          type: "status",
          phase,
          status: "running",
          detail,
          preview: getPreview(partialFailures)
        });
      };
      const handleTinyFishStreamEvent = (
        label: string,
        phase: "product" | "support"
      ) => {
        return (event: {
          type?: string;
          status?: string;
          message?: string;
          url?: string;
          currentUrl?: string;
          current_url?: string;
        }) => {
          const activity = formatTinyFishStreamActivity(label, event);

          if (!activity || !rememberActivity(activity)) {
            return;
          }

          emitActivityPreview(
            phase,
            activity,
            event.type === "STREAMING_URL" || event.type === "STARTED"
          );
        };
      };

      safeEmit(
        {
          type: "status",
          phase: "product",
          status: "running",
          detail: "TinyFish is extracting official product facts and seller offers."
        }
      );
      safeEmit(
        {
          type: "status",
          phase: "support",
          status: "running",
          detail:
            "TinyFish is scanning retailer, editorial, social, and ingredient-reference sources in parallel."
        }
      );

      const productPromise = runTinyFishAutomation({
        apiKey,
        startUrl: getProductStartUrl(request),
        goal: getProductGoal(request),
        overallTimeoutMs: getProductPassTimeoutMs(request),
        inactivityTimeoutMs: getProductPassInactivityTimeoutMs(request),
        onStreamEvent: handleTinyFishStreamEvent(
          "Official product facts",
          "product"
        )
      });

      const productTask = productPromise.then((result) => {
        productResult = result as TinyFishProductResult;
        rememberActivity("Official product facts completed and were merged into the live preview.");
        const preview = getPreview(partialFailures);

        safeEmit(
          {
            type: "preview",
            phase: "product",
            detail: "Product facts are ready and the support pass is still running.",
            preview
          }
        );
        safeEmit(
          {
            type: "status",
            phase: "product",
            status: "completed",
            detail: "Official product facts are ready.",
            preview
          }
        );
      });
      const supportTasks = supportAgentTypes.map((sourceType) =>
        runTinyFishAutomation({
          apiKey,
          startUrl: buildSignalsSearchUrl(request, sourceType),
          goal: getSignalsGoal(request, sourceType),
          overallTimeoutMs: getSupportPassTimeoutMs(request),
          inactivityTimeoutMs: getSupportPassInactivityTimeoutMs(request),
          onStreamEvent: handleTinyFishStreamEvent(
            SOURCE_TYPE_LABELS[sourceType],
            "support"
          )
        })
          .then((result) => {
            supportResults[sourceType] = result as TinyFishSignalsResult;
            rememberActivity(
              `${SOURCE_TYPE_LABELS[sourceType]} completed and was folded into the live preview.`
            );
            const preview = getPreview(partialFailures);

            safeEmit(
              {
                type: "preview",
                phase: "support",
                detail: `${SOURCE_TYPE_LABELS[sourceType]} agent finished and has been folded into the live preview.`,
                preview
              }
            );
          })
          .catch((error) => {
            const message =
              error instanceof Error
                ? error.message
                : "The source-specific TinyFish run did not complete.";
            partialFailures.push(
              `${SOURCE_TYPE_LABELS[sourceType]} agent was partial: ${message}`
            );
            rememberActivity(
              `${SOURCE_TYPE_LABELS[sourceType]} was partial, so SignalSkin kept the live evidence already gathered.`
            );
            const preview = getPreview(partialFailures);

            safeEmit(
              {
                type: "status",
                phase: "support",
                status: "running",
                detail: `${SOURCE_TYPE_LABELS[sourceType]} agent timed out or returned sparse results. Continuing with the live evidence already gathered.`,
                preview
              }
            );
          })
      );

      await Promise.allSettled([productTask, ...supportTasks]);

      const effectiveProductResult =
        productResult ?? buildFallbackProductResult(request);

      if (!productResult) {
        partialFailures.push(
          "Official product facts were partial, so SignalSkin anchored the report to the original user query instead of switching to mock data."
        );
      }

      const signalsResult = mergeSignalsResults(supportResults);
      const bundle = createLiveBundle(
        request,
        effectiveProductResult,
        signalsResult
      );
      const warnings = buildLiveWarnings(request, plan, bundle, partialFailures);

      if (onUpdate) {
        rememberActivity("Live extraction completed. SignalSkin is assembling the final report.");
        const preview = buildPreviewFromLiveState({
          request,
          plan,
          productResult: effectiveProductResult,
          signalsResult,
          warnings,
          recentActivity
        });

        safeEmit(
          {
            type: "preview",
            phase: "support",
            detail: "Live extraction is complete and SignalSkin is assembling the final report.",
            preview
          }
        );
      }

      const result = {
        ...bundle,
        warnings
      };
      updatesClosed = true;
      return result;
    } catch (error) {
      const liveOnlyBundle = createLiveBundle(
        request,
        buildFallbackProductResult(request),
        undefined
      );
      const warnings = [
        error instanceof Error
          ? `TinyFish live extraction failed before returning structured evidence: ${error.message}`
          : "TinyFish live extraction failed before returning structured evidence."
      ];

      safeEmit(
        {
          type: "status",
          phase: "support",
          status: "failed",
          detail:
            "TinyFish did not finish any usable live source runs before the time budget expired, so SignalSkin is returning a sparse live report instead of seeded mock data.",
          preview: {
            providerName: this.name,
            product: liveOnlyBundle.product,
            ingredientCount: liveOnlyBundle.ingredientList.items.length,
            sellerOfferCount: liveOnlyBundle.sellerOffers.length,
            evidenceCount: liveOnlyBundle.evidence.length,
            coveredSourceTypes: Array.from(
              new Set(liveOnlyBundle.evidence.map((item) => item.source.type))
            ),
            pendingSourceTypes: plan.expectedSourceTypes.filter(
              (type) =>
                !liveOnlyBundle.evidence.some((item) => item.source.type === type)
            ),
            recentActivity: [
              "TinyFish did not finish a structured live pass before the report had to be assembled."
            ],
            topEvidence: liveOnlyBundle.evidence.slice(0, 4),
            sellerOffers: liveOnlyBundle.sellerOffers.slice(0, 3),
            reviewSignals: liveOnlyBundle.reviewSignals.slice(0, 2),
            editorialSignals: liveOnlyBundle.editorialSignals.slice(0, 2),
            socialSignals: liveOnlyBundle.socialSignals.slice(0, 2),
            alternatives: liveOnlyBundle.alternativeCandidates.slice(0, 3),
            warnings
          }
        }
      );

      const result = {
        ...liveOnlyBundle,
        warnings,
        usedFallback: false
      };
      updatesClosed = true;
      return result;
    }
  }

  async extract(
    request: AnalyzeRequest,
    plan: SourcePlan
  ): Promise<ProviderExtractionBundle> {
    return this.extractInternal(request, plan);
  }

  async extractWithUpdates(
    request: AnalyzeRequest,
    plan: SourcePlan,
    onUpdate: (update: ProviderUpdate) => void
  ): Promise<ProviderExtractionBundle> {
    return this.extractInternal(request, plan, onUpdate);
  }
}
