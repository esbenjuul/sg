import type * as v from "valibot";
import {
  deleteTeam as deleteTeamContract,
  type TeamDto,
  updateTeam as updateTeamContract,
} from "@/api/contracts/team.ts";
import { ApiError, handle, requireAdmin } from "@/api/server.ts";
import { assertType, type Equals } from "@/api/type-check.ts";
import {
  deleteTeam,
  type TeamDetails,
  type TeamInput,
  updateTeam,
} from "@/models/team/index.ts";
import { getSettings } from "@/models/settings/index.ts";
import { findUserById } from "@/models/user/index.ts";
import { define, type State } from "@/utils/state.ts";

// The contract's fields (minus the path param) must match what the model
// accepts, so adding/removing a field on one side fails `deno check`.
assertType<
  Equals<
    Omit<v.InferOutput<typeof updateTeamContract.input>, "id">,
    TeamInput
  >
>();

export interface InstructorChecks {
  findUserById: typeof findUserById;
  getSettings: typeof getSettings;
}

/**
 * Throws a 400 when an instructor is no longer a user, or a role or session
 * location no longer exists in the settings.
 */
export async function assertReferencesValid(
  input: Pick<TeamInput, "instructors" | "sessions">,
  deps: InstructorChecks,
): Promise<void> {
  if (input.instructors.length === 0 && input.sessions.length === 0) return;
  const { instructorRoles, locations } = await deps.getSettings();

  const locationIds = new Set(locations.map((l) => l.id));
  if (input.sessions.some((s) => !locationIds.has(s.locationId))) {
    throw new ApiError(
      400,
      "bad_request",
      "En valgt lokation findes ikke længere. Vælg en anden lokation.",
    );
  }

  const roleIds = new Set(instructorRoles.map((r) => r.id));
  for (const instructor of input.instructors) {
    if (!roleIds.has(instructor.role)) {
      throw new ApiError(
        400,
        "bad_request",
        "En valgt rolle findes ikke længere. Vælg en anden rolle.",
      );
    }
    if (!(await deps.findUserById(instructor.userId))) {
      throw new ApiError(
        400,
        "bad_request",
        "En valgt instruktør findes ikke længere",
      );
    }
  }
}

export interface TeamByIdDeps extends InstructorChecks {
  updateTeam: typeof updateTeam;
  deleteTeam: typeof deleteTeam;
}

const defaultDeps: TeamByIdDeps = {
  updateTeam,
  deleteTeam,
  findUserById,
  getSettings,
};

/** Factory so tests can swap the model functions (see ADR 0001). */
export function updateTeamHandler(deps: TeamByIdDeps = defaultDeps) {
  return handle<typeof updateTeamContract, State>(
    updateTeamContract,
    async ({ input, ctx }) => {
      requireAdmin(ctx.state.user, "redigere hold");
      await assertReferencesValid(input, deps);
      const { id, ...changes } = input;
      const team = await deps.updateTeam(id, changes);
      return { team: toTeamDto(team) };
    },
  );
}

export function deleteTeamHandler(deps: TeamByIdDeps = defaultDeps) {
  return handle<typeof deleteTeamContract, State>(
    deleteTeamContract,
    async ({ input, ctx }) => {
      requireAdmin(ctx.state.user, "slette hold");
      await deps.deleteTeam(input.id);
      return { id: input.id };
    },
  );
}

export function toTeamDto(team: TeamDetails): TeamDto {
  return {
    id: team._id,
    slug: team.slug,
    name: team.name,
    sport: team.sport,
    ageGroup: team.ageGroup,
    status: team.status,
    description: team.description,
    image: team.image,
    instructors: team.instructors,
    memberCount: team.memberCount,
    maxParticipants: team.maxParticipants,
    price: team.price,
    startDate: team.startDate,
    endDate: team.endDate,
    weeks: team.weeks,
    sessions: team.sessions,
    createdAt: team.createdAt.toISOString(),
    updatedAt: team.updatedAt.toISOString(),
  };
}

export const handler = define.handlers({
  PUT: updateTeamHandler(),
  DELETE: deleteTeamHandler(),
});
