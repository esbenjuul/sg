# ADR 0001: Per-module models facade

- **Status:** Accepted
- **Date:** 2026-09-21

## Context

Persistence lived in flat files under `models/<name>/<name>.ts`. Those files mixed Mongo collection access, domain rules (password hashing, imports), and public types. Routes and middleware imported those files directly, so internals and the public API were the same surface.

We considered a single root facade (e.g. `models/index.ts` exporting every aggregate) so callers would have one entry point for all database interactions.

## Decision

Every aggregate under `models/<name>/` uses the same layout:

| File | Role |
|------|------|
| `types.ts` | Domain types and public DTOs |
| `repository.ts` | Mongo I/O only |
| `service.ts` | Domain rules on top of the repository |
| `index.ts` | **Facade** — the only public import surface for that aggregate |

Callers import from the module facade only, for example:

```ts
import { createTeam, type Team } from "@/models/team/index.ts";
import { findUserById, type UserResponse } from "@/models/user/index.ts";
```

Shared concerns:

- Connection lifecycle stays in `utils/db.ts`
- Shared domain/persistence errors live in `models/errors.ts`
- There is **no** root mega-facade that re-exports all aggregates

## Consequences

### Positive

- Uniform structure for new domains (`user`, `team`, `resource`, …)
- Clear public API per aggregate; repository stays private to the module
- Domain logic can grow in `service.ts` without bloating routes
- Safer to evolve DTOs (e.g. never leaking password hashes from list endpoints)

### Negative

- More files per aggregate than a single flat model file
- Cross-entity features require importing more than one facade (or a later dedicated helper)

### Neutral

- Route-level dependency injection seams (e.g. `CreateTeamDeps`) remain and default to facade exports

## Alternatives considered

1. **Keep flat model files** — simplest, but already mixing concerns and leaking internals.
2. **Single root `models/index.ts` facade** — one import path, but couples all aggregates and tends to become a junk drawer.
3. **Generic `Repository<T>` / ODM** — premature for a small number of collections; adds abstraction without clear payoff yet.
