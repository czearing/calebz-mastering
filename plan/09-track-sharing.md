# Track Sharing

A serialized private link to deliver a mastered track to a client. The site already streams audio for the portfolio, so this reuses the player.

## Link shape

```
calebzmastering.com/t/aF7kQ2mZ
```

`token` is an unguessable nanoid. Not sequential. Not guessable from another link.

## What the recipient sees

- The track title and artist.
- A clean player: play, scrub, time, thin monochrome waveform.
- Optional A/B of before and after.
- A download button when CalebZ enables it.
- A one line note from CalebZ when set.
- Nothing else. No nav, no upsell, no signup.

## Behavior

| Setting | Default | Notes |
|---------|---------|-------|
| Expiry | None | Optional date after which the link 404s |
| Password | Off | Optional gate before audio loads |
| Download | Off | When on, serves the WAV or MP3 |
| Watermark | Off | Optional voice tag on previews |

## How it works

1. Token resolves on the server to track metadata. Unknown or expired token returns 404.
2. The page renders server side with title and player shell.
3. Audio streams from `/api/audio/[token]` which signs a short-lived URL and supports range requests, so scrubbing is instant and the file is not a public URL.
4. If a password is set, audio will not load until it is entered.

## Creating a link

Launch scope: a typed entry in `content/shares.ts` per delivery (token, file, title, settings). Generate the token with nanoid. No admin UI needed at first.

Later: a small protected upload form if volume grows. Not required to ship.

## Privacy

- No public index of shares.
- Tokens are long and random.
- Signed audio URLs expire. The underlying file is never directly linkable.
- Optional password and expiry for sensitive pre-release material.
