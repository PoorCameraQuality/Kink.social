# LEGAL-ALPHA-1 — Cursor orchestration (parallel subagents)

**Status:** Ready to run  
**Backlog:** [`BACKLOG_QUEUE.md`](../BACKLOG_QUEUE.md) § LEGAL-ALPHA-1  
**Master plan:** [`LEGAL-PROFILE-TRUST-SAFETY-MASTER-PLAN.md`](../LEGAL-PROFILE-TRUST-SAFETY-MASTER-PLAN.md)  
**Decisions:** [`PROJECT_DECISIONS.md`](../PROJECT_DECISIONS.md)

Grounded in current state: `LEGAL-ALPHA-1` is the next pending compliance slice (policy pages, DMCA, legal intake UI, admin MFA, export/delete, vendor enforcement). Acceptance criteria require public policy pages, DMCA case handling, legal request/hold UI, legal-hold-aware deletion, privileged MFA, export/delete foundation, vendor registry enforcement, audit logs, and green verification gates.

---

## How to run with parallel Cursor subagents

Use **one coordinator branch** and **5 focused subagent branches/worktrees**.

```bash
git status --short
git checkout -b legal-alpha-1
```

Create parallel worktrees:

```bash
git worktree add ../c2k-la1-schema -b la1/schema
git worktree add ../c2k-la1-api -b la1/api
git worktree add ../c2k-la1-policy-web -b la1/policy-web
git worktree add ../c2k-la1-admin-ui -b la1/admin-ui
git worktree add ../c2k-la1-verify -b la1/verify
```

Open each worktree in its own Cursor window. Give each subagent only its lane prompt below. Split reduces file conflicts: schema first, API second, web policy pages third, admin/settings UI fourth, verification/docs last.

**Merge order** into `legal-alpha-1`:

```bash
git checkout legal-alpha-1

git merge la1/schema
npm test

git merge la1/api
npm test

git merge la1/policy-web
npm run build

git merge la1/admin-ui
npm run build

git merge la1/verify
npm run verify:trust-safety
npm run verify:prelaunch
npm test
npm run build
```

Project decisions require `verify:trust-safety`, `verify:prelaunch`, `npm test`, and `npm run build` green before calling the worker done.

**Coordinator-only files** — do not let more than one subagent edit at the same time:

- `packages/api/src/db/schema.ts`
- `packages/api/src/server.ts`
- `packages/web/src/router.tsx`
- `packages/web/src/config/site.config.ts`
- `package.json` (root and workspaces)

---

## Main Cursor coordinator prompt

Paste into the coordinator window on branch `legal-alpha-1`:

