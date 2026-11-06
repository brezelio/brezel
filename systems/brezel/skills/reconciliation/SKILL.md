---
name: reconciliation
description: Reconcile accounts by comparing general ledger balances to subledgers, bank statements, or third-party data, and categorize and age the reconciling items. Use when performing bank reconciliations, GL-to-subledger reconciliations, intercompany reconciliations, or when identifying, explaining and escalating reconciling items.
---
<!-- Based on anthropics/knowledge-work-plugins/finance/skills/reconciliation/SKILL.md (commit d900840716eb262e1feb17c6f4406c9ce0e06bcf), licensed under Apache-2.0. Copyright (c) Anthropic, PBC. Modified by Kiwis & Brownies for Brezel, 2026-11: removed Claude Code arguments, switched examples to EUR, added data-source guidance for Brezel and a DACH (HGB/GoBD) jurisdiction note. -->

# Reconciliation

**Important**: This skill assists with reconciliation workflows but does not provide financial advice. All reconciliations should be reviewed by qualified financial professionals before sign-off.

Methodology and best practices for account reconciliation, including GL-to-subledger, bank reconciliations, and intercompany. Covers reconciling item categorization, aging analysis, and escalation.

**Jurisdiction note:** You work for German/DACH companies. Apply the local framework (HGB, GoBD documentation and retention requirements, local tax rules; IFRS only if the company reports under it) rather than US GAAP/SOX conventions. Amounts default to EUR. Where legal or tax specifics matter, flag them for the company's tax advisor (Steuerberater) or auditor instead of inventing rules.

## Getting the Data

- Look for the relevant records in this Brezel system (accounts, bookings, invoices, payments, bank transactions — find them with the entity tools).
- Otherwise use files or attachments the user provides (e.g. a bank statement, a trial balance or subledger export from their accounting system / ERP, e.g. a DATEV export).
- If anything is missing, ask the user. Never guess balances.

## Reconciliation Types

### GL to Subledger Reconciliation

Compare the general ledger control account balance to the detailed subledger balance.

**Common accounts:**
- Accounts receivable (GL control vs AR subledger / open items list)
- Accounts payable (GL control vs AP subledger / open items list)
- Fixed assets (GL control vs fixed asset register)
- Inventory (GL control vs inventory valuation report)
- Prepaid expenses (GL control vs prepaid amortization schedule)
- Accrued liabilities (GL control vs accrual detail schedules)

**Process:**
1. Get the GL balance for the control account as of period end
2. Get the subledger trial balance or detail report as of the same date
3. Compare totals — they should match if posting is real-time
4. Investigate any differences (timing of posting, manual entries not reflected, interface errors)

**Common causes of differences:**
- Manual journal entries posted to the control account but not reflected in the subledger
- Subledger transactions not yet interfaced to the GL
- Timing differences in batch posting
- Reclassification entries in the GL without subledger adjustment
- System interface errors or failed postings

### Bank Reconciliation

Compare the GL cash balance to the bank statement balance.

**Process:**
1. Obtain the bank statement balance as of period end
2. Get the GL bank account balance as of the same date
3. Identify outstanding payments (issued/recorded but not yet debited by the bank, e.g. transfers, checks)
4. Identify deposits in transit (recorded in GL but not yet credited by bank)
5. Identify bank charges, interest, or adjustments not yet recorded in GL
6. Reconcile both sides to an adjusted balance

**Standard format:**

```
Balance per bank statement:          EUR XX,XXX
Add: Deposits in transit             EUR X,XXX
Less: Outstanding payments          (EUR X,XXX)
Add/Less: Bank errors                EUR X,XXX
Adjusted bank balance:               EUR XX,XXX

Balance per general ledger:          EUR XX,XXX
Add: Interest/credits not recorded   EUR X,XXX
Less: Bank fees not recorded        (EUR X,XXX)
Add/Less: GL errors                  EUR X,XXX
Adjusted GL balance:                 EUR XX,XXX

Difference:                          EUR 0.00
```

### Intercompany Reconciliation

Reconcile balances between related entities to ensure they net to zero on consolidation.

**Process:**
1. Get intercompany receivable/payable balances for each entity pair
2. Compare Entity A's receivable from Entity B to Entity B's payable to Entity A
3. Identify and resolve differences
4. Confirm all intercompany transactions have been recorded on both sides
5. Verify elimination entries are correct for consolidation

