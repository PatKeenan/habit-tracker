---
name: draft-plan-ci
description: Autonomously draft a plan in plans/drafts/ for an agent-factory ticket, grounded in the codebase. Non-interactive — emits open decisions as a structured artifact for the orchestrator to post to Linear, instead of asking. Invoked explicitly by the runner.
disable-model-invocation: true
allowed-tools: Read, Write, Bash, Agent
---

# Draft a plan (autonomous / CI)

Autonomous variant of `draft-plan` for the agent factory. Same grounding and rigor — but **there is no human in the sandbox**, so there is no interactive loop. Open decisions go out as a structured artifact the orchestrator posts to Linear; answers (when they exist) come back in as input on a later run.

## Contract

- **Input:** the ticket title + description (from the prompt). On a follow-up run, also a JSON block of `answered` decisions (the human's replies, passed in by the orchestrator).
- **Output:** a committed draft at `plans/drafts/...`, plus `.agent/plan-state.json` describing what happens next.
- **Never** ask interactively, wait for input, post to Linear, open a PR, or hand off to `/approve-plan`. Produce the plan + the state file, commit, and exit.

## Steps

1. **Gather inputs (non-interactive).** Title and description come from the ticket — never ask for them. Get the date with `date +%F` and the author from `git config user.name` (fallback: `agent`). If something is genuinely unclear, do **not** block — record it as an open question in step 6.

2. **Ground (same as `draft-plan`).** Dispatch the read-only research subagents **in parallel** and synthesize before writing:
   - `codebase-locator`, `codebase-pattern-finder`, `decisions-locator`.
     Grounding is dependency-scoped: trace what the feature depends on and **verify it exists — never assume a library is wired.** Skip only for trivial work.

3. **Create the draft** at `plans/drafts/YYYY-MM-DD-<slug>.md`. Frontmatter: `title`, `date`, `status: draft`, `author`, `related: []`, `domains: []`.

4. **Write the body** with the sections that fit (Context, Guiding invariants, Prior art / Current state with `file:line`, Data model & relationships, Locked decisions, Open decisions, Assumptions to verify, What we're NOT doing, Sequencing with **Automated** + **Manual** verification). For **every Open decision, include a recommended default and its trade-off** — the plan must be actionable even before any answer arrives.

5. **Critique.** Dispatch the `plan-critic` subagent adversarially (unaccounted relationships, ownership/auth, unverified dependencies, lifecycle edge cases). Fold blocking fixes into the draft — verify, don't assume.

6. **Apply answers, then emit remaining questions (this replaces the interactive loop).**
   - If the input includes `answered` decisions, apply each one: move it from **Open → Locked** with the chosen value and update any dependent sections.
   - Of the Open decisions that remain, keep only the ones that genuinely need a human call — not the ones your recommendation safely settles.
   - Write `.agent/plan-state.json`:
     - if questions remain:
       `{ "state": "needs-input", "questions": [ { "id": "...", "question": "...", "options": ["..."], "recommendation": "..." } ] }`
     - if none remain:
       `{ "state": "ready", "questions": [] }`

7. **Commit and exit.** Commit the draft **and** `.agent/plan-state.json` to the working branch — this commit is the durable artifact a later phase re-grounds from. Do **not** open a PR, comment on Linear, or run `/approve-plan`. Print the final `state` value as the last line of output and stop. The orchestrator reads `plan-state.json` and decides what happens next.

## Notes

- **The orchestrator (an Inngest function), not this skill, talks to Linear and opens the PR.** Your job is the plan plus the structured state. Never hold or use external credentials.
- **The committed draft is the warm-start state.** A follow-up run re-grounds from it; it does not resume a session.
- Same rigor as `draft-plan`: clear prose, concrete decisions, cite `file:line`, never set `status: approved` here.
