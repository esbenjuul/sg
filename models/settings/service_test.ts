import { assertEquals } from "jsr:@std/assert@^1";
import { DEFAULT_INSTRUCTOR_ROLES, withDefaults } from "./service.ts";

Deno.test("withDefaults returns the default roles when nothing is saved", () => {
  assertEquals(withDefaults(null), {
    instructorRoles: DEFAULT_INSTRUCTOR_ROLES.map((r) => ({ ...r })),
    locations: [],
    updatedAt: undefined,
  });
});

Deno.test("withDefaults uses saved roles as-is once saved", () => {
  const updatedAt = new Date("2026-11-26T12:00:00Z");
  const settings = withDefaults({
    _id: "app",
    instructorRoles: [
      { id: "r-1a2b3c4d", label: "Springtræner", rate: 300, tone: "success" },
      { id: "head", label: "Træner", rate: 400, tone: "info" },
    ],
    updatedAt,
  });

  assertEquals(settings.instructorRoles, [
    { id: "r-1a2b3c4d", label: "Springtræner", rate: 300, tone: "success" },
    { id: "head", label: "Træner", rate: 400, tone: "info" },
  ]);
  assertEquals(settings.updatedAt, updatedAt);
});

Deno.test("withDefaults reads roles saved in the older shape", () => {
  const settings = withDefaults({
    _id: "app",
    instructorRoles: [{ value: "helper", label: "Hjælper", rate: 200 }],
  });
  assertEquals(settings.instructorRoles, [
    { id: "helper", label: "Hjælper", rate: 200, tone: "info" },
  ]);
});

Deno.test("withDefaults returns saved locations", () => {
  const hall = {
    id: "l-1a2b3c4d",
    name: "Svendborg Idrætshal",
    place: "Ryttervej 70, Svendborg",
    type: "gym" as const,
    capacity: 60,
  };
  const settings = withDefaults({ _id: "app", locations: [hall] });
  assertEquals(settings.locations, [hall]);
});
