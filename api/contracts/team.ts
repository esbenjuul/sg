import * as v from "valibot";
import { endpoint } from "../contract.ts";
import { Id } from "./shared.ts";

export const SPORTS = [
  "Gymnastik",
  "Teamgym",
  "Springgymnastik",
  "Atletik",
  "Svømning",
  "Dans",
] as const;
export const Sport = v.picklist(SPORTS, "Vælg en sport");

export const TeamStatus = v.picklist(["active", "inactive"]);
export type TeamStatus = v.InferOutput<typeof TeamStatus>;

export const TEAM_STATUS_LABELS: Record<TeamStatus, string> = {
  active: "Aktiv",
  inactive: "Inaktiv",
};

/**
 * Id of an instructor role from the admin settings. Roles are dynamic, so
 * whether the id exists is checked by the API handler, not here.
 */
export const InstructorRole = v.pipe(
  v.string("Vælg en rolle"),
  v.nonEmpty("Vælg en rolle"),
  v.regex(/^[a-z0-9][a-z0-9-]{0,39}$/, "Ugyldig rolle"),
);
export type InstructorRole = v.InferOutput<typeof InstructorRole>;

const optionalText = v.optional(
  v.pipe(v.string(), v.trim(), v.transform((s) => s || undefined)),
);

/** ISO weekday numbers: 1 = Monday … 7 = Sunday. */
export const WEEKDAYS = [
  { value: 1, label: "Mandag" },
  { value: 2, label: "Tirsdag" },
  { value: 3, label: "Onsdag" },
  { value: 4, label: "Torsdag" },
  { value: 5, label: "Fredag" },
  { value: 6, label: "Lørdag" },
  { value: 7, label: "Søndag" },
] as const;

/** A weekly training session. */
export const TrainingSession = v.pipe(
  v.object({
    /**
     * Id of a location from the admin settings. Whether it exists is checked
     * by the API handler.
     */
    locationId: v.pipe(
      v.string("Vælg en lokation"),
      // Also rejects "", so a missing choice gets a single message.
      v.regex(/^[a-z0-9][a-z0-9-]{0,39}$/, "Vælg en lokation"),
    ),
    weekday: v.pipe(
      v.number("Vælg en ugedag"),
      v.integer("Vælg en ugedag"),
      v.minValue(1, "Vælg en ugedag"),
      v.maxValue(7, "Vælg en ugedag"),
    ),
    /** HH:MM */
    startTime: v.pipe(v.string(), v.isoTime("Angiv starttidspunkt")),
    /** HH:MM */
    endTime: v.pipe(v.string(), v.isoTime("Angiv sluttidspunkt")),
    notes: v.optional(
      v.pipe(
        v.string(),
        v.trim(),
        v.maxLength(200, "Højst 200 tegn"),
        v.transform((s) => s || undefined),
      ),
    ),
  }),
  // "HH:MM" compares correctly as a string. Sessions past midnight aren't
  // supported.
  v.forward(
    v.partialCheck(
      [["startTime"], ["endTime"]],
      (s) => s.endTime > s.startTime,
      "Sluttid skal være efter starttid",
    ),
    ["endTime"],
  ),
);
export type TrainingSession = v.InferOutput<typeof TrainingSession>;

export const MAX_SESSIONS = 14;

export const TeamInstructor = v.object({
  userId: v.pipe(
    v.string("Vælg en instruktør"),
    v.nonEmpty("Vælg en instruktør"),
    Id,
  ),
  role: InstructorRole,
  hoursPerWeek: v.pipe(
    v.number("Angiv antal timer"),
    v.minValue(0, "Timer kan ikke være negative"),
    v.maxValue(40, "Højst 40 timer om ugen"),
  ),
});
export type TeamInstructor = v.InferOutput<typeof TeamInstructor>;

