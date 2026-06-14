---
number: 0009
title: Plan completeness — dependency tracing, assumption verification, and a critic pass
date: 2026-06-13
status: accepted
---

## Context

The habit-core slice planned the habit mechanics thoroughly but missed that a habit must belong
to a user — and that Better Auth was not actually persisting users (it was assumed wired). The
grounding ([ADR 0006](0006-grounded-planning-research-subagents.md)) verified what _exists_ within
the domain but not what the feature _depends on_ or _assumes_. The gap surfaced at migration time
instead of planning time.

## Decision

Extend grounded planning with explicit completeness checks (this augments, not supersedes,
ADR 0006):

- **Two new plan-template sections.** "Data model & relationships" — every persisted entity's
  references accounted for ("where does this id come from?"). "Assumptions to verify (not assume)"
  — every dependency listed with how it was verified against the codebase.
- **Dependency-scoped grounding.** Research traces what the feature depends on / relates to
  (auth, ownership, shared entities) and verifies it is real and functional — not assumed.
- **A `plan-critic` subagent** (read-only) adversarially reviews the draft for unaccounted
  relationships, ownership/auth, assumed-but-unverified dependencies, and lifecycle/edge cases,
  before the draft is handed to the user. `/approve-plan` does a final completeness re-check.

The throughline: **verify, don't assume** — assumptions are where the gaps hide.

## Consequences

- Cross-cutting prerequisites (identity, ownership, relations) are surfaced at planning time.
- Slightly more effort per draft — cheap relative to discovering the gap mid-build.
- The `plan-critic` is a reusable factory component (the orchestrator can critique its own plans).

## Alternatives rejected

- **Rely on reviewer vigilance:** the exact failure mode that missed the user domain.
- **Fix it only in this slice:** doesn't prevent the next miss.
