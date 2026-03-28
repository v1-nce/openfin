# AGENTS.md

## Project purpose
SignalSkin is an autonomous cosmetic intelligence agent built for a TinyFish x OpenAI hackathon.

The product uses live web extraction across messy sources to generate a personalized, evidence-backed product recommendation for skincare and cosmetic purchases. The system should explain:
- whether a product is a good fit for a user
- why
- what ingredients may be risky
- what consumer and editorial sources are saying
- where to buy from the most trustworthy seller at the best value

## Product priorities
Prioritize work in this order:
1. Demo reliability
2. Explainability
3. Clear evidence and confidence
4. Modular architecture
5. Speed of iteration
6. Completeness of source coverage

This is a hackathon MVP. Prefer a polished, credible, narrow solution over a broad but fragile one.

## Technical stack
Preferred stack:
- Next.js
- TypeScript
- Tailwind CSS
- provider-based extraction architecture
- mock provider fallback when live integrations are unavailable

## Development commands
Use `pnpm` unless the repo already standardizes on something else.

- Install: `pnpm install`
- Dev: `pnpm dev`
- Build: `pnpm build`
- Lint: `pnpm lint`
- Test: `pnpm test`
- Evals: `pnpm eval`

If these scripts are missing, add them.

## Repository conventions
- Use TypeScript everywhere
- Prefer small focused modules over large files
- Keep source adapters isolated from scoring logic
- Keep provider interfaces swappable
- Put schemas and types in a central location
- Use deterministic heuristics where possible
- Keep UI components composable and readable
- Do not hardcode large source-specific assumptions into shared domain logic
- Avoid giant utility files
- Use explicit names over clever abstractions

## Suggested directory ownership
Use these conventions unless the repo already has a better established structure:

- `src/app/` or `app/`: frontend routes and pages
- `src/components/`: reusable UI components
- `src/domain/`: scoring, recommendation logic, contradiction detection, ingredient analysis
- `src/providers/`: live and mock extraction providers
- `src/orchestration/`: crawl planning and report assembly
- `src/schemas/`: zod or TS schemas and contracts
- `src/lib/`: shared helpers
- `fixtures/`: demo data and eval fixtures
- `docs/` or root markdown files: architecture, tasks, demo, eval docs

## Product rules
The system must:
- distinguish extracted facts from inferred recommendations
- show uncertainty when evidence is weak or conflicting
- include evidence snippets for important conclusions where possible
- use social or TikTok-style content as a secondary signal layer, not sole truth
- avoid unsupported claims
- remain usable even if live crawling partially fails

The system must not:
- make medical diagnoses
- imply clinical certainty
- guarantee seller authenticity
- fabricate sources or evidence
- overstate ingredient sensitivity predictions

## Source interpretation rules
Treat source classes differently:

- Official product pages:
  - strong for ingredients, size, price, product claims
  - weak for unbiased efficacy conclusions

- Retailer/review pages:
  - strong for repeated consumer themes
  - noisy and vulnerable to bias

- Editorial/blog pages:
  - useful for contextual summaries and comparisons
  - variable in trustworthiness

- Social/transcript sources:
  - useful for trend detection and repeated anecdotal claims
  - lower reliability, often incomplete

- Seller pages:
  - useful for pricing, size, shipping, and merchant signals
  - should not drive efficacy conclusions

## Coding rules
- Prefer explicit types
- Validate external inputs
- Parse defensively
- Fail gracefully
- Write readable code first
- Use comments sparingly and only where they add real clarity
- Keep scoring logic inspectable
- Prefer simple heuristics over opaque complexity for MVP

## When adding a new source adapter
For every new adapter:
1. Define or reuse the normalized output schema first
2. Return source metadata
3. Return extraction confidence
4. Return raw evidence snippets when possible
5. Add fixture-based tests
6. Update `sources.md` or `architecture.md` if source behavior changes materially

## When changing scoring or recommendation logic
Every meaningful change to scoring should:
- preserve explainability
- update the score breakdown
- avoid hidden coupling to UI
- include or update tests
- preserve distinction between evidence and inference

## Demo expectations
Always optimize for the live demo path.

Before calling a task complete, make sure:
- the happy path works
- there is at least one seeded demo case
- there is a fallback if live crawling fails
- the UI clearly shows recommendation, reasoning, and evidence
- the output is easy to narrate in under 90 seconds

## Definition of done
A task is only done if:
- code builds
- lint passes
- relevant tests pass
- docs are updated if behavior changed
- UI behavior is understandable
- important claims are backed by evidence or marked uncertain
- the system remains runnable in mock/demo mode

## If integration details are unknown
Do not block progress.
Instead:
- create an interface
- create a mock implementation
- document assumptions
- leave a clear TODO
- keep the app runnable