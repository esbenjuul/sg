import { defineConfig } from "vite";

// Intentionally separate from the app vite.config.ts so Fresh's plugin
// does not run inside Storybook.
export default defineConfig({
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "preact",
  },
  resolve: {
    alias: {
      "@/": new URL("../", import.meta.url).pathname,
    },
  },
});
