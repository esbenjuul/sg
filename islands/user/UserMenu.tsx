import { useState } from "preact/hooks";
import {
  DotsIcon,
  ImportIcon,
  PlusIcon,
  Popover,
  PopoverItem,
  PopoverList,
} from "@/components/index.ts";
import { createdUser } from "@/utils/userEvents.ts";
import { CreateUserDialog } from "./CreateUserDialog.tsx";
import { ImportUsersDialog } from "./ImportUsersDialog.tsx";

const MENU_ID = "user-actions";

/** Admin-only: rendered by the page only for admins. */
export function UserMenu() {
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [isImportOpen, setImportOpen] = useState(false);

  return (
    <>
      <Popover
        id={MENU_ID}
        trigger={
          <>
            <span>Add users</span>
            <DotsIcon />
          </>
        }
        label="User actions"
      >
        <PopoverList>
          <PopoverItem
            icon={<PlusIcon />}
            closes={MENU_ID}
            onClick={() => setCreateOpen(true)}
          >
            Create new user
          </PopoverItem>
          <PopoverItem
            icon={<ImportIcon />}
            closes={MENU_ID}
            onClick={() => setImportOpen(true)}
          >
            Import users
          </PopoverItem>
        </PopoverList>
      </Popover>
      <CreateUserDialog
        isOpen={isCreateOpen}
        onClose={(user) => {
          setCreateOpen(false);
          if (user) createdUser.value = user;
        }}
      />
      <ImportUsersDialog
        isOpen={isImportOpen}
        onClose={() => setImportOpen(false)}
      />
    </>
  );
}
