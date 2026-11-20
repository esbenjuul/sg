import { useEffect, useState } from "preact/hooks";
import { MoonIcon, SunIcon } from "../components/icons/index.ts";

const STORAGE_KEY = "theme";

type Theme = "light" | "dark";

function readTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem(STORAGE_KEY, theme);
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setTheme(readTheme());
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    setTheme(next);
  };

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      class="theme-toggle nav-link"
      onClick={toggle}
      aria-label={isDark ? "Skift til lyst tema" : "Skift til mørkt tema"}
      title={isDark ? "Lyst tema" : "Mørkt tema"}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
      <span class="theme-toggle-label">{isDark ? "Lys" : "Mørk"}</span>
    </button>
  );
}
