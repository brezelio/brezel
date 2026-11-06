---
name: risk-assessment
description: Identify, assess and mitigate operational risks and maintain a risk register. Use when the user asks what the risks are or what could go wrong, wants a risk assessment or risk register, or is evaluating the risks of a project, vendor, process or decision.
---
<!-- Based on anthropics/knowledge-work-plugins/operations/skills/risk-assessment/SKILL.md (commit d900840716eb262e1feb17c6f4406c9ce0e06bcf), licensed under Apache-2.0. Copyright (c) Anthropic, PBC. Modified by Kiwis & Brownies for Brezel, 2026-11: added Brezel data sources and a DACH compliance note. -->

# Risk Assessment

Systematically identify, assess, and plan mitigations for operational risks.

## Inputs

- The project, vendor, process or decision to assess, from the user or from files the user provides
- Relevant records in this Brezel system (find them with the entity tools) and open cases and work items
- Ask the user for context you cannot find

## Risk Assessment Matrix

| | Low Impact | Medium Impact | High Impact |
|---|-----------|---------------|-------------|
| **High Likelihood** | Medium | High | Critical |
| **Medium Likelihood** | Low | Medium | High |
| **Low Likelihood** | Low | Low | Medium |

## Risk Categories

- **Operational**: Process failures, staffing gaps, system outages
- **Financial**: Budget overruns, vendor cost increases, revenue impact
- **Compliance**: Regulatory violations, audit findings, policy breaches (for German/DACH companies e.g. DSGVO/GDPR, GoBD, industry-specific rules; apply the local framework, do not invent legal details)
- **Strategic**: Market changes, competitive threats, technology shifts
- **Reputational**: Customer impact, public perception, partner relationships
- **Security**: Data breaches, access control failures, third-party vulnerabilities

## Risk Register Format

For each risk, document:
- **Description**: What could happen
- **Likelihood**: High / Medium / Low
- **Impact**: High / Medium / Low
- **Risk Level**: Critical / High / Medium / Low
- **Mitigation**: What we're doing to reduce likelihood or impact
- **Owner**: Who is responsible for managing this risk
- **Status**: Open / Mitigated / Accepted / Closed

## Output

Produce a prioritized risk register with specific, actionable mitigations. Focus on risks that are controllable and material. Offer to turn mitigations into cases and work items with owners.
