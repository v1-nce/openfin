# architecture.md

## Overview
SignalSkin is an autonomous cosmetic intelligence agent that turns messy live web evidence into a personalized purchase recommendation.

A user provides:
- a product name or product URL
- their skin type, sensitivities, preferences, budget, and optionally prior liked/disliked products

The system then:
1. plans which source types to query
2. uses a web extraction layer to gather evidence
3. normalizes extracted content into a common schema
4. runs explainable reasoning and ranking
5. returns a structured report with evidence and confidence

The product is designed for a hackathon MVP, so it should prioritize:
- live-web credibility
- strong demo flow
- modularity
- explainability
- graceful degradation

---

## Product framing
SignalSkin is not just a beauty recommender.

It is a **live-web evidence synthesis and personalized purchase-intelligence system** for skincare and cosmetics.

Its core job is to answer:
- Should I buy this?
- Why or why not?
- Is it compatible with my profile?
- What are the common consumer and editorial signals?
- What contradictions exist across sources?
- What better alternatives exist?
- Where should I buy it safely and cost-effectively?

---

## System goals
The MVP should support:
- one product analyzed at a time
- one primary category at first, preferably moisturizers or sunscreens
- multiple source classes
- a personalized fit layer
- ingredient caution flags
- sentiment theme synthesis
- contradiction detection
- alternatives
- seller trust/value ranking
- evidence-backed reporting

---

## High-level architecture

### 1. UI layer
Responsible for:
- collecting user input
- showing crawl/progress state
- rendering the final report
- exposing evidence and confidence
- supporting seeded demo flows

Likely components:
- input form
- progress panel
- recommendation summary
- score breakdown
- ingredient analysis
- sentiment summaries
- contradiction card
- alternatives list
- seller rankings
- evidence drawer

---

### 2. API/controller layer
Responsible for:
- accepting product/profile requests
- validating input
- calling orchestration services
- returning structured reports
- handling demo mode and mock mode

Possible endpoints:
- `POST /api/analyze`
- `GET /api/demo/:id`
- `GET /api/health`

---

### 3. Orchestration layer
Responsible for coordinating the full workflow:
1. validate request
2. choose source classes
3. launch extraction jobs
4. normalize results
5. call reasoning/scoring modules
6. assemble final report
7. return UI-ready payload

This layer should not contain source-specific parsing details.

---

### 4. Source planning layer
Responsible for deciding which source classes matter for a given request.

Inputs:
- product category
- product URL or product name
- user market/country
- user profile attributes
- demo mode vs live mode

Outputs:
- a crawl/extraction plan across source classes

Example logic:
- always include official product pages if available
- include retailer pages for review-heavy categories
- include editorial/blog pages for opinion synthesis
- include seller pages for pricing and trust
- optionally include social/transcript sources for trend-sensitive products

---

### 5. Extraction provider layer
Responsible for interacting with the web and converting raw pages into structured extractions.

This layer should be provider-based.

#### Provider interface
A provider should support some combination of:
- search
- fetch
- navigate
- extract
- normalize-friendly output
- extraction confidence metadata

#### Planned providers
- `TinyFishProvider`
- `MockProvider`
- optional transcript/social provider

#### TinyFish role
TinyFish is the primary live-web execution layer and should be used for:
- live search and navigation
- parallel browsing across sites
- dynamic page interaction
- “show more” and review expansion
- JavaScript-heavy sites
- extraction from messy or anti-brittle web pages

If direct TinyFish SDK details are unavailable, create a clean interface and a stub adapter.

#### Mock provider role
The mock provider exists to:
- keep the system runnable
- make demo mode reliable
- support development before live integrations are complete
- enable tests and fixtures

---

## Source classes

### Official product pages
Use for:
- product name
- brand
- category
- price
- size
- ingredients
- official claims

Limitations:
- not an unbiased source for efficacy

### Retailer/review pages
Use for:
- overall ratings
- repeated consumer praise/complaints
- verified purchase signals when available
- price comparisons

Limitations:
- noisy and biased
- may overrepresent certain experiences

### Editorial/blog pages
Use for:
- narrative product summaries
- use-case comparisons
- descriptive commentary on texture/finish/performance

Limitations:
- variable quality
- may be affiliate-influenced

