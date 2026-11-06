---
name: testing-strategy
description: Design test strategies and test plans. Use when the user asks "how should we test this", wants a test strategy or test plan, asks what tests are needed or wants tests written, or needs help with testing approaches, coverage or test architecture.
---
<!-- Based on anthropics/knowledge-work-plugins/engineering/skills/testing-strategy/SKILL.md (commit d900840716eb262e1feb17c6f4406c9ce0e06bcf), licensed under Apache-2.0. Copyright (c) Anthropic, PBC. Modified by Kiwis & Brownies for Brezel, 2026-11: added business workflow/automation guidance and tracking of test gaps as Brezel work items. -->

# Testing Strategy

Design effective testing strategies balancing coverage, speed, and maintenance.

## Testing Pyramid

```
        /  E2E  \         Few, slow, high confidence
       / Integration \     Some, medium speed
      /    Unit Tests  \   Many, fast, focused
```

## Strategy by Component Type

- **API endpoints**: Unit tests for business logic, integration tests for the HTTP layer, contract tests for consumers
- **Data pipelines and imports**: Input validation, transformation correctness, idempotency tests
- **Business workflows and automations**: Test each trigger, each branch and the failure paths with representative records; check that re-running does not create duplicates
- **Frontend**: Component tests, interaction tests, visual regression, accessibility
- **Infrastructure**: Smoke tests, chaos engineering, load tests

## What to Cover

Focus on: business-critical paths, error handling, edge cases, security boundaries, data integrity.

Skip: trivial getters/setters, framework code, one-off scripts.

## Output

Produce a test plan with: what to test, test type for each area, coverage targets, and example test cases (given/when/then). Identify gaps in existing coverage.

If the user wants the gaps followed up, offer to record them as work items on the related case. Ask before creating them.
