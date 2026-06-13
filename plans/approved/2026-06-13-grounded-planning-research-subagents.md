---
title: Grounded Planning — Codebase-Research Subagents
date: 2026-06-13
status: approved
author: Pat Keenan
related:
  - ../approved/2026-06-13-engineering-standards-and-work-ritual.md
  - ../../docs/decisions/0006-grounded-planning-research-subagents.md
domains: []
---

# Grounded Planning — Codebase-Research Subagents

## Context

A zero-memory agent will recreate things that already exist — a type, a route, a util —
because nothing made it look first. The fix is a **grounding phase** that establishes _what
already exists_ before deciding _what to build_. This is **discovery, not instruction**: it
tells the agent what is already there, without dictating how to do the work.

This adds a research step to the front of the planning ritual
([engineering-standards plan](../approved/2026-06-13-engineering-standards-and-work-ritual.md)):
`/draft-plan` grounds itself via read-only research subagents before writing the draft. The
approach mirrors HumanLayer's proven research → plan → implement methodology (read-only
subagents enforced by a tool whitelist, dispatched in parallel, returning compacted summaries
with `file:line` references). Researched 2026-06-13 from HumanLayer's primary sources.

These same research subagents are **factory components**: the orchestrator will use them to
ground a Linear ticket before dispatching a worker. Building them here tests them at human
speed first. They also complement dependency-cruiser: pattern-finding stops duplication
_before_ writing; dep-cruiser stops boundary violations _after_.

## Guiding invariants

See `CLAUDE.md`. Read-only is guaranteed _structurally_ (tool whitelist — no Edit/Write/Bash),
not by request. Subagents are documentarians: report what _is_, not what _should be_. They
return compacted conclusions with `file:line` refs, never raw dumps.

## Prior art (this repo, surveyed this session)

- Claude Code ships **built-in read-only agent types** (`Explore`, `feature-dev:code-explorer`,
  `code-architect`) — candidates to use directly or to compose under custom subagents.
- `.claude/skills/` already holds `draft-plan` and `approve-plan`; this plan upgrades
  `draft-plan` rather than adding a parallel command.
- `docs/decisions/` (ADRs), `docs/conventions/` (planned), and `plans/` are the in-repo
  "thoughts" corpus a decisions-locator should search.

## Locked decisions

- **Grounding happens at draft time**, feeding the draft (not as a post-hoc gate). A _light_
  re-check happens at approve time.
- **Read-only via tool whitelist.** Research subagents get only search/read tools.
- **Build our own subagents** (tuned read-only prompts, reusable as factory components) that
  may compose the built-in read-only agents internally.
- **Start with three subagents:** `codebase-locator` (where), `codebase-pattern-finder`
  (reusable patterns/types — the duplication-killer), and `decisions-locator` (our ADRs /
  conventions / plans). Add `codebase-analyzer` (deep `file:line` how-it-works) on first need.
- **Scaled grounding:** `/draft-plan` skips grounding for trivial work and runs it (subagents
  in parallel) for anything touching code.
- **Plan-template additions** (borrowed from HumanLayer): **Prior art / Current state**,
  **Observed conventions**, **What we're NOT doing**, and per-phase **Automated vs. Manual
  verification**.
- **Conventions loop:** `/approve-plan` promotes "Observed conventions" into `docs/conventions/`
  or an ADR — the codebase teaches the docs.
- **Research embeds as plan sections** for now (one artifact); split into a separate research
  file only if it grows large.

## Scope / deliverables

- `.claude/agents/codebase-locator.md`, `codebase-pattern-finder.md`, `decisions-locator.md`
  (read-only; tool whitelists; documentarian directive; compacted `file:line` return contract).
- (Deferred) `.claude/agents/codebase-analyzer.md` — add on first need.
- Upgrade `.claude/skills/draft-plan/SKILL.md`: add the grounding phase (dispatch research
  subagents in parallel → synthesize → write a grounded draft) and the new template sections.
- Upgrade `.claude/skills/approve-plan/SKILL.md`: add the light duplication re-check and the
  "Observed conventions" promotion step.
- Update `plans/README.md` frontmatter/template note to mention the new sections.

## Sequencing

1. ~~Resolve the open decisions.~~ Done (build our own; three subagents; scaled grounding).
2. Write the research subagents.
3. Upgrade `draft-plan` (grounding phase + template) and `approve-plan` (re-check + conventions
   promotion).
4. Update `plans/README.md`.
5. ~~Record an ADR.~~ Done ([ADR 0006](../../docs/decisions/0006-grounded-planning-research-subagents.md)).

## Out of scope

- The factory's orchestrator use of these subagents (separate, later).
- A separate `thoughts/` research-file corpus (embed in plans for now).
- Any product/domain code.
