import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "storybook-static/**",
      ".vercel/**",
      "playwright-report/**",
      "test-results/**",
      "next-env.d.ts",
      // Non-shipping asset-review scratch (portrait grading script, alternates).
      // Not part of the linted app surface; see plan/25.
      "_review/**",
      // Non-shipping persona usability walkthrough scratch (Playwright probe
      // scripts and screenshots). Not part of the linted app surface.
      ".review-run/**",
      // Non-shipping Playwright probe scripts used to verify the live site.
      "scripts/**",
    ],
  },
];

export default eslintConfig;
