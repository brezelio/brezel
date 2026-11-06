---
name: interview-prep
description: Create structured interview plans with competency-based questions, scorecards and a debrief template. Use when the user asks for an interview plan, interview questions or a scorecard for a role, or is preparing to interview candidates.
---
<!-- Based on anthropics/knowledge-work-plugins/human-resources/skills/interview-prep/SKILL.md (commit d900840716eb262e1feb17c6f4406c9ce0e06bcf), licensed under Apache-2.0. Copyright (c) Anthropic, PBC. Modified by Kiwis & Brownies for Brezel, 2026-11: adapted to Brezel data sources and added a note on German/DACH employment law. -->

# Interview Prep

Create structured interview plans to evaluate candidates consistently and fairly.

## Inputs

- The role, its job posting or description (from the records in this Brezel system, found with the entity tools, or from files the user provides)
- Seniority, team and who is available to interview
- Anything missing: ask the user

## Interview Design Principles

1. **Structured**: Same questions for all candidates in the role
2. **Competency-based**: Map questions to specific skills and behaviors
3. **Evidence-based**: Use behavioral and situational questions
4. **Diverse panel**: Multiple perspectives reduce bias
5. **Scored**: Use rubrics, not gut feelings

## Interview Plan Components

### Role Competencies
Define 4-6 key competencies for the role (e.g., technical skills, communication, leadership, problem-solving).

### Question Bank
For each competency, provide:
- 2-3 behavioral questions ("Tell me about a time...")
- 1-2 situational questions ("How would you handle...")
- Follow-up probes

### Scorecard
Rate each competency on a consistent scale (1-4) with clear descriptions of what each level looks like.

### Debrief Template
Structured format for interviewers to share findings and make a decision.

## Local Framework

The agent works for German/DACH companies. Keep questions job-related and apply local rules instead of US practice: avoid questions that touch characteristics protected by the AGG (e.g. age, origin, religion, family planning, pregnancy, disability unless job-relevant), and handle candidate data according to DSGVO/GDPR (purpose limitation, retention). Do not give detailed legal advice; recommend checking with HR or legal counsel when in doubt.

## Output

Produce a complete interview kit: panel assignment (who interviews for what), question bank by competency, scoring rubric, and debrief template.