### Ingredient-oriented pages
Use for:
- ingredient definitions
- caution context
- naming normalization support

Limitations:
- should not be treated as personalized medical guidance

### Seller listing pages
Use for:
- availability
- merchant name
- price
- size and value
- shipping and return signals
- possible sample/trial offerings

Limitations:
- should not drive efficacy conclusions

### Social / transcript sources
Use for:
- trend velocity
- repeated complaints or praise
- product comparisons
- emerging alternatives

Limitations:
- anecdotal
- sponsorship bias
- transcript may lose visual context
- lower trust than product/review/editorial facts

---

## Data flow

### Step 1: input capture
The user submits:
- product query
- market/country
- budget
- skin type
- concerns
- sensitivities
- preferences
- liked/disliked products
- optional current routine

### Step 2: source planning
The planner decides which source classes to hit.

### Step 3: extraction
Providers gather raw evidence from the web or from mock fixtures.

### Step 4: normalization
Raw source outputs are transformed into common typed schemas.

### Step 5: reasoning and scoring
Domain logic computes:
- personal fit
- ingredient caution flags
- sentiment themes
- contradictions
- alternatives
- seller rankings
- final verdict
- confidence

### Step 6: report assembly
A final structured report is built for frontend rendering.

### Step 7: UI presentation
The report is shown with:
- recommendation summary
- score breakdown
- explanation
- evidence/citations
- uncertainty notes

---

## Core data contracts

The repo should centralize schemas for:

### Input schemas
- `UserProfile`
- `ProductQuery`
- `AnalyzeRequest`

### Normalized extraction schemas
- `NormalizedProduct`
- `NormalizedReviewSignal`
- `NormalizedEditorialSignal`
- `NormalizedIngredientList`
- `NormalizedSellerOffer`
- `SourceEvidence`

### Domain output schemas
- `IngredientFlag`
- `SentimentTheme`
- `ContradictionFinding`
- `AlternativeRecommendation`
- `SellerRankingItem`
- `ScoreBreakdown`
- `FinalVerdict`
- `ProductReport`

These should be explicit and ideally validated with a schema library.

---

## Reasoning architecture

### Personal fit scoring
Inputs:
- skin type
- concerns
- sensitivities
- prior liked/disliked products
- desired characteristics
- budget

Output:
- fit score
- reasons for fit
- reasons for caution

### Ingredient caution analysis
Inputs:
- normalized ingredient list
- user sensitivities
- disliked product overlap
- simple heuristic rules

Output:
- caution flags with plain-language explanations

This is heuristic only, not medical advice.

### Sentiment synthesis
Inputs:
- review signals
- editorial signals
- optional transcript signals

Output:
- clustered themes such as hydration, texture, breakouts, finish, irritation, pilling, value

### Contradiction detection
Examples:
- editorial praise but recurring irritation complaints
- strong average rating but frequent negative edge-case themes
- social hype but weak profile fit

### Alternative generation
Alternatives should be reason-based, for example:
- lower irritation risk
- lower price
- similar finish
- better seller coverage
- better sentiment for a given user profile

### Seller ranking
Seller ranking should combine:
- trust heuristics
- price
- size
- value ratio
- sample availability
- transparency signals

---

## Trust and confidence model

The system must separate:
- extracted fact
- interpreted pattern
- inferred recommendation

Every report should communicate confidence:
- High confidence
- Medium confidence
- Low confidence

Confidence should consider:
- number of sources
- source diversity
- source consistency
- extraction quality
- contradiction severity

Every major conclusion should, where possible, include:
- source name
- source type
- URL if available
- short evidence snippet
- confidence level

---

## Error handling and fallback strategy

The system must degrade gracefully.

### Failure scenarios
- live crawl partially fails
- source pages are unavailable
- extraction is incomplete
- only a few sources are found

### Fallback behavior
- use mock/demo fixtures if needed
- mark sections as low-confidence rather than fabricating
- return partial reports when possible
- keep the demo path working even without full live coverage

---

## Recommended directory structure

```text
app/ or src/app/
components/
domain/
  ingredient-analysis/
  sentiment/
  contradictions/
  scoring/
  alternatives/
  seller-ranking/
providers/
  tinyfish/
  mock/
orchestration/
schemas/
lib/
fixtures/
tests/
docs/ or root markdown files