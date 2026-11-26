/**
 * Server half of the contract layer. Only import this from `routes/`.
 */
import type { Context } from "fresh";
import * as v from "valibot";
import { ConflictError, NotFoundError } from "@/models/errors.ts";
import {
  type ApiErrorBody,
  type ApiErrorCode,
  type Endpoint,
  type OutputOf,
  validationError,
} from "./contract.ts";

/** Throw from a handler to return a specific status + error code. */
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: ApiErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Throws 401 when signed out and 403 unless the user is an admin. */
export function requireAdmin(
  user: { role: string } | undefined,
  /** Completes "Kun administratorer kan …", e.g. "oprette hold". */
  action: string,
): void {
  if (!user) {
    throw new ApiError(401, "unauthorized", "Du skal være logget ind");
  }
  if (user.role !== "admin") {
    throw new ApiError(403, "forbidden", `Kun administratorer kan ${action}`);
  }
}

export interface HandlerArgs<E extends Endpoint, S> {
  /** Validated (and transformed) input. */
  input: v.InferOutput<E["input"]>;
  ctx: Context<S>;
  /** Extra response headers, e.g. Set-Cookie. */
  headers: Headers;
}

export type ContractHandler<E extends Endpoint, S> = (
  args: HandlerArgs<E, S>,
) => Promise<OutputOf<E>> | OutputOf<E>;

/**
 * Wraps a contract handler as a Fresh route handler:
 * read body/query → validate → run → JSON response, with domain errors
 * mapped to HTTP statuses.
 */
export function handle<E extends Endpoint, S>(
  contract: E,
  fn: ContractHandler<E, S>,
): (ctx: Context<S>) => Promise<Response> {
  return async (ctx) => {
    let raw: unknown;
    try {
      // Path params (e.g. `:id` from routes/api/users/[id].ts) override the body.
      raw = { ...(await readInput(contract, ctx.req)), ...ctx.params };
    } catch {
      return errorResponse(400, {
        code: "bad_request",
        message: "Malformed request body",
      });
    }

    const parsed = v.safeParse(contract.input, raw);
    if (!parsed.success) {
      return errorResponse(400, validationError(parsed.issues));
    }

    const headers = new Headers();
    try {
      const output = await fn({ input: parsed.output, ctx, headers });
      headers.set("Content-Type", "application/json");
      return new Response(JSON.stringify(output), {
        status: contract.successStatus ?? 200,
        headers,
      });
    } catch (error) {
      return fromThrown(error, contract);
    }
  };
}

async function readInput(
  contract: Endpoint,
  req: Request,
): Promise<Record<string, unknown>> {
  if (contract.method === "GET" || contract.method === "DELETE") {
    return Object.fromEntries(new URL(req.url).searchParams);
  }
  const type = req.headers.get("content-type") ?? "";
  if (type.includes("application/json")) {
    const body = await req.json();
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      throw new Error("Expected a JSON object");
    }
    return body;
  }
  // Plain <form> posts / curl -F still work.
  const form = await req.formData();
  return Object.fromEntries(
    [...form.entries()].filter(([, val]) => typeof val === "string"),
  );
}

function fromThrown(error: unknown, contract: Endpoint): Response {
  if (error instanceof ApiError) {
    return errorResponse(error.status, {
      code: error.code,
      message: error.message,
    });
  }
  if (error instanceof ConflictError) {
    return errorResponse(409, { code: "conflict", message: error.message });
  }
  if (error instanceof NotFoundError) {
    return errorResponse(404, { code: "not_found", message: error.message });
  }
  console.error(`${contract.method} ${contract.path} failed:`, error);
  return errorResponse(500, {
    code: "internal",
    message: "Internal server error",
  });
}

function errorResponse(status: number, error: ApiErrorBody["error"]) {
  return Response.json({ error } satisfies ApiErrorBody, { status });
}
