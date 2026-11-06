---
name: financial-statements
description: Prepare financial statements (income statement, balance sheet, cash flow) with period-over-period and budget comparison and variance analysis. Use when preparing a monthly or quarterly P&L, closing the books and flagging material variances, comparing actuals to budget, building a financial summary for management, or checking presentation requirements and period-end adjustments.
---
<!-- Based on anthropics/knowledge-work-plugins/finance/skills/financial-statements/SKILL.md (commit d900840716eb262e1feb17c6f4406c9ce0e06bcf), licensed under Apache-2.0. Copyright (c) Anthropic, PBC. Modified by Kiwis & Brownies for Brezel, 2026-11: replaced the slash command and ERP/data-warehouse connectors with Brezel records and user-provided files, switched amounts to EUR, replaced the US GAAP (ASC) presentation section with a short HGB/IFRS framework note, simplified equity terms. -->

# Financial Statements

**Important**: This skill assists with financial statement workflows but does not provide financial advice. All statements should be reviewed by qualified financial professionals before use in reporting or filings.

Prepare financial statements with period-over-period comparison and variance analysis. The workflow below walks through income statement preparation; balance sheet and cash flow reference formats, presentation framework notes, and common period-end adjustments are included as supporting reference material.

**Jurisdiction note:** You work for German/DACH companies. Statutory financial statements follow the local framework (HGB, GoBD; IFRS only if the company reports under it), not US GAAP. The formats below are management-reporting templates; for statutory statements use the HGB structure (see "Presentation Framework"). Amounts default to EUR. Where legal or tax specifics matter, flag them for the company's tax advisor (Steuerberater) or auditor instead of inventing rules.

## Inputs

Clarify with the user:

- **Period type:**
  - `monthly` — Single month P&L with prior month and prior year month comparison
  - `quarterly` — Quarter P&L with prior quarter and prior year quarter comparison
  - `annual` — Full year P&L with prior year comparison
  - `ytd` — Year-to-date P&L with prior year YTD comparison
- **Period** — the period to report (e.g. `2026-10`, `2026-Q3`, `2026`)

## Workflow

### 1. Gather Financial Data

- Look for the relevant data in the records of this Brezel system (bookings, accounts, invoices, budgets — find them with the entity tools).
- Otherwise use files or attachments the user provides: a trial balance (Summen- und Saldenliste), a BWA or P&L export from their accounting system, a budget spreadsheet.
- You need: current period revenue and expense data (by account or category), comparison period data (prior period, prior year, and/or budget), the account grouping for presentation, and any known adjustments or reclassifications.
- If data is missing, ask the user. Do not invent figures.

### 2. Generate Income Statement

Present in standard multi-column format:

```
INCOME STATEMENT
Period: [Period description]
(in EUR thousands, unless otherwise noted)

                              Current    Prior      Variance   Variance   Budget    Budget
                              Period     Period     (EUR)      (%)        Amount    Var (EUR)
                              --------   --------   --------   --------   --------  --------
REVENUE
  Product revenue             XX,XXX     XX,XXX     X,XXX      X.X%       XX,XXX    X,XXX
  Service revenue             XX,XXX     XX,XXX     X,XXX      X.X%       XX,XXX    X,XXX
  Other revenue               XX,XXX     XX,XXX     X,XXX      X.X%       XX,XXX    X,XXX
                              --------   --------   --------              --------  --------
TOTAL REVENUE                 XX,XXX     XX,XXX     X,XXX      X.X%       XX,XXX    X,XXX

COST OF REVENUE / MATERIALS
  [Cost items]                XX,XXX     XX,XXX     X,XXX      X.X%       XX,XXX    X,XXX
                              --------   --------   --------              --------  --------
GROSS PROFIT                  XX,XXX     XX,XXX     X,XXX      X.X%       XX,XXX    X,XXX
  Gross Margin                XX.X%      XX.X%

OPERATING EXPENSES
  Personnel                   XX,XXX     XX,XXX     X,XXX      X.X%       XX,XXX    X,XXX
  Depreciation & amortization XX,XXX     XX,XXX     X,XXX      X.X%       XX,XXX    X,XXX
  Other operating expenses    XX,XXX     XX,XXX     X,XXX      X.X%       XX,XXX    X,XXX
                              --------   --------   --------              --------  --------
TOTAL OPERATING EXPENSES      XX,XXX     XX,XXX     X,XXX      X.X%       XX,XXX    X,XXX

OPERATING INCOME (LOSS)       XX,XXX     XX,XXX     X,XXX      X.X%       XX,XXX    X,XXX
  Operating Margin            XX.X%      XX.X%

FINANCIAL RESULT
  Interest income             XX,XXX     XX,XXX     X,XXX      X.X%
  Interest expense           (XX,XXX)   (XX,XXX)    X,XXX      X.X%
  Other, net                  XX,XXX     XX,XXX     X,XXX      X.X%
                              --------   --------   --------
TOTAL FINANCIAL RESULT        XX,XXX     XX,XXX     X,XXX      X.X%

INCOME BEFORE TAXES           XX,XXX     XX,XXX     X,XXX      X.X%
  Income taxes                XX,XXX     XX,XXX     X,XXX      X.X%
                              --------   --------   --------

NET INCOME (LOSS)             XX,XXX     XX,XXX     X,XXX      X.X%       XX,XXX    X,XXX
  Net Margin                  XX.X%      XX.X%
```

