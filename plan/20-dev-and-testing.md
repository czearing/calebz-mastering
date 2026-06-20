# Development and Testing

Do not build blind. Build in thin vertical slices, verify each in a real browser, then move on. Tests are written with the feature, not after.

## Principle

Every slice ships behind proof: a passing test and a real browser check. No slice is done because it looks done.

## Loop per slice

1. Write the spec note for the slice (what, acceptance).
2. Write a failing test for the visible behavior.
3. Build the smallest code to pass.
4. Run it in a real browser with Playwright. Look.
5. Check a11y and performance for that slice.
6. Commit. Next slice.

## Test layers

| Layer | Tool | Covers |
|-------|------|--------|
| Unit | Vitest | Token math, formatters, share logic, Zod schemas |
| Component | Testing Library | Field, Player, Reveal render and states |
| E2E | Playwright | Real user paths in a real browser |
| Visual | Playwright screenshots | Catch layout and motion regressions |
| A11y | axe via Playwright | Zero criticals per page |
| Perf | Lighthouse CI | Budget from 11-performance |

## Playwright E2E paths

These are the flows that must always pass:

| Flow | Assert |
|------|--------|
| Home loads | Hero visible, CTA present, no console errors |
| Hear the work | Click before, click after, audio plays |
| Booking | Fill form, submit, see confirmation |
| Share link | Open `/t/[token]`, audio plays, expired token 404s |
| Review submit | Submit review, lands as pending, not shown |
| Mobile | Same flows on a phone viewport, one hand |
| Keyboard | Reach a sent inquiry with keyboard only |
| Reduced motion | Page works with motion disabled |

## Run as you go

- Watch mode on unit and component tests during build.
- Playwright on the dev server for each slice.
- Lighthouse CI and axe in the pipeline, blocking on regressions.

## Slice order

Follow 12-roadmap. Each phase is a set of slices, each slice carries its own tests and browser check. The motif and audio slices include an explicit fallback test: the page must pass with WebGL off and audio not yet played.

## Definition of done

- Tests for the slice pass.
- Verified in a real browser, desktop and mobile.
- axe clean, within performance budget.
- Works with motion off and WebGL absent.
- Copy final, no placeholder text shipped.
