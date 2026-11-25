import type * as v from "valibot";
import { updateUser as updateUserContract } from "@/api/contracts/user.ts";
import type { UserProfile as UserProfileDto } from "@/api/contracts/user.ts";
import { ApiError, handle } from "@/api/server.ts";
import { assertType, type Equals } from "@/api/type-check.ts";
import {
  updateUser,
  type UpdateUserInput,
  type UserProfile,
} from "@/models/user/index.ts";
import { define, type State } from "@/utils/state.ts";

// The contract's fields (minus the path param) must match what the model
// accepts exactly, so adding/removing a field on one side fails `deno check`.
assertType<
  Equals<
    Omit<v.InferOutput<typeof updateUserContract.input>, "id">,
    UpdateUserInput
  >
>();

export interface UpdateUserDeps {
  updateUser: typeof updateUser;
}

/** Factory so tests can swap the model function (see ADR 0001). */
export function updateUserHandler(deps: UpdateUserDeps = { updateUser }) {
  return handle<typeof updateUserContract, State>(
    updateUserContract,
    async ({ input, ctx }) => {
      const me = ctx.state.user;
      if (!me) {
        throw new ApiError(401, "unauthorized", "You must be signed in");
      }

      const isAdmin = me.role === "admin";
      if (!isAdmin && me._id !== input.id) {
        throw new ApiError(
          403,
          "forbidden",
          "You can only edit your own profile",
        );
      }
      if (
        !isAdmin && (input.role !== undefined || input.status !== undefined)
      ) {
        throw new ApiError(
          403,
          "forbidden",
          "Only admins can change role or status",
        );
      }

      const { id, ...changes } = input;
      const user = await deps.updateUser(id, changes);
      return { user: toUserDto(user) };
    },
  );
}

export function toUserDto(user: UserProfile): UserProfileDto {
  return {
    id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status,
    mobile: user.mobile,
    birthday: user.birthday,
    conventusId: user.conventusId,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export const handler = define.handlers({
  PATCH: updateUserHandler(),
});
