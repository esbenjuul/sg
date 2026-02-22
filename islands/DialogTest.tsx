import { useState } from "preact/hooks";
import Dialog from "../components/dialog/dialog.tsx";

const DialogTest = () => {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const handleOpenDialog = (e: Event) => {
    console.log(e);
    e.preventDefault();
    setDialogOpen(true);
  };
  return (
    <div>
      <a onClick={(e) => handleOpenDialog(e)} href="">Open Dialog</a>
      <Dialog
        isOpen={isDialogOpen}
        hasCloseBtn={true}
        onClose={() => setDialogOpen(false)}
      >
        <h2>Welcome to Fresh Auth!</h2>
        <p>
          This is a demo authentication system built with Deno Fresh 2 and
          MongoDB. Sign up to explore the dashboard and see how it works!
        </p>
      </Dialog>
    </div>
  );
};

export default DialogTest;
