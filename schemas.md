# schemas.md

## Purpose
This document maps the conceptual SignalSkin contracts to the actual schema files in the implementation.

All production-facing contracts live in `src/schemas/` and are validated with Zod.

---

## Schema file map

### `src/schemas/common.ts`
Shared enums and primitives:
- `Mode`
- `Verdict`
- `ConfidenceLevel`
- `SourceType`
- `ProductCategory`
- `SkinType`
- `SignalTheme`
- `Money`
- `Size`
- `SourceMetadata`
- `SourcePlan`
- `ProgressStep`

### `src/schemas/input.ts`
User and request contracts:
- `ProductQuery`
- `UserProfile`
- `AnalyzeRequest`

### `src/schemas/extraction.ts`
Normalized extraction-layer contracts:
- `SourceEvidence`
- `NormalizedIngredient`
- `NormalizedIngredientList`
- `NormalizedProduct`
- `NormalizedReviewSignal`
- `NormalizedEditorialSignal`
- `AlternativeCandidate`
- `NormalizedSellerOffer`

### `src/schemas/report.ts`
Reasoning and final report contracts:
- `IngredientFlag`
- `SentimentTheme`
- `ContradictionFinding`
- `AlternativeRecommendation`
- `SellerRankingItem`
- `ScoreBreakdown`
- `FinalVerdict`
- `ProductReport`
- `AnalyzeResponse`

---

## Design rules implemented

The current schemas intentionally:
- distinguish extracted evidence from inferred recommendation output
- include confidence fields across extraction and report layers
- preserve source metadata for citations
- support partial extraction and graceful degradation
- keep score breakdowns inspectable
- avoid hiding product reasoning inside UI-only shapes

---

## Key request contract

`AnalyzeRequest` contains:
- `mode`
- `demoCaseId`
- `product`
  - `rawQuery`
  - `queryType`
  - `category`
  - `country`
- `userProfile`
  - `market`
  - `skinType`
  - `concerns`
  - `sensitivities`
  - `likedProducts`
  - `dislikedProducts`
  - `desiredCharacteristics`
  - `currentRoutine`
  - `budgetRange`
  - `preferences`
  - `preferenceWeights`

Product memories are stored as explicit structured objects rather than opaque strings so past good/bad product experiences can be used during reasoning.

---

## Key report contract

`ProductReport` contains:
- original validated request
- `sourcePlan`
- `progress`
- normalized `product`
- `ingredientFlags`
- `sentimentThemes`
- `contradictionFindings`
- `alternatives`
- `sellerRankings`
- `scoreBreakdown`
- `finalVerdict`
- `evidence`
- `sourceCoverage`
- `whatWeKnow`
- `lessCertainAbout`
- `providerName`
- `warnings`

This keeps the final UI response evidence-backed, explainable, and demo-safe.

---

## Current schema notes

- `ingredientCompatibility` in the score breakdown is a positive score where higher means fewer profile conflicts.
- `sourcePlan.fallbackUsed` is true when SignalSkin intentionally relies on demo/mock evidence rather than a full live extraction path.
- Social signals are modeled as secondary evidence and should not be treated as sole truth for verdicts.
- Seller offers are tracked separately from efficacy and sentiment evidence to preserve clean reasoning boundaries.

---

## Validation usage

Implemented validation entry points:
- API request parsing in `src/app/api/analyze/route.ts`
- orchestration input parsing in `src/orchestration/analyze-product.ts`
- response shape validation in the API route before returning JSON
- schema regression tests in `tests/schema.spec.ts`

---

## Bottom line

The codebase now has a single typed source of truth for:
- what the UI can submit
- what providers can extract
- what the reasoning layer can infer
- what the report renderer can display