```text
You are the coordinator for C2K LEGAL-ALPHA-1.

Project: Coast to Coast Kink, an organizer-first adults-only community operating system. Do not frame this as a porn marketplace or a FetLife clone. The alpha posture is community_only. Explicit media remains off in alpha. Production scanners fail closed. Explicit + PUBLIC_PREVIEW coercion to logged_in is intentional and must not be changed.

Authoritative docs to respect:
- docs/LEGAL-PROFILE-TRUST-SAFETY-MASTER-PLAN.md
- docs/BACKLOG_QUEUE.md section LEGAL-ALPHA-1
- docs/PROJECT_DECISIONS.md
- docs/privacy/LEGAL-RISK-PRINCIPLE.md
- docs/privacy/data-inventory.md
- docs/privacy/vendor-registry.md
- docs/FEATURE_REGISTRY.md
- docs/plans/LEGAL-ALPHA-1-ORCHESTRATION.md

Goal:
Implement LEGAL-ALPHA-1: close alpha compliance gaps with boring legal/compliance plumbing.

Scope:
1. Published policy pages
2. DMCA workflow
3. Legal-request intake UI
4. Admin MFA enforcement foundation
5. User export/deletion foundation
6. Vendor registry enforcement
7. Verification scripts/tests/docs

Hard rejects:
- Do not implement PhotoDNA.
- Do not implement NCMEC API submission.
- Do not fake StopNCII or Take It Down integrations.
- Do not build full T&S UI-2 redesign.
- Do not enable production explicit media.
- Do not enable explicit video uploads.
- Do not add Stripe/payments/checkout.
- Do not collect real names, government IDs, precise locations, or ID documents.
- Do not create parallel moderation/legal systems when existing tables/routes can be extended.
- Do not delete records under active legal hold.
- Do not allow sensitive admin/legal actions without role + reason + audit log.

Architecture constraints:
- Extend-before-add.
- One users row; every user-owned write sets user_id.
- Prefer column → JSONB → pattern row → new table.
- Side effects after commit via workers, not inline in route handlers.
- Use existing moderation audit helper where possible.
- Use incremental migration path, not drizzle-kit push.
- Add hooks as useApi[Domain].ts before page components.
- New routes must be registered in server.ts.
- Web routes must be registered in router.tsx.
- Footer/signup/admin policy links should use site.config.ts where possible.

Acceptance criteria:
- Public policy pages exist and are linked from footer, signup, and admin/legal surfaces.
- Signup records active policy versions.
- DMCA page exists with takedown, counter-notice, repeat-infringer, and contact/intake language.
- DMCA case model exists.
- Admins can disable/restore content from a DMCA case.
- Legal request model/UI exists.
- Legal hold can be created from legal request UI.
- Destructive deletion respects active legal hold.
- Admin MFA is required/foundation-enforced for SITE_ADMIN, TRUST_SAFETY_ADMIN, and LEGAL_ADMIN.
- User export/deletion has foundation API/UI; v1 JSON export is fine.
- Vendor registry exists and new vendor integrations require registry documentation.
- Sensitive admin/legal actions are audited.
- Add/update verification scripts:
  - npm run verify:trust-safety:legal-profile
  - npm run verify:trust-safety:dmca
  - npm run verify:trust-safety:admin-security
  - npm run verify:trust-safety:privacy
- Existing gates remain green:
  - npm run verify:trust-safety
  - npm run verify:prelaunch
  - npm test
  - npm run build

Parallel subagent plan:
- Subagent A: schema/migration/types
- Subagent B: API/legal workflows
- Subagent C: public policy pages/signup/footer
- Subagent D: admin/settings UI
- Subagent E: verification/docs

Do not let subagents overwrite each other. Prefer additive files. Only coordinator should resolve overlapping changes in schema.ts, server.ts, router.tsx, site.config.ts, and package.json.
```

---

## Subagent A — schema, migration, roles, data model

```text
You are Subagent A for LEGAL-ALPHA-1. Own schema, migration, and minimal shared/domain types only.

Read:
- docs/LEGAL-PROFILE-TRUST-SAFETY-MASTER-PLAN.md
- docs/BACKLOG_QUEUE.md section LEGAL-ALPHA-1
- docs/PROJECT_DECISIONS.md
- docs/plans/LEGAL-ALPHA-1-ORCHESTRATION.md
- packages/api/src/db/schema.ts
- packages/api/src/lib/platform-staff.ts
- packages/api/scripts/apply-incremental-migration.ts if needed

Your task:
Add the minimum data model needed for LEGAL-ALPHA-1 without creating unnecessary parallel systems.

Implement/foundation:
1. DMCA case model.
2. Legal request model.
3. Legal hold model extension only if current schema is insufficient.
4. User export/deletion request foundation.
5. Admin MFA foundation for privileged platform roles.
6. Platform staff role expansion for SITE_ADMIN, MODERATOR, TRUST_SAFETY_ADMIN, LEGAL_ADMIN if needed.
7. Vendor registry enforcement metadata if current docs-only registry is insufficient.

Rules:
- Extend existing schema patterns.
- Do not add payments, Stripe, vendor_accounts, presenter_users, guest checkout, or a second moderation stack.
- Do not store government IDs or ID documents.
- Legal holds must block deletion.
- Sensitive legal/admin models should have actor_user_id, reason, status, created_at, updated_at where appropriate.
- Add indexes for common admin lookup: status, target, user, created_at.
- Keep enum names clear and stable.
- Prefer JSONB for scoped/export metadata over lots of premature tables.

Likely tables/enums:
- dmca_cases
- legal_requests (extend existing stub if needed)
- user_privacy_requests or user_data_requests
- maybe admin_mfa_challenges/admin_security_state if no existing auth MFA foundation exists
- update platform_staff_role enum if needed

Deliverables:
- schema.ts changes
- incremental migration support if required
- platform-staff.ts role helpers updated if role enum expands
- unit tests or schema-level tests if pattern exists

Do not touch:
- Public policy page UI
- Admin React pages
- API route implementations except tiny type exports if needed
- PhotoDNA/NCMEC/StopNCII/video/scanner work

Run:
npm test
npm run build -w @c2k/api
```

