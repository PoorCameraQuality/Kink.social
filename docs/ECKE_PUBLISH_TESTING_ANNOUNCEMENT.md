# ECKE Publish — Alpha Testing Announcement (draft)

**Subject:** ECKE Publish testing is open for alpha organizers and profile owners

**Product model (Phase 0):** See [`KINK_SOCIAL_ECKE_PUBLISH_MIGRATION.md`](./KINK_SOCIAL_ECKE_PUBLISH_MIGRATION.md). ECKE publishes **public outcomes** from kink.social — not organization profile pages.

We are ready for **controlled alpha testing** of ECKE Publish — preview exactly what will appear on [East Coast Kink Events](https://eastcoastkinkevents.com) before it goes public.

## Four primary public surfaces

| Surface | What publishes | ECKE URL pattern |
| --- | --- | --- |
| **Events** | Standalone public events; conventions (Convention badge) | `/events/{slug}` |
| **Places** | Community place / venue listings | `/dungeons/{slug}` |
| **Vendors** | Public vendor shop profiles with ECKE opt-in | `/vendors/{slug}` |
| **Education** | Published articles with ECKE opt-in | `/education/{slug}` |

Each target shows **Preview**, **will publish**, **will not publish**, and **deferred** fields before you publish.

## Low-priority / legacy (optional)

- **Group listings** — thin public listing when group owner opts in (legacy webhook)
- **Presenter profiles** — thin public listing when presenter opts in (legacy webhook)

## Not ECKE publish targets

- **Organization profile pages** — orgs publish events, places, vendors, and education they produce
- **Dancecard program data** — stays on kink.social; ECKE event pages may **link** to Dancecard when enabled
- **Org-scoped dungeon rows** — use **Places** from community place settings instead

## Who should test

- Group and org moderators (events, education, featured vendors, place listings)
- Convention full admins (publish to ECKE **Events**)
- Vendors with public profiles
- Presenters with public directory profiles (optional)
- Place submitters or org moderators for published community places
- Education authors

## What to check

1. Open the ECKE panel for your entity (group/org/convention/vendor/place/presenter/education writer).
2. Run **Preview** and confirm private fields are listed under **will not publish**.
3. **Publish**, open the ECKE URL, confirm public page looks correct.
4. Edit a public field on kink.social, confirm **stale** status, then **Sync**.
5. **Unpublish** and confirm the ECKE page disappears or shows unpublished state.

## What should never appear publicly

Member rosters, RSVP/attendee lists, private addresses, hidden access instructions, staff notes, private contact, legal names (unless explicitly public), payment data, runner-only presenter materials, application answers, Dancecard program internals, or anything marked private/member-only.

If you see any of these on ECKE, **stop and report immediately**.

## How to report issues

Reply in the alpha channel with: entity type, kink.social URL, ECKE URL, what you expected, and what appeared. Mark **urgent** if private data may have leaked.

## Important

This is **alpha**. Only publish when you **intend** public visibility. Unpublish when testing is done. ECKE pages may be indexed by search engines once published.
