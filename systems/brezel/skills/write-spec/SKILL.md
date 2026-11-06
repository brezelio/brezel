---
name: write-spec
description: Write a feature specification or PRD from a problem statement or idea. Use when turning a vague idea or user request into a structured document, scoping a feature or process change with goals and non-goals, defining success metrics and acceptance criteria, or breaking a big request into a phased spec.
---
<!-- Based on anthropics/knowledge-work-plugins/product-management/skills/write-spec/SKILL.md (commit d900840716eb262e1feb17c6f4406c9ce0e06bcf), licensed under Apache-2.0. Copyright (c) Anthropic, PBC. Modified by Kiwis & Brownies for Brezel, 2026-11: removed slash commands, replaced project tracker/knowledge base/design connectors with Brezel cases, work items, records, files and agent memory; follow-up breakdown into work items. -->

# Write Spec

Write a feature specification or product requirements document (PRD).

## Workflow

### 1. Understand the Feature

Ask the user what they want to spec. Accept any of:
- A feature name ("Customer portal login")
- A problem statement ("Key accounts keep asking for central access management")
- A user request ("Users want to export their data as CSV")
- A vague idea ("We should do something about onboarding drop-off")

### 2. Gather Context

Ask the user for the following. Be conversational — do not dump all questions at once. Ask the most important ones first and fill in gaps as you go:

- **User problem**: What problem does this solve? Who experiences it?
- **Target users**: Which user group(s) does this serve?
- **Success metrics**: How will we know this worked?
- **Constraints**: Technical constraints, timeline, regulatory requirements (e.g. GDPR/DSGVO), dependencies
- **Prior art**: Has this been attempted before? Are there existing solutions?

### 3. Pull Context From Brezel

- Search existing cases and work items for related requests, requirements or dependencies.
- Look at the records in this Brezel system (find them with the entity tools) that give evidence for the problem, e.g. support requests, customer feedback, error reports.
- Use files or attachments the user provides: research documents, prior specs, mockups, meeting notes.
- Check agent memory for durable facts about the product, users and constraints.

If little context is available, work from what the user provides. Do not block on missing sources.

### 4. Generate the PRD

Produce a structured PRD with these sections (see **PRD Structure** below):

- **Problem Statement**: The user problem, who is affected, and impact of not solving it (2-3 sentences)
- **Goals**: 3-5 specific, measurable outcomes tied to user or business metrics
- **Non-Goals**: 3-5 things explicitly out of scope, with brief rationale for each
- **User Stories**: "As a [user type], I want [capability] so that [benefit]", grouped by persona
- **Requirements**: Must-Have (P0), Nice-to-Have (P1), Future Considerations (P2), each with acceptance criteria
- **Success Metrics**: Leading and lagging indicators with specific targets
- **Open Questions**: Unresolved questions tagged with who needs to answer (engineering, design, legal, data)
- **Timeline Considerations**: Hard deadlines, dependencies, and phasing

### 5. Review and Iterate

After generating the PRD:
- Ask the user if any sections need adjustment
- Offer to expand on specific sections
- Offer follow-ups: a design brief, a stakeholder pitch, or a breakdown into a case with work items (one per requirement or story). Ask before creating cases or work items.

## PRD Structure

### Problem Statement
- Describe the user problem in 2-3 sentences
- Who experiences this problem and how often
- The cost of not solving it (user pain, business impact, competitive risk)
- Ground it in evidence: research, support data, metrics, or customer feedback

### Goals
- 3-5 specific, measurable outcomes
- Each answers: "How will we know this succeeded?"
- Distinguish user goals (what users get) from business goals (what the company gets)
- Outcomes, not outputs ("reduce time to first value by 50%", not "build onboarding wizard")

### Non-Goals
- 3-5 things this feature explicitly will NOT do
- Adjacent capabilities out of scope for this version, each with a short reason (not enough impact, too complex, separate initiative, premature)
- Non-goals prevent scope creep and set expectations

### User Stories
"As a [user type], I want [capability] so that [benefit]"

- The user type is specific ("office manager", not just "user")
- The capability describes what they want to accomplish, not how
- The benefit explains the value
- Include edge cases: error states, empty states, boundary conditions
- Order by priority

Example:
- "As an administrator, I want to configure single sign-on for our company so that colleagues can log in with their existing company account"
- "As an employee, I want to be redirected to our company login automatically so that I do not need a separate password"
- "As an administrator, I want to see who has logged in via single sign-on so that I can verify the rollout is working"

