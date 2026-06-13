---
name: draft-plan
description: Start or iterate a draft plan in plans/drafts/ for a feature or architecture change, following this project's planning conventions. Use when beginning non-trivial work that needs a written plan before code.
disable-model-invocation: true
allowed-tools: Read, Write, Bash
---

# Draft a plan

Create and iterate a **draft** plan. This is the first gate of the draft → approved
lifecycle; `/approve-plan` handles the second.

This complements Claude Code's plan _mode_ (ephemeral in-session thinking) — it persists a
plan as a durable, tracked artifact. Use plan mode to think, this to capture the result.

## Conventions (single source of truth — read them, don't reinvent)

- Read `plans/README.md` for naming, folders, frontmatter, and promotion rules; follow them
  exactly. If they change, that file wins — do not duplicate them here.
- Read `docs/domains.md` for the current list of codebase domains.
- For an example of a well-formed plan, read the most recent file in `plans/approved/`.

## Steps

1. **Gather inputs.** Get today's date with `date +%F` and the author with
   `git config user.name` (do not guess either). Ask the user for the plan's title and a
   short description if it isn't already clear from the conversation.
2. **Create the draft** at `plans/drafts/YYYY-MM-DD-<slug>.md`, where `<slug>` is a short
   kebab-case form of the title. Frontmatter: `title`, `date`, `status: draft`, `author`,
   `related: []`, and `domains: []` — populate `domains` from `docs/domains.md` if the work
   touches any (leave empty while none exist).
3. **Write the body** with sections appropriate to the work. At minimum:
   - **Context** — what this is and why.
   - **Guiding invariants** — point to `CLAUDE.md` / relevant ADRs; don't restate them.
   - **Locked decisions** — choices already settled (link the ADR if one exists).
   - **Open decisions** — choices that still need the user's call, each with a
     recommendation and the trade-off.
   - Plus whatever fits: scope, sequencing, validation, out-of-scope.
4. **Drive the loop.** Present the draft, focus the user on the **Open decisions**, and
   resolve them one at a time. As each is settled, move it from Open to Locked and note the
   choice. Keep editing the same file — do not start a new one.
5. **Hand off.** When the user is satisfied, tell them to run `/approve-plan` to promote the
   draft and extract ADRs. Do **not** promote or create ADRs here — that is the other
   skill's job.

## Notes

- Readability over cleverness applies to plans too: clear prose, concrete decisions.
- A plan stays a draft until explicitly approved. Never set `status: approved` in this skill.
