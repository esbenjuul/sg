import { HttpError, page } from "fresh";
import {
  type ConventusUser,
  getUsers,
  importUsers,
} from "@/models/user/index.ts";
import { define } from "@/utils/state.ts";
import { PlusIcon } from "@/components/icons/PlusIcon.tsx";
import neatCsv from "neat-csv";
import camelcase from "camelcase";
import UploadUsers from "@/islands/UploadUsers.tsx";
import { UserList } from "../../islands/user/UserList.tsx";

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
    const form = await ctx.req.formData();
    const file = form.get("file") as File;

    if (!file) {
      {
        data: {
          message: "Please try again";
        }
      }
    }

    const name = file.name;
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

export default define.page<typeof handler>(function UsersPage({ data }) {
  const onEdit = (userId: string) => {
    console.log("Edit user with ID:", userId);
  };

  const onDelete = (userId: string) => {
    console.log("Delete user with ID:", userId);
  };
  return (
    <div class="container">
      <header class="page-header">
        <h1>Brugere</h1>
        <span class="page-subtitle">
          Der er i øjeblikket {data.users?.length ?? 0} brugere
        </span>
      </header>
      <div class="">
        {data.importResult &&
          (
            <div>
              duplicates: {data.importResult.numberOfDublicates} <br />
              imports: {data.importResult.numberOfImports}
            </div>
          )}

        <div class="row row-align-right">
          <a href="/users/create-user" class="icon-link">
            <PlusIcon></PlusIcon>
            <span>Create user</span>
          </a>
          <UploadUsers></UploadUsers>
        </div>
        {
          /* <form method="post" encType="multipart/form-data">
                <Input type="file" name="file" label="upload csv file from conventus"></Input>
                <button>upload</button>
            </form> */
        }

        <section class="">
          <UserList users={data.users} />
        </section>
      </div>
    </div>
  );
});
