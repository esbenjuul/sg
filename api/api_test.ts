import { assertEquals } from "jsr:@std/assert@^1";
import type { Context } from "fresh";
import { ConflictError } from "@/models/errors.ts";
import { fetchApi } from "./client.ts";
import { signup } from "./contracts/auth.ts";
import { updateUser } from "./contracts/user.ts";
import { ApiError, handle } from "./server.ts";

const fakeCtx = (req: Request) => ({ req }) as unknown as Context<unknown>;

const jsonPost = (body: unknown) =>
  new Request("http://x/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const valid = {
  name: " Ada ",
  email: " ADA@Example.com ",
  password: "secret1",
  passwordConfirm: "secret1",
};

const okUser = {
  id: "1",
  email: "ada@example.com",
  name: "Ada",
  role: "member" as const,
};

Deno.test("handle: validates, transforms, uses successStatus and headers", async () => {
  let seen: unknown;
  const h = handle(signup, ({ input, headers }) => {
    seen = input;
    headers.append("Set-Cookie", "session=abc");
    return { user: okUser };
  });

  const res = await h(fakeCtx(jsonPost(valid)));

  assertEquals(res.status, 201);
  assertEquals(res.headers.get("Set-Cookie"), "session=abc");
  assertEquals(await res.json(), { user: okUser });
  assertEquals(seen, { ...valid, name: "Ada", email: "ada@example.com" });
});

Deno.test("handle: accepts form posts too", async () => {
  const form = new FormData();
  for (const [k, v] of Object.entries(valid)) form.set(k, v);
  const h = handle(signup, () => ({ user: okUser }));

  const res = await h(
    fakeCtx(new Request("http://x", { method: "POST", body: form })),
  );
  assertEquals(res.status, 201);
});

Deno.test("handle: returns field errors on invalid input", async () => {
  const h = handle(signup, () => ({ user: okUser }));
  const res = await h(fakeCtx(jsonPost({ ...valid, passwordConfirm: "nope" })));

  assertEquals(res.status, 400);
  const body = await res.json();
  assertEquals(body.error.code, "validation");
  assertEquals(body.error.fields, {
    passwordConfirm: ["Passwords do not match"],
  });
});

Deno.test("handle: maps domain and api errors", async () => {
  const conflict = handle(signup, () => {
    throw new ConflictError("User already exists");
  });
  const res1 = await conflict(fakeCtx(jsonPost(valid)));
  assertEquals(res1.status, 409);
  assertEquals((await res1.json()).error, {
    code: "conflict",
    message: "User already exists",
  });

  const unauthorized = handle(signup, () => {
    throw new ApiError(401, "unauthorized", "Nope");
  });
  assertEquals((await unauthorized(fakeCtx(jsonPost(valid)))).status, 401);
});

Deno.test("handle: malformed JSON is a 400, not a 500", async () => {
  const h = handle(signup, () => ({ user: okUser }));
  const req = new Request("http://x", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{not json",
  });
  assertEquals((await h(fakeCtx(req))).status, 400);
});

Deno.test("fetchApi: rejects invalid input locally without fetching", async () => {
  const realFetch = globalThis.fetch;
  let fetched = false;
  globalThis.fetch = () => {
    fetched = true;
    return Promise.reject();
  };
  try {
    const res = await fetchApi(signup, {
      ...valid,
      password: "1",
      passwordConfirm: "1",
    });
    assertEquals(fetched, false);
    assertEquals(res.ok, false);
    if (!res.ok) {
      assertEquals(res.error.fields?.password, [
        "Password must be at least 6 characters",
      ]);
    }
  } finally {
    globalThis.fetch = realFetch;
  }
});

Deno.test("fetchApi: round-trips through handle()", async () => {
  const h = handle(signup, () => ({ user: okUser }));
  const realFetch = globalThis.fetch;
  globalThis.fetch = (url, init) =>
    h(fakeCtx(new Request(new URL(String(url), "http://x"), init)));
  try {
    const res = await fetchApi(signup, valid);
    assertEquals(res, { ok: true, data: { user: okUser } });
  } finally {
    globalThis.fetch = realFetch;
  }
});

Deno.test("fetchApi: fills path params and leaves them out of the body", async () => {
  const realFetch = globalThis.fetch;
  let seen: { url: string; method?: string; body: unknown } | undefined;
  globalThis.fetch = (url, init) => {
    seen = {
      url: String(url),
      method: init?.method,
      body: JSON.parse(String(init?.body)),
    };
    return Promise.resolve(Response.json({ user: {} }));
  };
  try {
    await fetchApi(updateUser, {
      id: "507f1f77bcf86cd799439011",
      name: "Ada",
    });
    assertEquals(seen, {
      url: "/api/users/507f1f77bcf86cd799439011",
      method: "PATCH",
      body: { name: "Ada" },
    });
  } finally {
    globalThis.fetch = realFetch;
  }
});
