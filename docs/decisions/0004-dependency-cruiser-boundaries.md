---
number: 0004
title: Enforce architectural boundaries with dependency-cruiser
date: 2026-06-13
status: accepted
---

## Context

The hexagonal boundaries in [ADR 0001](0001-hexagonal-architecture.md) — pure core, inward
dependencies, domain isolation, server/client separation — are only real if a machine
enforces them. Largely autonomous agents will erode prose-only rules. We need a
deterministic check that fails CI when an import crosses a boundary.

## Decision

Adopt **dependency-cruiser** (`depcruise`) as the authoritative boundary gate, configured in
`.dependency-cruiser.js` and run as a step in the `validate` script (nonzero exit fails the
gate). Core rules:

- **Core stays pure:** `domain/` may not import frameworks, the ORM, or adapters.
- **No cross-domain imports:** a domain may not import another domain (a backreference rule
  scales to N domains without per-domain edits).
- **No server-in-client:** client/route component code may not import server-only modules
  (`*.server.ts`, outbound adapters).
- **No circular dependencies.**

The graph output (`depcruise --output-type dot`) doubles as machine-readable input the
future orchestration agent can use to reason about which domains a ticket touches.

## Consequences

- Deterministic enforcement that scales to many domains for free via backreferences.
- Standalone from ESLint, so it slots cleanly into the validation gate as its own pass/fail.
- Static-graph only: it will not catch a secret leaking through a _runtime_ indirection —
  that residue is covered by the pure-core discipline, tests, and review.
- Config needs light upkeep as the folder structure emerges.

## Alternatives rejected

- **eslint-plugin-boundaries:** good inline editor DX, but lints file-by-file (weaker on
  whole-graph concerns) and has no visualization. May be added later as a _non-authoritative_
  DX layer alongside dependency-cruiser.
- **Manual review only:** agents will drift; not enforceable.
