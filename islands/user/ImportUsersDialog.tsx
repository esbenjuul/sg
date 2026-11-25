import { useRef, useState } from "preact/hooks";
import Dialog, { type CloseReason } from "@/components/dialog/dialog.tsx";
import { Input } from "@/components/Input/Input.tsx";

export interface ImportUsersDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Uploads a Conventus CSV export. Posts multipart to /users, which imports
 * the users and re-renders the page with the result.
 */
export function ImportUsersDialog({ isOpen, onClose }: ImportUsersDialogProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleClose = (reason: CloseReason) => {
    if (reason === "confirm") {
      // requestSubmit() runs native validation (the required file input).
      formRef.current?.requestSubmit();
      return;
    }
    formRef.current?.reset();
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      hasCloseBtn
      onClose={handleClose}
      title="Import users"
      confirmText={uploading ? "Importing…" : "Import"}
      canClose={!uploading}
    >
      <form
        ref={formRef}
        method="post"
        action="/users"
        encType="multipart/form-data"
        onSubmit={() => setUploading(true)}
      >
        <Input
          id="import-users-file"
          type="file"
          name="file"
          label="CSV file exported from Conventus"
          required
        />
      </form>
    </Dialog>
  );
}
