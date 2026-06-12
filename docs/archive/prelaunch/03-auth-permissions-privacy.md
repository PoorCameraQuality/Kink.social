# Prelaunch audit 03 — Auth, permissions, RBAC, and privacy

**Scope:** Login/session flow, org roles, convention **access grants** vs **command grants**, admin and delegated permissions, visibility (public / members / attendee), organizer console, Command Bridge, door mode, settings, API 403 behavior, UI permission gating, WebSocket subscribe auth, privacy settings enforcement.

**Method:** Code review of `packages/api/src/auth`, permission libs, convention/org/organizer routes, `authorizeWebSocketSubscribe`, web auth context and organizer UI nav filters. No fixes applied.

**Audit date:** 2026-06-04  
**Wave 4 remediation (2026-06-04):** `whoCanMessage` enforced on DM create/send (`dm-privacy.ts`); hub **write** mutations on slots, settings, documents, presenters/staff use command grants (OWNER/ADMIN full). Participation-offer OR fix was Wave 3. H-01 partially addressed — read paths still use `canManage`.

**Wave 5 remediation (2026-06-04):** `getConventionWithAccess().canManage` now reflects command-bridge access (not org MOD alone); `requireHubConventionRead` on full settings + presenter lookup; PUT access grants use registration command grant. Remaining `canManage` **mutations** on hub ext routes still open.

**Wave 6 remediation (2026-06-04):** Hub mutations aligned to `requireHubConventionMutation` (gallery, hub channels, volunteer shifts, custom pages, presenter requests, ISO board, etc.); staff-roster/crew-grid reads use `staff_ops` grant; org chat scope-ban parity; group forum ban/lock writes.

---

## 1. Executive summary

C2K has a **documented layered permission model** (session → platform → org → group → convention access → command bridge → resource) that is **partially implemented and inconsistently enforced**. The Command Bridge path (`requireConventionCommand` / `convention_command_grants`) is the strongest and most granular layer for Event Systems. A **parallel legacy path** on `/api/v1/conventions/:key/*` still gates many mutations with **`canManageConvention` (org MODERATOR+)** and **does not honor delegated command grants**, creating bypass and confusion.

**Production blockers:** auth fallback enabled by default; profile email and basic identity exposed without visibility checks; broken multi-permission fallback in participation-offer routes (403 sent before alternate grant check).

**Overall:** Auth/session works for real DB users when `USE_DATABASE=true` and `AUTH_SECRET` is set. Command-grant separation (registration / staff_ops / scheduler / admin) is **correct on organizer routes**. Privacy and hub-vs-bridge alignment need work before production.

---

## 2. Blockers

| ID | Issue | Why it blocks production |
|----|-------|--------------------------|
| B-01 | **`AUTH_ALLOW_FALLBACK` defaults to enabled** (`allowAuthFallback()` returns true unless env is literally `'false'`) | Unauthenticated visitors get mock viewer `RopeDreamer`; API accepts non-UUID `sub` only where `getViewerUserId` returns null, but UI still treats fallback as signed-out for mutations while other code paths may behave inconsistently. `.env.production.example` does not require disabling fallback. |
| B-02 | **Profile API leaks email and identity regardless of `profiles.visibility`** | `GET /api/profile/:username` always returns `user.email`, `user.id`, `username` even for PRIVATE profiles and anonymous viewers. Only kinks/photos/ISO are visibility-gated. |
| B-03 | **Participation-offer routes use broken permission-or fallback** | `requireOrganizer(..., 'registration')` **sends HTTP 403** before a second call for `scheduler` / `staff_ops` can run. Scheduler-only operators cannot list/edit/send offers despite intended fallback logic. Files: `participation-routes.ts` lines 220–223, 302–305, 346–350. |

---

## 3. High-risk issues

