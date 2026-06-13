---
title: Foundation & Architecture
date: 2026-06-13
status: approved
author: Pat Keenan
related:
  - ../../docs/decisions/0001-hexagonal-architecture.md
  - ../../docs/decisions/0002-recurrence-as-weekday-set.md
  - ../../docs/decisions/0003-single-drizzle-neon-adapter.md
  - ../../docs/decisions/0004-dependency-cruiser-boundaries.md
---

# Foundation & Architecture

## Context

`habit-tracker` is a mobile-first PWA habit tracker built on the TanStack Start CLI starter
(TanStack Start + React 19, Drizzle, Neon Postgres, Better Auth, Sentry, Vitest). It is
intentionally a **shell**, not a feature-rich app: it backs a blog series about **agent
evals**, and it is the first product of an eventual **AI software factory** (triage agent →
Linear → orchestrator → domain-scoped coding agents → validation gate).

Two things therefore matter more than features:

1. **Testability** — the project's hard constraint. Logic correctness is verified by evals
   and unit tests, so logic must be testable without I/O.
2. **Enforceable boundaries** — so autonomous agents can own domains without colliding.

The factory is explicitly **out of scope for this plan** (separate future plan). It has
nothing to orchestrate until the product has a golden-path pattern and a working validation
gate to enforce.

## Guiding invariants

See [ADR 0001](../../docs/decisions/0001-hexagonal-architecture.md) and `CLAUDE.md`. In
short: readability over cleverness; pure domain core; dependencies point inward; core owns
its types; server/client boundary is real and enforced by tooling.

## Locked decisions

- **Architecture:** hexagonal / ports & adapters ([ADR 0001](../../docs/decisions/0001-hexagonal-architecture.md)).
- **Recurrence:** set of specific weekdays; "every day / every other day" are UI presets
  ([ADR 0002](../../docs/decisions/0002-recurrence-as-weekday-set.md)).
- **Persistence:** single adapter — Drizzle over the Neon serverless driver; raw-SQL
  `src/db.ts` deleted ([ADR 0003](../../docs/decisions/0003-single-drizzle-neon-adapter.md)).
- **Boundary enforcement:** dependency-cruiser as the authoritative gate
  ([ADR 0004](../../docs/decisions/0004-dependency-cruiser-boundaries.md)).
- **Path alias:** standardize on `@/*` (bundler-resolved via tsconfig paths + Vite). The
  package.json `#/*` subpath entry becomes dead and existing `#/` imports migrate to `@/`.
  Domain-scoped aliases (`@habits/*`, …) to follow once domains exist.
- **Daily score:** plain `completed / due-today` for the shell — no weighting or streak
  bonus.
- **Timed habits:** in-app timer now; a `Notifier` outbound port stubs real background
  notifications (PWA service-worker push deferred; flaky on iOS PWAs).
- **Day boundary:** the user's local timezone; the current time is supplied via an injected
  `Clock` port so day-rollover logic is deterministic in tests.
- **Auth:** Better Auth (already wired) gates per-user habit data.
- **Docs model:** thin `CLAUDE.md` (invariants + pointers), ADRs for decisions, dated plans.

## Architecture (emerging — not yet committed to folders)

Structure will emerge from the first slice rather than being pre-defined. The expected
shape per domain:

```
domain/        pure entities + rules (no framework / ORM / clock / Date)
application/   inbound ports (use cases) + outbound port interfaces
adapters/
  inbound/     createServerFn / route handlers (driving)
  outbound/    Drizzle repositories, Notifier, Clock impls (driven)
routes/        thin: call a use case, render. No DB, no business logic.
```

## First vertical slice — the habit core (golden path)

Goal: one end-to-end slice that becomes the template every later domain copies.

Pure core (no I/O):

- Domain types: `Habit` (title, category, weekday set, optional timed duration), `Weekday`,
  `HabitCompletion`.
- `isDueToday(habit, now)` — deterministic weekday membership.
- `dailyScore(dueHabits, completions)` — plain ratio.
- Ports: `HabitRepository`, `Clock`, `Notifier` (interfaces owned by the core).

Use cases (inbound ports): `createHabit`, `listTodaysHabits`, `completeHabit`,
`startTimedSession` / `completeTimedSession`.

Adapters: a `createServerFn` driving adapter per use case; a Drizzle `HabitRepository`;
`SystemClock` / `FakeClock`; a stub `Notifier`. A thin dashboard route renders today's
habits + score.

Tests: unit tests over the pure core with `FakeClock` + an in-memory repository — zero DB.

## Validation gate (deterministic + non-deterministic)

The standard a change (and later, a factory PR) must pass:

1. `typecheck`
2. boundary lint via dependency-cruiser (domains don't cross; server-only not imported into
   client; no cycles)
3. unit tests (pure core + use cases with fakes)
4. Braintrust evals over the pure functions (synthetic data) — non-deterministic quality bar

## Sequencing

1. ~~Confirm the open decisions.~~ Done — see Locked decisions (ADRs 0003–0004 + alias).
2. Build the first vertical slice (habit core → use cases → adapters → dashboard route).
3. Add deterministic guardrails: collapse to the single Drizzle/Neon adapter, migrate the
   `@/*` alias, add server env validation, wire dependency-cruiser, add a `validate` script.
4. Wire Braintrust + a synthetic-data harness; write the first eval against the core.
5. Write the first domain agent markdown files, pinned to the structure that emerged.
6. (Separate plan) The factory: durable orchestration, Linear ingestion, worker agents.

## Out of scope

- The software factory (triage / orchestrator / workers / admin UI, durable execution,
  Linear). Tracked separately; depends on this plan landing first. Key known constraint: a
  Claude Code port of OpenAI's Symphony loses the Elixir/OTP supervision that provided
  Symphony's durability, so durability must be re-supplied (likely the Claude Agent SDK + a
  TS durable engine + Linear-as-state-store reconciliation). Researched 2026-06-13. The
  factory kickoff brief lives in `plans/drafts/2026-06-13-factory-kickoff.md`.
