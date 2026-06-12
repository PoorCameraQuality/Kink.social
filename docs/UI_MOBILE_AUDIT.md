# UI Mobile Audit — kink.social

Generated: 2026-06-12 via `npm run audit:ui-architecture`

**Viewports:** 360×800, 390×844 (primary), 430×932, 768×1024, 1440×900 (screenshots).

**Runtime:** dev server reachable; database ready.

## Summary

| Metric | Count |
|--------|------:|
| Route/viewport checks | 50 |
| P1 issues | 1 |
| P2 issues | 54 |
| P3 issues | 18 |
| Personas covered | guest, member, mod-admin |
| Skipped (with reason) | 0 |
| Screenshots (ok) | 165 |
| Authenticated captures | 135 |
| Login-wall captures | 0 |
| Screenshot skips | 0 |

## Screenshot index

Screenshots live under [`docs/audits/ui/screenshots/ui-architecture-audit/`](audits/ui/screenshots/ui-architecture-audit/).

See [`docs/audits/ui/generated/screenshot-manifest.json`](audits/ui/generated/screenshot-manifest.json) for the full capture manifest.

### Tier A — member core (sample links @ 390px, member persona)

- `/home` — [screenshot](audits/ui/screenshots/ui-architecture-audit/home-member-390.png)
- `/explore` — [screenshot](audits/ui/screenshots/ui-architecture-audit/explore-member-390.png)
- `/people` — [screenshot](audits/ui/screenshots/ui-architecture-audit/people-member-390.png)
- `/events` — [screenshot](audits/ui/screenshots/ui-architecture-audit/events-member-390.png)
- `/groups`
- `/messaging` — [screenshot](audits/ui/screenshots/ui-architecture-audit/messaging-member-390.png)
- `/notifications` — [screenshot](audits/ui/screenshots/ui-architecture-audit/notifications-member-390.png)
- `/profile` — [screenshot](audits/ui/screenshots/ui-architecture-audit/profile-member-390.png)
- `/profile/edit` — [screenshot](audits/ui/screenshots/ui-architecture-audit/profile-edit-member-390.png)
- `/onboarding`
- `/settings/account` — [screenshot](audits/ui/screenshots/ui-architecture-audit/settings-account-member-390.png)
- `/settings/privacy` — [screenshot](audits/ui/screenshots/ui-architecture-audit/settings-privacy-member-390.png)
- `/support` — [screenshot](audits/ui/screenshots/ui-architecture-audit/support-member-390.png)

## Mobile issues by route

