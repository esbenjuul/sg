import * as bcrypt from "bcrypt";
import { ConflictError } from "../errors.ts";
import * as repository from "./repository.ts";
import type {
  ConventusUser,
  CreateUserInput,
  ImportResponse,
  UserDetails,
  UserResponse,
} from "./types.ts";

export function sanitizeUser(user: UserDetails): UserResponse {
  return {
    _id: user._id!.toString(),
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    role: user.role,
  };
}

export async function createUser(
  input: CreateUserInput,
): Promise<UserResponse> {
  const existingUser = await repository.findByEmail(input.email);
  if (existingUser) {
    throw new ConflictError("User already exists");
  }

  const now = new Date();
  const user: Omit<UserDetails, "_id"> = {
    email: input.email,
    password: bcrypt.hashSync(input.password),
    name: input.name,
    createdAt: now,
    updatedAt: now,
    role: "member",
    status: input.status ?? "inactive",
    mobile: input.mobile ?? "",
    birthday: input.birthday ?? "",
    conventusId: input.conventusId,
  };

  const insertedId = await repository.insertUser(user);

  return {
    _id: insertedId.toString(),
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    role: user.role,
  };
}

/** Returns credentials including password hash — for auth only. */
export async function findUserByEmail(
  email: string,
): Promise<UserDetails | null> {
  return await repository.findByEmail(email);
}

export async function findUserById(id: string): Promise<UserResponse | null> {
  const user = await repository.findById(id);
  if (!user) return null;
  return sanitizeUser(user);
}

export async function getUsers(): Promise<UserResponse[]> {
  const users = await repository.findAll();
  return users.map(sanitizeUser);
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

export async function importUsers(
  users: ConventusUser[],
): Promise<ImportResponse> {
  let numberOfDublicates = 0;
  let numberOfImports = 0;

  for (const user of users) {
    const userExist = await repository.findByEmail(user.eMail);
    if (userExist) {
      numberOfDublicates++;
    } else {
      await createUser({
        name: user.navn,
        email: user.eMail,
        password: "welcome123!",
        status: "inactive",
        conventusId: user.id,
        birthday: user["fødselsdag"],
        mobile: `${user.mobilLandeKode}${user.mobil}`,
      });
      numberOfImports++;
    }
  }

  return { numberOfDublicates, numberOfImports };
}
