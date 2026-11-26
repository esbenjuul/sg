import { assertEquals } from "jsr:@std/assert@^1";
import { ObjectId } from "mongodb";
import { toSlug, toTeamDetails } from "./service.ts";

Deno.test("toSlug transliterates Danish letters", () => {
  assertEquals(toSlug("Svømning Voksne"), "svoemning-voksne");
  assertEquals(toSlug("Æblegrød & Ål"), "aeblegroed-aal");
  assertEquals(toSlug("  Ungdomsgymnastik U10! "), "ungdomsgymnastik-u10");
  assertEquals(toSlug("Café"), "cafe");
});

Deno.test("toTeamDetails maps a legacy coach to a head instructor", () => {
  const coachId = new ObjectId("507f1f77bcf86cd799439030");
  const team = toTeamDetails({
    _id: new ObjectId("507f1f77bcf86cd799439020"),
    name: "Micropiger",
    slug: "micropiger",
    category: "piger",
    coachUserId: coachId,
    createdAt: new Date(0),
    updatedAt: new Date(0),
  });

  assertEquals(team.sport, "");
  assertEquals(team.status, "active");
  assertEquals(team.instructors, [
    { userId: coachId.toString(), role: "head", hoursPerWeek: 0 },
  ]);
});
