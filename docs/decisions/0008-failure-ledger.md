---
number: 0008
title: Failure ledger and the self-improvement loop
date: 2026-06-13
status: accepted
---

## Context

Recurring gate/authoring failures waste tokens and iterations — e.g. six identical
`@typescript-eslint/method-signature-style` errors while writing one interface file. The gate
caught them (it worked), but the agent paid to write it wrong and fix it. Tracking recurring
failures lets us prevent the pattern once instead of re-paying for it, walking toward a
self-improving codebase.

## Decision

Maintain a **failure ledger** of recurring gate/authoring violations and act on recurrence via a
**capture → count → act** loop.

- **Scope:** gate/authoring violations (lint, type, dependency-cruiser). _Test_ failures are out
  of scope — those are fixed and covered by a regression test, not logged.
- **Act via a prevention hierarchy:** (1) a deterministic rule (lint / dependency-cruiser) is best
  — it can't recur; (2) else terse on-demand guidance in `docs/gotchas.md`; (3) a line in
  `CLAUDE.md` only when frequency justifies its standing (always-loaded) token cost.
- **Now:** `docs/gotchas.md` is maintained by hand when a pattern recurs (human-paced; n is small).
- **Later (factory era):** the autonomous worker's `Stop`-hook appends structured failure events;
  an analysis agent counts recurrences and proposes promotions. The ledger then doubles as a
  Braintrust eval dataset for the coding agents.

## Consequences

- Repeated, preventable failures get designed out; token waste drops.
- The value lives in the _act_ step — without periodic review/automation the ledger is write-only,
  so automation is the factory-era requirement, not optional polish.
- The prevention hierarchy protects `CLAUDE.md` from bloat (the thing we keep lean).

## Alternatives rejected

- **A `/failed` directory of failing source files:** they rot, pollute the import graph, and trip
  the gate themselves; the failing code is not the useful unit — a structured record is.
- **Promote every gotcha to `CLAUDE.md`:** bloats always-loaded context — the opposite of the goal.
- **Do nothing:** keep re-paying for the same failures.
