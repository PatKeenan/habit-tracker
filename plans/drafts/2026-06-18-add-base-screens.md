---
title: Add Base Screens
date: 2026-06-18
status: draft
author: Coding Agent
related:
  - ../approved/2026-06-13-foundation-and-architecture.md
  - ../../docs/decisions/0001-hexagonal-architecture.md
  - ../../docs/decisions/0007-module-architecture.md
  - ../../docs/architecture.md
domains:
  - habits
---

# Add Base Screens

## Context

The project is currently using demo pages from the TanStack Start CLI starter (`/`, `/about`, `/demo/better-auth`, `/demo/tanstack-query`, `/demo/sentry/testing`). Since this is a habit tracking app, we need to replace the generic demo pages with a dashboard that displays the user's habit data.

**Scope:** Replace the demo pages with a minimal functional dashboard. The design doesn't need to be polished — reuse existing styling patterns and components from the demo pages to keep the lift small.

**Goal:** Create the foundation for the app's UI while maintaining the project's architectural invariants (pure domain core, clear boundaries, thin routes).

## Guiding invariants

From `CLAUDE.md`:

1. **Readability over cleverness** — clear names, small functions, obvious control flow.
2. **Pure, testable domain core** — business logic has zero I/O; everything it needs is passed in.
3. **Dependencies point inward** — adapters depend on the core; core depends on nothing outward.
4. **The core owns its own types** — ORM rows mapped to domain types at the boundary.
5. **Server/client boundary is real** — server-only modules never imported into client code.

From [ADR 0001](../../docs/decisions/0001-hexagonal-architecture.md): Routes must be thin wiring layers — no DB access, no business logic, just call use cases and render.

From [ADR 0007](../../docs/decisions/0007-module-architecture.md): UI components live in `src/domains/<domain>/ui/` (domain-specific) or `src/components/` (app-level generic). Client code may NOT import server-only modules (`adapters/outbound/`, `lib/db`, `lib/auth`).

## Prior art / Current state

**Existing habits domain** — `src/domains/habits/` (fully implemented)

- **Types:** `/home/user/habit-tracker/src/domains/habits/domain/types.ts:4-47`
  - `Habit` = `{ id, title, category, weekdays, timer }`
  - `HabitCompletion` = `{ habitId, date }`
  - `TodaysHabit` = `{ habit, completed }`
  - `TodaysHabits` = `{ date, items, score }`
  - `DailyScore` = `{ completed, due, ratio }`
- **Use cases:** `/home/user/habit-tracker/src/domains/habits/index.ts:1-30`
  - `listTodaysHabits(deps, userId)` — returns `TodaysHabits`
  - `createHabit(deps, userId, draftHabit)` — creates a new habit
  - `completeHabit(deps, userId, habitId)` — marks habit complete
- **Public API:** Import via `src/domains/habits/index.ts` only (never deep-import internals)

**Identity resolution** — `src/lib/current-user.ts:15-20`

- `getCurrentUserId(): Promise<string | null>` — server-side identity helper
- Returns `null` when no session; protected server functions must reject (not guess)

**UI patterns to reuse:**

- **Page layout:** `/home/user/habit-tracker/src/routes/index.tsx:7-8`
  ```tsx
  <main className="page-wrap px-4 pb-8 pt-14">
    <section className="island-shell rise-in relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14">
  ```
  - `.page-wrap` — centers content (max 1080px)
  - `.island-shell` — glass-morphic card with gradient background
  - `.rise-in` — fade-in-up animation
- **Button pattern:** `/home/user/habit-tracker/src/routes/demo/better-auth.tsx:22-24`
  ```tsx
  className =
    'rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.14)] px-5 py-2.5 text-sm font-semibold text-[var(--lagoon-deep)] no-underline transition hover:-translate-y-0.5 hover:bg-[rgba(79,184,178,0.24)]'
  ```
- **Typography:** `.island-kicker` (uppercase label), `.display-title` (Fraunces serif), `text-[var(--sea-ink-soft)]` (muted text)
- **CSS custom properties:** `/home/user/habit-tracker/src/styles.css:9-63` — semantic color tokens that adapt to light/dark theme
- **Utility helper:** `/home/user/habit-tracker/src/lib/utils.ts:1-7` — `cn()` for classname merging

**Header component** — `src/components/Header.tsx:5-105`

- Currently links to: Home (`/`), About (`/about`), Demo (dropdown with 3 demo routes)
- Includes auth integration via `BetterAuthHeader` component
- Includes `ThemeToggle` component

**Auth component** — `src/integrations/better-auth/header-user.tsx:4-44`

