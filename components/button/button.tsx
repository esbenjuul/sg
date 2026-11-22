import type { ButtonHTMLAttributes } from "preact";
import "./button.css";

export interface ButtonProps extends ButtonHTMLAttributes {
  buttonType: "primary" | "secondary" | "tertery" | "danger";
  loading?: boolean;
}

/**
 * Thin wrapper around the native <button>. All native attributes
 * (id, aria-*, popovertarget, style, …) are forwarded.
 */
export function Button(
  { buttonType, loading, class: className, children, type, ...rest }:
    ButtonProps,
) {
  return (
    <button
      {...rest}
      type={type ?? "button"}
      class={["button", `button-${buttonType}`, className]
        .filter(Boolean)
        .join(" ")}
      aria-busy={loading || undefined}
    >
      <div>{children}</div>
    </button>
  );
}
