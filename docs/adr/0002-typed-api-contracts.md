# ADR 0002: Typed API contracts between islands and `routes/api`

- **Status:** Proposed
- **Date:** 2026-11-20

## Context

Islands called `routes/api/*` with hand-written `fetch` calls, and each API route
parsed `FormData`, validated fields and built JSON `Response`s by hand. Request
and response shapes were duplicated (and drifted, e.g. client-only password
checks), and error responses had no common shape.

We considered Danet (NestJS-style framework with OpenAPI generation) and Hono RPC.
Both bring a second router alongside Fresh file routing; OpenAPI mainly pays off
for external or non-TS consumers, which we don't have.

## Decision

A small in-repo contract layer under `api/`, using valibot schemas:

| File | Role | Imported by |
|------|------|-------------|
| `api/contract.ts` | `endpoint()`, shared types, error body shape | both |
| `api/contracts/<area>.ts` | One `endpoint()` per API route + wire DTOs | both |
| `api/server.ts` | `handle(contract, fn)` → Fresh handler; `ApiError` | `routes/` only |
| `api/client.ts` | `fetchApi(contract, input)` → `ApiResult` | islands |

Rules:

- `api/contract.ts` and `api/contracts/*` must not import server-only code
  (`models/*`, `mongodb`, `bcrypt`, `utils/db.ts`). They define **wire DTOs**
  (string ids, no `Date`/`ObjectId`); handlers map from model types.
- `handle()` validates input (JSON, form posts or query string), maps
  `ConflictError` → 409, `NotFoundError` → 404, `ApiError` → its status, and
  anything else → 500.
- Every error response is `{ error: { code, message, fields? } }`.
- `fetchApi()` validates input before fetching and never throws.
- Path params are declared as `:name` in the contract path (e.g.
  `/api/users/:id` ↔ `routes/api/users/[id].ts`) and are part of the input
  schema. `fetchApi()` fills them into the URL; `handle()` merges `ctx.params`
  into the input, overriding any body value of the same name.
- Plain page-route form posts (e.g. `routes/teams`) stay as they are; the
  contract layer is for islands that need data without a page reload.

## Consequences

### Positive

- Contract changes break compilation on both sides instead of at runtime
- Validation rules (e.g. password match) run in the island and on the server
- API routes shrink to the domain call plus response mapping

### Negative

- One more dependency (valibot, ~a few kB in island bundles)
- Contracts must be kept free of server imports by convention

### Neutral

- No OpenAPI spec; one could be generated later from the valibot schemas
  (`@valibot/to-json-schema`) if an external consumer appears
