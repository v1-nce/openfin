import { MockProvider } from "@/providers/mock/provider";
import { slugify } from "@/lib/format";
import type { ExtractionProvider, ProviderExtractionBundle } from "@/providers/types";
import type { AnalyzeRequest, SourcePlan } from "@/schemas";

const TINYFISH_ENDPOINT = "https://mino.ai/v1/automation/run-sse";
const DEFAULT_TINYFISH_TIMEOUT_MS = 180_000;
const DEFAULT_TINYFISH_INACTIVITY_TIMEOUT_MS = 45_000;

type TinyFishResult = {
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
  ingredients?: string[];
  officialClaims?: string[];
  official_claims?: string[];
  textureTags?: string[];
  texture_tags?: string[];
  finishTags?: string[];
  finish_tags?: string[];
  pageUrl?: string;
  page_url?: string;
  citations?: Array<{
    title?: string;
    snippet?: string;
    url?: string;
  }>;
  sellerOffers?: Array<{
    sellerName?: string;
    sellerType?: string;
    url?: string;
    price?: number | string;
    currency?: string;
    sizeValue?: number | string;
    sizeUnit?: string;
    sampleAvailable?: boolean;
    returnPolicyVisible?: boolean;
    contactInfoVisible?: boolean;
    shippingSummary?: string;
  }>;
  seller_offers?: Array<{
    seller_name?: string;
    seller_type?: string;
    url?: string;
    price?: number | string;
    currency?: string;
    size_value?: number | string;
    size_unit?: string;
    sample_available?: boolean;
    return_policy_visible?: boolean;
    contact_info_visible?: boolean;
    shipping_summary?: string;
  }>;
};

