import type { Context } from "fresh";
import { createUser, sanitizeUser } from "../../../utils/user.ts";
import {
  createSessionExpiry,
  createSessionToken,
} from "../../../utils/session.ts";
import { define } from "../../../utils/state.ts";

import { AuthState } from "../../../middleware/auth.ts";

interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

export const handler = define.handlers({
  async POST(ctx: Context<AuthState>) {
    try {
      const form = await ctx.req.formData();
      console.log("Signup request received", form);
      const email = form.get("email")?.toString();
      const password = form.get("password")?.toString();
      const name = form.get("name")?.toString();

      console.log("Parsed form data:", { email, password, name });
      // Validate input
      if (!email || !password || !name) {
        return new Response(
          JSON.stringify({
            error: `Missing required fields: email: ${email}`,
          }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      if (password.length < 6) {
        return new Response(
          JSON.stringify({ error: "Password must be at least 6 characters" }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      // Create user
      const user = await createUser(email, password, name);

      if (!user) {
        return new Response(
          JSON.stringify({ error: "Failed to create user" }),
          { status: 500, headers: { "Content-Type": "application/json" } },
        );
      }

      // Create session
      const sessionData = {
        userId: user._id,
        email: user.email,
        name: user.name,
        expiresAt: createSessionExpiry(),
      };

      const sessionToken = await createSessionToken(sessionData);

      // Set cookie and return success
      const headers = new Headers({
        "Content-Type": "application/json",
        "Set-Cookie": `session=${sessionToken}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${
          60 * 60 * 24 * 7
        }`,
      });

      return new Response(
        JSON.stringify({ user, message: "Signup successful" }),
        { status: 201, headers },
      );
    } catch (error) {
      console.error("Signup error:", error);

      if (error instanceof Error && error.message === "User already exists") {
        return new Response(JSON.stringify({ error: "User already exists" }), {
          status: 409,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
});
