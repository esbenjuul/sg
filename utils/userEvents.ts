/**
 * Client-side signal shared between user islands (UserMenu → UserList).
 * Islands are separate Preact roots but share module instances, so a
 * module-level signal lets one island notify another without a reload.
 */
import { signal } from "@preact/signals";
import type { UserProfile } from "@/api/contracts/user.ts";

/** Last user created from the UI, or null. */
export const createdUser = signal<UserProfile | null>(null);
