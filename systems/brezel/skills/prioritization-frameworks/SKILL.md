---
name: prioritization-frameworks
description: Reference guide to nine prioritization frameworks with formulas, when-to-use guidance and templates (RICE, ICE, Kano, MoSCoW, Opportunity Score, Eisenhower, Weighted Decision Matrix and more). Use when choosing a prioritization method, comparing frameworks such as RICE vs ICE, or scoring a list of problems, ideas, requests or initiatives.
---
<!-- Based on phuryn/pm-skills/pm-execution/skills/prioritization-frameworks/SKILL.md (commit 2a12295a7717569baa7be181b4cfebe3ca38a6bb), licensed under MIT. Copyright (c) 2026 Pawel Huryn. Modified by Kiwis & Brownies for Brezel, 2026-11: generalised beyond product management, replaced external template links with inline templates, added how to source inputs from Brezel records and present results. -->

## Prioritization Frameworks Reference

A reference guide to help you select and apply the right prioritization framework for the situation, whether that is product ideas, customer requests, internal projects or a personal to-do list.

### Core Principle

Never let customers design the solution. Prioritize **problems (opportunities)**, not features.

### Opportunity Score (Dan Olsen, *The Lean Product Playbook*)

The recommended framework for prioritizing customer problems.

Survey customers on **Importance** and **Satisfaction** for each need (normalize to a 0–1 scale).

Three related formulas:
- **Current value** = Importance × Satisfaction
- **Opportunity Score** = Importance × (1 − Satisfaction)
- **Customer value created** = Importance × (S2 − S1), where S1 = satisfaction before, S2 = satisfaction after

High importance + low satisfaction = highest Opportunity Score = best opportunities. Plot on an Importance vs Satisfaction chart — the upper-left quadrant is the sweet spot. It prioritizes customer problems, not solutions.

### ICE Framework

Useful for prioritizing initiatives and ideas. Considers not only value but also risk and economic factors.

- **I** (Impact) = Opportunity Score × number of customers affected (or a 1–10 estimate when no survey data exists)
- **C** (Confidence) = How confident are we? (1–10). Accounts for risk.
- **E** (Ease) = How easy is it to implement? (1–10). Accounts for economic factors.

**Score** = I × C × E. Higher = prioritize first.

### RICE Framework

Splits ICE's Impact into two separate factors. Useful for larger teams that need more granularity.

- **R** (Reach) = Number of customers (or users, orders, cases) affected per period
- **I** (Impact) = Opportunity Score (value per customer), or a scale such as 3 = massive, 2 = high, 1 = medium, 0.5 = low, 0.25 = minimal
- **C** (Confidence) = How confident are we? (0–100%)
- **E** (Effort) = How much effort to implement? (person-months or person-days)

**Score** = (R × I × C) / E

### 9 Frameworks Overview

| Framework | Best For | Key Insight |
|-----------|----------|-------------|
| Eisenhower Matrix | Personal tasks | Urgent vs Important — for individual task management |
| Impact vs Effort | Tasks/initiatives | Simple 2×2 — quick triage, not rigorous for strategic decisions |
| Risk vs Reward | Initiatives | Like Impact vs Effort but accounts for uncertainty |
| **Opportunity Score** | Customer problems | **Recommended.** Importance × (1 − Satisfaction). Normalize to 0–1. |
| Kano Model | Understanding expectations | Must-be, Performance, Attractive, Indifferent, Reverse. For understanding, not prioritizing. |
| Weighted Decision Matrix | Multi-factor decisions | Assign weights to criteria, score each option. Useful for stakeholder buy-in. |
| **ICE** | Ideas/initiatives | Impact × Confidence × Ease. Recommended for quick prioritization. |
| **RICE** | Ideas at scale | (Reach × Impact × Confidence) / Effort. Adds Reach to ICE. |
| MoSCoW | Requirements | Must/Should/Could/Won't. Caution: project management origin; tends to inflate "Must". |

### How to Choose

- A handful of personal or team tasks → Eisenhower or Impact vs Effort.
- Customer needs or pain points with survey or feedback data → Opportunity Score.
- A backlog of ideas, quick decision → ICE. Larger backlog with measurable reach → RICE.
- A decision between a few options with several criteria and stakeholders to convince → Weighted Decision Matrix.
- Scoping a fixed-date release or project → MoSCoW.
- Understanding what customers take for granted vs what delights them → Kano.

### Gathering Inputs

- Pull the candidate items from the records in this Brezel system (find them with the entity tools), for example open cases and work items, customer requests, complaints or tickets, or from files or attachments the user provides.
- Use real numbers where they exist (number of affected customers, order volume, ticket counts, revenue). Mark every estimated value as an estimate.
- Ask the user for missing judgments (effort, strategic importance, weights) instead of inventing them.
- Record agreed weights or scoring conventions in agent memory if the user wants them reused next time.

### Templates

**ICE scoring table**

| Item | Impact (1–10) | Confidence (1–10) | Ease (1–10) | Score (I×C×E) | Notes |
|------|---------------|-------------------|-------------|---------------|-------|

**RICE scoring table**

| Item | Reach | Impact | Confidence (%) | Effort | Score ((R×I×C)/E) | Notes |
|------|-------|--------|----------------|--------|-------------------|-------|

**Opportunity Score table**

| Need / problem | Importance (0–1) | Satisfaction (0–1) | Opportunity = I × (1 − S) |
|----------------|------------------|--------------------|---------------------------|

**Weighted Decision Matrix**

| Criterion | Weight | Option A (score) | Option B (score) | Option C (score) |
|-----------|--------|------------------|------------------|------------------|
| **Weighted total** | 100% | | | |

### Presenting the Result

1. State which framework you used and why.
2. Show the scoring table sorted by score, highest first.
3. Call out the top 3 items and any surprising results (e.g. a high-effort item that still ranks first).
4. List assumptions and low-confidence scores that the user should validate.
5. Treat the output as decision support — the final prioritization is the user's call.

---

### Further Reading

- [The Product Management Frameworks Compendium + Templates](https://www.productcompass.pm/p/the-product-frameworks-compendium)
- [Kano Model: How to Delight Your Customers Without Becoming a Feature Factory](https://www.productcompass.pm/p/kano-model-how-to-delight-your-customers)
