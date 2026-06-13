---
title: Module Architecture — Feature Domains × Layers
date: 2026-06-13
status: approved
author: Pat Keenan
related:
  - ../approved/2026-06-13-foundation-and-architecture.md
  - ../../docs/decisions/0001-hexagonal-architecture.md
  - ../../docs/decisions/0004-dependency-cruiser-boundaries.md
  - ../../docs/decisions/0007-module-architecture.md
domains: []
---

# Module Architecture — Feature Domains × Layers

## Context

[ADR 0001](../../docs/decisions/0001-hexagonal-architecture.md) established hexagonal layering
but not the **module structure** the whole codebase scales by. Before the first slice sets an
accidental precedent (every domain and every agent copies the first one), we define the
rulebook the boundary gate ([ADR 0004](../../docs/decisions/0004-dependency-cruiser-boundaries.md))
enforces. This produces a decision (ADR) + a canonical reference doc; the habit-core slice is
its first instantiation.

## Guiding invariants

See `CLAUDE.md` and ADR 0001. Dependencies point inward; the core is pure; readability first.

## Prior art / Current state (from grounding, this session)

- **Route-centric, greenfield** — server functions live inline in routes
  (`src/routes/demo/drizzle.tsx:7-22`); no `domain/application/adapters` structure exists.
- Existing buckets: `src/components/` (Header/Footer), `src/lib/` (auth, db client, env, utils),
  `src/integrations/`, `src/routes/`, `src/db/`.
- All imports use `#/`; `@/` is the decided standard going forward.

## The two axes

- **Feature domains** (vertical): `src/domains/<domain>/` — business capability slices.
- **Architectural layers** (horizontal): `domain → application → adapters`, plus the
  cross-cutting **server/client** boundary and **shared kernels**.

Boundary checks must enforce both: domains don't reach into each other's internals, and the
layer/server-client rules hold.

## Locked decisions

The full structure, dependency-rule table, and cross-cutting rules are recorded in
[ADR 0007](../../docs/decisions/0007-module-architecture.md) and the canonical reference
[`docs/architecture.md`](../../docs/architecture.md). In summary:

- **Directory structure:** `src/domains/<d>/{domain, application, adapters/inbound|outbound, ui}`
  with an `index.ts` public API; cross-cutting `src/shared/` (pure kernel) and `src/lib/` (infra);
  thin `src/routes/`; generic `src/components/`.
- **Dependencies point inward** per the rule table: the core imports only `domain` + `shared`;
  never ORM/framework/`lib`. `ui` (client) never imports `adapters/outbound`, `lib/db`,
  `lib/auth`, or `*.server.ts`.
- **Server/client boundary** is a rule (enforced), not a top-level folder silo. Inbound adapters
  (`createServerFn`) are the sanctioned bridge.
- **Public API per domain** (`index.ts`); deep cross-domain imports forbidden (Decision 3 — on).
- **Shared kernel two-tier** (Decision 2): `src/shared/` (pure; core may import) vs. `src/lib/`
  (infra; core may not).
- **Domain UI inside the domain** (`domains/<d>/ui/`), composed by thin routes (Decision 1).
- **Composition** (wiring concrete adapters into use cases) happens in inbound adapters.
- **`@/` alias** for new code; **domain-scoped aliases (`@habits/*`) deferred** until 2–3 domains
  justify the churn.

## Observed conventions

- Current code uses `#/` though `@/` is decided; new code follows `@/` (full migration is separate).
- The route-centric demos are the anti-pattern this structure replaces; they stay as scaffolding.

## Deliverables

- ~~ADR 0007~~ Done ([ADR 0007](../../docs/decisions/0007-module-architecture.md)).
- ~~`docs/architecture.md`~~ Done (canonical reference).
- ~~`CLAUDE.md` pointer~~ Done.
- ~~`docs/domains.md` reference to architecture.md~~ Done.
- The `.dependency-cruiser.js` config encoding these rules is implemented in the **habit-core
  slice** (its first instantiation), not here.

## What we're NOT doing

- Not refactoring the existing demos/`src/db.ts` into this structure (scaffolding, replaced later).
- Not defining any domain beyond what the habit-core slice needs.
- Not writing the dependency-cruiser config here (the slice does, per ADR 0007).

## Sequencing

1. ~~Resolve the open decision (aliases).~~ Done — domain-scoped aliases deferred.
2. ~~`/approve-plan` → ADR 0007 + `docs/architecture.md` + CLAUDE.md pointer + domains.md update.~~ Done.
3. Proceed to the habit-core slice, which instantiates this (folders + dependency-cruiser config).
