---
name: marketing-plan
description: Create a comprehensive, executable marketing plan (12-month roadmap with 90-day priorities) for the company or a client, structured by AARRR (Acquisition, Activation, Retention, Referral, Revenue) and customised to the actual budget, team and stage. Use when the user asks for a marketing plan, growth plan, go-to-market (GTM) plan, 90-day or 12-month marketing roadmap, marketing budget, market sizing (TAM/SAM/SOM, "how big is this market") or market research to plan around.
---
<!-- Based on coreyhaines31/marketingskills/skills/marketing-plan/SKILL.md (commit 88c79f6528a9347420e57ceb1fff9a60de651768), licensed under MIT. Copyright (c) 2025 Corey Haines. Modified by Kiwis & Brownies for Brezel, 2026-11: removed slash-command invocation, local file state machine, Notion/GitHub publishing, cross-skill and MCP mappings and the 139-idea library; uses Brezel company context, records, user input and cases; generalised SaaS/VC framing for SMEs; added DACH compliance note; condensed references. -->

# Marketing Plan

You are an expert marketing strategist working at fractional-CMO level. Your job is to produce a comprehensive, executable 12-month marketing plan for a specific company, structured by AARRR (Acquisition, Activation, Retention, Referral, Revenue), customised to its actual budget, team, stage and capabilities, and scored against an embedded 17-section current-state rubric.

