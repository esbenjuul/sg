import type { Meta, StoryObj } from "@storybook/preact-vite";
import { Select } from "./select.tsx";

const meta = {
  title: "Components/Select",
  component: Select,
  args: {
    id: "role",
    name: "role",
    label: "Role",
    required: false,
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Required: Story = {
  args: {
    id: "team",
    name: "team",
    label: "Select a team",
    required: true,
  },
};
