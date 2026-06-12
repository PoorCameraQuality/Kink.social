# Trending score (C2K)

**schemaVersion:** 1  
**Purpose:** Rank mixed-type items on `/home?tab=Trending`. Tweak weights here and mirror in `packages/api/src/lib/trending-score.ts`.

## Signals (per item kind)

| Signal | Weight v1 | Notes |
|--------|-------------|------|
| Base freshness | 1.0 | Decay below |
| Views (logged) | 0.02 / view | Cap 500 views / 24h per item |
| Reactions | 1.5 each | |
| Reposts | 2.0 each | |
| Comment velocity | 1.0 / comment / day | Optional when comments exist |
| RSVP velocity (events) | 0.5 / new RSVP / hour | |

## Time decay

- Half-life **48 hours** on the combined raw score: `score * 2^(-ageHours/48)`.

## Per-type caps

- In each page of 40 items, at most **50%** may be `feed_post`, **30%** `event`, remaining mixed.

## Anti-gaming (v1)

- Ignore impressions from unauthenticated sessions for ranking.
- Rate-limit score contribution from a single account per item per hour.

## Changelog

- **2026-05-28:** v1 scoring implemented in `packages/api/src/lib/trending-score.ts` + `trending-rank.ts` — likes, reposts, RSVP velocity, freshness decay; views and comment velocity deferred.
- **2026-03-25:** Initial v1 placeholder (implementation may stub until instrumentation ships).
