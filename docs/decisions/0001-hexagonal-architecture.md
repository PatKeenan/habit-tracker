---
number: 0001
title: Hexagonal architecture with a pure, testable domain core
date: 2026-06-13
status: accepted
---

## Context

The codebase must scale under largely autonomous AI agents and remain provably testable —
testability is the project's primary constraint, because business-logic correctness will
be verified by evals and unit tests. The CLI-generated demos fuse persistence, transport,
business logic, and presentation into single files (e.g. `src/routes/demo/drizzle.tsx`
imports the DB, defines server functions, and renders UI). Replicated at scale that is
untestable and impossible to assign cleanly to a single domain owner.

## Decision

Adopt hexagonal (ports & adapters) architecture:

- A **domain core** of pure logic and types — no framework, ORM, clock, or I/O imports.
- **Inbound ports** (use cases) the outside calls; **outbound ports** (e.g. repository,
  clock, notifier) the core depends on as interfaces it owns.
- **Adapters** at the edges: TanStack `createServerFn` / routes (driving), Drizzle repos
  and Better Auth (driven). Dependencies point inward only.
- The core is exercised in tests with in-memory fakes — zero database, zero framework.

## Consequences

- Easy: unit-testing logic, swapping persistence/transport, isolating domains for agents.
- Cost: more indirection and explicit mapping between ORM/request types and domain types
  than a route-centric demo. Accepted deliberately.
- Enforcement (typecheck, dependency-boundary lint, tests) is required so agents can't
  erode the boundaries; the specific lint tooling is a later decision.

## Alternatives rejected

- **Route-centric (the demo pattern):** fastest to write, but untestable without I/O and
  collapses all layers — fails the project's core constraint.
- **Service layer without ports:** better, but without inversion the core still reaches
  out to concrete infra, keeping tests I/O-bound.
