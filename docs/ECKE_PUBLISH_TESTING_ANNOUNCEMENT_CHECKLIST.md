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
- [ ] SQL migrations applied on staging/production
- [ ] Operator production smoke executed (see `scripts/smoke-ecke-publish-complete.mjs`)
- [ ] PRs merged to main/master

**Announce when:** migrations applied + one successful staging smoke per source kind.
