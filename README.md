# SignalSkin

SignalSkin is an autonomous cosmetic intelligence agent built for a TinyFish x OpenAI hackathon.

Instead of forcing users to manually research products across brand pages, retailer reviews, editorial articles, ingredient-oriented sources, and seller listings, SignalSkin gathers evidence from multiple web source classes and turns it into a personalized, explainable purchase recommendation.

The system is designed to answer:
- Should I buy this product?
- Why or why not?
- Is it a good fit for my skin type, sensitivities, and preferences?
- What are consumers and editorial sources commonly saying?
- Are there contradictions across sources?
- What are better alternatives?
- Where can I buy it from the most trustworthy seller at the best value?

---

## Why this exists

Beauty and skincare research is fragmented and noisy.

Users often need to check:
- official product pages
- retailer reviews
- blog/editorial writeups
- ingredient explainers
- seller listings
- social discovery channels

Even after all that, they still may not know whether a product is right for **their** skin, routine, sensitivities, or budget.

SignalSkin turns that fragmented process into a single evidence-backed workflow.

---

## Core product idea

SignalSkin is not just a beauty recommender.

It is a **live-web evidence synthesis and personalized purchase-intelligence system** for cosmetics and skincare.

Given a product plus a user profile, SignalSkin produces:
- a final verdict: `Buy`, `Cautious Try`, or `Skip`
- a confidence level
- ingredient caution flags
- a personalized fit summary
- sentiment themes from multiple source types
- contradiction findings when sources disagree
- alternative recommendations with reasons
- seller rankings based on trust and value
- evidence snippets supporting major conclusions

---

## Hackathon framing

This project is designed to fit the TinyFish x OpenAI hackathon theme around autonomous web agents operating on the live web.

### TinyFish role
TinyFish is the primary live-web browsing and extraction layer.

It is intended to power:
- live site search and navigation
- parallel extraction across multiple sources
- interaction with dynamic pages
- review expansion and pagination
- structured extraction from messy websites

### OpenAI role
OpenAI models support:
- source planning
- reasoning over extracted evidence
- sentiment synthesis
- contradiction detection
- alternative generation
- recommendation assembly

Codex helps accelerate:
- repo scaffolding
- source adapters
- domain logic
- evals
- tests
- documentation
- UI implementation

---

## MVP scope

The MVP should focus on:
- one product analyzed at a time
- one main category first, preferably moisturizers or sunscreens
- product input by name or URL
- user profile input
- evidence-backed output
- seller ranking
- polished demo path
- demo-safe fallback mode

The MVP should not try to become:
- a medical advisory product
- a dermatologist replacement
- a universal beauty marketplace
- a full creator analytics platform

---

## Main features

### 1. Product intelligence report
For a target product:
- normalized name
- brand
- category
- size and price if available
- ingredients
- official claims
- recommendation summary
- evidence and confidence

### 2. Personalized fit
Using a user profile:
- skin type
- concerns
- sensitivities
- liked/disliked products
- preferences
- budget

SignalSkin estimates product fit using explainable heuristics.

### 3. Ingredient caution layer
The system flags:
- ingredients matching declared sensitivities
- overlap with disliked products
- product characteristics that may conflict with the user’s needs

This is a heuristic compatibility layer, not medical advice.

### 4. Multi-source sentiment synthesis
The system aggregates and summarizes common praise and complaints across:
- retailer reviews
- editorial/blog sources
- ingredient-oriented sources where relevant
- optional social/transcript sources

### 5. Contradiction detection
Examples:
- editorial praise vs repeated consumer complaints
- strong average sentiment vs recurring irritation mentions
- social hype vs weak profile compatibility

### 6. Alternative recommendations
Alternatives should be reason-based, such as:
- lower irritation risk
- lower price
- similar finish
- better for oily skin
- fragrance-free option

### 7. Seller trust/value ranking
SignalSkin ranks purchase options using:
- merchant trust heuristics
- price
- size/value
- sample availability
- transparency signals
- suspicious-price penalties

---

## Architecture summary

High-level flow:

1. User submits product + profile
2. Source planner chooses source classes
3. Provider layer gathers evidence from live or mock sources
4. Normalization layer converts raw extraction into shared schemas
5. Domain logic computes:
   - personal fit
   - ingredient cautions
   - sentiment themes
   - contradictions
   - alternatives
   - seller rankings
   - final verdict
6. UI renders an evidence-backed report

See `architecture.md` for full details.

---

## Repository layout

Suggested structure:

