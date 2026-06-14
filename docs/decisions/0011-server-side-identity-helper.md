---
number: 0011
title: Server-side identity via a single getCurrentUserId helper
date: 2026-06-13
status: accepted
---

## Context

Feature domains scope their data by `userId: string` — the habits use cases and ports take
a user id by argument (per [ADR 0001](0001-hexagonal-architecture.md), the core takes
everything it needs as input and reads no ambient request state). Something at the boundary
must resolve "who is the current user?" from the request and hand that id inward. Before this
plan there was no server-side mechanism to do so — `auth.api.getSession` appeared nowhere in
`src`.

We need one obvious, reusable seam for that resolution, with an unambiguous contract for the
unauthenticated case, so that protected server functions don't each reinvent session reading
or silently guess a user.

## Decision

A single helper `getCurrentUserId(): Promise<string | null>` in `src/lib` is the server-side
identity boundary. It reads the session via
`auth.api.getSession({ headers: getRequest().headers })` and returns the user id, or `null`
when there is no session.

**Contract:** `null` means "no authenticated user." Protected server functions reject on
`null` (401 / throw) rather than substituting a default or guessing. The helper resolves
identity; it does not decide authorization policy — callers do.

## Consequences

- One place reads the session; domains keep receiving `userId` by argument and stay free of
  request/ambient-state coupling.
- The unauthenticated path is explicit (`null`), so "forgot to check auth" is a visible
  omission at the call site rather than a silent default user.
- `getCurrentUserId` is the seam to extend later (e.g. richer principals) without touching
  domain cores.
- Server-only: it depends on `getRequest()` and must never be imported into client code,
  per CLAUDE.md's server/client boundary invariant.

## Alternatives rejected

- **Calling `auth.api.getSession` directly in each server function:** duplicates session
  plumbing and invites divergent unauthenticated handling.
- **Returning a full user/session object:** domains need only the id; a narrow `string | null`
  keeps the boundary minimal and the mapping at the edge.
- **Throwing inside the helper on no session:** conflates identity resolution with
  authorization policy; leaving it `null` lets callers decide (reject, redirect, or treat as
  anonymous).
