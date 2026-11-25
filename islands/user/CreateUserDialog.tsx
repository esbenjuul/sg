import { useRef, useState } from "preact/hooks";
import { fetchApi, formToObject } from "@/api/client.ts";
import type { ApiErrorBody, InputOf } from "@/api/contract.ts";
import { createUser, type UserProfile } from "@/api/contracts/user.ts";
import Dialog, { type CloseReason } from "@/components/dialog/dialog.tsx";
import { Input } from "@/components/Input/Input.tsx";

export interface CreateUserDialogProps {
  isOpen: boolean;
  /** Called with the created user, or null when cancelled. */
  onClose: (user: UserProfile | null) => void;
}

export function CreateUserDialog({ isOpen, onClose }: CreateUserDialogProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<ApiErrorBody["error"] | null>(null);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    formRef.current?.reset();
    setError(null);
    setSaving(false);
  };

  const submit = async (e?: Event) => {
    e?.preventDefault();
    if (!formRef.current || saving) return;
    setError(null);
    setSaving(true);

    // Name/email/password rules come from the contract: checked here first,
    // then again on the server.
    const res = await fetchApi(
      createUser,
      formToObject(formRef.current) as InputOf<typeof createUser>,
    );
    if (!res.ok) {
      setError(res.error);
      setSaving(false);
      return;
    }
    reset();
    onClose(res.data.user);
  };

  const handleClose = (reason: CloseReason) => {
    if (reason === "confirm") {
      submit();
      return;
    }
    reset();
    onClose(null);
  };

  const field = (name: string) => error?.fields?.[name]?.[0];

  return (
    <Dialog
      isOpen={isOpen}
      hasCloseBtn
      onClose={handleClose}
      title="Create user"
      confirmText={saving ? "Creating…" : "Create user"}
      canClose={!saving}
    >
      <form ref={formRef} onSubmit={submit} noValidate class="form-group">
        {error && !error.fields && (
          <div class="error-message">{error.message}</div>
        )}
        <Input
          id="create-user-name"
          type="text"
          name="name"
          label="Name"
          required
          placeholder="Full name"
          error={field("name")}
        />
        <Input
          id="create-user-email"
          type="email"
          name="email"
          label="Email"
          required
          placeholder="you@example.com"
          error={field("email")}
        />
        <Input
          id="create-user-password"
          type="password"
          name="password"
          label="Password"
          required
          minLength={6}
          placeholder="Set an initial password"
          error={field("password")}
        />
        <Input
          id="create-user-mobile"
          type="tel"
          name="mobile"
          label="Mobile (optional)"
          placeholder="+4512345678"
          error={field("mobile")}
        />
        <Input
          id="create-user-birthday"
          type="date"
          name="birthday"
          label="Birthday (optional)"
          error={field("birthday")}
        />
        {/* Lets Enter submit the form; the dialog footer has the visible button. */}
        <button type="submit" hidden />
      </form>
    </Dialog>
  );
}
