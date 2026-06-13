---
title: Habit Core — First Vertical Slice
date: 2026-06-13
status: draft
author: Pat Keenan
related:
  - ../approved/2026-06-13-foundation-and-architecture.md
  - ../../docs/decisions/0001-hexagonal-architecture.md
  - ../../docs/decisions/0002-recurrence-as-weekday-set.md
  - ../../docs/decisions/0003-single-drizzle-neon-adapter.md
  - ../../docs/decisions/0004-dependency-cruiser-boundaries.md
domains: []
---

# Habit Core — First Vertical Slice

## Context

The first product code, and the first end-to-end run of the planning pipeline. It establishes
the **golden-path hexagonal structure** every later domain copies, and the first registered
domain (`habits`). It also turns on the **dependency-cruiser boundary gate**, which the
foundation plan deferred until the first domain landed.

## Guiding invariants

See `CLAUDE.md` and [ADR 0001](../../docs/decisions/0001-hexagonal-architecture.md): pure core
(no framework/ORM/clock/`Date`), dependencies point inward, core owns its types, readability
over cleverness.

## Prior art / Current state (from grounding)

- **Greenfield for habits** — no habit/recurrence/scoring/timer/completion code exists.
- **No hexagonal structure yet** — route-centric; server functions live inline in routes
  (e.g. `src/routes/demo/drizzle.tsx:7-22`). This slice creates the first `src/domains/`.
- **DB:** two clients exist — `src/db.ts` (raw Neon) and `src/db/index.ts:1-5` (Drizzle);
  schema is only a `todos` table (`src/db/schema.ts:1-7`). Drizzle is wired via
  `drizzle.config.ts`. Per ADR 0003 the raw path is to be removed.
- **Server-fn pattern to reuse:** `createServerFn({method}).validator(...).handler(...)`
  (`src/routes/demo/drizzle.tsx:7-22`), called from route `loader`s and invalidated with
  `router.invalidate()`.
- **Alias:** all current imports use `#/` (e.g. `src/routes/demo/drizzle.tsx:3`); `@/` is
  configured but unused. Our decision is `@/` going forward.

## Locked decisions

- **Structure:** first domain at `src/domains/habits/` with `domain/` (pure),
  `application/` (use-case + port interfaces), `adapters/inbound|outbound/`. Routes stay thin.
- **Domain model** ([ADR 0002](../../docs/decisions/0002-recurrence-as-weekday-set.md)):
  `Weekday` union + a weekday set on `Habit`; `isDueToday(habit, now)` is a deterministic
  membership check. `dailyScore(dueHabits, completions)` is plain `completed / due-today`.
- **Ports owned by the core:** `HabitRepository`, `Clock`, `Notifier` (interfaces only).
- **Clock injected; day boundary in the user's local timezone.** No `Date.now()` in the core.
- **Persistence** ([ADR 0003](../../docs/decisions/0003-single-drizzle-neon-adapter.md)):
  Drizzle over the Neon serverless driver; the Drizzle `HabitRepository` maps rows ↔ domain
  types at the boundary. No ORM types in the core.
- **New code uses the `@/` alias.** Migrating existing `#/` demo imports is out of scope here.
- **Boundary gate** ([ADR 0004](../../docs/decisions/0004-dependency-cruiser-boundaries.md)):
  add `.dependency-cruiser.js` (core-stays-pure, no-cross-domain, no-server-in-client,
  no-circular) and wire it into `pnpm validate`.
- **Register `habits`** in `docs/domains.md`.
- **Tests:** unit tests over the pure core with `FakeClock` + an in-memory repository, zero I/O.

## Open decisions (need the user's call)

1. **Phasing.** Land in two phases (recommended):
   - **Phase 1 — pure core + gate:** `src/domains/habits/domain/` (types, `isDueToday`,
     `dailyScore`), the port interfaces, unit tests, dependency-cruiser wired in, `habits`
     registered. Fully testable, zero I/O; commit.
   - **Phase 2 — end-to-end:** application use cases, Drizzle `HabitRepository`, `createServerFn`
     driving adapters, a thin dashboard route, DB schema + migration; commit.

   Recommendation: **phased** — Phase 1 is the high-value, eval-able seed and lands fast and
   green; Phase 2 completes the vertical slice. Alternative: build the whole slice in one pass.

2. **Folder layout naming.** `src/domains/habits/{domain,application,adapters}` (recommended,
   matches the foundation plan's emerging shape) vs. a flatter `src/domains/habits/` with files.
   Recommendation: the three-layer folders, so the boundary is physically obvious to agents.

## Observed conventions

- Existing code universally uses the `#/` alias though `@/` is the decided standard — new code
  follows the decision; a full migration is a separate task (noted, not done here).
- The two-DB-client situation (raw + Drizzle) is the cleanup ADR 0003 mandates; Phase 2 uses
  only Drizzle and does not touch the raw path beyond what the demos need.

## What we're NOT doing

- No PWA/service-worker, no real background notifications (the `Notifier` is a stub port).
- No timed-session UI, no scoring beyond the plain ratio, no streaks/weighting.
- No removal of the demo routes or `src/db.ts` (load-bearing scaffolding; replaced later).
- No `#/` → `@/` migration of existing files.
- No Braintrust evals yet (the pure functions are written to be eval-able; evals come later).

## Sequencing

**Phase 1 — pure core + boundary gate**

1. `src/domains/habits/domain/` — `Weekday`, `Habit`, `HabitCompletion`, `Category`; pure
   `isDueToday(habit, now)` and `dailyScore(dueHabits, completions)`.
2. `src/domains/habits/application/ports.ts` — `HabitRepository`, `Clock`, `Notifier` interfaces.
3. Test doubles + unit tests: `FakeClock`, in-memory repo, `*.test.ts` covering weekday
   membership (incl. timezone day-boundary) and scoring edge cases (0 due, all done, none done).
4. Add dependency-cruiser + `.dependency-cruiser.js`; add `depcruise` to `pnpm validate`.
5. Register `habits` in `docs/domains.md`.
   - **Automated verification:** `pnpm validate` green (typecheck + lint + dep-cruiser + tests).
   - **Manual verification:** none (pure logic).

**Phase 2 — end-to-end vertical slice**

6. `application/` use cases: `createHabit`, `listTodaysHabits`, `completeHabit`,
   `startTimedSession` / `completeTimedSession`.
7. `adapters/outbound/` — Drizzle `HabitRepository` + `SystemClock` + stub `Notifier`; add the
   habits + completions schema and a migration.
8. `adapters/inbound/` — a `createServerFn` per use case.
9. A thin dashboard route rendering today's habits + score.
   - **Automated verification:** `pnpm validate` green.
   - **Manual verification:** run the app; create a habit, see it on the dashboard for its
     weekday, check it off, see the score update.

## Out of scope

- The factory, evals, and anything in "What we're NOT doing" above.
