import { createDefine } from "fresh";
import type { AuthState } from "../middleware/auth.ts";
import type { User } from "../models/user/index.ts";

export interface State extends AuthState {
  users?: User[];
}

export const define = createDefine<State>();
