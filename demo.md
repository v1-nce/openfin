# demo.md

## Demo objective
Show that SignalSkin is not just a product recommender.

The demo should prove that it is an autonomous cosmetic intelligence agent that:
- gathers live or mock-live evidence from messy web sources
- personalizes recommendations to a user profile
- detects conflicts across sources
- explains ingredient-related cautions
- recommends alternatives
- ranks sellers based on trust and value
- shows evidence and uncertainty clearly

---

## Demo storyline
A user is trying to decide whether a skincare product is right for them.

Instead of manually checking:
- product pages
- reviews
- blogs/editorials
- ingredient sources
- seller listings
- social commentary

SignalSkin does the research in one workflow and explains the answer.

---

## Primary demo narrative
Use a scenario like this:

> “I have oily, acne-prone, somewhat sensitive skin. I’ve reacted badly to fragrance in the past. I want a lightweight moisturizer under makeup and don’t want to overspend. Should I buy this product, and if so, where should I buy it?”

The system should respond with:
- a verdict
- why
- ingredient cautions
- consumer/editorial consensus
- contradictions
- alternatives
- seller options

---

## Recommended demo structure

### Step 1 — Intro
Say:
> “Beauty product research is fragmented across brand sites, retailer reviews, editorial posts, ingredient sources, and social discovery. SignalSkin is an autonomous agent that crawls those messy sources and gives you a personalized, evidence-backed recommendation.”

### Step 2 — Enter product and profile
Use:
- one product name or product URL
- one realistic user profile

UI should show:
- product input
- skin type
- concerns
- sensitivities
- budget
- preferences

### Step 3 — Show crawl / progress state
The UI should visibly show the system working across source classes, such as:
- official product page
- retailer reviews
- editorial/blog commentary
- seller listings
- optional social/transcript signal

Narration:
> “We’re not searching a static database. We’re pulling structured signals from multiple live-web source classes.”

### Step 4 — Show recommendation summary
The first visible result should include:
- Buy / Cautious Try / Skip
- confidence level
- top 2–3 reasons
- one-line summary

Narration:
> “The model separates extracted evidence from inferred recommendation and also shows confidence.”

### Step 5 — Show ingredient caution layer
Show:
- flagged ingredients
- reason for flag
- connection to the user profile
- any overlap with disliked products if supported

Narration:
> “We’re not making a medical claim. We’re using explainable compatibility heuristics based on ingredients and past preferences.”

### Step 6 — Show sentiment synthesis
Show:
- recurring praise themes
- recurring complaint themes
- differences between source types

Possible themes:
- hydration
- texture
- irritation
- breakouts
- white cast
- finish
- pilling
- value

Narration:
> “Instead of dumping raw reviews, we synthesize what consumers and editorial sources are repeatedly saying.”

### Step 7 — Show contradiction detection
This is one of the most important moments.

Show an example such as:
- editorial sources love the finish
- retailer reviews repeatedly mention irritation
- social content is highly positive but the ingredient profile is risky for this user

Narration:
> “This is where the system becomes more useful than a normal recommender. It surfaces conflicting evidence instead of hiding it.”

### Step 8 — Show alternatives
Display 2–3 alternatives with reasons such as:
- lower irritation risk
- lower price
- similar finish
- better for oily skin
- fragrance-free option

Narration:
> “The alternatives are not generic. They are reason-based and tied to the user’s profile.”

### Step 9 — Show seller ranking
Display:
- merchant
- price
- size/value
- trust signals
- ranking rationale

Ideally show:
- one cheaper but suspicious option
- one slightly pricier but better-ranked seller
- one sample/trial option if available

Narration:
> “We don’t just recommend products. We help users buy them more confidently.”

### Step 10 — Close
Say:
> “SignalSkin turns the open web into a personalized purchase-intelligence layer for cosmetics. TinyFish gives our agents the ability to navigate and extract from messy web sources, and OpenAI helps us reason over that evidence and ship the product fast.”

---

## Demo script: short version
This is the 60–90 second version.

> Product research in beauty is fragmented. Users check brand pages, retailer reviews, editorial content, ingredient explainers, and seller sites, and still aren’t sure what is right for them. SignalSkin is an autonomous cosmetic intelligence agent that crawls those sources and generates a personalized, evidence-backed recommendation.  
>
> Here I enter a product and a user profile: oily, sensitive skin, fragrance sensitivity, lightweight finish, budget-conscious.  
>
> The agent gathers product facts, review themes, editorial commentary, ingredient signals, and seller offers.  
>
> Now we see the result: it recommends “Cautious Try” instead of “Buy” because while the product has strong sentiment for texture and hydration, it contains ingredients that overlap with the user’s known sensitivities, and retailer reviews show repeated irritation complaints.  
>
> It also proposes two alternatives with lower irritation risk and shows where to buy from the best-ranked seller, not just the cheapest seller.  
>
> The key is that it shows its work: evidence snippets, contradictions, and confidence. This turns the live web into a decision engine, not just a search result.

---