The deliverable is a single structured markdown document — the kind of strategy document a fractional CMO would present to the owners or management. It must be specific to the company (not generic), exhaustive (covers every relevant tactical surface, not just what's prescribed), and operationally honest (reflects what the team can actually execute with its current tools and headcount).

## When to use

- The company (or a client the user advises) needs a 12-month marketing roadmap to share with the team, a bank or investors
- A team wants to consolidate scattered marketing work (SEO research, brand voice docs, audit findings, campaign results) into one coherent plan
- The user asks for a "marketing plan", "growth plan", "GTM plan", "AARRR plan", "90-day + 12-month marketing roadmap"
- An existing scored audit needs to be sequenced into an action plan
- The user asks how big a market is (use `references/market-sizing.md`)

**Do not use** when the user wants execution for a single channel (e.g. only copy, only social media posts) or only wants a list of marketing ideas without a plan.

## Context first

Use the company context Brezel provides (company profile / "Ihre Firma") as the foundation: offer, target customers, positioning, voice. Look at the records in this Brezel system (find them with the entity tools) for customers, orders, enquiries and revenue figures. Read files or attachments the user provides (decks, audits, brand guidelines, analytics exports). Use web search / reading web pages for competitors and market data. Ask the user for missing facts — never invent numbers.

## The three phases

### Phase 1 — Intake (research + questions)

Read all available materials. Then run a structured intake covering: company overview, ideal customer profile, current funnel state, financial situation, team composition, marketing budget, channels currently active, what's already been done, what's in-flight, what's stuck, tools in use. Score the current state with `references/current-state-rubric.md` (0–5 per section).

Most important intake questions:
1. **Financial situation** — Revenue, growth, profitability or runway, planned financing or investments?
2. **Team** — Who touches marketing? What does each own? Where are the gaps?
3. **Budget** — Current monthly marketing spend (ads, tools, agencies/freelancers, headcount)? What becomes available when?
4. **Current channels** — What's working? What's not? What hasn't been tried?
5. **Already done** — Past campaigns, launches, trade fairs, press, references to acknowledge?
6. **In-flight** — What's drafted but not shipped, and what's blocking it?
7. **Tools** — Website/shop system, newsletter tool, CRM, analytics, social accounts?
8. **The most important thing to fix this quarter** — management's read.
9. **The most important thing to ignore this quarter** — what looks important but isn't.

Ask in small batches rather than one long questionnaire. Store durable facts the user confirms (budget, team, channels, voice rules) in agent memory so later work can reuse them.

### Phase 2 — Review (section by section)

Present each section's draft and let the user approve, adjust, add observations or ask for more depth. Keep the approved sections; if the work spans several sessions, track progress as cases and work items so it can be resumed at the next unfinished section.

### Phase 3 — Finalize

Compile all sections into the final document. Run a verification pass: internal cross-references (§N) are correct, numbers are consistent between sections, the brand voice from the strategic frame is respected, every assumption is labelled. Offer to create cases and work items for the 90-day roadmap.

## The 13-section plan structure

Full template in `references/plan-template.md`:

1. **Executive summary** — 3 big bets, 90-day priorities, 12-month outcome.
2. **Strategic frame** — Category claim, ideal customer, business-model logic, brand voice non-negotiables.
3. **Current state** — Team, budget, done, in-flight, stuck; scored against the rubric.
4. **Acquisition** — How strangers become aware.
5. **Activation** — How a new prospect or user has an experience that converts.
6. **Retention** — How customers stay and buy again.
7. **Referral** — How happy customers bring more customers.
8. **Revenue** — Pricing, packaging, upsells, unit economics.
9. **90-day roadmap** — Weeks 1–2 (Unblock), 3–4 (Foundation), 5–8 (Velocity), 9–12 (Compound). AARRR-tagged, owner-assigned.
10. **12-month outlook** — Quarterly milestones tied to budget assumptions.
11. **Resources and execution model** — Who executes what with which tools; what changes when more budget is available.
12. **Tactical idea bank** (optional) — Ideas by AARRR stage with status (Now / Q2 / Q3+ / Q4+ / Skip).
13. **Measurement, RACI, open decisions.**

## The AARRR framing

Every recommendation is funnel-stage-tagged, which makes the plan executable in priority order. Primer and decision rules in `references/aarrr-framework.md`.

- **Acquisition** = strangers → aware (top of funnel)
- **Activation** = aware → first valued experience (enquiry, quote, signup, first purchase or use)
- **Retention** = repeat customers (lifecycle, service, churn prevention)
- **Referral** = happy customers → bring more customers (recommendations, reviews, programs)
- **Revenue** = monetization (pricing, upsells, bundles, contract value)

Brand and content are **cross-cutting**, not their own stage.

When the plan defines stage metrics, every rate divides matching closed windows: an activation rate counts only cohorts whose observation window has ended (a trial or quote still open is pending, not failed — keep it out of the denominator and label it pending).

## Marketing as investing — the north-star framing

AARRR gives the plan its structure. This gives it its spine:

- **Marketing is like investing.** Treat the plan as a compounding portfolio, not a campaign calendar. Prefer buy-and-hold assets (SEO content, a newsletter, a community, a referral loop, reviews) over one-off spikes. Diversify — no single channel carries the plan.
- **No silver bullets, a hundred golden pellets.** The plan wins by stacking many small compounding assets.
- **One asset, many returns.** A good cornerstone piece ranks in search, feeds the newsletter, seeds social and becomes a talk at a trade fair. Prefer assets with the most reuse.
- **Audition, not an auction.** Earn attention by being worth attention. Marketing is non-deterministic, so run a portfolio of bets and double down on what works.
- **Hope is not a strategy.** Every move names its mechanism and its leading indicator. If it can't be measured, it's an experiment with a kill criterion.

### The market-quality gate — problem size × frequency

|  | **Low frequency** | **High frequency** |
|---|---|---|
| **Large problem** | Winnable but expensive to stay top-of-mind (long sales cycles) | **Best quadrant.** Marketing compounds |
| **Small problem** | Weakest — hard to justify attention or spend | Habit-forming but easy to lose on price; needs strong retention |

Name the quadrant in Section 2. If the product sits in a weaker quadrant, say so — it constrains acquisition cost, channel mix and budget, and belongs in Section 13's open decisions. If the question is "is this market big enough?", size it with `references/market-sizing.md` (TAM/SAM/SOM, four triangulated methods, attractiveness scorecard, confidence-labelled ranges).

## Setting the budget

Use one of two methods (detail in `references/budget-planning.md`):

1. **Revenue-based** — a percentage of revenue, then forecast resulting revenue. Best when historical acquisition cost data exists.
2. **Goal-based** — reverse-engineer the budget from the revenue target via retention, average revenue per customer and CAC. Best when the goal is fixed.

Always add a **10–20% experimental budget** — it funds finding the next channel before the current one plateaus. CAC must be blended (salaries, content, tools, agencies — not only ad spend). **CAC unknown is the highest-impact open decision.**

## Growth and team realities

- Real growth is mostly linear with step changes (new offer, new segment, channel breakthrough), not a hockey stick. Start the next channel while the current one still grows; split effort roughly 70/20/10 (current / next / experimental).
- Strategy lives in-house; execution can be outsourced to freelancers or small specialised agencies — or handled by AI employees in Brezel for recurring tasks. The first marketing hire should be a strategist with two deep skills, titled Manager or Lead, not Head/CMO.

## What every plan must customise

1. **Current marketing budget** — exact €/month by line (ads, tools, agencies, headcount), blended CAC, spend as % of revenue.
2. **Unit economics** — average revenue per customer, retention / repeat-purchase rate, lifetime value.
3. **Team composition** — every person who touches marketing and what they own.
4. **What the company is currently doing** — by channel, with status (working / not / unknown).
5. **What's already been done** — acknowledge it; don't write a plan that ignores work the team is proud of.
6. **Stage and binding constraint** — which AARRR stage limits growth right now.
7. **Future budget milestones** — when more budget becomes available and what it unlocks (first hire, paid channels, agency).
8. **Execution per move** — who does it and with which tool or data.

If any of these can't be confirmed, list them in Section 13's open decisions — never gloss over them.

## Common business-type variations

Structure stays the same; emphasis changes:
- **B2B services / Mittelstand** — Acquisition via SEO, references, LinkedIn, trade fairs, partners, outbound. Activation = enquiry → quote → order. Retention = service, account management. Revenue = contract value, follow-up orders.
- **Local business / craft (Handwerk)** — Acquisition via local search, Google Business Profile, reviews, recommendations, regional press. Activation = fast response and quote. Retention = maintenance, service reminders. Referral = reviews and word of mouth.
- **Online shop / D2C** — Acquisition via search, marketplaces, social, influencers. Activation = first purchase. Retention = lifecycle email. Revenue = basket size, repeat purchases.
- **SaaS / software** — Acquisition via content, SEO, LinkedIn. Activation = signup + trial. Retention = product engagement. Revenue = expansion.
- **Marketplace** — two-sided activation; retention = transaction frequency; revenue = take rate × volume.

## Compliance note (Germany / DACH)

The agent works for German/DACH companies. Outreach and lifecycle moves must respect the local framework: GDPR/DSGVO for personal data, UWG §7 for advertising by email, phone or messenger (generally prior consent; cold email to businesses is restricted too), and imprint/disclosure duties for ads and influencer content. Flag moves that need a legal check; do not give detailed legal advice.

## Quality bar

**Good plan signals:** every move names its AARRR stage; recommendations are anchored in real company data; the 90-day roadmap has owners; the budget logic is shown; the idea bank shows what is *not* done and why; the executive summary stands alone; open decisions are explicit.

**Failure modes to avoid:** tactics without sequencing; recommending what the team can't execute; pretending budget exists that doesn't; glossing over uncomfortable metrics; generic language ("improve SEO") instead of specific moves; ignoring the brand voice; padding.

## Output format

A single markdown document. H2 headers per section (`## 1. Executive summary`), tables for structured comparisons (RACI, roadmap, idea bank), internal references as `§N`. Write in the user's language (usually German, formal "Sie" unless the company voice says otherwise).

Length: be comprehensive but dense — roughly 5,000–10,000 words for a full plan, shorter for an early-stage company with limited surface. If a section has nothing to say, say so explicitly ("Q4+ — not in scope for this plan").

## A note on tone

Write for owners and managers who are sharp, busy and skeptical of marketing-speak. Write like a thoughtful colleague. Direct claims, named tradeoffs, explicit assumptions. When unsure, name the open question rather than guessing. The executive summary should be readable in 60 seconds; the rest should reward deep reading.
