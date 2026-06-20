# Interactive Work and Scroll Cue (spec)

Plan only, no code yet. Two upgrades toward the 10k standard: a scroll cue that animates away and returns, and a Work section of album cards that move on hover and morph into an animated before/after modal.

## The ownable thread (designer note)

Both features are re-authored as miniature master passes, not generic effects. The cursor and the scroll are the same playhead, and every interaction is a small before to after pass: grey to cyan, loose to tight. This is what separates a 10k version from a template. The default versions (magnetic tilt, a cross-fade lightbox, a bouncing chevron) are commodity and are rejected below.

## A. Scroll cue, the master playhead at rest

Not a bouncing chevron. The cue IS the playhead motif: a short vertical cyan line over a faint horizontal hairline.

| Concern | Decision |
|---------|----------|
| At top | Visible. Idle micro-motion is a slow playhead nudge along the hairline, not an up/down bounce, priming "scroll plays the master pass" |
| On scroll | It travels down and hands off into the first waveform, so the cue visibly becomes the playhead the page scrubs. Not just fade and drift |
| Back at top | Returns to rest |
| Timing | 250ms out, the site easing cubic-bezier(0.16,1,0.3,1) |
| Reduced motion | Instant show/hide, no nudge, no travel |
| A11y | aria-hidden, pointer-events-none, never focusable |

Implementation: a small client hook reads scroll position (rAF throttled, shared with the existing scroll signal) and toggles a visible state. Transform and opacity only.

## B. Work as album cards

Replace the stacked list with a grid of album-art cards.

| State | Behavior |
|-------|----------|
| Layout | Fluid grid, auto-fit minmax capped, generous gaps so it breathes |
| Idle | Cover art (legible at rest), title, artist, genre tag. Restrained |
| Hover (fine pointer) | Scrub-to-preview: cursor X is a playhead. As the cursor moves left to right the cover crossfades from BEFORE (desaturated grey, loose waveform ghost) to AFTER (cyan, tight). Hovering a card is a tiny master pass and a literal preview of what the modal proves |
| Secondary | A faint tilt and scale 1.01 as a depth cue only, never the idea |
| Neighbors | Hold still. Only the hovered card moves |
| Press or Enter | Opens the before/after modal with a shared-element morph |

The ownable hover (scrub-to-preview) derives from the mastering before/after, not from a tilt library, which is a commodity component seen across many entries. Disabled on touch and under reduced motion. Cover stays fully legible at rest so keyboard and non-hover visitors lose nothing.

## C. The before/after modal

| Concern | Decision |
|---------|----------|
| Foundation | Native `<dialog>` opened with showModal(): built-in focus trap, Escape, backdrop, ARIA |
| Content | The ABPlayer (before/after), title, artist, LUFS and true-peak proof, close button |
| Open animation | The card cover and the modal WAVEFORM share a view-transition-name, so the art morphs INTO the proof. During the morph the cover resolves grey BEFORE to cyan AFTER, the same color-as-narrative move the page uses on scroll. GPU, no library |
| Easing and timing | cubic-bezier(0.16,1,0.3,1), about 420ms open, 320ms close |
| Interactivity | The dialog is operable immediately, the morph never blocks input. Cap the morph near 420ms |
| Close | Reverse morph back into the card, focus returns to the trigger card |
| Sound off | The static before/after waveforms and numbers still show (reuse LoudnessProof) |

The cover morphing into the waveform makes opening a card a miniature master pass: the art becomes the proof, grey becomes cyan, before becomes after.

## D. Accessibility (non-negotiable)

- Cards are real buttons. Enter and Space open. Logical tab order.
- Native dialog: labelled by the track title, focus moves in, Escape closes, focus returns to the trigger, background inert.
- Animations 200 to 300ms, all gated by prefers-reduced-motion.
- The modal works fully with the sound off and with no animation.

## E. Performance

- Cover art via next/image, sized, lazy below the fold.
- Hover tilt is transform and opacity only, never layout.
- Modal and ABPlayer stay dynamic imports. View Transitions is native, no framer-motion, so first load stays near 110kB gzip.

## F. Failure modes to test

| Case | Expected |
|------|----------|
| Touch, no hover | No scrub, no tilt, tap opens the modal |
| No View Transitions support | Graceful instant or quick fade open |
| Reduced motion | No morph, no scrub, no tilt, no cue travel, all instant |
| Many cards | Grid reflows, no overflow. Only the hovered card moves, neighbors hold |
| Mid-morph | The dialog is interactive immediately, the morph never blocks input |
| Keyboard and screen reader | Open, operate, close, focus returns |

Gimmick guard: one move per card, neighbors hold, cover legible at rest, morph capped near 420ms. Restraint reads as control. Awwwards weights usability about 30%, so none of this may cost clarity or speed.

## G. Components (each under 200 lines, story and test)

| File | Owns |
|------|------|
| `ScrollCue` + `useScrollCue` | The animated cue, extracted from Hero |
| `WorkGrid` | The album grid, replaces the Work list |
| `AlbumCard` | Cover, scrub-to-preview hover, opens the modal |
| `useScrubPreview` | Cursor-X driven before to after crossfade, fine-pointer only |
| `TrackModal` | Native dialog, ABPlayer, proof, close |
| `useViewTransition` | Wraps document.startViewTransition with a fallback |

## H. Content additions (temp, user replaces)

Each track gains a `cover` image path. Use placeholder covers for now, marked TODO. The ABPlayer sources and proof numbers already exist on the track type.

## References
View Transitions shared element and scroll-linked morph: Chrome for Developers. Native dialog focus trap: Headless UI, UXPin. Reduced motion: MDN.
