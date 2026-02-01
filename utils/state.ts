import { createDefine } from "fresh";
import type { AuthState } from "./middleware/auth.ts";

export const define = createDefine<AuthState>();