**Common causes of differences:**
- Transactions recorded by one entity but not the other (timing)
- Different FX rates used by each entity
- Misclassification (intercompany vs third-party)
- Disputed amounts or unapplied payments
- Different period-end cut-off practices across entities

## Reconciling Item Categorization

### Category 1: Timing Differences

Items that exist because of normal processing timing and will clear without action:

- **Outstanding payments:** Payments issued and recorded in GL, pending bank clearance
- **Deposits in transit:** Deposits made and recorded in GL, pending bank credit
- **In-transit transactions:** Items posted in one system but pending interface to the other
- **Pending approvals:** Transactions awaiting approval to post in one system

**Expected resolution:** These items should clear within the normal processing cycle (typically 1-5 business days). No adjusting entry needed.

### Category 2: Adjustments Required

Items that require a journal entry to correct:

- **Unrecorded bank charges:** Bank fees, transfer charges, returned direct debit fees
- **Unrecorded interest:** Interest income or expense from bank/lender
- **Recording errors:** Wrong amount, wrong account, duplicates
- **Missing entries:** Transactions in one system with no corresponding entry in the other
- **Classification errors:** Correctly recorded but in the wrong account

**Action:** Prepare an adjusting journal entry to correct the GL or subledger (see the journal-entry skill if available). Under GoBD, corrections are made by new entries, never by overwriting or deleting posted entries.

### Category 3: Requires Investigation

Items that cannot be immediately explained:

- **Unidentified differences:** Variances with no obvious cause
- **Disputed items:** Amounts contested between parties
- **Aged outstanding items:** Items that have not cleared within expected timeframes
- **Recurring unexplained differences:** Same type of difference appearing each period

**Action:** Investigate root cause, document findings, escalate if unresolved.

## Aging Analysis for Outstanding Items

Track the age of reconciling items to identify stale items requiring escalation:

| Age Bucket | Status | Action |
|-----------|--------|--------|
| 0-30 days | Current | Monitor — within normal processing cycle |
| 31-60 days | Aging | Investigate — follow up on why item has not cleared |
| 61-90 days | Overdue | Escalate — notify supervisor, document investigation |
| 90+ days | Stale | Escalate to management — potential write-off or adjustment needed |

### Aging Report Format

| Item # | Description | Amount | Date Originated | Age (Days) | Category | Status | Owner |
|--------|-------------|--------|-----------------|------------|----------|--------|-------|
| 1      | [Detail]    | EUR X,XXX | [Date]       | XX         | [Type]   | [Status] | [Name] |

### Trending

Track reconciling item totals over time to identify growing balances:

- Compare total outstanding items to prior period
- Flag if total reconciling items exceed materiality threshold
- Flag if number of items is growing period over period
- Identify recurring items that appear every period (may indicate process issue)

## Escalation Thresholds

Define escalation triggers based on the organization's risk tolerance:

| Trigger | Threshold (Example) | Escalation |
|---------|---------------------|------------|
| Individual item amount | > EUR 10,000 | Supervisor review |
| Individual item amount | > EUR 50,000 | Controller / head of accounting review |
| Total reconciling items | > EUR 100,000 | Controller / head of accounting review |
| Item age | > 60 days | Supervisor follow-up |
| Item age | > 90 days | Controller / management review |
| Unreconciled difference | Any amount | Cannot close — must resolve or document |
| Growing trend | 3+ consecutive periods | Process improvement investigation |

*Note: Set thresholds based on the organization's materiality level and risk appetite. The examples above are illustrative — ask the user for their actual thresholds and keep them in agent memory once confirmed.*

## Reconciliation Best Practices

1. **Timeliness:** Complete reconciliations within the close calendar deadline (typically T+3 to T+5 business days after period end)
2. **Completeness:** Reconcile all balance sheet accounts on a defined frequency (monthly for material accounts, quarterly for immaterial)
3. **Documentation:** Every reconciliation should include preparer, reviewer, date, and clear explanation of all reconciling items
4. **Segregation:** The person who reconciles should not be the same person who processes transactions in that account
5. **Follow-through:** Track open items to resolution (e.g. as cases and work items) — do not just carry items forward indefinitely
6. **Root cause analysis:** For recurring reconciling items, investigate and fix the underlying process issue
7. **Standardization:** Use consistent templates and procedures across all accounts
8. **Retention:** Keep reconciliations and supporting detail according to the statutory retention periods (GoBD / HGB / AO) and the organization's document retention policy
