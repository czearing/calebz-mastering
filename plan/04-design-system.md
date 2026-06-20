# Design System

One token source. No raw values in components.

## Color

Three families only. Cyan is an accent, not a flood.

| Token | Value | Use |
|-------|-------|-----|
| `--bg` | #060708 | Page base, near black |
| `--surface` | #0E1113 | Cards, raised panels |
| `--line` | #1C2227 | Hairline borders |
| `--text` | #F4F6F7 | Primary text, off white |
| `--muted` | #8A9499 | Secondary text |
| `--cyan` | #00E5FF | Accent, focus, active |
| `--cyan-dim` | #0A8C9C | Hover, edges of glow |

Rules: cyan covers under 10 percent of any viewport. White and black do the work. Glow is one soft shadow, never neon spread.

### Cyan is earned, not sprayed

Cyan on near-black is the most cloned look in this category. Make it singular by tying it to the master narrative (23-signature):
- Photos use a cyan duotone grade, not full-color images. One graded palette across the whole site.
- Full-chroma cyan is reserved for the AFTER state. BEFORE content sits desaturated grey.
- As the scroll progresses the master pass, color saturates. Color becomes the story, still under 10 percent.

## Type

A neo-grotesque alone is the Awwwards default, not a differentiator. Use a neo-grotesque (Geist or Söhne) for UI and a mono for technical labels, but add one variable display cut for the hero and section openers.

The variable display axis carries the master state: at hero scale it animates weight and width as the master resolves. BEFORE is thin and loose, AFTER is tight and heavy. Type transforms with the sound, not independent of it.

| Token | Size / Line | Use |
|-------|-------------|-----|
| `display` | clamp 48 to 96px / 0.95 | Hero, section openers |
| `h2` | clamp 28 to 44px / 1.05 | Section titles |
| `body` | 17px / 1.6 | Paragraphs |
| `label` | 13px mono, tracked +6% | Tags, meta, numbers |

Tracking tightens as size grows. No orphan lines in headings.

## Space

8px base scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128. Section vertical rhythm is 96 to 160px. Content max width 1200px. Reading column 64ch.

## Radius and border

Radius: 2px on small, 8px on cards. Borders are 1px `--line`. No heavy shadows. Depth comes from value, not blur.

## Grid

12 columns, 24px gutter desktop. 4 columns mobile. Asymmetry is allowed and encouraged. Avoid dead-center everything.

## Focus and a11y

Visible cyan focus ring on every interactive element. Contrast meets WCAG AA. Respect `prefers-reduced-motion`. Run the token pairs through a contrast audit before build.

## Imagery

Studio and gear shots, high grain, desaturated with a cyan cast. No stock musicians. No headphones-on-laptop clichés.
