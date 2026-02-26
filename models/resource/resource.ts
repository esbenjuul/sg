import { ObjectId } from "mongodb";
import * as bcrypt from "bcrypt";
import { getDatabase } from "../../utils/db.ts";

export type UserRole = 'admin' | 'teamlead' | 'member' | 'novice'

export interface Resource {
  _id?: ObjectId;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  conventusId: number;
  landCode: string;
  phone: number;
}

export interface ResourceResponse {
  _id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const RESOURCE_COLLECTION = "resources";

export async function createUser(
  email: string,
  password: string,
  name: string,
): Promise<ResourceResponse | null> {
  try {
    const db = await getDatabase();
    const resourceCollection = db.collection<Resource>(RESOURCE_COLLECTION);

    // Check if user already exists
    const existingUser = await resourceCollection.findOne({ email });
    if (existingUser) {
      throw new Error("User already exists");
    }

    // Hash the password

    const resource: Omit<Resource, "_id"> = {
      email,
      name,
      createdAt: new Date(),
      updatedAt: new Date(),

    };

    const insertedId = await resourceCollection.insertOne(user);

    return {
      _id: insertedId.toString(),
      email: resource.email,
      name: resource.name,
      createdAt: resource.createdAt,
      updatedAt: resource.updatedAt,
    };
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

export async function createUpload(
  resources: Resource[],
): Promise<{insertedIds: any, insertedCount: number } | null> {
  try {
    const db = await getDatabase();
    const resourceCollection = db.collection<Resource>(RESOURCE_COLLECTION);


    const {insertedIds, insertedCount} = await resourceCollection.insertMany(resources);

    return {
        insertedIds,
        insertedCount
    };
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

// export async function findUserByEmail(email: string): Promise<User | null> {
//   try {
//     const db = await getDatabase();
//     const usersCollection = db.collection<User>(USERS_COLLECTION);
//     const user = await usersCollection.findOne({ email });
//     return user || null;
//   } catch (error) {
//     console.error("Error finding user:", error);
//     return null;
//   }
// }

// export async function findUserById(id: string): Promise<UserResponse | null> {
//   try {
//     const db = await getDatabase();
//     const usersCollection = db.collection<User>(USERS_COLLECTION);
//     const user = await usersCollection.findOne({ _id: new ObjectId(id) });

//     if (!user) return null;

//     return {
//       _id: user._id!.toString(),
//       email: user.email,
//       name: user.name,
//       createdAt: user.createdAt,
//       updatedAt: user.updatedAt,
//       role: user.role,
//     };
//   } catch (error) {
//     console.error("Error finding user by ID:", error);
//     return null;
//   }
// }
// export async function getUsers(): Promise<Array<User> | null>{
//     try {
//         const db = await getDatabase();
//         const usersCollection = db.collection<User>(USERS_COLLECTION);
//         const users = await usersCollection.find();
//         //console.log("db", await users.map((a)=>a));
//         return users.map((user) => ({
//             ...user
//         }));
//   } catch (error) {
//     console.error("Error finding users:", error);
//     return null;
//   }
// }

// export async function verifyPassword(
//   plainPassword: string,
//   hashedPassword: string,
// ): Promise<boolean> {
//   try {
//     return bcrypt.compareSync(plainPassword, hashedPassword);
//   } catch (error) {
//     console.error("Error verifying password:", error);
//     return false;
//   }
// }


// export function sanitizeUser(user: User): UserResponse {
//   return {
//     _id: user._id!.toString(),
//     email: user.email,
//     name: user.name,
//     createdAt: user.createdAt,
//     updatedAt: user.updatedAt,
//     role: user.role
//   };
// }