| ID | Issue | Detail |
|----|-------|--------|
| H-01 | **Dual mutation paths: hub API bypasses command grants** | Legacy routes in `conventions-routes.ts` use `canManageConvention` (org **MODERATOR+**). Org moderators can POST/PATCH schedule slots, convention settings, documents, etc. **without** any `convention_command_grants` row and **without** Command Bridge access. Contradicts product rule that only OWNER/ADMIN get implicit full command access; MODERATOR is not `isFullAdmin`. |
| H-02 | **Hub UI advertises Command Bridge to org MODERATOR+ without grant check** | Convention hub sets `staffCanOpenOrganizer` from `access.canManage \|\| access.isStaff`. Org moderators see Event Systems link but get **403** on `/organizer/command-access` unless OWNER/ADMIN or delegated grant. |
| H-03 | **`whoCanMessage` privacy setting not enforced server-side** | `POST /api/v1/conversations` (in `ecosystem-stubs.ts`) checks connections for PENDING vs ACCEPTED but never reads `user_settings.privacySettings.whoCanMessage`. Default is `connections_only`; strangers can still initiate DM requests. |
| H-04 | **Door mode page lacks login redirect** | `/organizer/.../door` loads without `useAuth` gate; relies on bootstrap API. Unauthenticated users see loading/error, not login redirect (unlike main organizer convention page). |
| H-05 | **`activityHistoryVisibility: 'members'` is weak** | `viewerCanSeeActivityHistory` treats any authenticated user as satisfying `members`; no shared-org or connection check. |
| H-06 | **Org group chat privacy disclaimer exists in UI only** | `OrgHubClient` warns that org channels are visible to mods/admins; API correctly requires membership but there is no end-to-end encryption or DM-style isolation—expected, but users may underestimate exposure. |

---

## 4. Medium-risk issues

| ID | Issue | Detail |
|----|-------|--------|
| M-01 | **Org MODERATOR vs STAFF confusion on convention hub** | `getConventionWithAccess`: `canManage` = org MODERATOR+; `isStaff` = access grant STAFF/MODERATOR/staffPreAccess. Staff without org mod see staff surfaces but not full manage tab mutations (`canManage` false). UI partially explains this; easy to misconfigure. |
| M-02 | **Command team management requires `admin` (OWNER/ADMIN only)** | Correct per rules; delegated grants cannot manage team. UI `settings` tab and `CommandTeamPanel` gated with `canManageTeam` / `admin`—aligned. |
| M-03 | **Check-ins use command `registration`, not hub `canManage`** | `GET/POST .../check-ins` correctly use `userHasConventionCommandPermission(..., 'registration')`. Door mode aligned. Good pattern—but different from hub slot mutations (H-01). |
| M-04 | **WebSocket scope coverage is narrow** | `authorizeWebSocketSubscribe` only handles `convention:{id}:schedule`, `org:{id}:channel:{id}`, `org:{id}:announcements`. Other realtime scopes return false (fail closed). Documented in `10-websocket-scopes.md`. |
| M-05 | **Client-only route protection** | Organizer and settings pages redirect via `useEffect` + `buildLoginHref`; no server-side route middleware. Direct URL access briefly renders shell; API still enforces 401/403. Acceptable if API always authoritative. |
| M-06 | **`profiles.visibility === 'MEMBERS'` means any signed-in user** | Not org-member scoped; differs from org `MEMBERS` visibility semantics. Documented implicitly in profile route only. |
| M-07 | **Platform moderator is env UUID list only** | `C2K_PLATFORM_MODERATOR_USER_IDS`; no DB role. Misconfiguration grants broad moderation powers. |
| M-08 | **Registration-only grant cannot reach admin routes** | Verified: `requireOrganizer(..., 'admin')` uses `commandPermissionIncludes('admin')` → requires `isFullAdmin`. Registration/staff_ops/scheduler grants correctly denied. |

---

## 5. Low-risk issues

| ID | Issue | Detail |
|----|-------|--------|
| L-01 | Generic 403 bodies (`{ error: 'Forbidden' }`) | Hard to distinguish missing grant vs wrong domain vs no org link; UI must infer from context. |
| L-02 | `readOnlyForTab` in Command Bridge hides writes in UI but deep links to tab query params may flash before bootstrap redirect | `ConventionDancecardOrganizerClient` redirects to `firstAllowedTab` after bootstrap. |
| L-03 | Mock/demo login when `USE_DATABASE=false` | Demo password + seed users; must never ship in production DB mode. |
| L-04 | Identity ban uses IP prefix on login/register | `checkIdentityBan`; bypass via IP rotation possible; acceptable for alpha. |
| L-05 | WS unsubscribe clears all listeners on socket | Documented quirk in architecture doc; not auth-related but affects shared sessions. |

