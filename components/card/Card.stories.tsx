import type { Meta, StoryObj } from "@storybook/preact-vite";
import Card from "./card.tsx";

const meta = {
  title: "Components/Card",
  component: Card,
  args: {
    title: "Hold",
    text: "Se og administrer dine hold, instruktører og træningstider.",
    img: "/img/gymnast.png",
    href: "#",
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Locations: Story = {
  args: {
    title: "Lokationer",
    text: "Find haller og træningssteder i Svendborg.",
    img: "/img/vaulting-horse.png",
    href: "#",
  },
};

export const Instructors: Story = {
  args: {
    title: "Instruktører",
    text: "Oversigt over aktive instruktører i foreningen.",
    img: "/img/exercising.png",
    href: "#",
  },
};
