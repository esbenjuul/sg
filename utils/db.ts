import { MongoClient } from "mongodb";

const MONGODB_URI = Deno.env.get("MONGODB_URI") ||
  "mongodb://admin:password123@localhost:27017";
const MONGODB_DB = Deno.env.get("MONGODB_DB") || "fresh_auth_app";

let client: MongoClient | null = null;

export async function connectToDatabase() {
  if (client) {
    return client.database(MONGODB_DB);
  }

  try {
    client = new MongoClient();
    await client.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");
    return client.database(MONGODB_DB);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
}

export async function getDatabase() {
  if (!client) {
    return await connectToDatabase();
  }
  return client.database(MONGODB_DB);
}

export async function closeDatabase() {
  if (client) {
    client.close();
    client = null;
    console.log("🔌 Disconnected from MongoDB");
  }
}
