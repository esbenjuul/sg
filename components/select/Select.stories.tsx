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
    placeholder: "Choose a role",
    options: [
      { value: "admin", label: "Admin" },
      { value: "trainer", label: "Trainer" },
      { value: "member", label: "Member" },
    ],
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
    options: [
      { value: "u10", label: "Ungdomsgymnastik U10" },
      { value: "mix", label: "Teamgym mix" },
    ],
  },
};

export const WithError: Story = {
  args: { error: "Choose a role" },
};
