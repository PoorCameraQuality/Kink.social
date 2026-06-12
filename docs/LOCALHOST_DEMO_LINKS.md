# Localhost demo — quick links

**Base:** `http://localhost:5173` (or `http://127.0.0.1:5173`)

## Logins (after `npm run db:seed`)

| Account | Username | Password | Role |
|---------|----------|----------|------|
| **Site admin** | `Brax` | `Airship!2` (or `BRAX_ADMIN_PASSWORD`) | Org owner, platform admin email in `.env.development` |
| **Organizer / presenter QA** | `RopeDreamer` | `demo` (or `DEMO_LOGIN_PASSWORD`) | Org moderator, presenter, vendor |
| **Staff / impact presenter** | `LeatherCraftDemo` | `demo` | Org moderator, presenter |
| **Attendee / photographer** | `ShutterSeed` | `demo` | Convention registrant |
| **Trusted-role applicant** | `TrustedRoleApplicantDemo` | `demo` | Vetting flow QA |

**Data source:** Public listings on [East Coast Kink Events](https://www.eastcoastkinkevents.com) drive the seed catalog (`packages/api/src/db/ecke-catalog.ts` + `ecke-rich-seed.ts`). C2K is **not affiliated**; copy is paraphrased for local QA.

After `npm run db:seed` you should see roughly:

| Surface | Volume (typical) |
|---------|------------------|
| Calendar events | 41 upcoming ECKE-style cons + 6 dungeon listings |
| Feed posts | ~49 (status, articles, images, reposts) |
| Following activities | ~52 (`post`, `event_rsvp`, `connection_accepted`, `convention_pin`, …) |
| Connections | Mesh across Brax + 14 community accounts |
| Vendor shops | 12 (Rope Dreamer + 10 ECKE makers) with products |
| Profile photos | 3 per active account |
| Org forum | 5 ECKE-themed threads with replies |
| Convention hub chat | 8 messages on `preview-c2k-weekend` |

**Extra community logins** (password `demo`): `HarborRigger`, `PhillyQueerKink`, `DCBlackRose`, `NOLA_traveler`, `ChiKinkHost`, `RopeElevation`, `DungeonHospMD`, `TESFestHelper`, `FloggingFarmers`, `AgreeableAgony`

**Vendor-only logins** (password `demo`): `shop-flogging-farmers`, `shop-agreeable-agony`, … (`shop-{slug}` from ECKE vendor directory)

---

## Full reseed (wipes all data)

```bash
docker compose -f docker-compose.dev.yml up -d
npm run db:migrate-incremental -w @c2k/api
npm run db:seed:locations -w @c2k/api   # if places table empty after wipe
$env:USE_DATABASE='true'   # PowerShell — or rely on .env.development
npm run db:seed -w @c2k/api             # truncates public tables, then seeds
npm run dev
```

`npm run db:seed` **always wipes** unless `C2K_DB_WIPE=false`. Wipe only: `npm run db:wipe -w @c2k/api`.

After seed, copy the logged `C2K_PLATFORM_MODERATOR_USER_IDS=…` for Brax into `.env.development` if moderation tools should work before restart.

---

## Key URLs

| Page | URL |
|------|-----|
| Home (Near you) | http://localhost:5173/home?mode=discover&tab=Local |
| Following feed | http://localhost:5173/home?mode=following |
| Events (ECK-style calendar) | http://localhost:5173/events |
| Org hub | http://localhost:5173/orgs/demo-east-collective |
| Preview convention | http://localhost:5173/conventions/preview-c2k-weekend |
| Organizer console | http://localhost:5173/organizer/orgs/demo-east-collective/conventions/preview-c2k-weekend |
| Presenters | http://localhost:5173/presenters |
| Group | http://localhost:5173/groups/mid-atlantic-rope-social |
| Settings (Brax) | http://localhost:5173/settings |

**Mailpit:** http://127.0.0.1:8025

---

## Shutdown

```bash
docker compose -f docker-compose.dev.yml down
```
