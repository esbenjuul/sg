import type * as v from "valibot";
import {
  type AppSettingsDto,
  updateSettings as updateSettingsContract,
} from "@/api/contracts/settings.ts";
import { ApiError, handle, requireAdmin } from "@/api/server.ts";
import { assertType, type Equals } from "@/api/type-check.ts";
import {
  type AppSettings,
  getSettings,
  updateSettings,
  type UpdateSettingsInput,
} from "@/models/settings/index.ts";
import { getLocationUsage, getRoleUsage } from "@/models/team/index.ts";
import { define, type State } from "@/utils/state.ts";

// Contract and model must accept the same fields.
assertType<
  Equals<
    v.InferOutput<typeof updateSettingsContract.input>,
    UpdateSettingsInput
  >
>();

export interface UpdateSettingsDeps {
  updateSettings: typeof updateSettings;
  getSettings: typeof getSettings;
  getRoleUsage: typeof getRoleUsage;
  getLocationUsage: typeof getLocationUsage;
}

const defaultDeps: UpdateSettingsDeps = {
  updateSettings,
  getSettings,
  getRoleUsage,
  getLocationUsage,
};

/** Lists team names, shortening long lists: "A, B, C og 4 andre". */
function teamList(names: string[]): string {
  const shown = names.slice(0, 3).join(", ");
  return names.length > 3 ? `${shown} og ${names.length - 3} andre` : shown;
}

/** Throws 409 if an item that teams use is missing from `keepIds`. */
function assertNotRemovingUsed(
  current: { id: string; name: string }[],
  keepIds: string[],
  usage: Record<string, string[]>,
  /** "Rollen" or "Lokationen". */
  noun: string,
): void {
  const keep = new Set(keepIds);
  for (const item of current) {
    const teams = usage[item.id] ?? [];
    if (!keep.has(item.id) && teams.length > 0) {
      throw new ApiError(
        409,
        "conflict",
        `${noun} "${item.name}" bruges på ${teams.length} hold ` +
          `(${teamList(teams)}) og kan ikke slettes`,
      );
    }
  }
}

/** Factory so tests can swap the model functions (see ADR 0001). */
export function updateSettingsHandler(deps: UpdateSettingsDeps = defaultDeps) {
  return handle<typeof updateSettingsContract, State>(
    updateSettingsContract,
    async ({ input, ctx }) => {
      requireAdmin(ctx.state.user, "ændre indstillinger");

      // Roles and locations that any team uses can't be removed.
      const [current, roleUsage, locationUsage] = await Promise.all([
        deps.getSettings(),
        deps.getRoleUsage(),
        deps.getLocationUsage(),
      ]);
      assertNotRemovingUsed(
        current.instructorRoles.map((r) => ({ id: r.id, name: r.label })),
        input.instructorRoles.map((r) => r.id),
        roleUsage,
        "Rollen",
      );
      assertNotRemovingUsed(
        current.locations.map((l) => ({ id: l.id, name: l.name })),
        input.locations.map((l) => l.id),
        locationUsage,
        "Lokationen",
      );

      const settings = await deps.updateSettings(input);
      return { settings: toSettingsDto(settings) };
    },
  );
}

export function toSettingsDto(settings: AppSettings): AppSettingsDto {
  return {
    instructorRoles: settings.instructorRoles,
    locations: settings.locations,
    updatedAt: settings.updatedAt?.toISOString(),
  };
}

export const handler = define.handlers({
  PUT: updateSettingsHandler(),
});
