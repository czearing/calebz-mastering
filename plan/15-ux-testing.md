# UX Testing and Wow

Two jobs: confirm the site converts, and make sure the first impression lands. Wow is earned by clarity and craft, not gimmicks.

## The wow, defined

A booking visitor decides in the first screen. About 80% read only the headline and first line before they scroll or leave. So wow is not a slow reveal. It is:

1. Instant load. The page is there before they blink.
2. One clear line that says exactly what this is and who it is for.
3. Proof they can hear in one tap, before and after.
4. One obvious action: Book a master.
5. Craft underneath: easing, type, the one motif. Felt, not announced.

Restraint reads as expensive. The flex is that nothing is shouting.

## Conversion rules

| Rule | Why |
|------|-----|
| One dominant CTA above the fold | Single action lifts conversion. Wording lowers commitment |
| Show the work immediately | Visitors come to hear it. Do not make them dig |
| Proof next to the claim | Testimonials with name, photo, role, outcome lift 19 to 34% |
| Short form | Fewer fields, less friction, more inquiries |
| Mobile friction first | Most traffic is mobile and converts worst. Fix it first |

## CTA wording

Test variants. Lower the commitment in the words.
- Book a master
- Start a master
- Send a track

Pick by test, not taste.

## Test plan

Small and iterative beats one big study. About 5 users find roughly 85% of usability problems, so run short rounds.

| Round | Who | Task |
|-------|-----|------|
| 1 | 5 producers like the target | Find the work, play before and after, start a booking |
| 2 | 5 mobile-only users | Same tasks on a phone, one hand |
| 3 | 1 screen-reader user | Reach a sent inquiry by keyboard and voice |

Watch for: hesitation before the CTA, confusion at the player, drop-off in the form, any scroll jank.

## Metrics to instrument

- Scroll depth to Work and to Contact.
- Play rate on before and after.
- Form start and form submit rate.
- Time to first interaction.
- Core Web Vitals from real users, not just lab.

## Concrete tasks and thresholds

| Task | Pass threshold |
|------|----------------|
| Understand what the site is | Stated correctly within 5 seconds of landing |
| Play and switch the A/B unprompted | 4 of 5 users press play and find the toggle with no hint |
| Hear the difference | 5 of 5 conclude the master sounds better |
| Deaf path, sound off | User reaches the same conclusion from the visual proof |
| iOS first play | Audio starts on first tap, no silent failure |
| Start a booking | 5 of 5 complete the form without asking how |
| Find pricing | Located within 10 seconds |
| Mobile one hand | All above pass on a phone, thumb only |

## Pass bar

- A first-time user reaches a played before and after in under 15 seconds.
- A first-time user can start a booking without asking how.
- A sound-off user still gets the proof.
- No task fails on mobile that passes on desktop.
- Lighthouse a11y and performance both 95 or higher.
