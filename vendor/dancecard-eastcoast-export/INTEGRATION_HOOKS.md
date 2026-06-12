# Dancecard — hooks in the parent East Coast app (outside this export)

When you merge dancecard into another Next.js app, search for these integration points. File paths are as they were in **EastCoast-master** (`src/` from repo root).

## `src/components/Header.tsx`

Early return hides the global marketing header on dancecard routes:

```tsx
if (pathname?.startsWith('/dancecard')) {
  return null
}
```

## `src/components/SupportBanner.tsx`

Suppresses or adjusts the support banner when path starts with `/dancecard`:

```tsx
if (pathname.startsWith('/dancecard')) return true
```

(Exact behavior: read the surrounding function in the source repo.)

## `src/components/auth/UserMenu.tsx`

- Imports `DANCECARD_DEFAULT_EVENT_PATH` from `@/lib/dancecard/nav` (value: `/dancecard/paf26` in the seed).
- Uses `pathname.startsWith('/dancecard')` to tweak UI / link target.

Change `src/lib/dancecard/nav.ts` after you pick a default event slug for your brand.

## `next.config.js`

No dancecard-specific entries were required in the original project; CSP and images were global. If your host adds stricter CSP, allow Supabase origins for `connect-src` and cookie behavior for same-site API routes.

## `.env.example`

Documented optional `DATABASE_URL`, `NEXT_PUBLIC_SITE_URL`, and `DANCECARD_ORGANIZER_DEV_BYPASS` — see root `README.md` in this export.
