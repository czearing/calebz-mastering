# Reviews

No testimonials exist yet. Scaffold the system now so adding one later is trivial, and so the site can collect and display real reviews.

## Two modes, same display

| Mode | Source | When |
|------|--------|------|
| Seeded | Typed entries in `content/reviews.ts` | Launch, before any submissions |
| Submitted | Stored in D1, approved by CalebZ | Once clients start leaving reviews |

The Testimonials section reads an array. Whether an item came from the file or the database, it renders the same. Switching on submissions is a config flag, not a rebuild.

## Easy to update

A review is one object:

```ts
{ name, project, quote, rating?, photo?, date, approved }
```

To add one by hand, append an object to `content/reviews.ts`. No deploy logic, no CMS. The build picks it up.

## Accepting reviews

A short public form at `/reviews/new`:

| Field | Notes |
|-------|-------|
| Name | Real name, shown on approval |
| Project or release | Context for the quote |
| Rating | Optional 1 to 5 |
| Review | The quote |
| Email | Private, for verification only |

Flow: submit to a Worker, validate with Zod, store in D1 with `approved = false`. Nothing shows until CalebZ approves it.

## Seeing and moderating reviews

A simple protected page at `/admin/reviews` (single passcode, no accounts):
- List pending and approved reviews.
- Approve, hide, or delete.
- Approved reviews appear on the site on next load.

D1 free tier (5 GB, 5M reads per day) covers this many times over.

## Compliance built in

The FTC 2024 rule bans fake, AI-generated, and incentivized reviews, penalty up to $51,744 per violation. So:
- Only real, client-submitted or client-confirmed reviews are shown.
- No incentive is offered for leaving a review.
- No edited wording that changes meaning.
- Verify by email before display.

See 19-legal-compliance for the full rule.

## Placement

Reviews sit next to the claim they support, not in one distant wall. A quote about loud, clean masters sits by the Work section. A quote about turnaround sits by Services. Proof near the claim lifts trust.
