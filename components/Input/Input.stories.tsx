import type { Meta, StoryObj } from "@storybook/preact-vite";
import { Input } from "./Input.tsx";

const meta = {
  title: "Components/Input",
  component: Input,
  args: {
    id: "example",
    name: "example",
    label: "Label",
    type: "text",
    placeholder: "Type something…",
    required: false,
  },
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "number"],
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Email: Story = {
  args: {
    id: "email",
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "you@example.com",
    required: true,
  },
};

export const Password: Story = {
  args: {
    id: "password",
    name: "password",
    label: "Password",
    type: "password",
    placeholder: "••••••••",
    minLength: 8,
    required: true,
  },
};

export const Required: Story = {
  args: {
    id: "required",
    name: "required",
    label: "Required field",
    required: true,
  },
};
