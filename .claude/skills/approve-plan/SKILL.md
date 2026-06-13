---
name: approve-plan
description: Promote an approved draft plan from plans/drafts/ to plans/approved/, flip its status, and extract its locked decisions into ADRs under docs/decisions/. Use when a draft plan has been approved.
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Bash
argument-hint: [plan-slug]
---

# Approve a plan

Promote a draft to approved and mint ADRs from its locked decisions. This is the second,
committing gate — be deliberate.

## Conventions (single source of truth — read them, don't reinvent)

- Read `docs/decisions/README.md` for the ADR format, numbering, and index.
- Read `plans/README.md` for the promotion rules.
- Read `docs/domains.md` if the plan establishes a new domain.

## Steps

1. **Identify the draft.** If a slug argument was given, use `plans/drafts/<slug>.md`.
   Otherwise list `plans/drafts/*.md` and ask the user which one (or pick the obvious single
   match). Read it.
2. **Confirm intent.** Re-read the plan's **Locked decisions**. Decide which are
   _architecturally significant_ and warrant an ADR — not every locked line needs one.
   Show the user the list of ADRs you intend to create and get a yes before writing them.
3. **Mint ADRs.** For each chosen decision, create `docs/decisions/NNNN-<slug>.md` (next
   sequential zero-padded number) using the project's existing ADR format: frontmatter
   `number / title / date / status: accepted`, then **Context · Decision · Consequences ·
   Alternatives rejected**. Match the style of existing ADRs.
4. **Update the index.** Add each new ADR to the index in `docs/decisions/README.md`.
5. **Update the plan.** Flip frontmatter `status: draft → approved` and add the new ADR
   paths to the plan's `related:` list.
6. **Register new domains.** If the plan establishes a new domain, add it to
   `docs/domains.md` per that file's template.
7. **Move the file.** Relocate `plans/drafts/<file>` → `plans/approved/<file>`. Prefer
   `git mv` when the file is already tracked (check with
   `git ls-files --error-unmatch <path>`); otherwise use plain `mv`. No copy is left behind
   in `drafts/`.
8. **Report.** List the ADRs created and confirm the plan now lives in `plans/approved/`.

## Notes

- Approval is a commitment. Do not promote without the user's explicit go-ahead in step 2.
- Keep ADRs short — one decision per file, roughly a page.
