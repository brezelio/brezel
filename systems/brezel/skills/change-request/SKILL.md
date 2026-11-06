---
name: change-request
description: Create a change request with impact analysis, risk assessment, communication plan and rollback plan. Use when proposing a system or process change that needs approval, preparing a change record for a change advisory board, documenting risk and rollback steps before a rollout, or planning stakeholder communication.
---
<!-- Based on anthropics/knowledge-work-plugins/operations/skills/change-request/SKILL.md (commit d900840716eb262e1feb17c6f4406c9ce0e06bcf), licensed under Apache-2.0. Copyright (c) Anthropic, PBC. Modified by Kiwis & Brownies for Brezel, 2026-11: removed slash-command usage, replaced connector placeholders with Brezel data sources. -->

# Change Request

Create a structured change request with impact analysis, risk assessment, and rollback plan.

## Inputs

- The change description from the user or files the user provides
- Affected records, users and processes in this Brezel system (find them with the entity tools) and related cases and work items
- Ask the user for approvers, timelines and anything missing

## Change Management Framework

Apply the assess-plan-execute-sustain framework when building the request:

### 1. Assess
- What is changing?
- Who is affected?
- How significant is the change? (Low / Medium / High)
- What resistance should we expect?

### 2. Plan
- Communication plan (who, what, when, how)
- Training plan (what skills are needed, how to deliver)
- Support plan (help desk, champions, FAQs)
- Timeline with milestones

### 3. Execute
- Announce and explain the "why"
- Train and support
- Monitor adoption
- Address resistance

### 4. Sustain
- Measure adoption and effectiveness
- Reinforce new behaviors
- Address lingering issues
- Document lessons learned

## Communication Principles

- Explain the **why** before the **what**
- Communicate early and often
- Use multiple channels
- Acknowledge what's being lost, not just what's being gained
- Provide a clear path for questions and concerns
- If employees are affected in Germany/DACH, check early whether the works council (Betriebsrat) must be involved

## Output

```markdown
## Change Request: [Title]
**Requester:** [Name] | **Date:** [Date] | **Priority:** [Critical/High/Medium/Low]
**Status:** Draft | Pending Approval | Approved | In Progress | Complete

### Description
[What is changing and why]

### Business Justification
[Why this change is needed — cost savings, compliance, efficiency, risk reduction]

### Impact Analysis
| Area | Impact | Details |
|------|--------|---------|
| Users | [High/Med/Low/None] | [Who is affected and how] |
| Systems | [High/Med/Low/None] | [What systems are affected] |
| Processes | [High/Med/Low/None] | [What workflows change] |
| Cost | [High/Med/Low/None] | [Budget impact] |

### Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| [Risk] | [H/M/L] | [H/M/L] | [How to mitigate] |

### Implementation Plan
| Step | Owner | Timeline | Dependencies |
|------|-------|----------|--------------|
| [Step] | [Person] | [Date] | [What it depends on] |

### Communication Plan
| Audience | Message | Channel | Timing |
|----------|---------|---------|--------|
| [Who] | [What to tell them] | [How] | [When] |

### Rollback Plan
[Step-by-step plan to reverse the change if needed]
- Trigger: [When to roll back]
- Steps: [How to roll back]
- Verification: [How to confirm rollback worked]

### Approvals Required
| Approver | Role | Status |
|----------|------|--------|
| [Name] | [Role] | Pending |
```

## Follow-up

- Offer to track the implementation steps as cases and work items.
- Draft stakeholder notifications for the communication plan; send nothing without the user's approval.

## Tips

1. **Be specific about impact** — "Everyone" is not an impact assessment. "20 users in accounting" is.
2. **Always have a rollback plan** — Even if you're confident, plan for failure.
3. **Communicate early** — Surprises create resistance. Previews create buy-in.
