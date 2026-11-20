import type { Preview } from "@storybook/preact-vite";

import "../assets/style/theme.css";
import "../assets/styles.css";
import "../assets/header.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: "centered",
  },
};

export default preview;
