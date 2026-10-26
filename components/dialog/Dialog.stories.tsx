import type { Meta, StoryObj } from "@storybook/preact-vite";
import { useState } from "preact/hooks";
import Dialog from "./dialog.tsx";
import { Button } from "../button/button.tsx";

const meta = {
  title: "Components/Dialog",
  component: Dialog,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

function DialogDemo(
  { initiallyOpen = false, hasCloseBtn = true }: {
    initiallyOpen?: boolean;
    hasCloseBtn?: boolean;
  },
) {
  const [isOpen, setIsOpen] = useState(initiallyOpen);

  return (
    <div style={{ padding: "2rem" }}>
      <Button buttonType="primary" onClick={() => setIsOpen(true)}>
        Open dialog
      </Button>
      <Dialog
        isOpen={isOpen}
        hasCloseBtn={hasCloseBtn}
        onClose={() => setIsOpen(false)}
      >
        <h2>Add team</h2>
        <p>Create a new team and invite instructors.</p>
        <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem" }}>
          <Button buttonType="primary" onClick={() => setIsOpen(false)}>
            Save
          </Button>
          <Button buttonType="secondary" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

export const Default: Story = {
  render: () => <DialogDemo />,
};

export const Open: Story = {
  render: () => <DialogDemo initiallyOpen />,
};

export const WithoutCloseButton: Story = {
  render: () => <DialogDemo initiallyOpen hasCloseBtn={false} />,
};
