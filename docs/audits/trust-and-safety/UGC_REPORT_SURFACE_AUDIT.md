# UGC report surface audit

**Date:** 2026-06-06  
**Status:** **Complete (moderation alpha pass)** — all API-backed surfaces wired; deferrals documented below.  
**Intake:** `ReportAction` → `TsReportModal` → `useSubmitReport` → `POST /api/v1/moderation/reports`  
**Registry:** `packages/web/src/lib/moderation/report-labels.ts`

## Summary

| Status | Count |
|--------|-------|
| Wired (ReportAction) | 20+ route families |
| Deferred (mock / no stable id) | 6 |
| Redirect-only (/support link) | 2 |

## Wired surfaces

| Route | Component | UGC type | targetType | targetId source | ReportAction |
|-------|-----------|----------|------------|-----------------|--------------|
| `/profile/:username` | `profile/[username]/page.tsx` | Profile, photos | `profile`, `media_asset`, `profile_photo` | user id, asset id | TsReportModal (profile actions) |
| `/home`, `/share/post/:id`, `/saved` | `LocalPostCard` | Feed post | `feed_post` | `post.id` (api only) | yes |
| `/groups/:id?tab=Forums` | `GroupForumsSection` | Thread/post | `group_forum_thread`, `group_forum_post` | thread/post uuid | yes |
| `/orgs/:slug` | `OrgHubClient` | Org, forum, chat | `organization`, `platform_organization`, `org_forum_*`, `org_channel_message` | org/thread/post/message id | yes |
| `/events/:id` | `EventDetailClient` | Event entity | `event` | event uuid | yes |
| `/events/:id?tab=Discussion` | `EventDiscussionPanel` | Thread/post | `event_discussion_thread`, `event_discussion_post` | thread/post uuid | yes |
| `/education/:slug` | `education/[slug]/page.tsx` | Article | `education_article` | article uuid | yes |
| `/media/:slug` | `media/[slug]/page.tsx`, `MediaEpisodeList` | Show, episode | `media_show`, `media_episode` | show/episode uuid | yes |
| `/media`, cards | `MediaChannelCard` | Show card | `media_show` | show uuid | yes |
| `/presenters/:username` | `presenters/[username]/page.tsx` | Presenter bio | `presenter` | presenter userId | yes |
| `/people`, `/discovery` | `FindPeopleProfileCard` | Profile card | `profile` | userId | yes |
| `/messaging` | `messaging/page.tsx` | DM message, conversation | `message`, `conversation` | message/conv uuid (api) | yes |
| `/conventions/:slug?tab=Chat` | `ChannelMessageList` | Hub chat | `convention_chat_message` | message uuid | yes |
| `/support` | `PlatformReportForm` | Platform issue | `platform` | `support` | yes (form) |

## Deferred surfaces

| Route | Component | Reason |
|-------|-----------|--------|
| `/groups/:id?tab=Photos` | `GroupPhotosSection` | Mock-only slug groups; no stable API photo ids |
| `/groups/:id?tab=Channels` | `ChannelPostsSection` | Mock channel posts |
| `/groups/:id?tab=Resources` | `GroupResourcesSection` | Mock resources |
| `/home?mode=Following` | `ActivityFeedCard` | Activity verbs need per-type wiring (future) |
| `/tags/:tag` | `tags/[tag]/page.tsx` | Mock local posts |
| Org/presenter review rows | various | Review entity target type not in alpha scope |

## Target type normalization

Legacy UI aliases normalize server-side in `moderation-ts-target-validate.ts`:

- `feed_post` → `post`
- `event_discussion_*` → `group_thread` / `group_reply`
- `org_channel_message` → `org_chat_message`
- `convention_hub_channel_message` → `convention_chat_message`

Canonical types added: `education_article`, `media_show`, `media_episode`, `convention_chat_message`, `conversation`, `platform`.

## Scoped moderation parity

| Scope | Report inbox bridge | Mod actions |
|-------|---------------------|-------------|
| Organization | T&S intake → legacy `reports` | Org panel (triage, hide, lock, ban) |
| Group | T&S intake → legacy `reports` | Group panel (triage, hide, lock, ban, audit) |
| Event | T&S intake → legacy `reports` | Event host hide/lock API |
| Convention chat | Platform T&S case | Staff hide message API |
| Platform T&S | `moderation_cases` | `/moderation/cases` workspace |

## Verification

Run from repo root:

```bash
npm run verify:trust-safety:unit
npm run verify:trust-safety:admin-ui
npm test
npm run build
```
