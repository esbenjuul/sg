import type { Meta, StoryObj } from "@storybook/preact-vite";
import { Button } from "./button.tsx";

const meta = {
  title: "Components/Button",
  component: Button,
  args: {
    buttonType: "primary",
    children: "Click me",
    disabled: false,
  },
  argTypes: {
    buttonType: {
      control: "select",
      options: ["primary", "secondary", "tertery"],
    },
    onClick: { action: "clicked" },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    buttonType: "primary",
    children: "Primary",
  },
};

export const Secondary: Story = {
  args: {
    buttonType: "secondary",
    children: "Secondary",
  },
};

export const Tertiary: Story = {
  args: {
    buttonType: "tertery",
    children: "Tertiary",
  },
};

export const Disabled: Story = {
  args: {
    buttonType: "primary",
    children: "Disabled",
    disabled: true,
  },
};
