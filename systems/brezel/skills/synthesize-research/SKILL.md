---
name: synthesize-research
description: Synthesize user and customer research from interviews, surveys and feedback into structured, prioritized insights. Use when there is a pile of interview notes, survey responses, support requests or customer feedback to make sense of, when themes need to be extracted and ranked by frequency and impact, or when raw feedback should become concrete recommendations.
---
<!-- Based on anthropics/knowledge-work-plugins/product-management/skills/synthesize-research/SKILL.md (commit d900840716eb262e1feb17c6f4406c9ce0e06bcf), licensed under Apache-2.0. Copyright (c) Anthropic, PBC. Modified by Kiwis & Brownies for Brezel, 2026-11: removed slash commands, replaced knowledge base/feedback/analytics/transcription connectors with Brezel records, user-provided files and exports; trimmed some repetition. -->

# Synthesize Research

Synthesize user research from multiple sources into structured insights and recommendations.

## Workflow

### 1. Gather Research Inputs

Accept research from any combination of:
- **Pasted text**: Interview notes, transcripts, survey responses, feedback
- **Files or attachments**: Research documents, spreadsheets, call summaries
- **Records in this Brezel system** (find them with the entity tools): support requests, customer feedback, complaints, call notes, sales notes
- **Exports** the user can provide from other systems: survey tools, web analytics, meeting transcriptions

Ask the user:
- What type of research? (interviews, surveys, usability tests, analytics, support requests, sales call notes)
- How many sources / participants?
- Is there a specific question or hypothesis being investigated?
- Which decisions will this research inform?

Treat personal data in research material carefully: attribute quotes to participant type, not name, and do not copy more personal details into the synthesis than needed (GDPR/DSGVO).

### 2. Process the Research

For each source, extract:
- **Key observations**: What did users say, do, or experience?
- **Quotes**: Verbatim quotes that illustrate important points
- **Behaviours**: What users actually did (vs. what they say they do)
- **Pain points**: Frustrations, workarounds, unmet needs
- **Positive signals**: What works well
- **Context**: User segment, use case, experience level

### 3. Identify Themes and Patterns

Apply thematic analysis (see **Methodology** below). Group observations into themes, count frequency across participants, and assess impact. Note contradictions and surprises.

Priority matrix:
- **High frequency + High impact**: Top priority findings
- **Low frequency + High impact**: Important for specific segments
- **High frequency + Low impact**: Quality-of-life improvements
- **Low frequency + Low impact**: Note but deprioritize

### 4. Generate the Synthesis

#### Research Overview
- Methodology: research types, number of participants/sources
- Research question(s)
- Timeframe

#### Key Findings
For each major finding (aim for 5-8):
- **Finding statement**: One clear sentence describing the insight
- **Evidence**: Supporting quotes, data points, or observations (with source attribution)
- **Frequency**: How many participants/sources support it
- **Impact**: How significantly it affects the user experience or business
- **Confidence level**: High (strong evidence), Medium (suggestive), Low (early signal)

Order findings by priority (frequency × impact).

#### User Segments / Personas
If distinct segments emerge: name and description, key behaviours, unique needs and pain points, size estimate if data is available.

#### Opportunity Areas
Unmet or underserved needs, where current solutions fall short, what new capabilities would unlock value — prioritized by potential impact.

#### Recommendations
Specific, actionable recommendations tied back to findings, prioritized by impact and feasibility.

#### Open Questions
Gaps in understanding, areas needing further investigation, suggested follow-up research methods.

### 5. Review and Extend

After generating the synthesis:
- Ask if any findings need more detail or different framing
- Offer persona documents, opportunity maps, or a follow-up research plan
- Offer to turn recommendations into cases or work items. Ask before creating them.
- Offer to store stable, confirmed insights (e.g. validated personas) in agent memory

## Methodology

### Thematic Analysis
1. **Familiarization**: Read through all the data before coding anything.
2. **Initial coding**: Tag each observation, quote, or data point with descriptive codes. Be generous — merging is easier than splitting.
3. **Theme development**: Group related codes into candidate themes.
4. **Theme review**: Does each theme have enough evidence? Are themes distinct? Do they tell a coherent story?
5. **Theme refinement**: Name each theme and describe it in 1-2 sentences.
6. **Report**: Write up themes as findings with evidence.

