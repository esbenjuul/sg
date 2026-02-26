import { HttpError, page } from "fresh";
import { ConventusUser, getUsers, importUsers } from "../../models/user/user.ts";
import { define } from "../../utils/state.ts";
import { Input } from "../../components/Input/Input.tsx"
import { PlusIcon } from "../../components/icons/PlusIcon.tsx"
import { Button } from "../../components/button/button.tsx"
import neatCsv from 'neat-csv';
import camelcase from 'camelcase';
import { ImportIcon } from "../../components/icons/ImportIcon.tsx";

export const handler = define.handlers({
    async GET() {
        try {
            const users = await getUsers();
            return page({users});
        } catch(err) {
            console.error(err);
            throw new HttpError(500);
        }
        
    },
    async POST(ctx) {
        const form = await ctx.req.formData();
        const file = form.get("file") as File;

        if (!file) {
             { data: { message: "Please try again" } };
        }

        const name = file.name;
        const contents = await file.text();
        const parsed = await neatCsv(contents, {separator: ';', mapHeaders: ({header, index})=>camelcase(header)}); 
        
        const importResult = await importUsers(parsed as ConventusUser[]);
        console.log(importResult);

        return { data: { message: `${name} uploaded!` } };
    },
});

export default define.page<typeof handler>(function UsersPage({data}) {

  return (
    <>
    <section class="container">
      <div class="content-box">
        <h2>Users</h2>
        <div class="row row-align-right">
          <a href="/users/create-resource"><ImportIcon></ImportIcon> Create user</a>
          <Button buttonType="primary"><PlusIcon></PlusIcon><span>Create user</span></Button>
        </div>
            <form method="post" encType="multipart/form-data">
                <Input type="file" name="file" label="upload csv file from conventus"></Input>
                <button>upload</button>
            </form>

        <article class="profile-section">
          
          
          <ul class="profile-list">
            <li>
                <h4>Name</h4>
                <h4>Email</h4>
                <h4>Role</h4>
                
            </li>
            {data.users?.map((user)=>(
                <li>
                    <span>{user.name}</span>
                    <span>{user.email}</span>
                    <span>{user.role}</span>
                </li>))}
          </ul>
        </article>
      </div>
    </section>
   
    </>
  );
});