/** Everything the create/edit form sends. */
const teamFields = {
  name: v.pipe(v.string(), v.trim(), v.nonEmpty("Holdnavn skal udfyldes")),
  sport: Sport,
  ageGroup: optionalText,
  status: TeamStatus,
  description: optionalText,
  instructors: v.pipe(
    v.array(TeamInstructor),
    v.check(
      (list) => new Set(list.map((i) => i.userId)).size === list.length,
      "En instruktør kan kun tilføjes én gang",
    ),
  ),
  /** Members currently on the team. */
  memberCount: v.optional(
    v.pipe(
      v.number("Angiv et tal"),
      v.integer("Skal være et helt tal"),
      v.minValue(0, "Kan ikke være negativt"),
    ),
  ),
  maxParticipants: v.optional(
    v.pipe(
      v.number("Angiv et tal"),
      v.integer("Skal være et helt tal"),
      v.minValue(1, "Skal være mindst 1"),
    ),
  ),
  /** Membership fee per member for the whole season, in DKK. */
  price: v.optional(
    v.pipe(
      v.number("Angiv et beløb"),
      v.minValue(0, "Kan ikke være negativt"),
    ),
  ),
  /** YYYY-MM-DD */
  startDate: v.optional(v.pipe(v.string(), v.isoDate("Ugyldig dato"))),
  /** YYYY-MM-DD */
  endDate: v.optional(v.pipe(v.string(), v.isoDate("Ugyldig dato"))),
  /** Weeks the team trains in the season (may differ from the dates, e.g. holidays). */
  weeks: v.optional(
    v.pipe(
      v.number("Angiv et tal"),
      v.integer("Skal være et helt tal"),
      v.minValue(1, "Skal være mindst 1 uge"),
      v.maxValue(60, "Højst 60 uger"),
    ),
  ),
  /** Weekly training sessions. Omitted = none. */
  sessions: v.optional(
    v.pipe(
      v.array(TrainingSession),
      v.maxLength(MAX_SESSIONS, `Højst ${MAX_SESSIONS} træninger om ugen`),
    ),
    () => [],
  ),
};

/** ISO dates (YYYY-MM-DD) compare correctly as strings. */
function datesInOrder(i: { startDate?: string; endDate?: string }) {
  return !i.startDate || !i.endDate || i.endDate >= i.startDate;
}
const DATES_ORDER_MESSAGE = "Slutdato skal være efter startdato";

/** Wire DTO for a team. Dates are ISO strings. */
export const TeamDto = v.object({
  id: v.string(),
  slug: v.string(),
  name: v.string(),
  /** Empty for teams created before sport existed. */
  sport: v.string(),
  ageGroup: v.optional(v.string()),
  status: TeamStatus,
  description: v.optional(v.string()),
  image: v.optional(v.string()),
  instructors: v.array(
    v.object({
      userId: v.string(),
      role: InstructorRole,
      hoursPerWeek: v.number(),
    }),
  ),
  memberCount: v.optional(v.number()),
  maxParticipants: v.optional(v.number()),
  price: v.optional(v.number()),
  startDate: v.optional(v.string()),
  endDate: v.optional(v.string()),
  weeks: v.optional(v.number()),
  sessions: v.array(
    v.object({
      locationId: v.optional(v.string()),
      /** Free-text location saved before locations existed. Read-only. */
      location: v.optional(v.string()),
      weekday: v.number(),
      startTime: v.string(),
      endTime: v.string(),
      notes: v.optional(v.string()),
    }),
  ),
  createdAt: v.string(),
  updatedAt: v.string(),
});
export type TeamDto = v.InferOutput<typeof TeamDto>;

export const createTeam = endpoint({
  method: "POST",
  path: "/api/teams",
  successStatus: 201,
  input: v.pipe(
    v.object(teamFields),
    v.forward(
      v.partialCheck(
        [["startDate"], ["endDate"]],
        datesInOrder,
        DATES_ORDER_MESSAGE,
      ),
      ["endDate"],
    ),
  ),
  output: v.object({ team: TeamDto }),
});

/** Full replace of the editable fields. The slug never changes. */
export const updateTeam = endpoint({
  method: "PUT",
  path: "/api/teams/:id",
  input: v.pipe(
    v.object({ id: Id, ...teamFields }),
    v.forward(
      v.partialCheck(
        [["startDate"], ["endDate"]],
        datesInOrder,
        DATES_ORDER_MESSAGE,
      ),
      ["endDate"],
    ),
  ),
  output: v.object({ team: TeamDto }),
});

export const deleteTeam = endpoint({
  method: "DELETE",
  path: "/api/teams/:id",
  input: v.object({ id: Id }),
  output: v.object({ id: v.string() }),
});
