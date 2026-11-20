/**
 * Shared contract primitives. Imported by BOTH server and islands, so this
 * file (and everything under `api/contracts/`) must never import server-only
 * code (mongodb, bcrypt, models/*, utils/db.ts, ...).
 */
import * as v from "valibot";

// deno-lint-ignore no-explicit-any
export type AnySchema = v.GenericSchema<any, any>;

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface Endpoint<
  TInput extends AnySchema = AnySchema,
  TOutput extends AnySchema = AnySchema,
> {
  method: HttpMethod;
  path: string;
  input: TInput;
  output: TOutput;
  /** Status code used on success. Defaults to 200. */
  successStatus?: number;
}

/** Identity helper that keeps the literal schema types for inference. */
export function endpoint<TInput extends AnySchema, TOutput extends AnySchema>(
  def: Endpoint<TInput, TOutput>,
): Endpoint<TInput, TOutput> {
  return def;
}

/** What the caller sends (before validation/transforms). */
export type InputOf<E extends Endpoint> = v.InferInput<E["input"]>;
/** What the caller receives. */
export type OutputOf<E extends Endpoint> = v.InferOutput<E["output"]>;

export type ApiErrorCode =
  | "bad_request"
  | "validation"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "internal"
  | "network";

/** Wire format for every non-2xx response produced by `handle()`. */
export interface ApiErrorBody {
  error: {
    code: ApiErrorCode;
    message: string;
    /** Per-field messages, keyed by dot path (e.g. "passwordConfirm"). */
    fields?: Record<string, string[]>;
  };
}

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: ApiErrorBody["error"] };

/** Turns valibot issues into the shared `validation` error shape. */
export function validationError(
  issues: [v.BaseIssue<unknown>, ...v.BaseIssue<unknown>[]],
): ApiErrorBody["error"] {
  const flat = v.flatten(issues);
  return {
    code: "validation",
    message: flat.root?.[0] ?? Object.values(flat.nested ?? {})[0]?.[0] ??
      "Invalid input",
    fields: flat.nested as Record<string, string[]> | undefined,
  };
}

/**
 * Fills `:param` segments of `path` from `input`. Returns the URL path and the
 * remaining input (params removed) to send as body or query string.
 */
export function fillPath(
  path: string,
  input: Record<string, unknown>,
): { path: string; rest: Record<string, unknown> } {
  const rest = { ...input };
  const filled = path.replace(/:(\w+)/g, (_, name: string) => {
    const value = rest[name];
    delete rest[name];
    return encodeURIComponent(String(value ?? ""));
  });
  return { path: filled, rest };
}
