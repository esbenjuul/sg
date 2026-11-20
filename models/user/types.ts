import { ObjectId } from "mongodb";
import type * as v from "valibot";
import type {
  UserRole as UserRoleSchema,
  UserStatus as UserStatusSchema,
} from "@/api/contracts/shared.ts";

// Derived from the valibot schemas so the allowed values live in one place.
// Type-only import: no runtime dependency from models on the api layer.
export type UserRole = v.InferOutput<typeof UserRoleSchema>;
export type UserStatus = v.InferOutput<typeof UserStatusSchema>;

export type ConventusUser = {
  afdeling: string;
  gruppe: string;
  id: string;
  navn: string;
  mobilLand: string;
  mobilLandeKode: string;
  mobil: string;
  eMail: string;
  fødselsdag: string;
};

export interface User {
  _id: ObjectId;
  name: string;
  email: string;
  password: string;
  mobile?: string;
  conventusId?: string;
  birthday?: string;
  metadata?: Record<string, unknown>;
  status?: UserStatus;
}

export interface UserDetails extends User {
  createdAt: Date;
  updatedAt: Date;
  role: UserRole;
}

export interface UserResponse {
  _id: string;
  email: string;
  mobile?: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  role: UserRole;
}

export interface ImportResponse {
  numberOfImports: number;
  numberOfDublicates: number;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  mobile?: string;
  conventusId?: string;
  birthday?: string;
  status?: UserStatus;
}

/** Full user profile without credentials. */
export interface UserProfile extends UserResponse {
  mobile?: string;
  birthday?: string;
  conventusId?: string;
  status?: UserStatus;
}

/** Fields that can be changed on an existing user. Omitted = unchanged. */
export interface UpdateUserInput {
  name?: string;
  email?: string;
  mobile?: string;
  birthday?: string;
  role?: UserRole;
  status?: UserStatus;
}
