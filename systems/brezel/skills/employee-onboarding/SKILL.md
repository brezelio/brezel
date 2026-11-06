---
name: employee-onboarding
description: Generate an onboarding checklist and first-week plan for a new hire. Use when someone has a start date coming up, when building the pre-start task list (accounts, equipment, buddy), scheduling Day 1 and Week 1, or setting 30/60/90-day goals for a new team member.
---
<!-- Based on anthropics/knowledge-work-plugins/human-resources/skills/onboarding/SKILL.md (commit d900840716eb262e1feb17c6f4406c9ce0e06bcf), licensed under Apache-2.0. Copyright (c) Anthropic, PBC. Modified by Kiwis & Brownies for Brezel, 2026-11: renamed to employee-onboarding, removed slash-command usage, replaced connector placeholders with Brezel data sources, added a DACH note. -->

# Employee Onboarding

Generate a comprehensive onboarding plan for a new team member.

## What I Need

- **New hire name**: Who's starting?
- **Role**: What position?
- **Team**: Which team are they joining?
- **Start date**: When do they start?
- **Manager**: Who's their manager?

Look these up in the records in this Brezel system first (find them with the entity tools, e.g. employee, team or role records); ask the user for anything still missing.

## Output

```markdown
## Onboarding Plan: [Name] — [Role]
**Start Date:** [Date] | **Team:** [Team] | **Manager:** [Manager]

### Pre-Start (Before Day 1)
- [ ] Send welcome email with start date, time, and logistics
- [ ] Set up accounts: email, chat, [tools for role]
- [ ] Order equipment (laptop, monitor, peripherals)
- [ ] Add to team calendar and recurring meetings
- [ ] Assign onboarding buddy: [Suggested person]
- [ ] Prepare desk / remote setup instructions

### Day 1
| Time | Activity | With |
|------|----------|------|
| 9:00 | Welcome and orientation | Manager |
| 10:00 | IT setup and tool walkthrough | IT / Buddy |
| 11:00 | Team introductions | Team |
| 12:00 | Welcome lunch | Manager + Team |
| 13:30 | Company overview and values | Manager |
| 15:00 | Role expectations and 30/60/90 plan | Manager |
| 16:00 | Free time to explore tools and docs | Self |

### Week 1
- [ ] Complete required compliance training
- [ ] Read key documentation: [list for role]
- [ ] 1:1 with each team member
- [ ] Shadow key meetings
- [ ] First small task or project assigned
- [ ] End-of-week check-in with manager

### 30-Day Goals
1. [Goal aligned to role]
2. [Goal aligned to role]
3. [Goal aligned to role]

### 60-Day Goals
1. [Goal]
2. [Goal]

### 90-Day Goals
1. [Goal]
2. [Goal]

### Key Contacts
| Person | Role | For What |
|--------|------|----------|
| [Manager] | Manager | Day-to-day guidance |
| [Buddy] | Onboarding Buddy | Questions, culture, navigation |
| [IT Contact] | IT | Tool access, equipment |
| [HR Contact] | HR | Benefits, policies |

### Tools Access Needed
| Tool | Access Level | Requested |
|------|-------------|-----------|
| [Tool] | [Level] | [ ] |
```

## Using Brezel Data

- Pull new hire details, team structure and role information from the records in this Brezel system (find them with the entity tools).
- Reuse existing onboarding checklists, policies or documentation from those records or from files the user provides, and customize them rather than starting from scratch.
- Turn the pre-start and Week 1 checklist items into cases and work items when the user wants them tracked.
- Remember durable facts (e.g. the company's standard onboarding steps) in agent memory.

## Local Framework

The agent works for German/DACH companies. Typical mandatory items differ from US practice, e.g. instruction on occupational safety (Arbeitsschutzunterweisung), data protection obligations (DSGVO/GDPR, confidentiality commitment) and, where applicable, works council (Betriebsrat) involvement. Mention them as checklist items to confirm with HR; do not invent detailed legal requirements.

## Tips

1. **Customize for the role** — An engineer's onboarding looks different from a designer's.
2. **Don't overload Day 1** — Focus on setup and relationships. Deep work starts Week 2.
3. **Assign a buddy** — Having a go-to person who isn't their manager makes a huge difference.
