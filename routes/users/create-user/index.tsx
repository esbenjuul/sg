import { HttpError } from "fresh";
import { define } from "@/utils/state.ts";
import { Input } from "@/components/Input/Input.tsx";
import { Button } from "@/components/button/button.tsx";
import { createUser } from "@/models/user/user.ts";

export interface CreateUserDeps {
  createUser: typeof createUser;
}

export async function handleCreateUser(
  form: FormData,
  deps: CreateUserDeps = { createUser },
): Promise<Response> {
  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "").trim();
  const mobile = String(form.get("mobile") ?? "").trim();
  const birthday = String(form.get("birthday") ?? "").trim();

  if (!name || !email || !password) {
    throw new HttpError(400, "Name, email and password are required");
  }

  await deps.createUser({
    name,
    email,
    password,
    mobile: mobile || undefined,
    birthday: birthday || undefined,
  });

  return new Response(null, {
    status: 303,
    headers: {
      Location: "/users",
    },
  });
}

export const handler = define.handlers({
  async POST(ctx) {
    try {
      const form = await ctx.req.formData();
      return await handleCreateUser(form);
    } catch (err) {
      console.error(err);
      if (err instanceof HttpError) {
        throw err;
      }
      throw new HttpError(500);
    }
  },
});

export default define.page<typeof handler>(function CreateUserPage(_ctx) {
  return (
    <section class="container">
      <div class="content-box">
        <h2>Create user</h2>
        <form method="POST">
          <Input
            type="text"
            name="name"
            label="Name"
            required
            placeholder="Full name"
          />
          <Input
            type="email"
            name="email"
            label="Email"
            required
            placeholder="you@example.com"
          />
          <Input
            type="password"
            name="password"
            label="Password"
            required
            placeholder="Set an initial password"
          />
          <Input
            type="text"
            name="mobile"
            label="Mobile (optional)"
            placeholder="+4512345678"
          />
          <Input
            type="date"
            name="birthday"
            label="Birthday (optional)"
          />
          <div class="row row-align-right">
            <Button type="submit" buttonType="primary">
              Create user
            </Button>

          </div>
        </form>
      </div>
    </section>
  );
});

