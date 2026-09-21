import { ObjectId } from "mongodb";

export interface Team {
  _id?: ObjectId;
  name: string;
  category: string;
  slug: string;
  image?: string;
  coachUserId?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTeamInput {
  name: string;
  category: string;
  slug: string;
  image?: string;
  coachUserId?: string;
}
