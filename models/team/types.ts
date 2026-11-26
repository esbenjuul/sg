import { ObjectId } from "mongodb";
import type * as v from "valibot";
import type {
  InstructorRole as InstructorRoleSchema,
  Sport as SportSchema,
  TeamStatus as TeamStatusSchema,
} from "@/api/contracts/team.ts";

// Derived from the valibot schemas so the allowed values live in one place.
export type InstructorRole = v.InferOutput<typeof InstructorRoleSchema>;
export type TeamStatus = v.InferOutput<typeof TeamStatusSchema>;
export type Sport = v.InferOutput<typeof SportSchema>;

/** A session as stored. Older sessions have free text instead of an id. */
export interface TrainingSession {
  /** Id of a location in the settings. */
  locationId?: string;
  /** @deprecated Free text from before locations existed. Read-only. */
  location?: string;
  /** ISO weekday: 1 = Monday … 7 = Sunday. */
  weekday: number;
  /** HH:MM */
  startTime: string;
  /** HH:MM */
  endTime: string;
  notes?: string;
}

/** A session as the form saves it. */
export interface TrainingSessionInput {
  locationId: string;
  weekday: number;
  startTime: string;
  endTime: string;
  notes?: string;
}

export interface TeamInstructor {
  userId: ObjectId;
  role: InstructorRole;
  hoursPerWeek: number;
}

export interface Team {
  _id?: ObjectId;
  name: string;
  slug: string;
  sport?: string;
  ageGroup?: string;
  status?: TeamStatus;
  description?: string;
  image?: string;
  instructors?: TeamInstructor[];
  memberCount?: number;
  maxParticipants?: number;
  /** Fee per member for the season, in DKK. */
  price?: number;
  /** YYYY-MM-DD */
  startDate?: string;
  /** YYYY-MM-DD */
  endDate?: string;
  weeks?: number;
  sessions?: TrainingSession[];
  /** @deprecated Teamgym grouping from before `sport`. Read-only. */
  category?: string;
  /** @deprecated Single coach from before `instructors`. Read-only. */
  coachUserId?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/** A stored team with legacy fields folded into the current shape. */
export interface TeamDetails {
  _id: string;
  name: string;
  slug: string;
  sport: string;
  ageGroup?: string;
  status: TeamStatus;
  description?: string;
  image?: string;
  instructors: {
    userId: string;
    role: InstructorRole;
    hoursPerWeek: number;
  }[];
  memberCount?: number;
  maxParticipants?: number;
  /** Fee per member for the season, in DKK. */
  price?: number;
  /** YYYY-MM-DD */
  startDate?: string;
  /** YYYY-MM-DD */
  endDate?: string;
  weeks?: number;
  sessions: TrainingSession[];
  createdAt: Date;
  updatedAt: Date;
}

/** What the create/edit form saves. */
export interface TeamInput {
  name: string;
  sport: Sport;
  ageGroup?: string;
  status: TeamStatus;
  description?: string;
  instructors: {
    userId: string;
    role: InstructorRole;
    hoursPerWeek: number;
  }[];
  memberCount?: number;
  maxParticipants?: number;
  /** Fee per member for the season, in DKK. */
  price?: number;
  /** YYYY-MM-DD */
  startDate?: string;
  /** YYYY-MM-DD */
  endDate?: string;
  weeks?: number;
  sessions: TrainingSessionInput[];
}
