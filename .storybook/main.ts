import type { StorybookConfig } from "@storybook/experimental-nextjs-vite";
import { fileURLToPath } from "node:url";

// Storybook 8 with the Vite-based Next.js framework. Vite avoids the webpack
// instance conflict between @storybook/nextjs and Next 15's bundled webpack.
// Stories live next to components as <Name>.stories.tsx. a11y addon runs axe.
const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-essentials", "@storybook/addon-a11y"],
  framework: {
    name: "@storybook/experimental-nextjs-vite",
    options: {},
  },
  staticDirs: ["../public"],
  // The tsconfig "@/*" path alias is honored for static imports but not for
  // dynamic import() in the Rollup production build. Register it explicitly so
  // code-split modules (the motif, the audio player) resolve when stories that
  // render them are bundled.
  viteFinal: async (cfg) => {
    cfg.resolve = cfg.resolve ?? {};
    cfg.resolve.alias = {
      ...(cfg.resolve.alias as Record<string, string> | undefined),
      "@": fileURLToPath(new URL("../src", import.meta.url)),
    };
    return cfg;
  },
};

export default config;
