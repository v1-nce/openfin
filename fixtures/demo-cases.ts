import type {
  AnalyzeRequest,
  ConfidenceLevel,
  NormalizedIngredient,
  SourceMetadata
} from "../src/schemas";
import type { ProviderExtractionBundle } from "../src/providers/types";

type DemoCase = {
  id: string;
  title: string;
  summary: string;
  aliases: string[];
  request: AnalyzeRequest;
  extraction: ProviderExtractionBundle;
};

function ingredient(
  name: string,
  normalizedName: string,
  confidence: ConfidenceLevel = "high",
  tags: string[] = []
): NormalizedIngredient {
  return {
    name,
    normalizedName,
    confidence,
    tags
  };
}

function source(
  id: string,
  name: string,
  type: SourceMetadata["type"],
  url: string
): SourceMetadata {
  return {
    id,
    name,
    type,
    url,
    domain: new URL(url).hostname
  };
}

const glowOfficial = source(
  "official-glow-recipe",
  "Glow Recipe",
  "official",
  "https://www.glowrecipe.com/products/watermelon-glow-pink-juice-moisturizer"
);
const sephora = source(
  "retailer-sephora",
  "Sephora",
  "retailer",
  "https://www.sephora.com/product/watermelon-glow-pink-juice-moisturizer"
);
const byrdie = source(
  "editorial-byrdie",
  "Byrdie",
  "editorial",
  "https://www.byrdie.com/glow-recipe-watermelon-glow-pink-juice-review"
);
const tiktok = source(
  "social-tiktok",
  "TikTok transcript",
  "social",
  "https://www.tiktok.com/discover/glow-recipe-pink-juice-review"
);
const glowSeller = source(
  "seller-glow",
  "Glow Recipe store",
  "seller",
  "https://www.glowrecipe.com/products/watermelon-glow-pink-juice-moisturizer"
);
const sephoraSeller = source(
  "seller-sephora",
  "Sephora listing",
  "seller",
  "https://www.sephora.com/product/watermelon-glow-pink-juice-moisturizer"
);
const marketSeller = source(
  "seller-market",
  "Discount marketplace seller",
  "seller",
  "https://www.example-marketplace.com/glow-recipe-pink-juice"
);

const bojOfficial = source(
  "official-boj",
  "Beauty of Joseon",
  "official",
  "https://beautyofjoseon.com/products/relief-sun-rice-probiotics"
);
const stylevana = source(
  "retailer-stylevana",
  "Stylevana",
  "retailer",
  "https://www.stylevana.com/en_US/beauty-of-joseon-relief-sun-rice-probiotics.html"
);
const allure = source(
  "editorial-allure",
  "Allure",
  "editorial",
  "https://www.allure.com/story/beauty-of-joseon-relief-sun-review"
);
const reddit = source(
  "social-reddit",
  "Reddit discussion",
  "social",
  "https://www.reddit.com/r/AsianBeauty/comments/boj_relief_sun_review/"
);
const officialBojSeller = source(
  "seller-boj",
  "Beauty of Joseon store",
  "seller",
  "https://beautyofjoseon.com/products/relief-sun-rice-probiotics"
);
const stylevanaSeller = source(
  "seller-stylevana",
  "Stylevana offer",
  "seller",
  "https://www.stylevana.com/en_US/beauty-of-joseon-relief-sun-rice-probiotics.html"
);
const suspiciousSeller = source(
  "seller-suspicious",
  "Unknown marketplace seller",
  "seller",
  "https://www.example-bargain.com/boj-relief-sun"
);

