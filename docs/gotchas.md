# Gotchas — recurring failures and how we prevent them

A ledger of recurring gate/authoring failures and their prevention. The value is _acting_ on
recurrence: prefer a deterministic rule; else add terse guidance here; promote to `CLAUDE.md` only
when frequency justifies the standing cost. See [ADR 0008](decisions/0008-failure-ledger.md).

Test failures are **not** logged here — fix them and keep the regression test green.

## Entries

### Interface members use function-property style, not shorthand methods

- **Seen:** 2026-06-13 — `src/domains/habits/application/ports.ts` (6 occurrences in one file).
- **Failure:** eslint `@typescript-eslint/method-signature-style` — "Shorthand method signature is
  forbidden. Use a function property instead."
- **Prevention:** in an interface write `foo: () => T`, not `foo(): T`. Deterministically caught by
  `pnpm validate`; auto-fixable with `eslint --fix` / `pnpm format`.
- **Process note:** `lint-staged` (pre-commit) runs `eslint --fix` and would have fixed this
  silently, but `validate`'s `lint` step runs plain `eslint` and errors instead. Running
  `pnpm format` before `pnpm validate` avoids the wasted iteration on auto-fixable issues.

### `format` must run `eslint --fix` before `prettier`, not after

- **Seen:** 2026-06-13 — `pnpm format` left mangled imports (`{ dailyScore  }`, a stray `;`) that
  `pnpm check` (prettier) would then reject.
- **Cause:** `format` ran `prettier --write . && eslint --fix`, so eslint's autofix output is not
  re-prettified. `lint-staged` already runs them in the right order (eslint, then prettier).
- **Prevention:** `format` now runs `eslint --fix && prettier --write .` (prettier last), matching
  `lint-staged`. Fixed in `package.json`.

### Layer-purity dependency-cruiser rules must exempt test files

- **Seen:** 2026-06-13 — `application/use-cases.test.ts` importing `testing/` fakes tripped
  `application-stays-framework-free`.
- **Cause:** the rule's `from` matched every file in `application/`, including `*.test.ts`. Tests
  legitimately wire fakes from `testing/`.
- **Prevention:** the layer rules now exempt `*.test.ts` / `*.spec.ts` via `from.pathNot`. Fixed in
  `.dependency-cruiser.js`.

### Plans must trace dependencies and verify assumptions, not just intra-domain existence

- **Seen:** 2026-06-13 — the habit-core slice missed that a habit belongs to a user, and assumed
  Better Auth persisted users (it had no DB adapter). The gap surfaced at migration time.
- **Cause:** grounding verified what _exists in the domain_ but not what the feature _depends on /
  relates to_ — and a key dependency (user persistence) was assumed, not verified.
- **Prevention:** the plan template now has "Data model & relationships" + "Assumptions to verify"
  sections; grounding is dependency-scoped; a `plan-critic` subagent challenges drafts. See
  [ADR 0009](decisions/0009-plan-completeness-checks.md).

### Better Auth's Drizzle adapter over neon-http needs `transaction: false`

- **Seen:** 2026-06-13 — caught in planning (identity & auth plan), before it bit at runtime.
- **Cause:** the Neon serverless **HTTP** driver (`@neondatabase/serverless` via
  `drizzle-orm/neon-http`) has no interactive transactions. Better Auth's `drizzleAdapter`
  wraps multi-step writes in a transaction by default, which neon-http can't honor.
- **Prevention:** pass `transaction: false` to `drizzleAdapter(db, { provider: 'pg',
transaction: false, ... })`. Verified safe on `better-auth@1.6.18`. If a flow ever needs real
  transactions, switch that path to the WebSocket `Pool` driver (`drizzle-orm/neon-serverless`)
  per [ADR 0003](decisions/0003-single-drizzle-neon-adapter.md), not neon-http.
