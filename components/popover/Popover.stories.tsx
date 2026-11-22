import type { Meta, StoryObj } from "@storybook/preact-vite";
import { Popover, PopoverItem, PopoverList } from "./popover.tsx";
import { BinIcon, DotsIcon, PencilIcon } from "../icons/index.ts";

const meta = {
  title: "Components/Popover",
  component: Popover,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj;

const Links = () => (
  <PopoverList>
    <PopoverItem href="/users">Brugere</PopoverItem>
    <PopoverItem href="/teams">Hold</PopoverItem>
    <PopoverItem href="/design">Design</PopoverItem>
  </PopoverList>
);

export const Default: Story = {
  render: () => (
    <div style={{ padding: "2rem" }}>
      <Popover trigger="Navigation" label="Navigation">
        <Links />
      </Popover>
    </div>
  ),
};

export const IconOnlyTools: Story = {
  render: () => (
    <div style={{ padding: "2rem" }}>
      <Popover
        id="user-actions"
        trigger={<DotsIcon />}
        iconOnly
        label="Flere handlinger"
        align="start"
      >
        <PopoverList>
          <PopoverItem icon={<PencilIcon />} closes="user-actions">
            Rediger
          </PopoverItem>
          <PopoverItem
            icon={<BinIcon />}
            variant="danger"
            closes="user-actions"
          >
            Slet
          </PopoverItem>
        </PopoverList>
      </Popover>
    </div>
  ),
};

export const Top: Story = {
  render: () => (
    <div style={{ padding: "12rem 2rem 2rem" }}>
      <Popover trigger="Åbn over" label="Links" placement="top">
        <Links />
      </Popover>
    </div>
  ),
};

export const AlignEnd: Story = {
  render: () => (
    <div style={{ padding: "2rem", display: "flex", justifyContent: "end" }}>
      <Popover trigger="Højre kant" label="Links" align="end">
        <Links />
      </Popover>
    </div>
  ),
};

export const FlipsNearBottom: Story = {
  render: () => (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "end",
        padding: "1rem 2rem",
        boxSizing: "border-box",
      }}
    >
      <Popover trigger="Plads mangler nedenfor" label="Links">
        <Links />
      </Popover>
    </div>
  ),
};
