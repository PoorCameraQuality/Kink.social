# C2K Policy Hub — Architecture

**Status:** LEGAL-ALPHA-1.5 (2026-06-05)  
**Related:** [`FEATURE_REGISTRY.md`](../FEATURE_REGISTRY.md) · [`LEGAL-PROFILE-TRUST-SAFETY-MASTER-PLAN.md`](../LEGAL-PROFILE-TRUST-SAFETY-MASTER-PLAN.md)

## Purpose

The Policy Hub is the member-facing index for Coast to Coast Kink trust, safety, and legal documents. It uses **original C2K language** aligned with alpha posture: organizer-first, adults-only, `community_only` media (explicit off), human moderation, privacy-first defaults.

## Do-not-copy guardrail

When researching competitor policy hubs:

- Use **structure and concept coverage** only (index page, scoped policies, report/appeal flows).
- **Never** copy third-party wording, jurisdiction framing, contact blocks, branding, integration claims, or SLA promises.
- **Never** imply NCMEC API, StopNCII, PhotoDNA, or other integrations we have not shipped.
- All public copy lives in `packages/web/src/app/**/page.tsx` and must read as C2K-native.

## Route structure

| Hub path | Canonical route | Notes |
|----------|-----------------|-------|
| `/policies` | index | Lists all policies from registry |
| `/policies/terms` | `/terms` | alias redirect |
| `/policies/privacy` | `/privacy` | alias redirect |
| `/policies/community-guidelines` | `/guidelines` | alias redirect |
| `/policies/adult-content-and-consent` | `/adult-content-consent` | alias redirect |
| `/policies/minor-safety` | `/minor-safety` | alias redirect |
| `/policies/dmca` | `/dmca` | alias redirect |
| `/policies/ncii` | `/ncii` | alias redirect |
| `/policies/law-enforcement` | `/law-enforcement` | alias redirect |
| `/policies/organizers` | `/vendor-organizer-terms` | alias redirect |
| `/policies/moderator-code-of-conduct` | same | dedicated page |
| `/policies/appeals` | same | dedicated page |
| `/policies/groups` | same | dedicated page |
| `/policies/events` | same | dedicated page |
| `/policies/adult-content-records` | same | UGC platform role (not commercial 2257 producer) |

**Registry:** `packages/web/src/config/policy-registry.ts` — single source for hub listings and verify scripts.

## Standard section format

New and refactored policies use `PolicyStandardPage` (`packages/web/src/components/ui/PolicyStandardPage.tsx`), which wraps `LegalDraftPage` with a shared vocabulary:

1. What this means  
2. What is not allowed  
3. What is allowed / not a violation  
4. How to report  
5. Who can report  
6. What happens next  
7. Escalation path  
8. Last updated  

Pages may omit sections that do not apply. Additional sections (e.g. designated agent, counsel review) append before “Last updated.”

Legacy pages (`/terms`, `/privacy`, `/guidelines`, etc.) remain on `LegalDraftPage` until a focused refactor; they link from the hub via aliases.

## Draft vs published

- `VITE_LEGAL_PUBLISHED=true` hides draft banners and shows effective dates.
- Until counsel approval, all pages show draft posture in UI.

## Verification

- `scripts/verify-trust-safety-policy-hub.mjs` — registry, page files, router aliases, standard component.
- Wired into `scripts/verify-trust-safety-legal-profile.mjs`.

## Navigation entry points

- Footer `site.config.ts` → `footer.legal` (Policies first)
- `LandingLegalStrip` → Policies link
- `LoginCard` signup → “View all policies” → `/policies`
