# Roadmap

Phased build. Each phase ships something testable. No phase breaks the perf budget. Every phase is built in tested slices per 20-dev-and-testing: failing test, code, real-browser check with Playwright, then commit.

## Phase 0 — Foundation

- Next.js, TypeScript, Tailwind v4, token system.
- Cloudflare Pages, Workers, R2, D1 set up (see 17-infrastructure).
- Layout, header, footer, Section and Reveal primitives.
- Content files scaffolded with real copy from 08-content.

Exit: static shell deploys to Cloudflare, scores 100 on Lighthouse with no JS heavy work yet.

## Phase 1 — Content sections

- Hero, Services, Process, Testimonials, Footer.
- Motion choreography with Framer Motion.
- Lenis smooth scroll with mobile guard.

Exit: full page reads top to bottom, copy final, motion tuned.

## Phase 2 — The signature: A/B in the hero

- Player, ABPlayer, Waveform, useAudio.
- A/B before and after is the hero, not buried in Work (see 23-signature).
- Founder story under the hero (22-trust).
- Work section reuses the per-track A/B, level matched.
- Streaming from R2 with range support.

Exit: a first-time visitor hears a raw mix become a master in the hero, gapless, audio split from main bundle.

## Phase 3 — The masterwork morph

- MotifCanvas and shader, fed by precomputed track-analysis data textures (05).
- Scroll-scrubbed A/B morph: waveform, type axis, color grade, and terrain move before to after together (23).
- Variable display font wired to the master state (04).
- Guards: precomputed textures, DPR cap, off-screen pause, reduced motion, static fallback.

Exit: scrolling visibly heals one track rough to release; page still passes budget and tells its story with the canvas disabled.

## Phase 4 — Booking

- Contact form, Zod schema, server action, Resend.
- Honeypot and rate limit.
- Optional Cal.com embed if wanted.

Exit: inquiries arrive in CalebZ inbox, confirmation in place.

## Phase 5 — Track sharing

- `/t/[token]` server page, nanoid tokens, share config in D1.
- Signed R2 audio, expiry, password, download toggle.

Exit: a private link opens cold and plays in under one second.

## Phase 6 — Reviews and payments

- Seeded reviews from content, then D1-backed submissions (16-reviews).
- Review form, moderation page, FTC-compliant display.
- Stripe Payment Links wired to service tiers (18-payments).

Exit: a real review can be submitted, approved, and shown. A tier can be paid.

## Phase 7 — Legal

- Privacy, Terms published and linked (19-legal-compliance).
- Artist permission on every featured track.
- Cookieless or consented analytics.

Exit: compliance checklist in 19 is green.

## Phase 7.5 — Trust and growth wiring

- Risk-reversal line by the booking action (22-trust).
- Free-first-master offer, framed as proof (21, 22).
- YouTube routing: pinned links, end screens, site echoes recent videos (21).
- Share/delivery page carries "mastered by CalebZ" and a book link (21).
- Per-page meta, Open Graph cards, service and person schema (21).

Exit: every channel points to the site, every delivery points back.

## Phase 8 — Polish, test, verify

- Hover and focus states on everything.
- Full a11y and contrast audit (see 13-accessibility).
- UX test rounds: 5 producers, 5 mobile-only, 1 screen-reader (see 15-ux-testing).
- Real device testing, portrait and landscape.
- Lighthouse 95 plus on a11y and performance.

Exit: meets the pass bar in 15-ux-testing. Ready to attract clients.

## Open items for CalebZ

- Final prices and turnaround per tier.
- Real testimonials with names, or wait for submissions.
- Selected tracks with before and after files, plus artist permission.
- Accounts: domain, Cloudflare, Resend, Stripe.
- Stripe Payment Link per service tier.
