import { useState } from "preact/hooks";
import Dialog from "@/components/dialog/dialog.tsx";
import { Button } from "@/components/button/button.tsx";

export default function DesignDialog() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button buttonType="primary" type="button" onClick={() => setIsOpen(true)}>
        Open dialog
      </Button>
      <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <h3>Dialog title</h3>
        <p>Dialog content goes here.</p>
      </Dialog>
    </>
  );
}
