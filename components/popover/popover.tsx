import type { ComponentChildren, JSX } from "preact";
import { useId } from "preact/hooks";
import { Button, type ButtonProps } from "../button/button.tsx";
import "./popover.css";

export interface PopoverProps {
  /** Content of the trigger button (text and/or icon). */
  trigger: ComponentChildren;
  /** Accessible name for the popover. Also used for the trigger when `iconOnly`. */
  label: string;
  /** Set when the trigger has no visible text, so `label` names the button. */
  iconOnly?: boolean;
  buttonType?: ButtonProps["buttonType"];
  /** Preferred side. The browser flips automatically when there's no room. */
  placement?: "bottom" | "top";
  /** Align the popover with the start or end edge of the button. */
  align?: "start" | "end";
  /** Optional explicit id (otherwise generated). */
  id?: string;
  class?: string;
  children: ComponentChildren;
}

const supportsAnchor = () =>
  typeof CSS !== "undefined" && CSS.supports("anchor-name: --a");

/**
 * Fallback placement for browsers without CSS anchor positioning.
 * Only runs once hydrated; without JS the popover still opens/closes natively.
 */
function placeWithoutAnchor(
  e: JSX.TargetedEvent<HTMLDivElement, Event>,
) {
  const popover = e.currentTarget;
  if (supportsAnchor() || (e as unknown as ToggleEvent).newState !== "open") {
    return;
  }
  const trigger = document.querySelector<HTMLElement>(
    `[popovertarget="${popover.id}"]`,
  );
  if (!trigger) return;

  const gap = 4;
  const t = trigger.getBoundingClientRect();
  const p = popover.getBoundingClientRect();
  const preferTop = popover.dataset.placement === "top";
  const fitsBelow = t.bottom + gap + p.height <= innerHeight;
  const fitsAbove = t.top - gap - p.height >= 0;
  const top = (preferTop ? fitsAbove || !fitsBelow : !fitsBelow && fitsAbove)
    ? t.top - gap - p.height
    : t.bottom + gap;
  const left = popover.dataset.align === "end" ? t.right - p.width : t.left;

  popover.style.position = "fixed";
  popover.style.top = `${Math.max(0, top)}px`;
  popover.style.left = `${Math.min(Math.max(0, left), innerWidth - p.width)}px`;
}

export function Popover({
  trigger,
  label,
  iconOnly = false,
  buttonType = "secondary",
  placement = "bottom",
  align = "start",
  id: idProp,
  class: className,
  children,
}: PopoverProps) {
  const generated = useId();
  const id = idProp ?? `popover-${generated}`;
  const anchor = `--${id}`;

  return (
    <>
      <Button
        buttonType={buttonType}
        popovertarget={id}
        aria-label={iconOnly ? label : undefined}
        class="popover-trigger"
        style={`anchor-name: ${anchor}`}
      >
        {trigger}
      </Button>
      <div
        id={id}
        popover="auto"
        class={["popover", className].filter(Boolean).join(" ")}
        aria-label={label}
        data-placement={placement}
        data-align={align}
        style={`position-anchor: ${anchor}`}
        onToggle={placeWithoutAnchor}
      >
        {children}
      </div>
    </>
  );
}

export function PopoverList(
  { children, ...rest }: JSX.HTMLAttributes<HTMLUListElement>,
) {
  // role="list" keeps list semantics in Safari when list-style is removed.
  return (
    <ul role="list" class="popover-list" {...rest}>
      {children}
    </ul>
  );
}

type PopoverItemProps =
  & {
    icon?: ComponentChildren;
    variant?: "default" | "danger";
    children: ComponentChildren;
  }
  & (
    | ({ href: string } & JSX.AnchorHTMLAttributes<HTMLAnchorElement>)
    | ({
      href?: undefined;
      /** id of the owning Popover: closes it natively when clicked. */
      closes?: string;
    } & JSX.ButtonHTMLAttributes<HTMLButtonElement>)
  );

export function PopoverItem(props: PopoverItemProps) {
  const { icon, variant = "default", children, ...rest } = props;
  const cls = `popover-item popover-item-${variant}`;
  const content = (
    <>
      {icon && <span class="popover-item-icon" aria-hidden="true">{icon}</span>}
      <span>{children}</span>
    </>
  );

  if (rest.href !== undefined) {
    const anchorProps = rest as JSX.AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <li>
        <a {...anchorProps} class={cls}>{content}</a>
      </li>
    );
  }

  const { closes, ...buttonProps } = rest as
    & { closes?: string }
    & JSX.ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <li>
      <button
        type="button"
        {...buttonProps}
        class={cls}
        popovertarget={closes}
        popovertargetaction={closes ? "hide" : undefined}
      >
        {content}
      </button>
    </li>
  );
}
