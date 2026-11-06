---
name: vendor-review
description: Evaluate a vendor with cost analysis (TCO), risk assessment and a recommendation. Use when reviewing a new vendor proposal, deciding whether to renew or replace a contract, comparing vendors side by side, or preparing a TCO breakdown and negotiation points before a purchasing decision.
---
<!-- Based on anthropics/knowledge-work-plugins/operations/skills/vendor-review/SKILL.md (commit d900840716eb262e1feb17c6f4406c9ce0e06bcf), licensed under Apache-2.0. Copyright (c) Anthropic, PBC. Modified by Kiwis & Brownies for Brezel, 2026-11: removed slash-command usage, replaced connector placeholders with Brezel data sources, switched currency to EUR, added a DACH compliance note. -->

# Vendor Review

Evaluate a vendor with structured analysis covering cost, risk, performance, and fit.

## What I Need

- **Vendor name**: Who is being evaluated?
- **Context**: New vendor evaluation, renewal decision, or comparison?
- **Details**: Contract terms, pricing, proposal document, or current performance data

Look for existing vendor, contract and purchase records in this Brezel system first (find them with the entity tools), including current spend, renewal dates and earlier evaluations. Extract pricing, terms and SLAs from proposal documents or files the user provides. Use web search / reading web pages for public information about the vendor. Ask the user for anything missing.

## Evaluation Framework

### Cost Analysis (Total Cost of Ownership)
- Total cost of ownership (not just license fees)
- Implementation and migration costs
- Training and onboarding costs
- Ongoing support and maintenance
- Exit costs (data migration, contract termination)

### Risk Assessment
- Vendor financial stability
- Security and compliance posture (for German/DACH companies e.g. DSGVO/GDPR, data processing agreement (AVV) and data location)
- Concentration risk (single vendor dependency)
- Contract lock-in and exit terms
- Business continuity and disaster recovery

### Performance Metrics
- SLA compliance
- Support response times
- Uptime and reliability
- Feature delivery cadence
- Customer satisfaction

### Comparison Matrix
When comparing vendors, produce a side-by-side matrix covering: pricing, features, integrations, security, support, contract terms, and references.

## Output

```markdown
## Vendor Review: [Vendor Name]
**Date:** [Date] | **Type:** [New / Renewal / Comparison]

### Summary
[2-3 sentence recommendation]

### Cost Analysis
| Component | Annual Cost | Notes |
|-----------|-------------|-------|
| License/subscription | [X] EUR | [Per seat, flat, usage-based] |
| Implementation | [X] EUR | [One-time] |
| Support/maintenance | [X] EUR | [Included or add-on] |
| **Total Year 1** | **[X] EUR** | |
| **Total 3-Year** | **[X] EUR** | |

### Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| [Risk] | High/Med/Low | High/Med/Low | [Mitigation] |

### Strengths
- [Strength 1]
- [Strength 2]

### Concerns
- [Concern 1]
- [Concern 2]

### Recommendation
[Proceed / Negotiate / Pass] — [Reasoning]

### Negotiation Points
- [Leverage point 1]
- [Leverage point 2]
```

## Tips

1. **Use the proposal** — Pricing, terms and SLAs can be extracted directly from vendor documents.
2. **Compare vendors** — A side-by-side analysis makes trade-offs visible.
3. **Include current spend** — For renewals, knowing what is paid now helps evaluate price changes.
