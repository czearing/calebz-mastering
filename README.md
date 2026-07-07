# CalebZ Mastering

Portfolio and booking site. Next.js 15 App Router, TypeScript strict, Tailwind v4.
Dark theme only. Hosted on Cloudflare Pages.

## Scripts

| Script | What it does |
|--------|--------------|
| `npm run dev` | Start the dev server on port 3000 |
| `npm run build` | Production build with `next build` |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint, next core-web-vitals and typescript rules |
| `npm run format` | Prettier write |
| `npm run test` | Vitest unit and component tests |
| `npm run test:e2e` | Playwright end to end tests |
| `npm run storybook` | Storybook dev on port 6006 |
| `npm run build-storybook` | Static Storybook build |
| `npm run pages:build` | Cloudflare Pages build via next-on-pages |

## Structure

- `src/app` routes, App Router
- `src/components/{ui,sections,three,audio}` components, one per file
- `src/content` typed copy and data, no strings in JSX
- `src/lib` tokens, helpers
- `src/styles` shared style assets

## Tokens

All design tokens live in `src/app/globals.css` as CSS variables and are exposed
to Tailwind through `@theme`. A typed mirror for non-CSS consumers is in
`src/lib/tokens.ts`. Never hardcode hex or px in components.

## Component pattern

Each component is one file under 200 lines with a colocated story and test.
See `src/components/ui/Button.tsx`, `Button.stories.tsx`, `Button.test.tsx`
for the reference pattern every later component follows.

## Feature flags (flights)

Parts of the site ship behind flags in `src/lib/flags.ts`, read from
`NEXT_PUBLIC_` env vars and inlined at build time. Both default **off** so a
plain `npm run build` publishes the launch-safe site: inquiries come in by email
instead of on-site checkout, and the testimonials grid stays hidden until real
quotes exist.

| Env var | Default | When on |
|---------|---------|---------|
| `NEXT_PUBLIC_FLAG_COMMERCE` | off | Live order console, cart, and `/start` checkout. When off, Services shows a direct email contact block and `/start` redirects home. |
| `NEXT_PUBLIC_FLAG_TESTIMONIALS` | off | The "What artists say" section. |

Accepted truthy values: `1`, `true`, `on`, `yes` (case-insensitive). Set them in
a local `.env.local` (gitignored) or in your host's environment:

```
NEXT_PUBLIC_FLAG_COMMERCE=on
NEXT_PUBLIC_FLAG_TESTIMONIALS=on
```

The launch contact address lives in `src/content/site.ts`.
