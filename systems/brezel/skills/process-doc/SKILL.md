---
name: process-doc
description: Document a business process as an SOP with process flow, RACI matrix and exceptions. Use when formalizing a process that lives in someone's head, building a RACI to clarify who owns what, writing an SOP for a handoff or audit, or capturing the exceptions and edge cases of how work actually gets done.
---
<!-- Based on anthropics/knowledge-work-plugins/operations/skills/process-doc/SKILL.md (commit d900840716eb262e1feb17c6f4406c9ce0e06bcf), licensed under Apache-2.0. Copyright (c) Anthropic, PBC. Modified by Kiwis & Brownies for Brezel, 2026-11: removed slash-command usage, replaced connector placeholders with Brezel data sources. -->

# Process Documentation

Document a business process as a complete standard operating procedure (SOP).

## How It Works

The user describes the process, provides existing documents as files, or just names it; then ask the user the right questions and produce a complete SOP. Check the records in this Brezel system (find them with the entity tools) for existing process documentation to update rather than duplicate, and for the roles and people involved.

## Output

```markdown
## Process Document: [Process Name]
**Owner:** [Person/Team] | **Last Updated:** [Date] | **Review Cadence:** [Quarterly/Annually]

### Purpose
[Why this process exists and what it accomplishes]

### Scope
[What's included and excluded]

### RACI Matrix
| Step | Responsible | Accountable | Consulted | Informed |
|------|------------|-------------|-----------|----------|
| [Step] | [Who does it] | [Who owns it] | [Who to ask] | [Who to tell] |

### Process Flow
[ASCII flowchart or step-by-step description]

### Detailed Steps

#### Step 1: [Name]
- **Who**: [Role]
- **When**: [Trigger or timing]
- **How**: [Detailed instructions]
- **Output**: [What this step produces]

#### Step 2: [Name]
[Same format]

### Exceptions and Edge Cases
| Scenario | What to Do |
|----------|-----------|
| [Exception] | [How to handle it] |

### Metrics
| Metric | Target | How to Measure |
|--------|--------|----------------|
| [Metric] | [Target] | [Method] |

### Related Documents
- [Link to related process or policy]
```

## Follow-up

- Offer to create cases and work items for process improvement action items.
- Remember durable facts about the process (owner, review cadence) in agent memory.

## Tips

1. **Start messy** — A perfect description is not needed. Describe how it works today and structure it afterwards.
2. **Include the exceptions** — "Usually we do X, but sometimes Y" is the most valuable part to document.
3. **Name the people** — Even if roles change, knowing who does what today helps get the process right.
