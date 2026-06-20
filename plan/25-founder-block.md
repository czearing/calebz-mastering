# Founder Block

The "I'm CalebZ" note is the second-strongest trust lever at launch, behind only Hear the
Difference (plan/22). It moves the buyer from company to person and sets up the free-master offer.
This spec decides how the portrait, the note, and the offer sit together.

## Placement: its own calm section, not the hero

Recommendation: a dedicated About section titled "Meet CalebZ", placed directly after the hero
proof, not inside the hero.

The hero now owns the first 100svh as a single A/B statement (the scroll-pacing fix, brain
b746b134). Stuffing a portrait, a note, and an offer back into that frame re-crowds the screen the
spacing pass just cleared. A separate section at the new 224px desktop rhythm (brain 20b10eb2) gives
the founder story room to read as a deliberate beat in the master-pass narrative (plan/23, Act 1 to
2), and still satisfies plan/22's "placed near the top, by the hero or just under it."

## Desktop layout

Two columns on the 12-column grid, content max width 1200px:

- Portrait: columns 1 to 5 (about 5 of 12), left side.
- Text: columns 7 to 12 (about 6 of 12), one column gutter between.
- The two columns are centered to each other vertically. Photo edge aligns to the grid, not the
  viewport. Asymmetry is encouraged by the design system, so this is not dead-center.

Text column order, top to bottom:
1. Eyebrow label "Meet CalebZ" (mono label token, tracked).
2. The founder note (`hero.founderNote`) at body size, reading column capped near 60ch.
3. The free-master offer (`hero.offer`) as a quiet callout: a `--surface` panel with a 1px `--line`
   border and the primary "Book a master" affordance beneath it.

Put the portrait on the left and the words on the right so the eye lands on the face, then reads the
note left to right (F-pattern, NN/g). The photo is the hook; the note is the substance.

## Mobile layout

Single column, stacked in this order:
1. Eyebrow + founder note. The words carry the trust, so they come first.
2. Portrait, 4:5, full width within the page margin.
3. Offer panel + Book action.

Note before photo on mobile keeps the section from opening with a large image and pushing the
substance below the fold.

## The photo

- Aspect: 4:5 portrait. Head-to-waist framing reads as a real person, not a cropped avatar, and the
  vertical shape pairs cleanly with a text column and fills a tall mobile slot.
- Max render size: about 560px wide on desktop (within a 5-of-12 column at 1200px). Asset is
  1120x1400 so it stays crisp at 2x.
- Treatment: cyan duotone toward the shadows, saturation pulled near zero with a trace kept so skin
  reads alive (brain 74b5c88c, e2c318a7). This is the same house grade every site photo gets
  (design-system Imagery, brain 55b2eb9b), so the portrait reads as part of the brand, not a warm
  stock photo.
- Frame: 8px radius on the image, 1px `--line` border to match cards. No heavy shadow; depth comes
  from value (design-system Radius and border).
- Grid and rhythm: top of the portrait aligns to the top of the eyebrow label. Section uses the
  standard 128/224px vertical padding (brain 20b10eb2).

## Accessibility

- The portrait is informative, not decorative: it identifies the founder and is not described by
  surrounding text, so it needs real alt text (W3C decorative-images tutorial, brain c6ef80b8).
  Alt: "CalebZ, mastering engineer, in a dark sweater against a stone column."
- No text is baked into the image, so copy stays selectable and translatable. No caption is required;
  if one is added, use `--text` or `--muted` on `--bg`, both of which pass WCAG AA.
- The offer panel and Book action keep the visible cyan focus ring (design-system Focus and a11y).

## Content fields and path

- Image: `public/calebz-portrait.jpg` (processed asset, 1120x1400, 4:5 cyan duotone). Referenced as
  `hero.portrait` (`/calebz-portrait.jpg`), already on the `Hero` type in `src/content/types.ts`.
- Note: `hero.founderNote`. Offer: `hero.offer`. Both in `src/content/hero.ts`.
- `hero.founderIcon` (`/calebz.jpg`) is the small avatar used elsewhere and is not this block.

## Alternates for review

`_review/portrait/alt-square-duotone.jpg` (tighter 1:1) and `_review/portrait/alt-45-mono.jpg`
(flatter near-mono cool grade) are provided for comparison. The 4:5 duotone is the chosen default.
