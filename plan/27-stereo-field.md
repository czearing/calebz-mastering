# Stereo Field (spec)

When a track plays, show the listener something that says "this person is serious about audio". The answer is a goniometer (stereo vectorscope), the meter real mastering engineers read, not a decorative spectrum bar chart.

## Why a goniometer

It plots the live left and right samples as a Lissajous figure on rotated axes. A mono signal collapses to a vertical line; wide stereo blooms into a cloud. So the narrowed BEFORE reads as a tight column and the wide mastered AFTER spreads outward. The stereo width, the engineer's craft, is made visible. This is the tool, not a toy.

## How it works

| Piece | Decision |
|-------|----------|
| Tap | A Web Audio graph in useABAudio: both sources feed one channel splitter into two analysers. The muted side is silent, so the analysers always read the audible side |
| Read | StereoField reads L and R time-domain buffers each frame and plots them |
| Plot | Rotate 45 degrees: vertical is mono (L+R), horizontal is side (L-R). Cyan points on near-black with fading trails |
| Guides | A faint reference circle and the mono and side axes, so it reads as a real meter |
| Gate | Only runs while playing; reduced motion and no-canvas environments draw nothing |

## The wow

Play BEFORE: the field is a narrow column. Flip to AFTER: it blooms wider. Verified in a real browser: cyan horizontal spread went from 8px (before) to 23px with ~2.5x more points (after). You see the master widen the image in real time.

## Accessibility and performance

- The canvas carries a role and a plain-language label describing what a wider cloud means.
- The page and the proof still work with the field off (the overlap waveform and numbers carry the case).
- The AudioContext starts only on the first play (a user gesture), and closes on unmount.
- No new dependency: native Web Audio API.

## Placeholders fed in

The Work A/B players now use real 32s excerpts from the artist's SoundCloud: the master as AFTER, and a degraded version (quieter, narrower, duller) as BEFORE, so the field and the numbers show a real difference. The user replaces these with the true raw mix and master later.
