import { createDefine } from "fresh";
import type { AuthState } from "../middleware/auth.ts";
import { User } from "../models/user/user.ts";

export interface State extends AuthState {
    users?: User[];
}

export const define = createDefine<State>();
