# Architecture Decision Records (ADRs)

Short, durable records of decisions that shape the codebase: _what_ we decided, _why_, and
_what we rejected_. The conversation is ephemeral; the ADR is the residue worth keeping.
Read these before re-opening a settled question.

## Convention

- Filename: `NNNN-kebab-slug.md` (zero-padded, sequential).
- One decision per file, roughly a page.
- Status: `proposed | accepted | superseded`. A reversal is a _new_ ADR that supersedes
  the old one (link both ways) — don't rewrite history.

## Template

```yaml
---
number: 0001
title: <decision>
date: 2026-06-13
status: accepted
---
```

Then: **Context** (the forces) · **Decision** (what we're doing) · **Consequences**
(what this makes easy/hard) · **Alternatives rejected**.

## Index

- [0001](0001-hexagonal-architecture.md) — Hexagonal architecture with a testable core
- [0002](0002-recurrence-as-weekday-set.md) — Model habit recurrence as a set of weekdays
- [0003](0003-single-drizzle-neon-adapter.md) — Single persistence adapter (Drizzle/Neon)
- [0004](0004-dependency-cruiser-boundaries.md) — Boundary enforcement via dependency-cruiser
- [0005](0005-conventional-commits-and-enforcement.md) — Conventional Commits + hook-enforced gate
- [0006](0006-grounded-planning-research-subagents.md) — Grounded planning via read-only research subagents
- [0007](0007-module-architecture.md) — Module architecture: feature domains × layers
- [0008](0008-failure-ledger.md) — Failure ledger and the self-improvement loop
