import { login } from "@/api/contracts/auth.ts";
import { ApiError, handle } from "@/api/server.ts";
import { findUserByEmail, verifyPassword } from "@/models/user/index.ts";
import { startSession } from "@/utils/session.ts";
import { define } from "@/utils/state.ts";

export const handler = define.handlers({
  POST: handle(login, async ({ input, headers }) => {
    const user = await findUserByEmail(input.email);
    if (!user || !(await verifyPassword(input.password, user.password))) {
      throw new ApiError(401, "unauthorized", "Invalid credentials");
    }

    const id = user._id!.toString();
    await startSession(
      { userId: id, email: user.email, name: user.name },
      headers,
    );

    return {
      user: { id, email: user.email, name: user.name, role: user.role },
    };
  }),
});
