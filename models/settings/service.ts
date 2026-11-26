import * as repository from "./repository.ts";
import type {
  AppSettings,
  InstructorRoleSetting,
  SettingsDocument,
  UpdateSettingsInput,
} from "./types.ts";

/** Used until an admin saves settings for the first time. */
export const DEFAULT_INSTRUCTOR_ROLES: readonly InstructorRoleSetting[] = [
  { id: "head", label: "Cheftræner", rate: 350, tone: "info" },
  { id: "assistant", label: "Assistenttræner", rate: 280, tone: "info" },
  { id: "helper", label: "Hjælpetræner", rate: 220, tone: "info" },
  { id: "coordinator", label: "Adm. koordinator", rate: 250, tone: "warning" },
];

/**
 * Settings with defaults for anything never saved. Once roles have been
 * saved, the stored list is used as-is (roles can be added and removed).
 */
export function withDefaults(doc: SettingsDocument | null): AppSettings {
  const stored = doc?.instructorRoles;
  const instructorRoles = stored?.length
    ? stored.map((r) => ({
      id: r.id ?? r.value ?? "",
      label: r.label,
      rate: r.rate,
      tone: r.tone ?? "info",
    })).filter((r) => r.id)
    : DEFAULT_INSTRUCTOR_ROLES.map((r) => ({ ...r }));
  const locations = (doc?.locations ?? []).map((l) => ({
    id: l.id,
    name: l.name,
    place: l.place,
    type: l.type,
    capacity: l.capacity,
  }));
  return { instructorRoles, locations, updatedAt: doc?.updatedAt };
}

export async function getSettings(): Promise<AppSettings> {
  return withDefaults(await repository.findSettings());
}

/**
 * Replaces the settings. Authorization, and refusing to remove roles that
 * teams use, is the caller's job.
 */
export async function updateSettings(
  input: UpdateSettingsInput,
): Promise<AppSettings> {
  await repository.upsertSettings({
    instructorRoles: input.instructorRoles.map((r) => ({
      id: r.id,
      label: r.label,
      rate: r.rate,
      tone: r.tone,
    })),
    locations: input.locations.map((l) => ({
      id: l.id,
      name: l.name,
      place: l.place,
      type: l.type,
      capacity: l.capacity,
    })),
    updatedAt: new Date(),
  });
  return await getSettings();
}