```text
src/
  app/              # routes/pages
  components/       # UI
  domain/           # scoring, sentiment, contradictions, alternatives
  providers/        # TinyFish provider, mock provider
  orchestration/    # workflow coordination
  schemas/          # shared contracts and validation
  lib/              # helpers
fixtures/           # seeded demo/eval data
tests/              # tests
README.md
AGENTS.md
architecture.md
tasks.md
demo.md
evals.md
schemas.md
sources.md
.env.example
```

---

## Current implementation status

This repo now includes a working MVP scaffold with:
- Next.js App Router + TypeScript + Tailwind foundation
- `POST /api/analyze`, `GET /api/demo/[demoId]`, and `GET /api/health`
- canonical Zod contracts in `src/schemas/`
- a provider abstraction with `MockProvider` and a first-pass `TinyFishProvider`
- seeded demo fixtures in `fixtures/demo-cases.ts`
- reasoning modules for ingredient flags, fit scoring, sentiment synthesis, contradiction detection, alternatives, seller ranking, and final verdict scoring
- a demo-focused frontend that shows progress, evidence, uncertainty, contradictions, alternatives, and seller rankings
- fixture-backed tests and evals in `tests/`

---

## Local setup

### Prerequisites
- Node.js 20+
- `pnpm`

### Install
```bash
pnpm install
```

### Run the app
```bash
pnpm dev
```

### Verify
```bash
pnpm lint
pnpm test
pnpm eval
pnpm build
```

### Environment
Copy `.env.example` into `.env.local` if you want to customize runtime behavior.

Key variables:
- `SIGNALSKIN_DEFAULT_MODE`
- `SIGNALSKIN_USE_MOCK_PROVIDER`
- `TINYFISH_API_KEY`
- `OPENAI_API_KEY`
- `SIGNALSKIN_TINYFISH_PRODUCT_TIMEOUT_MS`
- `SIGNALSKIN_TINYFISH_PRODUCT_INACTIVITY_TIMEOUT_MS`
- `SIGNALSKIN_TINYFISH_SUPPORT_TIMEOUT_MS`
- `SIGNALSKIN_TINYFISH_SUPPORT_INACTIVITY_TIMEOUT_MS`

If the pass-specific TinyFish timeout variables are unset, SignalSkin falls back to the generic live-web timeout settings:
- `SIGNALSKIN_TINYFISH_TIMEOUT_MS`
- `SIGNALSKIN_TINYFISH_INACTIVITY_TIMEOUT_MS`

---

## Demo mode

The frontend includes seeded one-click demo scenarios for:
- `glow-recipe-sensitive-skin`
- `boj-sunscreen-budget`

These cases are designed to show:
- contradiction handling
- profile-driven caution
- seller trust/value tradeoffs
- evidence-backed reasoning

SignalSkin issues one API request per analysis run. There is no background polling loop, which keeps the MVP credit-efficient and predictable during demos.

---

## TinyFish and OpenAI in this repo

### TinyFish
TinyFish is abstracted behind `src/providers/`.

Current state:
- `MockProvider` is the reliable default demo path
- `TinyFishProvider` now performs a first-pass live TinyFish extraction and falls back gracefully when the live call fails

### OpenAI
The current MVP focuses on deterministic, inspectable heuristics for hackathon reliability.

OpenAI is positioned to extend:
- source planning
- extraction post-processing
- contradiction explanation
- narrative summarization
- future eval generation

---

## Tests and evals

Current test coverage includes:
- schema validation
- ingredient warning logic
- verdict consistency across profile shifts
- suspicious seller penalty behavior
- seeded demo-path eval coverage

Files:
- `tests/schema.spec.ts`
- `tests/ingredient-analysis.spec.ts`
- `tests/recommendation.spec.ts`
- `tests/evals.spec.ts`

---

## Known limitations

- Live TinyFish extraction now runs bounded parallel specialist passes and streams partial results into the UI; when time budgets are hit it returns partial live evidence instead of seeded mock data, but direct product URLs still outperform search-first mode on messy sites.
- Persistence is currently fixture-backed and request-scoped, not database-backed.
- Source coverage is seeded for demo reliability rather than broadly live-web complete.
- Scoring is intentionally heuristic and inspectable, not ML-personalized.

---

## Next best improvements

- Improve live TinyFish depth for tougher JavaScript-heavy sites and richer alternative discovery.
- Add lightweight persistence for saved profiles and product history.
- Expand fixture coverage for sparse-evidence and multi-market pricing cases.
- Add compare-two-products and watchlist flows as stretch features.
