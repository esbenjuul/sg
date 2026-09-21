import { ObjectId } from "mongodb";
import { ConflictError } from "../errors.ts";
import * as repository from "./repository.ts";
import type { CreateTeamInput, Team } from "./types.ts";

export async function createTeam(input: CreateTeamInput): Promise<string> {
  const existing = await repository.findBySlug(input.slug);
  if (existing) {
    throw new ConflictError("Team already exists");
  }

  const now = new Date();
  const team: Omit<Team, "_id"> = {
    name: input.name,
    category: input.category,
    slug: input.slug,
    image: input.image,
    coachUserId: input.coachUserId
      ? new ObjectId(input.coachUserId)
      : undefined,
    createdAt: now,
    updatedAt: now,
  };

  const insertedId = await repository.insertTeam(team);
  return insertedId.toString();
}

export async function getTeams(): Promise<Team[]> {
  return await repository.findAll();
}

export async function getTeamBySlug(slug: string): Promise<Team | null> {
  return await repository.findBySlug(slug);
}
export async function getNumberOfTeams(): Promise<number> {
  const teams = await repository.findAll();
  return teams.length;
}
