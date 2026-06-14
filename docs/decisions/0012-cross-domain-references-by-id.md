---
number: 0012
title: Cross-domain references are by id, with no database foreign key
date: 2026-06-13
status: accepted
---

## Context

Habits are scoped to a user: `habits.userId` and `habit_completions.userId` are `text`
columns, and `user.id` (Better Auth-owned) is also a `text` primary key. The two sit in
different contexts — habits is a feature domain ([ADR 0007](0007-module-architecture.md)),
identity is infrastructure ([ADR 0010](0010-identity-is-infrastructure.md)). The question is
how one context should reference an entity owned by another: with a database foreign key and
a cross-context Drizzle relation, or by id alone.

A DB-level FK from `habits.userId` to `user.id` would couple the habits schema to Better
Auth's generated table, and a cross-context Drizzle `relations()` declaration would make one
domain's schema import another's — eroding the decoupling [ADR 0007](0007-module-architecture.md)
exists to protect.

## Decision

Contexts reference each other's entities **by id only**. `habits.userId` holds a `user.id`
value (`text` ↔ `text`) with **no database foreign key** and **no cross-context Drizzle
relation**. Foreign keys and `relations()` are used only _within_ a context (e.g.
`session`/`account` → `user` inside Better Auth; `habit_completions` → `habits` inside the
habits domain).

## Consequences

- Domains stay independently migratable and reasoned-about; the habits schema does not import
  or depend on Better Auth's tables.
- Referential integrity across contexts is the application's responsibility — the boundary
  ([ADR 0011](0011-server-side-identity-helper.md)) supplies a valid `userId`; the DB does
  not enforce that the user row exists.
- Deleting a user does not cascade to habits at the DB level; any such cleanup is an explicit
  application/operational concern if and when it's needed.

## Alternatives rejected

- **DB foreign key `habits.userId → user.id`:** couples the habits schema to Better Auth's
  generated table and crosses the context boundary the module architecture protects.
- **Cross-context Drizzle relation:** forces one domain's schema to import another's,
  defeating decoupling for the sake of join ergonomics the app doesn't need.
