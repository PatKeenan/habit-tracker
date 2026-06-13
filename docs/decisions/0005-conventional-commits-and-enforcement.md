---
number: 0005
title: Conventional Commits and a layered, hook-enforced standards gate
date: 2026-06-13
status: accepted
---

## Context

The codebase is built to be maintained largely by amnesiac agents and must stay clean and
auditable like a top-tier team's. Two needs: commit/PR history that is machine-readable and
categorizable over time, and enforcement that does not depend on an agent remembering to
comply. Guidance alone is the weakest link; the floor must be deterministic.

## Decision

Adopt **Conventional Commits** (`type(scope): description`, parentheses scope, scope = the
domain touched per `docs/domains.md`) and enforce standards in layers:

- **Authoring guidance** — `docs/conventions/commits.md` is the canonical reference; skills
  and a `CLAUDE.md` pointer point to it. Type + format are enforced strictly; scope stays
  permissive until domains stabilize, then becomes a scope-enum validated against the domain
  registry.
- **Local git gate (Husky)** — `commit-msg` runs commitlint; `pre-commit` runs lint-staged
  (fast); `pre-push` runs `pnpm validate`.
- **Self-validation via Claude Code hooks** — reserved for the autonomous worker config (the
  factory), where a `Stop` hook runs the full gate and **blocks until green**, feeding failures
  back. Interactive sessions rely on Husky (`pre-push` → `validate`) plus manual `pnpm validate`
  rather than a turn-end hook, to avoid friction while a human is present.
- **Authoritative gate** — CI required checks once a remote exists (deferred).

Commits/PRs reference their tracker item; PRs squash-merge so the squashed commit is the
conventional one.

## Consequences

- History is categorizable and can drive future changelogs / semver / ticket linking.
- Compliance no longer depends on agent diligence: finishing a turn is conditional on the
  gate, and commits/pushes are gated locally.
- Some config upkeep; the CI layer is pending a remote.

## Alternatives rejected

- **Freeform messages / guidance only:** not machine-readable, and agents skip guidance under
  pressure to finish.
- **Bracket scope (`feat[setup]:`):** fights the commitlint / Conventional Commits ecosystem.
- **A `/review-work` skill as the validator:** relies on the agent choosing to invoke it —
  the exact failure mode we are designing against. At most it is optional documentation.
