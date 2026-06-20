# Checkout and IA fix (spec)

Three persona walkthroughs (Maya, a first-time mobile bedroom producer; Dre, a ready-to-pay EP producer; Sam, a skeptical evaluator) all broke trust at the same seams. This spec fixes them so the home page and checkout read as one coherent 10k product. Evidence lives under `.review-run/{maya,dre,sam}/`. Supersedes the relevant flow details in plan/29.

## The problems (all three personas)

1. **"STEP 4 OF 6" on arrival.** The Services console already does package, add-ons, and tracks, then the CTA hands off to `/start` at the cart step, which renders "Step 4 of 6" with steps 1 to 3 never seen. Reads as broken at peak purchase intent. Hitting Back reveals steps 1 and 2 literally re-create the console (duplicated work).
2. **Book vs Services confusion.** Every "Book" / "Book a master" CTA (header, hero, mid, footer) points to the `#contact` free-inquiry form, while the actual paid purchase path hides in the console's "Continue to checkout". Two front doors, no signposting. The user asked to make Book and Services the same thing.
3. **"First master free" inside the paid console** reads as bait-and-switch: the seeded cart charges full price with no $0 line. The free first master is a separate inquiry offer, not a discount.
4. **Cart looks unfinished.** Identical "Untitled track" rows, total clipped below the fold, big empty void; a hard fidelity drop from the polished console.
5. **Page order.** Process ("How it works") and Testimonials sit AFTER the pricing console. Trust should precede price.
6. **Inconsistent CTA labels.** Book / Book a master / Start a master / Continue to checkout / Continue to pay / Send inquiry: six labels for two actions.
7. **Validation errors use brand cyan**, not an error color (reads as helper text, not an error).

## The fixes

### A. One configuration, one short checkout (kills "Step 4 of 6")
- The console IS the order builder (package + add-ons + tracks). The checkout at `/start` becomes a FOCUSED 3-step flow only: **Review -> Pay -> Confirm**, numbered "Step 1 of 3" etc. Remove the package/add-ons/tracks steps from the live flow.
- Direct visits to `/start` with no params redirect to `/#services` (the console is the only configurator). So `/start` always arrives with a seeded cart.
- `useCheckout` takes a flow definition. The console hand-off seeds the cart and starts the 3-step flow at Review. No "of 6" anywhere.

### B. Polished Review step (replaces the bare cart)
- Default track names are "Track 1, Track 2, ..." not "Untitled track" (change the `lineItems` fallback to use the track's 1-based position).
- Group the review: a clear header line "Album, 6 tracks, $50 per track" plus add-on lines, not 12 identical rows.
- The order total is ALWAYS visible (sticky summary or placed above the fold), never clipped.
- Visual quality matches the console (same type scale, spacing, cyan accents).

### C. Unify Book and Services; separate the free offer cleanly
- Every "Book" / "Book a master" CTA becomes **"Start a master"** and points to **`#services`** (the console). Book and Services are now the same destination. `nav.book` becomes `{ label: "Start a master", href: "#services" }`.
- The FREE first master becomes a clear, distinct element at the TOP of the Services section: a single banner/card "First time? Your first master is free. Send one track." linking to `#contact`. It is visibly separate from the paid console, so no one confuses free with paid.
- Remove "First master free" from the paid console subhead.
- The `#contact` form is the free-master / inquiry destination, labeled for that ("Send one track, mastered free"). It is not a generic "Book".

### D. Reorder the page so trust precedes price
- New order: Hero -> About -> Work -> **Process (How it works)** -> **Testimonials** -> Services (pricing console) -> Contact (free master + inquiry).
- Move `Process` and `Testimonials` above `Services` in `src/app/(site)/page.tsx`.

### E. Consistent CTA labels (two actions, two verbs)
- Paid path: "Start a master" (entry, to #services) -> "Continue to checkout" (console CTA, to /start) -> "Pay" (checkout). One label per step.
- Free path: "Get your first master free" / "Send one track" (to #contact). Distinct verb.
- Retire generic "Book".

### F. Validation error color
- Add a semantic error color token (a warm red that passes AA on `#060708`) and use it for form validation messages instead of `--cyan`.

## Out of scope here (CalebZ content, not code)
- Real testimonials replace the placeholder quotes; real email and Instagram links replace `hello@example.com` / `instagram.com/`. Tracked in POST-BUILD.md. Personas flagged these as trust blockers, so note them but do not invent content.

## Constraints
- Every source file under 200 lines. Tokens only, no magic values. No em dashes, no arrow glyphs in copy or comments.
- Reuse the existing checkout catalog (`src/lib/checkout`) as the single pricing source; the console and checkout must never disagree.
- Keep tsc, lint, and vitest green; add or update tests and stories for every touched component. Do not run `next build` (a dev server shares the .next cache); rely on tsc, lint, vitest.
