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
    // The React Compiler pairs with eslint-plugin-react-hooks v7. Rule stances:
    //  - refs: ERROR. Accessing a ref's value during render is a real bug the
    //    compiler cannot fix; hooks return a bare ref (see useTilt) so this
    //    never trips on correct code.
    //  - set-state-in-effect: OFF. It flags SSR-mandatory client-only mount
    //    effects this app relies on — hydration gates (mounted=true),
    //    localStorage rehydration, and matchMedia/WebGL feature detection —
    //    which cannot run during SSR render and so must live in an effect.
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/refs": "error",

      // Manual memoization is BANNED — the React Compiler auto-memoizes every
      // component and hook at build time, so useMemo/useCallback/memo are pure
      // overhead and noise. These rules fail the build if any reappear, keeping
      // the repo compiler-native. (Verify the compiler still covers everything
      // with `npx react-compiler-healthcheck`.)
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "react",
              importNames: ["useMemo", "useCallback", "memo"],
              message:
                "Manual memoization is banned: the React Compiler memoizes automatically. Delete the useMemo/useCallback/memo and let the compiler handle it.",
            },
          ],
        },
      ],
      // Catch the namespaced forms too: React.useMemo / React.useCallback /
      // React.memo, which the import rule cannot see.
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "MemberExpression[object.name='React'][property.name=/^(useMemo|useCallback|memo)$/]",
          message:
            "Manual memoization is banned: the React Compiler memoizes automatically. Remove React.useMemo/useCallback/memo.",
        },
      ],
    },
  },
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
