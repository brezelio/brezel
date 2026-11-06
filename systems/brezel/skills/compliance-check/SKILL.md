---
name: compliance-check
description: Run a compliance check on a proposed action, product feature, or business initiative, surfacing applicable regulations, required approvals, and risk areas. Use when launching something that touches personal data, when marketing or product proposes something with regulatory implications, when reviewing a data processing agreement or handling a data subject request, or when the user needs to know which approvals apply before proceeding.
---
<!-- Based on anthropics/knowledge-work-plugins/legal/skills/compliance-check/SKILL.md (commit d900840716eb262e1feb17c6f4406c9ce0e06bcf), licensed under Apache-2.0. Copyright (c) Anthropic, PBC. Modified by Kiwis & Brownies for Brezel, 2026-11: removed the slash command, refocused on GDPR/DSGVO and German/DACH frameworks (US/other privacy laws condensed into a short table), corrected GDPR response deadlines to the one-month rule, mapped logging and follow-up to Brezel records, cases and agent memory. -->

# Compliance Check

Run a compliance check on a proposed action, product feature, marketing campaign, or business initiative.

**Important**: This skill assists with legal workflows but does not provide legal advice. Compliance assessments should be reviewed by qualified legal professionals (and, for data protection, the data protection officer if the company has one). Regulatory requirements change frequently; always verify current requirements with authoritative sources (use web search / reading web pages on official sources where available) and say when you could not verify something.

**Jurisdiction note:** You work for German/DACH companies. The default frame is EU law (GDPR/DSGVO and other EU regulations) plus German law. Depending on the initiative, frameworks that may be relevant include the BDSG (German supplement to the GDPR), the TDDDG (cookies and similar technologies), the UWG (advertising, incl. § 7 on unsolicited email/phone advertising), works council co-determination under the BetrVG for technology that can monitor employees, the EU AI Act for AI systems, and sector-specific rules. Name the frameworks that may apply and what to verify; do not invent detailed legal content. Apply non-EU laws only where the company actually operates in or targets those markets.

## What You Need

A description of what the user plans to do — the more specific, the better (who, what data, which countries, which channels). Examples:
- "We want to launch a referral program with cash rewards"
- "We're adding fingerprint login to our mobile app"
- "We want to process customer data with a US cloud provider"
- "Marketing wants to use customer testimonials in ads"

Check the records of this Brezel system and agent memory for context (e.g. existing records of processing activities, data processing agreements, policies, the DPO contact) and ask the user for missing facts.

## Output

```markdown
## Compliance Check: [Initiative]

### Summary
[Quick assessment: Proceed / Proceed with conditions / Requires further review]

### Applicable Regulations and Policies
| Regulation/Policy | Relevance | Key Requirements |
|-------------------|-----------|-----------------|
| [GDPR / BDSG / UWG / etc.] | [How it applies] | [What you need to do] |

### Requirements
| # | Requirement | Status | Action Needed |
|---|-------------|--------|---------------|
| 1 | [Requirement] | [Met / Not Met / Unknown] | [What to do] |

### Risk Areas
| Risk | Severity | Mitigation |
|------|----------|------------|
| [Risk] | [High/Med/Low] | [How to address] |

### Recommended Actions
1. [Most important action]
2. [Second priority]
3. [Third priority]

### Approvals Needed
| Approver | Why | Status |
|----------|-----|--------|
| [Person/Team, e.g. DPO, works council, management] | [Reason] | [Pending] |

### Further Review Recommended
[Areas where external counsel or specialist review is advised]
```

Offer to create cases and work items for the recommended actions and approvals — only when the user asks.

## Privacy Regulation Overview

### GDPR / DSGVO (General Data Protection Regulation)

**Scope**: Applies to processing of personal data of individuals in the EU/EEA, regardless of where the processing organization is located. In Germany supplemented by the BDSG.

**Key Obligations**:
- **Lawful basis**: Identify and document the lawful basis for each processing activity (consent, contract, legitimate interest, legal obligation, vital interest, public task)
- **Transparency**: Privacy notices (Art. 13/14) at or before collection
- **Data subject rights**: Respond to access, rectification, erasure, portability, restriction, and objection requests within one month (extendable by two further months for complex or numerous requests, with notice)
- **Data protection impact assessments (DPIAs)**: Required for processing likely to result in high risk to individuals
- **Breach notification**: Notify the supervisory authority within 72 hours of becoming aware of a personal data breach (unless unlikely to result in a risk); notify affected individuals without undue delay if high risk
- **Records of processing**: Maintain Article 30 records of processing activities
- **International transfers**: Ensure appropriate safeguards for transfers outside the EEA (adequacy decisions, SCCs, BCRs)
- **DPO requirement**: Appoint a Data Protection Officer where required (in Germany the BDSG adds headcount-based triggers — verify the current threshold)
- **Privacy by design and by default** (Art. 25)

