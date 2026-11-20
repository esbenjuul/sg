import { useEffect, useState } from "preact/hooks";
import Dialog from "@/components/dialog/dialog.tsx";
import { Input } from "@/components/Input/Input.tsx";
import { UserDetails } from "../../models/user/types.ts";
import { Avatar } from "../../components/avatar/avatar.tsx";
import type { CloseReason } from "../../components/dialog/dialog.tsx";
export interface UserDialogProps {
  isOpen: boolean;
  onClose: (user: UserDetails | null) => void;
  user?: UserDetails | null;
  title?: string;
}

export function UserDialog(
  { isOpen, onClose, user }: UserDialogProps,
) {
  const [userName, setUserName] = useState(user?.name || "");
  const [userEmail, setUserEmail] = useState(user?.email || "");
  const [userMobile, setUserMobile] = useState(user?.mobile || "");
  useEffect(() => {
    setUserName(user?.name || "");
    setUserEmail(user?.email || "");
    setUserMobile(user?.mobile || "");
  }, [user]);

  const close = (reason: CloseReason) => {
    if (reason === "cancel") {
      onClose(null);
      return;
    }
    onClose({
      ...user,
      name: userName,
      email: userEmail,
      mobile: userMobile,
    } as UserDetails);
  };
  return (
    <Dialog
      isOpen={isOpen}
      hasCloseBtn={true}
      onClose={close}
      title={user ? "Edit User" : "Create User"}
      confirmText="Save"
    >
      <div class="form-group">
        <Avatar name={user?.name || ""} />
        <Input
          id="name"
          type="text"
          name="name"
          label="User Name"
          required
          placeholder="Junior team"
          value={userName}
          onChange={(e) => setUserName((e.target as HTMLInputElement).value)}
        />
        <Input
          id="email"
          type="email"
          name="email"
          label="User Email"
          required
          placeholder="john.doe@example.com"
          value={userEmail}
          onChange={(e) => setUserEmail((e.target as HTMLInputElement).value)}
        />
        <Input
          id="mobile"
          type="tel"
          name="mobile"
          label="User Phone"
          placeholder="12 34 56 78"
          value={userMobile}
          onChange={(e) => setUserMobile((e.target as HTMLInputElement).value)}
        />
      </div>
    </Dialog>
  );
}
