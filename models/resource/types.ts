import { ObjectId } from "mongodb";

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
