# Checkout: upload-first and trustworthy (spec)

Two persona customers (Maya, a wary first-timer; Dre, a ready-to-buy producer) both said they would NOT pay on the current checkout on a first visit. Evidence: `.review-run/checkout-maya/` and `.review-run/checkout-dre/`. This spec fixes the structural and trust gaps they named. Supersedes the pay-first ordering in plan/29/plan/30 for the human cart.

## The verdict (both personas)
- Paying $294 to $540 before sending any tracks, to a stranger with no proof, feels backwards and unsafe. Both want to send tracks first.
- No identity or proof on the checkout: no name, face, bio, credits, testimonials, logo. "A beautiful dark void asking for money."
- No refund or guarantee. "Two revisions, then we lock it" reads as a threat, not reassurance.
- "Console" is jargon: a producer reads it as a mixing desk, and the same screen also calls it "Services."
- Dre, blocker: the dropzone says "WAV or AIFF. One file per track," but he paid for stem mastering, which is multiple stems per track. The instruction contradicts the order.

## The new flow (upload-first)
Seeded hand-off from the pricing builder runs FOUR steps, numbered "of 4":
1. **Review your order** — grouped summary, total, what is included, one clear way back to change it.
2. **Send your tracks** — name, email, and the upload dropzone. The customer hands over their material here, before paying. Stem orders get stem-aware guidance.
3. **Pay** — total, the payer already known, a short "what happens after" recap, identity and a safety-net line, then Pay.
4. **Done** — confirmation: got your tracks and payment, here is exactly what happens and when.

`useCheckout` STEPS adds "upload"; `SEEDED_FLOW = ["summary", "upload", "payment", "confirm"]`.

## Step-by-step requirements

### 1. Review (SummaryStep)
- Keep the grouped order card and sticky total.
- REMOVE all "console" wording. The hint becomes plain, e.g. "This is what you configured." The link becomes "Change your order" back to `/#services` (one name, never "console").
- Explain stem mastering in one quiet line when it is in the cart (what the +$40/track buys), so the add-on is not an unexplained upsell.
- CTA: "Continue".

### 2. Send your tracks (new UploadStep)
- Collect name and email here (moved off the pay step), validated with payerSchema before continuing.
- Render the Dropzone here, before payment.
- Stem-aware copy: if the cart has stem mastering, the dropzone guidance says to send the stems grouped per track (multiple files per track), NOT "one file per track". Otherwise keep "one file per track".
- Reassure that nothing is charged yet: "No charge yet. You pay on the next step, once your tracks are in."
- CTA: "Continue to payment".

### 3. Pay (PaymentStep)
- Remove the name/email form (already collected). Show the total and a short recap: "Tracks received. After payment I email you within one business day and master to your reference."
- Add an IDENTITY line: who you are paying (CalebZ, independent mastering engineer, Seattle), so it is not a faceless void. Reuse the founder name/portrait already on the site if cheap.
- Add a SAFETY-NET line that is honest, not invented: surface the free first master as the low-commitment alternative ("New here? Your first master is free, try that first") linking to `#contact`, and state the satisfaction promise as "two revisions included, and we keep going until you are happy" (soften "lock it"). Do NOT invent a refund policy; if a money-back line is wanted, leave a TODO for CalebZ.
- Keep the Stripe security line and the holding state.
- Define the turnaround relative to a start: "about three days from when your tracks are in".
- CTA: "Pay".

### 4. Done (ConfirmStep)
- Remove the dropzone (upload already happened in step 2).
- Confirm: "Thanks, {name}. I have your tracks and your payment." Then the same plain next-steps and contact promise, plus an order reference for the customer to quote.

## Backend note (CalebZ activation)
Upload now happens before payment, so the presign must accept a PENDING order, not only a paid one. Create a draft order (status pending) when the customer reaches "Send your tracks", key the upload to it, and let the paid webhook flip it to paid. Add an R2 lifecycle rule to reap pending orders with no payment after, say, 48 hours. Until keys are set, the upload shows the existing "storage not connected" demo state. Record this in POST-BUILD.

## Constraints
- Every file under 200 lines, tokens only, no em dashes, no arrow glyphs, no "console" anywhere customer-facing.
- Pricing stays sourced from src/lib/checkout. Keep tsc, lint, vitest green; update tests and stories for every touched component.
- Do not run `next build` (dev server shares .next); rely on tsc, lint, vitest.
