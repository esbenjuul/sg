import { ObjectId } from "mongodb";
import { getCollection } from "../../utils/db.ts";
import type { UserDetails } from "./types.ts";

const USERS_COLLECTION = "users";

async function users() {
  return await getCollection<UserDetails>(USERS_COLLECTION);
}

export async function insertUser(
  user: Omit<UserDetails, "_id">,
): Promise<ObjectId> {
  const collection = await users();
  return await collection.insertOne(user);
}

export async function findByEmail(
  email: string,
): Promise<UserDetails | null> {
  const collection = await users();
  return await collection.findOne({ email }) ?? null;
}

export async function findById(id: string): Promise<UserDetails | null> {
  const collection = await users();
  return await collection.findOne({ _id: new ObjectId(id) }) ?? null;
}

export async function findAll(): Promise<UserDetails[]> {
  const collection = await users();
  const usersList = await collection.find();
  return usersList.map((user) => ({ ...user }));
}

/** Applies `$set` to one user. Returns false if no user matched. */
export async function updateById(
  id: string,
  set: Partial<Omit<UserDetails, "_id" | "password" | "createdAt">>,
): Promise<boolean> {
  const collection = await users();
  const result = await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: set },
  );
  return result.matchedCount > 0;
}
