import "./breadcrumb.css";
export type Crumb = {
  label: string;
  href?: string;
};

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Oversigt",
  teams: "Hold",
  users: "Instruktører",
  "create-user": "Opret bruger",
};

function humanizeSegment(segment: string): string {
  return segment
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function labelForSegment(segment: string): string {
  return SEGMENT_LABELS[segment] ?? humanizeSegment(segment);
}

/** Builds breadcrumb items from a pathname. Returns [] when depth is below level2. */
export function buildBreadcrumbs(pathname: string): Crumb[] {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length < 2) {
    return [];
  }

  return segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const isLast = index === segments.length - 1;
    return {
      label: labelForSegment(segment),
      ...(isLast ? {} : { href }),
    };
  });
}

export interface BreadcrumbProps {
  items: Crumb[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  if (items.length < 2) {
    return null;
  }

  return (
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <ol class="breadcrumb-list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li class="breadcrumb-item" key={item.label + (item.href ?? "")}>
              {index > 0 && (
                <span class="breadcrumb-separator" aria-hidden="true">
                  /
                </span>
              )}
              {isLast || !item.href
                ? (
                  <span class="breadcrumb-current" aria-current="page">
                    {item.label}
                  </span>
                )
                : (
                  <a class="breadcrumb-link" href={item.href}>
                    {item.label}
                  </a>
                )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
