---
name: statistical-analysis
description: Apply statistical methods including descriptive statistics, trend analysis, outlier detection and hypothesis testing. Use when analyzing distributions, testing whether a difference is significant, detecting anomalies, computing correlations, forecasting simple trends or interpreting statistical results.
---
<!-- Based on anthropics/knowledge-work-plugins/data/skills/statistical-analysis/SKILL.md (commit d900840716eb262e1feb17c6f4406c9ce0e06bcf), licensed under Apache-2.0. Copyright (c) Anthropic, PBC. Modified by Kiwis & Brownies for Brezel, 2026-11: converted Python snippets to plain formulas, adapted examples to European business context (EUR). -->

# Statistical Analysis

Descriptive statistics, trend analysis, outlier detection, hypothesis testing, and guidance on when to be cautious about statistical claims.

## Descriptive Statistics Methodology

### Central Tendency

Choose the right measure of center based on the data:

| Situation | Use | Why |
|---|---|---|
| Symmetric distribution, no outliers | Mean | Most efficient estimator |
| Skewed distribution | Median | Robust to outliers |
| Categorical or ordinal data | Mode | Only option for non-numeric |
| Highly skewed with outliers (e.g., revenue per customer) | Median + mean | Report both; the gap shows skew |

**Always report mean and median together for business metrics.** If they diverge significantly, the data is skewed and the mean alone is misleading.

### Spread and Variability

- **Standard deviation**: How far values typically fall from the mean. Use with normally distributed data.
- **Interquartile range (IQR)**: Distance from p25 to p75. Robust to outliers. Use with skewed data.
- **Coefficient of variation (CV)**: StdDev / Mean. Use to compare variability across metrics with different scales.
- **Range**: Max minus min. Sensitive to outliers but gives a quick sense of data extent.

### Percentiles for Business Context

Report key percentiles to tell a richer story than the mean alone:

```
p1:   Bottom 1% (floor / minimum typical value)
p5:   Low end of normal range
p25:  First quartile
p50:  Median (typical case)
p75:  Third quartile
p90:  Top 10% / heavy users or large orders
p95:  High end of normal range
p99:  Top 1% / extreme cases
```

**Example narrative**: "The median order value is 420 EUR, but the top 10% of orders exceed 2,200 EUR, pulling the mean up to 780 EUR."

### Describing Distributions

Characterize every numeric distribution you analyze:

- **Shape**: Normal, right-skewed, left-skewed, bimodal, uniform, heavy-tailed
- **Center**: Mean and median (and the gap between them)
- **Spread**: Standard deviation or IQR
- **Outliers**: How many and how extreme
- **Bounds**: Is there a natural floor (zero) or ceiling (100%)?

## Trend Analysis and Forecasting

### Identifying Trends

**Moving averages** to smooth noise:
- 7-day moving average: mean of the current and previous 6 days (good for daily data with weekly seasonality)
- 28-day moving average: smooths weekly and monthly patterns

**Period-over-period comparison**:
- Week-over-week (WoW): Compare to the same day last week
- Month-over-month (MoM): Compare to the prior month
- Year-over-year (YoY): Gold standard for seasonal businesses
- Same-day-last-year: Compare a specific calendar day

**Growth rates**:
```
Simple growth: (current - previous) / previous
CAGR: (ending / beginning) ^ (1 / years) - 1
Log growth: ln(current / previous)  -- better for volatile series
```

### Seasonality Detection

Check for periodic patterns:
1. Look at the raw time series first
2. Compute day-of-week averages: is there a clear weekly pattern?
3. Compute month-of-year averages: is there an annual cycle (holidays, summer break, year-end)?
4. When comparing periods, use YoY or same-period comparisons to avoid conflating trend with seasonality. Watch for public holidays that differ by year and by federal state.

### Forecasting (Simple Methods)

Use straightforward methods:

- **Naive forecast**: Tomorrow = today. Use as a baseline.
- **Seasonal naive**: Tomorrow = same day last week/year.
- **Linear trend**: Fit a line to historical data. Only for clearly linear trends.
- **Moving average forecast**: Use the trailing average as the forecast.

**Always communicate uncertainty**. Provide a range, not a point estimate:
- "We expect 100-120 new orders next month based on the 3-month trend"
- NOT "We will get exactly 112 orders next month"

**When to involve a specialist**: Non-linear trends, multiple seasonalities, external factors (marketing spend, holidays), or when forecast accuracy matters for resource allocation.

## Outlier and Anomaly Detection

### Statistical Methods

**Z-score method** (for roughly normal data): z = (value - mean) / standard deviation; flag values with |z| > 3.

