import { useState } from "preact/hooks";
import { fetchApi } from "@/api/client.ts";
import type { InputOf } from "@/api/contract.ts";
import { updateUser } from "@/api/contracts/user.ts";
import { UserCard } from "@/components/usercard/UserCard.tsx";
import { UserDetails } from "@/models/user/types.ts";
import { UserDialog } from "./UserDialog.tsx";
import { ObjectId } from "mongodb";

export function UserList({ users }: { users: UserDetails[] }) {
  // Local copy so the list can reflect saved changes without a reload.
  const [list, setList] = useState(users);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserDetails | null>(null);

  const onEdit = (userId: ObjectId) => {
    if (!userId) {
      console.error("User ID is undefined or null");
      return;
    }
    const user = list.find((user) => user._id === userId);
    setCurrentUser(user || null);
    setDialogOpen(true);
  };

  const onDelete = (userId: ObjectId) => {
    if (!userId) {
      console.error("User ID is undefined or null");
      return;
    }
    console.log("Delete user with ID:", userId);
  };

  const saveUser = async (user: UserDetails | null) => {
    setCurrentUser(null);
    setDialogOpen(false);
    if (!user) return; // dialog was cancelled

    // No cast: TypeScript checks this object against the contract's schema.
    // `_id` arrives as a string after island serialization; String() makes
    // that explicit and satisfies the `id: string` the schema expects.
    const input: InputOf<typeof updateUser> = {
      id: String(user._id),
      name: user.name,
      email: user.email,
      mobile: user.mobile,
    };

    const result = await fetchApi(updateUser, input);
    if (!result.ok) {
      // Same shape for client-side validation, server errors and network errors.
      console.error(result.error.message, result.error.fields);
      return;
    }

    // result.data is typed as OutputOf<typeof updateUser> = { user: UserProfile }
    const saved = result.data.user;
    setList((prev) =>
      prev.map((u) =>
        String(u._id) === saved.id
          ? { ...u, name: saved.name, email: saved.email, mobile: saved.mobile }
          : u
      )
    );
  };

  return (
    <>
      <ul class="card-grid">
        {list.map((user) => (
          <li>
            <UserCard onEdit={onEdit} onDelete={onDelete} user={user} />
          </li>
        ))}
      </ul>
      <UserDialog
        isOpen={isDialogOpen}
        onClose={saveUser}
        user={currentUser}
      />
    </>
  );
}
