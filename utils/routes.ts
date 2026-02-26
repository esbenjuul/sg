import { createDefine } from "fresh";
import { User } from "./user.ts";

export type State = {
    users: User[];
}



// Setup, do this once in a file and import it everywhere else.
export const define = createDefine<State>();