export const demoCases: DemoCase[] = [
  {
    id: "glow-recipe-sensitive-skin",
    title: "Glow Recipe moisturizer for a fragrance-sensitive user",
    summary:
      "Shows editorial praise versus repeated irritation complaints plus a suspiciously cheap seller.",
    aliases: ["glow recipe", "pink juice", "watermelon glow"],
    request: {
      mode: "demo",
      demoCaseId: "glow-recipe-sensitive-skin",
      product: {
        rawQuery: "Glow Recipe Watermelon Glow Pink Juice Moisturizer",
        queryType: "name",
        category: "moisturizer",
        country: "US"
      },
      userProfile: {
        id: "oily-sensitive-fragrance",
        name: "Casey",
        market: "US",
        skinType: "oily",
        concerns: ["sensitivity", "acne", "shine"],
        sensitivities: ["fragrance", "parfum"],
        likedProducts: [
          {
            productName: "La Roche-Posay Toleriane Double Repair Face Moisturizer",
            suspectedIngredients: [],
            notes: "Liked the calm, low-sting feel."
          }
        ],
        dislikedProducts: [
          {
            productName: "Belif The True Cream Aqua Bomb",
            notes: "Enjoyed the texture but it stung on my cheeks.",
            suspectedIngredients: ["fragrance", "citrus extract"]
          }
        ],
        desiredCharacteristics: [
          "lightweight",
          "layers under makeup",
          "non-greasy finish"
        ],
        currentRoutine: ["gentle cleanser", "niacinamide serum", "daily SPF"],
        budgetRange: {
          max: 45,
          currency: "USD"
        },
        preferences: {
          fragranceFree: true,
          lightweight: true,
          finish: "natural"
        },
        preferenceWeights: {
          fit: 0.32,
          ingredients: 0.26,
          sentiment: 0.18,
          evidence: 0.12,
          seller: 0.12
        }
      }
    },
    extraction: {
      product: {
        productId: "glow-recipe-pink-juice",
        name: "Glow Recipe Watermelon Glow Pink Juice Moisturizer",
        brand: "Glow Recipe",
        category: "moisturizer",
        tagline: "Oil-free glow-boosting gel moisturizer",
        size: {
          value: 60,
          unit: "ml"
        },
        price: {
          amount: 39,
          currency: "USD"
        },
        ingredients: [
          ingredient("Water", "water"),
          ingredient("Glycerin", "glycerin"),
          ingredient("Watermelon Fruit Extract", "watermelon extract"),
          ingredient("Sodium Hyaluronate", "hyaluronic acid"),
          ingredient("Fragrance", "fragrance"),
          ingredient("PEG-60 Hydrogenated Castor Oil", "peg-60 hydrogenated castor oil")
        ],
        officialClaims: [
          "Oil-free gel moisturizer",
          "Delivers lightweight hydration",
          "Layers well under makeup"
        ],
        textureTags: ["gel", "lightweight"],
        finishTags: ["dewy", "glowy"],
        crueltyFree: true,
        confidence: "high",
        evidenceIds: ["ev-glow-ingredients", "ev-glow-claims"]
      },
      ingredientList: {
        items: [
          ingredient("Water", "water"),
          ingredient("Glycerin", "glycerin"),
          ingredient("Watermelon Fruit Extract", "watermelon extract"),
          ingredient("Sodium Hyaluronate", "hyaluronic acid"),
          ingredient("Fragrance", "fragrance"),
          ingredient("PEG-60 Hydrogenated Castor Oil", "peg-60 hydrogenated castor oil")
        ],
        declaredFragrance: true,
        confidence: "high",
        evidenceIds: ["ev-glow-ingredients"]
      },
      reviewSignals: [
        {
          id: "sig-glow-hydration",
          source: sephora,
          theme: "hydration",
          sentiment: "positive",
          summary:
            "Reviewers repeatedly say the gel texture hydrates without feeling heavy.",
          mentions: 36,
          averageRating: 4.2,
          confidence: "medium",
          evidenceIds: ["ev-sephora-hydration"]
        },
        {
          id: "sig-glow-texture",
          source: sephora,
          theme: "wear_under_makeup",
          sentiment: "positive",
          summary:
            "A strong cluster likes it as a light moisturizer before sunscreen and makeup.",
          mentions: 22,
          averageRating: 4.2,
          confidence: "medium",
          evidenceIds: ["ev-sephora-texture"]
        },
        {
          id: "sig-glow-irritation",
          source: sephora,
          theme: "irritation",
          sentiment: "negative",
          summary:
            "Sensitive-skin reviewers describe stinging and redness after a few uses.",
          mentions: 18,
          averageRating: 4.2,
          confidence: "medium",
          evidenceIds: ["ev-sephora-irritation"]
        },
        {
          id: "sig-glow-value",
          source: sephora,
          theme: "value",
          sentiment: "negative",
          summary:
            "Some buyers feel the bottle is small for the price, especially for daily use.",
          mentions: 9,
          averageRating: 4.2,
          confidence: "low",
          evidenceIds: ["ev-sephora-value"]
        }
      ],
      editorialSignals: [
        {
          id: "sig-byrdie-finish",
          source: byrdie,
          theme: "finish",
          sentiment: "positive",
          summary:
            "Editorial coverage praises the fresh glow and the lightweight finish.",
          mentions: 2,
          comparisonProducts: ["Tatcha Water Cream"],
          confidence: "medium",
          evidenceIds: ["ev-byrdie-finish"]
        },
        {
          id: "sig-byrdie-hydration",
          source: byrdie,
          theme: "hydration",
          sentiment: "positive",
          summary:
            "Editors frame it as a strong summer moisturizer for combination skin.",
          mentions: 2,
          comparisonProducts: [],
          confidence: "medium",
          evidenceIds: ["ev-byrdie-hydration"]
        }
      ],
      socialSignals: [
        {
          id: "sig-tiktok-hype",
          source: tiktok,
          theme: "finish",
          sentiment: "positive",
          summary:
            "Creator transcripts emphasize the instant glow and prep-under-makeup feel.",
          mentions: 12,
          confidence: "low",
          evidenceIds: ["ev-tiktok-hype"]
        }
      ],
      sellerOffers: [
        {
          id: "offer-glow-direct",
          sellerName: "Glow Recipe",
          sellerType: "official",
          url: glowSeller.url,
          price: {
            amount: 39,
            currency: "USD"
          },
          size: {
            value: 60,
            unit: "ml"
          },
          sampleAvailable: false,
          availability: "in_stock",
          returnPolicyVisible: true,
          contactInfoVisible: true,
          shippingSummary: "Standard US shipping with returns policy linked.",
          trustSignals: ["Official brand store", "Published return policy"],
          riskSignals: [],
          confidence: "high",
          evidenceIds: ["ev-seller-glow-direct"]
        },
        {
          id: "offer-sephora",
          sellerName: "Sephora",
          sellerType: "retailer",
          url: sephoraSeller.url,
          price: {
            amount: 39,
            currency: "USD"
          },
          size: {
            value: 60,
            unit: "ml"
          },
          sampleAvailable: true,
          availability: "in_stock",
          returnPolicyVisible: true,
          contactInfoVisible: true,
          shippingSummary: "Pickup and returns available.",
          trustSignals: ["Established beauty retailer", "Visible customer support"],
          riskSignals: [],
          confidence: "high",
          evidenceIds: ["ev-seller-sephora"]
        },
        {
          id: "offer-mini",
          sellerName: "Glow Recipe Mini",
          sellerType: "official",
          url: glowSeller.url,
          price: {
            amount: 18,
            currency: "USD"
          },
          size: {
            value: 25,
            unit: "ml"
          },
          sampleAvailable: true,
          availability: "limited",
          returnPolicyVisible: true,
          contactInfoVisible: true,
          shippingSummary: "Good trial option if you want to patch test first.",
          trustSignals: ["Official source", "Sample-size availability"],
          riskSignals: [],
          confidence: "medium",
          evidenceIds: ["ev-seller-mini"]
        },
        {
          id: "offer-market",
          sellerName: "BudgetGlow Cosmetics",
          sellerType: "marketplace",
          url: marketSeller.url,
          price: {
            amount: 24,
            currency: "USD"
          },
          size: {
            value: 60,
            unit: "ml"
          },
          sampleAvailable: false,
          availability: "unknown",
          returnPolicyVisible: false,
          contactInfoVisible: false,
          shippingSummary: "Listing is vague about shipping and returns.",
          trustSignals: [],
          riskSignals: ["Much cheaper than other offers", "Missing return details"],
          confidence: "low",
          evidenceIds: ["ev-seller-market"]
        }
      ],
      alternativeCandidates: [
        {
          id: "alt-purito-oat",
          productName: "Purito Oat-in Calming Gel Cream",
          brand: "Purito",
          category: "moisturizer",
          price: {
            amount: 21,
            currency: "USD"
          },
          reasonHints: [
            "Fragrance-free gel texture",
            "Lower irritation risk for sensitive users",
            "Still feels lightweight under sunscreen"
          ],
          fitTags: ["lightweight", "sensitive-skin", "budget-friendly"],
          riskTags: [],
          confidence: "medium"
        },
        {
          id: "alt-toleriane-double-repair",
          productName: "La Roche-Posay Toleriane Double Repair Face Moisturizer",
          brand: "La Roche-Posay",
          category: "moisturizer",
          price: {
            amount: 23,
            currency: "USD"
          },
          reasonHints: [
            "Fragrance-free barrier support",
            "Better fit for reactive skin",
            "Stronger sensitivity match than the target product"
          ],
          fitTags: ["barrier-supporting", "sensitive-skin"],
          riskTags: ["slightly richer texture"],
          confidence: "high"
        },
        {
          id: "alt-aveeno-calm-restore",
          productName: "Aveeno Calm + Restore Oat Gel Moisturizer",
          brand: "Aveeno",
          category: "moisturizer",
          price: {
            amount: 24,
            currency: "USD"
          },
          reasonHints: [
            "More budget-friendly",
            "Oat-forward calming profile",
            "Reasonable choice if you want a trial before spending more"
          ],
          fitTags: ["budget-friendly", "sensitive-skin"],
          riskTags: ["slightly less glowy finish"],
          confidence: "medium"
        }
      ],
      evidence: [
        {
          id: "ev-glow-ingredients",
          source: glowOfficial,
          title: "Ingredient list",
          snippet:
            "The official list includes sodium hyaluronate, watermelon extract, and added fragrance.",
          confidence: "high",
          claimType: "ingredient",
          supports: ["contains fragrance", "contains hyaluronic acid"],
          tags: ["ingredients"]
        },
        {
          id: "ev-glow-claims",
          source: glowOfficial,
          title: "Official claims",
          snippet:
            "Glow Recipe describes the moisturizer as oil-free, lightweight, and designed to layer under makeup.",
          confidence: "high",
          claimType: "claim",
          supports: ["lightweight texture", "official claims"],
          tags: ["claims"]
        },
        {
          id: "ev-sephora-hydration",
          source: sephora,
          title: "Recurring hydration praise",
          snippet:
            "Many reviewers say it feels refreshing and hydrating without leaving a heavy film.",
          confidence: "medium",
          claimType: "sentiment",
          supports: ["consumer hydration praise"],
          tags: ["hydration", "retailer"]
        },
        {
          id: "ev-sephora-texture",
          source: sephora,
          title: "Makeup layering praise",
          snippet:
            "Reviewers often mention it sits nicely under sunscreen and makeup because the gel texture disappears quickly.",
          confidence: "medium",
          claimType: "sentiment",
          supports: ["lightweight under makeup"],
          tags: ["wear_under_makeup", "retailer"]
        },
        {
          id: "ev-sephora-irritation",
          source: sephora,
          title: "Sensitive-skin complaints",
          snippet:
            "A repeated complaint says it stung or caused redness on reactive skin, especially around cheeks.",
          confidence: "medium",
          claimType: "sentiment",
          supports: ["sensitive skin irritation"],
          tags: ["irritation", "retailer"]
        },
        {
          id: "ev-sephora-value",
          source: sephora,
          title: "Value complaints",
          snippet:
            "Several reviews say the bottle runs out quickly and does not feel inexpensive for daily use.",
          confidence: "low",
          claimType: "sentiment",
          supports: ["price-value concern"],
          tags: ["value", "retailer"]
        },
        {
          id: "ev-byrdie-finish",
          source: byrdie,
          title: "Editorial finish praise",
          snippet:
            "Editorial coverage highlights the glowy finish and the airy feel on combination skin.",
          confidence: "medium",
          claimType: "comparison",
          supports: ["editorial praise"],
          tags: ["finish", "editorial"]
        },
        {
          id: "ev-byrdie-hydration",
          source: byrdie,
          title: "Editorial hydration summary",
          snippet:
            "The review frames the product as a strong warm-weather option when you want lightweight hydration.",
          confidence: "medium",
          claimType: "comparison",
          supports: ["editorial hydration praise"],
          tags: ["hydration", "editorial"]
        },
        {
          id: "ev-tiktok-hype",
          source: tiktok,
          title: "Social glow hype",
          snippet:
            "Creators repeatedly describe it as a glowy prep step, but the clips rarely mention fragrance sensitivity.",
          confidence: "low",
          claimType: "comparison",
          supports: ["social enthusiasm"],
          tags: ["social", "finish"]
        },
        {
          id: "ev-seller-glow-direct",
          source: glowSeller,
          title: "Official store offer",
          snippet:
            "Brand store lists the standard price with visible returns and contact links.",
          confidence: "high",
          claimType: "seller",
          supports: ["official seller"],
          tags: ["seller", "trust"]
        },
        {
          id: "ev-seller-sephora",
          source: sephoraSeller,
          title: "Retailer offer",
          snippet:
            "Sephora matches the main price and includes pickup, returns, and customer support information.",
          confidence: "high",
          claimType: "seller",
          supports: ["trusted retailer"],
          tags: ["seller", "trust"]
        },
        {
          id: "ev-seller-mini",
          source: glowSeller,
          title: "Trial-size option",
          snippet:
            "A smaller official size makes it easier to patch test before committing to the full bottle.",
          confidence: "medium",
          claimType: "seller",
          supports: ["sample option"],
          tags: ["seller", "sample"]
        },
        {
          id: "ev-seller-market",
          source: marketSeller,
          title: "Suspiciously cheap listing",
          snippet:
            "One marketplace listing is far below the typical price and does not show a clear returns policy or seller contact details.",
          confidence: "low",
          claimType: "seller",
          supports: ["suspicious seller"],
          tags: ["seller", "risk"]
        }
      ],
      warnings: [],
      usedFallback: false
    }
  },
  {
    id: "boj-sunscreen-budget",
    title: "Beauty of Joseon sunscreen with seller tradeoffs",
    summary:
      "Shows a strong Buy verdict with a cheap but lower-trust seller versus safer purchase routes.",
    aliases: ["beauty of joseon", "relief sun", "boj sunscreen"],
    request: {
      mode: "demo",
      demoCaseId: "boj-sunscreen-budget",
      product: {
        rawQuery: "Beauty of Joseon Relief Sun: Rice + Probiotics SPF50+",
        queryType: "name",
        category: "sunscreen",
        country: "US"
      },
      userProfile: {
        id: "normal-budget-spf",
        name: "Mina",
        market: "US",
        skinType: "combination",
        concerns: ["dehydration", "sun protection"],
        sensitivities: [],
        likedProducts: [
          {
            productName: "Isntree Hyaluronic Acid Watery Sun Gel",
            suspectedIngredients: [],
            notes: "Liked the comfortable finish."
          }
        ],
        dislikedProducts: [
          {
            productName: "Mineral daily sunscreen stick",
            notes: "White cast and pilling under makeup.",
            suspectedIngredients: ["zinc oxide"]
          }
        ],
        desiredCharacteristics: [
          "no white cast",
          "comfortable finish",
          "good under makeup"
        ],
        currentRoutine: ["gel cleanser", "hydrating serum"],
        budgetRange: {
          max: 25,
          currency: "USD"
        },
        preferences: {
          lightweight: true,
          finish: "natural"
        },
        preferenceWeights: {
          fit: 0.3,
          ingredients: 0.2,
          sentiment: 0.2,
          evidence: 0.15,
          seller: 0.15
        }
      }
    },
    extraction: {
      product: {
        productId: "boj-relief-sun",
        name: "Beauty of Joseon Relief Sun: Rice + Probiotics SPF50+",
        brand: "Beauty of Joseon",
        category: "sunscreen",
        tagline: "Lightweight chemical sunscreen with a skincare-like finish",
        size: {
          value: 50,
          unit: "ml"
        },
        price: {
          amount: 18,
          currency: "USD"
        },
        ingredients: [
          ingredient("Rice Extract", "rice extract"),
          ingredient("Niacinamide", "niacinamide"),
          ingredient("Glycerin", "glycerin"),
          ingredient("Probiotic Ferment", "probiotic ferment")
        ],
        officialClaims: [
          "SPF50+ PA++++ broad-spectrum protection",
          "Moist daily sunscreen",
          "No white cast"
        ],
        textureTags: ["cream", "lightweight"],
        finishTags: ["natural", "dewy"],
        crueltyFree: true,
        confidence: "high",
        evidenceIds: ["ev-boj-claims", "ev-boj-ingredients"]
      },
      ingredientList: {
        items: [
          ingredient("Rice Extract", "rice extract"),
          ingredient("Niacinamide", "niacinamide"),
          ingredient("Glycerin", "glycerin"),
          ingredient("Probiotic Ferment", "probiotic ferment")
        ],
        declaredFragrance: false,
        confidence: "high",
        evidenceIds: ["ev-boj-ingredients"]
      },
      reviewSignals: [
        {
          id: "sig-boj-finish",
          source: stylevana,
          theme: "finish",
          sentiment: "positive",
          summary:
            "Reviewers repeatedly describe it as comfortable, moisturizing, and easy to reapply.",
          mentions: 48,
          averageRating: 4.6,
          confidence: "medium",
          evidenceIds: ["ev-boj-finish"]
        },
        {
          id: "sig-boj-white-cast",
          source: stylevana,
          theme: "white_cast",
          sentiment: "positive",
          summary: "Users commonly mention the near-invisible finish on deeper skin tones.",
          mentions: 24,
          averageRating: 4.6,
          confidence: "medium",
          evidenceIds: ["ev-boj-whitecast"]
        },
        {
          id: "sig-boj-eye-sting",
          source: stylevana,
          theme: "irritation",
          sentiment: "negative",
          summary:
            "A smaller complaint cluster says it can sting around the eyes during sweaty wear.",
          mentions: 8,
          averageRating: 4.6,
          confidence: "low",
          evidenceIds: ["ev-boj-eye-sting"]
        }
      ],
      editorialSignals: [
        {
          id: "sig-allure-finish",
          source: allure,
          theme: "finish",
          sentiment: "positive",
          summary:
            "Editorial coverage praises the elegant finish and no-white-cast performance.",
          mentions: 2,
          comparisonProducts: ["Supergoop Unseen Sunscreen"],
          confidence: "medium",
          evidenceIds: ["ev-allure-finish"]
        }
      ],
      socialSignals: [
        {
          id: "sig-reddit-comfort",
          source: reddit,
          theme: "wear_under_makeup",
          sentiment: "positive",
          summary:
            "Discussion posts often compare it favorably to heavier sunscreens when layered with makeup.",
          mentions: 14,
          confidence: "low",
          evidenceIds: ["ev-reddit-comfort"]
        }
      ],
      sellerOffers: [
        {
          id: "offer-boj-direct",
          sellerName: "Beauty of Joseon",
          sellerType: "official",
          url: officialBojSeller.url,
          price: {
            amount: 18,
            currency: "USD"
          },
          size: {
            value: 50,
            unit: "ml"
          },
          sampleAvailable: false,
          availability: "in_stock",
          returnPolicyVisible: true,
          contactInfoVisible: true,
          shippingSummary: "Official global shipping with customer support contact.",
          trustSignals: ["Official store", "Visible contact details"],
          riskSignals: [],
          confidence: "high",
          evidenceIds: ["ev-boj-direct"]
        },
        {
          id: "offer-stylevana",
          sellerName: "Stylevana",
          sellerType: "retailer",
          url: stylevanaSeller.url,
          price: {
            amount: 15,
            currency: "USD"
          },
          size: {
            value: 50,
            unit: "ml"
          },
          sampleAvailable: false,
          availability: "in_stock",
          returnPolicyVisible: true,
          contactInfoVisible: true,
          shippingSummary: "Lower price but longer shipping window.",
          trustSignals: ["Established retailer", "Clear price advantage"],
          riskSignals: [],
          confidence: "medium",
          evidenceIds: ["ev-stylevana-offer"]
        },
        {
          id: "offer-bargain",
          sellerName: "SunSale Outlet",
          sellerType: "marketplace",
          url: suspiciousSeller.url,
          price: {
            amount: 9,
            currency: "USD"
          },
          size: {
            value: 50,
            unit: "ml"
          },
          sampleAvailable: false,
          availability: "unknown",
          returnPolicyVisible: false,
          contactInfoVisible: false,
          shippingSummary: "Very low price with limited seller information.",
          trustSignals: [],
          riskSignals: ["Far below market price", "No visible returns or contact details"],
          confidence: "low",
          evidenceIds: ["ev-bargain-offer"]
        }
      ],
      alternativeCandidates: [
        {
          id: "alt-isntree",
          productName: "Isntree Hyaluronic Acid Watery Sun Gel",
          brand: "Isntree",
          category: "sunscreen",
          price: {
            amount: 16,
            currency: "USD"
          },
          reasonHints: [
            "Similar lightweight finish",
            "Often preferred if you want a slightly wetter feel",
            "Budget-friendly backup option"
          ],
          fitTags: ["lightweight", "hydrating"],
          riskTags: [],
          confidence: "medium"
        },
        {
          id: "alt-round-lab",
          productName: "Round Lab Birch Juice Moisturizing Sunscreen",
          brand: "Round Lab",
          category: "sunscreen",
          price: {
            amount: 22,
            currency: "USD"
          },
          reasonHints: [
            "Similar comfort profile",
            "Strong reputation for sensitive skin",
            "Good option if you want a little more moisture"
          ],
          fitTags: ["hydrating", "sensitive-skin"],
          riskTags: ["slightly pricier"],
          confidence: "medium"
        }
      ],
      evidence: [
        {
          id: "ev-boj-claims",
          source: bojOfficial,
          title: "Official sunscreen claims",
          snippet:
            "The official page emphasizes broad-spectrum protection, skincare-like texture, and no white cast.",
          confidence: "high",
          claimType: "claim",
          supports: ["no white cast", "official SPF claims"],
          tags: ["claims"]
        },
        {
          id: "ev-boj-ingredients",
          source: bojOfficial,
          title: "Ingredient list",
          snippet:
            "The ingredient list highlights rice extract, niacinamide, glycerin, and probiotic ferment with no added fragrance declared.",
          confidence: "high",
          claimType: "ingredient",
          supports: ["fragrance-free style profile"],
          tags: ["ingredients"]
        },
        {
          id: "ev-boj-finish",
          source: stylevana,
          title: "Comfort praise",
          snippet:
            "Reviewers describe the finish as comfortable and easy to wear every day without heaviness.",
          confidence: "medium",
          claimType: "sentiment",
          supports: ["comfortable finish"],
          tags: ["finish", "retailer"]
        },
        {
          id: "ev-boj-whitecast",
          source: stylevana,
          title: "White-cast praise",
          snippet:
            "Repeated reviewers note that the sunscreen blends transparently and avoids the chalky cast they see with many mineral options.",
          confidence: "medium",
          claimType: "sentiment",
          supports: ["no white cast"],
          tags: ["white_cast", "retailer"]
        },
        {
          id: "ev-boj-eye-sting",
          source: stylevana,
          title: "Eye-sting caution",
          snippet:
            "A smaller but recurring complaint says the sunscreen can sting near the eyes during hot or sweaty days.",
          confidence: "low",
          claimType: "sentiment",
          supports: ["minor irritation caution"],
          tags: ["irritation", "retailer"]
        },
        {
          id: "ev-allure-finish",
          source: allure,
          title: "Editorial praise",
          snippet:
            "The editorial review highlights the elegant finish and how wearable it feels compared with heavier sunscreens.",
          confidence: "medium",
          claimType: "comparison",
          supports: ["editorial praise"],
          tags: ["finish", "editorial"]
        },
        {
          id: "ev-reddit-comfort",
          source: reddit,
          title: "Discussion-board wearability",
          snippet:
            "Users on discussion forums often recommend it when someone wants a comfortable sunscreen under makeup.",
          confidence: "low",
          claimType: "comparison",
          supports: ["social corroboration"],
          tags: ["social", "wear_under_makeup"]
        },
        {
          id: "ev-boj-direct",
          source: officialBojSeller,
          title: "Official seller offer",
          snippet:
            "The official store publishes price, support information, and policy details clearly.",
          confidence: "high",
          claimType: "seller",
          supports: ["official seller"],
          tags: ["seller"]
        },
        {
          id: "ev-stylevana-offer",
          source: stylevanaSeller,
          title: "Retailer offer",
          snippet:
            "Stylevana offers a lower price than direct while still presenting standard retailer details.",
          confidence: "medium",
          claimType: "seller",
          supports: ["better price"],
          tags: ["seller"]
        },
        {
          id: "ev-bargain-offer",
          source: suspiciousSeller,
          title: "Suspicious cheap offer",
          snippet:
            "One bargain listing sits far below the rest of the market and lacks basic seller transparency signals.",
          confidence: "low",
          claimType: "seller",
          supports: ["seller risk"],
          tags: ["seller", "risk"]
        }
      ],
      warnings: [],
      usedFallback: false
    }
  }
];

export function getDemoCaseById(id: string): DemoCase | undefined {
  return demoCases.find((demoCase) => demoCase.id === id);
}

export function findDemoCase(rawQuery: string): DemoCase {
  const normalized = rawQuery.toLowerCase();

  return (
    demoCases.find((demoCase) =>
      demoCase.aliases.some((alias) => normalized.includes(alias))
    ) ?? demoCases[0]
  );
}

export function getDemoCaseSummaries() {
  return demoCases.map(({ id, title, summary, request }) => ({
    id,
    title,
    summary,
    request
  }));
}
