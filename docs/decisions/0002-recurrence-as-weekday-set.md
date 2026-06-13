---
number: 0002
title: Model habit recurrence as a set of specific weekdays
date: 2026-06-13
status: accepted
---

## Context

Habits recur on a schedule the dashboard uses to decide what is due "today." User-facing
options include every day, every other day, twice a week, and monthly. Two underlying
models were possible: specific weekdays ("Mon & Thu") vs. a frequency count ("any 2
days/week").

## Decision

The domain models recurrence as a **set of specific weekdays** (e.g. `{Mon, Thu}`).
`isDueToday(habit, now)` is then a pure, deterministic membership check against the day of
week in the user's local timezone (the current time is supplied via an injected clock —
see [0001](0001-hexagonal-architecture.md)).

User-facing conveniences like "every day" or "every other day" are **UI-layer presets**
that simply select the appropriate weekday set; the core only ever sees the resolved set.

## Consequences

- Easy: `isDueToday` is deterministic and trivially eval-/unit-testable — no period state.
- Easy: "did I do it today" and daily scoring don't depend on rolling-window bookkeeping.
- Cost: true frequency semantics ("any 2 days this week, your choice") are not supported.
  Acceptable for the shell; revisit with a superseding ADR if needed.

## Alternatives rejected

- **Frequency-count model:** "due" depends on how many completions already happened this
  period — more stateful, harder to test, and more than the shell needs.
