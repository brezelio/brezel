---
name: data-analysis
description: Answer data questions, from quick lookups to full analyses and formal reports. Use when looking up a single metric, investigating what is driving a trend or drop, comparing segments over time, or preparing a data report for stakeholders, based on the records in this Brezel system or data the user provides.
---
<!-- Based on anthropics/knowledge-work-plugins/data/skills/analyze/SKILL.md (commit d900840716eb262e1feb17c6f4406c9ce0e06bcf), licensed under Apache-2.0. Copyright (c) Anthropic, PBC. Modified by Kiwis & Brownies for Brezel, 2026-11: replaced data warehouse/SQL execution with Brezel records and user-provided exports, removed slash commands and script-based charting. -->

# Data Analysis

Answer a data question, from a quick lookup to a full analysis to a formal report.

## Workflow

### 1. Understand the Question

Determine:

- **Complexity level**:
  - **Quick answer**: Single metric, simple filter, factual lookup (e.g., "How many new customers did we get last month?")
  - **Full analysis**: Multi-dimensional exploration, trend analysis, comparison (e.g., "What's driving the drop in order volume?")
  - **Formal report**: Comprehensive investigation with methodology, caveats, and recommendations (e.g., "Prepare a quarterly review of our service contracts")
- **Data requirements**: Which modules/records, fields, metrics, dimensions and time ranges are needed
- **Output format**: Number, table, chart recommendation, narrative, or a combination

If the question is ambiguous (which time range, which definition of "customer", gross or net), ask the user before computing.

### 2. Gather Data

**From this Brezel system:**

1. Find the relevant modules and fields with the entity tools
2. Retrieve the records you need, using filters for time range and segment rather than loading everything
3. If a lookup returns nothing or something unexpected, check field names, filter values and date formats, then retry
4. If results look unexpected, run sanity checks before proceeding

**From outside the system:**

1. Ask the user to provide the data in one of these ways:
   - Paste the figures or table directly
   - Provide a CSV or Excel file as an attachment
   - Provide an export from the source system (e.g. accounting, ERP, web analytics)
2. Once data is provided, proceed with the analysis

### 3. Analyze

- Calculate relevant metrics, aggregations, and comparisons
- Identify patterns, trends, outliers, and anomalies
- Compare across dimensions (time periods, segments, categories)
- For complex analyses, break the problem into sub-questions and address each

Use the statistical-analysis skill for distributions, trends, outliers and significance questions.

### 4. Validate Before Presenting

Before sharing results, run through these checks:

- **Record count sanity**: Does the number of records make sense?
- **Empty value check**: Are there unexpected empty fields that could skew results?
- **Magnitude check**: Are the numbers in a reasonable range?
- **Trend continuity**: Do time series have unexpected gaps?
- **Aggregation logic**: Do subtotals sum to totals correctly?

If any check raises concerns, investigate and note caveats. For a thorough review of a high-stakes analysis, use the validate-data skill.

### 5. Present Findings

**For quick answers:**
- State the answer directly with relevant context
- State how it was derived (which records, which filters) for reproducibility

**For full analyses:**
- Lead with the key finding or insight
- Support with data tables
- Note methodology and any caveats
- Suggest follow-up questions

**For formal reports:**
- Executive summary with key takeaways
- Methodology section explaining approach and data sources
- Detailed findings with supporting evidence
- Caveats, limitations, and data quality notes
- Recommendations and suggested next steps

### 6. Visualize Where Helpful

When a chart would communicate results better than a table:

- Recommend the right chart type (line for trends over time, bar for comparing categories, etc.)
- Provide the exact data table the chart should be built from
- Follow visualization best practices: bar charts start at zero, label axes, state the time range

## Tips

- Use complete periods and state the "as of" date of the data
- Be explicit about definitions (e.g. which statuses count as "won")
- For complex questions, work in several smaller retrieval steps
- If something looks off, say so — do not present unvalidated numbers as facts
- If personal data is involved, use only what the question needs and aggregate where possible (GDPR/DSGVO data minimisation)