Use the company's own line items where they exist (e.g. the structure of their BWA); the lines above are a default.

### 3. Variance Analysis

For each line item, calculate and flag material variances (the variance-analysis skill, if available, covers the techniques in depth).

#### Variance Calculation

- **Absolute variance:** Current period - Prior period (or current period - budget)
- **Percentage variance:** (Current - Prior) / |Prior| x 100
- **Basis point change:** For margins and ratios, express change in basis points (1 bp = 0.01%)

#### Materiality Thresholds

Define what constitutes a "material" variance requiring investigation. Common approaches:

- **Fixed amount threshold:** Variances exceeding a set amount (e.g. EUR 50K, EUR 100K)
- **Percentage threshold:** Variances exceeding a set percentage (e.g. 10%, 15%)
- **Combined:** Either the amount OR percentage threshold is exceeded
- **Scaled:** Different thresholds for different line items based on their size and volatility

*Example thresholds (adjust for the organization's size — ask the user):*

| Line Item Size | Amount Threshold | Percentage Threshold |
|---------------|-----------------|---------------------|
| > EUR 10M     | EUR 500K        | 5%                  |
| EUR 1M - 10M  | EUR 100K        | 10%                 |
| < EUR 1M      | EUR 50K         | 15%                 |

#### Variance Decomposition

Break down total variance into component drivers:

- **Volume/quantity effect:** Change in volume at prior period rates
- **Rate/price effect:** Change in rate/price at current period volume
- **Mix effect:** Shift in composition between items with different rates/margins
- **New/discontinued items:** Items present in one period but not the other
- **One-time/non-recurring items:** Items that are not expected to repeat
- **Timing effect:** Items shifting between periods (not a true change in run rate)
- **Currency effect:** Impact of FX rate changes on translated results

#### Investigation and Narrative

For each material variance:
1. Quantify the variance (EUR and %)
2. Identify whether favorable or unfavorable
3. Decompose into drivers using the categories above
4. Provide a narrative explanation of the business reason (ask the user when the reason is not in the data)
5. Assess whether the variance is temporary or represents a trend change
6. Note any actions required (further investigation, forecast update, process change)

### 4. Key Metrics Summary

```
KEY METRICS
                              Current    Prior      Change
Revenue growth (%)                                  X.X%
Gross margin (%)              XX.X%      XX.X%      X.X pp
Operating margin (%)          XX.X%      XX.X%      X.X pp
Net margin (%)                XX.X%      XX.X%      X.X pp
OpEx as % of revenue          XX.X%      XX.X%      X.X pp
Effective tax rate (%)        XX.X%      XX.X%      X.X pp
```

### 5. Material Variance Summary

List all material variances requiring investigation:

| Line Item | Variance (EUR) | Variance (%) | Direction | Preliminary Driver | Action |
|-----------|---------------|-------------|-----------|-------------------|--------|
| [Item]    | X,XXX         | X.X%        | Unfav.    | [If known]        | Investigate |

### 6. Output

Provide:
1. Formatted income statement with comparisons
2. Key metrics summary
3. Material variance listing with investigation flags
4. Suggested follow-up questions for unexplained variances
5. An offer to drill into any specific variance

## Presentation Framework

### HGB (default for German companies)

- The balance sheet structure is prescribed by § 266 HGB; the income statement by § 275 HGB, using either the nature of expense method (Gesamtkostenverfahren) or the cost of sales method (Umsatzkostenverfahren).
- Size classes (§ 267 HGB) determine which reliefs apply to small and medium-sized companies; a cash flow statement is generally not required for single-entity statements of non-capital-market companies, but is useful for management reporting.
- Statutory statements are typically prepared by or with the tax advisor / auditor. Use this skill for management reporting and preparation; do not present output as the statutory annual financial statements (Jahresabschluss).

### IFRS / US GAAP (only if the company reports under them)

- Income statement: classify expenses by nature or by function; present operating and non-operating items separately; show income taxes separately; present discontinued operations separately, net of tax.
- Balance sheet: distinguish current (realized/settled within 12 months or the operating cycle) and non-current items; show receivables net of loss allowances and fixed assets net of accumulated depreciation; recognize lease right-of-use assets and liabilities where required.
- Cash flow statement: indirect method is most common; disclose interest and taxes paid and non-cash investing/financing activities.

## Balance Sheet Reference Format

```
ASSETS
Non-Current Assets
  Intangible assets
  Property, plant and equipment
  Financial assets
Total Non-Current Assets

Current Assets
  Inventory
  Accounts receivable, net
  Other assets
  Cash and cash equivalents
  Prepaid expenses
Total Current Assets

TOTAL ASSETS

EQUITY AND LIABILITIES
Equity
  Subscribed capital
  Capital reserves
  Retained earnings
  Profit / loss carried forward
  Net income / loss for the year
Total Equity

Provisions
  Tax provisions
  Other provisions
Total Provisions

Liabilities
  Bank loans
  Accounts payable
  Other liabilities
Total Liabilities

Deferred income

TOTAL EQUITY AND LIABILITIES
```

(Ordered as in the German HGB layout — fixed assets first. IFRS/US-style statements often order by liquidity instead.)

## Cash Flow Statement Reference Format (Indirect Method)

```
CASH FLOWS FROM OPERATING ACTIVITIES
Net income (loss)
Adjustments to reconcile net income to net cash from operations:
  Depreciation and amortization
  Increase (decrease) in provisions
  Loss (gain) on disposal of assets
  Impairment charges
  Other non-cash items
Changes in operating assets and liabilities:
  Accounts receivable
  Inventory
  Prepaid expenses and other assets
  Accounts payable
  Deferred income
  Other liabilities
Net Cash from Operating Activities

CASH FLOWS FROM INVESTING ACTIVITIES
  Purchases of property, plant and equipment
  Purchases of investments
  Proceeds from disposals of assets / investments
  Acquisitions, net of cash acquired
Net Cash from Investing Activities

CASH FLOWS FROM FINANCING ACTIVITIES
  Proceeds from loans
  Repayment of loans
  Capital contributions
  Distributions / dividends paid
Net Cash from Financing Activities

Effect of exchange rate changes on cash

Net Increase (Decrease) in Cash and Cash Equivalents
Cash and cash equivalents, beginning of period
Cash and cash equivalents, end of period
```

## Common Adjustments and Reclassifications

### Period-End Adjustments

1. **Accruals:** Record expenses incurred but not yet paid (AP accruals, payroll accruals, interest accruals)
2. **Deferrals:** Adjust prepaid expenses, deferred income, and deferred costs for the period
3. **Depreciation and amortization:** Book periodic depreciation/amortization from fixed asset and intangible schedules
4. **Bad debt allowance:** Adjust valuation allowances on receivables based on aging analysis and historical loss rates
5. **Inventory adjustments:** Record write-downs for obsolete, slow-moving, or impaired inventory
6. **FX revaluation:** Revalue foreign-currency monetary assets and liabilities at period-end rates
7. **Tax provisions:** Record current (and, where applicable, deferred) income taxes
8. **Provisions:** Record or adjust provisions for uncertain liabilities (e.g. vacation, warranties, audit and closing costs)

### Reclassifications

1. **Maturity reclassification:** Show the portion of long-term debt due within 12 months separately where required
2. **Contra account netting:** Net allowances against gross receivables, accumulated depreciation against gross assets
3. **Intercompany elimination:** Eliminate intercompany balances and transactions in consolidation
4. **Discontinued operations:** Separate results of discontinued operations where the framework requires it
5. **Segment reclassifications:** Ensure transactions are properly classified by segment or cost center
