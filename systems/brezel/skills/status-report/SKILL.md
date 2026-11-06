---
name: status-report
description: Generate a status report with KPIs, risks, decisions and action items. Use when writing a weekly, monthly or quarterly update for leadership, summarizing project health with green/yellow/red status, surfacing risks and decisions that need stakeholder attention, or turning project activity into a readable narrative.
---
<!-- Based on anthropics/knowledge-work-plugins/operations/skills/status-report/SKILL.md (commit d900840716eb262e1feb17c6f4406c9ce0e06bcf), licensed under Apache-2.0. Copyright (c) Anthropic, PBC. Modified by Kiwis & Brownies for Brezel, 2026-11: removed slash-command usage, replaced connector placeholders with Brezel data sources. -->

# Status Report

Generate a polished status report for leadership or stakeholders. For risk matrix frameworks and severity definitions, see the **risk-assessment** skill.

## Inputs

- Period (weekly / monthly / quarterly) and the project or team; ask the user if unclear
- Cases and work items: completed items, open and overdue items, upcoming milestones
- Relevant records in this Brezel system (find them with the entity tools) for KPIs
- Notes, meeting minutes or files the user provides for decisions and blockers

## Output

```markdown
## Status Report: [Project/Team] — [Period]
**Author:** [Name] | **Date:** [Date]

### Executive Summary
[3-4 sentence overview — what's on track, what needs attention, key wins]

### Overall Status: 🟢 On Track / 🟡 At Risk / 🔴 Off Track

### Key Metrics
| Metric | Target | Actual | Trend | Status |
|--------|--------|--------|-------|--------|
| [KPI] | [Target] | [Actual] | [up/down/flat] | 🟢/🟡/🔴 |

### Accomplishments This Period
- [Win 1]
- [Win 2]

### In Progress
| Item | Owner | Status | ETA | Notes |
|------|-------|--------|-----|-------|
| [Item] | [Person] | [Status] | [Date] | [Context] |

### Risks and Issues
| Risk/Issue | Impact | Mitigation | Owner |
|------------|--------|------------|-------|
| [Risk] | [Impact] | [What we're doing] | [Who] |

### Decisions Needed
| Decision | Context | Deadline | Recommended Action |
|----------|---------|----------|--------------------|
| [Decision] | [Why it matters] | [When] | [What I recommend] |

### Next Period Priorities
1. [Priority 1]
2. [Priority 2]
3. [Priority 3]
```

## Tips

1. **Lead with the headline** — Busy leaders read the first 3 lines. Make them count.
2. **Be honest about risks** — Surfacing issues early builds trust. Surprises erode it.
3. **Make decisions easy** — For each decision needed, provide context and a recommendation.
4. **Flag at-risk items** — Point out overdue or blocked cases and work items explicitly.
