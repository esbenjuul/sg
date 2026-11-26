import { assertEquals } from "jsr:@std/assert@^1";
import type { Context } from "fresh";
import { ConflictError, NotFoundError } from "@/models/errors.ts";
import type { TeamDetails, TeamInput } from "@/models/team/index.ts";
import type { UserResponse } from "@/models/user/index.ts";
import type { State } from "@/utils/state.ts";
import { type CreateTeamDeps, createTeamHandler } from "./index.ts";
import {
  deleteTeamHandler,
  type TeamByIdDeps,
  updateTeamHandler,
} from "./[id].ts";

type Who = State["user"];
const admin: Who = {
  _id: "507f1f77bcf86cd799439011",
  email: "a@x.dk",
  name: "Admin",
  role: "admin",
};
const member: Who = {
  ...admin,
  _id: "507f1f77bcf86cd799439012",
  role: "member",
};

const TEAM_ID = "507f1f77bcf86cd799439020";
const COACH_ID = "507f1f77bcf86cd799439030";

function request(
  method: string,
  body: unknown,
  user: Who,
  params: Record<string, string> = {},
) {
  const req = new Request("http://x/api/teams", {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { req, params, state: { user } } as unknown as Context<State>;
}

const validBody = {
  name: " Ungdomsgymnastik U10 ",
  sport: "Gymnastik",
  ageGroup: "7–10 år",
  status: "active",
  description: "",
  instructors: [{ userId: COACH_ID, role: "head", hoursPerWeek: 4 }],
};

function details(input: TeamInput): TeamDetails {
  return {
    ...input,
    _id: TEAM_ID,
    slug: "ungdomsgymnastik-u10",
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
  };
}

const coach = {
  _id: COACH_ID,
  name: "Mette Larsen",
  email: "mette@sgf.dk",
  role: "trainer",
  createdAt: new Date(),
  updatedAt: new Date(),
} satisfies UserResponse;

const settings = () =>
  Promise.resolve({
    instructorRoles: [
      { id: "head", label: "Cheftræner", rate: 350, tone: "info" as const },
      { id: "helper", label: "Hjælpetræner", rate: 220, tone: "info" as const },
    ],
    locations: [
      {
        id: "l-hal",
        name: "Svendborg Idrætshal",
        place: "Ryttervej 70",
        type: "gym" as const,
        capacity: 60,
      },
      {
        id: "l-tved",
        name: "Tved Hallen",
        place: "Tved",
        type: "room" as const,
        capacity: 20,
      },
    ],
  });

function createDeps(opts: { fail?: Error; noUser?: boolean } = {}) {
  const calls: TeamInput[] = [];
  const deps: CreateTeamDeps = {
    findUserById: () => Promise.resolve(opts.noUser ? null : coach),
    getSettings: settings,
    createTeam: (input) => {
      calls.push(input);
      return opts.fail
        ? Promise.reject(opts.fail)
        : Promise.resolve(details(input));
    },
  };
  return { deps, calls };
}

Deno.test("POST /api/teams creates a team and returns 201", async () => {
  const { deps, calls } = createDeps();
  const res = await createTeamHandler(deps)(request("POST", validBody, admin));

  assertEquals(res.status, 201);
  assertEquals(calls, [{
    name: "Ungdomsgymnastik U10",
    sport: "Gymnastik",
    ageGroup: "7–10 år",
    status: "active",
    description: undefined,
    instructors: [{ userId: COACH_ID, role: "head", hoursPerWeek: 4 }],
    sessions: [],
  }]);
  const body = await res.json();
  assertEquals(body.team.slug, "ungdomsgymnastik-u10");
  assertEquals(body.team.createdAt, "2026-01-01T00:00:00.000Z");
});

Deno.test("POST /api/teams is admin-only", async () => {
  const { deps, calls } = createDeps();
  const res = await createTeamHandler(deps)(request("POST", validBody, member));
  assertEquals(res.status, 403);
  assertEquals(calls.length, 0);

  const anon = await createTeamHandler(deps)(
    request("POST", validBody, undefined),
  );
  assertEquals(anon.status, 401);
});

Deno.test("POST /api/teams rejects invalid fields per field", async () => {
  const { deps, calls } = createDeps();
  const res = await createTeamHandler(deps)(request("POST", {
    ...validBody,
    name: "  ",
    sport: "Curling",
    instructors: [{ userId: "", role: "head", hoursPerWeek: 50 }],
  }, admin));

  assertEquals(res.status, 400);
  assertEquals(calls.length, 0);
  const { error } = await res.json();
  assertEquals(error.code, "validation");
  assertEquals(error.fields.name, ["Holdnavn skal udfyldes"]);
  assertEquals(error.fields.sport, ["Vælg en sport"]);
  assertEquals(error.fields["instructors.0.userId"][0], "Vælg en instruktør");
  assertEquals(error.fields["instructors.0.hoursPerWeek"], [
    "Højst 40 timer om ugen",
  ]);
});

Deno.test("POST /api/teams accepts season fields", async () => {
  const { deps, calls } = createDeps();
  const res = await createTeamHandler(deps)(request("POST", {
    ...validBody,
    memberCount: 18,
    maxParticipants: 24,
    price: 1200,
    startDate: "2026-09-01",
    endDate: "2027-06-15",
    weeks: 36,
  }, admin));

  assertEquals(res.status, 201);
  assertEquals(calls[0].memberCount, 18);
  assertEquals(calls[0].maxParticipants, 24);
  assertEquals(calls[0].price, 1200);
  assertEquals(calls[0].startDate, "2026-09-01");
  assertEquals(calls[0].endDate, "2027-06-15");
  assertEquals(calls[0].weeks, 36);
  const body = await res.json();
  assertEquals(body.team.weeks, 36);
});

Deno.test("POST /api/teams rejects bad season fields", async () => {
  const { deps, calls } = createDeps();
  const res = await createTeamHandler(deps)(request("POST", {
    ...validBody,
    memberCount: 2.5,
    maxParticipants: 0,
    price: -1,
    startDate: "2027-06-15",
    endDate: "2026-09-01",
    weeks: 61,
  }, admin));

  assertEquals(res.status, 400);
  assertEquals(calls.length, 0);
  const { error } = await res.json();
  assertEquals(error.fields.memberCount, ["Skal være et helt tal"]);
  assertEquals(error.fields.maxParticipants, ["Skal være mindst 1"]);
  assertEquals(error.fields.price, ["Kan ikke være negativt"]);
  assertEquals(error.fields.weeks, ["Højst 60 uger"]);
});

Deno.test("POST /api/teams requires the end date after the start", async () => {
  const { deps } = createDeps();
  const res = await createTeamHandler(deps)(request("POST", {
    ...validBody,
    startDate: "2027-06-15",
    endDate: "2026-09-01",
  }, admin));

  assertEquals(res.status, 400);
  const { error } = await res.json();
  assertEquals(error.fields.endDate, ["Slutdato skal være efter startdato"]);
});

Deno.test("POST /api/teams saves training sessions", async () => {
  const { deps, calls } = createDeps();
  const res = await createTeamHandler(deps)(request("POST", {
    ...validBody,
    sessions: [
      {
        locationId: "l-hal",
        weekday: 1,
        startTime: "17:00",
        endTime: "18:30",
        notes: "Springtræning",
      },
      {
        locationId: "l-tved",
        weekday: 4,
        startTime: "16:30",
        endTime: "17:30",
        notes: "",
      },
    ],
  }, admin));

  assertEquals(res.status, 201);
  assertEquals(calls[0].sessions, [
    {
      locationId: "l-hal",
      weekday: 1,
      startTime: "17:00",
      endTime: "18:30",
      notes: "Springtræning",
    },
    {
      locationId: "l-tved",
      weekday: 4,
      startTime: "16:30",
      endTime: "17:30",
      notes: undefined,
    },
  ]);
  const body = await res.json();
  assertEquals(body.team.sessions.length, 2);
});

Deno.test("POST /api/teams validates training sessions", async () => {
  const { deps, calls } = createDeps();
  const res = await createTeamHandler(deps)(request("POST", {
    ...validBody,
    sessions: [
      { locationId: "", weekday: 8, startTime: "18:00", endTime: "17:00" },
      { locationId: "l-hal", weekday: 2, startTime: "", endTime: "19:00" },
    ],
  }, admin));

  assertEquals(res.status, 400);
  assertEquals(calls.length, 0);
  const { error } = await res.json();
  assertEquals(error.fields["sessions.0.locationId"], ["Vælg en lokation"]);
  assertEquals(error.fields["sessions.0.weekday"], ["Vælg en ugedag"]);
  assertEquals(error.fields["sessions.0.endTime"], [
    "Sluttid skal være efter starttid",
  ]);
  assertEquals(error.fields["sessions.1.startTime"], ["Angiv starttidspunkt"]);
});

Deno.test("POST /api/teams returns 400 for a location not in settings", async () => {
  const { deps, calls } = createDeps();
  const res = await createTeamHandler(deps)(request("POST", {
    ...validBody,
    sessions: [{
      locationId: "l-deleted",
      weekday: 1,
      startTime: "17:00",
      endTime: "18:00",
    }],
  }, admin));
  assertEquals(res.status, 400);
  assertEquals(calls.length, 0);
  const { error } = await res.json();
  assertEquals(
    error.message,
    "En valgt lokation findes ikke længere. Vælg en anden lokation.",
  );
});

Deno.test("POST /api/teams rejects the same instructor twice", async () => {
  const { deps } = createDeps();
  const instructor = validBody.instructors[0];
  const res = await createTeamHandler(deps)(request("POST", {
    ...validBody,
    instructors: [instructor, { ...instructor, role: "helper" }],
  }, admin));

  assertEquals(res.status, 400);
  const { error } = await res.json();
  assertEquals(error.fields.instructors, [
    "En instruktør kan kun tilføjes én gang",
  ]);
});

Deno.test("POST /api/teams returns 400 for an unknown instructor", async () => {
  const { deps, calls } = createDeps({ noUser: true });
  const res = await createTeamHandler(deps)(request("POST", validBody, admin));
  assertEquals(res.status, 400);
  assertEquals(calls.length, 0);
});

Deno.test("POST /api/teams returns 400 for a role not in settings", async () => {
  const { deps, calls } = createDeps();
  const res = await createTeamHandler(deps)(request("POST", {
    ...validBody,
    instructors: [{ userId: COACH_ID, role: "r-deleted1", hoursPerWeek: 2 }],
  }, admin));
  assertEquals(res.status, 400);
  assertEquals(calls.length, 0);
  const { error } = await res.json();
  assertEquals(
    error.message,
    "En valgt rolle findes ikke længere. Vælg en anden rolle.",
  );
});

Deno.test("POST /api/teams returns 409 when the name is taken", async () => {
  const { deps } = createDeps({ fail: new ConflictError("taken") });
  const res = await createTeamHandler(deps)(request("POST", validBody, admin));
  assertEquals(res.status, 409);
});

function byIdDeps(opts: { missing?: boolean } = {}) {
  const updates: [string, TeamInput][] = [];
  const deletes: string[] = [];
  const deps: TeamByIdDeps = {
    findUserById: () => Promise.resolve(coach),
    getSettings: settings,
    updateTeam: (id, input) => {
      updates.push([id, input]);
      return opts.missing
        ? Promise.reject(new NotFoundError("Holdet findes ikke"))
        : Promise.resolve(details(input));
    },
    deleteTeam: (id) => {
      deletes.push(id);
      return opts.missing
        ? Promise.reject(new NotFoundError("Holdet findes ikke"))
        : Promise.resolve();
    },
  };
  return { deps, updates, deletes };
}

Deno.test("PUT /api/teams/:id uses the path id over the body", async () => {
  const { deps, updates } = byIdDeps();
  const res = await updateTeamHandler(deps)(
    request("PUT", { ...validBody, id: "507f1f77bcf86cd7994390ff" }, admin, {
      id: TEAM_ID,
    }),
  );
  assertEquals(res.status, 200);
  assertEquals(updates[0][0], TEAM_ID);
  assertEquals(updates[0][1].name, "Ungdomsgymnastik U10");
});

Deno.test("PUT /api/teams/:id returns 404 for a missing team", async () => {
  const { deps } = byIdDeps({ missing: true });
  const res = await updateTeamHandler(deps)(
    request("PUT", validBody, admin, { id: TEAM_ID }),
  );
  assertEquals(res.status, 404);
});

Deno.test("DELETE /api/teams/:id deletes as admin only", async () => {
  const { deps, deletes } = byIdDeps();
  const denied = await deleteTeamHandler(deps)(
    request("DELETE", undefined, member, { id: TEAM_ID }),
  );
  assertEquals(denied.status, 403);
  assertEquals(deletes.length, 0);

  const res = await deleteTeamHandler(deps)(
    request("DELETE", undefined, admin, { id: TEAM_ID }),
  );
  assertEquals(res.status, 200);
  assertEquals(await res.json(), { id: TEAM_ID });
  assertEquals(deletes, [TEAM_ID]);
});
