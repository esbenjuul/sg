import * as v from "valibot";

export const Email = v.pipe(
  v.string(),
  v.trim(),
  v.toLowerCase(),
  v.nonEmpty("Email is required"),
  v.email("Enter a valid email address"),
);

/** Mongo ObjectId as a 24-char hex string. */
export const Id = v.pipe(
  v.string(),
  v.regex(/^[0-9a-f]{24}$/i, "Invalid id"),
);

export const UserRole = v.picklist([
  "admin",
  "teamlead",
  "member",
  "trainer",
  "reader",
]);

export const UserStatus = v.picklist([
  "active",
  "inactive",
  "authenticate_wait",
]);
