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

export async function findById(id: string): Promise<Team | null> {
  const collection = await teams();
  return await collection.findOne({ _id: new ObjectId(id) }) ?? null;
}

export async function findAll(): Promise<Team[]> {
  const collection = await teams();
  const teamsList = await collection.find();
  return teamsList.map((team) => ({ ...team }));
}

/**
 * Applies `$set` (and optional `$unset`) to one team.
 * Returns false if no team matched.
 */
export async function updateById(
  id: string,
  set: Partial<Omit<Team, "_id" | "slug" | "createdAt">>,
  unset: (keyof Team)[] = [],
): Promise<boolean> {
  const collection = await teams();
  const result = await collection.updateOne(
    { _id: new ObjectId(id) },
    unset.length
      ? {
        $set: set,
        $unset: Object.fromEntries(unset.map((key) => [key, ""])),
      }
      : { $set: set },
  );
  return result.matchedCount > 0;
}

/** Returns false if no team matched. */
export async function deleteById(id: string): Promise<boolean> {
  const collection = await teams();
  const deleted = await collection.deleteOne({ _id: new ObjectId(id) });
  return deleted > 0;
}