**Common Touchpoints**:
- Reviewing vendor DPAs for GDPR compliance
- Advising on privacy by design requirements
- Responding to supervisory authority inquiries
- Managing cross-border data transfer mechanisms
- Reviewing consent mechanisms (incl. cookie banners) and privacy notices

### Other Privacy Laws (only if the company operates in or targets these markets)

| Regulation | Jurisdiction | Key Differentiators |
|---|---|---|
| **revDSG / nDSG** | Switzerland | Revised Swiss data protection act; similar principles to GDPR; FDPIC oversight |
| **DSG** | Austria | Austrian supplement to the GDPR |
| **UK GDPR** | United Kingdom | Post-Brexit UK version; ICO oversight; UK transfer addendum |
| **CCPA / CPRA** | California, USA | Rights to know, delete, correct, opt out of sale/sharing; service provider contract terms |
| **LGPD** | Brazil | Similar to GDPR; requires DPO appointment |
| **PIPL** | China | Strict cross-border transfer rules; data localization requirements |

## DPA Review Checklist

When reviewing a Data Processing Agreement or Data Processing Addendum, verify the following:

### Required Elements (GDPR Article 28)

- [ ] **Subject matter and duration**: Clearly defined scope and term of processing
- [ ] **Nature and purpose**: Specific description of what processing will occur and why
- [ ] **Type of personal data**: Categories of personal data being processed
- [ ] **Categories of data subjects**: Whose personal data is being processed
- [ ] **Controller obligations and rights**: Controller's instructions and oversight rights

### Processor Obligations

- [ ] **Process only on documented instructions**: Processor commits to process only per controller's instructions (with exception for legal requirements)
- [ ] **Confidentiality**: Personnel authorized to process have committed to confidentiality
- [ ] **Security measures**: Appropriate technical and organizational measures described (Article 32 reference)
- [ ] **Sub-processor requirements**:
  - [ ] Written authorization requirement (general or specific)
  - [ ] If general authorization: notification of changes with opportunity to object
  - [ ] Sub-processors bound by same obligations via written agreement
  - [ ] Processor remains liable for sub-processor performance
