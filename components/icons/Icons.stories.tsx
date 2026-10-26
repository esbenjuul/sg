import type { Meta, StoryObj } from "@storybook/preact-vite";
import { ArrowLeftIcon } from "./ArrowLeftIcon.tsx";
import { CloseIcon } from "./CloseIcon.tsx";
import { DotsIcon } from "./DotsIcon.tsx";
import { ImportIcon } from "./ImportIcon.tsx";
import { LocationIcon } from "./LocationIcon.tsx";
import { LogoIcon } from "./LogoIcon.tsx";
import LogoutIcon from "./LogoutIcon.tsx";
import { OverviewIcon } from "./OverviewIcon.tsx";
import { PencilIcon } from "./PencilIcon.tsx";
import { PlusIcon } from "./PlusIcon.tsx";
import { TutorIcon } from "./TutorIcon.tsx";
import { UsersIcon } from "./UsersIcon.tsx";

const icons = [
  { name: "ArrowLeft", Icon: ArrowLeftIcon },
  { name: "Close", Icon: CloseIcon },
  { name: "Dots", Icon: DotsIcon },
  { name: "Import", Icon: ImportIcon },
  { name: "Location", Icon: LocationIcon },
  { name: "Logo", Icon: LogoIcon },
  { name: "Logout", Icon: LogoutIcon },
  { name: "Overview", Icon: OverviewIcon },
  { name: "Pencil", Icon: PencilIcon },
  { name: "Plus", Icon: PlusIcon },
  { name: "Tutor", Icon: TutorIcon },
  { name: "Users", Icon: UsersIcon },
] as const;

const meta = {
  title: "Components/Icons",
  parameters: {
    layout: "padded",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Gallery: Story = {
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
        gap: "1.5rem",
        padding: "1rem",
        color: "var(--text-primary)",
      }}
    >
      {icons.map(({ name, Icon }) => (
        <div
          key={name}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.75rem",
            padding: "1rem",
            border: "1px solid var(--border)",
            borderRadius: "0.5rem",
            background: "var(--bg-card)",
          }}
        >
          <div style={{ width: name === "Logo" ? "64px" : "32px", height: name === "Logo" ? "64px" : "32px" }}>
            <Icon />
          </div>
          <span style={{ fontSize: "0.875rem" }}>{name}</span>
        </div>
      ))}
    </div>
  ),
};

export const InButton: Story = {
  render: () => (
    <button class="button button-primary" type="button">
      <div>
        <PlusIcon />
        <span>Add team</span>
      </div>
    </button>
  ),
};
