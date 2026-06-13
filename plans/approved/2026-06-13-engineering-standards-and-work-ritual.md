---
title: Engineering Standards & the Work-Execution Ritual
date: 2026-06-13
status: approved
author: Pat Keenan
related:
  - ../approved/2026-06-13-foundation-and-architecture.md
  - ../../docs/decisions/0005-conventional-commits-and-enforcement.md
domains: []
---

# Engineering Standards & the Work-Execution Ritual

## Context

The codebase is being built to be maintained largely by amnesiac agents that start each
session with near-zero memory. To make this scale like a top-tier engineering team, we add
two things: (1) **commit/PR standards** that make history machine-readable and categorizable
over time, and (2) a **work-execution ritual** that gives a fresh agent the right context and
a clear contract before it writes a line of code.

A zero-memory agent follows standards reliably only through three layers:

1. **A discoverable index** (`CLAUDE.md`, always loaded, tiny) — tells the agent _where_
   standards live, not the standards themselves.
2. **On-demand standards** (repo docs + skills) — pulled into context only when relevant.
3. **Deterministic gates** (commitlint, Husky, `validate`, dependency-cruiser, CI, **and
   Claude Code hooks**) — reject non-compliant output regardless of whether the agent read or
   remembered anything. The floor.

We do **not** rely on the agent choosing to validate itself. Instead a Claude Code `Stop`
hook makes _finishing the turn_ conditional on passing the gate: on failure it blocks and
feeds the errors back, so the agent must iterate to green before it can stop. The gate is both
target and feedback loop.

This `/draft-plan → /approve-plan → /kickoff` ritual is also the **human-speed prototype of
the factory's core loop** (orchestrator plans → approval → worker executes). `/kickoff` is the
seam where an autonomous agent later replaces the human.

## Guiding invariants

See `CLAUDE.md` and [ADR 0001](../../docs/decisions/0001-hexagonal-architecture.md). Standards
follow the single-source-of-truth rule: the canonical text lives in one doc, tooling encodes
it, skills reference it — never duplicate.

## Locked decisions

- **Conventional Commits** with **parentheses** scope: `type(scope): description`. Switch
  away from the initial `feat[setup]:` bracket style going forward.
- **Scope = domain.** Scope names the domain touched (from `docs/domains.md`). Enforce
  _type + format_ strictly now; keep **scope permissive** until domains stabilize, then turn
  on a scope-enum validated against the domain registry.
- **Three-layer enforcement:** authoring guidance (docs/skills) → local gate (Husky +
  commitlint + lint-staged + Claude Code hooks) → authoritative gate (CI required checks,
  once a remote exists).
- **Standards location:** canonical commit/PR convention lives in `docs/conventions/`, encoded
  in the commitlint config, referenced by the skills and a `CLAUDE.md` pointer.
- **Agent contract:** work must pass `pnpm validate` before any commit; commits follow the
  convention; decisions that change architecture get an ADR.
- **The ritual:** `/draft-plan` → `/approve-plan` → **`/kickoff`** (executes an approved
  plan). `/kickoff` _references_ standards; it does not store them. It accepts an optional
  plan slug; if omitted it picks the latest approved plan and **confirms before proceeding**.
- **No `/commit` skill for now** — commitlint enforces format and the doc documents it; add a
  small `/commit` skill later only if agents fumble trailers (ticket ref, co-author).
- **Local gate split:** lint-staged on **pre-commit** (fast); full `pnpm validate` on
  **pre-push**. Keeps commits snappy, still blocks bad pushes.
- **Record an ADR** adopting Conventional Commits + the enforcement stack, pointing to
  `docs/conventions/commits.md` as the detailed reference.
  ([ADR 0005](../../docs/decisions/0005-conventional-commits-and-enforcement.md))
- **Self-validation via hooks, not agent goodwill.**
  - `PostToolUse` hook → fast, file-scoped lint/format right after edits (early signal).
  - `Stop` hook → runs the gate at turn-end and **blocks until green**, feeding failures back.
  - A `/review-work` skill is _not_ the enforcement mechanism (an agent could skip it); at most
    it is optional documentation of the procedure.
- **Stop-hook heaviness:** _interactive_ config runs only fast checks (lint + typecheck, only
  if files changed); _autonomous worker_ config runs the full gate on Stop.

## Scope / deliverables

- `docs/conventions/commits.md` — canonical commit + PR convention (types, scope=domain,
  examples, trailers, PR rules, squash-merge).
- commitlint (`@commitlint/config-conventional`) config.
- Husky hooks: `commit-msg` → commitlint; `pre-commit` → lint-staged; `pre-push` → `validate`.
- lint-staged config (prettier + eslint on staged files).
- A `pnpm validate` script (typecheck + dependency-cruiser + tests; evals later).
- Claude Code hooks in `.claude/settings.json`: `PostToolUse` (fast file-scoped lint/format)
  and `Stop` (run the gate, block-until-green; light in interactive, full in worker config).
- `.github/pull_request_template.md`.
- The `/kickoff` skill (`.claude/skills/kickoff/SKILL.md`).
- `CLAUDE.md` pointer to the conventions; ADR per the decision above.
- CI required checks: deferred until the repo has a remote (note it, don't build yet).

## Sequencing

1. ~~Resolve the open decisions.~~ Done (Stop-hook heaviness confirmed).
2. Write `docs/conventions/commits.md` + commitlint config.
3. Add Husky + lint-staged + the `pnpm validate` script (validate can start with
   typecheck + tests; dependency-cruiser wires in when the first domain lands).
4. Add the Claude Code `PostToolUse` + `Stop` hooks (interactive config first).
5. PR template + `/kickoff` skill + CLAUDE.md pointer.
6. ~~`/approve-plan` → mint the ADR.~~ Done ([ADR 0005](../../docs/decisions/0005-conventional-commits-and-enforcement.md)).

## Out of scope

- CI / branch protection (needs a remote — note and defer).
- The dependency-cruiser config itself (lands with the first domain; this plan only wires the
  `validate` slot for it).
- Any product/domain code — this plan is purely the enforcement + ritual layer.
