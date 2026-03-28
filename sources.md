
---

## `sources.md`

```md
# sources.md

## Purpose
This document defines the source classes used by SignalSkin and how they should be interpreted.

This is important because not all web sources are equally useful or equally trustworthy for every kind of conclusion.

The system should use different sources for different purposes and should avoid treating all sources as interchangeable.

---

## Source design principles

SignalSkin should:
- extract from multiple source classes
- preserve source type metadata
- reason differently based on source type
- show evidence and confidence
- avoid overstating low-quality or anecdotal evidence

SignalSkin should not:
- treat social hype as proof
- treat official product claims as neutral truth
- use seller pages as evidence of efficacy
- collapse all evidence into one undifferentiated score

---

## Supported source classes

## 1. Official product pages

### Examples
- brand-owned product pages
- official product detail pages

### Strong use cases
- product name
- brand
- category
- size
- price
- variant info
- official claims
- ingredient lists
- usage instructions

### Weak use cases
- unbiased efficacy judgment
- trustable sentiment
- long-term consumer experience

### Interpretation guidance
Official product pages are best for product facts, not product truth.

Use them to extract:
- structured metadata
- ingredients
- claims
- packaging info

Do not use them as primary evidence that a product works well.

### Typical confidence
- High for factual product metadata
- Low for efficacy claims

---

## 2. Retailer product and review pages

### Examples
- beauty retailers
- marketplace product pages with reviews
- e-commerce product listings

### Strong use cases
- overall ratings
- recurring consumer complaints
- recurring consumer praise
- texture/finish impressions
- wear experience
- possible verified buyer patterns
- price comparison

### Weak use cases
- causal conclusions
- precise ingredient sensitivity claims
- universal applicability

### Interpretation guidance
Retailer reviews are valuable because they capture repeated real-user experiences, but they are noisy.

Use them for:
- identifying recurring themes
- detecting complaint clusters
- comparing broad sentiment

Apply caution because:
- reviews can be biased
- reviews may be fake or low quality
- strong outliers may distort perception
- average ratings can hide specific complaints

### Typical confidence
- Medium for repeated themes
- Low for one-off anecdotal claims

---

## 3. Editorial and blog sources

### Examples
- beauty publications
- review blogs
- comparison articles
- “best of” roundups

### Strong use cases
- product context
- descriptive summaries
- use-case framing
- comparative commentary
- narrative pros/cons
- finish/texture/use-case explanations

### Weak use cases
- neutral truth
- broad statistical confidence
- personalized fit

### Interpretation guidance
Editorial sources are useful for context and synthesis, but their quality varies.

Use them for:
- describing the role of a product
- identifying editorial praise or caution themes
- comparing products in a category

Apply caution because:
- some content is affiliate-incentivized
- review depth varies
- not all editorial commentary reflects long-term real-world use

### Typical confidence
- Medium for descriptive context
- Low/medium for strong recommendation claims

---

## 4. Ingredient-oriented reference sources

### Examples
- ingredient glossary pages
- ingredient explainer pages
- formulation reference pages

### Strong use cases
- ingredient normalization
- ingredient alias mapping
- general caution tags
- descriptive background for ingredients

### Weak use cases
- personalized safety predictions
- medical claims
- guaranteed incompatibility

### Interpretation guidance
These sources are useful to support:
- ingredient parsing
- basic caution heuristics
- understandable explanations

They should not be used to claim:
- medical diagnoses
- certainty that an ingredient will cause irritation
- clinical outcomes for a specific user

### Typical confidence
- Medium for ingredient definitions
- Low for personalized risk conclusions

---

## 5. Seller listing pages

### Examples
- retailer offers
- seller storefront listings
- beauty marketplace listings

### Strong use cases
- price
- size
- stock/availability
- shipping and returns visibility
- sample/trial availability
- merchant transparency signals

### Weak use cases
- efficacy
- user satisfaction
- ingredient interpretation

### Interpretation guidance
Seller pages should inform:
- where to buy
- how much it costs
- whether an offer looks credible
- whether sample options exist

Seller pages should not influence product efficacy judgments.

### Trust/value considerations
Useful features:
- official retailer signal
- clear return policy
- visible contact info
- plausible price range
- shipping transparency
- sample-size availability

Risk indicators:
- suspiciously low price
- missing seller info
- unclear returns
- vague listing details

### Typical confidence
- High for price and listing metadata
- Low for broader product quality conclusions

---

## 6. Social / transcript sources

### Examples
- TikTok transcripts
- short-form beauty commentary transcripts
- social discussion text
- creator video summaries

### Strong use cases
- trend detection
- repeated anecdotal praise/complaints
- viral claims
- product comparisons
- early discovery of alternatives
- emerging concerns

### Weak use cases
- grounded truth
- complete product evaluation
- ingredient certainty
- personalized compatibility conclusions

### Interpretation guidance
Social content is highly relevant in beauty discovery, but should be treated as a secondary signal layer.

Use it for:
- what people are talking about
- recurring creator/user claims
- what products are being compared
- what concerns are surfacing quickly

Apply caution because:
- sponsorship bias may be present
- anecdotal evidence dominates
- transcripts lose visual context
- hype can outpace reality
- sarcasm or nuance may be lost in transcript form

### Recommended role
Use social/transcript evidence to:
- enrich trend and sentiment detection
- surface emerging complaints or excitement
- suggest alternatives or comparison products

Do not let it become the sole basis for:
- recommendation verdicts
- ingredient risk judgments
- seller trust decisions

### Typical confidence
- Low/medium for repeated trend signals
- Low for direct decision-making by itself

---

## Source weighting philosophy

The system should combine source types instead of flattening them.

A rough weighting philosophy:

### Official product pages
Best for:
- facts
- ingredients
- claims

### Retailer reviews
Best for:
- repeated real-user themes
- texture/finish/performance patterns

### Editorial/blog
Best for:
- comparative context
- descriptive summaries
- curated pros/cons

### Ingredient references
Best for:
- ingredient naming and general caution explanation

### Seller listings
Best for:
- value and trust ranking
- purchase routing

### Social/transcripts
Best for:
- trend velocity
- emerging claims
- early complaint clustering
- alternative discovery

---

## Source-to-conclusion mapping

Use this guide when building reasoning logic:

### “This product contains fragrance”
Best sources:
- official product page
- retailer product metadata
- ingredient reference pages

### “Consumers often complain that this pills under makeup”
Best sources:
- retailer reviews
- editorial mentions
- social/transcript repetition if corroborated

### “This may not fit a fragrance-sensitive user”
Best sources:
- product ingredients
- user profile
- ingredient caution rules

### “This seller is a better purchase option”
Best sources:
- seller listing metadata
- merchant transparency signals
- price/value heuristics

### “This product is trending positively”
Best sources:
- social/transcript sources
- editorial coverage velocity
- retailer review momentum if available

---

## Contradiction patterns to detect

Important contradiction patterns include:

### Editorial positive, consumer negative
Example:
- editorial praises finish
- retailer reviews report irritation or pilling

### High average rating, repeated specific complaint
Example:
- strong overall stars
- repeated complaints about white cast

### Social hype, weak personalized fit
Example:
- creator enthusiasm is strong
- ingredients conflict with the user’s sensitivities

### Cheap seller, weak trust signals
Example:
- lowest price looks attractive
- seller transparency is poor

These contradictions should be surfaced, not hidden.

---

## Confidence guidance by source diversity

Confidence should generally increase when:
- multiple source classes agree
- repeated themes appear across different source types
- structured facts are corroborated
- extraction quality is high

Confidence should decrease when:
- only one weak source exists
- evidence is sparse
- sources strongly disagree
- claims come mostly from anecdotal or hype-driven channels

---

## Fallback behavior
If some source classes are missing:
- continue with the available sources
- lower confidence appropriately
- clearly state which types of evidence were unavailable
- avoid fabricating balance where none exists

---

## Source adapter requirements
Every source adapter should ideally return:
- source type
- source name
- URL if available
- extraction confidence
- normalized fields
- raw evidence snippets where possible
- warnings if extraction is incomplete

---

## Non-goals
This source model is not intended to:
- guarantee truth
- perform medical interpretation
- prove authenticity with certainty
- assign universal trust scores beyond heuristic ranking

Its purpose is to create a practical, explainable evidence model for a hackathon MVP.

---

## Bottom line
SignalSkin should use the web like an analyst, not like a scraper.

That means:
- extracting from multiple source classes
- keeping track of where evidence came from
- reasoning differently based on source quality and purpose
- showing contradictions and uncertainty
- helping the user make a better purchase decision