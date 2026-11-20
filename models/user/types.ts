import { ObjectId } from "mongodb";

export type UserRole = "admin" | "teamlead" | "member" | "trainer" | "reader";
export type UserStatus = "active" | "inactive" | "authenticate_wait";

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