- Shows loading skeleton, sign-out button, or sign-in link
- Uses `authClient.useSession()` hook (client-side)

**Route pattern** — `/home/user/habit-tracker/src/routes/about.tsx:1-5`

```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: About,
})
```

## Data model & relationships

**No new entities.** This plan consumes the existing habits domain:

- **TodaysHabits** — returned by `listTodaysHabits(deps, userId)`
  - `date: LocalDate` (ISO YYYY-MM-DD)
  - `items: TodaysHabit[]` — each has `{ habit, completed }`
  - `score: DailyScore` — `{ completed, due, ratio }`

- **Identity** — `userId: string` comes from `getCurrentUserId()` (server-side)
  - When `null` → no authenticated user → show empty state / sign-in prompt
  - When present → pass to `listTodaysHabits(deps, userId)`

**Dependency verification:**

- `listTodaysHabits` exists: ✅ `/home/user/habit-tracker/src/domains/habits/application/list-todays-habits.ts:20-48`
- `getCurrentUserId` exists: ✅ `/home/user/habit-tracker/src/lib/current-user.ts:15-20`
- Habits domain public API exports both types and use cases: ✅ `/home/user/habit-tracker/src/domains/habits/index.ts:1-30`

## Locked decisions

1. **Routes to remove:** `/about`, `/demo/*` — these are TanStack Start demo pages unrelated to habit tracking.
2. **Routes to keep:** `/` becomes the dashboard; `/demo/better-auth` stays until a real auth route exists (needed for manual verification per [plan 2026-06-13-identity-auth](../approved/2026-06-13-identity-auth.md:113-114)).
3. **Dashboard data source:** Call `listTodaysHabits` use case via a `createServerFn` adapter.
4. **Styling approach:** Reuse existing CSS custom properties (`.page-wrap`, `.island-shell`, `.rise-in`, button patterns) — no new design system.
5. **Auth flow:** If `getCurrentUserId()` returns `null`, show empty state with link to `/demo/better-auth`.

## Open decisions

### 1. Should we create a separate dashboard route (`/dashboard`) or replace the home route (`/`)?

**Recommendation:** Replace `/` (home). The app is a habit tracker; the dashboard IS the home page.

**Trade-off:** Replacing `/` is simpler (one route) and matches user expectations (dashboard is the landing page). A separate `/dashboard` route would require redirecting from `/` anyway.

### 2. Should the dashboard UI live in `src/domains/habits/ui/` or `src/components/`?

**Recommendation:** `src/domains/habits/ui/HabitsDashboard.tsx` (domain-specific).

**Trade-off:** The dashboard displays habit-specific data (`TodaysHabits`, `DailyScore`). It's not generic app-level UI like Header/Footer. Following the architecture, habit-specific components belong in `src/domains/habits/ui/`.

### 3. Should we add a loading skeleton for the dashboard data fetch?

**Recommendation:** Yes — use a simple skeleton (e.g., animated pulse placeholders).

**Trade-off:** Better UX during data fetch, and the pattern already exists in `BetterAuthHeader` (`isPending` state). The lift is small.

### 4. Should we display completed vs. due habits, or just a simple list?

**Recommendation:** Display both completed and due habits in a single list, with visual distinction (e.g., checkmark icon, opacity change).

**Trade-off:** Matches the domain model (`TodaysHabit` has a `completed` boolean) and is simpler than separate lists. Users can see their progress at a glance.

### 5. How should the server function handle unauthenticated requests?

**Recommendation:** Return a typed empty result (`{ date, items: [], score: { completed: 0, due: 0, ratio: 1 } }`) instead of throwing, when `getCurrentUserId()` returns `null`.

**Trade-off:** Throwing forces client-side error handling (error boundary or try/catch). Returning empty data is simpler and matches the "no habits yet" case — the client can render a single empty state component for both scenarios. The auth check is better handled client-side (show sign-in prompt when `useSession()` is null).

**Alternative:** Throw a 401 error and handle it client-side. This is more explicit but adds complexity (error boundaries, separate error state).

### 6. How should we determine the user's timezone for "today"?

**Recommendation:** Accept timezone as a query parameter from the client (browser-detected via `Intl.DateTimeFormat().resolvedOptions().timeZone`), with server-side fallback to UTC.

**Trade-off:** Browser-detected timezone is most accurate for the user's "today" (handles users traveling, etc.). Storing timezone in user profile is heavier (requires DB migration, user settings UI). Server-side only (UTC or server timezone) breaks the use case for users in different timezones.

**Implementation:** Client passes `timeZone` param to server function; server function passes it to `systemClock(timeZone)` when creating the `Clock` adapter.

