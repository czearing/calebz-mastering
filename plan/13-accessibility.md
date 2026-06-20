# Accessibility and Mobile

Accessible and mobile-first is not a tax on the premium feel. It is the premium feel. Target WCAG 2.2 Level AA.

## WCAG 2.2 AA targets

| Rule | Standard |
|------|----------|
| Text contrast | 4.5:1 normal, 3:1 large. Audit every token pair. |
| Tap targets | 24x24 CSS px minimum (SC 2.5.8). Use 44x44 for primary actions. |
| Keyboard | Every action operable by keyboard. Logical tab order. |
| Focus | Visible cyan focus ring, never obscured by sticky header. |
| Motion | Honor `prefers-reduced-motion`. Reduced path is opacity only. |
| Labels | Every field and control has a programmatic label. |
| Media | Audio player controls labeled. Captions on any video. |

Verify with automated checks plus a manual keyboard and screen-reader pass. AA is also a legal floor under ADA, Section 508, and the EU Accessibility Act (in force June 2025).

## Mobile-first

83% of traffic is mobile and mobile converts about half as well as desktop. Mobile friction is the single biggest lever, so design the small screen first.

| Concern | Rule |
|---------|------|
| Layout | One column. Content max 92vw. No horizontal scroll. |
| Type | Display clamps down so headlines never overflow or orphan. |
| Tap | Book button and player controls at least 44px, thumb reachable. |
| Forms | Native input types, correct keyboards, no zoom on focus (16px min). |
| Motion | Lenis smooth scroll and the WebGL motif off on mobile. Static frame instead. |
| Media | Audio loads on tap, never on page load. Range streamed. |
| Sticky | One persistent Book button, bottom-safe-area aware. |

## Non-audio proof (deaf and hard of hearing)

An audio-centric site must give value with the sound off (WCAG 1.2.1). The A/B cannot be the only proof. Provide a visual equivalent of the difference:
- A static before and after waveform or loudness readout per track (quiet, peaky raw versus full, controlled master).
- Plain numbers: integrated LUFS and true peak before and after.
- The case shown, not just heard, so a deaf visitor reaches the same conclusion.

iOS note: mobile Safari only starts audio after a user gesture, so the first play must be an explicit tap, never autoplay, and the button must visibly invite it.

## The non-negotiable

The site must be fully usable with motion off, WebGL absent, sound off, and on a mid-tier phone over 4G. Every effect is additive. The content, the visual proof, and the booking path work without any of it.

## Audit checklist before ship

- axe or Lighthouse a11y pass, zero criticals.
- Keyboard-only walk to a sent inquiry.
- Screen-reader pass on hero, player, and form.
- Contrast audit on all tokens.
- Real Android and iOS device pass, portrait and landscape.
