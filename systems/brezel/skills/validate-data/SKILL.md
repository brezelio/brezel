---
name: validate-data
description: Quality-check an analysis before it is shared — methodology, accuracy and bias checks with a confidence assessment. Use when reviewing an analysis before a presentation or decision, spot-checking calculations and aggregation logic, verifying that query or filter results look right, or assessing whether conclusions are actually supported by the data.
---
<!-- Based on anthropics/knowledge-work-plugins/data/skills/validate-data/SKILL.md (commit d900840716eb262e1feb17c6f4406c9ce0e06bcf), licensed under Apache-2.0. Copyright (c) Anthropic, PBC. Modified by Kiwis & Brownies for Brezel, 2026-11: removed slash commands, generalised SQL-specific checks to records/exports, replaced git/notebook documentation with Brezel cases and files, trimmed code documentation section, EUR examples. -->

# Validate Data

Review an analysis for accuracy, methodology, and potential biases before it is shared. Produce a confidence assessment and improvement suggestions.

## Input

The analysis can be:
- A document or report in the conversation
- A file or attachment (spreadsheet, report, export)
- Queries/filters and their results
- Charts and their underlying data
- A description of methodology and findings

Where the underlying data lives in this Brezel system, re-check key figures against the records with the entity tools.

## Workflow

### 1. Review Methodology and Assumptions

- **Question framing**: Is the analysis answering the right question? Could it be interpreted differently?
- **Data selection**: Are the right modules/datasets being used? Is the time range appropriate?
- **Population definition**: Is the population correctly defined? Any unintended exclusions?
- **Metric definitions**: Are metrics defined clearly and consistently? Do they match how stakeholders understand them?
- **Baseline and comparison**: Is the comparison fair? Are time periods, group sizes and contexts comparable?

### 2. Run the Pre-Delivery QA Checklist

Work through the checklist below — data quality, calculation, reasonableness, and presentation checks.

### 3. Check for Common Analytical Pitfalls

Review against the pitfall catalog below (join explosion, survivorship bias, incomplete period comparison, denominator shifting, average of averages, timezone mismatches, selection bias).

### 4. Verify Calculations and Aggregations

Where possible, spot-check:
- Recalculate a few key numbers independently
- Verify that subtotals sum to totals
- Check that percentages sum to 100% (or close to it) where expected
- Confirm that YoY/MoM comparisons use the correct base periods
- Validate that filters are applied consistently across all metrics

### 5. Assess Visualizations

If the analysis includes charts:
- Do axes start at appropriate values (zero for bar charts)?
- Are scales consistent across comparison charts?
- Do chart titles accurately describe what's shown?
- Could the visualization mislead a quick reader (truncated axes, inconsistent intervals, 3D effects)?

### 6. Evaluate Narrative and Conclusions

- Conclusions are supported by the data shown
- Alternative explanations are acknowledged
- Uncertainty is communicated appropriately
- Recommendations follow logically from findings
- The level of confidence matches the strength of evidence

### 7. Suggest Improvements

Specific, actionable suggestions: additional analyses, caveats to add, better framings for key points, missing context stakeholders would want.

### 8. Confidence Assessment

Rate the analysis on a 3-level scale:

- **Ready to share** — Methodologically sound, calculations verified, caveats noted. Minor suggestions only.
- **Share with noted caveats** — Largely correct but with specific limitations that must be communicated. List the required caveats.
- **Needs revision** — Errors, methodological issues, or missing analyses that must be fixed first. List the required changes in priority order.

## Output Format

```
## Validation Report

### Overall Assessment: [Ready to share | Share with caveats | Needs revision]

### Methodology Review
[Findings about approach, data selection, definitions]

### Issues Found
1. [Severity: High/Medium/Low] [Issue description and impact]
2. ...

### Calculation Spot-Checks
- [Metric]: [Verified / Discrepancy found]
- ...

### Visualization Review
[Any issues with charts or visual presentation]

### Suggested Improvements
1. [Improvement and why it matters]
2. ...

### Required Caveats for Stakeholders
- [Caveat that must be communicated]
- ...
```

---

## Pre-Delivery QA Checklist

### Data Quality Checks
- [ ] **Source verification**: Confirmed which data sources were used and that they fit the question.
- [ ] **Freshness**: Data is current enough. The "as of" date is noted.
- [ ] **Completeness**: No unexpected gaps in time series or missing segments.
- [ ] **Empty values**: Checked the share of empty values in key fields and handled them (excluded, imputed, or flagged).
- [ ] **Deduplication**: No double-counting from duplicated records or bad combinations of data.
- [ ] **Filter verification**: All filters are correct. No unintended exclusions.

### Calculation Checks
- [ ] **Aggregation logic**: The aggregation level matches the analysis grain.
- [ ] **Denominator correctness**: Rates use the right, non-zero denominator.
- [ ] **Date alignment**: Comparisons use the same period length. Partial periods are excluded or noted.
- [ ] **Combining data**: Linking records across modules or files hasn't inflated counts (one-to-many links).
- [ ] **Metric definitions**: Metrics match how stakeholders define them. Deviations are noted.
- [ ] **Subtotals sum**: Parts add up to the whole where expected, or the difference is explained.

