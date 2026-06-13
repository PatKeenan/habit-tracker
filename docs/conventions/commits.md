# Commit & PR conventions

Canonical reference for how we write commits and PRs. Tooling encodes this (commitlint,
Husky, CI); skills and `CLAUDE.md` point here. See
[ADR 0005](../decisions/0005-conventional-commits-and-enforcement.md) for the decision.

## Commit format — Conventional Commits

```
<type>(<scope>)<!>: <description>

<body — the WHY, wrapped at ~72 columns>

<footers — Refs/Closes, BREAKING CHANGE>
```

### Types

| Type       | Use for                                                        |
| ---------- | -------------------------------------------------------------- |
| `feat`     | a new capability (→ minor version)                             |
| `fix`      | a bug fix (→ patch version)                                    |
| `docs`     | documentation only                                             |
| `refactor` | code change that neither fixes a bug nor adds a feature        |
| `perf`     | a performance improvement                                      |
| `test`     | adding or correcting tests                                     |
| `build`    | build system, dependencies, tooling config                     |
| `ci`       | CI configuration and scripts                                   |
| `chore`    | maintenance that doesn't fit above (no production code change) |
| `style`    | formatting only (whitespace, semicolons) — no logic change     |
| `revert`   | reverts a previous commit                                      |

### Scope = domain

The scope names the **domain** touched (see `docs/domains.md`), e.g. `feat(habits):`,
`fix(auth):`. Until domains exist, use a sensible area (`setup`, `tooling`, `docs`). Format
and type are enforced strictly now; a scope **enum** validated against the domain registry
turns on once domains stabilize.

> Use parentheses, not brackets: `feat(setup):`, never `feat[setup]:`.

### Rules

- **Imperative mood**, lowercase description, no trailing period: "add timer port", not
  "Added timer port." or "adds timer port".
- Subject line ≤ ~72 chars (aim for 50).
- Blank line between subject and body.
- The body explains **why** and **what**, not how — the diff shows how.
- One logical change per commit (atomic; revertible on its own).

### Breaking changes

Mark with `!` after the type/scope **and** a footer:

```
feat(auth)!: drop legacy session cookie

BREAKING CHANGE: clients must re-authenticate; the v1 cookie is no longer read.
```

### Footers / trailers

- Link the tracker item: `Refs: ENG-123` or `Closes ENG-123` (Linear magic words close it).
- **Do not add AI co-author trailers.** Commits carry no `Co-Authored-By` line for the agent;
  authorship is the git author. This holds whether a human or an agent wrote the change.

### Examples

```
feat(habits): add isDueToday weekday-membership check
fix(db): use neon-http driver so queries run on serverless
docs(decisions): record dependency-cruiser boundary enforcement
build(tooling): add commitlint + husky enforcement
```

Bad: `fixed stuff`, `WIP`, `Update file.ts`, `feat[habits]: ...` (brackets).

## Pull requests

- PR **title** follows the same Conventional Commits format (it becomes the squash commit).
- **Squash-merge** so the squashed commit is the conventional one.
- Keep PRs small and focused — one concern per PR.
- Fill in the PR template (`.github/pull_request_template.md`): what, why, testing, risk.
- Reference the tracker item in the description.

## Enforcement (how this is kept true)

1. **Authoring guidance** — this doc + the planning/kickoff skills.
2. **Local gate (Husky)** — `commit-msg` runs commitlint; `pre-commit` runs lint-staged;
   `pre-push` runs `pnpm validate`.
3. **Self-validation (Claude Code hooks)** — `Stop` runs the gate and blocks until green.
4. **Authoritative gate (CI)** — required checks once the repo has a remote (deferred).
