import { createTeam as createTeamContract } from "@/api/contracts/team.ts";
import { handle, requireAdmin } from "@/api/server.ts";
import { createTeam } from "@/models/team/index.ts";
import { getSettings } from "@/models/settings/index.ts";
import { findUserById } from "@/models/user/index.ts";
import { define, type State } from "@/utils/state.ts";
import {
  assertReferencesValid,
  type InstructorChecks,
  toTeamDto,
} from "./[id].ts";

export interface CreateTeamDeps extends InstructorChecks {
  createTeam: typeof createTeam;
}

/** Factory so tests can swap the model functions (see ADR 0001). */
export function createTeamHandler(
  deps: CreateTeamDeps = { createTeam, findUserById, getSettings },
) {
  // ConflictError (name taken) is mapped to 409 by handle().
  return handle<typeof createTeamContract, State>(
    createTeamContract,
    async ({ input, ctx }) => {
      requireAdmin(ctx.state.user, "oprette hold");
      await assertReferencesValid(input, deps);
      const team = await deps.createTeam(input);
      return { team: toTeamDto(team) };
    },
  );
}

export const handler = define.handlers({
  POST: createTeamHandler(),
});
