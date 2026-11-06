---
name: task-management
description: Track the user's tasks and commitments as Brezel cases and work items, and keep durable facts in agent memory. Use when the user asks what is on their plate, wants to add, update or complete tasks, asks what they are waiting on, or when follow-ups and commitments come up in a conversation or meeting summary.
---
<!-- Based on anthropics/knowledge-work-plugins/productivity/skills/task-management/SKILL.md (commit d900840716eb262e1feb17c6f4406c9ce0e06bcf), licensed under Apache-2.0. Copyright (c) Anthropic, PBC. Modified by Kiwis & Brownies for Brezel, 2026-11: replaced the TASKS.md file and HTML dashboard with Brezel cases and work items, added agent memory for durable facts; kept the interaction patterns and conventions. -->

# Task Management

Tasks are tracked in Brezel, not in a file. Both you and the user see and edit the same data.

## Where Things Live

- **Cases**: A case is a piece of work with a goal — a commitment, a project, a request from someone. Use one case per coherent topic, not per tiny step.
- **Work items**: Concrete action steps inside a case. A single standalone to-do can be one work item whose case is created automatically.
- **Agent memory**: Durable facts that are not tasks — preferences ("weekly report goes to Ms. Weber on Fridays"), recurring deadlines, who is responsible for what. Do not store to-dos in memory, and do not store durable facts as tasks.

Use the case and work item tools available to you (inspect cases, find related work, create cases and work items) and the memory tools (search, remember, update, forget). If a tool you need is not available, tell the user what you would record and where, instead of pretending it was saved.

## Conventions

Map the classic task-list sections onto cases and work items:

| Classic section | In Brezel |
|---|---|
| Active | Open cases/work items the user is working on |
| Waiting On | Open items blocked on someone else — state who and since when in the description |
| Someday | Low-priority items, clearly marked as such |
| Done | Completed items (kept in history; no manual cleanup needed) |

For every task capture:
- A short, scannable **title** (verb first: "Send offer to Müller GmbH")
- **For whom** when it is a commitment to someone
- **Due date** when there is a deadline
- **Since [date]** and **waiting for [person]** for waiting items
- **Priority** (high, medium, low)
- Extra context in the description, so another colleague or agent can pick it up later

## How to Interact

**"What's on my plate?" / "my tasks":**
- Look up the open cases and work items relevant to the user
- Summarize active and waiting items
- Highlight anything overdue, due soon, or urgent

**"Add a task" / "remind me to":**
- Check for an existing related case first to avoid duplicates
- Add a work item to that case, or create a new case if none fits
- Include who it's for, due date and priority if provided; ask only if the due date or owner is essential and missing

**"Done with X" / "finished X":**
- Find the matching item; if several match, ask which one
- Mark it complete with a short note of what was done

**"What am I waiting on?":**
- List the waiting items with who they are waiting for and how long they have been waiting
- Suggest a follow-up for items waiting unusually long

## Extracting Tasks

When summarizing meetings, emails or conversations, offer to record extracted tasks:
- Commitments the user made ("I'll send that over")
- Action items assigned to them
- Follow-ups mentioned

Ask before creating anything — don't auto-add without confirmation. Present the proposed items as a short list (title, for whom, due date) so the user can confirm, edit or drop them in one reply.

When the conversation reveals a durable fact (a standing arrangement, a preference, a responsible contact), offer to store it in agent memory.
