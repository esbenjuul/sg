import { useState } from "preact/hooks";
import { Input } from "@/components/Input/Input.tsx";
import { Button } from '@/components/button/button.tsx'
import { PlusIcon } from "@/components/icons/PlusIcon.tsx";
import Dialog from "../components/dialog/dialog.tsx";
import { ImportIcon } from "@/components/icons/ImportIcon.tsx";

const UploadUsers = () => {
  const [isDialogOpen, setDialogOpen] = useState(false);
  return (
    <div>
      <Button buttonType="primary" onClick={() => setDialogOpen(true)}><ImportIcon></ImportIcon><span>Import users</span></Button>
      <Dialog
        isOpen={isDialogOpen}
        hasCloseBtn={true}
        onClose={() => setDialogOpen(false)}
      >
       <form method="post" encType="multipart/form-data">
          <Input type="file" name="file" label="upload csv file from conventus"></Input>
          <button>upload</button>
        </form>

        
      </Dialog>
    </div>
  );
};

export default UploadUsers;
