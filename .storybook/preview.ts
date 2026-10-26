import type { Preview } from "@storybook/preact-vite";

import "../static/style/theme.css";
import "../static/styles.css";
import "../static/header.css";

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
