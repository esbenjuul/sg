import { useState } from "preact/hooks";
import Dialog from "@/components/dialog/dialog.tsx";
import { Button } from "@/components/button/button.tsx";
import { Input } from "@/components/Input/Input.tsx";
import { PlusIcon } from "@/components/icons/PlusIcon.tsx";

export interface TeamUserOption {
  id: string;
  name: string;
  email: string;
}

interface AddTeamDialogProps {
  users: TeamUserOption[];
  defaultCategory: string;
}

export default function AddTeamDialog(
  { users, defaultCategory }: AddTeamDialogProps,
) {
  const [isDialogOpen, setDialogOpen] = useState(false);

  return (
    <div>
      <Button
        buttonType="primary"
        type="button"
        onClick={() => setDialogOpen(true)}
      >
        <PlusIcon />
        <span>Add team</span>
      </Button>
      <Dialog
        isOpen={isDialogOpen}
        hasCloseBtn={true}
        onClose={() => setDialogOpen(false)}
      >
        <h3>Create team</h3>
        <form method="POST">
          <Input
            type="text"
            name="name"
            label="Team name"
            required
            placeholder="Junior team"
          />

          <div class="form-field">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              defaultValue={defaultCategory}
            >
              <option value="piger">Teamgym piger</option>
              <option value="mix">Teamgym mix</option>
              <option value="drenge">Teamgym drenge</option>
            </select>
          </div>

          <div class="form-field">
            <label htmlFor="coachUserId">Coach</label>
            <select id="coachUserId" name="coachUserId" defaultValue="">
              <option value="">No coach selected</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <Input
            type="text"
            name="image"
            label="Image (optional)"
            placeholder="/img/gym.png"
          />

          <div class="row row-align-right">
            <Button type="submit" buttonType="primary">Create team</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
