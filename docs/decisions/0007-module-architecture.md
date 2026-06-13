---
number: 0007
title: Module architecture — feature domains × layers
date: 2026-06-13
status: accepted
---

## Context

[ADR 0001](0001-hexagonal-architecture.md) set hexagonal layering but not the **module
structure** the whole codebase scales by. Before the first slice sets an accidental precedent
(every domain and every agent copies the first one), we define the rulebook the boundary gate
([ADR 0004](0004-dependency-cruiser-boundaries.md)) enforces. Two distinct axes were being
conflated: **feature domains** (vertical — `habits`, `auth`) and **architectural layers**
(horizontal — including the server/client split and shared kernels).

## Decision

Organize **feature-domain-first, with layers inside** — not by technical type.

- Feature domains live at `src/domains/<domain>/` with layers `domain/` (pure), `application/`
  (use cases + outbound port interfaces), `adapters/inbound|outbound/` (server), and `ui/`
  (client), exposing a public API via `index.ts`.
- Cross-cutting: `src/shared/` (pure, domain-agnostic kernel — the core MAY import it) and
  `src/lib/` (infrastructure/framework glue — server; the core may NOT import it). `src/routes/`
  stays thin; `src/components/` holds generic app UI.
- **Dependencies point inward.** The full allowed-import table, the server/client rule, the
  public-API-per-domain rule (no deep cross-domain imports), and no-cycles/no-orphans are
  specified in [`docs/architecture.md`](../architecture.md).
- The boundary gate (dependency-cruiser) encodes these rules; it is configured when the first
  domain lands (the habit-core slice).
- New code uses the `@/` alias; domain-scoped aliases (`@habits/*`) are deferred.

## Consequences

- A domain is self-contained and agent-ownable — an agent can hold one slice without touching
  others, which is the whole point of the factory.
- Feature-first beats technical silos for navigability and isolation; the server/client boundary
  and cross-domain coupling become machine-checkable.
- More folders per domain than a flat layout; accepted for boundary clarity.
- Composition (wiring concrete adapters into use cases) lives in inbound adapters, keeping the
  core pure.

## Alternatives rejected

- **Technical-type top-level split** (`client/`, `server/`, `lib/`, `utils/`): scatters one
  feature across folders; fights domain ownership and agent isolation.
- **Flat domain folders** (no layer subfolders): the boundary becomes implicit and unenforceable.
- **No public-API barrel** (free deep imports): couples domains to each other's internals.