### Reasonableness Checks
- [ ] **Magnitude**: Numbers are plausible. Revenue isn't negative. Percentages are between 0-100%.
- [ ] **Trend continuity**: No unexplained jumps or drops in time series.
- [ ] **Cross-reference**: Key numbers match other known sources (reports, accounting figures, previous analyses).
- [ ] **Edge cases**: Empty segments, zero-activity periods and new entries behave sensibly.

### Presentation Checks
- [ ] **Chart accuracy**: Bar charts start at zero. Axes are labeled. Scales are consistent.
- [ ] **Number formatting**: Appropriate precision, consistent currency/percentage format and separators for the audience's locale.
- [ ] **Title clarity**: Titles state the insight, not just the metric. Date ranges are specified.
- [ ] **Caveat transparency**: Known limitations and assumptions are stated explicitly.
- [ ] **Reproducibility**: Someone else could recreate the analysis from the documentation.

## Common Data Analysis Pitfalls

### Join Explosion
**Problem**: Combining data with a one-to-many or many-to-many relationship silently multiplies rows, inflating counts and sums.
**Detect**: Compare record counts before and after combining (e.g. 1,000 orders become 3,500 rows after adding order lines).
**Prevent**: Check counts after every combination; count distinct IDs when counting entities through a link.

### Survivorship Bias
**Problem**: Analyzing only what exists today, ignoring what was deleted, cancelled or lost (e.g. "current customers" misses customers who left).
**Prevent**: Ask "who is NOT in this dataset?" before drawing conclusions.

### Incomplete Period Comparison
**Problem**: Comparing a partial period to a full period ("January revenue is 50,000 EUR vs. December's 80,000 EUR" — but January isn't over).
**Prevent**: Use complete periods, or compare the same number of days.

### Denominator Shifting
**Problem**: The denominator definition changes between periods (e.g. the definition of "active customer" was updated).
**Prevent**: Use consistent definitions across compared periods and note any changes.

### Average of Averages
**Problem**: Averaging pre-computed averages is wrong when group sizes differ.
- Group A: 100 customers, average revenue 50 EUR; Group B: 10 customers, average 200 EUR
- Wrong: (50 + 200) / 2 = 125 EUR
- Right: (100 × 50 + 10 × 200) / 110 = 63.64 EUR
**Prevent**: Aggregate from raw data.

### Timezone Mismatches
**Problem**: Sources use different timezones or day cutoffs (UTC timestamps vs. local business days, daylight saving time).
**Prevent**: Standardize timestamps to one timezone before analysis and document it.

### Selection Bias in Segmentation
**Problem**: Segments are defined by the outcome being measured ("customers who completed onboarding have higher retention").
**Prevent**: Define segments by characteristics that exist before the outcome.

### Other Statistical Traps
- Simpson's paradox (trend reverses when segmented)
- Correlation presented as causation
- Small sample sizes
- Outliers distorting averages (should medians be used?)
- Multiple testing / cherry-picking significant results
- Look-ahead bias (using future information to explain the past)
- Cherry-picked time ranges

## Result Sanity Checking

### Magnitude Checks

| Metric Type | Sanity Check |
|---|---|
| Customer/user counts | Does this match known figures? |
| Revenue | Right order of magnitude vs. known annual revenue? |
| Conversion rates | Between 0% and 100%? Matches known figures? |
| Growth rates | Is 50%+ month-over-month growth realistic, or a data issue? |
| Averages | Reasonable given the distribution? |
| Percentages | Do segment shares sum to ~100%? |

### Cross-Validation Techniques
1. Calculate the same metric two different ways and verify they match
2. Spot-check individual records and trace their data manually
3. Compare to known benchmarks (reports, accounting figures, prior analyses)
4. Reverse engineer: does revenue per customer × customer count ≈ total revenue?
5. Boundary checks: filter to a single day, customer or category — are those micro-results sensible?

### Red Flags That Warrant Investigation
- Any metric that changed by more than 50% period-over-period without an obvious cause
- Counts or sums that are exact round numbers (suggests a filter or default value issue)
- Rates exactly at 0% or 100% (may indicate incomplete data)
- Results that perfectly confirm the hypothesis (reality is usually messier)
- Identical values across time periods or segments (suggests a dimension is ignored)

## Documentation for Reproducibility

Every non-trivial analysis should include:

```markdown
## Analysis: [Title]

### Question
[The specific question being answered]

### Data Sources
- Module/records: [name] (as of [date])
- File: [filename] (source: [where it came from])

### Definitions
- [Metric A]: [Exactly how it's calculated]
- [Segment X]: [Exactly how membership is determined]
- [Time period]: [Start date] to [end date], [timezone]

### Methodology
1. [Step 1]
2. [Step 2]

### Assumptions and Limitations
- [Assumption and why it's reasonable]
- [Limitation and its potential impact]

### Key Findings
1. [Finding with supporting evidence]

### Caveats
- [Things the reader should know before acting on this]
```

Keep this documentation with the analysis: attach it to the related case or store it as a file in Brezel. When a recurring analysis is re-run with new data, note what changed and why. Store stable metric definitions the user confirms in agent memory so later analyses use the same definitions.

## Tips

- Validate before any high-stakes presentation or decision
- Even quick analyses benefit from a sanity check
- If validation finds issues, fix them and validate again
- Share the validation report alongside the analysis to build trust
