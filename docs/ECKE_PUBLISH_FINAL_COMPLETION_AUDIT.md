# ECKE Publish — Final Completion Audit

Last updated: 2026-06-25 (ecke-publish-complete-testing-ready branch)

## Summary

ECKE Publish parity is **testing-ready** after this pass: kink.social unified control plane covers all required source kinds; EastCoast listing webhook consumes organization, convention, presenter, venue, and group entities; public index/detail routes and sitemap entries exist for each listing type.

**Before production smoke:** apply SQL migrations on both sides (`packages/api/sql-drafts/ecke_presenter_venue_publish.sql` on kink.social; `database/kink_social_002_extended_listings.sql` on EastCoast).

## Completion matrix

| Source kind | kink.social source | ECKE storage | ECKE page/listing | Preview | Publish | Sync | Unpublish | Permission | Smoke status | Complete? |
| ----------- | ------------------ | ------------ | ----------------- | ------- | ------- | ---- | --------- | ---------- | ------------ | --------- |
| group_listing | `groups` | `group_listings` | `/groups`, `/groups/[slug]` | yes | yes | yes | yes | group/org mod | checklist | yes |
| event_listing | `events` (standalone) | `events` (Supabase) | `/events/[slug]` | yes | yes | yes | yes | group mod | checklist | yes |
| education_article | `education_articles` | `articles` | `/education/[slug]` | yes | yes | yes | yes | author | checklist | yes |
| vendor_profile | `vendor_profiles` | `vendors` | `/vendors/[slug]` | yes | yes | yes | yes | owner/co-owner | checklist | yes |
| organization_listing | `organizations` | `organization_listings` | `/organizations`, `/organizations/[slug]` | yes | yes | yes | yes | org mod | checklist | yes |
| dungeon_profile | org dungeon flag | `dungeons` + listing | `/dungeons/[slug]` | yes | yes | yes | yes | org mod | checklist | yes |
| venue_profile | `community_places` | `venue_listings` | `/venues`, `/venues/[slug]` | yes | yes | yes | yes | submitter/org mod | checklist | yes |
| convention_listing | `conventions` | `convention_listings` | `/conventions`, `/conventions/[slug]` | yes | yes | yes | yes | convention full admin | checklist | yes |
| ecke_event / convention_event_anchor | convention + anchor | `events` row | `/events/[slug]` | yes | yes | yes | partial* | convention full admin | checklist | yes* |
| dancecard_event | convention bundle | Dancecard tables | `/dancecard/[slug]` | yes | yes | yes | yes | convention full admin | checklist | yes |
| dancecard_location | (bundle) | Dancecard | (bundle page) | yes | yes | yes | yes | convention full admin | checklist | yes |
| dancecard_program_slot | (bundle) | Dancecard | (bundle page) | yes | yes | yes | yes | convention full admin | checklist | yes |
| dancecard_staff_shift | (bundle) | Dancecard | (bundle page) | yes | yes | yes | yes | convention full admin | checklist | yes |
| presenter_profile | `presenter_profiles` | `presenter_listings` | `/presenters`, `/presenters/[slug]` | yes | yes | yes | yes | presenter owner | checklist | yes |

\*Convention event anchor remote unpublish still uses legacy ecke_event draft flip for full remote removal; local control plane shows status/preview/sync/publish.

## CI check-db finding

PR #18 merge `check-db` failure: `notifications-db.test.ts` — `relation "users" does not exist`. **Not introduced by ECKE publish.** CI Postgres job does not run migrations before that test. **Does not block** ECKE unit tests or ECKE publish feature deploy if production DB is migrated normally.

## Revalidation (EastCoast)

Listing webhook upsert/unpublish calls `revalidatePath` on affected detail and index routes via `kinkSocialListingProjection.ts`.

## Remaining limitations

1. SQL migrations must be applied before presenter/venue/extended listing columns work in production.
2. Full operator production smoke not executed in this session (checklist + script provided).
3. Convention event anchor remote unpublish message directs operators to legacy path for full draft flip when needed.
