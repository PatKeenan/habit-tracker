---
name: approve-plan
description: Promote an approved draft plan from plans/drafts/ to plans/approved/, flip its status, extract its locked decisions into ADRs, and promote observed conventions. Use when a draft plan has been approved.
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Bash, Agent
argument-hint: [plan-slug]
---

# Approve a plan

Promote a draft to approved and mint ADRs from its locked decisions. This is the second,
committing gate — be deliberate.

## Conventions (single source of truth — read them, don't reinvent)

- Read `docs/decisions/README.md` for the ADR format, numbering, and index.
- Read `plans/README.md` for the promotion rules.
- Read `docs/conventions/` if promoting an observed convention.

## Steps

1. **Identify the draft.** If a slug argument was given, use `plans/drafts/<slug>.md`. Otherwise
   list `plans/drafts/*.md` and ask the user which one (or pick the obvious single match). Read it.

2. **Light duplication re-check.** Skim the plan's "Prior art" + "Locked decisions" for anything
   that would duplicate or contradict existing code/decisions. If unsure, dispatch
   `decisions-locator` / `codebase-pattern-finder` to confirm, and flag conflicts to the user
   before promoting.

3. **Confirm the ADR list.** Decide which locked decisions are _architecturally significant_ and
   warrant an ADR — not every line needs one. Show the user the intended ADRs and get a yes.

4. **Mint ADRs.** For each, create `docs/decisions/NNNN-<slug>.md` (next sequential zero-padded
   number) in the project's format: frontmatter `number / title / date / status: accepted`, then
   **Context · Decision · Consequences · Alternatives rejected**. Match existing ADRs.

5. **Promote observed conventions.** For each item in the plan's "Observed conventions" the user
   wants kept, add it to `docs/conventions/` (or fold it into an ADR). The codebase teaches the docs.

6. **Update the index.** Add each new ADR to `docs/decisions/README.md`.

7. **Update the plan.** Flip frontmatter `status: draft → approved`; add the new ADR paths to the
   plan's `related:` list.

8. **Move the file.** Relocate `plans/drafts/<file>` → `plans/approved/<file>`. Prefer `git mv`
   when the file is tracked (`git ls-files --error-unmatch <path>`); else plain `mv`. No copy is
   left behind in `drafts/`.

9. **Report.** List the ADRs/conventions created and confirm the plan now lives in `plans/approved/`.

## Notes

- Approval is a commitment. Don't promote without the user's go-ahead in step 3.
- Keep ADRs short — one decision per file, roughly a page.
