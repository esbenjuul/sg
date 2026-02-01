import type { Context } from "fresh";
import { verifySessionToken } from "../utils/session.ts";
import { findUserById } from "../utils/user.ts";

export interface AuthState {
  user?: {
    _id: string;
    email: string;
    name: string;
  };
}

export async function authMiddleware(ctx: Context<AuthState>) {
  // Get session token from cookie
  const cookies = ctx.req.headers.get("cookie");
  const sessionToken = cookies
    ?.split("; ")
    .find((c) => c.startsWith("session="))
    ?.split("=")[1];

  if (sessionToken) {
    try {
      const sessionData = await verifySessionToken(sessionToken);
      if (sessionData) {
        // Verify user still exists
        const user = await findUserById(sessionData.userId);
        if (user) {
          ctx.state.user = {
            _id: user._id,
            email: user.email,
            name: user.name,
          };
        }
      }
    } catch (error) {
      console.error("Auth middleware error:", error);
    }
  }

  return await ctx.next();
}
