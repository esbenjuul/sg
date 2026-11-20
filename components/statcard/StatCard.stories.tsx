import type { Meta, StoryObj } from "@storybook/preact-vite";
import { StatCard } from "./StatCard.tsx";
import { UsersIcon } from "../icons/UsersIcon.tsx";
import { LocationIcon } from "../icons/LocationIcon.tsx";
import { OverviewIcon } from "../icons/OverviewIcon.tsx";

const meta = {
  title: "Components/StatCard",
  component: StatCard,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof StatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ActiveTeams: Story = {
  render: () => (
    <StatCard
      trumpet="Aktive hold"
      value="12"
      manchet="1 under oprettelse"
      color="--color-system-success"
      icon={<UsersIcon />}
    />
  ),
};

export const QuickStats: Story = {
  render: () => (
    <StatCard
      trumpet="Quick Stats"
      value="8"
      manchet="Your dashboard statistics will appear here."
      color="--color-brand-red"
      icon={<UsersIcon />}
    />
  ),
};

export const Locations: Story = {
  render: () => (
    <StatCard
      trumpet="Lokationer"
      value="4"
      manchet="Haller og træningssteder"
      color="--color-brand-blue"
      icon={<LocationIcon />}
    />
  ),
};

export const Overview: Story = {
  render: () => (
    <StatCard
      trumpet="Aktiviteter"
      value="24"
      manchet="Denne uge"
      color="--color-brand-blue-300"
      icon={<OverviewIcon />}
    />
  ),
};
