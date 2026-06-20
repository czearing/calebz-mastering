# Motion and 3D

Motion signals control. Slow, staggered, one easing. Never decorate for its own sake.

## Easing and timing

- One curve everywhere: `cubic-bezier(0.16, 1, 0.3, 1)`.
- Reveals: 600 to 800ms. Stagger children 60 to 90ms.
- Hover: 200ms. Page transitions: 400ms crossfade.
- All gated by `prefers-reduced-motion`. Reduced motion drops to opacity only.

## Scroll

- Lenis wraps native scroll on a rAF loop for 60fps.
- Smooth scroll and heavy WebGL disabled on mobile to protect INP.
- Reveal on enter once, never replay on scroll up.
- One or two pinned moments maximum. Pin fatigue reads as cheap.

## Section choreography

| Section | Move |
|---------|------|
| Hero | Display type masks up line by line, motif fades in behind |
| Work | Cards rise and settle, cover art parallax 8px |
| Process | Numbered steps draw a vertical cyan line as you pass |
| Testimonials | Horizontal drift on scroll, slow marquee |
| Contact | Field labels lift on focus, submit pulses once |

## The WebGL motif: the track's own terrain

The only heavy visual, and the ownable one. Not a generic cyan field. It is a single GPU displacement surface whose geometry is the track's own analysis: a spectrogram and transient terrain baked offline from the real song. It morphs from the BEFORE shape to the AFTER shape as the scroll progresses the master pass (see 23-signature).

- Form: one displacement surface, monochrome line work, cyan on near-black.
- Data: precomputed from the track, baked to a data texture. Not live FFT, so no bars and no per-frame cost.
- Driven by scroll position (the master playhead) and pointer. Never by live audio amplitude.
- BEFORE state is loose and grey, AFTER is tight and cyan. The surface resolves as you descend.

## The signature motion moment

A scroll-scrubbed A/B morph. One continuous gesture crossfades, reversibly:
- the waveform (raw to mastered),
- the display type weight and width (loose to tight, see 04),
- the color grade (grey to cyan, see 04),
- the terrain surface (before shape to after shape).

Scrub up and the master undoes. This single coupled transition is the moment the site is remembered for.

### Guards

- Dynamic import after first paint. Suspense fallback is a static frame of the after-state terrain.
- Precomputed data textures, no live FFT. Cap device pixel ratio at 1.5.
- Pause when tab hidden or element off screen.
- Hard fallback: if WebGL is unavailable or the device is low power, render the static frame and skip the canvas. The morph degrades to a plain crossfade. The page and its story are complete without it.

## What we will not build

- Spectrum bars, dancing waveforms, frequency confetti.
- Particle bursts on click.
- Parallax on every element. Restraint is the point.
