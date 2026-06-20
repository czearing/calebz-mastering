# CalebZ Mastering — Spec

Planning only. No code yet. Each spec file is the source of truth for one concern.

## Read in order

| # | File | Owns |
|---|------|------|
| 01 | [vision.md](01-vision.md) | Brand, audience, positioning |
| 02 | [the-10k-standard.md](02-the-10k-standard.md) | What makes it feel premium |
| 03 | [architecture.md](03-architecture.md) | Stack, structure, abstraction rules |
| 04 | [design-system.md](04-design-system.md) | Color, type, space, tokens |
| 05 | [motion-and-3d.md](05-motion-and-3d.md) | Scroll, animation, WebGL motif |
| 06 | [components.md](06-components.md) | Component inventory + line budgets |
| 07 | [pages-and-sections.md](07-pages-and-sections.md) | Sitemap, section flow |
| 08 | [content.md](08-content.md) | Final site copy |
| 09 | [track-sharing.md](09-track-sharing.md) | Serialized share-link feature |
| 10 | [contact-booking.md](10-contact-booking.md) | Inquiry and booking form |
| 11 | [performance.md](11-performance.md) | Budget and checklist |
| 12 | [roadmap.md](12-roadmap.md) | Build phases |
| 13 | [accessibility.md](13-accessibility.md) | WCAG 2.2 AA, mobile-first |
| 14 | [audience.md](14-audience.md) | Who books, what convinces them |
| 15 | [ux-testing.md](15-ux-testing.md) | The wow, conversion, test plan |
| 16 | [reviews.md](16-reviews.md) | Testimonial scaffold, collect, moderate |
| 17 | [infrastructure.md](17-infrastructure.md) | Free Cloudflare stack, scale |
| 18 | [payments.md](18-payments.md) | How payment is collected |
| 19 | [legal-compliance.md](19-legal-compliance.md) | Privacy, terms, FTC, rights |
| 20 | [dev-and-testing.md](20-dev-and-testing.md) | Build in slices, Playwright |
| 21 | [growth-and-distribution.md](21-growth-and-distribution.md) | How visitors actually arrive |
| 22 | [trust-and-cold-start.md](22-trust-and-cold-start.md) | Earning trust with zero reviews |
| 23 | [signature.md](23-signature.md) | The ownable hook: hear the difference |
| 24 | [interactive-work-and-scroll-cue.md](24-interactive-work-and-scroll-cue.md) | Album cards, before/after modal, playhead scroll cue |

## Hard rules

- Every file under 200 lines. Split before bloat.
- Dark theme. Neon cyan, near-black, off-white only.
- Zero AI features. Portfolio and booking only.
- Copy is plain, professional, no em dashes, no filler.
- Performance is a feature. Ship fast or cut it.
- WCAG 2.2 AA and mobile-first are requirements, not extras.
- Design for the one artist who books, not for everyone.
- Usable with motion off, WebGL absent, on a mid phone over 4G.
- Free and commercial-compliant infra (Cloudflare). No surprise bills.
- Only genuine reviews shown (FTC 2024 rule). Build in tested slices.
