# Architecture

## Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 15, App Router, RSC | Fast static shell, route handlers for share links |
| Language | TypeScript, strict | Safety, clean contracts |
| Styling | Tailwind v4 + CSS variable tokens | Speed, one token source |
| Motion | Framer Motion + Lenis | Reveal choreography + smooth scroll |
| 3D | React Three Fiber + drei | One shader motif, lazy loaded |
| Forms | React Hook Form + Zod | Typed validation |
| Email | Resend via Worker | Inquiry delivery, no client secrets |
| Audio store | Cloudflare R2 + signed URLs | Stream tracks, zero egress, range requests |
| Data | Cloudflare D1 (SQLite) | Reviews and share metadata |
| Payments | Stripe Payment Links | No backend, no fixed cost |
| Share IDs | nanoid | Unguessable serialized tokens |
| Host | Cloudflare Pages + Workers | Free, commercial use OK, unlimited bandwidth |

Host is Cloudflare, not Vercel: Vercel's free Hobby plan forbids commercial use, and this site books paid work. See 17-infrastructure for the full free-tier rationale. D1 holds two small tables (reviews, shares); everything fits the free tier at portfolio scale.

## Folder structure

```
src/
  app/
    (site)/page.tsx          home, composed of sections
    t/[token]/page.tsx       shared track page
    api/inquiry/route.ts     contact submit
    api/audio/[token]/route.ts  streamed audio
  components/
    sections/                one file per section
    ui/                      button, field, marquee, etc
    three/                   canvas + shader motif
    audio/                   player, waveform, transport
  lib/                       tokens, schema, format, share
  content/                   copy and data as typed objects
  styles/
```

## Abstraction rules

- One component per file. Under 200 lines. Split when it grows.
- Sections are dumb. They read from `content/`, render, animate.
- All copy and data live in `content/`. No hardcoded strings in JSX.
- All tokens live in `lib/tokens` and `styles`. No magic hex or px.
- 3D and audio are dynamic imports. Never in the first bundle.
- Server components by default. `"use client"` only where motion or state needs it.

## Data flow

Home is static. Inquiry posts to a server action that calls Resend. Share page is server-rendered from token, audio streams from a route handler that signs a short-lived URL.