---

## 6. Dead/misleading UI found

| Location | Issue |
|----------|-------|
| Convention hub → “Event Systems” / organizer link | Shown when `canManage \|\| isStaff`; Command Bridge requires command grant or OWNER/ADMIN (403 for org MODERATOR without grant). |
| Hub “Manage” tab | Org MODERATOR can mutate schedule/settings via legacy API while Command Bridge nav hides scheduler tabs without grant—two organizers with different powers see different UIs for overlapping duties. |
| Door mode route | No explicit “sign in required” state; shows generic load error if bootstrap fails. |
| Settings privacy copy | Implies messaging restrictions; server does not enforce `whoCanMessage` / `whoCanSendConnectionRequest` uniformly on all social endpoints. |
| `viewerCanManageOrg` helper | Name implies role check; only tests map membership (map already filtered to MODERATOR+ from API). Misleading for future callers. |

---

## 7. Permission issues found

### 7.1 Two grant systems (do not confuse)

| Aspect | **Convention access grants** (`convention_access_grants`) | **Convention command grants** (`convention_command_grants`) |
|--------|-----------------------------------------------------------|---------------------------------------------------------------|
| **Purpose** | Attendee/staff **hub** access: program, chat, ISO, announcements | **Organizer Command Bridge** operations |
| **Key fields** | `paidConfirmed`, `attendingConfirmed`, `role`, `staffPreAccess`, `canAssignStaffSchedules` | `canRegistration`, `canStaffOps`, `canScheduler` |
| **Resolver** | `getConventionWithAccess()` | `resolveConventionCommandAccess()` |
| **Typical consumer** | `/api/v1/conventions/:key/*` attendee routes, hub tabs, WS schedule subscribe | `/api/v1/conventions/:key/organizer/*`, check-ins, door API |
| **Org OWNER/ADMIN** | May get `canManage` via org membership (MODERATOR+) | Implicit **full** command permissions (`isFullAdmin`, `canManageTeam`) |
| **Org MODERATOR** | `canManage: true` on hub | **No** implicit grant; needs `convention_command_grants` row |
| **Paid attendee** | `canView` when paid+attending confirmed | No command access unless delegated |

### 7.2 Org roles (organization_members)

| Role | Org console settings | Org moderation tab | Convention hub `canManage` | Command Bridge full admin |
|------|---------------------|-------------------|------------------------------|---------------------------|
| OWNER | Yes | Yes | Yes | Yes (`isFullAdmin`) |
| ADMIN | Yes | Yes | Yes | Yes |
| MODERATOR | No (settings) | Yes | Yes | **No** (unless delegated grant) |
| STAFF | No | No | No | **No** (unless delegated grant) |
| MEMBER | No | No | No | No |

Enforcement: `organizations.ts` (`requireMinRole`), web `canAccessOrganizerSettings` / `canAccessOrganizerModeration`.

### 7.3 Command Bridge domains (enforced on organizer routes)

| Domain | API requirement key | UI tab examples | Notes |
|--------|---------------------|-----------------|-------|
| Any bridge access | `any` | dashboard, bootstrap | Must have at least one flag or OWNER/ADMIN |
| Registration | `registration` | registrants, vetting, door, signups | Cannot mutate admin settings |
| Staff ops | `staff_ops` | staff, swaps, incidents, exports, roster | Cannot publish program / scheduler-only import |
| Scheduler | `scheduler` | program, venues, import, assignments | Cannot manage command team |
| Admin | `admin` | settings, integrations, API keys, command team, participation settings | **OWNER/ADMIN only** (`isFullAdmin`) |

Implementation: `@c2k/shared` `commandPermissionIncludes`, `packages/api/src/lib/convention-command-access.ts`, `commandBridgeNavPermissions.ts`.

### 7.4 Rules compliance checklist

| Rule | Status |
|------|--------|
| Org OWNER/ADMIN full command access | **Pass** on organizer routes |
| Delegated command grants not admin | **Pass** on organizer routes |
| Members/public no organizer controls | **Pass** on organizer routes (401/403) |
| Registration-only no admin mutations | **Pass** |
| Staff ops no scheduler-only mutations | **Pass** on organizer routes |
| Same rules on legacy hub mutation routes | **Fail** — org MODERATOR bypasses grants (H-01) |

