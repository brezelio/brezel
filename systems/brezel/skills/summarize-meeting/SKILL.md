---
name: summarize-meeting
description: Summarize a meeting transcript or notes into structured minutes with date, participants, topic, key decisions, summary points, action items and open questions. Use when processing meeting transcripts or recordings, writing meeting minutes, or recapping a discussion.
---
<!-- Based on phuryn/pm-skills/pm-execution/skills/summarize-meeting/SKILL.md (commit 2a12295a7717569baa7be181b4cfebe3ca38a6bb), licensed under MIT. Copyright (c) 2026 Pawel Huryn. Modified by Kiwis & Brownies for Brezel, 2026-11: removed argument placeholder and file-saving step, generalised beyond product teams, added Brezel records, cases and language guidance. -->

# Summarize Meeting

## Purpose

You create clear, actionable meeting summaries from the transcript, recording notes or minutes the user provides. Raw meeting content becomes a structured summary that keeps the team aligned and accountable.

## Context

Meeting summaries are how knowledge spreads and accountability stays clear. A well-structured summary captures decisions, key points and action items in language everyone can understand, regardless of who attended.

## Instructions

1. **Gather the Meeting Content**: Read the transcript, notes or files or attachments the user provides thoroughly. If the meeting concerns customers, projects or orders, look up the related records in this Brezel system (find them with the entity tools) for context. Use web search only for public background information.

2. **Think Step by Step**:
   - Who attended and what were their roles?
   - What was the main topic or agenda?
   - What decisions were made?
   - What are the next steps and who owns them?
   - Are there open questions or blockers?

3. **Extract Key Information**:
   - Identify main discussion topics
   - Note decisions made during the meeting
   - Flag any disagreements or concerns
   - Determine action items with owners and due dates

4. **Create Structured Summary**: Use this template:

   ```
   ## Meeting Summary

   **Date & Time**: [Date and start/end time]

   **Participants**: [Full names and roles, if available]

   **Topic**: [Short title—what was the meeting about?]

   **Summary**

   - **Point 1**: [Key discussion point or decision]
   - **Point 2**: [Key discussion point or decision]
   - **Point 3**: [Key discussion point or decision]
   - [Additional points as needed]

   **Action Items**

   | Due Date | Owner | Action |
   |----------|-------|--------|
   | [Date] | [Name] | [What needs to happen] |

   **Decisions Made**
   - [Decision 1]
   - [Decision 2]

   **Open Questions**
   - [Unresolved question 1]
   - [Unresolved question 2]
   ```

5. **Use Accessible Language**: Write so that anyone can follow. Use simple terms. Avoid jargon or explain it briefly. Write the summary in the language of the meeting unless the user asks otherwise.

6. **Prioritize Clarity**: Focus on:
   - What decisions affect plans, customers or priorities?
   - What does each person need to do?
   - By when do they need to do it?

7. **Follow Up**: Offer to create cases and work items for the action items and to save lasting decisions in agent memory. Do not do either without the user's confirmation.

## Notes

- Be objective — summarize what was discussed, not personal opinions
- Never invent owners or due dates; write "open" and list it under open questions
- Highlight action items clearly so nothing falls through the cracks
- If the meeting was large or complex, break points into sections by topic
- Use "we" language to keep the summary inclusive and collaborative
- Transcripts can contain personal data; include only what the summary needs
