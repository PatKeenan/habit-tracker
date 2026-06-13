// Boundary gate — encodes the module architecture (ADR 0007 / docs/architecture.md).
// Run via `depcruise src` (wired into `pnpm validate`). Rules target src/domains/**;
// non-domain scaffolding (demos, lib) is only subject to the global no-circular rule.

/** @type {import('dependency-cruiser').IConfiguration} */
export default {
  forbidden: [
    {
      name: 'no-circular',
      comment:
        'Circular dependencies make the graph hard to reason about and test.',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
    {
      name: 'domain-core-stays-pure',
      comment:
        'A domain core (domains/<d>/domain) may import only its own domain layer and the pure ' +
        'shared kernel — never application, adapters, lib, framework, or ORM.',
      severity: 'error',
      from: {
        path: '^src/domains/[^/]+/domain/',
        pathNot: ['\\.(test|spec)\\.ts$'],
      },
      to: { pathNot: ['^src/domains/[^/]+/domain/', '^src/shared/'] },
    },
    {
      name: 'application-stays-framework-free',
      comment:
        'A domain application layer may import only its own domain + application and the shared ' +
        'kernel — never adapters, lib, or framework.',
      severity: 'error',
      from: {
        path: '^src/domains/[^/]+/application/',
        pathNot: ['\\.(test|spec)\\.ts$'],
      },
      to: {
        pathNot: ['^src/domains/[^/]+/(domain|application)/', '^src/shared/'],
      },
    },
    {
      name: 'no-cross-domain-internals',
      comment:
        'A domain may not deep-import another domain. Cross-domain access goes through the ' +
        'public API (domains/<d>/index.ts) only.',
      severity: 'error',
      from: { path: '^src/domains/([^/]+)/' },
      to: { path: '^src/domains/', pathNot: '^src/domains/$1/' },
    },
    {
      name: 'no-server-only-in-domain-ui',
      comment:
        'Client UI must not import server-only modules (outbound adapters, db/auth infra, *.server.ts).',
      severity: 'error',
      from: { path: '^src/domains/[^/]+/ui/' },
      to: {
        path: [
          '^src/domains/[^/]+/adapters/outbound/',
          '^src/lib/(db|auth)',
          '\\.server\\.',
        ],
      },
    },
  ],
  options: {
    tsConfig: { fileName: 'tsconfig.json' },
    tsPreCompilationDeps: true,
    doNotFollow: { path: 'node_modules' },
    exclude: { path: ['node_modules', 'routeTree\\.gen\\.ts$'] },
  },
}
