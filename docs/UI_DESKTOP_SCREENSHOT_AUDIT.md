# UI Desktop Screenshot Audit — kink.social

Generated: 2026-06-12 via `npm run audit:ui-desktop`

**Viewports captured:**

- **1280:** 1280×800
- **1366:** 1366×900
- **1440:** 1440×1000
- **1600:** 1600×1000
- **1920:** 1920×1080

**Personas:**

| Persona | User | State |
|---------|------|-------|
| `guest` | — | Logged out / login wall |
| `member` | RopeDreamer | Onboarding complete |
| `new-member` | RopeDreamer | Onboarding incomplete → `/onboarding` |
| `organizer` | RopeDreamer | Org mod+ with seed convention |
| `mod-admin` | Brax | Platform moderator/admin |

## Capture summary

| Metric | Count |
|--------|------:|
| Successful captures | 186 |
| Skipped | 9 |
| Login-wall captures | 0 |

Screenshots directory: [`docs/audits/ui/screenshots/ui-desktop-audit/`](audits/ui/screenshots/ui-desktop-audit/)

Manifest: [`docs/audits/ui/generated/desktop-screenshot-manifest.json`](audits/ui/generated/desktop-screenshot-manifest.json)

## Tier A — Core member surfaces

| Route | Guest | Member | New member | Screenshot prefix |
|-------|-------|--------|------------|-------------------|
| `/` | ✓ | — | — | `root-guest-{viewport}.png` |
| `/home` | — | ✓ | ✓ (onboarding) | `home-member-{viewport}.png` |
| `/explore` | — | ✓ | — | `explore-member-{viewport}.png` |
| `/people` | — | ✓ | — | `people-member-{viewport}.png` |
| `/events` | ✓ | ✓ | — | `events-{persona}-{viewport}.png` |
| `/messaging` | — | ✓ | — | `messaging-member-{viewport}.png` |
| `/profile` | — | ✓ | — | `profile-member-{viewport}.png` |
| `/onboarding` | — | — | ✓ | `onboarding-new-member-{viewport}.png` |

## Tier B — Directories & role onboarding

| Route | Persona | Notes |
|-------|---------|-------|
| `/conventions`, `/orgs/:slug` | member | 3-col discover / hub |
| `/education`, `/vendors`, `/presenters`, `/media` | member | Directory layouts |
| `/vendors/onboarding` | member | Vendor wizard |
| `/presenters/onboarding` | member | Presenter wizard |

## Tier C — Organizer

| Route | Persona | Notes |
|-------|---------|-------|
| `/organizer` | organizer | Hub dashboard |
| `/organizer/orgs/:slug` | organizer | Org command bridge |
| `/organizer/.../conventions/:slug` | organizer | Convention manager |
| `/organizer/.../door` | organizer | Mobile kiosk (minimal shell) |

## Tier D — Staff & legal

| Route | Persona | Notes |
|-------|---------|-------|
| `/moderation/dashboard` | mod-admin | Trust & safety console |
| `/policies`, `/terms` | guest | Legal (public) |

## Visual observations by viewport

- **1280px:** Minimum laptop — 3-col discover fits; organizer sidebar + content tight
- **1366px:** Common laptop — rails readable; convention manager usable
- **1440px:** Design reference — best balance of rails + content
- **1600px:** Wide desktop — excessive horizontal whitespace on some hubs without max-width
- **1920px:** Full HD — content islands float center; side rails far from content on ultra-wide

## Sample capture index (first 40)

| File | Route | Persona | Viewport |
|------|-------|---------|----------|
| `root-guest-1280.png` | `/` | guest | 1280 |
| `root-guest-1280.png` | `/?login=1` | guest | 1280 |
| `home-member-1280.png` | `/home` | member | 1280 |
| `home-new-member-1280.png` | `/home` | new-member | 1280 |
| `explore-member-1280.png` | `/explore` | member | 1280 |
| `people-member-1280.png` | `/people` | member | 1280 |
| `events-guest-1280.png` | `/events` | guest | 1280 |
| `events-member-1280.png` | `/events` | member | 1280 |
| `groups-97c004d2-b180-4a17-879b-22f4a22c2efb-member-1280.png` | `/groups/97c004d2-b180-4a17-879b-22f4a22c2efb` | member | 1280 |
| `messaging-member-1280.png` | `/messaging` | member | 1280 |
| `notifications-member-1280.png` | `/notifications` | member | 1280 |
| `profile-member-1280.png` | `/profile` | member | 1280 |
| `profile-edit-member-1280.png` | `/profile/edit` | member | 1280 |
| `profile-edit-new-member-1280.png` | `/profile/edit` | new-member | 1280 |
| `onboarding-new-member-1280.png` | `/onboarding` | new-member | 1280 |
| `settings-account-member-1280.png` | `/settings/account` | member | 1280 |
| `connections-member-1280.png` | `/connections` | member | 1280 |
| `support-guest-1280.png` | `/support` | guest | 1280 |
| `support-member-1280.png` | `/support` | member | 1280 |
| `conventions-member-1280.png` | `/conventions` | member | 1280 |
| `conventions-preview-c2k-weekend-member-1280.png` | `/conventions/preview-c2k-weekend` | member | 1280 |
| `orgs-demo-east-collective-member-1280.png` | `/orgs/demo-east-collective` | member | 1280 |
| `education-member-1280.png` | `/education` | member | 1280 |
| `vendors-member-1280.png` | `/vendors` | member | 1280 |
| `presenters-member-1280.png` | `/presenters` | member | 1280 |
| `media-member-1280.png` | `/media` | member | 1280 |
| `places-member-1280.png` | `/places` | member | 1280 |
| `vendors-onboarding-member-1280.png` | `/vendors/onboarding` | member | 1280 |
| `presenters-onboarding-member-1280.png` | `/presenters/onboarding` | member | 1280 |
| `vendors-rope-dreamer-supply-member-1280.png` | `/vendors/rope-dreamer-supply` | member | 1280 |
| `organizer-organizer-1280.png` | `/organizer` | organizer | 1280 |
| `organizer-orgs-demo-east-collective-organizer-1280.png` | `/organizer/orgs/demo-east-collective` | organizer | 1280 |
| `organizer-orgs-demo-east-collective-conventions-preview-c2k-weekend-organizer-1280.png` | `/organizer/orgs/demo-east-collective/conventions/preview-c2k-weekend` | organizer | 1280 |
| `organizer-orgs-demo-east-collective-conventions-preview-c2k-weekend-door-organizer-1280.png` | `/organizer/orgs/demo-east-collective/conventions/preview-c2k-weekend/door` | organizer | 1280 |
| `moderation-cases-mod-admin-1280.png` | `/moderation/cases` | mod-admin | 1280 |
| `policies-guest-1280.png` | `/policies` | guest | 1280 |
| `terms-guest-1280.png` | `/terms` | guest | 1280 |
| `root-guest-1366.png` | `/` | guest | 1366 |
| `root-guest-1366.png` | `/?login=1` | guest | 1366 |
| `home-member-1366.png` | `/home` | member | 1366 |