import type { Handlers } from "fresh";

export const handler: Handlers = {
  GET() {
    // Clear session cookie
    const headers = new Headers({
      "Set-Cookie": "session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0",
      "Location": "/",
    });

    return new Response(null, {
      status: 302,
      headers,
    });
  },
};