---

## 8. Missing env/config

| Variable | Production status | Auth/permission impact |
|----------|-------------------|------------------------|
| `AUTH_SECRET` | Required in prod (`auth.ts` 500 if missing) | Session signing |
| `AUTH_ALLOW_FALLBACK` / `VITE_AUTH_ALLOW_FALLBACK` | **Not in `.env.production.example`** | Must be `false` in production |
| `USE_DATABASE=true` | Expected in prod | Real user IDs, grants, settings |
| `C2K_PLATFORM_MODERATOR_USER_IDS` | Optional | Platform moderation |
| `C2K_PLATFORM_ADMIN_EMAILS` | Optional | Email capture export |
| `SESSION_COOKIE_NAME` + secure cookie | `secure: true` when `NODE_ENV=production` | Transport security |

---

## 9. Recommended fixes

See **Fix recommendations** (section 16) for prioritized actions. Summary: disable auth fallback in prod, fix profile visibility and email redaction, unify convention mutation authorization on command grants, repair participation-route permission-or helper, enforce privacy settings on DM/connection creation, align hub Command Bridge link with grant probe.

---

## 10. Files likely affected

| Area | Files |
|------|-------|
| Session / auth | `packages/api/src/auth/resolve-viewer.ts`, `packages/api/src/routes/auth.ts`, `packages/web/src/contexts/AuthContext.tsx` |
| Command access | `packages/api/src/lib/convention-command-access.ts`, `packages/shared/src/convention-command-permissions.ts` |
| Access grants | `packages/api/src/routes/conventions-routes.ts` (`getConventionWithAccess`, `canManageConvention`) |
| Organizer API | `packages/api/src/routes/convention-organizer-routes.ts`, `packages/api/src/routes/convention-organizer/*.ts` |
| WS auth | `packages/api/src/lib/ws-subscribe-auth.ts` |
| Org RBAC | `packages/api/src/routes/organizations.ts`, `packages/web/src/lib/organizer/types.ts` |
| UI gating | `packages/web/src/lib/dancecard/commandBridgeNavPermissions.ts`, `ConventionDancecardOrganizerClient.tsx`, `OrganizerConventionPageClient.tsx`, `conventions/[slug]/page.tsx` |
| Privacy | `packages/api/src/routes/profile.ts`, `packages/api/src/routes/ecosystem-stubs.ts`, `packages/shared/src/user-settings.ts`, `packages/api/src/lib/activity-history-visibility.ts` |
| Door | `packages/web/src/app/organizer/.../door/page.tsx`, `packages/api/src/routes/convention-organizer/door-routes.ts` |
| Docs | `docs/architecture/03-permission-systems.md`, `docs/architecture/10-websocket-scopes.md` |

---

## 11. Suggested tests

### Auth / session
- [ ] Login → session cookie → `GET /api/auth/session` returns `authenticated: true`, UUID `userId`
- [ ] Logout clears cookie; protected route returns 401
- [ ] With `AUTH_ALLOW_FALLBACK=false`, unauthenticated session returns no mock user

### Command grants
- [ ] OWNER: all organizer tabs writable; `GET command-team` succeeds
- [ ] Registration-only grant: registrants/door OK; `PATCH .../event` (admin) → 403; program publish → 403
- [ ] Staff_ops-only: incidents/exports OK; scheduler import → 403
- [ ] Scheduler-only: program/import OK; vetting mutate → 403
- [ ] No grant, org MODERATOR: Command Bridge bootstrap → 403; **document current** hub slot POST behavior

### Access grants
- [ ] Attendee without grant: schedule 403 when `publicProgramListing` false
- [ ] Staff grant: announcements post where allowed; no command bridge
- [ ] WS subscribe schedule: matches REST visibility matrix

### Privacy
- [ ] PRIVATE profile: anonymous `GET /api/profile/:user` → 404 or redacted (no email)
- [ ] `whoCanMessage: nobody/open`: stranger cannot create conversation
- [ ] `activityHistoryVisibility: hidden`: non-owner GET history → empty/denied

### Participation offers (regression for B-03)
- [ ] Scheduler-only user: `GET .../participation-offers` → 200 (after fix)

---

## 12. Confidence level

