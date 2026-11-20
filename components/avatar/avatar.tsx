import "./avatar.css";

export interface AvatarProps {
  name: string;
  manchet?: string;
}

export function Avatar({ name, manchet }: AvatarProps) {
  let initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  if (initials.length > 2) {
    initials = `${initials.slice(0, 1)}${initials.slice(-1)}`;
  }

  return (
    <div className={manchet ? "avatar" : "avatar avatar-one-line"}>
      <span>{initials}</span>
      <div class="avatar-text">
        <span class="avatar-name">{name}</span>
        {manchet && <span class="avatar-manchet">[{manchet}]</span>}
      </div>
    </div>
  );
}
