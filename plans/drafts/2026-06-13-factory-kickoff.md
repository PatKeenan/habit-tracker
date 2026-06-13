---
title: Factory Kickoff Brief (handoff prompt for a new repo)
date: 2026-06-13
status: draft
author: Pat Keenan
related:
  - ../approved/2026-06-13-foundation-and-architecture.md
---

# Factory Kickoff Brief

This is a **handoff artifact**, not a plan for the habit-tracker repo. It is the prompt to
give a fresh coding agent in a **new, empty repository** to bootstrap the AI software
factory. Copy the fenced block below into that agent. The notes above the block are context
for us, not for the agent.

## Context for us (not part of the prompt)

- The factory is a _separate_ system from the product (`habit-tracker`). It operates on
  product repos like an external robotic contributor: clone/worktree → branch → PR →
  validation gate → gated merge. It never edits a live working tree.
- Durable execution: **Trigger.dev v3** (chosen for long-running, checkpointed tasks — a
  coding-agent run is a long task). Swappable for Inngest if needed. **Not Elixir** — the
  stack is all-TypeScript and a second runtime isn't worth it.
- Event ingestion: do **not** rely on Postgres `LISTEN/NOTIFY` (not durable; needs a
  persistent connection, which fights Neon serverless). Emit an app event to Trigger.dev
  from the intake handler, or have Trigger.dev poll a `submissions` table (Symphony's
  approach). Keep trigger logic in readable, testable TypeScript, not DB triggers.
- Milestone 1 is **triage only** — turn an intake submission into a triaged Linear ticket.
  The orchestrator and the code-writing worker agents come later, once triage proves out.

---

## THE PROMPT (copy from here)

You are bootstrapping a new, standalone repository: an **AI software factory** — a durable,
event-driven system that turns user-submitted requests into triaged Linear tickets, and
(in later milestones) dispatches coding agents that work those tickets to PRs. This repo is
_separate_ from the products it will eventually build for; it operates on product repos as
an external contributor (clone → branch → PR → gated merge), never editing a live tree.

### Stack (fixed)

- **Hono** — HTTP server / API.
- **Better Auth** — authentication (admin login for the dashboard).
- **Mastra** — the agent framework (define agents, tools, workflows in TypeScript).
- **Neon Postgres + Drizzle ORM** (Neon serverless driver) — persistence.
- **Trigger.dev v3** — durable execution for long-running, checkpointed background tasks.
- **Railway** — deployment target.
- **Railway SDK** — SDK for kicking off work, cloning repos, etc.
- **Braintrust** — evals.
- **Braintrust SDK** — SDK for writing evals.
- **Linear** — ticket tracker.
- **Linear SDK** — SDK for writing Linear tickets.
- TypeScript throughout. Package manager: pnpm.

### Engineering principles (non-negotiable — mirror the product repo)

1. **Readability over cleverness.** Clear names, small functions, obvious control flow. If a
   clever line needs a comment to be understood, rewrite it plainly.
2. **Hexagonal architecture (ports & adapters).** A pure domain/application core that imports
   no framework, no ORM, no LLM SDK, no clock. Everything it needs — the current time, the
   LLM, the ticket tracker, persistence — is injected as a port (interface the core owns).
   Mastra agents, the Linear client, Drizzle repos, and Hono handlers are all **adapters**.
3. **Everything testable without I/O.** The triage _decision logic_ must be unit-testable
   with fakes and zero network. The LLM and Linear calls live behind ports so tests inject
   stubs.
4. **The core owns its types.** ORM rows, HTTP payloads, and LLM responses are mapped to
   domain types at the boundary; they never leak inward as the domain model.
5. **Enforce boundaries with tooling.** Add `dependency-cruiser` rules: core stays pure,
   no cross-domain imports (backreference rule), server-only never imported into client,
   no cycles. Wire it into a `validate` script (typecheck + dependency-cruiser + tests +
   evals) that fails CI on violation.
6. **Documentation discipline.** Create a thin `CLAUDE.md` (invariants + pointers only),
   a `docs/decisions/` ADR log (short records of what/why/rejected), and a `plans/` folder
   (`drafts/` → `approved/`, files named `YYYY-MM-DD-<slug>.md`). Record every architectural
   decision as an ADR.

### Evals are mandatory from day one (the whole point of this system)

Every agent — starting with the triage agent — ships with **Braintrust evals backed by
synthetic data**. No agent is "done" without an eval that measures its quality and gives
coverage. Structure the triage agent so its judgment is eval-able:

- Deterministic parts (validation, routing rules) → plain unit tests.
- LLM judgment (classification, priority, summary quality) → Braintrust eval over a
  synthetic dataset of submissions with expected triage outcomes, with scorers for
  category-match, priority-sanity, and summary quality.

### Milestone 1 — Intake → Triage → Linear ticket (build only this)

1. **Scaffold & deploy.** Hono app + Better Auth + Neon/Drizzle + Trigger.dev v3, deployable
   to Railway. Health check, env validation (Zod), migrations.
2. **Intake.** A `submissions` table and an endpoint/form where users submit a feature
   request or support/problem report (title, body, optional category, contact). Inserts a
   row with `status = 'new'`.
3. **Triage agent (Mastra).** Given a submission, it classifies type (feature / bug /
   support / noise), assigns a priority, writes a clean title + summary, and decides whether
   it warrants a ticket. The decision logic is a pure use case behind ports; the LLM is one
   outbound port, Linear is another.
4. **Durable trigger.** A Trigger.dev task processes new submissions — either invoked by an
   event the intake handler emits, or by polling `status = 'new'` (do **not** use Postgres
   LISTEN/NOTIFY). On success it creates a **Linear ticket** and sets the submission to
   `triaged` with the ticket id. Idempotent and retry-safe.
5. **Dashboard (Symphony-style, read-only).** An admin-authed view listing submissions,
   their triage status/result, and the Linear tickets created. Observability only — it never
   mutates product code.
6. **Eval.** A Braintrust eval for the triage agent over a synthetic submissions dataset,
   runnable in the `validate` gate.

### Explicit non-goals for Milestone 1 (do NOT build yet)

- The orchestration agent that decides which domains a ticket touches.
- The worker coding agents that write code / open PRs.
- Worktree isolation, the product-repo validation gate, multi-agent dispatch.
- Replacing Linear with anything; reading from CSVs (the form supersedes the CSV idea).

These come in later milestones, after triage is proven and eval'd.

### Deliverables

- A running Railway deployment of the Hono app + intake + dashboard.
- The triage flow working end-to-end: submission → durable triage → Linear ticket.
- `CLAUDE.md`, the ADR log, and an approved Milestone-1 plan.
- A passing `validate` gate (typecheck + dependency-cruiser + tests) and a Braintrust eval
  for the triage agent.

Before writing code: confirm your understanding of the architecture, propose the initial
folder layout and the triage agent's ports, and record the stack choices as ADRs. Then build
the smallest end-to-end slice first (one submission → one Linear ticket), and grow from there.

## END OF PROMPT