**Medium–high** for Command Bridge and org RBAC (direct code paths traced). **Medium** for privacy (settings UI extensive; server enforcement spotty). **High** confidence on B-03 and H-01 (reproducible from static analysis). Live penetration testing and role-matrix integration tests not run in this audit.

---

## Permission matrix

Legend: ✅ allowed · ❌ denied · ⚠️ allowed via alternate/legacy path · 🔒 OWNER/ADMIN only

### Platform & session

| Actor | Public pages | Authenticated API | Organizer routes | Settings API |
|-------|--------------|-----------------|------------------|--------------|
| Anonymous | ✅ browse public org/convention listings | ❌ 401 on protected | ❌ UI redirect / API 401 | ❌ sign-in prompt |
| Fallback mock viewer | ✅ | ⚠️ `getViewerUserId` null → 401 on DB mutations | ❌ treated as logged out in organizer | ❌ fallback blocked |
| Authenticated member | ✅ | ✅ per resource | ❌ without scope/grant | ✅ own settings only |
| Platform moderator | ✅ | ✅ + moderation endpoints | Per org/grant | ✅ |

### Organization hub

| Role | View PUBLIC org | Join MEMBERS org | Join PRIVATE org | Chat read | Chat post | Org settings |
|------|-----------------|------------------|------------------|-----------|-----------|--------------|
| Non-member | ✅ | ✅ join | ❌ invite | ❌ | ❌ | ❌ |
| MEMBER | ✅ | ✅ | ✅ if member | ✅ | ✅ general channels | ❌ |
| STAFF | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| MODERATOR | ✅ | ✅ | ✅ | ✅ | ✅ + announcements | ❌ settings (ADMIN+) |
| ADMIN/OWNER | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### Convention hub (access grants + org role)

| Actor | View program* | Hub chat | ISO board | Manage tab | Command Bridge |
|-------|---------------|----------|-----------|------------|----------------|
| Public | *if `publicProgramListing`* | ❌ | ❌ | ❌ | ❌ |
| Paid+attending grant | ✅ | ✅ | ✅ | ❌ | ❌ |
| Staff access grant | ✅ | ✅ | ✅ | ⚠️ staff-limited UI | ❌ unless command grant |
| Org MODERATOR+ | ✅ | ✅ | ✅ | ✅ legacy mutations | ⚠️ link shown; API 403 without grant |
| Org OWNER/ADMIN | ✅ | ✅ | ✅ | ✅ | ✅ full |

\*Schedule WS subscribe mirrors REST rules in `ws-subscribe-auth.ts`.

### Command Bridge (command grants)

| Grant / role | Dash | Reg / door | Staff ops | Scheduler | Settings/admin | Team CRUD |
|--------------|------|------------|-----------|-----------|----------------|-----------|
| OWNER/ADMIN | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| reg only | ✅ | ✅ write | ❌ | ❌ | ❌ | ❌ |
| staff_ops only | ✅ | ❌** | ✅ write | ❌ | ❌ | ❌ |
| scheduler only | ✅ | ❌ | ❌ | ✅ write | ❌ | ❌ |
| org MODERATOR, no grant | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Member/public | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

\*\*Some people sub-tabs require `any`; staff_ops grant passes `any`.

---

## UI/API mismatch list

| # | UI behavior | API behavior | Severity |
|---|-------------|--------------|----------|
| 1 | Hub link to Event Systems for `canManage \|\| isStaff` | Command Bridge requires command grant or OWNER/ADMIN | High |
| 2 | Command Bridge nav hides tabs by grant | Legacy `/conventions/:key/slots` allows org MODERATOR without grant | High |
| 3 | Privacy settings: “who can message you” | Conversation create ignores setting | High |
| 4 | Profile visibility PRIVATE | Email still returned in profile payload | High |
| 5 | Participation offers UI (scheduler operators) | GET offers 403 for scheduler-only (broken fallback) | Blocker |
| 6 | Door mode “registration required” message | Correct API enforcement; no login redirect | Medium |
| 7 | `readOnly` on Command Bridge tabs | API 403 on write if user navigates via URL hack—aligned | Low |
| 8 | Org MEMBERS visibility “join to see more” | MEMBERS org shell visible; forums/chat need membership | Low (expected) |

---

## Privacy risks

