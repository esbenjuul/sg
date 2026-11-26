import { getCollection } from "@/utils/db.ts";
import type { SettingsDocument } from "./types.ts";

const SETTINGS_COLLECTION = "settings";
const SETTINGS_ID = "app";

async function settings() {
  return await getCollection<SettingsDocument>(SETTINGS_COLLECTION);
}

export async function findSettings(): Promise<SettingsDocument | null> {
  const collection = await settings();
  return await collection.findOne({ _id: SETTINGS_ID }) ?? null;
}

/** Creates the settings document if it doesn't exist yet. */
export async function upsertSettings(
  set: Omit<SettingsDocument, "_id">,
): Promise<void> {
  const collection = await settings();
  await collection.updateOne(
    { _id: SETTINGS_ID },
    { $set: set },
    { upsert: true },
  );
}
