---
name: incident-response
description: Run an incident response workflow — triage, communicate, mitigate and write a blameless postmortem. Use when something important is down or broken ("we have an incident", "production is down"), when an alert needs a severity assessment, when a status update is due mid-incident, or when writing a postmortem after resolution.
---
<!-- Based on anthropics/knowledge-work-plugins/engineering/skills/incident-response/SKILL.md (commit d900840716eb262e1feb17c6f4406c9ce0e06bcf), licensed under Apache-2.0. Copyright (c) Anthropic, PBC. Modified by Kiwis & Brownies for Brezel, 2026-11: removed slash-command usage and connector placeholders, mapped incident tracking to Brezel cases and work items, added a GDPR note for personal data breaches. -->

# Incident Response

Manage an incident from detection through postmortem.

## Phases

If it is not clear which phase the incident is in, ask the user. The three typical entry points are:

- **New incident**: something just broke — start with triage.
- **Update**: the incident is ongoing — produce a status update.
- **Postmortem**: the incident is resolved — reconstruct and document it.

### Phase 1: Triage
- Assess severity (SEV1-4, see below)
- Identify affected systems, processes and users/customers
- Assign roles: incident commander (IC), communications, responders

### Phase 2: Communicate
- Draft an internal status update
- Draft customer communication (if needed)
- Agree on where the response is coordinated and on an update cadence

### Phase 3: Mitigate
- Document mitigation steps taken
- Track the timeline of events
- Confirm resolution

### Phase 4: Postmortem
- Blameless postmortem document
- Timeline reconstruction
- Root cause analysis (5 whys)
- Action items with owners

## Severity Classification

| Level | Criteria | Response Time |
|-------|----------|---------------|
| SEV1 | Service down, all users affected | Immediate, all-hands |
| SEV2 | Major feature degraded, many users affected | Within 15 min |
| SEV3 | Minor feature issue, some users affected | Within 1 hour |
| SEV4 | Cosmetic or low-impact issue | Next business day |

## Communication Guidance

Provide clear, factual updates at a regular cadence. Include: what's happening, who's affected, what we're doing, when the next update is.

If personal data may have been exposed, lost or accessed without authorization, flag this explicitly: under the GDPR (DSGVO) a personal data breach can require notifying the supervisory authority within 72 hours and possibly informing affected people. Involve the data protection officer or the responsible person early; do not make the legal assessment yourself.

## Output — Status Update

```markdown
## Incident Update: [Title]
**Severity:** SEV[1-4] | **Status:** Investigating | Identified | Monitoring | Resolved
**Impact:** [Who/what is affected]
**Last Updated:** [Timestamp]

### Current Status
[What we know now]

### Actions Taken
- [Action 1]
- [Action 2]

### Next Steps
- [What's happening next and ETA]

### Timeline
| Time | Event |
|------|-------|
| [HH:MM] | [Event] |
```

## Output — Postmortem

```markdown
## Postmortem: [Incident Title]
**Date:** [Date] | **Duration:** [X hours] | **Severity:** SEV[X]
**Authors:** [Names] | **Status:** Draft

### Summary
[2-3 sentence plain-language summary]

### Impact
- [Users affected]
- [Duration of impact]
- [Business impact if quantifiable]

### Timeline
| Time (state timezone) | Event |
|------------|-------|
| [HH:MM] | [Event] |

### Root Cause
[Detailed explanation of what caused the incident]

### 5 Whys
1. Why did [symptom]? → [Because...]
2. Why did [cause 1]? → [Because...]
3. Why did [cause 2]? → [Because...]
4. Why did [cause 3]? → [Because...]
5. Why did [cause 4]? → [Root cause]

### What Went Well
- [Things that worked]

### What Went Poorly
- [Things that didn't work]

### Action Items
| Action | Owner | Priority | Due Date |
|--------|-------|----------|----------|
| [Action] | [Person] | P0/P1/P2 | [Date] |

### Lessons Learned
[Key takeaways for the team]
```

## Working With Brezel

- **Tracking**: Track the incident as a case, and the mitigation steps and postmortem action items as work items attached to it. Look for related existing cases and work items first so you do not create duplicates.
- **Evidence**: Use the records in this Brezel system (find them with the entity tools) and files or attachments the user provides (logs, alert screenshots, exports from a monitoring or ticket system) to build the timeline. Do not guess metrics you cannot see — ask the user.
- **Communication**: Draft status updates and customer messages for the user to send; ask the user before anything is sent externally.
- **Durable learnings**: Store lasting facts (e.g. known failure modes, escalation contacts the user confirmed) in agent memory, not one-off incident details.

## Tips

1. **Start writing immediately** — Don't wait for complete information. Update as you learn more.
2. **Keep updates factual** — What we know, what we've done, what's next. No speculation.
3. **Postmortems are blameless** — Focus on systems and processes, not individuals.
