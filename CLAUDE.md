# habit-tracker

A mobile-first PWA habit tracker (TanStack Start + React 19, Drizzle, Neon Postgres,
Better Auth, Sentry). Also the reference codebase for a forthcoming blog series on agent
evals — favor a clean, testable shell over feature breadth.

## Non-negotiable invariants

1. **Readability over cleverness.** Write code that the next reader (human or agent)
   understands on the first pass. Prefer clear names, small functions, and obvious control
   flow over terse or clever constructs. If a clever line needs a comment to be understood,
   replace it with readable code instead. Match the style of the surrounding code.
2. **Pure, testable domain core.** Business logic (e.g. "is a habit due today?",
   "today's score") is written as pure functions/types that import no framework, no ORM,
   no clock, no `Date.now()`. Everything they need — the current time, persistence — is
   passed in. The core must be exercisable in tests with zero I/O.
3. **Dependencies point inward.** Adapters (TanStack server functions, Drizzle repos,
   auth) depend on the core; the core depends on nothing outward. Swapping an adapter
   must not touch the core.
4. **The core owns its own types.** ORM rows and request/response schemas are mapped to
   domain types at the boundary — they never leak into the core as the domain model.
5. **Server/client boundary is real.** Server-only modules (server functions, DB, auth
   internals) must never be imported into client/component code.

These get enforced by tooling as it lands (typecheck, boundary lint, tests). When in
doubt, read the decisions below before inventing structure.

## Where intent lives

- **Decisions (ADRs):** `docs/decisions/` — short records of what we decided and why.
- **Plans:** `plans/drafts/` (in progress) and `plans/approved/` (locked). Manage them with
  the `/draft-plan` and `/approve-plan` skills rather than hand-editing plan files.
- **Domains:** `docs/domains.md` — registry of the codebase's hexagonal domains (empty for
  now; populated as they emerge).
- **Conventions:** `docs/conventions/` — commit/PR standards (and more as they're added).
- **Architecture:** `docs/architecture.md` — module structure and dependency rules.
- Read the relevant ADR/plan before large changes; don't re-derive settled decisions.

## Commands

- `pnpm dev` — run the app (port 3000)
- `pnpm test` — vitest
- `pnpm lint` / `pnpm format`
- `pnpm db:generate` / `pnpm db:migrate` / `pnpm db:studio`
