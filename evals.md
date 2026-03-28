
---

## `evals.md`

```md
# evals.md

## Purpose
This document defines how SignalSkin should be evaluated during development.

The goal is not to create a perfect scientific benchmark.
The goal is to make the system feel:
- engineered
- inspectable
- reliable
- demo-ready
- resistant to obvious failure modes

For a hackathon MVP, evals should focus on:
- extraction correctness
- reasoning consistency
- explainability
- confidence honesty
- demo reliability

---

## Evaluation philosophy

SignalSkin should be judged on whether it:
1. extracts the right information
2. represents uncertainty honestly
3. reasons consistently from evidence
4. changes recommendations appropriately when user profiles change
5. avoids unsupported claims
6. produces a stable demo path even when live inputs are partial

---

## Evaluation categories

## 1. Schema and contract validation
Verify that:
- request payloads validate correctly
- normalized extraction outputs conform to schemas
- reports are structurally complete
- required fields are present
- enums and confidence labels are valid

### Example checks
- invalid empty query should fail validation
- report with missing recommendation should fail
- evidence snippet without source metadata should fail

---

## 2. Product metadata extraction
Evaluate whether the system correctly extracts:
- product name
- brand
- category
- price
- size
- official claims
- ingredients string or list

### Success criteria
- expected key fields are present
- values are approximately correct
- confidence reflects extraction quality

### Fixture examples
- official product page fixture
- retailer product page fixture
- incomplete product page fixture

---

## 3. Ingredient normalization and caution logic
Evaluate whether the system:
- parses ingredient lists reasonably
- matches user-declared sensitivities
- detects overlap with avoided ingredients
- generates plain-language caution flags
- avoids overstated language

### Success criteria
- expected ingredients are found
- explicit user sensitivity matches produce flags
- no medical language is introduced
- severity is plausible
- caution explanations are understandable

### Example test cases
- user sensitive to fragrance and product contains fragrance
- user avoids niacinamide and product includes niacinamide
- user disliked a product with overlap on several key ingredients
- product contains no matched sensitivities and should not trigger false alarms

---

## 4. Sentiment synthesis
Evaluate whether the system correctly summarizes recurring source themes.

### Themes to support
- hydration
- irritation
- texture
- finish
- white cast
- pilling
- breakouts
- value

### Success criteria
- repeated signals are grouped into coherent themes
- positive and negative themes are separated correctly
- summaries are concise and faithful to evidence
- source diversity is preserved where possible

### Example cases
- multiple reviews mention good hydration and heavy texture
- editorial source praises finish but consumers complain about pilling
- mostly neutral or sparse evidence should produce lower confidence

---

## 5. Contradiction detection
Evaluate whether the system detects meaningful disagreement instead of flattening everything into one opinion.

### Success criteria
- contradiction is emitted when evidence conflicts materially
- contradiction includes both support and counter-evidence
- confidence reflects the amount/quality of conflict
- no contradiction is emitted when evidence is merely mixed but not meaningfully opposed

### Example contradiction cases
- editorial praise vs repeated consumer irritation complaints
- high retailer rating vs recurring negative complaint cluster
- social excitement vs poor user-profile fit

---

## 6. Personalization sensitivity
Evaluate whether changing the user profile changes the recommendation in sensible ways.

### Success criteria
- identical product yields different verdicts for different profiles when appropriate
- user sensitivities influence ingredient caution output
- budget preferences influence value and alternatives
- preferred attributes influence fit reasoning

### Example profile pair
#### User A
- normal skin
- no fragrance sensitivity
- flexible budget

#### User B
- sensitive skin
- fragrance sensitivity
- wants lightweight finish

Expected result:
- same product may move from `buy` to `cautious_try` or `skip`

---

## 7. Seller ranking sanity
Evaluate whether seller outputs are ranked credibly.

### Ranking inputs to consider
- price
- size/value
- sample availability
- return policy visibility
- contact info visibility
- trust signals
- risk signals
- suspiciously low pricing penalty

### Success criteria
- not all cheapest sellers automatically rank first
- suspiciously low offers are penalized
- transparent sellers are rewarded
- rationale is clearly stated

### Example seller cases
- official retailer at moderate price
- unknown seller at unusually low price
- sample-size seller with good transparency but lower value
- marketplace seller with missing return/contact details

---

## 8. Recommendation scoring consistency
Evaluate whether the final verdict aligns with the underlying evidence.

### Success criteria
- high caution + weak sentiment should not result in strong `buy`
- positive fit + strong evidence + good seller coverage should support `buy`
- mixed evidence and user-specific caution should tend toward `cautious_try`
- score breakdown sums or maps consistently to verdict bands

### Suggested verdict mapping
- 80–100: `buy`
- 60–79: `cautious_try`
- below 60: `skip`

Adjust as needed, but keep it explicit.

---

## 9. Confidence honesty
Evaluate whether the app communicates uncertainty appropriately.

### Success criteria
- sparse evidence lowers confidence
- conflicting evidence lowers confidence
- mock/demo-only paths can still show medium/low confidence
- the system does not speak with high certainty when evidence is weak

### Anti-patterns
- strong recommendation with only one weak source
- high confidence despite major contradictions
- no uncertainty section when sources disagree

---

## 10. Evidence traceability
Evaluate whether major claims are backed by evidence.

### Success criteria
- recommendation summary has supporting evidence available
- ingredient flags point to ingredients and/or user preferences
- contradiction cards include support and counter-evidence
- sentiment themes include snippets or source references

### Failures
- unsupported summary statements
- no source refs for seller ranking rationale
- hidden reasoning with no evidence path

---

## 11. Demo reliability
Evaluate the end-to-end happy path.

### Success criteria
- app can run locally
- seeded demo case loads quickly
- report renders fully
- UI has stable fallback mode
- live-provider issues do not break demo mode
- the demo path is narratable in under 90 seconds

---

## Test fixture plan

Create fixtures for:
- official product page extraction
- retailer review extraction
- editorial commentary extraction
- seller listing extraction
- ingredient reference extraction
- contradiction examples
- profile-shift examples
- low-confidence sparse evidence example

Suggested fixture directory:
```text
fixtures/
  products/
  reviews/
  editorial/
  sellers/
  profiles/
  reports/
  contradictions/
```

---

## Current implemented eval surface

The repo currently ships with fixture-backed tests in:
- `tests/schema.spec.ts`
- `tests/ingredient-analysis.spec.ts`
- `tests/recommendation.spec.ts`
- `tests/evals.spec.ts`

These cover:
- request and response schema validation
- direct ingredient sensitivity matches
- contradiction surfacing on the seeded Glow Recipe path
- profile-shift recommendation changes
- suspicious seller penalties
- end-to-end demo-path report completeness

---

## Commands

Run the main test suite:
```bash
pnpm test
```

Run the lightweight eval pass:
```bash
pnpm eval
```

The current `eval` command is intentionally lightweight and fixture-backed so it stays fast and demo-friendly during a hackathon.