**IQR method** (robust to non-normal distributions): IQR = Q3 - Q1; flag values below Q1 - 1.5 × IQR or above Q3 + 1.5 × IQR.

**Percentile method** (simplest): flag values below p1 or above p99.

### Handling Outliers

Do NOT automatically remove outliers. Instead:

1. **Investigate**: Is this a data error, a genuine extreme value, or a different population?
2. **Data errors**: Fix or remove (e.g., negative quantities, dates in 1970)
3. **Genuine extremes**: Keep them but consider robust statistics (median instead of mean)
4. **Different population**: Segment them out for separate analysis (e.g., key accounts vs. small customers)

**Report what you did**: "We excluded 47 records (0.3%) with order amounts above 50,000 EUR, which are framework contracts analyzed separately."

### Time Series Anomaly Detection

1. Compute the expected value (moving average or same period last year)
2. Compute the deviation from expected
3. Flag deviations beyond a threshold (typically 2-3 standard deviations of the residuals)
4. Distinguish between point anomalies (single unusual value) and change points (sustained shift)

## Hypothesis Testing Basics

### When to Use

Use hypothesis testing to decide whether an observed difference is likely real or could be due to random chance:

- A/B test results: Is variant B actually better than A?
- Before/after comparison: Did the process change actually move the metric?
- Segment comparison: Do key accounts really have higher retention?

### The Framework

1. **Null hypothesis (H0)**: There is no difference (the default assumption)
2. **Alternative hypothesis (H1)**: There is a difference
3. **Choose significance level (alpha)**: Typically 0.05 (5% chance of a false positive)
4. **Compute the test statistic and p-value**
5. **Interpret**: If p < alpha, reject H0 (evidence of a real difference)

### Common Tests

| Scenario | Test | When to Use |
|---|---|---|
| Compare two group means | t-test (independent) | Normal data, two groups |
| Compare two group proportions | z-test for proportions | Conversion rates, binary outcomes |
| Compare paired measurements | Paired t-test | Before/after on the same entities |
| Compare 3+ group means | ANOVA | Multiple segments or variants |
| Non-normal data, two groups | Mann-Whitney U test | Skewed metrics, ordinal data |
| Association between categories | Chi-squared test | Two categorical variables |

### Practical vs. Statistical Significance

**Statistical significance** means the difference is unlikely due to chance. **Practical significance** means the difference is large enough to matter for business decisions. A difference can be statistically significant but practically meaningless (common with large samples). Always report:
- **Effect size**: How big is the difference? (e.g., "Variant B improved conversion by 0.3 percentage points")
- **Confidence interval**: What's the range of plausible true effects?
- **Business impact**: What does this mean in revenue, customers or other business terms?

### Sample Size Considerations

- Small samples produce unreliable results, even with significant p-values
- Rule of thumb for proportions: at least 30 events per group for basic reliability
- Detecting small effects may need thousands of observations per group — many SME datasets are too small for that
- If your sample is small, say so: "With only 200 observations per group, we have limited power to detect effects smaller than X%"

## When to Be Cautious About Statistical Claims

### Correlation Is Not Causation

When you find a correlation, explicitly consider:
- **Reverse causation**: Maybe B causes A, not A causes B
- **Confounding variables**: Maybe C causes both A and B
- **Coincidence**: With enough variables, spurious correlations are inevitable

**What you can say**: "Customers who use the portal have 30% higher retention"
**What you cannot say without more evidence**: "The portal causes 30% higher retention"

### Multiple Comparisons Problem

When you test many hypotheses, some will be "significant" by chance:
- Testing 20 metrics at p = 0.05 means about 1 will be falsely significant
- If you looked at many segments before finding one that's different, say so
- Adjust with the Bonferroni correction (divide alpha by the number of tests) or report how many tests were run

### Simpson's Paradox

A trend in aggregated data can reverse when data is segmented:
- Always check whether the conclusion holds across key segments
- Example: Overall conversion goes up, but goes down in every segment — because the mix shifted toward a higher-converting segment

### Survivorship Bias

You can only analyze what "survived" into your dataset:
- Analyzing active customers ignores those who left
- Always ask: "Who is missing from this dataset, and would their inclusion change the conclusion?"

### Ecological Fallacy

Aggregate trends may not apply to individuals. Be careful about applying group-level findings to individual cases.

### Anchoring on Specific Numbers

Be wary of false precision:
- "Churn will be 4.73% next quarter" implies more certainty than is warranted
- Prefer ranges: "We expect churn between 4-6% based on historical patterns"
- Round appropriately: "About 5%" is often more honest than "4.73%"
