---
name: runbook
description: Create or update an operational runbook for a recurring task or procedure. Use when documenting a task that operations needs to run repeatably, turning tribal knowledge into exact step-by-step instructions, adding troubleshooting and rollback steps to an existing procedure, or defining escalation paths for when things go wrong.
---
<!-- Based on anthropics/knowledge-work-plugins/operations/skills/runbook/SKILL.md (commit d900840716eb262e1feb17c6f4406c9ce0e06bcf), licensed under Apache-2.0. Copyright (c) Anthropic, PBC. Modified by Kiwis & Brownies for Brezel, 2026-11: removed slash-command usage, replaced connector placeholders with Brezel data sources, generalized the tip example. -->

# Runbook

Create a step-by-step operational runbook for a recurring task or procedure.

## Inputs

- The task or procedure from the user, existing instructions or files the user provides
- Existing runbooks or procedure documents in the records of this Brezel system (find them with the entity tools) to update rather than create from scratch
- Related cases and work items (past incidents, change requests) for troubleshooting entries
- Ask the user for exact steps, access requirements and escalation contacts

## Output

~~~markdown
## Runbook: [Task Name]
**Owner:** [Team/Person] | **Frequency:** [Daily/Weekly/Monthly/As Needed]
**Last Updated:** [Date] | **Last Run:** [Date]

### Purpose
[What this runbook accomplishes and when to use it]

### Prerequisites
- [ ] [Access or permission needed]
- [ ] [Tool or system required]
- [ ] [Data or input needed]

### Procedure

#### Step 1: [Name]
```
[Exact command, action, or instruction]
```
**Expected result:** [What should happen]
**If it fails:** [What to do]

#### Step 2: [Name]
```
[Exact command, action, or instruction]
```
**Expected result:** [What should happen]
**If it fails:** [What to do]

### Verification
- [ ] [How to confirm the task completed successfully]
- [ ] [What to check]

### Troubleshooting
| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| [What you see] | [Why] | [What to do] |

### Rollback
[How to undo this if something goes wrong]

### Escalation
| Situation | Contact | Method |
|-----------|---------|--------|
| [When to escalate] | [Who] | [How to reach them] |

### History
| Date | Run By | Notes |
|------|--------|-------|
| [Date] | [Person] | [Any issues or observations] |
~~~

## Tips

1. **Be painfully specific** — "Export the list" is not a step. "Open the module Orders, filter status = open, export as CSV to the shared folder Finance/Exports" is.
2. **Include failure modes** — What can go wrong at each step and what to do about it.
3. **Test the runbook** — Have someone unfamiliar with the process follow it. Fix where they get stuck.
