import {
  assertEquals,
  assertRejects,
} from "https://deno.land/std@0.224.0/testing/asserts.ts";
import { HttpError } from "fresh";
import { type CreateTeamDeps, handleCreateTeam } from "./create-team.ts";

Deno.test("handleCreateTeam creates team and redirects to /teams", async () => {
  const form = new FormData();
  form.set("name", "Junior Team");
  form.set("category", "mix");
  form.set("coachUserId", "507f1f77bcf86cd799439011");
  form.set("image", "/img/dance.png");

  const calls: unknown[] = [];
  const deps: CreateTeamDeps = {
    findUserById: async () => ({
      _id: "507f1f77bcf86cd799439011",
      name: "Coach User",
      email: "coach@example.com",
      createdAt: new Date(),
      updatedAt: new Date(),
      role: "trainer",
    }),
    createTeam: async (team) => {
      calls.push(team);
      return "507f1f77bcf86cd799439012";
    },
  };

  const res = await handleCreateTeam(form, deps);

  assertEquals(res.status, 303);
  assertEquals(res.headers.get("Location"), "/teams");
  assertEquals(calls.length, 1);
  assertEquals(calls[0], {
    name: "Junior Team",
    category: "mix",
    slug: "junior-team",
    coachUserId: "507f1f77bcf86cd799439011",
    image: "/img/dance.png",
  });
});

Deno.test(
  "handleCreateTeam throws HttpError 400 when required fields are missing",
  async () => {
    const form = new FormData();
    const deps: CreateTeamDeps = {
      findUserById: async () => null,
      createTeam: async () => "id",
    };

    await assertRejects(
      () => handleCreateTeam(form, deps),
      HttpError,
      "Name and category are required",
    );
  },
);

Deno.test(
  "handleCreateTeam throws HttpError 400 when selected coach does not exist",
  async () => {
    const form = new FormData();
    form.set("name", "Junior Team");
    form.set("category", "mix");
    form.set("coachUserId", "507f1f77bcf86cd799439011");

    const deps: CreateTeamDeps = {
      findUserById: async () => null,
      createTeam: async () => "id",
    };

    await assertRejects(
      () => handleCreateTeam(form, deps),
      HttpError,
      "Selected coach user does not exist",
    );
  },
);

Deno.test("handleCreateTeam throws HttpError 400 on duplicate team", async () => {
  const form = new FormData();
  form.set("name", "Junior Team");
  form.set("category", "mix");

  const deps: CreateTeamDeps = {
    findUserById: async () => null,
    createTeam: async () => {
      throw new Error("Team already exists");
    },
  };

  await assertRejects(
    () => handleCreateTeam(form, deps),
    HttpError,
    "A team with this name already exists",
  );
});
