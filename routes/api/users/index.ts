import { createUser as createUserContract } from "@/api/contracts/user.ts";
import { ApiError, handle } from "@/api/server.ts";
import { createUser } from "@/models/user/index.ts";
import { define, type State } from "@/utils/state.ts";
import { toUserDto } from "./[id].ts";

export interface CreateUserDeps {
  createUser: typeof createUser;
}

/** Factory so tests can swap the model function (see ADR 0001). */
export function createUserHandler(deps: CreateUserDeps = { createUser }) {
  // ConflictError (email taken) is mapped to 409 by handle().
  return handle<typeof createUserContract, State>(
    createUserContract,
    async ({ input, ctx }) => {
      if (!ctx.state.user) {
        throw new ApiError(401, "unauthorized", "You must be signed in");
      }
      if (ctx.state.user.role !== "admin") {
        throw new ApiError(403, "forbidden", "Only admins can create users");
      }
      const user = await deps.createUser(input);
      return { user: toUserDto(user) };
    },
  );
}

export const handler = define.handlers({
  POST: createUserHandler(),
});