| Route | Viewport | Persona | Issues | Severity | Fix category | Screenshot |
|-------|----------|---------|--------|----------|--------------|------------|
| `/` | 360 | guest | 5 touch targets under 44px; 3-column dashboard grid visible on narrow viewport | P2 | component, template | [view](audits/ui/screenshots/ui-architecture-audit/root-guest-360.png) |
| `/` | 390 | guest | 5 touch targets under 44px; 3-column dashboard grid visible on narrow viewport | P2 | component, template | [view](audits/ui/screenshots/ui-architecture-audit/root-guest-390.png) |
| `/conventions` | 360 | member | 3 touch targets under 44px | P3 | component | [view](audits/ui/screenshots/ui-architecture-audit/conventions-member-360.png) |
| `/conventions` | 390 | member | 3 touch targets under 44px | P3 | component | [view](audits/ui/screenshots/ui-architecture-audit/conventions-member-390.png) |
| `/conventions/preview-c2k-weekend` | 360 | member | 22 touch targets under 44px | P2 | component | [view](audits/ui/screenshots/ui-architecture-audit/conventions-preview-c2k-weekend-member-360.png) |
| `/conventions/preview-c2k-weekend` | 390 | member | 22 touch targets under 44px | P2 | component | [view](audits/ui/screenshots/ui-architecture-audit/conventions-preview-c2k-weekend-member-390.png) |
| `/education` | 360 | member | 11 touch targets under 44px | P2 | component | [view](audits/ui/screenshots/ui-architecture-audit/education-member-360.png) |
| `/education` | 390 | member | 12 touch targets under 44px | P2 | component | [view](audits/ui/screenshots/ui-architecture-audit/education-member-390.png) |
| `/events` | 360 | member | 25 touch targets under 44px; Backend/internal language visible (\bECKE\b) | P2 | component, copy | [view](audits/ui/screenshots/ui-architecture-audit/events-member-360.png) |
| `/events` | 390 | member | 25 touch targets under 44px; Backend/internal language visible (\bECKE\b) | P2 | component, copy | [view](audits/ui/screenshots/ui-architecture-audit/events-member-390.png) |
| `/explore` | 360 | member | 39 touch targets under 44px | P2 | component | [view](audits/ui/screenshots/ui-architecture-audit/explore-member-360.png) |
| `/explore` | 390 | member | 39 touch targets under 44px | P2 | component | [view](audits/ui/screenshots/ui-architecture-audit/explore-member-390.png) |
| `/groups` | 360 | member | 23 touch targets under 44px | P2 | component | — |
| `/groups` | 390 | member | 23 touch targets under 44px | P2 | component | — |
| `/home` | 360 | member | 19 touch targets under 44px | P2 | component | [view](audits/ui/screenshots/ui-architecture-audit/home-member-360.png) |
| `/home` | 390 | member | 19 touch targets under 44px | P2 | component | [view](audits/ui/screenshots/ui-architecture-audit/home-member-390.png) |
| `/media` | 360 | member | 3 touch targets under 44px | P3 | component | [view](audits/ui/screenshots/ui-architecture-audit/media-member-360.png) |
| `/media` | 390 | member | 3 touch targets under 44px | P3 | component | [view](audits/ui/screenshots/ui-architecture-audit/media-member-390.png) |
| `/messaging` | 360 | member | 10 touch targets under 44px | P2 | component | [view](audits/ui/screenshots/ui-architecture-audit/messaging-member-360.png) |
| `/messaging` | 390 | member | 10 touch targets under 44px | P2 | component | [view](audits/ui/screenshots/ui-architecture-audit/messaging-member-390.png) |
| `/moderation/dashboard` | 360 | mod-admin | 10 touch targets under 44px; 3-column dashboard grid visible on narrow viewport | P2 | component, template | [view](audits/ui/screenshots/ui-architecture-audit/moderation-dashboard-mod-admin-360.png) |
| `/moderation/dashboard` | 390 | mod-admin | 10 touch targets under 44px; 3-column dashboard grid visible on narrow viewport | P2 | component, template | [view](audits/ui/screenshots/ui-architecture-audit/moderation-dashboard-mod-admin-390.png) |
| `/notifications` | 360 | member | 4 touch targets under 44px | P3 | component | [view](audits/ui/screenshots/ui-architecture-audit/notifications-member-360.png) |
| `/notifications` | 390 | member | 4 touch targets under 44px | P3 | component | [view](audits/ui/screenshots/ui-architecture-audit/notifications-member-390.png) |
| `/onboarding` | 360 | member | 19 touch targets under 44px | P2 | component | — |
| `/onboarding` | 390 | member | 19 touch targets under 44px | P2 | component | — |
| `/organizer` | 360 | mod-admin | 7 touch targets under 44px; Backend/internal language visible (\bMODERATOR\+?\b) | P2 | component, copy | — |
| `/organizer` | 390 | mod-admin | 7 touch targets under 44px; Backend/internal language visible (\bMODERATOR\+?\b) | P2 | component, copy | — |
| `/orgs/demo-east-collective` | 360 | member | 17 touch targets under 44px; Backend/internal language visible (\bMODERATOR\+?\b) | P2 | component, copy | [view](audits/ui/screenshots/ui-architecture-audit/orgs-demo-east-collective-member-360.png) |
| `/orgs/demo-east-collective` | 390 | member | 17 touch targets under 44px; Backend/internal language visible (\bMODERATOR\+?\b) | P2 | component, copy | [view](audits/ui/screenshots/ui-architecture-audit/orgs-demo-east-collective-member-390.png) |
| `/people` | 360 | member | 30 touch targets under 44px; 3-column dashboard grid visible on narrow viewport | P2 | component, template | [view](audits/ui/screenshots/ui-architecture-audit/people-member-360.png) |
| `/people` | 390 | member | 30 touch targets under 44px; 3-column dashboard grid visible on narrow viewport | P2 | component, template | [view](audits/ui/screenshots/ui-architecture-audit/people-member-390.png) |
| `/policies` | 360 | guest | 34 touch targets under 44px; 3-column dashboard grid visible on narrow viewport | P2 | component, template | [view](audits/ui/screenshots/ui-architecture-audit/policies-guest-360.png) |
| `/policies` | 390 | guest | 34 touch targets under 44px; 3-column dashboard grid visible on narrow viewport | P2 | component, template | [view](audits/ui/screenshots/ui-architecture-audit/policies-guest-390.png) |
| `/presenters` | 360 | member | 18 touch targets under 44px | P2 | component | [view](audits/ui/screenshots/ui-architecture-audit/presenters-member-360.png) |
| `/presenters` | 390 | member | 18 touch targets under 44px | P2 | component | [view](audits/ui/screenshots/ui-architecture-audit/presenters-member-390.png) |
| `/profile` | 360 | member | 18 touch targets under 44px; 3-column dashboard grid visible on narrow viewport; Backend/internal language visible (\bMODERATOR\+?\b) | P2 | component, template, copy | [view](audits/ui/screenshots/ui-architecture-audit/profile-member-360.png) |
| `/profile` | 390 | member | 18 touch targets under 44px; 3-column dashboard grid visible on narrow viewport; Backend/internal language visible (\bMODERATOR\+?\b) | P2 | component, template, copy | [view](audits/ui/screenshots/ui-architecture-audit/profile-member-390.png) |
| `/profile/edit` | 360 | member | 22 touch targets under 44px | P2 | component | [view](audits/ui/screenshots/ui-architecture-audit/profile-edit-member-360.png) |
| `/profile/edit` | 390 | member | 22 touch targets under 44px | P2 | component | [view](audits/ui/screenshots/ui-architecture-audit/profile-edit-member-390.png) |
| `/settings/account` | 360 | member | 10 touch targets under 44px | P2 | component | [view](audits/ui/screenshots/ui-architecture-audit/settings-account-member-360.png) |
| `/settings/account` | 390 | member | 10 touch targets under 44px | P2 | component | [view](audits/ui/screenshots/ui-architecture-audit/settings-account-member-390.png) |
| `/settings/privacy` | 360 | member | 36 touch targets under 44px; 3-column dashboard grid visible on narrow viewport | P2 | component, template | [view](audits/ui/screenshots/ui-architecture-audit/settings-privacy-member-360.png) |
| `/settings/privacy` | 390 | member | 36 touch targets under 44px; 3-column dashboard grid visible on narrow viewport | P2 | component, template | [view](audits/ui/screenshots/ui-architecture-audit/settings-privacy-member-390.png) |
| `/support` | 360 | member | 4 touch targets under 44px | P3 | component | [view](audits/ui/screenshots/ui-architecture-audit/support-member-360.png) |
| `/support` | 390 | member | 4 touch targets under 44px | P3 | component | [view](audits/ui/screenshots/ui-architecture-audit/support-member-390.png) |
| `/terms` | 360 | guest | 59 touch targets under 44px; 3-column dashboard grid visible on narrow viewport | P2 | component, template | [view](audits/ui/screenshots/ui-architecture-audit/terms-guest-360.png) |
| `/terms` | 390 | guest | 59 touch targets under 44px; 3-column dashboard grid visible on narrow viewport | P2 | component, template | [view](audits/ui/screenshots/ui-architecture-audit/terms-guest-390.png) |
| `/vendors` | 360 | member | Page load failed: page.goto: Timeout 30000ms exceeded. Call log:   - navigating to "http://127.0.0.1:5173/vendors", waiting until "domcontentloaded"  | P1 | system | [view](audits/ui/screenshots/ui-architecture-audit/vendors-member-360.png) |
| `/vendors` | 390 | member | 21 touch targets under 44px; 3-column dashboard grid visible on narrow viewport | P2 | component, template | [view](audits/ui/screenshots/ui-architecture-audit/vendors-member-390.png) |

## Automated check definitions

| Check | Threshold |
|-------|-----------|
| Horizontal overflow | `scrollWidth > clientWidth + 2` |
| Touch targets | Interactive elements &lt; 44×44 CSS px |
| Duplicate nav | More than 2 fixed/sticky `nav` elements |
| Safe area | Bottom nav present but main padding &lt; half nav height |
| Sticky actions | Forms/onboarding without sticky/fixed bottom control |
| Backend language | Command Bridge, role enums, ECKE, rule-of-two |
| Dashboard on mobile | 3-col grid visible below 500px width |

## Manual follow-up (Tier C/D)

- [ ] Door mode: search visible, check-in CTA ≥56px, exit link works
- [ ] Organizer command bridge: tabs reachable, no content under fixed header
- [ ] Moderation queues: case actions thumb-reachable
- [ ] Create flow modal: sheet fits viewport, footer not under browser chrome

## Related

- [`docs/audits/ui/MOBILE_UX_AUDIT.md`](audits/ui/MOBILE_UX_AUDIT.md) — staging checklist template
- [`e2e/route-smoke.mobile.spec.ts`](../e2e/route-smoke.mobile.spec.ts) — CI overflow guard