function getTinyFishApiKey(): string | undefined {
  return process.env.TINYFISH_API_KEY ?? process.env.MINO_API_KEY;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
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

function normalizeCategory(
  value: string | undefined,
  fallback: AnalyzeRequest["product"]["category"]
) {
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

function getStartUrl(request: AnalyzeRequest): string {
  if (request.product.queryType === "url") {
    return request.product.rawQuery;
  }

  return `https://duckduckgo.com/?q=${encodeURIComponent(request.product.rawQuery)}`;
}

function getGoal(request: AnalyzeRequest): string {
  const searchInstruction =
    request.product.queryType === "url"
      ? "Extract facts from this product page."
      : `Find the most likely official product page for "${request.product.rawQuery}", open it, then extract product facts from that page.`;

  return `${searchInstruction}

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
  "citations": [{ "title": string | null, "snippet": string | null, "url": string | null }],
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

Only include facts visible on the page or pages you actually opened.`;
}

async function runTinyFishAutomation(
  request: AnalyzeRequest,
  apiKey: string
): Promise<TinyFishResult> {
  const controller = new AbortController();
  const overallTimeoutMs = Number(
    process.env.SIGNALSKIN_TINYFISH_TIMEOUT_MS ?? DEFAULT_TINYFISH_TIMEOUT_MS
  );
  const inactivityTimeoutMs = Number(
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
        "X-API-Key": apiKey
      },
      body: JSON.stringify({
        url: getStartUrl(request),
        goal: getGoal(request),
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
          resultJson?: unknown;
          result?: unknown;
        };

        if (event.type === "ERROR" || event.status === "FAILED") {
          throw new Error(event.error ?? event.message ?? "TinyFish run failed.");
        }

        if (event.type === "COMPLETE" && event.status === "COMPLETED") {
          const result = event.resultJson ?? event.result;

          if (!result) {
            throw new Error("TinyFish completed without structured JSON output.");
          }

          return typeof result === "string"
            ? (JSON.parse(result) as TinyFishResult)
            : (result as TinyFishResult);
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

function toEvidenceSource(name: string, url: string | undefined) {
  return {
    id: slugify(name),
    name,
    type: "official" as const,
    url,
    domain: url ? new URL(url).hostname : undefined
  };
}

function createLiveBundle(
  request: AnalyzeRequest,
  result: TinyFishResult
): ProviderExtractionBundle {
  const pageUrl = pickText(result.pageUrl, result.page_url)
    ? pickText(result.pageUrl, result.page_url)
    : request.product.queryType === "url"
      ? request.product.rawQuery
      : undefined;
  const resultIngredients = asStringArray(result.ingredients);
  const resultClaims = asStringArray(result.officialClaims).length
    ? asStringArray(result.officialClaims)
    : asStringArray(result.official_claims);
  const resultTextureTags = asStringArray(result.textureTags).length
    ? asStringArray(result.textureTags)
    : asStringArray(result.texture_tags);
  const resultFinishTags = asStringArray(result.finishTags).length
    ? asStringArray(result.finishTags)
    : asStringArray(result.finish_tags);
  const resultSellerOffers =
    Array.isArray(result.sellerOffers) && result.sellerOffers.length
      ? result.sellerOffers
      : Array.isArray(result.seller_offers)
        ? result.seller_offers.map((offer) => ({
            sellerName: offer.seller_name,
            sellerType: offer.seller_type,
            url: offer.url,
            price: offer.price,
            currency: offer.currency,
            sizeValue: offer.size_value,
            sizeUnit: offer.size_unit,
            sampleAvailable: offer.sample_available,
            returnPolicyVisible: offer.return_policy_visible,
            contactInfoVisible: offer.contact_info_visible,
            shippingSummary: offer.shipping_summary
          }))
        : [];
  const productName =
    pickText(result.productName, result.product_name) ??
    request.product.rawQuery;
  const productPrice = asNumber(result.price);
  const productCurrency = inferCurrency(result.currency ?? result.price, "USD");
  const productSizeValue = asNumber(result.sizeValue ?? result.size_value);
  const productSizeUnit = normalizeSizeUnit(result.sizeUnit ?? result.size_unit);
  const safePageUrl = pageUrl
    ? pageUrl
    : request.product.queryType === "url"
      ? request.product.rawQuery
      : undefined;
  const source = toEvidenceSource(
    pickText(result.brand, productName) || "TinyFish live extraction",
    safePageUrl
  );
  const ingredients = resultIngredients.map((name) => ({
    name,
    normalizedName: name.trim().toLowerCase(),
    tags: [],
    confidence: "medium" as const
  }));
  const citations =
    Array.isArray(result.citations) && result.citations.length
      ? result.citations
      : [
          {
            title: "TinyFish live extraction",
            snippet:
              "TinyFish completed a live extraction run and returned product facts from the target page.",
            url: safePageUrl
          }
        ];
  const evidence = citations.map((citation, index) => ({
    id: `tinyfish-evidence-${index + 1}`,
    source: {
      ...source,
      url:
        typeof citation.url === "string" && citation.url.trim()
          ? citation.url
          : source.url
    },
    title: citation.title?.trim() || "TinyFish extraction",
    snippet:
      citation.snippet?.trim() ||
      "TinyFish returned structured product data from the live web.",
    confidence: "medium" as const,
    claimType: "fact" as const,
    supports: ["live extraction"],
    tags: ["tinyfish", "live"]
  }));
  const sellerOffers = Array.isArray(resultSellerOffers)
    ? resultSellerOffers
        .map((offer, index) => {
          const price = asNumber(offer.price);
          const sizeValue = asNumber(offer.sizeValue);
          const sizeUnit = normalizeSizeUnit(offer.sizeUnit);

          if (!offer.sellerName || price === undefined) {
            return null;
          }

          return {
            id: `tinyfish-offer-${index + 1}`,
            sellerName: offer.sellerName,
            sellerType: normalizeSellerType(offer.sellerType),
            url:
              typeof offer.url === "string" && offer.url.trim()
                ? offer.url
                : safePageUrl,
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
            sampleAvailable: Boolean(offer.sampleAvailable),
            availability: "unknown" as const,
            returnPolicyVisible: Boolean(offer.returnPolicyVisible),
            contactInfoVisible: Boolean(offer.contactInfoVisible),
            shippingSummary: offer.shippingSummary?.trim() || undefined,
            trustSignals: ["Returned by TinyFish live extraction"],
            riskSignals: [],
            confidence: "medium" as const,
            evidenceIds: evidence.map((item) => item.id)
          };
        })
        .filter((offer): offer is NonNullable<typeof offer> => Boolean(offer))
    : [];

  return {
    product: {
      productId: slugify(productName),
      name: productName,
      brand: pickText(result.brand) || "Unknown brand",
      category: normalizeCategory(result.category, request.product.category),
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
              currency: productCurrency
            }
          : undefined,
      ingredients,
      officialClaims: resultClaims,
      textureTags: resultTextureTags,
      finishTags: resultFinishTags,
      crueltyFree: undefined,
      confidence: "medium",
      evidenceIds: evidence.map((item) => item.id)
    },
    ingredientList: {
      items: ingredients,
      declaredFragrance: ingredients.some((ingredient) =>
        ["fragrance", "parfum"].includes(ingredient.normalizedName)
      ),
      confidence: "medium",
      evidenceIds: evidence.map((item) => item.id)
    },
    reviewSignals: [],
    editorialSignals: [],
    socialSignals: [],
    sellerOffers,
    alternativeCandidates: [],
    evidence,
    warnings: [
      request.product.queryType === "url"
        ? "TinyFish live mode is active. This first pass extracts product facts and seller details, but review/editorial/social live layers are not yet wired."
        : "TinyFish live mode is active in search-first mode. This is less reliable than giving the app a direct product URL, and review/editorial/social live layers are not yet wired."
    ],
    usedFallback: false
  };
}

export class TinyFishProvider implements ExtractionProvider {
  readonly name = "TinyFishProvider";
  readonly supportsLive = true;

  private readonly fallbackProvider = new MockProvider();

  async extract(
    request: AnalyzeRequest,
    plan: SourcePlan
  ): Promise<ProviderExtractionBundle> {
    const apiKey = getTinyFishApiKey();

    if (!apiKey) {
      const base = await this.fallbackProvider.extract(
        {
          ...request,
          mode: "mock"
        },
        plan
      );

      return {
        ...base,
        warnings: [
          ...base.warnings,
          "TinyFish API key is not configured in a runtime env file, so SignalSkin is using the reliable mock provider fallback."
        ],
        usedFallback: true
      };
    }

    try {
      const liveResult = await runTinyFishAutomation(request, apiKey);
      return createLiveBundle(request, liveResult);
    } catch (error) {
      const base = await this.fallbackProvider.extract(
        {
          ...request,
          mode: "mock"
        },
        plan
      );

      return {
        ...base,
        warnings: [
          ...base.warnings,
          error instanceof Error
            ? `TinyFish live extraction failed: ${error.message} Falling back to mock evidence.`
            : "TinyFish live extraction failed. Falling back to mock evidence."
        ],
        usedFallback: true
      };
    }
  }
}
