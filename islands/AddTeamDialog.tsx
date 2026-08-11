import { useState } from "preact/hooks";
import Dialog from "@/components/dialog/dialog.tsx";
import { Select } from "@/components/select/select.tsx";
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
const category = [
  {value: "piger", caption: "Teamgym piger"},
  {value: "mix", caption: "Mix"},
  {value: "drenge", caption: "Teamgym drenge"}
]
const images = [
  {
    file: 'img/dance.png',
    name: 'Dance'
  },
  {
    file: 'img/dancer.png',
    name: 'Dancer'
  },
  {
    file: 'img/Exsercising.png',
    name: 'Exercising'
  },
  {
    file: 'img/gym.png',
    name: 'Gym'
  },
  {
    file: 'img/gymnast.png',
    name: 'Gymnast'
  },
  {
    file: 'img/gymnastic.png',
    name: 'Gymnastic'
  },
  {
    file: 'img/mailot.png',
    name: 'Mailot'
  },
  {
    file: 'img/vaulting-horse.png',
    name: 'Vaulting horse'
  },
]

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

          <Select options={category} placeholder="Vælg kategori" id="category" name="category">
  
          </Select>
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

          <div class="form-field">
            <label htmlFor="image">Image</label>
            
            
            <select id="image" name="image">
              <option value="">
                No coach selected</option>
              {images.map((img) => (
                <option key={img.name} value={img.file}>
                  s
                  <span>{img.name}</span>
                </option>
              ))}
            </select>
          </div>


          <div class="row row-align-right">
            <Button type="submit" buttonType="primary">Create team</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
