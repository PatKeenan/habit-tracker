---
number: 0010
title: Identity is infrastructure, not a feature domain
date: 2026-06-13
status: accepted
---

## Context

The habits work introduced feature domains under `src/domains/` (core · application ·
adapters), per [ADR 0007](0007-module-architecture.md). Authentication arrived separately:
Better Auth is wired in the app shell, owns its own tables (`user`, `session`, `account`,
`verification`), and generates its own schema. The question at approval time was whether
identity should become a `src/domains/auth` feature domain like habits, or live as
infrastructure in `src/lib`.

Identity has no business rules _we_ author — there is no "is this user due today?" core to
keep pure. The tables are Better Auth-owned and CLI-generated; modeling them as a domain
core would invert ownership and invite hand-editing generated artifacts.

## Decision

Identity is **infrastructure**. It lives in `src/lib` (`auth.ts`, `auth-schema.ts`), not as
a `src/domains/auth` feature domain. The schema is **generated** by the Better Auth CLI
(`@better-auth/cli generate`) into a pinned, committed `src/lib/auth-schema.ts` and treated
as editable output, not hand-modeled. Feature domains depend on identity through a thin
server-side boundary (see [ADR 0011](0011-server-side-identity-helper.md)); identity depends
on no domain.

## Consequences

- No pure-core ceremony around tables that have no business logic we own.
- Better Auth owns its table shape; upgrades regenerate the schema rather than forcing
  reconciliation against a hand-written domain model.
- `src/lib` stays domain-agnostic — it exposes identity to domains, never imports one,
  consistent with [ADR 0007](0007-module-architecture.md)'s `lib = infra` rule.
- The hexagonal discipline of [ADR 0001](0001-hexagonal-architecture.md) is reserved for
  domains with real business rules; identity is deliberately exempt.

## Alternatives rejected

- **`src/domains/auth` feature domain:** manufactures a "core" with no business logic,
  and would mean hand-modeling (and re-reconciling) Better Auth's generated tables — owning
  what we don't own.
- **Inlining auth config into route handlers:** scatters identity setup across the app
  shell with no single infrastructure seam for domains to depend on.
