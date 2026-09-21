import { getCollection } from "../../utils/db.ts";
import type { Resource } from "./types.ts";

const RESOURCE_COLLECTION = "resources";

async function resources() {
  return await getCollection<Resource>(RESOURCE_COLLECTION);
}

export async function insertMany(
  items: Resource[],
): Promise<{ insertedIds: unknown; insertedCount: number }> {
  const collection = await resources();
  const { insertedIds, insertedCount } = await collection.insertMany(items);
  return { insertedIds, insertedCount };
}
