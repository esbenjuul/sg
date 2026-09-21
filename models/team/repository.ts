import { ObjectId } from "mongodb";
import { getCollection } from "@/utils/db.ts";
import type { Team } from "./types.ts";

const TEAMS_COLLECTION = "teams";

async function teams() {
  return await getCollection<Team>(TEAMS_COLLECTION);
}

export async function insertTeam(team: Omit<Team, "_id">): Promise<ObjectId> {
  const collection = await teams();
  return await collection.insertOne(team);
}

export async function findBySlug(slug: string): Promise<Team | null> {
  const collection = await teams();
  return await collection.findOne({ slug }) ?? null;
}

export async function findAll(): Promise<Team[]> {
  const collection = await teams();
  const teamsList = await collection.find();
  return teamsList.map((team) => ({ ...team }));
}
