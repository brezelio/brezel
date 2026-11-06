---
name: journal-entry
description: Prepare journal entries with proper debits, credits, and supporting detail for review. Use when booking period-end accruals (AP, payroll, prepaid), recording depreciation or amortization, posting revenue recognition or deferred revenue adjustments, or documenting an entry for audit review.
---
<!-- Based on anthropics/knowledge-work-plugins/finance/skills/journal-entry/SKILL.md (commit d900840716eb262e1feb17c6f4406c9ce0e06bcf), licensed under Apache-2.0. Copyright (c) Anthropic, PBC. Modified by Kiwis & Brownies for Brezel, 2026-11: replaced the /je command and ERP/data-warehouse connectors with Brezel records and user-provided files, added a DACH (HGB/GoBD) jurisdiction note. -->

# Journal Entry Preparation

**Important**: This skill assists with journal entry workflows but does not provide financial advice. All entries should be reviewed by qualified financial professionals before posting.

Prepare journal entries with proper debits, credits, supporting detail, and review documentation.

**Jurisdiction note:** You work for German/DACH companies. Apply the local framework (HGB, GoBD, German tax law incl. VAT/input tax; IFRS only if the company reports under it) rather than US GAAP/SOX conventions. Use the company's chart of accounts (often SKR 03 or SKR 04 in Germany — ask if unknown). Amounts default to EUR. Where legal or tax specifics matter, flag them for the company's tax advisor (Steuerberater) or auditor instead of inventing rules.

## Inputs

Clarify with the user:

- **Entry type**, one of:
  - `ap-accrual` — Accruals for goods/services received but not yet invoiced
  - `fixed-assets` — Depreciation and amortization for fixed assets and intangibles
  - `prepaid` — Amortization of prepaid expenses (insurance, software, rent, etc.)
  - `payroll` — Payroll accruals including salaries, social security contributions, and bonus accruals
  - `revenue` — Revenue recognition entries including deferred revenue adjustments
- **Period** — the accounting period (e.g. `2026-10`, `2026-Q4`, `2026`)

## Workflow

### 1. Gather Source Data

- Look for the relevant records in this Brezel system (bookings, invoices, contracts, assets, payroll data — find them with the entity tools).
- Otherwise use files or attachments the user provides: a trial balance or GL balances, subledger detail or supporting schedules, prior period entries of the same type, e.g. as an export from their accounting system.
- Identify the current GL balances for affected accounts.
- If data is missing, ask the user. Do not invent balances.

### 2. Calculate the Entry

Based on the entry type:

**AP Accrual:**
- Identify goods/services received but not invoiced by period end
- Calculate accrual amounts from PO receipts, contracts, or estimates
- Debit: Expense accounts (or asset accounts for capitalizable items)
- Credit: Accrued liabilities / provisions

**Fixed Assets:**
- Use the fixed asset register or depreciation schedule
- Calculate period depreciation by asset class and method (straight-line, declining balance, units of production) — note that commercial (HGB) and tax depreciation may differ
- Debit: Depreciation expense (by department/cost center)
- Credit: Accumulated depreciation / the asset account (depending on the company's practice)

**Prepaid:**
- Use the prepaid amortization schedule
- Calculate the period amortization for each prepaid item
- Debit: Expense accounts (by type — insurance, software, rent, etc.)
- Credit: Prepaid expense accounts

**Payroll:**
- Calculate accrued salaries for days worked but not yet paid
- Calculate accrued employer social security contributions, pension contributions and vacation accruals
- Calculate bonus accruals (if applicable, based on plan terms)
- Debit: Salary expense, social security expense, other personnel expense
- Credit: Accrued payroll, accrued social security, other provisions

**Revenue:**
- Review contracts and performance obligations
- Calculate revenue to recognize based on delivery/performance
- Adjust deferred revenue balances
- Debit: Deferred revenue (or accounts receivable)
- Credit: Revenue accounts (by stream/category)

### 3. Generate the Journal Entry

Present the entry in standard format:

```
Journal Entry: [Type] — [Period]
Prepared by: [User]
Date: [Period end date]

| Line | Account Code | Account Name | Debit | Credit | Cost Center | Memo |
|------|-------------|--------------|-------|--------|-------------|------|
| 1    | XXXX        | [Name]       | X,XXX |        | [CC]        | [Detail] |
| 2    | XXXX        | [Name]       |       | X,XXX  | [CC]        | [Detail] |
|      |             | **Total**    | X,XXX | X,XXX  |             |      |

Supporting Detail:
- [Calculation basis and assumptions]
- [Reference to supporting schedule or documentation (Beleg)]

Reversal: [Yes/No — if yes, specify reversal date]
```

### 4. Review Checklist

Before finalizing, verify:

- [ ] Debits equal credits
- [ ] Correct accounting period
- [ ] Account codes are valid and map to the right GL accounts
- [ ] VAT/tax codes are set where relevant
- [ ] Amounts are calculated correctly with supporting detail
- [ ] Memo/description is clear and specific enough for audit
- [ ] Department/cost center coding is correct
- [ ] Entry is consistent with prior period treatment
- [ ] Reversal flag is set appropriately (accruals usually reverse)
- [ ] Supporting documentation is referenced or attached (no entry without a voucher, per GoBD)
- [ ] Entry is within the user's approval authority
- [ ] No unusual or out-of-pattern amounts that need investigation

### 5. Output

Provide:
1. The formatted journal entry
2. Supporting calculations
3. Comparison to prior period entry of the same type (if available)
4. Any items flagged for review or follow-up
5. Instructions for posting (manual entry or an import format for the user's accounting system)

Never post an entry yourself unless the user explicitly asks and the system offers that action; prepare it for human review.
