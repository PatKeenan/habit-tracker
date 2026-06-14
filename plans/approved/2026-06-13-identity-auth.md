---
title: Identity & Auth Persistence
date: 2026-06-13
status: approved
author: Pat Keenan
related:
  - ../approved/2026-06-13-habit-core-slice.md
  - ../../docs/decisions/0003-single-drizzle-neon-adapter.md
  - ../../docs/decisions/0007-module-architecture.md
  - ../../docs/decisions/0010-identity-is-infrastructure.md
  - ../../docs/decisions/0011-server-side-identity-helper.md
  - ../../docs/decisions/0012-cross-domain-references-by-id.md
domains: []
---

# Identity & Auth Persistence

## Context

Better Auth is wired in the app shell but **persists nothing** — `src/lib/auth.ts:1-10` has no
`database` adapter, so users/sessions are in-memory and lost on restart. The habits domain's core,
application, and outbound (Drizzle) layers already exist and take a `userId: string` (by id), but
there is no persisted user to attach it to and no server-side way to get the current user. This
plan adds **auth persistence + a session helper** so habits can be scoped to a real user. Identity
is **infrastructure** (Better Auth-owned tables in `src/lib`), not a feature domain.

Prerequisite for habit-core Phase 2c (its server functions need a real `userId`); must land before
`feat/habit-core` merges.

## Guiding invariants

See `CLAUDE.md`, [ADR 0003](../../docs/decisions/0003-single-drizzle-neon-adapter.md) (single
Drizzle/Neon client) and [ADR 0007](../../docs/decisions/0007-module-architecture.md) (lib =
infra). Auth tables are Better Auth-owned; we generate, not hand-model, them.

## Prior art / Current state (verified via grounding + critic)

- `src/lib/auth.ts:1-10` — `betterAuth({ emailAndPassword, plugins: [tanstackStartCookies()] })`,
  **no `database`** → ephemeral.
- `src/routes/api/auth/$.ts` — handler mounted (GET/POST → `auth.handler`). Fine as-is.
- `src/lib/auth-client.ts` — bare `createAuthClient()`. Fine.
- **No server-side session usage** anywhere (`auth.api.getSession` appears nowhere in `/src`).
- `src/lib/db.ts` exports the raw Neon `sql` (tagged-template fn), **not** a `drizzle()` instance.
- No Better Auth Drizzle schema exists.
- **Habits is partly built:** core + application + outbound Drizzle adapter + public API exist;
  what's missing is `adapters/inbound/` and route wiring (that's Phase 2c). `habits.userId` /
  `habit_completions.userId` are `text` (`schema.ts:17,32`); use cases/ports take `userId: string`.
- **`src/env.ts` is dead code** — imported by zero files; it validates nothing at runtime.
- Env: `.env.local` has `DATABASE_URL`, `BETTER_AUTH_URL`, and a **non-empty `BETTER_AUTH_SECRET`**
  (re-verify before acting). `.env.example` is missing both `BETTER_AUTH_SECRET` and
  `BETTER_AUTH_URL`. Better Auth reads `process.env.BETTER_AUTH_SECRET` directly.
- No `drizzle/` migrations dir (deleted earlier) → `db:generate` will emit the **first** migration.
- Installed: `better-auth@1.6.18`, `@neondatabase/serverless@1.0.2`, `drizzle-orm@0.45.1`.
  `getRequest` exists in `@tanstack/react-start/server`; `better-auth/adapters/drizzle` resolves.

## Data model & relationships

- **Better Auth owns four tables** (generated): `user`, `session`, `account`, `verification`.
  `user.id` is a **`text`** PK (Better Auth generates string ids).
- **`habits.userId` → `user.id` BY ID** — `text` ↔ `text`, **no DB foreign key, no cross-context
  Drizzle relation** (domains stay decoupled). No change to the habits schema.
