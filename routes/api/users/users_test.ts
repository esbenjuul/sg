import { assertEquals } from "jsr:@std/assert@^1";
import type { Context } from "fresh";
import { NotFoundError } from "@/models/errors.ts";
import type { UpdateUserInput, UserProfile } from "@/models/user/index.ts";
import type { State } from "@/utils/state.ts";
import { type UpdateUserDeps, updateUserHandler } from "./[id].ts";

const ME = "507f1f77bcf86cd799439011";
const OTHER = "507f1f77bcf86cd799439012";

type Who = State["user"];
const member: Who = { _id: ME, email: "me@x.dk", name: "Me", role: "member" };
const admin: Who = {
  _id: OTHER,
  email: "a@x.dk",
  name: "Admin",
  role: "admin",
};

function patch(id: string, body: unknown, user: Who) {
  const req = new Request(`http://x/api/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return { req, params: { id }, state: { user } } as unknown as Context<State>;
}

function fakeDeps() {
  const calls: [string, UpdateUserInput][] = [];
  const deps: UpdateUserDeps = {
    updateUser: (id, input) => {
      calls.push([id, input]);
      return Promise.resolve(
        {
          _id: id,
          email: input.email ?? "me@x.dk",
          name: input.name ?? "Me",
          role: input.role ?? "member",
          status: input.status ?? "active",
          mobile: input.mobile,
          createdAt: new Date("2026-01-01T00:00:00Z"),
          updatedAt: new Date("2026-02-01T00:00:00Z"),
        } satisfies UserProfile,
      );
    },
  };
  return { deps, calls };
}

Deno.test("PATCH /api/users/:id lets a user update their own profile", async () => {
  const { deps, calls } = fakeDeps();
  const res = await updateUserHandler(deps)(
    patch(
      ME,
      { name: " New Name ", mobile: "+4512345678", password: "x" },
      member,
    ),
  );

  assertEquals(res.status, 200);
  // Trimmed, id from the path, unknown `password` stripped.
  assertEquals(calls, [[ME, { name: "New Name", mobile: "+4512345678" }]]);
  const body = await res.json();
  assertEquals(body.user.name, "New Name");
  assertEquals(body.user.createdAt, "2026-01-01T00:00:00.000Z");
});

Deno.test("PATCH /api/users/:id requires a session", async () => {
  const { deps, calls } = fakeDeps();
  const res = await updateUserHandler(deps)(
    patch(ME, { name: "x" }, undefined),
  );
  assertEquals(res.status, 401);
  assertEquals(calls.length, 0);
});

Deno.test("PATCH /api/users/:id forbids editing other users", async () => {
  const { deps, calls } = fakeDeps();
  const res = await updateUserHandler(deps)(
    patch(OTHER, { name: "x" }, member),
  );
  assertEquals(res.status, 403);
  assertEquals(calls.length, 0);
});

Deno.test("PATCH /api/users/:id: only admins change role/status", async () => {
  const { deps, calls } = fakeDeps();
  const denied = await updateUserHandler(deps)(
    patch(ME, { role: "admin" }, member),
  );
  assertEquals(denied.status, 403);
  assertEquals(calls.length, 0);

  const allowed = await updateUserHandler(deps)(
    patch(ME, { role: "trainer", status: "inactive" }, admin),
  );
  assertEquals(allowed.status, 200);
  assertEquals(calls, [[ME, { role: "trainer", status: "inactive" }]]);
});

Deno.test("PATCH /api/users/:id validates input", async () => {
  const { deps } = fakeDeps();
  const h = updateUserHandler(deps);

  const empty = await h(patch(ME, {}, member));
  assertEquals(empty.status, 400);
  assertEquals((await empty.json()).error.message, "Nothing to update");

  const badId = await h(patch("nope", { name: "x" }, admin));
  assertEquals((await badId.json()).error.fields, { id: ["Invalid id"] });

  const badEmail = await h(patch(ME, { email: "not-an-email" }, member));
  assertEquals((await badEmail.json()).error.fields, {
    email: ["Enter a valid email address"],
  });
});

Deno.test("PATCH /api/users/:id maps NotFoundError to 404", async () => {
  const deps: UpdateUserDeps = {
    updateUser: () => Promise.reject(new NotFoundError("User not found")),
  };
  const res = await updateUserHandler(deps)(patch(OTHER, { name: "x" }, admin));
  assertEquals(res.status, 404);
});