| Risk | Description | Likelihood | Impact |
|------|-------------|------------|--------|
| P-01 Email exposure | Any viewer can read account email from profile API | High | High — doxing, spam |
| P-02 PRIVATE profile not enforced | Username, id, memberSince leak; kinks hidden but identity not | High | Medium |
| P-03 DM privacy settings cosmetic | `whoCanMessage`, `allowImagesInDirectMessages` not enforced on create/send | High | Medium |
| P-04 Activity history “members” | Any logged-in user sees history marked members-only | Medium | Low–medium |
| P-05 Org channel visibility | Members told mods see chat; no technical DM-style privacy | Known product | Medium (social) |
| P-06 Registrant PII in organizer exports | Registration/staff_ops grants access exports; correct by role but high sensitivity | By design | High if mis-granted |
| P-07 Auth fallback in prod | Mock browsing could confuse audit logs / analytics | Low if mis-configured | Medium |
| P-08 Platform mail BCC | `C2K_PLATFORM_MAIL_BCC` copies all outbound mail | Config-dependent | Compliance |

**Positive findings:** Settings routes require real UUID session; blocked users routes gated; ISO DM entry checks `acceptDmsViaIso`; convention registration codes validated server-side (`convention-public-routes.ts`); command team listing requires admin.

---

## Fix recommendations

### P0 — Before production deploy

1. **Set `AUTH_ALLOW_FALLBACK=false` and `VITE_AUTH_ALLOW_FALLBACK=false`** in production env; document in `.env.production.example`.
2. **Redact or gate profile email** — return email only to `isOwner`; return 404 for PRIVATE profiles when viewer not allowed.
3. **Fix `requireOrganizer` multi-domain checks** — add `resolveConventionCommandAccess` helper that tries requirements **without** sending 403 until all fail (replace pattern in `participation-routes.ts`).
4. **Route legacy convention mutations through command permissions** — replace `canManageConvention` with `userHasConventionCommandPermission` appropriate domain (or deny MODERATOR hub mutations and force Command Bridge).

### P1 — Security / permission consistency

5. **Enforce `whoCanMessage` and connection request privacy** on `POST /api/v1/conversations` and connection request endpoints.
6. **Hub Command Bridge link** — probe `command-access` or include `hasCommandAccess` in convention access payload before showing link.
7. **Door page** — add same login redirect as `OrganizerConventionPageClient`.
8. **Tighten `activityHistoryVisibility: members`** — require connection or shared org membership.

### P2 — Hardening & UX

9. Standardize 403 error codes/messages (`insufficient_command_grant`, `admin_required`, etc.) for UI copy.
10. Expand WS authorize tests when new scopes ship; keep `authorizeWebSocketSubscribe` in same commit as REST changes (per strategic guidance).
11. Add integration test matrix for permission table above.
12. Document hub-vs-bridge split in `03-permission-systems.md` with explicit “legacy hub manage deprecation” plan.

---

## Phase 3 Wave 2 fixes (2026-06-04)

**B-01 partial fix (deployment safety):** Auth fallback is now **fail-closed in production**:

- `allowAuthFallback()` always returns `false` when `NODE_ENV=production` or `C2K_ENV=production`.
- API and worker call `assertAuthFallbackSafeForStartup()` — **refuse startup** if `AUTH_ALLOW_FALLBACK=true`.
- Non-production dev behavior unchanged (fallback on unless explicitly `false`).
- `.env.production.example` requires `AUTH_ALLOW_FALLBACK=false`.

**Not in Wave 2 scope (still blockers):** H-01 hub bypasses command grants.

**Files:** `packages/api/src/lib/production-guard.ts`, `server.ts`, `worker.ts`, `auth/resolve-viewer.ts`.

---

## Phase 3 Wave 3 fixes (2026-06-04)

| Audit finding | Wave 3 resolution |
|---------------|-------------------|
| B-02 Profile email leak | `profile-access.ts`; `GET /api/profile/:username` returns 404 for disallowed PRIVATE; `user.email` owner-only |
| B-03 Participation-offer permission-or | `participation-routes.ts` uses `['registration','scheduler','staff_ops']` array requirement |
| H-01 | Not in Wave 3 scope (hub vs command bridge) |

---

*End of audit 03. Wave 3 fixed profile email and participation-offer fallback.*