- Relations stay within a context: `session`/`account` → `user` (Better Auth's FKs);
  `habitCompletions` → `habits` (habits domain).

## Locked decisions

- **Identity is infrastructure** in `src/lib` (`auth.ts`, `auth-schema.ts`). No `src/domains/auth`.
- **Drizzle adapter over neon-http**, `provider: 'pg'`, `transaction: false` (explicit; neon-http
  has no transactions — verified fine on 1.6.18).
- **`auth.ts` builds its own instance** with the **positional** form `drizzle(sql, { schema:
authSchema })` (matches `drizzle-habit-repository.ts`); `lib/db` keeps exporting `sql`.
- **Generate the schema with the CLI**, pinned output:
  `npx @better-auth/cli@latest generate --config src/lib/auth.ts --output src/lib/auth-schema.ts --yes`;
  commit it as editable.
- **Session helper `getCurrentUserId(): Promise<string | null>`** in `src/lib` (uses
  `auth.api.getSession({ headers: getRequest().headers })`). **Contract:** returns the user id, or
  `null` when there is no session. Protected server functions (Phase 2c) reject (`null` → 401/throw)
  rather than guessing a user.
- **Fail-fast on the secret in `auth.ts`** — guard `process.env.BETTER_AUTH_SECRET` (throw if
  missing). `src/env.ts` is dead code; wiring it into a server entrypoint is separate, out of scope.
- **`habits.userId` stays by-id** — no FK.
- **New files use the `@/` alias.**
- **`.env.example`** gains both `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL`.
- **drizzle.config** `schema` array gains `./src/lib/auth-schema.ts`.

## Open decisions

Both resolved with the user:

1. **Fail-fast on missing auth env** — guard `BETTER_AUTH_SECRET` in `auth.ts`; wiring the dead
   `src/env.ts` is deferred. (Reflected in Locked decisions.)
2. **Extra auth features** — none now; email + password only. (Reflected in What we're NOT doing.)

## Assumptions to verify (not assume)

| Assumption                                    | Status                                                                                  |
| --------------------------------------------- | --------------------------------------------------------------------------------------- |
| Better Auth persists users today              | **FALSE** — no adapter; must add.                                                       |
| `lib/db`'s export works with `drizzleAdapter` | **NO** — it's raw `neon()` `sql`; wrap in `drizzle(sql, { schema })`.                   |
| neon-http works with the adapter              | **YES**, with `transaction: false` (default on 1.6.18).                                 |
| `user.id` matches `habits.userId`             | **YES** — both `text`; by-id, no FK.                                                    |
| `BETTER_AUTH_SECRET` is empty                 | **NO (corrected)** — appears set in `.env.local`; re-verify, do **not** blindly rotate. |
| `src/env.ts` validates env                    | **NO** — dead code (imported nowhere); guard in `auth.ts` instead.                      |
| A server-side userId mechanism exists         | **NO** — this plan adds `getCurrentUserId()`.                                           |
| CLI `migrate` applies Drizzle migrations      | **NO** — CLI `migrate` is Kysely-only; use `db:generate`/`db:migrate`.                  |
| `getRequest` exists in react-start/server     | **YES** — verified.                                                                     |

## What we're NOT doing

- No social providers, email verification, or password reset.
- No user profile/settings domain; no editing the generated tables beyond CLI output.
- No cross-domain FK from habits to user.
- **Do not remove `/demo/better-auth` yet** — it's the only sign-up/sign-in UI and is needed for
  manual verification until a real auth route exists.

## Sequencing

**Phase 1 — auth persistence**

1. Confirm `BETTER_AUTH_SECRET` is set in `.env.local` (generate with `openssl rand -base64 32`
   only if empty). Add `BETTER_AUTH_SECRET` + `BETTER_AUTH_URL` to `.env.example`.
2. Generate schema: `npx @better-auth/cli@latest generate --config src/lib/auth.ts --output
src/lib/auth-schema.ts --yes`; review the four tables.
3. Wire `src/lib/auth.ts`: `drizzle(sql, { schema: authSchema })` → `drizzleAdapter(authDb, {
provider: 'pg', schema: authSchema, transaction: false })`; add the secret guard.
4. Add `getCurrentUserId()` helper in `src/lib` with the null-on-no-session contract.
5. Add `./src/lib/auth-schema.ts` to `drizzle.config.ts` `schema`.
   - **Automated:** `pnpm validate` green.
   - **Manual:** none yet.

**Phase 2 — first migration + apply**

6. `pnpm db:generate` (first migration: habits + completions + auth); review the SQL.
7. **Check the Neon DB state first** — earlier demo `db:push` runs may have left tables. If the DB
   diverges from the empty migration journal, `db:migrate` can fail ("table already exists"); use
   `pnpm db:push` to sync, or drop leftovers, as the recovery path. Then apply against the pooled
   `DATABASE_URL`.
   - **Automated:** `pnpm validate` green; migration applies cleanly.
   - **Manual:** sign up via `/demo/better-auth` → confirm a row in `user`; sign out / in;
     confirm the session survives a server restart.

## Out of scope

- Habit-core Phase 2c (server fns + dashboard) — it _consumes_ `getCurrentUserId()`; separate phase.
- Anything under "What we're NOT doing".