## Demo script: longer version
Use this if you have more time.

### Opening
> People discover skincare products across TikTok, blogs, retailer reviews, and product sites, but the research process is fragmented and noisy. SignalSkin is an agent that does that research for you.

### Product input
> We start with a product and a profile. The recommendation changes depending on who the user is, not just the product.

### Crawl and extraction
> Under the hood, the system is collecting structured evidence from multiple source classes. That includes official product metadata, consumer review patterns, editorial summaries, and seller listings.

### Personalized reasoning
> Then we run explainable heuristics over that evidence: ingredient cautions, profile fit, sentiment themes, contradictions, alternatives, and trust/value ranking.

### Output
> The result is not just “recommended” or “not recommended.” It’s a report that explains the tradeoffs, including where sources disagree.

### Seller intelligence
> We also rank where to buy from based on trust and value, which is especially useful in categories with inconsistent pricing and questionable sellers.

### Closing
> So SignalSkin is really a live-web purchase-intelligence agent for beauty, not just a recommender.

---

## Recommended demo cases

### Demo case A — conflicting evidence
Use a product where:
- editorial coverage is positive
- retailer feedback includes repeated irritation complaints
- final verdict becomes “Cautious Try”

This is the best case to show contradiction handling.

### Demo case B — profile-driven verdict shift
Use the same product with two different users:
- User 1: no fragrance sensitivity, normal skin
- User 2: sensitive skin, fragrance sensitivity

Show that verdict changes materially.

This is the best case to prove personalization.

### Demo case C — seller ranking
Use a product with:
- one low-cost but suspicious seller
- one trusted seller at a moderate premium
- one sample-size option if available

This is the best case to prove purchase utility.

---

## Seeded demo data requirements
Prepare seeded data for at least:
- 2 products
- 2 user profiles
- 3 seller variations
- 1 contradiction example
- 2 alternatives per product

Seeded data should include:
- product metadata
- ingredient list
- sentiment themes
- contradiction findings
- seller offers
- evidence snippets
- final report output

---

## Fallback plan
If live crawling fails during the demo:

### Fallback narrative
Say:
> “The system is designed with a live provider and a demo-safe fallback provider so that the intelligence pipeline remains testable and reliable even when live extraction is unstable.”

### Fallback behavior
- switch to demo mode
- use seeded fixtures
- keep the same UI and reasoning flow
- keep visible evidence and confidence

Do not let the demo depend entirely on live extraction.

---

## UI expectations during demo
The UI should make these things immediately visible:
- final verdict
- confidence
- top reasons
- ingredient cautions
- source disagreement
- alternatives
- seller rankings

Evidence should be accessible but not overwhelming.

---

## Judge-friendly talking points
Emphasize:
- live-web source synthesis
- handling messy and fragmented data
- personalization
- contradiction awareness
- explainability
- trust-aware purchase guidance
- modular architecture with provider abstraction
- demo reliability through fallback mode

---

## What not to say
Avoid saying:
- “This diagnoses skincare issues”
- “This guarantees authenticity”
- “This proves an ingredient is unsafe”
- “This replaces expert medical advice”

Prefer:
- “compatibility heuristic”
- “caution flag”
- “confidence-weighted recommendation”
- “trust/value ranking”
- “evidence-backed synthesis”

---

## Final one-line close
> SignalSkin turns fragmented beauty research across the live web into a personalized, explainable purchase decision.

---

## Implemented seeded scenarios

The current MVP ships with these demo-safe seeded cases:

### `glow-recipe-sensitive-skin`
- Product: Glow Recipe Watermelon Glow Pink Juice Moisturizer
- User: oily, sensitive, fragrance-sensitive, budget-conscious
- Best demo moments:
  - editorial praise vs consumer irritation complaints
  - ingredient caution driven by fragrance sensitivity
  - suspiciously cheap seller ranked below more trustworthy options

### `boj-sunscreen-budget`
- Product: Beauty of Joseon Relief Sun: Rice + Probiotics SPF50+
- User: combination skin, comfort-focused, price-aware
- Best demo moments:
  - strong overall buy verdict
  - seller tradeoff between official source, better-value retailer, and suspicious bargain listing
  - alternatives that preserve lightweight daily-SPF use

---

## Exact UI demo flow in the current app

1. Open the homepage.
2. Click `Run One-Click Demo` on one of the seeded scenarios.
3. Let the progress panel walk through validation, planning, extraction, normalization, reasoning, ranking, and report assembly.
4. Narrate the report in this order:
   - verdict + confidence
   - top reasons and cautions
   - ingredient flags
   - sentiment synthesis
   - contradictions
   - alternatives
   - seller ranking
   - evidence drawer

---

## Best current judge path

Use `glow-recipe-sensitive-skin` first because it shows the sharpest product intelligence story:
- promising product upside
- explicit personalized caution
- conflicting source evidence
- trust-aware purchase routing

Follow with `boj-sunscreen-budget` if there is time to show that SignalSkin can also produce a strong Buy verdict and still avoid blindly picking the cheapest seller.
