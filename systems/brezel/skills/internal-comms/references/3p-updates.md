<!-- Based on anthropics/skills/skills/internal-comms/examples/3p-updates.md (commit ca45fc496a3436251f191354091d557da31c15b5), licensed under Apache-2.0. Copyright (c) 2026 Anthropic, PBC. Modified by Kiwis & Brownies for Brezel, 2026-11: moved from examples/ to references/, replaced Slack/Google Drive/email/calendar sources with Brezel records, cases, agent memory and user-provided material. -->

## Instructions
You are being asked to write a 3P update. 3P stands for "Progress, Plans, Problems." The main audience is management, leadership, other teams, etc. They're meant to be very succinct and to the point: something you can read in 30-60 seconds or less. They're also for people with some, but not a lot of, context on what the team does.

3Ps can cover a team of any size, all the way up to the entire company. The bigger the team, the less granular the tasks should be. For example, a "customer service team" might have "cleared the ticket backlog" or "updated the returns process," whereas the company might have really meaty 3Ps, like "hired 5 new people" or "won 10 new customers."

They represent the work of the team across a time period, almost always one week. They include three sections:
1) Progress: what the team has accomplished over the time period. Focus mainly on things delivered, milestones achieved, work items completed, etc.
2) Plans: what the team plans to do over the next time period. Focus on what is top-of-mind and high priority for the team.
3) Problems: anything that is slowing the team down. This could be too few people, errors or blockers that prevent the team from moving forward, a deal that fell through, etc.

Before writing, make sure you know the team name. If it's not specified, ask explicitly which team you're writing for.

## Sources
Whenever possible, pull from available sources to get the information you need:
- Cases and work items: what was completed, what is open and due next, what is blocked
- The records in this Brezel system (find them with the entity tools): figures such as orders, revenue, tickets handled
- Agent memory: team name, earlier 3Ps, recurring priorities
- Files or attachments the user provides: notes, meeting minutes, reports

Try to gather as much context as you can, focusing on the time period you're writing for:
- Progress: anything between a week ago and today
- Plans: anything from today to the next week
- Problems: anything between a week ago and today

If something is missing, ask the user what they want to cover. They might also give you the content directly, in which case you're mostly formatting for this particular format.

## Workflow

1. **Clarify scope**: Confirm the team name and time period (usually past week for Progress/Problems, next week for Plans)
2. **Gather information**: Use the sources above or ask the user directly
3. **Draft the update**: Follow the strict formatting guidelines
4. **Review**: Ensure it's concise (30-60 seconds to read) and data-driven

## Formatting

The format is always the same, very strict. Never use any other formatting. Optionally start with one emoji that captures the vibe of the team and update (leave it out if the company's style is formal).

[optional emoji] [Team Name] (Dates Covered, usually a week)
Progress: [1-3 sentences of content]
Plans: [1-3 sentences of content]
Problems: [1-3 sentences of content]

Each section should be no more than 1-3 sentences: clear and to the point. It should be data-driven and include metrics where possible. The tone should be matter-of-fact, not prose-heavy.
