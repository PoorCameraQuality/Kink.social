# Branding & social sharing

Guide for staff configuring **banners**, **logos**, and **link preview (OG) images** on organizations, groups, and conventions.

## Image specs

| Asset | Aspect | Suggested size | Where it appears |
|-------|--------|----------------|------------------|
| Banner | 3:1 or 16:9 | 1200×400 – 1600×900 | Public hub header |
| Logo | 1:1 | 256×512 | Avatar / wordmark chip |
| Link preview | 1.91:1 | **1200×630** | Facebook, Discord, iMessage, Slack unfurls |

Formats: PNG, JPEG, WebP. Keep under ~4 MB.

## Organizer locations

| Scope | Path |
|-------|------|
| Organization | `/organizer/orgs/:slug?tab=settings&settingsSection=branding` |
| Group | `/organizer/groups/:id?tab=settings` → Branding section |
| Convention | Event Systems → Settings → **Public page** (hero + social share image) |

In-app help: [/support/branding](http://localhost:5173/support/branding) (`packages/web/src/app/support/branding/page.tsx`).

## Fallback chain (link previews)

`resolveShareImageUrl` in `@c2k/shared` (`packages/shared/src/scope-branding.ts`):

1. `shareImageUrl` (dedicated OG image)
2. `heroImageUrl` (conventions / anchor event)
3. `bannerUrl`
4. `logoUrl`
5. Site default (`/og-default.png` on web origin)

## API & storage

- Upload: `POST /api/upload` → MinIO → URL stored on entity.
- **Groups:** `groups.banner_url`, `logo_url`, `share_image_url` — `PATCH /api/v1/groups/:id`
- **Organizations:** `organizations.share_image_url` (+ existing banner/logo) — `PATCH /api/v1/organizations/:slug`
- **Conventions:** `conventions.settings.shareImageUrl` (jsonb) — `PATCH /api/v1/conventions/:key/event`

## Social meta (client)

`ScopePageMeta` (`packages/web/src/components/seo/ScopePageMeta.tsx`) sets `og:*` and `twitter:*` on public group, org, convention, and event pages via `react-helmet-async`.

## Crawler HTML (server)

For link unfurls when crawlers do not run JavaScript:

| Route | Redirects to |
|-------|----------------|
| `GET /share/orgs/:slug` | `/orgs/:slug` |
| `GET /share/groups/:key` | `/groups/:id` |
| `GET /share/conventions/:slug` | `/conventions/:slug` |

Implemented in `packages/api/src/routes/share-routes.ts`.

## Testing checklist

1. Upload all three assets in organizer branding UI; confirm previews in panel.
2. Open public hub — banner and logo visible.
3. Paste public URL in Discord — expect 1200×630 card (may require `/share/...` URL for some crawlers).
4. Facebook Sharing Debugger — refresh scrape after replace.
5. Remove share image — confirm fallback to banner/logo in mockup.

## Components

- `ScopeBrandingPanel` — shared upload UI (`packages/web/src/components/organizer/ScopeBrandingPanel.tsx`)
- `useGroupBrandingSettings` — group PATCH helper hook

See also [`docs/FEATURE_REGISTRY.md`](./FEATURE_REGISTRY.md) and [`docs/ORGANIZER_CONSOLE.md`](./ORGANIZER_CONSOLE.md).
