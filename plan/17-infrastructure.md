# Infrastructure

Goal: free at portfolio scale, cheap and linear past it, no surprise bills. One vendor keeps it simple.

## The stack, all Cloudflare

| Need | Service | Free tier | Past free |
|------|---------|-----------|-----------|
| Host the site | Cloudflare Pages | Commercial use OK, unlimited bandwidth | Free |
| Run server logic | Workers | 100k requests per day | $5/mo for 10M |
| Store audio | R2 | 10 GB, zero egress | $0.015/GB-mo, still zero egress |
| Store data | D1 (SQLite) | 5 GB, 5M reads per day | $0.75/GB-mo |

### Why not Vercel

Vercel's Hobby plan is non-commercial only. A site that books paid work is commercial use, which violates Hobby terms and forces the $20/mo Pro plan. Cloudflare Pages allows commercial use free with unlimited bandwidth, so it is the correct host here.

## Hosting thousands of tracks

R2 charges zero egress at every tier. Streaming and downloads never add a bandwidth bill, which is the cost that usually punishes audio hosting. Storage math:

| Tracks | Avg size | Storage | Monthly cost |
|--------|----------|---------|--------------|
| 100 | 40 MB WAV | 4 GB | Free |
| 1,000 | 40 MB WAV | 40 GB | ~$0.45 |
| 1,000 | 8 MB MP3 preview | 8 GB | Free |

Strategy: store a web preview (MP3 or Opus) for streaming, keep the WAV only when a client needs download. Previews keep most of the catalog inside the free tier.

## Data model (D1)

```
shares   id, token, title, artist, audio_key, settings, expires_at, created_at
reviews  id, name, project, quote, rating, approved, created_at
```

Two small tables. Well inside 5 GB and daily read limits.

## What stays free

At realistic portfolio volume the whole site is $0/mo. The only cost that can appear is R2 storage past 10 GB, which is cents per month and grows linearly, never by surprise egress.

## Framework note

Next.js runs on Cloudflare via the official adapter, or build with Workers and a static export. Either keeps the App Router model from 03-architecture. The host changes, the structure does not.
