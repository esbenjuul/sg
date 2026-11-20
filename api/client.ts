/**
 * Client half of the contract layer. Safe to import from islands.
 */
import * as v from "valibot";
import {
  type ApiErrorBody,
  type ApiResult,
  type Endpoint,
  type InputOf,
  type OutputOf,
  validationError,
} from "./contract.ts";

/**
 * Calls an endpoint. Input is validated locally first, so invalid input
 * never hits the network and returns the same `validation` error shape the
 * server would. Never throws — network failures become `code: "network"`.
 */
export async function fetchApi<E extends Endpoint>(
  contract: E,
  input: InputOf<E>,
  init: { signal?: AbortSignal } = {},
): Promise<ApiResult<OutputOf<E>>> {
  const parsed = v.safeParse(contract.input, input);
  if (!parsed.success) {
    return { ok: false, status: 400, error: validationError(parsed.issues) };
  }

  const hasQuery = contract.method === "GET" || contract.method === "DELETE";
  const url = hasQuery
    ? `${contract.path}?${new URLSearchParams(input as Record<string, string>)}`
    : contract.path;

  let res: Response;
  try {
    res = await fetch(url, {
      method: contract.method,
      headers: hasQuery ? undefined : { "Content-Type": "application/json" },
      // Send the raw input; the server re-validates and applies transforms.
      body: hasQuery ? undefined : JSON.stringify(input),
      signal: init.signal,
    });
  } catch {
    return {
      ok: false,
      status: 0,
      error: { code: "network", message: "Network error. Please try again." },
    };
  }

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const error = (body as ApiErrorBody | null)?.error ??
      { code: "internal", message: `Request failed (${res.status})` };
    return { ok: false, status: res.status, error };
  }
  return { ok: true, data: body as OutputOf<E> };
}

/** Reads a <form> into a plain object for `fetchApi()`. */
export function formToObject(form: HTMLFormElement): Record<string, string> {
  return Object.fromEntries(
    [...new FormData(form).entries()].filter(([, val]) =>
      typeof val === "string"
    ),
  ) as Record<string, string>;
}
