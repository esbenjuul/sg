import { assertEquals } from "jsr:@std/assert@^1";
import type { Context } from "fresh";
import { ConflictError } from "@/models/errors.ts";
import type { CreateUserInput, UserProfile } from "@/models/user/index.ts";
import type { State } from "@/utils/state.ts";
import { type CreateUserDeps, createUserHandler } from "./index.ts";

type Who = State["user"];
const member: Who = {
  _id: "507f1f77bcf86cd799439012",
  email: "m@x.dk",
  name: "Member",
  role: "member",
};
const admin: Who = {
  _id: "507f1f77bcf86cd799439011",
  email: "a@x.dk",
  name: "Admin",
  role: "admin",
};

function post(body: unknown, user: Who) {
  const req = new Request("http://x/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return { req, params: {}, state: { user } } as unknown as Context<State>;
}

function fakeDeps(fail?: Error) {
  const calls: CreateUserInput[] = [];
  const deps: CreateUserDeps = {
    createUser: (input) => {
      calls.push(input);
      if (fail) return Promise.reject(fail);
      return Promise.resolve(
        {
          _id: "507f1f77bcf86cd799439099",
          email: input.email,
          name: input.name,
          role: "member",
          status: "inactive",
          mobile: input.mobile ?? "",
          birthday: input.birthday ?? "",
          createdAt: new Date("2026-01-01T00:00:00Z"),
          updatedAt: new Date("2026-01-01T00:00:00Z"),
        } satisfies UserProfile,
      );
    },
  };
  return { deps, calls };
}

Deno.test("POST /api/users creates a user and returns 201", async () => {
  const { deps, calls } = fakeDeps();
  const res = await createUserHandler(deps)(post({
    name: " Alice Example ",
    email: "Alice@Example.com",
    password: "secret123",
    mobile: "+4512345678",
    birthday: "",
  }, admin));

  assertEquals(res.status, 201);
  assertEquals(calls, [{
    name: "Alice Example",
    email: "alice@example.com",
    password: "secret123",
    mobile: "+4512345678",
    birthday: undefined,
  }]);
  const body = await res.json();
  assertEquals(body.user.id, "507f1f77bcf86cd799439099");
  assertEquals(body.user.email, "alice@example.com");
});

Deno.test("POST /api/users returns field errors for invalid input", async () => {
  const { deps, calls } = fakeDeps();
  const res = await createUserHandler(deps)(
    post({ name: "", email: "nope", password: "123" }, admin),
  );

  assertEquals(res.status, 400);
  const { error } = await res.json();
  assertEquals(error.code, "validation");
  assertEquals(Object.keys(error.fields).sort(), [
    "email",
    "name",
    "password",
  ]);
  assertEquals(calls.length, 0);
});

Deno.test("POST /api/users returns 409 when the email is taken", async () => {
  const { deps } = fakeDeps(new ConflictError("User already exists"));
  const res = await createUserHandler(deps)(post({
    name: "Alice",
    email: "alice@example.com",
    password: "secret123",
  }, admin));

  assertEquals(res.status, 409);
  assertEquals((await res.json()).error.code, "conflict");
});

Deno.test("POST /api/users requires a signed-in user", async () => {
  const { deps, calls } = fakeDeps();
  const res = await createUserHandler(deps)(post({
    name: "Alice",
    email: "alice@example.com",
    password: "secret123",
  }, undefined));

  assertEquals(res.status, 401);
  assertEquals(calls.length, 0);
});

Deno.test("POST /api/users is admin-only", async () => {
  const { deps, calls } = fakeDeps();
  const res = await createUserHandler(deps)(post({
    name: "Alice",
    email: "alice@example.com",
    password: "secret123",
  }, member));

  assertEquals(res.status, 403);
  assertEquals((await res.json()).error.code, "forbidden");
  assertEquals(calls.length, 0);
});
