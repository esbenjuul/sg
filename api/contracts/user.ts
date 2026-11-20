import * as v from "valibot";
import { endpoint } from "../contract.ts";
import { Email, Id, UserRole, UserStatus } from "./shared.ts";

/** Wire DTO for a user profile. Dates are ISO strings. */
export const UserProfile = v.object({
  id: v.string(),
  email: v.string(),
  name: v.string(),
  role: UserRole,
  status: v.optional(UserStatus),
  mobile: v.optional(v.string()),
  birthday: v.optional(v.string()),
  conventusId: v.optional(v.string()),
  createdAt: v.string(),
  updatedAt: v.string(),
});
export type UserProfile = v.InferOutput<typeof UserProfile>;

/**
 * Partial update. Omitted fields are left unchanged; unknown fields
 * (e.g. `password`) are stripped. `role` and `status` are admin-only.
 */
export const updateUser = endpoint({
  method: "PATCH",
  path: "/api/users/:id",
  input: v.pipe(
    v.object({
      id: Id,
      name: v.optional(
        v.pipe(v.string(), v.trim(), v.nonEmpty("Name cannot be empty")),
      ),
      email: v.optional(Email),
      mobile: v.optional(v.pipe(v.string(), v.trim())),
      birthday: v.optional(v.pipe(v.string(), v.trim())),
      role: v.optional(UserRole),
      status: v.optional(UserStatus),
    }),
    v.check(
      ({ id: _id, ...fields }) =>
        Object.values(fields).some((value) => value !== undefined),
      "Nothing to update",
    ),
  ),
  output: v.object({ user: UserProfile }),
});
