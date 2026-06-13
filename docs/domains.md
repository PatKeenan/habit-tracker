# Domains

The codebase will be partitioned into **domains** — independent hexagonal slices that
autonomous agents can own without colliding. Each domain has its own pure core, application
layer (ports + use cases), and adapters, and may **not** import another domain directly
(enforced by dependency-cruiser; see [ADR 0004](decisions/0004-dependency-cruiser-boundaries.md)).

**Status: no domains defined yet.** They will emerge from the first vertical slice (the
habit core) rather than being designed up front. This file is the registry — when a domain
becomes real, add it below.

## Registry

_None yet._

<!-- Template for when a domain becomes real:

## <domain-name>
- **Owns:** <the business capability>
- **Boundary:** <what is inside vs. outside this domain>
- **Outbound ports:** <interfaces it depends on, e.g. HabitRepository, Clock>
- **May depend on:** <shared kernel only — never another domain>
- **Owning agent:** <which domain agent, once they exist>
-->

## Why this file exists

Plans carry a `domains:` frontmatter field noting which domains they touch, and the
`/draft-plan` skill reads this registry to populate it. Keeping the canonical list here
(read on demand) means domain awareness is durable — it never lives only in a conversation
or in standing context. As domains emerge, each will also get a domain agent and
dependency-cruiser rules pinned to its folder.
