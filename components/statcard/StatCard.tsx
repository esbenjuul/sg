import { JSX } from "preact/compat/jsx-dev-runtime";
import "./statcard.css";
export function StatCard(
  { icon, trumpet, value, color, manchet }: {
    trumpet: string;
    manchet: string;
    value: string;
    color: string;
    icon: JSX.Element;
  },
) {
  const cssStyle = { "--statcard-icon-bg": `var(${color})` };
  return (
    <article class="stat-card" style={cssStyle}>
      <div class="stat-card-icon">{icon}</div>
      <div class="stat-card-content">
        <h3>{trumpet}</h3>
        <span>{value}</span>
        <p>{manchet}</p>
      </div>
    </article>
  );
}
