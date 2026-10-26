import type { StorybookConfig } from "@storybook/preact-vite";
import { fileURLToPath } from "node:url";

const config: StorybookConfig = {
  stories: ["../components/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [],
  framework: {
    name: "@storybook/preact-vite",
    options: {
      builder: {
        viteConfigPath: fileURLToPath(
          new URL("./vite.config.ts", import.meta.url),
        ),
      },
    },
  },
  staticDirs: ["../static"],
};

export default config;
