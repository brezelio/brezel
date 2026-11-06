---
name: process-optimization
description: Analyze and improve business processes. Use when the user says a process is slow, has too many steps or a bottleneck, wants to streamline a workflow, or describes an inefficient process they want to fix.
---
<!-- Based on anthropics/knowledge-work-plugins/operations/skills/process-optimization/SKILL.md (commit d900840716eb262e1feb17c6f4406c9ce0e06bcf), licensed under Apache-2.0. Copyright (c) Anthropic, PBC. Modified by Kiwis & Brownies for Brezel, 2026-11: added Brezel data sources and automation hints. -->

# Process Optimization

Analyze existing processes and recommend improvements.

## Inputs

- The user's description of the process, existing process documents or files the user provides
- Where available, the records in this Brezel system (find them with the entity tools) and cases and work items to measure real throughput, waiting times and rework
- Ask the user for missing steps, owners and timings

## Analysis Framework

### 1. Map Current State
- Document every step, decision point, and handoff
- Identify who does what and how long each step takes
- Note manual steps, approvals, and waiting times

### 2. Identify Waste
- **Waiting**: Time spent in queues or waiting for approvals
- **Rework**: Steps that fail and need to be redone
- **Handoffs**: Each handoff is a potential point of failure or delay
- **Over-processing**: Steps that add no value
- **Manual work**: Tasks that could be automated (e.g. with Brezel workflows or an AI employee)

### 3. Design Future State
- Eliminate unnecessary steps
- Automate where possible
- Reduce handoffs
- Parallelize independent steps
- Add checkpoints (not gates)

### 4. Measure Impact
- Time saved per cycle
- Error rate reduction
- Cost savings
- Employee satisfaction improvement

## Output

Produce a before/after process comparison with specific improvement recommendations, estimated impact, and an implementation plan.
