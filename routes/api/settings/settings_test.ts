import { assertEquals, assertStringIncludes } from "jsr:@std/assert@^1";
import type { Context } from "fresh";
import type {
  AppSettings,
  InstructorRoleSetting,
  LocationSetting,
  UpdateSettingsInput,
} from "@/models/settings/index.ts";
import type { State } from "@/utils/state.ts";
import { type UpdateSettingsDeps, updateSettingsHandler } from "./index.ts";

type Who = State["user"];
const admin: Who = {
  _id: "507f1f77bcf86cd799439011",
  email: "a@x.dk",
  name: "Admin",
  role: "admin",
};
const trainer: Who = { ...admin, role: "trainer" };

function put(body: unknown, user: Who) {
  const req = new Request("http://x/api/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return { req, params: {}, state: { user } } as unknown as Context<State>;
}

const current: InstructorRoleSetting[] = [
  { id: "head", label: "Cheftræner", rate: 350, tone: "info" },
  { id: "assistant", label: "Assistenttræner", rate: 280, tone: "info" },
  { id: "helper", label: "Hjælpetræner", rate: 220, tone: "info" },
];

function fakeDeps(
  usage: Record<string, string[]> = {},
  locationUsage: Record<string, string[]> = {},
  locations: LocationSetting[] = [],
) {
  const calls: UpdateSettingsInput[] = [];
  const deps: UpdateSettingsDeps = {
    getSettings: () => Promise.resolve({ instructorRoles: current, locations }),
    getRoleUsage: () => Promise.resolve(usage),
    getLocationUsage: () => Promise.resolve(locationUsage),
    updateSettings: (input) => {
      calls.push(input);
      return Promise.resolve(
        {
          ...input,
          updatedAt: new Date("2026-11-26T12:00:00Z"),
        } satisfies AppSettings,
      );
    },
  };
  return { deps, calls };
}

Deno.test("PUT /api/settings saves edited and added roles", async () => {
  const { deps, calls } = fakeDeps({ head: ["U10"] });
  const res = await updateSettingsHandler(deps)(put({
    instructorRoles: [
      { ...current[0], label: " Træner ", rate: 375 },
      current[1],
      current[2],
      { id: "r-1a2b3c4d", label: "Springtræner", rate: 300 },
    ],
  }, admin));

  assertEquals(res.status, 200);
  assertEquals(calls[0].instructorRoles[0], {
    id: "head",
    label: "Træner",
    rate: 375,
    tone: "info",
  });
  // Tone defaults to "info".
  assertEquals(calls[0].instructorRoles[3].tone, "info");
  const body = await res.json();
  assertEquals(body.settings.updatedAt, "2026-11-26T12:00:00.000Z");
  assertEquals(body.settings.instructorRoles.length, 4);
});

Deno.test("PUT /api/settings deletes a role no team uses", async () => {
  const { deps, calls } = fakeDeps({ head: ["U10"] });
  const res = await updateSettingsHandler(deps)(
    put({ instructorRoles: [current[0], current[1]] }, admin),
  );
  assertEquals(res.status, 200);
  assertEquals(calls[0].instructorRoles.map((r) => r.id), [
    "head",
    "assistant",
  ]);
});

Deno.test("PUT /api/settings refuses to delete a role in use", async () => {
  const { deps, calls } = fakeDeps({
    helper: ["U10", "Mix", "Piger", "Drenge", "Voksne"],
  });
  const res = await updateSettingsHandler(deps)(
    put({ instructorRoles: [current[0], current[1]] }, admin),
  );

  assertEquals(res.status, 409);
  assertEquals(calls.length, 0);
  const { error } = await res.json();
  assertEquals(error.code, "conflict");
  assertStringIncludes(error.message, `Rollen "Hjælpetræner" bruges på 5 hold`);
  assertStringIncludes(error.message, "U10, Mix, Piger og 2 andre");
});

Deno.test("PUT /api/settings is admin-only", async () => {
  const { deps, calls } = fakeDeps();
  const res = await updateSettingsHandler(deps)(
    put({ instructorRoles: current }, trainer),
  );
  assertEquals(res.status, 403);

  const anon = await updateSettingsHandler(deps)(
    put({ instructorRoles: current }, undefined),
  );
  assertEquals(anon.status, 401);
  assertEquals(calls.length, 0);
});

Deno.test("PUT /api/settings validates each role", async () => {
  const { deps, calls } = fakeDeps();
  const res = await updateSettingsHandler(deps)(put({
    instructorRoles: [
      { ...current[0], label: "  " },
      { ...current[1], rate: -5 },
      { ...current[2], id: "Not Valid" },
    ],
  }, admin));

  assertEquals(res.status, 400);
  assertEquals(calls.length, 0);
  const { error } = await res.json();
  assertEquals(error.fields["instructorRoles.0.label"], [
    "Betegnelse skal udfyldes",
  ]);
  assertEquals(error.fields["instructorRoles.1.rate"], [
    "Kan ikke være negativ",
  ]);
  assertEquals(error.fields["instructorRoles.2.id"], ["Ugyldig rolle"]);
});

Deno.test("PUT /api/settings rejects empty and duplicate role lists", async () => {
  const { deps } = fakeDeps();
  const cases: [InstructorRoleSetting[], string][] = [
    [[], "Der skal være mindst én rolle"],
    [[current[0], { ...current[1], id: "head" }], "To roller har samme id"],
    [
      [current[0], { ...current[1], label: "CHEFTRÆNER" }],
      "To roller har samme betegnelse",
    ],
  ];
  for (const [instructorRoles, message] of cases) {
    const res = await updateSettingsHandler(deps)(
      put({ instructorRoles }, admin),
    );
    assertEquals(res.status, 400);
    const { error } = await res.json();
    assertEquals(error.fields.instructorRoles, [message]);
  }
});

const hall = {
  id: "l-1a2b3c4d",
  name: "Svendborg Idrætshal",
  place: "Ryttervej 70, Svendborg",
  type: "gym",
  capacity: 60,
};

Deno.test("PUT /api/settings saves locations", async () => {
  const { deps, calls } = fakeDeps();
  const res = await updateSettingsHandler(deps)(put({
    instructorRoles: current,
    locations: [{ ...hall, name: " Svendborg Idrætshal " }],
  }, admin));

  assertEquals(res.status, 200);
  assertEquals(calls[0].locations, [hall]);
  const body = await res.json();
  assertEquals(body.settings.locations, [hall]);
});

Deno.test("PUT /api/settings defaults locations to none", async () => {
  const { deps, calls } = fakeDeps();
  const res = await updateSettingsHandler(deps)(
    put({ instructorRoles: current }, admin),
  );
  assertEquals(res.status, 200);
  assertEquals(calls[0].locations, []);
});

Deno.test("PUT /api/settings validates each location", async () => {
  const { deps, calls } = fakeDeps();
  const res = await updateSettingsHandler(deps)(put({
    instructorRoles: current,
    locations: [
      { ...hall, name: " ", place: "", type: "pool", capacity: 0 },
      { ...hall, id: "l-2", name: "Springcenter", capacity: 12.5 },
    ],
  }, admin));

  assertEquals(res.status, 400);
  assertEquals(calls.length, 0);
  const { error } = await res.json();
  assertEquals(error.fields["locations.0.name"], ["Navn skal udfyldes"]);
  assertEquals(error.fields["locations.0.place"], ["Sted skal udfyldes"]);
  assertEquals(error.fields["locations.0.type"], ["Vælg en type"]);
  assertEquals(error.fields["locations.0.capacity"], ["Skal være mindst 1"]);
  assertEquals(error.fields["locations.1.capacity"], ["Skal være et helt tal"]);
});

Deno.test("PUT /api/settings rejects duplicate location names", async () => {
  const { deps } = fakeDeps();
  const res = await updateSettingsHandler(deps)(put({
    instructorRoles: current,
    locations: [hall, { ...hall, id: "l-2", name: "SVENDBORG IDRÆTSHAL" }],
  }, admin));
  assertEquals(res.status, 400);
  const { error } = await res.json();
  assertEquals(error.fields.locations, ["To lokationer har samme navn"]);
});

Deno.test("PUT /api/settings refuses to delete a location in use", async () => {
  const saved = { ...hall, type: "gym" as const };
  const tved = { ...saved, id: "l-tved", name: "Tved Hallen" };
  const { deps, calls } = fakeDeps({}, { "l-1a2b3c4d": ["U10"] }, [
    saved,
    tved,
  ]);

  const blocked = await updateSettingsHandler(deps)(
    put({ instructorRoles: current, locations: [tved] }, admin),
  );
  assertEquals(blocked.status, 409);
  const { error } = await blocked.json();
  assertEquals(
    error.message,
    `Lokationen "Svendborg Idrætshal" bruges på 1 hold (U10) og kan ikke slettes`,
  );

  // Removing the unused one is fine.
  const ok = await updateSettingsHandler(deps)(
    put({ instructorRoles: current, locations: [saved] }, admin),
  );
  assertEquals(ok.status, 200);
  assertEquals(calls.length, 1);
});
