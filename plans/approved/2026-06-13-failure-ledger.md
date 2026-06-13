---
title: Failure Ledger & the Self-Improvement Loop
date: 2026-06-13
status: approved
author: Pat Keenan
related:
  - ../approved/2026-06-13-engineering-standards-and-work-ritual.md
  - ../../docs/decisions/0008-failure-ledger.md
domains: []
---

# Failure Ledger & the Self-Improvement Loop

## Context

Recurring gate/authoring failures (e.g. 6 identical `method-signature-style` errors while writing
`ports.ts`) waste tokens and iterations. Tracking them lets the codebase self-improve: detect a
recurring failure, prevent it once, stop paying for it. (Grounding scaled down — this is a process
plan, not code; prior art: the method-signature incident + ADR 0005 enforcement + `docs/conventions`.)

## Locked decisions

- **Two failure types, treated differently:** test failures → fix + keep a regression test (never
  logged); gate/authoring violations → logged as telemetry.
- **The loop is capture → count → act.** The value is in _act_; a write-only log is useless.
- **Prevention hierarchy:** (1) a deterministic rule (lint/dep-cruiser) > (2) terse on-demand
  guidance in `docs/gotchas.md` > (3) a line in `CLAUDE.md` — and (3) only when frequency justifies
  the standing token cost (don't bloat always-loaded context).
- **Now (human-paced):** seed and maintain `docs/gotchas.md` by hand when a pattern recurs.
- **Later (factory era):** automate — the worker `Stop`-hook appends structured failure events; an
  analysis agent counts recurrences and proposes promotions. The ledger doubles as a Braintrust
  eval dataset for the coding agents.

## What we're NOT doing

- No `/failed` directory of failing source files (they rot, pollute the import graph, and aren't
  the useful unit — a structured ledger entry is).
- No automated telemetry yet (n=1; build it in the factory where failures accrue at volume).
- No promoting every gotcha to `CLAUDE.md`.

## Deliverables

- ~~ADR 0008~~ Done ([ADR 0008](../../docs/decisions/0008-failure-ledger.md)).
- ~~`docs/gotchas.md` seeded with the first entry~~ Done.
- ~~A `CLAUDE.md` pointer to gotchas~~ Done.

## Sequencing

1. ~~`/approve-plan` → ADR 0008 + seed `docs/gotchas.md` + `CLAUDE.md` pointer.~~ Done.
2. (Factory plan) automate capture + analysis; wire the ledger into the coding-agent evals.
