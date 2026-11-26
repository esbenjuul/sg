import type * as v from "valibot";
import type {
  LocationType as LocationTypeSchema,
  RoleTone as RoleToneSchema,
} from "@/api/contracts/settings.ts";
import type { InstructorRole } from "../team/types.ts";

export type RoleTone = v.InferOutput<typeof RoleToneSchema>;
export type LocationType = v.InferOutput<typeof LocationTypeSchema>;

export interface LocationSetting {
  /** Never changes, so sessions can refer to it later. */
  id: string;
  name: string;
  /** Address or area. */
  place: string;
  type: LocationType;
  /** Max number of people at once. */
  capacity: number;
}

export interface InstructorRoleSetting {
  /** What teams store in `instructors[].role`. Never changes. */
  id: InstructorRole;
  label: string;
  /** Hourly rate in DKK. */
  rate: number;
  tone: RoleTone;
}

/** A role as stored. Older documents used `value` for the id and had no tone. */
export interface StoredRole {
  id?: string;
  value?: string;
  label: string;
  rate: number;
  tone?: RoleTone;
}

/** The single settings document. Fields may be missing on older documents. */
export interface SettingsDocument {
  _id: "app";
  instructorRoles?: StoredRole[];
  locations?: LocationSetting[];
  updatedAt?: Date;
}

/** Settings with defaults filled in. */
export interface AppSettings {
  instructorRoles: InstructorRoleSetting[];
  locations: LocationSetting[];
  /** Absent until settings have been saved once. */
  updatedAt?: Date;
}

export interface UpdateSettingsInput {
  instructorRoles: InstructorRoleSetting[];
  locations: LocationSetting[];
}
