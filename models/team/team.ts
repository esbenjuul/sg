import { ObjectId } from "mongodb";
import { getDatabase } from "@/utils/db.ts";

export interface Team {
  _id?: ObjectId;
  name: string;
  category: string;
  slug: string;
  image?: string;
  coachUserId?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTeamInput {
  name: string;
  category: string;
  slug: string;
  image?: string;
  coachUserId?: string;
}

const TEAMS_COLLECTION = "teams";

export async function createTeam(input: CreateTeamInput): Promise<string> {
  const db = await getDatabase();
  const teamsCollection = db.collection<Team>(TEAMS_COLLECTION);

  const existing = await teamsCollection.findOne({ slug: input.slug });
  if (existing) {
    throw new Error("Team already exists");
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

  const insertedId = await teamsCollection.insertOne(team);
  return insertedId.toString();
}

export async function getTeams(): Promise<Team[]> {
  const db = await getDatabase();
  const teamsCollection = db.collection<Team>(TEAMS_COLLECTION);
  const teams = await teamsCollection.find();
  return teams.map((team) => ({ ...team }));
}

export async function getTeamBySlug(slug: string): Promise<Team | null> {
  const db = await getDatabase();
  const teamsCollection = db.collection<Team>(TEAMS_COLLECTION);
  const team = await teamsCollection.findOne({ slug });
  return team ?? null;
}