---

## Subagent B — API/legal workflow routes

```text
You are Subagent B for LEGAL-ALPHA-1. Own API routes/libs for DMCA, legal requests, legal holds, export/delete foundation, and vendor enforcement.

Read:
- docs/BACKLOG_QUEUE.md section LEGAL-ALPHA-1
- docs/PROJECT_DECISIONS.md
- docs/plans/LEGAL-ALPHA-1-ORCHESTRATION.md
- packages/api/src/server.ts
- packages/api/src/routes/moderation-ts-admin.ts
- packages/api/src/lib/legal-hold.ts
- packages/api/src/lib/retention-sweep.ts
- packages/api/src/lib/moderation-audit.ts
- packages/api/src/lib/platform-staff.ts
- packages/api/src/db/schema.ts

Existing facts:
- isUnderLegalHold(targetType, targetId) already exists and returns true when an active legal hold covers a target.
- recordModerationAudit() already inserts moderation_audit_events.
- Retention sweep is non-destructive and currently logs planned purges.
- Existing admin moderation routes require platform moderator access.

Your task:
Build backend LEGAL-ALPHA-1 workflow foundation.

Implement:
1. Public DMCA intake endpoint or authenticated-safe intake endpoint, depending existing auth patterns.
2. Admin DMCA endpoints:
   - list cases
   - read case
   - create/update status
   - disable content placeholder/action
   - restore content placeholder/action
   - mark repeat-infringer review
3. Legal request endpoints:
   - list legal requests
   - create legal request
   - read/update request
   - create legal hold from request
   - release legal hold if role permits
   - scoped export placeholder
4. User privacy/export/delete endpoints:
   - request v1 JSON export
   - download/read own v1 JSON export if practical
   - request account deactivation/deletion
   - block destructive deletion when isUnderLegalHold('user', userId) is true
5. Vendor registry enforcement:
   - add a guard/helper that prevents new vendor integrations unless registered in docs/privacy/vendor-registry.md or a schema-backed registry if Subagent A adds one
   - do not add any new external vendor
6. Audit:
   - every sensitive DMCA/legal/admin/privacy action must call recordModerationAudit()
   - include actor, verb, target, reason, and minimal payload
7. Register routes in server.ts.

Access rules:
- SITE_ADMIN can access all.
- LEGAL_ADMIN can access legal request/hold/export/delete workflows.
- TRUST_SAFETY_ADMIN can access DMCA/moderation-adjacent workflows.
- MODERATOR should not automatically get legal admin unless existing project policy says so.
- Sensitive actions require a reason string.
- MFA enforcement should call the helper/foundation from Subagent A/D if available. If MFA is not fully built, return a clear 403/step-up-required structure for privileged actions.

Do not implement:
- actual external DMCA provider integration
- NCMEC API
- PhotoDNA
- StopNCII/Take It Down API
- full destructive hard purge
- explicit media expansion
- video uploads
- payments

Deliverables:
- new route modules where appropriate, e.g. routes/legal-requests.ts, routes/dmca-routes.ts, routes/privacy-requests.ts
- new lib helpers where appropriate
- server.ts registration
- tests for access, audit, legal-hold block, and basic happy paths

Run:
npm test
npm run build -w @c2k/api
```

---

## Subagent C — public policy pages, signup, footer

