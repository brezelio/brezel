---
name: code-review
description: Review code changes for security, performance, correctness and maintainability. Use when the user shares a diff, files or a change description and asks "review this before I merge", "is this code safe?", or wants a change checked for N+1 queries, injection risks, missing edge cases or error handling gaps.
---
<!-- Based on anthropics/knowledge-work-plugins/engineering/skills/code-review/SKILL.md (commit d900840716eb262e1feb17c6f4406c9ce0e06bcf), licensed under Apache-2.0. Copyright (c) Anthropic, PBC. Modified by Kiwis & Brownies for Brezel, 2026-11: removed slash-command usage and connector placeholders, mapped source control/tracker/knowledge base to user-provided files, Brezel records, cases and agent memory. -->

# Code Review

Review code changes with a structured lens on security, performance, correctness, and maintainability.

## Input

Review the code the user provides: a pasted diff, files or attachments, or a description of the change. If nothing specific is provided, ask the user what to review. If you cannot see the actual code, say so instead of reviewing from a description alone.

Useful context to ask for (briefly, only if missing):
- What the change is supposed to do (requirement, ticket, case)
- Whether it is a hot path, handles personal data, or touches authentication/payments
- Which concerns matter most ("focus on security")

## Review Dimensions

### Security
- SQL injection, XSS, CSRF
- Authentication and authorization flaws
- Secrets or credentials in code
- Insecure deserialization
- Path traversal
- SSRF
- Personal data handled without need (GDPR/DSGVO data minimisation)

### Performance
- N+1 queries
- Unnecessary memory allocations
- Algorithmic complexity (O(n²) in hot paths)
- Missing database indexes
- Unbounded queries or loops
- Resource leaks

### Correctness
- Edge cases (empty input, null, overflow)
- Race conditions and concurrency issues
- Error handling and propagation
- Off-by-one errors
- Type safety

### Maintainability
- Naming clarity
- Single responsibility
- Duplication
- Test coverage
- Documentation for non-obvious logic

## Output

```markdown
## Code Review: [Change title or file]

### Summary
[1-2 sentence overview of the changes and overall quality]

### Critical Issues
| # | File | Line | Issue | Severity |
|---|------|------|-------|----------|
| 1 | [file] | [line] | [description] | Critical |

### Suggestions
| # | File | Line | Suggestion | Category |
|---|------|------|------------|----------|
| 1 | [file] | [line] | [description] | Performance |

### What Looks Good
- [Positive observations]

### Verdict
[Approve / Request Changes / Needs Discussion]
```

Make every finding actionable: explain why it is a problem and show a concrete fix (a short code example where helpful).

## Working With Brezel

- **Requirements**: If the change belongs to a case or work item, read it and verify the change actually addresses the stated requirement and acceptance criteria.
- **Team standards**: Check agent memory and documents the user provides for coding standards or style guides, and apply them.
- **Follow-ups**: Offer to record findings that are not fixed right away as work items on the related case. Ask before creating them.
- **CI and test results**: If the user can provide test output or a CI log, include it in the assessment.

## Tips

1. **Context matters** — "This is a hot path" or "This handles personal data" changes what to focus on.
2. **Respect stated focus** — If the user asks for a security review, lead with security.
3. **Check the tests** — Review test coverage and quality together with the code.
