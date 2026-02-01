import { ObjectId } from "mongodb";
import { getDatabase } from "./db.ts";
import * as bcrypt from "bcrypt";

export interface User {
  _id?: ObjectId;
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserResponse {
  _id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const USERS_COLLECTION = "users";

export async function createUser(
  email: string,
  password: string,
  name: string,
): Promise<UserResponse | null> {
  try {
    console.log("db access");
    const db = await getDatabase();
    const usersCollection = db.collection<User>(USERS_COLLECTION);

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      throw new Error("User already exists");
    }

    // Hash the password
    const hashedPassword = bcrypt.hashSync(password);

    const user: Omit<User, "_id"> = {
      email,
      password: hashedPassword,
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const insertedId = await usersCollection.insertOne(user);

    return {
      _id: insertedId.toString(),
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

export async function findUserByEmail(email: string): Promise<User | null> {
  try {
    const db = await getDatabase();
    const usersCollection = db.collection<User>(USERS_COLLECTION);
    const user = await usersCollection.findOne({ email });
    return user || null;
  } catch (error) {
    console.error("Error finding user:", error);
    return null;
  }
}

export async function findUserById(id: string): Promise<UserResponse | null> {
  try {
    const db = await getDatabase();
    const usersCollection = db.collection<User>(USERS_COLLECTION);
    const user = await usersCollection.findOne({ _id: new ObjectId(id) });

    if (!user) return null;

    return {
      _id: user._id!.toString(),
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  } catch (error) {
    console.error("Error finding user by ID:", error);
    return null;
  }
}

export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  try {
    return bcrypt.compareSync(plainPassword, hashedPassword);
  } catch (error) {
    console.error("Error verifying password:", error);
    return false;
  }
}

export function sanitizeUser(user: User): UserResponse {
  return {
    _id: user._id!.toString(),
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
