# Contact and Booking

Booking is the point of the site. Contact is always one intent away.

## Access

- Book action in the header, persistent on scroll.
- Hero primary action jumps to the form.
- Footer repeats email.
- Goal: never more than one scroll or one click from booking.

## Form fields

| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| Name | text | yes | 2 to 80 chars |
| Email | email | yes | valid email |
| Project type | select | yes | Single, EP, Album, Other |
| Links | text | no | URL or text, for reference tracks |
| Message | textarea | no | up to 1500 chars |

A required free-text Message is the single biggest friction in the path to inquiry. Make it optional. Name, email, and project type are enough to start a conversation. Replace the blank-box stare with a short optional prompt ("Anything I should know about the track?") so writing it is inviting, not a wall.

All inputs use 16px font on mobile to stop iOS from zooming on focus. Honeypot field hidden from users to deflect bots. No captcha at launch.

## Submit flow

1. Validate on the client with Zod, inline errors under each field.
2. Post to a server action.
3. Server validates again, then sends via Resend to CalebZ.
4. Show confirmation in place. No redirect.
5. On failure, keep the input and show a retry message.

## Confirmation copy

Thanks. I will get back to you within one business day.

## Optional booking calendar

If CalebZ wants scheduled intro calls, embed a Cal.com or similar booking widget in a lightweight modal. Lazy loaded. The plain inquiry form stays the default so booking never depends on a third party script.

## Spam and abuse

- Honeypot plus server side rate limit per IP.
- Basic content length and link count checks.
- No data stored beyond the email that is sent.

## What we will not add

- Live chat widget.
- AI assistant or auto-reply bot.
- Multi-step wizard. One screen, five fields, done.
