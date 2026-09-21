import * as repository from "./repository.ts";
import type { Resource } from "./types.ts";

export async function createUpload(
  resources: Resource[],
): Promise<{ insertedIds: unknown; insertedCount: number }> {
  return await repository.insertMany(resources);
}
