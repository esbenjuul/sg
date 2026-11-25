import * as bcrypt from "bcrypt";
import { ConflictError, NotFoundError } from "../errors.ts";
import * as repository from "./repository.ts";
import type {
  ConventusUser,
  CreateUserInput,
  ImportResponse,
  UpdateUserInput,
  UserDetails,
  UserProfile,
  UserResponse,
} from "./types.ts";

export function sanitizeUser(user: UserDetails): UserResponse {
  return {
    _id: user._id!.toString(),
    email: user.email,
    name: user.name,
    mobile: user.mobile,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    role: user.role,
  };
}

export async function createUser(
  input: CreateUserInput,
): Promise<UserProfile> {
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
  return toUserProfile({ ...user, _id: insertedId });
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

export function toUserProfile(user: UserDetails): UserProfile {
  return {
    ...sanitizeUser(user),
    mobile: user.mobile,
    birthday: user.birthday,
    conventusId: user.conventusId,
    status: user.status,
  };
}

/**
 * Updates the given fields on a user. Authorization (who may change what)
 * is the caller's job.
 *
 * @throws NotFoundError if the user doesn't exist
 * @throws ConflictError if the new email belongs to another user
 */
export async function updateUser(
  id: string,
  input: UpdateUserInput,
): Promise<UserProfile> {
  if (input.email) {
    const owner = await repository.findByEmail(input.email);
    if (owner && owner._id!.toString() !== id) {
      throw new ConflictError("Email is already in use");
    }
  }

  // Drop undefined keys so they don't overwrite stored values.
  const set = Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined),
  ) as UpdateUserInput;

  const found = await repository.updateById(id, {
    ...set,
    updatedAt: new Date(),
  });
  if (!found) throw new NotFoundError("User not found");

  const updated = await repository.findById(id);
  if (!updated) throw new NotFoundError("User not found");
  return toUserProfile(updated);
}