- [ ] **Data subject rights assistance**: Processor will assist controller in responding to data subject requests
- [ ] **Security and breach assistance**: Processor will assist with security obligations, breach notification, DPIAs, and prior consultation
- [ ] **Deletion or return**: On termination, delete or return all personal data (at controller's choice) and delete existing copies unless legal retention required
- [ ] **Audit rights**: Controller has right to conduct audits and inspections (or accept third-party audit reports)
- [ ] **Breach notification**: Processor will notify controller of personal data breaches without undue delay (ideally within 24-48 hours; must enable controller to meet 72-hour regulatory deadline)

### International Transfers

- [ ] **Transfer mechanism identified**: SCCs, adequacy decision, BCRs, or other valid mechanism
- [ ] **SCCs version**: Using current EU SCCs (June 2021 version) if applicable
- [ ] **Correct module**: Appropriate SCC module selected (C2P, C2C, P2P, P2C)
- [ ] **Transfer impact assessment**: Completed if transferring to countries without adequacy decisions
- [ ] **Supplementary measures**: Technical, organizational, or contractual measures to address gaps identified in transfer impact assessment
- [ ] **UK addendum**: If UK personal data is in scope, UK International Data Transfer Addendum included

### Practical Considerations

- [ ] **Liability**: DPA liability provisions align with (or don't conflict with) the main services agreement
- [ ] **Termination alignment**: DPA term aligns with the services agreement
- [ ] **Data locations**: Processing locations specified and acceptable
- [ ] **Security standards**: Specific security standards or certifications required (ISO 27001, BSI IT-Grundschutz, SOC 2, etc.)
- [ ] **Insurance**: Adequate insurance coverage for data processing activities

### Common DPA Issues

| Issue | Risk | Standard Position |
|---|---|---|
| Blanket sub-processor authorization without notification | Loss of control over processing chain | Require notification with right to object |
| Breach notification timeline > 72 hours | May prevent timely regulatory notification | Require notification within 24-48 hours |
| No audit rights (or audit rights only via third-party reports) | Cannot verify compliance | Accept recognized audit reports (e.g. ISO 27001, SOC 2 Type II) + right to audit upon cause |
| Data deletion timeline not specified | Data retained indefinitely | Require deletion within 30-90 days of termination |
| No data processing locations specified | Data could be processed anywhere | Require disclosure of processing locations |
| Outdated SCCs | Invalid transfer mechanism | Require current EU SCCs (2021 version) |

## Data Subject Request Handling

### Request Intake

When a data subject request is received:

1. **Identify the request type**:
   - Access (copy of personal data, Art. 15)
   - Rectification (correction of inaccurate data)
   - Erasure / deletion ("right to be forgotten")
   - Restriction of processing
   - Data portability (structured, machine-readable format)
   - Objection to processing (incl. objection to direct marketing, which must always be honored)
   - Withdrawal of consent

2. **Identify applicable regulation(s)**:
   - Where is the data subject located?
   - Which laws apply based on the organization's presence and activities?
   - What are the specific requirements and timelines?

3. **Verify identity**:
   - Confirm the requester is who they claim to be
   - Use reasonable verification measures proportionate to the sensitivity of the data
   - Do not require excessive documentation

4. **Log the request** (e.g. as a case in this Brezel system):
   - Date received
   - Request type
   - Requester identity
   - Applicable regulation
   - Response deadline
   - Assigned handler

### Response Timelines

| Regulation | Initial Acknowledgment | Substantive Response | Extension |
|---|---|---|---|
| GDPR / UK GDPR | Not specified (best practice: promptly) | One month | +2 months for complex or numerous requests (with notice within the first month) |
| CCPA/CPRA (if applicable) | 10 business days | 45 calendar days | +45 days (with notice) |

### Exemptions and Exceptions

Before fulfilling a request, check whether any exemptions apply:

**Common exemptions across regulations**:
- Legal claims defense or establishment
- Legal obligations requiring retention
- Public interest or official authority
- Freedom of expression and information (for erasure requests)
- Archiving in the public interest or scientific/historical research

**Organization-specific considerations**:
- Litigation hold: Data subject to a legal hold cannot be deleted
- Regulatory retention: Accounting and tax records (HGB, AO), employment records, and other categories may have mandatory retention periods — restrict processing instead of deleting
- Third-party rights: Fulfilling the request might adversely affect the rights of others

### Response Process

1. Gather all personal data of the requester across systems (including the records of this Brezel system — find them with the entity tools)
2. Apply any exemptions and document the basis
3. Prepare response: fulfill the request or explain why (in whole or part) it cannot be fulfilled
4. If denying (in whole or part): cite the specific legal basis for denial
5. Inform the requester of their right to lodge a complaint with the supervisory authority
6. Document the response and retain records of the request and response

## Regulatory Monitoring Basics

### What to Monitor

Maintain awareness of developments in:
- **Regulatory guidance**: New or updated guidance from supervisory authorities (EDPB, German federal and state data protection authorities, etc.)
- **Enforcement actions**: Fines, orders, and settlements that signal regulatory priorities
- **Legislative changes**: New privacy laws, amendments to existing laws, implementing regulations
- **Industry standards**: Updates to ISO 27001, BSI standards, and sector-specific requirements
- **Cross-border transfer developments**: Adequacy decisions, SCC updates, data localization requirements

### Monitoring Approach

1. **Follow regulatory authority communications** (official announcements, newsletters; use web search where available)
2. **Track relevant legal publications** for analysis of new developments
3. **Review industry association updates** for sector-specific guidance
4. **Maintain a regulatory calendar** of known upcoming deadlines, effective dates, and compliance milestones (e.g. as cases and work items with due dates)
5. **Brief the legal team** on material developments that affect the organization's processing activities

### Escalation Criteria

Escalate regulatory developments to senior counsel or leadership when:
- A new regulation or guidance directly affects the organization's core business activities
- An enforcement action in the organization's sector signals heightened regulatory scrutiny
- A compliance deadline is approaching that requires organizational changes
- A data transfer mechanism the organization relies on is challenged or invalidated
- A regulatory authority initiates an inquiry or investigation involving the organization

## Tips

1. **Be specific** — "We want to email all our users" is better than "marketing campaign."
2. **Include the geography** — Compliance requirements vary by jurisdiction.
3. **Mention the data** — What personal data is involved? This drives most compliance requirements.
