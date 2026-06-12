# T&S moderation console screenshots (T&S-3.5)

Capture with dev stack running (`npm run dev`) after `npm run db:ensure-brax-site-admin` and logging in as **Brax**.

| File | Viewport | Route |
|------|----------|-------|
| `moderation-dashboard-desktop.png` | 1280×800 | `/moderation/dashboard` |
| `moderation-dashboard-mobile.png` | 390×844 | `/moderation/dashboard` |
| `moderation-queues-desktop.png` | 1280×800 | `/moderation/queues` |
| `moderation-cases-desktop.png` | 1280×800 | `/moderation/cases` |
| `moderation-case-detail-desktop.png` | 1280×800 | `/moderation/cases/:caseId` (seeded media case) |
| `account-nav-moderation-entry-desktop.png` | 1280×800 | Account menu open showing Trust & Safety |

Optional: add to `docs/audits/ui/screenshots/latest-alpha/` if aligning with alpha screenshot convention.

**Quick capture:** browser devtools device mode or Playwright headed run against `e2e/moderation-ts.spec.ts`.
