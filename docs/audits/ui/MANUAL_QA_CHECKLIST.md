# Manual QA checklist (staging)

Use with seeded staging DB (`AUTH_ALLOW_FALLBACK=false`, Mailpit). Check each box; note failures in INTERACTION_REGISTRY **Status**.

## Environment

- [ ] `npm run verify:prelaunch` green on release branch
- [ ] `npm run verify:alpha` green (or documented skips) when Docker/dev stack available
- [ ] `npm run test:e2e:smoke` green (or documented skips)
- [ ] `USE_DATABASE=true` and migrations applied on staging
- [ ] Demo login works (`RopeDreamer` / env password)

## Alpha gate (Wave 7 — human sign-off)

Run on staging with prod-like services (DB, Redis, S3-compatible storage, Mailpit/SMTP, WS, LiveKit if enabled).

| Smoke | Expected |
|-------|----------|
| Admin creates convention shell | Success |
| Organizer creates/publishes basic convention | Success |
| Door early check-in | 409 `EARLY_CHECK_IN` |
| Door early check-in with override | Success; registrant `checked_in` |
| Org scope-ban user attempts chat | 403 or composer hidden |
| Org scope-ban user attempts forum thread/reply | 403 or UI hidden |
| Group locked thread — non-mod reply | 403 or UI hidden |
| Group locked thread — mod/owner/admin reply | Success |
| ECKE publish with bridge off | Checkbox hidden/disabled; publish blocked (503 API) |
| ECKE publish with bridge on | ECKE publish runs before C2K public patch |
| Calendar feed valid token | 200 `text/calendar` |
| Calendar feed revoked token | 410 |
| Mobile route smoke 390/430 | No horizontal overflow on critical paths |
| Desktop route smoke 1440 | No 500s or console-breaking errors |

### Alpha gate detail checks

- [ ] Admin convention shell create
- [ ] Organizer convention publish
- [ ] Door early check-in 409
- [ ] Door override check-in success
- [ ] Org scope-ban blocks chat
- [ ] Org scope-ban blocks forum thread/reply
- [ ] Group locked thread blocks non-mod
- [ ] Group locked thread allows mod/owner/admin
- [ ] ECKE publish disabled when bridge disconnected
- [ ] ECKE publish order when bridge connected
- [ ] Calendar feed token 200/410
- [ ] Mobile 390/430 overflow check
- [ ] Desktop 1440 route smoke

## Public browsing (logged out)

- [ ] Landing `/` — hero, no fake “live” activity
- [ ] `/events` — list loads, filters work
- [ ] `/orgs` — directory loads
- [ ] `/conventions/:slug` — schedule tab honest when non-public

## Auth

- [ ] Login / logout
- [ ] `/home` — no signed-in fake discovery data

## Organization

- [ ] Create org `/orgs/new`
- [ ] Edit org name in organizer settings
- [ ] Public hub `/orgs/:slug` reflects name
- [ ] Forums: member can post; banned user cannot (API + UI)
- [ ] Chat: banned user cannot send

## Event & convention create

- [ ] Create in-person event (`?create=event`)
- [ ] Create virtual event
- [ ] Convention shell only when org ADMIN (moderator sees clear gate)
- [ ] Redirect to event/convention after create

## Command Bridge

- [ ] Dashboard, program, import, people tabs navigate
- [ ] Door link opens `/door`
- [ ] Permission: moderator without grant cannot mutate program/settings

## Program & publish

- [ ] Add/edit session; persists after refresh
- [ ] Public schedule shows published session only
- [ ] Convention publish: ECKE disabled when bridge off

## Registration & door

- [ ] Registration form builder saves after refresh
- [ ] Signups check-in matches door policy (early block)
- [ ] Door mode mobile check-in (390×844)
- [ ] Door permission denied: signed-in user without grant sees actionable panel (not raw error); back link to event
- [ ] Door load failure shows retry banner (not HTTP status text)

## Onboarding (UI-1)

- [ ] Signup → `/profile/edit?onboarding=1` (ProfileFinishPanel)
- [ ] `/onboarding` and `/profile/complete` redirect to same finish flow (preserve `?redirect=`)
- [ ] Skip onboarding → `/home` with dismissible incomplete-profile banner
- [ ] Finish profile → success screen with next-step CTAs (events / home / edit more)
- [ ] Signed-in API failure on home/profile shows retry banner — no silent mock data

## People ops

- [ ] Signups add / detail / export (no 404)
- [ ] Roster search; `?person=` deep link if supported
- [ ] Staff shift add

## Messaging & exports

- [ ] Messaging tab honest (no fake feed)
- [ ] Exports: working downloads only; calendar feed 200
- [ ] Integrations: ECKE status matches bridge

## Mobile primary workflows

- [ ] Create event modal completable on phone
- [ ] Door mode usable one-handed
- [ ] Org hub chat composer reachable

## Sign-off

| Role | Date | Notes |
|------|------|-------|
| | | |
