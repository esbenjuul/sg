import { HttpError } from "fresh";
import { createTeam } from "@/models/team/team.ts";
import { findUserById } from "@/models/user/user.ts";

export interface CreateTeamDeps {
  createTeam: typeof createTeam;
  findUserById: typeof findUserById;
}

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/(^-|-$)/g, "");
}

export async function handleCreateTeam(
  form: FormData,
  deps: CreateTeamDeps = { createTeam, findUserById },
): Promise<Response> {
  const name = String(form.get("name") ?? "").trim();
  const category = String(form.get("category") ?? "").trim();
  const coachUserId = String(form.get("coachUserId") ?? "").trim();
  const image = String(form.get("image") ?? "").trim();

  if (!name || !category) {
    throw new HttpError(400, "Name and category are required");
  }

  if (coachUserId) {
    const coach = await deps.findUserById(coachUserId);
    if (!coach) {
      throw new HttpError(400, "Selected coach user does not exist");
    }
  }

  const slug = toSlug(name);
  if (!slug) {
    throw new HttpError(400, "Name is invalid");
  }

  try {
    await deps.createTeam({
      name,
      category,
      slug,
      coachUserId: coachUserId || undefined,
      image: image || undefined,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Team already exists") {
      throw new HttpError(400, "A team with this name already exists");
    }
    throw error;
  }

  return new Response(null, {
    status: 303,
    headers: { Location: "/teams" },
  });
}
