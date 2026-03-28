
---

## `tasks.md`

```md
# tasks.md

## Project goal
Build a hackathon MVP of SignalSkin: an autonomous cosmetic intelligence agent that uses live web extraction plus explainable reasoning to generate a personalized, evidence-backed product recommendation.

---

## MVP scope
Primary scope:
- one product analyzed at a time
- one main category first: moisturizers or sunscreens
- product input by name or URL
- profile-aware recommendation
- evidence-backed report
- seller ranking
- polished demo flow

Out of scope for MVP:
- full user accounts
- universal social ingestion
- medical-grade sensitivity prediction
- large-scale continuous monitoring
- comprehensive multi-category coverage

---

## Milestone 1 — foundation
- [ ] Initialize repo and package manager
- [ ] Set up Next.js + TypeScript + Tailwind
- [ ] Add core scripts: dev/build/lint/test/eval
- [ ] Add root docs:
  - [ ] `README.md`
  - [ ] `AGENTS.md`
  - [ ] `architecture.md`
  - [ ] `tasks.md`
  - [ ] `demo.md`
- [ ] Add `.env.example`
- [ ] Establish directory structure
- [ ] Add initial linting and formatting rules

### Deliverable
Runnable app shell with documented setup.

---

## Milestone 2 — schemas and contracts
- [ ] Define `UserProfile` schema
- [ ] Define `ProductQuery` schema
- [ ] Define `AnalyzeRequest` schema
- [ ] Define normalized extraction schemas
- [ ] Define domain/report schemas
- [ ] Define verdict and confidence enums
- [ ] Add schema validation helpers
- [ ] Add tests for schema validation

### Deliverable
Single source of truth for all major data shapes.

---

## Milestone 3 — provider architecture
- [ ] Define provider interface
- [ ] Implement `MockProvider`
- [ ] Create `TinyFishProvider` interface/stub
- [ ] Define provider result shape with confidence and evidence
- [ ] Implement mock fixture loading
- [ ] Add provider-level tests

### Deliverable
Swappable extraction layer with a working mock path.

---

## Milestone 4 — source planning and orchestration
- [ ] Build source planner
- [ ] Create orchestration pipeline for analyze requests
- [ ] Add stage-based progress reporting
- [ ] Support live mode vs demo/mock mode
- [ ] Add orchestration tests

### Deliverable
Backend flow that can execute an end-to-end analysis using mock data and provider abstractions.

---

## Milestone 5 — product intelligence report
- [ ] Normalize product metadata
- [ ] Normalize ingredients
- [ ] Normalize source evidence
- [ ] Build report assembler
- [ ] Render initial report response shape

### Deliverable
Structured report with product basics and evidence sections.

---

## Milestone 6 — ingredient and fit logic
- [ ] Implement ingredient normalization helpers
- [ ] Implement sensitivity matching
- [ ] Implement disliked-product overlap heuristics
- [ ] Implement plain-language caution generation
- [ ] Implement personal fit reasoning
- [ ] Add tests for ingredient flags and fit heuristics

### Deliverable
Personalized caution and fit section.

---

## Milestone 7 — sentiment synthesis
- [ ] Build sentiment theme taxonomy
- [ ] Aggregate review/editorial/social signals
- [ ] Cluster recurring praise and complaints
- [ ] Generate concise theme summaries
- [ ] Add tests for sentiment clustering behavior

### Deliverable
Consumer/editorial sentiment section with themes.

---

## Milestone 8 — contradiction detection
- [ ] Define contradiction rules
- [ ] Detect source disagreement patterns
- [ ] Render contradiction findings in the report
- [ ] Add tests for contradiction cases

### Deliverable
Visible source disagreement layer.

---

## Milestone 9 — alternatives engine
- [ ] Define alternative recommendation schema
- [ ] Implement heuristics for:
  - [ ] lower irritation risk
  - [ ] lower price
  - [ ] similar function
  - [ ] similar finish
  - [ ] better fit for profile
- [ ] Support mock alternatives in demo mode
- [ ] Add tests

### Deliverable
Useful alternatives section with reasons.

---

## Milestone 10 — seller ranking
- [ ] Define seller offer schema
- [ ] Parse price/size/value fields
- [ ] Implement trust heuristics
- [ ] Implement suspicious-price penalty
- [ ] Rank sellers by trust/value
- [ ] Add support for sample/trial options if available
- [ ] Add tests

### Deliverable
Buying options ranked with explanations.

---

## Milestone 11 — final scoring and verdict
- [ ] Define score breakdown model
- [ ] Implement:
  - [ ] personal fit score
  - [ ] ingredient caution score
  - [ ] sentiment score
  - [ ] evidence confidence score
  - [ ] seller trust/value score
- [ ] Map scores to:
  - [ ] Buy
  - [ ] Cautious Try
  - [ ] Skip
- [ ] Add score explanation UI
- [ ] Add tests for verdict consistency

### Deliverable
Final recommendation with inspectable score breakdown.

---

## Milestone 12 — frontend UX
- [ ] Build product/profile input form
- [ ] Build crawl/progress UI
- [ ] Build report summary card
- [ ] Build score breakdown component
- [ ] Build ingredient caution component
- [ ] Build sentiment theme cards
- [ ] Build contradiction card
- [ ] Build alternatives section
- [ ] Build seller ranking section
- [ ] Build evidence drawer/panel
- [ ] Improve loading and empty states
- [ ] Ensure polished demo path

### Deliverable
Judge-ready UI.

---

## Milestone 13 — demo mode
- [ ] Add seeded example products
- [ ] Add seeded example user profiles
- [ ] Add demo-mode analysis flow
- [ ] Add one-click demo input
- [ ] Add fallback fixtures if live crawling fails
- [ ] Add “why this is low confidence” language where needed

### Deliverable
Reliable demo path independent of live web flakiness.

---

## Milestone 14 — evals and tests
- [ ] Add fixtures for extraction tests
- [ ] Add fixtures for sentiment cases
- [ ] Add fixtures for contradiction cases
- [ ] Add fixtures for seller ranking cases
- [ ] Add eval command
- [ ] Add short eval report format
- [ ] Add regression tests for demo-critical paths

### Deliverable
Repo feels engineered, not just hacked together.

---

## Milestone 15 — docs and polish
- [ ] Finalize `README.md`
- [ ] Add setup/run instructions
- [ ] Add architecture notes
- [ ] Add known limitations
- [ ] Add future work section
- [ ] Add screenshots or demo GIF if time permits

### Deliverable
Polished repository.

---

## Demo-critical checklist
These matter most for judging:
- [ ] One demo case with conflicting source evidence
- [ ] One demo case where user sensitivity changes the verdict
- [ ] One demo case with cheaper but less trustworthy seller vs better-ranked seller
- [ ] Evidence snippets visible for key conclusions
- [ ] Confidence labels visible
- [ ] Mock/demo fallback works even if live browsing fails

---

## Stretch goals
Only do these after demo-critical items are done:
- [ ] Compare two products
- [ ] Save user profile
- [ ] Product watchlist
- [ ] Sample-only search mode
- [ ] Routine compatibility warnings
- [ ] Social trend velocity indicator
- [ ] “Best alternative under budget”

---

## Current assumptions
- TinyFish may need to be abstracted behind an interface first
- We may not have full direct API coverage during the hackathon
- Social or TikTok ingestion may need to be mocked or limited
- Demo reliability matters more than perfect live coverage
- Explainability matters more than sophisticated ML

---

## Known risks
- Live crawling instability
- Over-scoping source coverage
- Too much time spent on ingestion instead of demo flow
- Weak explanation layer
- UI polish lagging behind backend work
- Score logic becoming too opaque

---

## Recommended build order
1. foundation
2. schemas
3. mock provider
4. orchestration
5. report assembly
6. ingredient + fit logic
7. sentiment
8. contradictions
9. seller ranking
10. final UI
11. demo mode
12. evals and polish