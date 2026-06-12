# Profile social rail + deploy — 2026-06-11

**Verdict:** **DEPLOYED TO PROD — smokes green**

**Host:** `root@2.25.196.84` · **URL:** https://kink.social  
**Deploy method:** `scripts/_deploy-eod-session.mjs` (api + web rebuild only — **no migrations, no DB wipe**)

---

## What shipped tonight

### FetLife-style profile Network sidebar
- Left rail on profile extended section (desktop): mutual connections, connections, followers, following
- Counts always visible when profile is readable; avatar grids respect privacy
- **Connections list** still defaults to **Hidden** (`connectionsListVisibility`) — counts show, grids gated
- **Follow lists** visible to signed-in members (owner always sees own grids)

### API
- `GET /api/profile/:username` now includes:
  - `connectionsSummary.preview`
  - `followsSummary` (counts + previews)
  - `mutualConnections` (count + preview for authenticated viewers)
- New routes: `GET /api/profile/:username/followers`, `GET /api/profile/:username/following`

### Other session fixes (same deploy)
- Real avatars across messaging, connections, follows, feed
- Typography: **Sora + Manrope** (Space Grotesk removed)
- Lightbox viewport centering via `createPortal` to `document.body`
- Prod hotfix (prior session): `profile_photos.display_settings` column added — profile 500s resolved

### Key files
| Area | Path |
|------|------|
| Social summary API | `packages/api/src/lib/profile-social-summary.ts` |
| Profile payload | `packages/api/src/routes/profile.ts` |
| Follow list routes | `packages/api/src/routes/profile-connections.ts` |
| Sidebar UI | `packages/web/src/components/profile/social/ProfileSocialRail.tsx` |
| Avatar grid | `packages/web/src/components/profile/social/SocialAvatarGrid.tsx` |
| Layout | `packages/web/src/components/profile/ProfileExtendedSection.tsx` |

---

## Production verification (2026-06-12 ~03:45 UTC)

| Check | Result |
|-------|--------|
| `scripts/_prod-smoke-local.mjs` | **PASS** (home 200, Sora font, health ready, trending 200) |
| `scripts/_smoke-prod-quick.mjs` | **9/9 PASS** |
| User count before/after deploy | **7 → 7** |
| Profiles / photos | **7 profiles, 5 photos** (unchanged) |
| On-server health | `database/redis/clamav/s3: ok` |
| Social payload smoke | `GET /api/profile/Brax` returns `connectionsSummary`, `followsSummary`, `mutualConnections` |

Example prod payload (anonymous viewer, `@Brax`):
```json
{
  "connectionsSummary": { "totalCount": 3, "listVisible": false, "preview": [] },
  "followsSummary": { "followerCount": 0, "followingCount": 2, "listsVisible": false },
  "mutualConnections": { "count": null, "preview": [] }
```

---

## Manual smoke (recommended)

1. Hard refresh https://kink.social/profile/Brax (or your username)
2. Scroll to **Extended profile** — **Network** card on the left (desktop)
3. Sign in — follower/following grids should populate when counts > 0
4. Settings → Privacy → change **Connections list** to Members/Public — avatar grid appears for connections
5. Open a profile photo lightbox — should center on screen (not top-left)
6. `/connections` — avatars on connection/follow rows

---

## Known gaps / follow-ups

1. **Migrations on host:** Full `npm run db:migrate-prod` from host fails (`postgres` hostname / drizzle-kit perms). Incremental schema fixes applied ad hoc (e.g. `display_settings`). Future migrations should run **inside api container** or with host `DATABASE_URL=127.0.0.1:5432`.
2. **Visitor “View all” for follows:** Owner links to `/connections`; visitors need modals or public follow-list pages (API exists, UI not wired).
3. **Follow-list privacy settings:** Not yet separate from connections privacy (follows default: signed-in members see grids).
4. **Git:** Workspace may not have `.git` on this machine — changes deployed from working tree tarball, not necessarily committed/pushed to remote.
5. **Pre-existing test flake:** `adult-content-preference.test.ts` (privacy schema field count).

---

## Ops commands

```bash
# Local prod smokes
node scripts/_prod-smoke-local.mjs
node scripts/_smoke-prod-quick.mjs

# Deploy (from repo root, after building tarball)
tar -czf _deploy-eod.tar.gz --exclude=node_modules --exclude=.git ...
SSH_PASS='***' node scripts/_deploy-eod-session.mjs

# Verify data preserved
SSH_PASS='***' node scripts/_prod-verify-data.mjs

# Check social API on server
SSH_PASS='***' node scripts/_prod-check-api-social.mjs
```

---

## Resume with

1. Brax manual profile/network sidebar walkthrough
2. Wire visitor “View all” for followers/following on profile rail
3. Fix prod migration path before next schema change
4. Commit + push to git remote when ready
