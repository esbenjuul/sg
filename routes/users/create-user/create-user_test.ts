import {
  assertEquals,
  assertRejects,
} from "https://deno.land/std@0.224.0/testing/asserts.ts";
import { HttpError } from "fresh";
import {
  handleCreateUser,
  type CreateUserDeps,
} from "./create-user.tsx";

Deno.test("handleCreateUser creates user and redirects to /users", async () => {
  const form = new FormData();
  form.set("name", "Alice Example");
  form.set("email", "alice@example.com");
  form.set("password", "secret123");
  form.set("mobile", "+4512345678");
  form.set("birthday", "2000-01-01");

  const calls: unknown[] = [];
  const deps: CreateUserDeps = {
    createUser: async (user) => {
      calls.push(user);
      return null as never;
    },
  };

  const res = await handleCreateUser(form, deps);

  assertEquals(res.status, 303);
  assertEquals(res.headers.get("Location"), "/users");
  assertEquals(calls.length, 1);
  assertEquals(calls[0], {
    name: "Alice Example",
    email: "alice@example.com",
    password: "secret123",
    mobile: "+4512345678",
    birthday: "2000-01-01",
  });
});

Deno.test(
  "handleCreateUser throws HttpError 400 when required fields are missing",
  async () => {
    const form = new FormData();
    const deps: CreateUserDeps = {
      createUser: async () => {
        throw new Error("should not be called");
      },
    };

    await assertRejects(
      () => handleCreateUser(form, deps),
      HttpError,
      "Name, email and password are required",
    );
  },
);

