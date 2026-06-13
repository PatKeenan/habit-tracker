---
name: kickoff
description: Begin executing an approved plan — load its context and the working agreement (branch, validation gate, commit conventions), then implement it. Takes an optional plan slug; defaults to the latest approved plan.
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, LS
argument-hint: [plan-slug]
---

# Kick off work on an approved plan

Start an execution session against an approved plan. This skill _references_ the standards; it
does not store them. It is the human-speed prototype of the factory's worker dispatch — the seam
where, later, an autonomous agent slots in.

## Resolve the plan

- If a slug argument is given, use `plans/approved/<slug>.md`.
- Otherwise list `plans/approved/*.md`, pick the most recent, and **confirm it with the user**
  before proceeding. Only execute plans with `status: approved`.
- Read the plan fully, plus the ADRs/conventions it links.

## State the working agreement (the contract)

Before coding, restate briefly:

- **Branch:** work on a feature branch, never the default branch. Name it for the plan/ticket.
- **Standards:** follow `CLAUDE.md` invariants, the architectural boundaries, and
  `docs/conventions/commits.md`.
- **Definition of done:** `pnpm validate` passes; commits follow the convention; docs/ADRs are
  updated if a decision changes.

## Execute

- Work through the plan's sequencing/phases in order, staying inside its scope ("What we're NOT
  doing" is a fence).
- For each phase: satisfy its **Automated verification** (run it) and surface the **Manual
  verification** steps to the user — do not check those off yourself.
- **Run `pnpm validate` and iterate until green before committing.** The gate is your feedback
  loop, not an afterthought.
- Commit in atomic, conventional commits as phases complete.

## Notes

- If anything reveals the plan would duplicate or contradict existing code/decisions, stop and
  flag it rather than proceeding.
