---
name: performance-review
description: Structure a performance review with a self-assessment template, a manager review and calibration prep. Use when review season starts, when writing a manager review for a direct report, preparing rating distributions and promotion cases for calibration, or turning vague feedback into specific behavioral examples.
---
<!-- Based on anthropics/knowledge-work-plugins/human-resources/skills/performance-review/SKILL.md (commit d900840716eb262e1feb17c6f4406c9ce0e06bcf), licensed under Apache-2.0. Copyright (c) Anthropic, PBC. Modified by Kiwis & Brownies for Brezel, 2026-11: removed slash-command modes, replaced connector placeholders with Brezel data sources, adapted compensation wording and added a DACH note. -->

# Performance Review

Generate performance review templates and help structure feedback.

## Modes

- **Self-assessment**: template for the employee
- **Manager review**: review of a specific person
- **Calibration**: prep document for a calibration round

If the user does not say which type of review they need, ask the user.

## Output — Self-Assessment Template

```markdown
## Self-Assessment: [Review Period]

### Key Accomplishments
[List your top 3-5 accomplishments this period. For each, describe the situation, your contribution, and the impact.]

1. **[Accomplishment]**
   - Situation: [Context]
   - Contribution: [What you did]
   - Impact: [Measurable result]

### Goals Review
| Goal | Status | Evidence |
|------|--------|----------|
| [Goal from last period] | Met / Exceeded / Missed | [How you know] |

### Growth Areas
[Where did you grow? New skills, expanded scope, leadership moments.]

### Challenges
[What was hard? What would you do differently?]

### Goals for Next Period
1. [Goal — specific and measurable]
2. [Goal]
3. [Goal]

### Feedback for Manager
[How can your manager better support you?]
```

## Output — Manager Review

```markdown
## Performance Review: [Employee Name]
**Period:** [Date range] | **Manager:** [Your name]

### Overall Rating: [Exceeds / Meets / Below Expectations]

### Performance Summary
[2-3 sentence overall assessment]

### Key Strengths
- [Strength with specific example]
- [Strength with specific example]

### Areas for Development
- [Area with specific, actionable guidance]
- [Area with specific, actionable guidance]

### Goal Achievement
| Goal | Rating | Comments |
|------|--------|----------|
| [Goal] | [Rating] | [Specific observations] |

### Impact and Contributions
[Describe their biggest contributions and impact on the team/org]

### Development Plan
| Skill | Current | Target | Actions |
|-------|---------|--------|---------|
| [Skill] | [Level] | [Level] | [How to get there] |

### Compensation Recommendation
[Promotion / Salary adjustment / Bonus / No change — with justification]
```

## Output — Calibration

```markdown
## Calibration Prep: [Review Cycle]
**Manager:** [Your name] | **Team:** [Team] | **Period:** [Date range]

### Team Overview
| Employee | Role | Level | Tenure | Proposed Rating | Notes |
|----------|------|-------|--------|-----------------|-------|
| [Name] | [Role] | [Level] | [X years] | [Rating] | [Key context] |

### Rating Distribution
| Rating | Count | % of Team | Company Target |
|--------|-------|-----------|----------------|
| Exceeds Expectations | [X] | [X]% | ~15-20% |
| Meets Expectations | [X] | [X]% | ~60-70% |
| Below Expectations | [X] | [X]% | ~10-15% |

### Calibration Discussion Points
1. **[Employee]** — [Why this rating may need discussion, e.g., borderline, first review at level, recent role change]
2. **[Employee]** — [Discussion point]

### Promotion Candidates
| Employee | Current Level | Proposed Level | Justification |
|----------|-------------|----------------|---------------|
| [Name] | [Current] | [Proposed] | [Evidence of next-level performance] |

### Compensation Actions
| Employee | Action | Justification |
|----------|--------|---------------|
| [Name] | [Promotion / Market adjustment / Bonus / Retention] | [Why] |

### Manager Notes
[Context the calibration group should know — team changes, org shifts, project impacts]
```

## Using Brezel Data

- Pull employee details, role information, prior reviews and agreed goals from the records in this Brezel system (find them with the entity tools).
- Use completed cases and work items from the review period as concrete evidence of contributions.
- Use files the user provides (e.g. notes, feedback, earlier review documents) and ask the user for anything missing.

## Local Framework

The agent works for German/DACH companies. Performance data is personal data under DSGVO/GDPR; keep reviews need-to-know. Formal rating systems may require works council (Betriebsrat) co-determination, and pay topics follow collective agreements and the EU pay transparency rules where applicable. Flag these as points to check with HR; do not invent detailed legal content.

## Tips

1. **Be specific** — "Great job" isn't feedback. "You reduced order processing time by 40% by introducing the new checklist" is.
2. **Balance positive and constructive** — Both are essential. Neither should be a surprise.
3. **Focus on behaviors, not personality** — "Your documentation has been incomplete" vs. "You're careless."
4. **Make development actionable** — "Improve communication" is vague. "Present at the next team meeting" is actionable.
