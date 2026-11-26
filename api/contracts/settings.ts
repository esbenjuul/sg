import * as v from "valibot";
import { endpoint } from "../contract.ts";
import { InstructorRole } from "./team.ts";

/** Chip color for a role. Matches the Tag component's tones. */
export const RoleTone = v.picklist(["info", "success", "warning", "danger"]);
export type RoleTone = v.InferOutput<typeof RoleTone>;

export const ROLE_TONE_LABELS: Record<RoleTone, string> = {
  info: "Blå",
  success: "Grøn",
  warning: "Gul",
  danger: "Rød",
};

/** One instructor role: its id is what teams store. */
export const InstructorRoleSetting = v.object({
  id: InstructorRole,
  label: v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty("Betegnelse skal udfyldes"),
    v.maxLength(40, "Højst 40 tegn"),
  ),
  /** Hourly rate in DKK. */
  rate: v.pipe(
    v.number("Angiv en timesats"),
    v.minValue(0, "Kan ikke være negativ"),
    v.maxValue(10_000, "Højst 10.000 kr./t"),
  ),
  tone: v.optional(RoleTone, "info"),
});
export type InstructorRoleSetting = v.InferOutput<typeof InstructorRoleSetting>;

export const MAX_INSTRUCTOR_ROLES = 20;

export const LocationType = v.picklist(
  ["room", "springcenter", "gym"],
  "Vælg en type",
);
export type LocationType = v.InferOutput<typeof LocationType>;

export const LOCATION_TYPE_LABELS: Record<LocationType, string> = {
  room: "Lokale",
  springcenter: "Springcenter",
  gym: "Gymnastiksal",
};

/** A place teams can train. Its id never changes. */
export const LocationSetting = v.object({
  id: v.pipe(v.string(), v.regex(/^[a-z0-9][a-z0-9-]{0,39}$/, "Ugyldigt id")),
  name: v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty("Navn skal udfyldes"),
    v.maxLength(80, "Højst 80 tegn"),
  ),
  /** Address or area, e.g. "Johannes Jørgensens Vej 7, Svendborg". */
  place: v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty("Sted skal udfyldes"),
    v.maxLength(120, "Højst 120 tegn"),
  ),
  type: LocationType,
  /** Max number of people at once. */
  capacity: v.pipe(
    v.number("Angiv kapacitet"),
    v.integer("Skal være et helt tal"),
    v.minValue(1, "Skal være mindst 1"),
    v.maxValue(10_000, "Højst 10.000"),
  ),
});
export type LocationSetting = v.InferOutput<typeof LocationSetting>;

export const MAX_LOCATIONS = 100;

const settingsFields = {
  /** In display order. Removing a role a team uses is rejected with 409. */
  instructorRoles: v.pipe(
    v.array(InstructorRoleSetting),
    v.minLength(1, "Der skal være mindst én rolle"),
    v.maxLength(MAX_INSTRUCTOR_ROLES, `Højst ${MAX_INSTRUCTOR_ROLES} roller`),
    v.check(
      (roles) => new Set(roles.map((r) => r.id)).size === roles.length,
      "To roller har samme id",
    ),
    v.check(
      (roles) =>
        new Set(roles.map((r) => r.label.toLowerCase())).size === roles.length,
      "To roller har samme betegnelse",
    ),
  ),
  /** In display order. Omitted = none. */
  locations: v.optional(
    v.pipe(
      v.array(LocationSetting),
      v.maxLength(MAX_LOCATIONS, `Højst ${MAX_LOCATIONS} lokationer`),
      v.check(
        (list) => new Set(list.map((l) => l.id)).size === list.length,
        "To lokationer har samme id",
      ),
      v.check(
        (list) =>
          new Set(list.map((l) => l.name.toLowerCase())).size === list.length,
        "To lokationer har samme navn",
      ),
    ),
    () => [],
  ),
};

/** Wire DTO for the application settings. */
export const AppSettingsDto = v.object({
  ...settingsFields,
  /** ISO timestamp; absent until settings have been saved once. */
  updatedAt: v.optional(v.string()),
});
export type AppSettingsDto = v.InferOutput<typeof AppSettingsDto>;

/** Replaces all settings. Admin-only. */
export const updateSettings = endpoint({
  method: "PUT",
  path: "/api/settings",
  input: v.object(settingsFields),
  output: v.object({ settings: AppSettingsDto }),
});
