import type { Preview } from "@storybook/react";
import "../src/app/globals.css";

// Dark theme only. Tokens load from globals.css.
const preview: Preview = {
  parameters: {
    backgrounds: {
      default: "bg",
      values: [{ name: "bg", value: "#060708" }],
    },
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
  },
};

export default preview;
