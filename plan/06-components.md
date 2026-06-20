# Components

One component per file. Under 200 lines. Most under 80. Split early.

## UI primitives

| Component | Lines | Notes |
|-----------|-------|-------|
| `Button` | <40 | Primary, ghost, link variants |
| `Field` | <60 | Label, input, error, focus motion |
| `Tag` | <20 | Mono label chip |
| `Reveal` | <40 | Wraps children, applies enter motion |
| `Marquee` | <50 | Slow horizontal drift |
| `Section` | <40 | Spacing, id anchor, heading slot |

## Sections (home)

| Component | Lines | Reads from |
|-----------|-------|-----------|
| `Hero` | <90 | content.hero |
| `Work` | <120 | content.work |
| `Services` | <100 | content.services |
| `Process` | <90 | content.process |
| `Testimonials` | <90 | content.testimonials |
| `Contact` | <120 | schema + action |
| `Footer` | <60 | content.footer |

## Three

| Component | Lines | Notes |
|-----------|-------|-------|
| `MotifCanvas` | <80 | R3F canvas, dynamic import, guards |
| `MotifMaterial` | <120 | Shader, uniforms for scroll and pointer |
| `useScrollSignal` | <40 | Feeds velocity to uniforms |

## Audio

| Component | Lines | Notes |
|-----------|-------|-------|
| `Player` | <120 | Transport, time, scrub |
| `ABPlayer` | <120 | Before/after toggle, gapless, level matched |
| `Waveform` | <90 | Thin monochrome path, not a visualizer |
| `useAudio` | <80 | Load, play, seek, range support |

`ABPlayer` is the on-page before/after comparison. One play head, two sources, instant A/B switch at the same position so the only audible change is the master. No bar visualizer. See 07 and 08 for placement and copy.

## Rules

- Sections never fetch. They receive typed props from `content/`.
- Motion lives in `Reveal` and section files, not scattered inline.
- Audio and three load only on the routes that use them.
- If a file passes 160 lines, extract a child before it hits 200.
