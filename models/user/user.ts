import { ObjectId } from "mongodb";
import * as bcrypt from "bcrypt";
import { getDatabase } from "../../utils/db.ts";

export type UserRole = 'admin' | 'teamlead' | 'member' | 'trainer' | 'reader'
export type UserStatus = 'active' | 'inactive' | 'authenticate_wait'; 

export type ConventusUser = {
  afdeling: string;
  gruppe: string;
  id: string;
  navn: string;
  mobilLand: string;
  mobilLandeKode: string;
  mobil: string;
  eMail: string;
  fødselsdag: string;
}


export interface User {
  _id?: ObjectId;
  name: string;
  email: string;
  password: string;
  mobile?: string;
  conventusId?: string;
  birthday?: string; 
  metadata?: Record<string, any> 
  status?: UserStatus;
}
export interface UserDetails extends User {
  createdAt: Date;
  updatedAt: Date;
  role: UserRole;
  
  
}

export interface UserResponse {
  _id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  role: UserRole;
}
export interface ImportResponse {
  numberOfImports: number;
  numberOfDublicates: number;
}

const USERS_COLLECTION = "users";

export async function createUser({name, email, password, birthday='', mobile='', status='inactive'}: User): Promise<UserResponse | null> {
  
  try {
    const db = await getDatabase();
    const usersCollection = db.collection<UserDetails>(USERS_COLLECTION);

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      throw new Error("User already exists");
    }

    // Hash the password
    const hashedPassword = bcrypt.hashSync(password);

    const user: Omit<UserDetails, "_id"> = {
      email,
      password: hashedPassword,
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
      role: 'member',
      status,
      mobile,
    };

    const insertedId = await usersCollection.insertOne(user);

    return {
      _id: insertedId.toString(),
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      role: user.role
      
    };
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

export async function findUserByEmail(email: string): Promise<User | null> {
  try {
    const db = await getDatabase();
    const usersCollection = db.collection<UserDetails>(USERS_COLLECTION);
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
    const usersCollection = db.collection<UserDetails>(USERS_COLLECTION);
    const user = await usersCollection.findOne({ _id: new ObjectId(id) });

    if (!user) return null;

    return {
      _id: user._id!.toString(),
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      role: user.role,
    };
  } catch (error) {
    console.error("Error finding user by ID:", error);
    return null;
  }
}
export async function getUsers(): Promise<Array<UserDetails> | null>{
    try {
        const db = await getDatabase();
        const usersCollection = db.collection<User>(USERS_COLLECTION);
        const users = await usersCollection.find();
        //console.log("db", await users.map((a)=>a));
        return users.map((user) => ({
            ...user
        }));
  } catch (error) {
    console.error("Error finding users:", error);
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
    role: user.role
  };
}

export async function importUsers(users: ConventusUser[]): ImportResponse | undefined  {
  if(!users) {
    return;
  }
  let numberOfDublicates = 0;
  let numberOfImports = 0;
  
  for(const user of users) {
    
    const userExist = await findUserByEmail(user.eMail)
    if (userExist) {
      numberOfDublicates++
    } else {
      await createUser({
        name: user.navn,
        email: user.eMail,
        password: 'welcome123!',
        status: 'inactive',
        conventusId: user.id,
        birthday: user['fødselsdag'],
        mobile: `${user.mobilLandeKode}${user.mobil}`

      })
      numberOfImports++
    }
  }
  return { numberOfDublicates, numberOfImports }
}