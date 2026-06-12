# Web Push (VAPID) — local dev

**Last updated:** 2026-06-06 (hub announcement + chat push — C215; prefs in Settings)

## Generate keys

```bash
npx web-push generate-vapid-keys
```

Add to `.env.development` (and restart `npm run dev` for the API):

```env
VAPID_PUBLIC_KEY=<public key from command>
VAPID_PRIVATE_KEY=<private key from command>
VAPID_SUBJECT=mailto:you@example.com
```

## Test flow

1. Pin a convention (home → Conventions).
2. **Settings** → **Browser push** → Enable (grants notification permission).
3. As staff, post to the convention **Announcements** hub channel.
4. Pinned users with an active push subscription should get a browser notification (`sw-push.js`).

Push is skipped when VAPID keys are unset (`GET /api/v1/me/push/status` → `configured: false`).

Disable announcement pushes: `C2K_PUSH_ANNOUNCEMENTS=false`.
