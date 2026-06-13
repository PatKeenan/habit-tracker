---
number: 0003
title: Single persistence adapter — Drizzle over the Neon serverless driver
date: 2026-06-13
status: accepted
---

## Context

The CLI starter shipped _two_ database clients: a raw-SQL Neon client (`src/db.ts`, used by
the neon demo) and Drizzle over `node-postgres`/`pg` (`src/db/index.ts`, used by the drizzle
demo). They overlap, disagree, and would force every future repository to pick one. The
deployment target (Neon serverless on Railway) favors a connection model suited to
serverless rather than a long-lived TCP pool.

## Decision

Standardize on **Drizzle ORM over the Neon serverless driver** (`@neondatabase/serverless`)
as the single persistence technology. Delete the raw-SQL path (`src/db.ts`). Per
[ADR 0001](0001-hexagonal-architecture.md), Drizzle lives only in **outbound adapters** —
repositories that implement core-owned ports and map rows to domain types. Drizzle and its
types never appear in the domain core.

Implementation note (not load-bearing for this decision): default to the HTTP driver
(`drizzle-orm/neon-http`) for simple, one-shot queries; switch a given repository to the
WebSocket `Pool` driver (`drizzle-orm/neon-serverless`) if and when it needs interactive
multi-statement transactions.

## Consequences

- One ORM, one type system, type-safe queries; works cleanly on serverless/Neon.
- Repository adapters do the row→domain mapping, keeping the core ORM-free.
- The `pg` / `@types/pg` dependency becomes removable once the raw path is gone.

## Alternatives rejected

- **Raw SQL via the Neon client:** no type safety, manual mapping, duplicates the ORM.
- **Drizzle over `node-postgres` (`pg`):** needs a persistent TCP pool, a poorer fit for
  Neon serverless than the HTTP/WebSocket serverless driver.