### Affinity Mapping
1. Capture each distinct observation as a separate note
2. Cluster related notes — let categories emerge rather than pre-defining them
3. Label each cluster with its common thread
4. Arrange clusters into higher-level groups
5. Identify themes from the clusters and their relationships

Tips: one observation per note; regroup freely; split clusters that grow too large; outliers are interesting — do not force them into a cluster.

### Triangulation
- **Methodological**: Same question, different methods (interviews + survey + analytics)
- **Source**: Same method, different participants or segments
- **Temporal**: Same observation at different points in time

A finding supported by several sources and methods is much stronger. When sources disagree, that is signal — it may reveal different segments or contexts.

## Interview Note Analysis

For each interview, identify:

**Observations**: What the participant describes doing, experiencing, or feeling.
- Distinguish behaviours (what they do) from attitudes (what they think)
- Note context: when, where, with whom, how often
- Flag workarounds — they are unmet needs in disguise

**Direct quotes**: Specific and vivid, not generic. Attribute to participant type ("office manager, 40-person company"), not name. A quote is evidence, not a finding.

**Behaviour vs. stated preference**: What people do often differs from what they say they want. Behavioural evidence is stronger; note contradictions.

**Signals of intensity**: Emotional language, frequency of the issue, effort spent on workarounds, consequences when things go wrong.

Across interviews: look for patterns and their frequency, identify segments, surface contradictions, and note surprises that challenge prior assumptions.

## Survey Data Interpretation

### Quantitative
- **Response rate**: How representative is the sample?
- **Distribution**: Look at the shape, not just averages — a bimodal distribution tells a different story than a normal one.
- **Segmentation**: Aggregates can mask differences between segments.
- **Significance**: Be cautious with small samples and small differences.
- **Benchmarks**: Compare with previous surveys or industry benchmarks.

### Open-Ended Responses
Treat them like mini interview notes: code each response, count theme frequency, pull representative quotes, and watch for themes the structured questions did not cover.

### Common Mistakes
- Reporting averages without distributions
- Ignoring non-response bias
- Over-interpreting small differences (a 0.1 point NPS change is noise)
- Treating Likert scales as interval data
- Confusing correlation with causation in cross-tabulations

## Combining Qualitative and Quantitative Insights

- **Qualitative first**: Interviews reveal what is happening and why; they generate hypotheses.
- **Quantitative validation**: Surveys and analytics show how much and how many.
- **Qualitative deep-dive**: Return to qualitative methods to explain unexpected numbers.

Use quantitative data to prioritize qualitative findings, and qualitative data to explain quantitative anomalies. Present combined evidence: "47% of surveyed customers report difficulty with X (survey), and interviews show this is because Y."

When sources disagree, check whether different populations were measured, whether stated preference differs from behaviour, and whether the question captured what you think it did. Report the disagreement honestly.

## Persona Development

Personas should come from research data, not imagination:
1. Identify behavioural patterns across participants
2. Define the distinguishing variables (company size, skill level, usage frequency, primary use case)
3. Create a profile per cluster
4. Validate the size of each segment with quantitative data where possible

```
[Persona Name] — [One-line description]

Who they are: role, company type/size, experience level
What they are trying to accomplish: goals, how they measure success
How they work: frequency, key workflows, tools used alongside
Key pain points: top 3 frustrations, workarounds
What they value: what matters most, what would make them switch
Representative quotes: 2-3 verbatim quotes
```

Avoid: demographic-only personas, more than 3-5 personas, personas based on assumptions, never-updated personas, and personas that change no decisions.

## Opportunity Sizing

For each opportunity estimate:
- **Addressable users**: How many could benefit?
- **Frequency**: How often do they hit the issue?
- **Severity**: Blocker, significant friction, or minor annoyance?
- **Willingness to pay**: Would solving it drive revenue, retention, or new customers?

Score by impact (users × frequency × severity), evidence strength, strategic alignment and feasibility. Show the math, state assumptions, use ranges instead of false precision, and rank opportunities against each other.

## Output Format

Use clear headers and structured formatting. Each finding should stand on its own.

## Tips

- Let the data speak; do not force a predetermined narrative.
- Behavioural evidence beats stated preferences.
- Include quotes generously, attributed to participant type.
- Be explicit about confidence. A finding from 2 interviews is a hypothesis.
- Contradictions often reveal distinct segments.
- Recommendations must be actionable: not "improve onboarding" but "add a progress indicator to the setup flow".
- 5-8 strong findings beat 20 weak ones.
