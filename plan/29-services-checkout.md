# Services Checkout (spec)

"Start a master" becomes a real cart-style checkout: configure a fine-grained order, upload tracks, pay on site, and CalebZ is notified. Built on the free Cloudflare stack. This supersedes plan/18 (Payment Links, no backend); that approach moves to embedded Stripe Checkout with a small Worker backend.

## 1. Pricing: per-track, not fixed tiers

The price is computed from track count and add-ons, so EP and Album emerge from honest math. A tech-savvy artist configures their actual release.

| Tracks | Price per track | Reads as |
|--------|-----------------|----------|
| 1 to 2 | $65 | Single |
| 3 to 5 | $58 | EP |
| 6+ | $50 | Album |

Add-ons (cap the visible list at ~5, gate the big one):

| Add-on | Delta |
|--------|-------|
| Stem mastering | +$40 / track |
| Rush, 24 to 48h | +$30 / track |
| Alternate version (instrumental, clean, radio) | +$15 each |
| Extra format (Apple Digital Master, vinyl-ready) | +$20 each |
| Extra revision round (beyond 2) | +$25 / track |
| Dolby Atmos | +$150 / track, quote-gated |

Free in the base, never line-itemed: one WAV plus MP3, two revisions, standard ~3 day turnaround. The one free first master (plan/22) stays the pre-cart trust gate. Failure mode to avoid: over-itemizing into a budget-tool feel that anchors value low and triggers choice overload. Keep inclusions generous and invisible; charge only for real time and expertise.

## 2. The flow (one screen each, mobile-first, pay before upload)

1. Start a master. The brand verb opens a focused checkout shell over the dimmed site; audio and motif pause.
2. Pick your package. Per-track price shown live as count changes.
3. Add-ons. Skippable toggle chips with +price.
4. Your tracks. Name and quantity per track (metadata only, no file yet). "Add another track" lives here.
5. Cart. Package, per-track lines, add-on lines, quantity steppers, remove, running total.
6. Checkout. Name, email, and an embedded Stripe payment form on one screen with a sticky total.
7. Confirmation and upload. Payment confirms in place (no redirect); the prep brief and a resumable dropzone appear; upload runs in the background against the paid order.

Around 3 collected fields plus selections, under the Baymard checkout benchmark.

## 3. Upload

- WAV or AIFF, native rate, 24-bit (32-bit float preferred), generous cap (~1 GB per track).
- Resumable multipart to R2 via presigned PUT per part, parallel chunks, backoff, resume from the missing part on reconnect. A lifecycle rule clears orphans.
- Per-file progress and a plain "resumes if your connection drops" line.
- Prep guidance at the dropzone: WAV or AIFF, native rate, peaks around -3 to -6 dBFS, no clipping, no master-bus limiter.

## 4. Payments and backend (Cloudflare + Stripe)

- Stripe embedded Checkout (Checkout Sessions, ui_mode embedded + Payment Element). The customer pays without leaving the site; card data stays in Stripe's iframe (PCI SAQ A).
- A Worker `/api/checkout` re-prices every line from its own catalog (never trust the client total), creates the Session with `metadata.order_id`, and returns only the client secret. Secret key in a Worker binding.
- Upload-to-R2 presigned PUT minted by a Worker; bytes never cross the Worker. Key is derived from the order id (`orders/{id}/source.wav`).
- Pay first, then upload. The order is `pending` with the Session; the paid webhook flips it to `paid`; the success page reveals the upload.

## 5. Order record and notification (D1 + Resend)

- D1 `orders` (id, email, name, items_json, amount_cents, status, stripe_session_id, source_key, delivery_token, timestamps) and `processed_events` (event_id) for idempotency.
- Lifecycle: pending, paid, in progress, delivered (via the private `/t/[token]` share, plan/09).
- The Stripe webhook is verified in the Worker (createSubtleCryptoProvider + constructEventAsync, raw body). On `checkout.session.completed` the Worker emails CalebZ via Resend with the order summary and the track link. Idempotency: insert `event.id` into `processed_events` in the same transaction as the order update.

## 6. The rules that keep it safe and free

- Never trust the client cart total. The Worker recomputes every amount server-side; price lives in the Stripe Session, not the request. This defeats amount tampering.
- Validate file type and size server-side; verify the webhook signature; no secrets in the client.
- Stays free: Pages, Workers (100k req/day), D1 (5 GB), R2 (10 GB, zero egress) all free at this volume. Only cost is Stripe 2.9% + 30c per transaction and R2 storage past 10 GB.

## 7. Failure modes

| Case | Handling |
|------|----------|
| Paid but upload fails | Order stays paid/awaiting-upload; success page and emailed link retry the PUT to the same key |
| Abandoned cart | Pay-first means no paid row and no stored file; optionally reap stale pending |
| Webhook retry | event.id dedup in one D1 transaction; return 2xx within 10s |
| Legal (plan/19) | Privacy must state order-data collection, retention, deletion; Terms cover scope, revisions, refunds |

## New surfaces to build

Worker routes `/api/checkout`, `/api/stripe-webhook`, `/api/upload-url`; D1 `orders` and `processed_events`; Stripe secret and webhook-secret bindings; the checkout UI (steps above). plan/18 and plan/03 update from "Payment Links, no backend" to this.
