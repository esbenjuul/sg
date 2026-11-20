import "./tag.css";
export function Tag({ children }: { children: string }) {
  return (
    <mark class="tag">
      {children}
    </mark>
  );
}
