# Payments

Keep it simple, keep fixed cost at zero. No subscription, no payment infrastructure to maintain.

## Method

Stripe Payment Links.

- No monthly fee. Pay only on a sale.
- 2.9% + 30 cents per card charge.
- No code. Each service tier is a link made in the Stripe dashboard.
- Hosted by Stripe, so no card data ever touches the site.

## How it connects

| Step | What happens |
|------|--------------|
| 1 | Client sends an inquiry through the contact form |
| 2 | CalebZ confirms scope and replies |
| 3 | CalebZ sends the matching Payment Link, or it is shown on the service tier |
| 4 | Client pays on Stripe, CalebZ gets notified |
| 5 | Work begins, delivery via a private track link |

## On-site presence

- Each service tier in `content/services.ts` can carry an optional `paymentUrl`.
- A Pay or Book button on a tier opens the link in a new tab.
- Tiers without a link route to the contact form for a custom quote.

This keeps the site static. No checkout to build, no secrets in the client.

## Deposits and custom work

For albums or custom jobs, use a Payment Link set to a deposit amount, balance on delivery. Stripe supports partial and custom amounts without code.

## Alternative

PayPal invoicing (2.99% + 49 cents) as a fallback for clients who prefer it. Higher fixed fee, but familiar. Offer it only on request.

## What we will not do

- No stored cards or accounts.
- No subscription billing.
- No custom payment backend. Stripe hosts it all.
