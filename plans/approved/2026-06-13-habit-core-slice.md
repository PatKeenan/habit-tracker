---
title: Habit Core — First Vertical Slice
date: 2026-06-13
status: approved
author: Pat Keenan
related:
  - ../approved/2026-06-13-foundation-and-architecture.md
  - ../approved/2026-06-13-module-architecture.md
  - ../../docs/decisions/0001-hexagonal-architecture.md
  - ../../docs/decisions/0002-recurrence-as-weekday-set.md
  - ../../docs/decisions/0003-single-drizzle-neon-adapter.md
  - ../../docs/decisions/0004-dependency-cruiser-boundaries.md
  - ../../docs/decisions/0007-module-architecture.md
domains: [habits]
---

# Habit Core — First Vertical Slice

## Context

The first product code, and the first end-to-end run of the planning pipeline. It establishes
the golden-path structure ([ADR 0007](../../docs/decisions/0007-module-architecture.md) /
[`docs/architecture.md`](../../docs/architecture.md)) every later domain copies, and the first
registered domain (`habits`). It also turns on the dependency-cruiser boundary gate.

No new ADR — this slice _instantiates_ existing decisions (ADRs 0001–0004, 0007).

## Guiding invariants

See `CLAUDE.md` and [ADR 0001](../../docs/decisions/0001-hexagonal-architecture.md): pure core
(no framework/ORM/clock/`Date`), dependencies point inward, core owns its types, readability first.

## Prior art / Current state (from grounding)

- **Greenfield for habits** — no habit/recurrence/scoring/timer/completion code exists.
- **No hexagonal structure yet** — route-centric; server functions inline in routes
  (`src/routes/demo/drizzle.tsx:7-22`). This slice creates the first `src/domains/`.
- DB: two clients (`src/db.ts` raw, `src/db/index.ts:1-5` drizzle); schema only `todos`
  (`src/db/schema.ts:1-7`). Per ADR 0003 the raw path is removed (in Phase 2 / later).
- Server-fn pattern to reuse: `createServerFn().validator().handler()`.
- All current imports use `#/`; new code uses `@/`.

## Locked decisions

- **Structure per [ADR 0007](../../docs/decisions/0007-module-architecture.md):**
  `src/domains/habits/{domain, application, adapters/inbound|outbound, ui}` + `index.ts` public API.
- **Domain model** ([ADR 0002](../../docs/decisions/0002-recurrence-as-weekday-set.md)):
  `Weekday` set on `Habit`; `isDueToday(habit, today)` is deterministic weekday membership.
  `dailyScore(...)` is plain `completed / due`.
- **Timezone in the adapter, not the core.** The `Clock` port supplies the current local day
  (`Today = { date, weekday }`); the core never touches `Date`. The adapter resolves the tz.
- **Ports owned by the core:** `HabitRepository`, `Clock`, `Notifier` (interfaces only).
- **Persistence** ([ADR 0003](../../docs/decisions/0003-single-drizzle-neon-adapter.md)):
  Drizzle/Neon `HabitRepository` maps rows ↔ domain types (Phase 2).
- **New code uses `@/`; within-domain imports may be relative.**
- **Boundary gate** ([ADR 0004](../../docs/decisions/0004-dependency-cruiser-boundaries.md)):
  add `.dependency-cruiser.js` encoding ADR 0007 and wire `depcruise` into `pnpm validate`.
- **Tests:** pure-core unit tests with plain value inputs, zero I/O.

## What we're NOT doing

- No PWA/service-worker, no real notifications (the `Notifier` is a stub port).
- No timed-session UI, no streaks/weighting.
- No removal of the demos / `src/db.ts` (scaffolding, replaced later).
- No `#/` → `@/` migration of existing files. No Braintrust evals yet.

## Sequencing

**Phase 1 — pure core + boundary gate.** Split into two committable units:

- **1a — pure domain core:** `src/domains/habits/domain/` (`types`, `schedule` with
  `isDueToday`/`habitsDueToday`, `score` with `dailyScore`), `application/ports.ts`
  (`HabitRepository`, `Clock`, `Notifier`), `index.ts` public API, unit tests, and register
  `habits` in `docs/domains.md`.
  - **Automated:** `pnpm validate` green. **Manual:** none (pure logic).
- **1b — boundary gate:** install dependency-cruiser, write `.dependency-cruiser.js` per
  ADR 0007, wire `depcruise` into `pnpm validate`; confirm the new domain passes the rules.
  - **Automated:** `pnpm validate` (incl. depcruise) green. **Manual:** none.

**Phase 2 — end-to-end.** Use cases (`createHabit`, `listTodaysHabits`, `completeHabit`,
`startTimedSession`/`completeTimedSession`); test doubles (`FakeClock`, in-memory repo);
Drizzle `HabitRepository` + `SystemClock` + stub `Notifier`; `createServerFn` inbound adapters;
a thin dashboard route; habits/completions schema + migration.

- **Automated:** `pnpm validate` green. **Manual:** run the app — create a habit, see it on the
  dashboard for its weekday, check it off, watch the score update.

## Out of scope

- The factory, evals, and anything under "What we're NOT doing".
