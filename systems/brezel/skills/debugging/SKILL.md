---
name: debugging
description: Run a structured debugging session — reproduce, isolate, diagnose and fix. Use when the user shares an error message or stack trace, says "this works in test but not in production" or "something broke after the update", or when behaviour diverges from what is expected and the cause is not obvious.
---
<!-- Based on anthropics/knowledge-work-plugins/engineering/skills/debug/SKILL.md (commit d900840716eb262e1feb17c6f4406c9ce0e06bcf), licensed under Apache-2.0. Copyright (c) Anthropic, PBC. Modified by Kiwis & Brownies for Brezel, 2026-11: removed slash-command usage and connector placeholders, mapped monitoring/source control/tracker to user-provided logs, Brezel records, cases and work items. -->

# Debugging

Run a structured debugging session to find and fix issues systematically.

## Steps

### Step 1: Reproduce
- Understand the expected vs. actual behaviour
- Identify exact reproduction steps
- Determine scope (when did it start? who is affected?)

### Step 2: Isolate
- Narrow down the component, service, workflow or code path
- Check recent changes (updates, configuration changes, dependencies, data changes)
- Review logs and error messages

### Step 3: Diagnose
- Form hypotheses and test them one at a time
- Trace the code or process path
- Identify the root cause (not just symptoms)

### Step 4: Fix
- Propose a fix with explanation
- Consider side effects and edge cases
- Suggest tests to prevent regression

## What to Ask For

Ask the user for whatever is missing. Any of these help:
- Error message or stack trace (exact text, not paraphrased)
- Steps to reproduce
- What changed recently
- Logs or screenshots (as files or attachments)
- Expected vs. actual behaviour

## Output

```markdown
## Debug Report: [Issue Summary]

### Reproduction
- **Expected**: [What should happen]
- **Actual**: [What happens instead]
- **Steps**: [How to reproduce]

### Root Cause
[Explanation of why the bug occurs]

### Fix
[Code changes or configuration fixes needed]

### Prevention
- [Test to add]
- [Guard to put in place]
```

## Working With Brezel

- **Evidence**: Inspect the affected records in this Brezel system with the entity tools (e.g. the record that failed, its recent changes) and any logs, exports or screenshots the user provides. If metrics or logs live in an external monitoring system, ask the user for an export covering the time of the issue.
- **Known issues**: Search existing cases and work items for related bug reports before starting from scratch.
- **Tracking the fix**: Once the root cause is clear, offer to create a work item for the fix (attached to the relevant case). Ask before creating it.
- **Recurring patterns**: If a cause turns out to be a durable fact about this environment (e.g. a known integration quirk), store it in agent memory.

## Tips

1. **Exact error messages** — Don't paraphrase. The exact text matters.
2. **What changed** — Recent updates, dependency changes and configuration changes are top suspects.
3. **Context narrows fast** — "This works in test but not in production" or "Only affects large files" narrows things quickly.
