import { clampScore, median, scoreToConfidence } from "@/lib/format";
import type {
  ConfidenceLevel,
  NormalizedSellerOffer,
  SellerRankingItem
} from "@/schemas";

function sellerTrustBase(type: NormalizedSellerOffer["sellerType"]): number {
  return {
    official: 90,
    authorized: 82,
    retailer: 76,
    marketplace: 50,
    unknown: 42
  }[type];
}

function offerConfidence(confidence: ConfidenceLevel): number {
  return {
    high: 10,
    medium: 5,
    low: 0
  }[confidence];
}

export function rankSellerOffers(
  offers: NormalizedSellerOffer[]
): SellerRankingItem[] {
  if (!offers.length) {
    return [];
  }

  const medianPrice = median(offers.map((offer) => offer.price.amount));
  const cheapestPrice = Math.min(...offers.map((offer) => offer.price.amount));

  return offers
    .map((offer) => {
      const unitValue =
        offer.size && offer.size.value > 0
          ? offer.price.amount / offer.size.value
          : undefined;
      let trustScore =
        sellerTrustBase(offer.sellerType) +
        (offer.returnPolicyVisible ? 6 : -4) +
        (offer.contactInfoVisible ? 6 : -6) +
        Math.min(offer.trustSignals.length * 3, 9) -
        Math.min(offer.riskSignals.length * 7, 21) +
        offerConfidence(offer.confidence);

      if (offer.price.amount < medianPrice * 0.7) {
        trustScore -= 18;
      }

      const valueScore =
        100 - Math.min(45, ((offer.price.amount - cheapestPrice) / cheapestPrice) * 40);
      const sampleBonus = offer.sampleAvailable ? 8 : 0;
      const purchaseScore = clampScore(
        trustScore * 0.68 + valueScore * 0.22 + sampleBonus
      );
      const rationale: string[] = [];

      if (offer.sellerType === "official") {
        rationale.push("Official source with the strongest authenticity signal.");
      } else if (offer.sellerType === "retailer") {
        rationale.push("Established retailer with stronger transparency than a marketplace listing.");
      }

      if (offer.sampleAvailable) {
        rationale.push("Sample or mini option reduces downside if you want to patch test first.");
      }

      if (offer.returnPolicyVisible && offer.contactInfoVisible) {
        rationale.push("Visible returns and contact details improve purchase confidence.");
      }

      if (offer.price.amount < medianPrice * 0.7) {
        rationale.push("Price is suspiciously low versus the rest of the market.");
      } else if (offer.price.amount === cheapestPrice) {
        rationale.push("One of the better value options in the market set.");
      }

      if (offer.shippingSummary) {
        rationale.push(offer.shippingSummary);
      }

      return {
        offer,
        rank: 0,
        purchaseScore,
        valuePerUnit: unitValue,
        rationale,
        confidence: scoreToConfidence(purchaseScore)
      };
    })
    .sort((left, right) => right.purchaseScore - left.purchaseScore)
    .map((item, index) => ({
      ...item,
      rank: index + 1
    }));
}
