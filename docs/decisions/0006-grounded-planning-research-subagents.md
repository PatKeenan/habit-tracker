---
number: 0006
title: Grounded planning via read-only research subagents
date: 2026-06-13
status: accepted
---

## Context

A zero-memory agent will recreate things that already exist — a type, a route, a util —
because nothing made it look first. Duplication and contradiction of prior decisions are the
default failure mode. The fix is to establish _what already exists_ before deciding _what to
build_ — discovery, not instruction. This mirrors HumanLayer's proven research → plan →
implement methodology (read-only research subagents, dispatched in parallel, returning
compacted `file:line` summaries). Researched 2026-06-13 from primary sources.

## Decision

`/draft-plan` grounds itself before writing a draft by dispatching **read-only research
subagents** in parallel and synthesizing their findings:

- **Custom subagents** in `.claude/agents/`, read-only **by tool whitelist** (no
  Edit/Write/Bash), with a "documentarian, not critic" directive and a compacted `file:line`
  return contract. They may compose Claude Code's built-in read-only agents internally.
- Start with three: **`codebase-locator`** (where code lives), **`codebase-pattern-finder`**
  (existing patterns/types to reuse — the duplication-killer), and **`decisions-locator`**
  (our ADRs, conventions, and plans). Add **`codebase-analyzer`** (deep `file:line` traces)
  on first need.
- **Scaled:** grounding is skipped for trivial work and run for anything touching code.
- **Plan template** gains: Prior art / Current state, Observed conventions, What we're NOT
  doing, and per-phase Automated vs. Manual verification.
- **Conventions loop:** `/approve-plan` does a light duplication re-check and promotes
  "Observed conventions" into `docs/conventions/` or an ADR.
- Research **embeds as plan sections** for now; a separate research corpus is deferred.

## Consequences

- Less duplicated/contradictory work; plans align to existing conventions.
- The subagents are reusable **factory components** — the orchestrator will use them to ground
  a Linear ticket before dispatching a worker.
- Complements dependency-cruiser: pattern-finding stops duplication _before_ writing; dep-
  cruiser stops boundary violations _after_.
- Grounding adds latency to drafting; the "scaled" rule limits it to work that needs it.
- The subagents are additional artifacts to maintain.

## Alternatives rejected

- **Built-in `Explore` only:** works, but isn't a pinned, reusable factory asset with tuned
  read-only prompts.
- **No grounding / guidance only:** agents skip guidance and duplicate work — the failure mode
  we are designing against.
- **A separate `thoughts/` research corpus:** more artifacts than this scale needs; embed in
  the plan instead.
