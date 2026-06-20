# Page Audio Visualizer (spec)

When a visitor plays a track in the A/B modal, the whole page quietly comes alive: a full-bleed stereo field breathes behind everything, including behind the dialog. This is the moment that says "serious about audio." It fades out the instant playback stops.

## The reconciliation

Brand rule cca28d2d said the one WebGL hero motif never reacts to live amplitude. That rule still holds for the hero terrain. This layer is a separate, opt-in override that only exists while a track plays, scoped so the reactive surface and the craft surface never overlap. Reaction is allowed because it is driven by the real stereo field (a meter engineers read), not faked spectrum energy, and because every reactive parameter is heavily smoothed so it reads as breathing, not twitching.

## The one ownable direction: the page as goniometer

The background IS a goniometer at page scale. Live L and R samples plot as a slow Lissajous trace (rotated 45 degrees: vertical is mono L+R, horizontal is side L-R), the exact figure in StereoField, but unboxed and bloomed to fill the viewport as a soft cyan smoke. It is not points and not bars. The accumulated trace is drawn into an offscreen buffer that decays each frame, so the figure reads as a single luminous cloud whose SHAPE is the music: a narrow BEFORE collapses to a faint vertical spine, a wide mastered AFTER opens into a full breathing bloom. Stereo width, the engineer's craft, becomes the texture of the entire page.

Why it is not cheesy: the form is a real measurement tool, monochrome, slow, and low-contrast. There are no discrete frequency columns, no dancing bars, no per-beat bursts. The only thing that moves is the shape of the stereo image, which is the literal subject of the work.

## Two driven parameters, both smoothed

- Spread: the Lissajous radius, driven by live RMS level. Smoothed hard (exponential, time constant ~0.85, see citation) so it swells over ~400ms, never flickers per frame.
- Width and tilt: the side/mid ratio sets how wide the cloud opens and the correlation sign tints it. Negative correlation (out of phase) is the one allowed warning, a barely perceptible desaturation, never red.

Everything else (hue, base opacity, vignette) is fixed. Two slow inputs is the whole reactive budget.

## Layering and legibility (exact)

- Position: `fixed`, full viewport, `z-index` below content and below the dialog. The dialog and its scrim sit above; the visualizer shows around and faintly through the scrim.
- Opacity: layer caps at 0.14 over near-black. Cyan stays under 10 percent of viewport luminance (design-system rule).
- Blur: 24 to 40px gaussian on the bloom buffer, so it is atmosphere, never a readable figure competing with text.
- Vignette: radial mask darkening to the edges and strongest behind the centered content column and dialog, so text contrast never drops below WCAG AA.
- Fade in: 800ms ease `cubic-bezier(0.16,1,0.3,1)` on play. Fade out: 500ms on pause (faster out, matching the modal and the engineer's asymmetric crossfade).

## Relationship to the hero terrain: separate full-bleed layer

Decision: separate, not replace, not layered-on-top-of. The hero terrain stays scroll-and-pointer driven and never reacts to audio. The audio visualizer is a distinct fixed layer that only renders while a track plays. When playback starts, the terrain dims to ~0.4 so the two never fight; on pause the terrain returns and the visualizer leaves. One reactive surface, one craft surface, never co-active at full strength.

## Performance and accessibility

- One canvas (2D, the proven StereoField path) or one WebGL quad. No second realtime FFT: reuse the existing analyser tap (0bc4a1e2).
- DPR capped at 1.5. Bloom buffer rendered at half resolution then upscaled under blur (free, blur hides it).
- rAF runs ONLY while playing AND the tab is visible (`visibilitychange` + the play state). Paused or hidden: zero frames, zero cost.
- `prefers-reduced-motion`: no canvas. Instead a single static cyan radial glow whose RADIUS (not motion) reflects the final measured width, fading in on play. Proof without motion.
- The page is fully usable, legible, and complete with this layer off. It carries no content, only mood.

## Architecture requirement (note, do not implement)

The analyser lives inside the modal player (useABAudio). The visualizer is page-level. So the live L/R signal must be lifted to a shared source: a context or store holding the current `read(l,r)` tap plus a `playing` flag, provided above both the modal and the page background. The background subscribes; it never owns audio. Flagged here as a prerequisite.

## Failure and taste risks

- Biggest risk: it stops reading as a meter and starts reading as a screensaver or a lava lamp. The restraint that prevents it: keep the Lissajous geometry honest (real L vs R, rotated axes), cap opacity at 0.14, and keep only two slow smoothed inputs. The moment a third reactive parameter or a faster response is added, it tips into toy.
- Secondary: legibility. If any text drops below AA over the bloom, the vignette or opacity is wrong; legibility wins over the effect every time.
- Tertiary: two heavy reactive surfaces at once. Prevented by dimming the hero terrain whenever audio plays.
