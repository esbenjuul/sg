import type { ComponentChildren } from "preact";
import "./tag.css";

export type TagTone = "info" | "success" | "warning" | "danger";

export interface TagProps {
  children: ComponentChildren;
  /** Soft tinted chip (subtle background, colored text) instead of solid. */
  tone?: TagTone;
}

export function Tag({ children, tone }: TagProps) {
  return (
    <mark class={tone ? `tag tag-soft tag-${tone}` : "tag"}>
      {children}
    </mark>
  );
}