## Observed conventions

**Staggered animations** — `/home/user/habit-tracker/src/routes/index.tsx:37-66`

- Feature cards use `style={{ animationDelay: \`\${index \* 90 + 80}ms\` }}` for cascade effect
- Could apply this to habit list items for polish

**Server function pattern** — seen in demo routes

- Pattern: `createServerFn().validator().handler()` (not observed in current codebase, but standard TanStack Start pattern)
- For authenticated server functions: call `getCurrentUserId()` first, reject if `null`

**Client-side data fetching** — TanStack Query integration already wired

- Pattern: `useQuery({ queryKey, queryFn })` (seen in demo routes)
- Server functions can be called from client via `queryFn`

## Assumptions to verify (not assume)

✅ **Verified:**

1. `listTodaysHabits` use case exists and is exported from public API — `/home/user/habit-tracker/src/domains/habits/index.ts:1-30`
2. `getCurrentUserId()` helper exists — `/home/user/habit-tracker/src/lib/current-user.ts:15-20`
3. Better Auth is wired and session management works — `/home/user/habit-tracker/src/lib/auth-client.ts:1-3`
4. `authClient.useSession()` hook available for client-side auth state — `/home/user/habit-tracker/src/integrations/better-auth/header-user.tsx:4-44`
5. CSS utility classes (`.page-wrap`, `.island-shell`, etc.) defined — `/home/user/habit-tracker/src/styles.css:260-356`
6. `cn()` helper available for classname merging — `/home/user/habit-tracker/src/lib/utils.ts:1-7`
7. TanStack Router file-based routing works — existing routes in `src/routes/`
8. Route tree generation happens automatically — `src/routeTree.gen.ts` exists

❓ **Not yet verified** (will verify during implementation):

