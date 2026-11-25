import { HttpError, page } from "fresh";
import {
  type ConventusUser,
  getUsers,
  importUsers,
} from "@/models/user/index.ts";
import { define } from "@/utils/state.ts";
import neatCsv from "neat-csv";
import camelcase from "camelcase";
import { UserList } from "../../islands/user/UserList.tsx";
import { UserMenu } from "../../islands/user/UserMenu.tsx";

export const handler = define.handlers({
  async GET() {
    try {
      const users = await getUsers();
      return page({ users, importResult: null });
    } catch (err) {
      console.error(err);
      throw new HttpError(500);
    }
  },
  async POST(ctx) {
    // Importing creates users, so it's admin-only like POST /api/users.
    if (ctx.state.user?.role !== "admin") {
      throw new HttpError(403, "Only admins can import users");
    }
    const form = await ctx.req.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) {
      throw new HttpError(400, "Please choose a CSV file to import");
    }

    const contents = await file.text();
    const parsed = await neatCsv(contents, {
      separator: ";",
      mapHeaders: ({ header, index }) => camelcase(header),
    });

    const importResult = await importUsers(parsed as ConventusUser[]);
    console.log(importResult);

    //return { data: { message: `${name} uploaded!` } };
    try {
      const users = await getUsers();
      return page({ users, importResult });
    } catch (err) {
      console.error(err);
      throw new HttpError(500);
    }
  },
});

export default define.page<typeof handler>(function UsersPage({ data, state }) {
  return (
    <div class="container">
      <header class="page-header">
        <h1>Brugere</h1>
        <span class="page-header-subtitle">
          Der er i øjeblikket {data.users?.length ?? 0} brugere
        </span>
        <div class="page-header-action">
          {state.user?.role === "admin" && <UserMenu />}
        </div>
      </header>
      <div class="">
        {data.importResult &&
          (
            <div>
              duplicates: {data.importResult.numberOfDublicates} <br />
              imports: {data.importResult.numberOfImports}
            </div>
          )}

        <section class="">
          <UserList users={data.users} />
        </section>
      </div>
    </div>
  );
});
