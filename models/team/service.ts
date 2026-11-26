import { ObjectId } from "mongodb";
import { ConflictError, NotFoundError } from "../errors.ts";
import * as repository from "./repository.ts";
import type { Team, TeamDetails, TeamInput } from "./types.ts";

/** Paths under /teams that a slug must not shadow. */
const RESERVED_SLUGS = new Set(["new"]);

export function toSlug(value: string): string {
  return value
    .toLowerCase()
    .replaceAll("æ", "ae")
    .replaceAll("ø", "oe")
    .replaceAll("å", "aa")
    .normalize("NFD")
    .replaceAll(/[̀-ͯ]/g, "")
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/(^-|-$)/g, "");
}

/** Maps a stored team to the current shape, folding in legacy fields. */
export function toTeamDetails(team: Team): TeamDetails {
  const instructors = team.instructors ??
    (team.coachUserId
      ? [{ userId: team.coachUserId, role: "head" as const, hoursPerWeek: 0 }]
      : []);
  return {
    _id: team._id!.toString(),
    name: team.name,
    slug: team.slug,
    sport: team.sport ?? "",
    ageGroup: team.ageGroup,
    status: team.status ?? "active",
    description: team.description,
    image: team.image,
    instructors: instructors.map((i) => ({
      userId: i.userId.toString(),
      role: i.role,
      hoursPerWeek: i.hoursPerWeek,
    })),
    memberCount: team.memberCount,
    maxParticipants: team.maxParticipants,
    price: team.price,
    startDate: team.startDate,
    endDate: team.endDate,
    weeks: team.weeks,
    sessions: (team.sessions ?? []).map((session) => ({ ...session })),
    createdAt: team.createdAt,
    updatedAt: team.updatedAt,
  };
}

function toStored(input: TeamInput) {
  return {
    name: input.name,
    sport: input.sport,
    ageGroup: input.ageGroup,
    status: input.status,
    description: input.description,
    instructors: input.instructors.map((i) => ({
      userId: new ObjectId(i.userId),
      role: i.role,
      hoursPerWeek: i.hoursPerWeek,
    })),
    memberCount: input.memberCount,
    maxParticipants: input.maxParticipants,
    price: input.price,
    startDate: input.startDate,
    endDate: input.endDate,
    weeks: input.weeks,
    sessions: input.sessions.map((session) => ({
      locationId: session.locationId,
      weekday: session.weekday,
      startTime: session.startTime,
      endTime: session.endTime,
      notes: session.notes,
    })),
  };
}

/** @throws ConflictError if the name gives a slug that is taken or reserved */
export async function createTeam(input: TeamInput): Promise<TeamDetails> {
  const slug = toSlug(input.name);
  if (!slug) {
    throw new ConflictError("Holdnavnet skal indeholde bogstaver eller tal");
  }
  if (RESERVED_SLUGS.has(slug) || await repository.findBySlug(slug)) {
    throw new ConflictError("Der findes allerede et hold med det navn");
  }

  const now = new Date();
  const team: Omit<Team, "_id"> = {
    ...toStored(input),
    slug,
    createdAt: now,
    updatedAt: now,
  };

  const insertedId = await repository.insertTeam(team);
  return toTeamDetails({ ...team, _id: insertedId });
}

/**
 * Replaces the editable fields. The slug is kept so links stay valid.
 *
 * @throws NotFoundError if the team doesn't exist
 */
export async function updateTeam(
  id: string,
  input: TeamInput,
): Promise<TeamDetails> {
  const stored = toStored(input);
  // Optional fields cleared in the form are removed, not left as before.
  const set = Object.fromEntries(
    Object.entries(stored).filter(([, value]) => value !== undefined),
  );
  const unset = (Object.keys(stored) as (keyof typeof stored)[])
    .filter((key) => stored[key] === undefined);

  const found = await repository.updateById(
    id,
    { ...set, updatedAt: new Date() },
    // Legacy fields are superseded by sport/instructors once saved.
    [...unset, "category", "coachUserId"],
  );
  if (!found) throw new NotFoundError("Holdet findes ikke");

  const updated = await repository.findById(id);
  if (!updated) throw new NotFoundError("Holdet findes ikke");
  return toTeamDetails(updated);
}

/** @throws NotFoundError if the team doesn't exist */
export async function deleteTeam(id: string): Promise<void> {
  const deleted = await repository.deleteById(id);
  if (!deleted) throw new NotFoundError("Holdet findes ikke");
}

export async function getTeams(): Promise<TeamDetails[]> {
  const teams = await repository.findAll();
  return teams.map(toTeamDetails);
}

export async function getTeamBySlug(slug: string): Promise<TeamDetails | null> {
  const team = await repository.findBySlug(slug);
  return team ? toTeamDetails(team) : null;
}

/** Location id → names of the teams with a session there. */
export async function getLocationUsage(): Promise<Record<string, string[]>> {
  const usage: Record<string, string[]> = {};
  for (const team of await getTeams()) {
    const ids = team.sessions.map((s) => s.locationId).filter(Boolean);
    for (const id of new Set(ids)) {
      (usage[id!] ??= []).push(team.name);
    }
  }
  return usage;
}

/** Role id → names of the teams that use it. Includes legacy coaches. */
export async function getRoleUsage(): Promise<Record<string, string[]>> {
  const usage: Record<string, string[]> = {};
  for (const team of await getTeams()) {
    for (const role of new Set(team.instructors.map((i) => i.role))) {
      (usage[role] ??= []).push(team.name);
    }
  }
  return usage;
}

export async function getNumberOfTeams(): Promise<number> {
  const teams = await repository.findAll();
  return teams.length;
}
