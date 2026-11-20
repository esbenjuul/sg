import { signup } from "@/api/contracts/auth.ts";
import { handle } from "@/api/server.ts";
import { createUser } from "@/models/user/index.ts";
import { startSession } from "@/utils/session.ts";
import { define } from "@/utils/state.ts";

export const handler = define.handlers({
  // ConflictError from createUser is mapped to 409 by handle().
  POST: handle(signup, async ({ input, headers }) => {
    const user = await createUser({
      name: input.name,
      email: input.email,
      password: input.password,
    });

    await startSession(
      { userId: user._id, email: user.email, name: user.name },
      headers,
    );

    // TODO: welcome mail. The old import (utils/mailersend.ts) doesn't exist,
    // and utils/mailjet.ts only sends a hardcoded test mail.

    return {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }),
});
