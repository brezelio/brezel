---
name: internal-comms
description: Guidelines for writing internal communications in the formats the company likes to use. Use whenever asked to write internal communications such as status reports, leadership updates, 3P updates (Progress, Plans, Problems), company newsletters, FAQs, incident reports or project updates.
---
<!-- Based on anthropics/skills/skills/internal-comms/SKILL.md (commit ca45fc496a3436251f191354091d557da31c15b5), licensed under Apache-2.0. Copyright (c) 2026 Anthropic, PBC. Modified by Kiwis & Brownies for Brezel, 2026-11: moved examples/ to references/, replaced Slack/Google Drive/email/calendar sources with Brezel records, cases, agent memory and user-provided material, scaled newsletter guidance to SME size. -->

## When to use this skill
To write internal communications, use this skill for:
- 3P updates (Progress, Plans, Problems)
- Company newsletters
- FAQ responses
- Status reports
- Leadership updates
- Project updates
- Incident reports

## How to use this skill

To write any internal communication:

1. **Identify the communication type** from the request
2. **Load the appropriate guideline file** from the `references/` directory:
    - `references/3p-updates.md` - For Progress/Plans/Problems team updates
    - `references/company-newsletter.md` - For company-wide newsletters
    - `references/faq-answers.md` - For answering frequently asked questions
    - `references/general-comms.md` - For anything else that doesn't explicitly match one of the above
3. **Follow the specific instructions** in that file for formatting, tone, and content gathering

If the communication type doesn't match any existing guideline, ask for clarification or more context about the desired format.

## Sources of information

Wherever the guideline files mention gathering context, use what is available in Brezel:
- The records in this Brezel system (find them with the entity tools), for example orders, customers, projects, figures
- Cases and work items (Brezel's task tracking) for what was done, what is planned and what is blocked
- Agent memory for durable facts such as team names, recurring formats and preferences
- Files or attachments the user provides (notes, announcements, meeting minutes)
- Ask the user for anything that is missing; never invent figures, names or events

Write in the language the user writes in (usually German). For German texts, address readers formally ("Sie") unless the user asks for the informal form.

## Keywords
3P updates, company newsletter, company comms, weekly update, faqs, common questions, updates, internal comms
