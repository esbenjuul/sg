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

/** Creates a user. Empty optional fields are dropped. */
export const createUser = endpoint({
  method: "POST",
  path: "/api/users",
  successStatus: 201,
  input: v.object({
    name: v.pipe(v.string(), v.trim(), v.nonEmpty("Name is required")),
    email: Email,
    password: v.pipe(
      v.string(),
      v.minLength(6, "Password must be at least 6 characters"),
    ),
    mobile: v.optional(
      v.pipe(v.string(), v.trim(), v.transform((s) => s || undefined)),
    ),
    birthday: v.optional(
      v.pipe(v.string(), v.trim(), v.transform((s) => s || undefined)),
    ),
  }),
  output: v.object({ user: UserProfile }),
});

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