```text
You are Subagent C for LEGAL-ALPHA-1. Own public policy pages and signup/footer links.

Read:
- docs/LEGAL-PROFILE-TRUST-SAFETY-MASTER-PLAN.md
- docs/privacy/LEGAL-RISK-PRINCIPLE.md
- docs/privacy/data-inventory.md
- docs/privacy/vendor-registry.md
- docs/plans/LEGAL-ALPHA-1-ORCHESTRATION.md
- packages/web/src/router.tsx
- packages/web/src/config/site.config.ts
- packages/web/src/components/Footer.tsx
- packages/web/src/components/LoginCard.tsx

Your task:
Create public policy pages and wire them into footer/signup/admin-accessible navigation.

Pages to add/update:
- /terms
- /privacy
- /guidelines or /community-guidelines
- /adult-content-consent
- /law-enforcement
- /dmca
- /ncii
- /vendor-organizer-terms
- /minor-safety

Content rules:
- Plain human-readable copy.
- State adults-only 18+ posture.
- State explicit media is not public and not enabled in alpha.
- State scanners are signals and humans decide moderation.
- State lawful compliance minimization: collect less, retain less, legal holds block deletion.
- DMCA page should include takedown notice, counter-notice, repeat-infringer policy, and contact/intake instructions.
- NCII page should describe reporting and re-upload prevention goals without pretending StopNCII/Take It Down integration exists.
- Law enforcement page should describe legal request process and preservation holds without saying C2K evades lawful process.
- Minor safety page should be strict: minors are not allowed; suspected minor safety issues are escalated for human review.
- Add "not legal advice" wording where appropriate and note policies are subject to lawyer review if needed.

Signup:
- LoginCard already requires ageAffirmed and termsAccepted.
- Add visible links to active Terms, Privacy, Community Guidelines, and Adult Content/Consent.
- Do not collect DOB, real name, ID, or address.
- Ensure signup payload still sends ageAffirmed and termsAccepted.
- If API supports policyVersionAccepted, make sure frontend can present the active policy version clearly.

Footer:
- Use site.config.ts footer legal links.
- Footer should include all key legal/policy pages.

Router:
- Register new pages in router.tsx.
- Prefer simple, reusable PolicyPage layout/component.

Do not touch:
- API schema/routes
- Admin React legal workflow pages
- Scanner/media logic
- Payments

Run:
npm run build
```

---

## Subagent D — admin/legal/settings UI

```text
You are Subagent D for LEGAL-ALPHA-1. Own admin and user-facing UI for legal/DMCA/privacy requests.

Read:
- docs/BACKLOG_QUEUE.md section LEGAL-ALPHA-1
- docs/plans/LEGAL-ALPHA-1-ORCHESTRATION.md
- packages/web/src/router.tsx
- packages/web/src/app/moderation/*
- packages/web/src/hooks/useApiModerationTs.ts if relevant
- packages/web/src/app/settings/*
- packages/web/src/config/site.config.ts

Your task:
Create basic UI for LEGAL-ALPHA-1 without building full T&S UI-2.

Admin UI foundation:
1. DMCA admin page:
   - list DMCA cases
   - detail view
   - status update
   - disable/restore content action buttons
   - required reason input before sensitive action
2. Legal requests page:
   - list legal requests
   - create/read/update legal request
   - create legal hold from request
   - release hold if allowed
   - scoped export placeholder button
   - required reason input
3. Admin security/MFA notices:
   - privileged legal/admin pages should show MFA-required/step-up-needed state when API returns it
   - do not build a full auth-provider MFA product unless backend foundation already supports it

User settings UI:
1. Add privacy/export/delete foundation under settings:
   - request v1 JSON export
   - request deactivation/deletion
   - clear warning that deletion may be delayed/blocked by active legal hold
2. Do not promise instant deletion.
3. Do not show internal legal-hold details to normal users.

Navigation:
- Add admin links only where platform staff/admin navigation already exists.
- Do not redesign full moderation UI.
- Do not add duplicate global nav.

Hook pattern:
- Create useApiLegalRequests.ts, useApiDmca.ts, useApiPrivacyRequests.ts or similar before page components.
- Handle loading, error, retry, empty states.
- Keep UI simple and alpha-ready.

Do not touch:
- Backend schema
- Public policy copy except linking
- Full T&S UI-2
- Payment/Stripe
- PhotoDNA/NCMEC/StopNCII/video

Run:
npm run build
```

---

## Subagent E — verification, tests, docs, final guardrails

