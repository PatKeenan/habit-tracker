# Plans

Design and implementation plans for this project. Plans are the durable record of
_intent_ — what we're building, why, and the decisions that constrain how. The
conversation is ephemeral; the plan (and the ADRs it produces) is what carries over time.

## Convention

```
plans/
  drafts/      work-in-progress plans
  approved/    approved / final plans (promoted from drafts/)
```

- **Filename:** `YYYY-MM-DD-<kebab-slug>.md` — date is the day the plan was started.
- **Status** is tracked in two places that must agree:
  1. the `status:` field in the plan's frontmatter (`draft | approved | final`), and
  2. the folder it lives in (`drafts/` vs `approved/`).
- **Promotion:** when a plan is approved, set `status: approved` (or `final`) and
  `git mv plans/drafts/<file> plans/approved/<file>`. Extract the locked decisions into
  ADRs under `docs/decisions/` at the same time — the plan is the thinking, the ADR is
  the verdict.

## Frontmatter

```yaml
---
title: <human title>
date: 2026-06-13
status: draft # draft | approved | final
author: <name>
related: [] # paths to related plans / ADRs
---
```

## Note on Claude Code visibility

There is no `.claudeignore`. Plain files here are **not** auto-loaded into context — they
cost nothing until an agent explicitly reads one. To make a _future_ Claude Code instance
(e.g. a factory worker agent) blind to drafts, add a deny rule to `.claude/settings.json`:

```json
{ "permissions": { "deny": ["Read(./plans/drafts/**)"] } }
```

Caveat: deny rules apply to the **current** session too, and the folder still appears in
directory listings. Don't enable this while actively authoring drafts — reserve it for the
unattended worker agents that should not see in-progress thinking.
