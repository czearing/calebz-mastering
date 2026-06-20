# Post-build checklist (CalebZ)

What is built: a Next.js site on Cloudflare with a dark theme, the A/B "hear the difference" hero, the scroll-driven motif, all sections, Storybook, tests, and Playwright. Everything below is what only you can finish. No code knowledge needed beyond editing the listed files and running a few commands.

## 1. Replace placeholder content
All marked with `TODO` in `src/content/`.

| File | Replace |
|------|---------|
| `work.ts` | The 4 track titles, artists, genres |
| `services.ts` | Real prices (now `$X`) and turnaround days |
| `reviews.ts` | Real reviews (name, project, quote). Keep only genuine ones |
| `footer.ts` | Email, Instagram link, year. YouTube is already correct |
| `hero.ts` | Founder note is final. Confirm it sounds like you |

## 2. Add your real audio
The demo points every track at two placeholder tones.

1. Export web previews (MP3 or Opus) of each track, before and after mastering.
2. Drop them in `public/audio/` (for example `track-1-before.mp3`, `track-1-after.mp3`).
3. In `src/content/audio.ts` set each track's `before`/`after` paths, and the real `lufs` and `truePeak` numbers (these power the sound-off proof).
4. Optional: bake the per-track waveform `peaks` so the waveform matches the audio.

## 3. The signature track (optional, advanced)
The scroll morph uses a placeholder terrain. To make it your real song, bake a before and after analysis texture from one track and replace `generateTerrain` in `src/components/three/terrainData.ts`. The site is complete without this.

## 4. Checkout and payment (Stripe embedded + R2 + D1 + Resend)
"Start a master" (`/start`) is a full cart-style checkout: per-track pricing, add-ons, pay on site, then upload. It is built and tested. Until the keys below are set it runs in a safe holding state: the flow works, the pay step shows "Checkout activates once payment is connected," and no charge or upload happens. Setting the keys turns on live payments with no code change.

The one safety rule, already enforced in code: the server recomputes every price from its own catalog, so a tampered client total cannot change what is charged. Do not weaken that.

### 4a. Set these env vars (Cloudflare Pages, Settings > Environment variables / bindings)
| Var | What it is |
|-----|------------|
| `STRIPE_SECRET_KEY` | Stripe secret, `sk_live_...` (or `sk_test_...` to rehearse) |
| `STRIPE_WEBHOOK_SECRET` | Signing secret of the webhook you add in 4c, `whsec_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key, `pk_live_...`. Safe in the client |
| `R2_ACCOUNT_ID` | Your Cloudflare account id (the R2 S3 endpoint host) |
| `R2_BUCKET` | R2 bucket name for source uploads (create it first) |
| `R2_ACCESS_KEY_ID` | R2 S3 API token access key id |
| `R2_SECRET_ACCESS_KEY` | R2 S3 API token secret |
| `RESEND_API_KEY` | Resend key, for the paid-order email to you |
| `ORDER_FROM_EMAIL` | Verified Resend sender, e.g. `orders@yourdomain.com` |
| `ORDER_NOTIFY_EMAIL` | Where you want order notifications to land |
| `SITE_URL` | Your live origin, e.g. `https://yourdomain.com` (builds the return URL) |

`DB` is a binding, not a typed value: add a D1 database binding named `DB` (4b).

### 4b. Create the database and tables
1. Create a D1 database, and bind it to Pages as `DB`.
2. Create the tables once:
   `npx wrangler d1 execute <your-db-name> --file src/lib/checkout/schema.sql`
   (add `--remote` to run it against the deployed database, not a local copy).

### 4c. Connect the Stripe webhook
1. In Stripe > Developers > Webhooks, add an endpoint at `https://yourdomain.com/api/stripe-webhook`.
2. Subscribe it to `checkout.session.completed`.
3. Copy its signing secret into `STRIPE_WEBHOOK_SECRET` (4a).
This is what flips an order to paid, emails you, and unlocks the upload. Retries are de-duplicated, so a double-fire never double-charges or double-emails.

### 4d. Rehearse before going live
Use the Stripe test keys, run a `4242 4242 4242 4242` test order end to end, and confirm: you receive the notification email, the order shows paid, and the dropzone accepts a WAV. Then swap the test keys for live keys.

Pricing lives in `src/lib/checkout/catalog.ts` (per-track rates and add-on deltas). Change numbers there; the cart, totals, and Stripe amount all follow automatically.

## 5. Email delivery (Resend)
Inquiries validate and confirm but do not send yet.

1. `npm i resend`
2. Add `RESEND_API_KEY` to the Cloudflare environment. Never commit it.
3. In `src/app/actions/inquiry.ts` replace the TODO block with the documented `resend.emails.send(...)` call (from address on your domain, reply-to the inquirer).

## 6. Accounts to create
- Cloudflare (Pages for hosting, R2 for shared audio and checkout uploads, D1 for orders, reviews, and share links).
- A domain, pointed at Cloudflare.
- Resend (email and order notifications).
- Stripe (on-site embedded checkout).

## 7. Deploy to Cloudflare
1. `npm run pages:build` (the next-on-pages build).
2. Connect the repo to Cloudflare Pages, or deploy with Wrangler.
3. Set env vars in Pages: `RESEND_API_KEY`, and an admin passcode for `/admin/reviews`.
4. Create an R2 bucket for shared track audio and a D1 database for `reviews` and `shares`.

## 8. Reviews and legal
- Reviews submitted at `/reviews/new` stay hidden until approved at `/admin/reviews`. Only show genuine ones (FTC rule, see `plan/19`).
- Fill in `/privacy` and `/terms`.
- Get artist permission before featuring any track publicly.

## Everyday commands
- `npm run dev` local site
- `npm run storybook` component workshop
- `npm test` unit and component tests
- `npm run test:e2e` Playwright
- `npm run build` production build

Full rationale for every choice lives in `plan/`.