```text
You are Subagent E for LEGAL-ALPHA-1. Own verification scripts, tests, and doc updates.

Read:
- package.json
- scripts/verify-trust-safety*.mjs
- docs/BACKLOG_QUEUE.md
- docs/LEGAL-PROFILE-TRUST-SAFETY-MASTER-PLAN.md
- docs/PROJECT_DECISIONS.md
- docs/plans/LEGAL-ALPHA-1-ORCHESTRATION.md
- docs/privacy/data-inventory.md
- docs/privacy/vendor-registry.md
- docs/FEATURE_REGISTRY.md
- verify logs if present

Your task:
Add verification coverage for LEGAL-ALPHA-1 and update docs accurately.

Add/update scripts:
- npm run verify:trust-safety:legal-profile
- npm run verify:trust-safety:dmca
- npm run verify:trust-safety:admin-security
- npm run verify:trust-safety:privacy

Tests should cover:
1. Policy routes exist/build.
2. Signup still requires ageAffirmed and termsAccepted.
3. DMCA routes require correct roles/reasons.
4. DMCA sensitive actions audit.
5. Legal request/hold routes require legal/admin role and audit.
6. Deletion/export foundation blocks destructive deletion under legal hold.
7. Privileged admin routes require MFA foundation or return clear step-up-required response.
8. Vendor registry enforcement guard works.
9. No explicit media alpha policy regression.
10. No public explicit media exposure regression.

Docs:
- Update BACKLOG_QUEUE.md LEGAL-ALPHA-1 status only if all acceptance criteria pass.
- Update LEGAL-PROFILE-TRUST-SAFETY-MASTER-PLAN.md phase statuses honestly.
- Update privacy/data-inventory.md if new tables/data are added.
- Update privacy/vendor-registry.md only for actual vendor registry process/enforcement; do not invent vendors.
- Update FEATURE_REGISTRY.md for new routes/pages.
- Update PROJECT_DECISIONS.md only if a real decision changed.

Do not:
- Mark PhotoDNA/NCMEC/StopNCII/Take It Down as implemented.
- Claim full deletion/purge pipeline if only foundation exists.
- Claim full MFA if only step-up foundation exists.
- Claim legal compliance complete.
- Add fake passing scripts that do not test anything meaningful.

Final verification:
npm run verify:trust-safety
npm run verify:trust-safety:legal-profile
npm run verify:trust-safety:dmca
npm run verify:trust-safety:admin-security
npm run verify:trust-safety:privacy
npm run verify:prelaunch
npm test
npm run build
```

---

## Final integration prompt (after all subagents merge)

Paste on branch `legal-alpha-1` after merging subagent branches:

```text
You are now the LEGAL-ALPHA-1 integration reviewer.

Review the merged work against the acceptance criteria in docs/BACKLOG_QUEUE.md section LEGAL-ALPHA-1.

Check specifically:
- Public policy pages exist and are linked from footer/signup/admin.
- Signup records active policy versions or clearly presents the active policy version if backend support is partial.
- DMCA case model and workflow exist.
- DMCA disable/restore actions exist and require role + reason + audit.
- Legal request UI/model exists.
- Legal hold can be created from legal request UI.
- Destructive deletion respects active legal hold.
- Admin MFA is required or enforced as step-up-required foundation for SITE_ADMIN, TRUST_SAFETY_ADMIN, LEGAL_ADMIN.
- User export/deletion foundation route/UI exists.
- Vendor registry enforcement exists.
- All sensitive admin/legal actions audit via moderation_audit_events or approved shared audit helper.
- No PhotoDNA/NCMEC/StopNCII/Take It Down integrations were faked.
- No public explicit media or explicit video expansion happened.
- No Stripe/payment registration work was added.
- No duplicate moderation/legal stacks were created unnecessarily.
- Docs were updated honestly and do not overclaim.

Then run:
npm run verify:trust-safety
npm run verify:trust-safety:legal-profile
npm run verify:trust-safety:dmca
npm run verify:trust-safety:admin-security
npm run verify:trust-safety:privacy
npm run verify:prelaunch
npm test
npm run build

If any command fails, fix it. If any acceptance criterion is only partially implemented, document it clearly instead of pretending it is complete.
```

---

## Merge discipline summary

| Order | Branch | Owns |
|-------|--------|------|
| 1 | `la1/schema` | schema, migration, platform-staff roles |
| 2 | `la1/api` | routes, libs, server.ts registration |
| 3 | `la1/policy-web` | public policy pages, footer, signup links |
| 4 | `la1/admin-ui` | admin legal/DMCA UI, settings export/delete |
| 5 | `la1/verify` | verify scripts, tests, doc updates |

**Coordinator resolves conflicts only in:** `schema.ts`, `server.ts`, `router.tsx`, `site.config.ts`, `package.json`.
