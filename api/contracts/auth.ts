import * as v from "valibot";
import { endpoint } from "../contract.ts";
import { Email, UserRole } from "./shared.ts";

/** Wire DTO for the signed-in user. Plain JSON types only — no ObjectId/Date. */
export const AuthUser = v.object({
  id: v.string(),
  email: v.string(),
  name: v.string(),
  role: UserRole,
});
export type AuthUser = v.InferOutput<typeof AuthUser>;

const AuthSuccess = v.object({ user: AuthUser });

export const login = endpoint({
  method: "POST",
  path: "/api/auth/login",
  input: v.object({
    email: Email,
    password: v.pipe(v.string(), v.nonEmpty("Password is required")),
  }),
  output: AuthSuccess,
});

export const signup = endpoint({
  method: "POST",
  path: "/api/auth/signup",
  successStatus: 201,
  input: v.pipe(
    v.object({
      name: v.pipe(v.string(), v.trim(), v.nonEmpty("Name is required")),
      email: Email,
      password: v.pipe(
        v.string(),
        v.minLength(6, "Password must be at least 6 characters"),
      ),
      passwordConfirm: v.string(),
    }),
    // Runs in the island (instant feedback) and on the server (authoritative).
    v.forward(
      v.partialCheck(
        [["password"], ["passwordConfirm"]],
        (i) => i.password === i.passwordConfirm,
        "Passwords do not match",
      ),
      ["passwordConfirm"],
    ),
  ),
  output: AuthSuccess,
});
