---
name: draft-plan
description: Start or iterate a draft plan in plans/drafts/ for a feature or architecture change, following this project's planning conventions. Grounds itself in the existing codebase first. Use when beginning non-trivial work that needs a written plan before code.
disable-model-invocation: true
allowed-tools: Read, Write, Bash, Agent
---

# Draft a plan

Create and iterate a **draft** plan, grounded in what already exists. This is the first gate of
the draft → approved lifecycle; `/approve-plan` handles the second.

Complements Claude Code's plan _mode_ (ephemeral in-session thinking) — this persists a plan as a
durable, tracked artifact. Use plan mode to think, this to capture the result.

## Conventions (single source of truth — read them, don't reinvent)

- Read `plans/README.md` for naming, folders, frontmatter, and promotion rules; follow exactly.
- Read `docs/domains.md` for the current list of codebase domains.
- For an example, read the most recent file in `plans/approved/`.

## Steps

1. **Gather inputs.** Get today's date with `date +%F` and the author with `git config user.name`
   (don't guess). Ask for the title and a short description if it isn't clear from the conversation.

2. **Ground (scaled).** For anything touching code, dispatch the read-only research subagents
   **in parallel** and synthesize their findings _before_ writing:
   - `codebase-locator` — where related code / types / routes live.
   - `codebase-pattern-finder` — existing patterns/types to reuse (so the plan doesn't duplicate).
   - `decisions-locator` — prior ADRs / conventions / plans this work must not contradict.

   Skip grounding for trivial work (a docs typo, a config tweak).

3. **Create the draft** at `plans/drafts/YYYY-MM-DD-<slug>.md` (`<slug>` = short kebab-case of the
   title). Frontmatter: `title`, `date`, `status: draft`, `author`, `related: []`, `domains: []`
   (fill `domains` from grounding + `docs/domains.md`; leave empty while none exist).

4. **Write the body** with the sections that fit the work, including:
   - **Context** — what this is and why.
   - **Guiding invariants** — point to `CLAUDE.md` / relevant ADRs; don't restate them.
   - **Prior art / Current state** — what already exists (from grounding): reuse THESE, don't
     recreate them. Cite `file:line`.
   - **Locked decisions** — settled choices (link the ADR if one exists).
   - **Open decisions** — choices needing the user's call, each with a recommendation + trade-off.
   - **Observed conventions** — de-facto patterns grounding surfaced that aren't documented yet
     (candidates for `docs/conventions/` or an ADR at approval).
   - **What we're NOT doing** — an explicit scope fence.
   - **Sequencing** — phases, each with **Automated verification** (commands that can be run) and
     **Manual verification** (checks a human must confirm).

5. **Drive the loop.** Present the draft, focus the user on the **Open decisions**, and resolve
   them one at a time (moving each into Locked). Keep editing the same file — don't start a new one.

6. **Hand off.** When the user is satisfied, tell them to run `/approve-plan`. Do NOT promote or
   create ADRs here — that is the other skill's job.

## Notes

- Readability over cleverness applies to plans too: clear prose, concrete decisions.
- A plan stays a draft until explicitly approved. Never set `status: approved` in this skill.