### Requirements

**Must-Have (P0)**: The feature cannot ship without these. Ask: "If we cut this, does the feature still solve the core problem?" If no, it is P0.

**Nice-to-Have (P1)**: Significantly improves the experience but the core use case works without them. Often fast follow-ups.

**Future Considerations (P2)**: Out of scope for v1, but the design should not block them later.

For each requirement:
- A clear, unambiguous description of the expected behaviour
- Acceptance criteria (see below)
- Technical considerations or constraints
- Dependencies on other teams or systems

### Open Questions
- Tag each with who should answer (engineering, design, legal, data, stakeholder)
- Distinguish blocking questions (must answer before starting) from non-blocking ones

### Timeline Considerations
- Hard deadlines (contractual commitments, events, compliance dates)
- Dependencies on other teams' work
- Suggested phasing if the feature is too large for one release

## User Story Writing

Good user stories are INVEST:
- **Independent**: Can be delivered on their own
- **Negotiable**: Details can be discussed, not a contract
- **Valuable**: Deliver value to the user
- **Estimable**: The team can roughly estimate the effort
- **Small**: Fit in one iteration
- **Testable**: There is a clear way to verify them

Common mistakes:
- Too vague: "I want the product to be faster" — what specifically?
- Solution-prescriptive: "I want a dropdown menu" — describe the need, not the widget
- No benefit: "I want to click a button" — why?
- Too large: "I want to manage my team" — split into specific capabilities
- Internal focus: "As the development team, we want to refactor the database" — that is a task, not a user story

## Requirements Categorization

### MoSCoW
- **Must have**: Not viable without these.
- **Should have**: Important but not critical for launch.
- **Could have**: Desirable if time permits.
- **Won't have (this time)**: Explicitly out of scope.

Tips:
- Be ruthless about P0s. The tighter the must-have list, the faster you ship and learn.
- If everything is P0, nothing is P0.
- P1s should be things you are confident you will build soon, not a wish list.
- P2s are architectural insurance.

## Success Metrics

### Leading Indicators (days to weeks)
- **Adoption rate**: % of eligible users who try the feature
- **Activation rate**: % who complete the core action
- **Task completion rate**: % who accomplish their goal
- **Time to complete**: How long the core workflow takes
- **Error rate**: How often users hit errors or dead ends
- **Usage frequency**: How often users return to it

### Lagging Indicators (weeks to months)
- **Retention impact**
- **Revenue impact**
- **Satisfaction change** (NPS, CSAT)
- **Support request reduction**
- **Win rate in sales**

### Setting Targets
- Specific: "50% adoption within 30 days", not "high adoption"
- Based on comparable features, benchmarks, or explicit hypotheses
- A "success" threshold and a "stretch" target
- The measurement method and time window
- When you will evaluate: 1 week, 1 month, 1 quarter after launch

## Acceptance Criteria

**Given/When/Then**:
- Given [precondition or context]
- When [action the user takes]
- Then [expected outcome]

**Checklist format**:
- [ ] Administrator can enter the login provider URL in the settings
- [ ] Employees see a "Log in with company account" button on the login page
- [ ] Failed login attempts show a clear error message

Tips:
- Cover the happy path, error cases, and edge cases
- Describe behaviour, not implementation
- Include what should NOT happen
- Each criterion is independently testable
- Avoid ambiguous words ("fast", "user-friendly", "intuitive") — define them concretely

## Scope Management

Scope creep happens when requirements keep getting added after approval, "small" additions accumulate, features nobody asked for appear ("while we're at it..."), or the launch date moves without explicit re-scoping.

Prevent it:
- Write explicit non-goals in every spec
- Any scope addition comes with a scope removal or a timeline extension
- Separate v1 from v2 clearly
- Check every requirement against the original problem statement
- Time-box investigations
- Keep a "parking lot" for good ideas that are not in scope

## Output Format

Use markdown with clear headers. Keep the document scannable — busy stakeholders should get the gist from headers and bold text.

## Tips

- Be opinionated about scope. A tight, well-defined spec beats an expansive vague one.
- If the idea is too big for one spec, suggest phases and spec the first phase.
- Success metrics must be specific and measurable.
- Non-goals are as important as goals.
- Open questions should be genuinely open — do not include questions you can answer from context.
