# Performance

Blazing fast is a requirement, not a goal. Speed is part of the premium feel.

## Budget

| Metric | Target |
|--------|--------|
| LCP | under 1.5s on 4G mid phone |
| INP | under 200ms |
| CLS | under 0.05 |
| First-load JS (home) | under 130KB gzipped |
| Lighthouse | 95 or higher on all four |

## How we hit it

- Home is static and server rendered. No client data fetching.
- 3D and audio are dynamic imports, loaded after first paint.
- The WebGL motif never blocks LCP. Static frame paints first.
- One font family, subset, `font-display: swap`, preloaded.
- Images: next/image, AVIF and WebP, sized, lazy below the fold.
- No analytics bloat. One lightweight, privacy-friendly tag at most.
- Tailwind purged. No unused CSS shipped.

## Audio

- Stream with range requests. Never load a full WAV to start playback.
- Preview encodes for the web. Originals only on enabled download.
- Lazy init the audio engine on first play, not on page load.

## Motion cost

- Cap device pixel ratio at 1.5 in the canvas.
- Pause the canvas when off screen or tab hidden.
- Disable smooth scroll and WebGL on mobile if frames drop.
- Reduced motion path ships no heavy animation.

## Verify before ship

- Lighthouse mobile and desktop.
- Real mid-tier Android test for scroll smoothness.
- Bundle analyzer to confirm three and audio are split out.
- Contrast audit on all token pairs.
- Test the share link cold, with cache cleared, target under one second to play.
