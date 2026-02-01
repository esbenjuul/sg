import type { Context } from "fresh";
import {
  findUserByEmail,
  sanitizeUser,
  verifyPassword,
} from "../../../utils/user.ts";
import {
  createSessionExpiry,
  createSessionToken,
} from "../../../utils/session.ts";
import { define } from "../../../utils/state.ts";
import { AuthState } from "../../../middleware/auth.ts";

interface LoginRequest {
  email: string;
  password: string;
}

export const handler = define.handlers({
  async POST(ctx: Context<AuthState>) {
    try {
      const body = await ctx.req.formData();
      const email = body.get("email")?.toString();
      const password = body.get("password")?.toString();

      // Validate input
      if (!email || !password) {
        return new Response(
          JSON.stringify({ error: "Missing email or password" }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      // Find user
      const user = await findUserByEmail(email);
      if (!user) {
        return new Response(JSON.stringify({ error: "Invalid credentials" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Verify password
      const isValidPassword = await verifyPassword(password, user.password);
      if (!isValidPassword) {
        return new Response(JSON.stringify({ error: "Invalid credentials" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Create session
      const sessionData = {
        userId: user._id!.toString(),
        email: user.email,
        name: user.name,
        expiresAt: createSessionExpiry(),
      };

      const sessionToken = await createSessionToken(sessionData);

      // Set cookie and return success
      const headers = new Headers({
        "Content-Type": "application/json",
        "Set-Cookie":
          `session=${sessionToken}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${
            60 * 60 * 24 * 7
          }`,
      });

      return new Response(
        JSON.stringify({
          user: sanitizeUser(user),
          message: "Login successful",
        }),
        { status: 200, headers },
      );
    } catch (error) {
      console.error("Login error:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
});
