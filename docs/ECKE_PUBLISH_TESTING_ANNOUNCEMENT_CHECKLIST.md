# ECKE Publish — Testing Announcement Checklist

- [x] All required source kinds in registry with `active_existing` or documented legacy wrap
- [x] kink.social typecheck passes
- [x] ECKE publish unit tests pass (127+ tests)
- [x] EastCoast build passes (after IndexNow import fix)
- [x] EastCoast public routes: `/organizations`, `/conventions`, `/presenters`, `/venues`, `/groups`
- [x] Sitemap includes extended listing types
- [x] Presenter + venue control plane wired
- [x] Convention event anchor visible in `ConventionEckePanel`
- [x] Privacy omissions documented in `ECKE_PUBLISH_PRIVACY_CONTRACT.md`
- [x] Announcement draft in `ECKE_PUBLISH_TESTING_ANNOUNCEMENT.md`
- [x] SQL migrations applied on staging/production (EastCoast Supabase listing tables + VPS `ecke_presenter_venue_publish.sql` applied 2026-06-25)
- [x] Operator production smoke executed — infra 9/9, ECKE index pages 200, group full publish/sync/unpublish loop PASS (`scripts/smoke-ecke-publish-prod.mjs`, `scripts/smoke-ecke-group-listing-ui.mjs`)
- [x] PRs merged to main/master (kink.social #19, EastCoast #6)
- [ ] Convention admin + venue manager each run one publish/unpublish (permission-scoped smokes)
- [ ] GitHub Actions deploy secrets configured (`VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `VPS_DEPLOY_PATH`)

**Announce when:** optional convention/venue operator smokes done, or announce now with “testers with those roles please verify.”
