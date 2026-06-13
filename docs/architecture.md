# Architecture

The canonical reference for how this codebase is structured and the dependency rules the
boundary gate enforces. The decision is recorded in
[ADR 0007](decisions/0007-module-architecture.md); this is the detailed rulebook.

## Two axes

- **Feature domains** (vertical): `src/domains/<domain>/` — business capability slices
  (`habits`, later `auth`, …). Registered in [`domains.md`](domains.md).
- **Architectural layers** (horizontal): `domain → application → adapters`, plus the
  cross-cutting **server/client** boundary and the **shared kernels**.

## Directory structure

```
src/
  domains/<domain>/
    domain/            pure: entities, value objects, pure functions. No framework/ORM/clock/Date/I/O.
    application/       use cases (inbound ports) + outbound port interfaces. Depends only on domain + shared.
    adapters/
      inbound/         driving adapters: createServerFn handlers calling use cases.   [SERVER]
      outbound/        driven adapters: Drizzle repos, clock, notifier impls.          [SERVER]
    ui/                this domain's React components.                                  [CLIENT]
    index.ts           the domain's PUBLIC API — the only entry other modules may import.
  shared/              shared kernel: PURE, domain-agnostic helpers/types. Importable by anyone.
  lib/                 infrastructure/framework glue: db client, auth, env.             [SERVER]
  components/          app-level generic UI (Header, Footer).                           [CLIENT]
  routes/              TanStack file routes. THIN: import domain public APIs + wire.
```

## Dependency rules (inward only)

| Layer                | May import                                                                            | May NOT import                                                    |
| -------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `shared/`            | external pure libs                                                                    | anything in `domains/`, `lib/`, framework server APIs             |
| `domain/`            | own `domain/`, `shared/`                                                              | `application/`, `adapters/`, `lib/`, ORM, framework, `Date.now()` |
| `application/`       | own `domain/`, `shared/`                                                              | `adapters/`, `lib/`, framework                                    |
| `adapters/outbound/` | own `application/`+`domain/`, `lib/`, `shared/`, external                             | another domain's internals, `ui/`                                 |
| `adapters/inbound/`  | own `application/`+`domain/`, own `adapters/outbound/` (wiring), `shared/`, framework | another domain's internals, `ui/`                                 |
| `ui/` (client)       | own `application/` (types/contracts), `shared/`, `components/`, framework             | `adapters/outbound/`, `lib/db`, `lib/auth`, any `*.server.ts`     |
| `routes/`            | domain **public APIs** (`index.ts`), `components/`, `shared/`                         | a domain's internal paths                                         |
| `lib/`               | external                                                                              | `domains/`, `domain/`, `application/`, `ui/`                      |

## Cross-cutting rules

- **Server/client boundary.** Client code (`ui/`, `components/`, route components) must not import
  server-only modules (`adapters/outbound/**`, `lib/db*`, `lib/auth` internals, `*.server.ts`).
  Inbound adapters (`createServerFn`) are the sanctioned bridge across the boundary.
- **Public API per domain.** Other modules import a domain only via `domains/<d>/index.ts`. Deep
  imports across domains are forbidden.
- **No cross-domain coupling.** A domain references another only through its public API, and
  rarely; prefer the shared kernel for genuinely common code.
- **No circular dependencies; no orphan modules.**

## Shared kernels — two tiers

- **`src/shared/`** — PURE, domain-agnostic (formatting, generic types, pure date helpers). The
  domain core MAY import this.
- **`src/lib/`** — INFRASTRUCTURE (db client, auth, env). Server-ish. The domain core may **not**
  import this; only adapters and routes do.

The distinction is what lets the boundary rule say "the core may import `shared`, never `lib`."

## Composition

Wiring concrete outbound adapters (e.g. a Drizzle repository, `SystemClock`) and injecting them
into a use case happens in the **inbound adapter** (or a small per-domain composition module) —
never in the domain or application core, which depend only on the port interfaces.

## Dependency direction (summary)

```
shared  ←  domain  ←  application  ←  adapters (inbound/outbound)  ←  routes
                          ↑                                          ↑
                          └────────────── ui (client) ──────────────┘
lib (infra)  ──used by──>  adapters / routes only   (never by domain/application/ui-as-client-secret)
```

Everything points inward toward `domain`. The boundary gate (dependency-cruiser) makes these
rules executable; its config is added with the first domain.