1. Whether inbound adapters (server functions) already exist for habits domain — **need to check `src/domains/habits/adapters/inbound/`**
2. Whether dependency injection setup exists for use cases (passing `Clock`, `HabitRepository`) — **need to check existing adapter wiring**
3. How to obtain user timezone for the `Clock` adapter — **will implement browser-detected timezone passed as query param (see Open Decision #6)**

## What we're NOT doing

- **Detailed UI/UX design** — using existing demo styling only
- **Habit creation UI** — out of scope; dashboard is read-only for now
- **Habit completion interaction** — just displaying completed state, no toggle yet
- **Timer UI** — displaying timer-enabled habits, but no countdown/start button
- **Timezone user settings** — using browser-detected timezone passed as param; no user profile storage
- **Calendar view or historical data** — today's habits only
- **Streaks, analytics, or advanced scoring** — `DailyScore` ratio only
- **PWA features** (service worker, notifications) — deferred per foundation plan
- **New ADRs** — reusing existing decisions only

## Sequencing

### Phase 1: Investigate existing adapters

**Goal:** Determine if inbound adapters (server functions) already exist for `listTodaysHabits`.

**Steps:**

1. Check `src/domains/habits/adapters/inbound/` for existing server functions
2. Verify dependency injection setup (how `Clock` and `HabitRepository` are wired)

**Automated verification:**

```bash
ls -la src/domains/habits/adapters/inbound/ 2>/dev/null || echo "Directory does not exist"
```

**Manual verification:**

- [ ] Confirm whether `listTodaysHabits` server function exists
- [ ] Identify how to wire dependencies (repos, clock) if needed

### Phase 2: Create or wire server function

**Goal:** Ensure a server function exists that calls `listTodaysHabits` use case.

**Steps:**

1. If no inbound adapter exists, create `src/domains/habits/adapters/inbound/list-todays-habits.server.ts`
2. Wire up `getCurrentUserId()` → if `null`, return empty result (see Open Decision #5)
3. Accept `timeZone` param from client (see Open Decision #6)
4. Wire up dependencies: `systemClock(timeZone)`, Drizzle `HabitRepository`
5. Call `listTodaysHabits(deps, userId)` and return result
6. Error contract: Only throw on unexpected errors (DB failure, etc.); unauthenticated returns empty data

**Automated verification:**

```bash
pnpm typecheck
```

**Manual verification:**

- [ ] Server function compiles without errors
- [ ] Server function correctly typed (returns `TodaysHabits`)

### Phase 3: Update Header navigation

**Goal:** Remove demo page links; keep `/demo/better-auth` link; update branding.

**Steps:**

1. Edit `src/components/Header.tsx`
2. Remove "About" link
3. Remove demo dropdown (except keep link to `/demo/better-auth` for auth testing)
4. Update any "TanStack Start Starter" branding to "Habit Tracker"

**Automated verification:**

```bash
pnpm typecheck
pnpm lint
```

**Manual verification:**

- [ ] Header renders without errors
- [ ] Navigation links point to correct routes

### Phase 4: Create dashboard UI component

**Goal:** Build the dashboard component in `src/domains/habits/ui/`.

**Steps:**

1. Create `src/domains/habits/ui/HabitsDashboard.tsx`
2. Accept `TodaysHabits` data as props
3. Render:
   - Daily score (e.g., "3/5 habits completed — 60%")
   - List of habits with checkmark indicator for completed
   - Empty state message when `items.length === 0`: "No habits yet — create one to get started"
4. Use existing styling patterns (`.island-shell`, `.page-wrap`, button classes)
5. Create `src/domains/habits/ui/HabitsDashboardSkeleton.tsx` (loading state component)
   - Renders pulse-animated placeholders for score + habit list
   - Accepts no props; loading state managed by parent via TanStack Query `isPending`

**Automated verification:**

```bash
pnpm typecheck
pnpm lint
```

**Manual verification:**

- [ ] Component renders with mock data (no API call yet)
- [ ] Styling matches existing demo pages

### Phase 5: Replace home route with dashboard

**Goal:** Wire the dashboard component to the home route (`/`).

**Steps:**

1. Edit `src/routes/index.tsx`
2. Detect browser timezone via `Intl.DateTimeFormat().resolvedOptions().timeZone`
3. Call the server function from Phase 2, passing `timeZone` as param
4. Use TanStack Query `useQuery({ queryKey: ['todays-habits', timeZone], queryFn })` for data fetching
5. Handle loading state: render `HabitsDashboardSkeleton` when `isPending`
6. Handle unauthenticated state: use `authClient.useSession()` to check client-side; if `null`, show empty state with link to `/demo/better-auth`
7. Handle authenticated state: render `HabitsDashboard` with fetched data

**Automated verification:**

```bash
pnpm typecheck
pnpm validate
```

**Manual verification:**

- [ ] Dashboard loads when authenticated
- [ ] Empty state / sign-in prompt shows when not authenticated
- [ ] No console errors

### Phase 6: Remove demo routes

**Goal:** Delete unused demo pages (keep `/demo/better-auth`).

**Steps:**

1. Delete `src/routes/about.tsx`
2. Delete `src/routes/demo/tanstack-query.tsx`
3. Delete `src/routes/demo/sentry.testing.tsx`
4. Route tree regenerates automatically via TanStack Start plugin during build/dev
   - Verify deleted routes return 404 during Phase 7 testing
   - Manual `tsr generate` only needed if hot-reload fails

**Automated verification:**

```bash
pnpm typecheck
pnpm validate
pnpm build
```

**Manual verification:**

- [ ] Deleted routes no longer accessible
- [ ] No broken imports or references
- [ ] App builds successfully

### Phase 7: Test end-to-end

**Goal:** Verify the dashboard works in the running app.

**Steps:**

1. Run `pnpm dev`
2. Visit `/` (unauthenticated) → should show empty state / sign-in prompt
3. Visit `/demo/better-auth` → sign up or sign in
4. Visit `/` (authenticated) → should show dashboard (will be empty if no habits created yet)

**Automated verification:**

```bash
pnpm validate
```

**Manual verification:**

- [ ] Dashboard renders without errors when authenticated
- [ ] Empty state renders when not authenticated
- [ ] No TypeScript or lint errors
- [ ] No boundary violations (dependency-cruiser passes)

## Effort estimate

**Size:** Small–Medium

**Breakdown:**

- Phase 1 (investigate): ~5 minutes
- Phase 2 (server function): ~20 minutes (includes timezone wiring + error handling contract)
- Phase 3 (header update): ~10 minutes
- Phase 4 (dashboard UI + skeleton): ~40 minutes (includes empty state messaging)
- Phase 5 (wire route): ~25 minutes (includes timezone detection + auth state handling)
- Phase 6 (remove demo routes): ~10 minutes
- Phase 7 (E2E test): ~15 minutes

**Total:** ~120–150 minutes (2–2.5 hours) assuming no blockers.

**Risk factors:**

- If dependency injection for use cases isn't wired yet, Phase 2 could take 10–15 minutes longer
- If `HabitRepository` or `systemClock` implementations have bugs, could require debugging
- Timezone handling adds complexity; edge case testing (crossing day boundary) could surface issues

**Confidence:** Medium-High — domain logic exists; main unknowns are DI wiring pattern and timezone handling edge cases.
