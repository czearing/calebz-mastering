# A/B Comparison and Modal (spec)

The popup must feel seamless and make a visitor go "woah". This is the part that sells the service, so it gets the most craft. Two changes: a reliable expand-from-card modal entrance, and a single overlapping before/after waveform (iZotope style) instead of three redundant visuals.

## Why the old morph was buggy

The View Transitions morph wrapped a React setState, which React defers, so the new DOM was not committed before the browser snapshotted. The morph saw old equal to new and did nothing, and the dialog top-layer timing made it flash. Fix: stop depending on the View Transitions API and animate the entrance directly with the Web Animations API. Reliable in every browser.

## Modal entrance: expand from the card

| Concern | Decision |
|---------|----------|
| Open | The dialog grows out of the clicked card: animate from the card's bounding rect (translate + scale) to the modal's natural rect |
| Backdrop | Fades in over the dimmed page |
| Easing | cubic-bezier(0.16, 1, 0.3, 1), 420ms open, 320ms close |
| Interactivity | Native dialog, operable instantly; the animation never blocks input |
| Close | Reverse: shrink back toward the card, focus returns to it |
| Reduced motion | Instant open and close, no scale |

The grid already captures the trigger card element, so the modal reads its rect on open.

## The before/after: one overlapping waveform

Replace the three visuals (live scrubber, static before, static after) with one comparison, the way iZotope overlays two signals rather than separating them.

| Element | Treatment |
|---------|-----------|
| Before | Grey fill on the shared baseline |
| After | Cyan fill, overlaid on the same axis |
| Difference | Visible at a glance where cyan exceeds or differs from grey |
| Playhead | One cyan line scrubbing across both |
| Emphasis | The toggled (audible) side is full opacity, the other dimmed |
| Numbers | LUFS and true peak shown compactly inline, not as separate blocks |

This single visual is the scrubber, the comparison, and the sound-off proof at once. Level matched so the only change is the master, never volume (iZotope Gain Match).

## Controls

- One play button, the brand verb as its label.
- One BEFORE/AFTER toggle, a two-segment control that also sets which side is emphasized.
- No redundant heading. The toggle is the label.

## Accessibility and performance

- Native dialog keeps the focus trap, Escape, and ARIA.
- The waveform is one canvas or SVG, drawn from precomputed peaks, no live FFT.
- Sound-off: the overlay plus the inline numbers carry the case.
- All motion gated by prefers-reduced-motion.

## Verify

Record a Playwright video of the open, and sample the dialog transform over time to confirm it actually animates (existence of an animation is not proof of motion). Confirm the overlap waveform shows both signals and the playhead tracks audio.
