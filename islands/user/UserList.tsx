import { useState } from "preact/hooks";
import Dialog from "@/components/dialog/dialog.tsx";
import { Select } from "@/components/select/select.tsx";
import { UserCard } from "@/components/usercard/UserCard.tsx";
import { UserDetails } from "@/models/user/types.ts";
import { UserDialog } from "./UserDialog.tsx";
import { ObjectId } from "mongodb";

export function UserList({ users }: { users: UserDetails[] }) {
  const onEdit = (userId: ObjectId) => {
    if (!userId) {
      console.error("User ID is undefined or null");
      return;
    }
    const user = users.find((user) => user._id === userId);
    setCurrentUser(user || null);
    setDialogOpen(true);
    console.log("Edit user with ID:", userId);
  };
  const onDelete = (userId: ObjectId) => {
    if (!userId) {
      console.error("User ID is undefined or null");
      return;
    }
    console.log("Delete user with ID:", userId);
  };
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserDetails | null>(null);
  const updateUser = async (user: UserDetails | null) => {
    setCurrentUser(null);
    if (user) {
      console.log("User updated:", user);
      // Here you would typically send the updated user data to your backend or update your state
    } else {
      console.log("User dialog closed without saving changes.");
    }
    setDialogOpen(false);
  };
  return (
    <>
      <ul class="card-grid">
        {users?.map((user) => (
          <li>
            <UserCard
              onEdit={onEdit}
              onDelete={onDelete}
              user={user}
            />
          </li>
        ))}
      </ul>
      <UserDialog
        isOpen={isDialogOpen}
        onClose={updateUser}
        user={currentUser}
      />
    </>
  );
}
