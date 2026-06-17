# Sprint 3 Home Research + Code Context Brief

**Status:** Accepted — CP3 Home polish complete  
**Page group:** Home feed and member dashboard experience

**Routes in scope for implementation:**

- `/home`

**Routes in audit context only:**

- `/feed` redirect behavior if relevant
- `/explore` as the strongest visual benchmark
- `/profile` only for profile completion and identity context
- `/events`, `/groups`, `/vendors`, `/education`, `/media` only where Home surfaces their cards or rail previews

**Implementation status:**

- Do not implement Home visual changes until this brief is reviewed and accepted.
- Home implementation must be one scoped commit after brief acceptance.
- Do not bundle Home polish with Events, Groups, Vendors, Education, Media, Profile, Messaging, or Notifications polish.

---

## 1. Product pattern classification

Home is not a generic dashboard.

Home is a mixed product surface:

- social feed
- community dashboard
- personalized discovery surface
- next-useful-action surface
- trust and safety surface
- onboarding reinforcement surface
- lightweight cross-product launcher

Home is where the site should feel alive. It should help members catch up, post, discover, and decide what to do next.

The Home page should feel like a social command center for kink.social, not an admin console, not a generic SaaS dashboard, and not a wall of identical posts.

---

## 2. Research-backed principles

References: [NN/g social feed overload](https://www.nngroup.com/articles/social-media-research-insights/), [NN/g recommendation guidelines](https://www.nngroup.com/articles/recommendation-guidelines/), [customizable feed controls (arXiv)](https://arxiv.org/abs/2509.19615), [WCAG 2.2](https://www.w3.org/TR/WCAG22/).

### Social feeds should reduce overload

A feed can quickly become noise. The Home page should reduce overload by giving members a clearer sense of:

- what changed
- who posted
- what kind of content it is
- why it matters
- what action is available

The feed should not force users to visually parse every card from scratch.

### Feed agency matters

The existing Home scope tabs are a strength:

- Following
- Near you
- Trending

These tabs give users control over the kind of feed they are seeing. That control should be visually legible and should not be buried.

Home should explain the difference between:

- **Following:** people and communities the user chose
- **Near you:** local activity and nearby discovery
- **Trending:** active content across the network

The goal is not a complicated algorithm explainer. The goal is a clear enough mental model that users feel oriented.

### The feed should not be a wall of identical posts

A social community operating system should mix content types carefully.

Home can include member posts, event cards, group cards, education cards, media cards, vendor cards, people suggestions, and next-useful-action cards — but the visual hierarchy must make each type understandable.

### Composer should invite contribution without dominating

The composer is a core social action. It should feel inviting and safe, but it should not overwhelm returning members who came to read.

The Home code already supports a compact returning-member mode. That is the right direction.

Do not change composer behavior in the polish pass.

### Recommendations should explain themselves

Suggested people, events, groups, vendors, education, and media should not feel random. Each suggestion surface should answer: why this is here, what it is, what the user can do next.

### Rails should support orientation

Left and right rails should help members orient and act — not feel like dashboard clutter.

### Safety and adult-community trust must remain visible

Preserve report, save, mute/block where present, visibility cues, profile trust context, content type badges, and adult/safety visibility behavior.

### Accessibility is part of polish

Readable contrast, visible focus, touch-safe targets, semantic headings, keyboard-safe controls, no nested buttons, no horizontal overflow.

---

## 3. kink.social-specific user job

A member comes to Home to answer:

- What happened since I last checked?
- Has anyone I follow posted?
- What is happening near me?
- Are there upcoming events I should consider?
- Are there groups I should join or revisit?
- Is there education I should read? Media worth checking out? Vendors relevant to me?
- Who might I connect with?
- What should I do next?
- Can I safely post something here?

Home should reduce the sense of being dropped into a feature warehouse and make kink.social feel like one living community system.

---

## 4. Current code context

### Main route and page

**Primary file:** `packages/web/src/app/home/HomePageClient.tsx`

Current responsibilities: search params, Following vs Discover mode, directory tab redirects, feed fetch/map, education/media loads, `useHomeSurface`, three-column feed shell vs discover tabs, right rail content assembly.

**Implementation warning:** `HomePageClient.tsx` is dense. Keep changes small and local. Do not rewrite the Home state model.

### Feed component

**Primary file:** `packages/web/src/components/home/LocalHomeFeed.tsx`

Polish through components passed into `FeedTemplate`, not by rewriting the feed.

### Feed template

**Primary file:** `packages/web/src/components/templates/FeedTemplate.tsx`

Supports composer, tabs, feed children, footer, feed-first mode. Avoid changing layout behavior globally unless safe.

### Feed card

**Primary file:** `packages/web/src/components/cards/LocalPostCard.tsx`

Has actor, badge, timestamp, mentions, attachments, reactions, discuss, repost, share, report, save. Improve hierarchy only — do not change behavior.

### Feed scope nav

**Primary file:** `packages/web/src/components/home/HomeFeedScopeNav.tsx`

Following, Near you, Trending — mobile in CommunityNavBar, desktop in three-column shell. Do not change hrefs or mode resolution.

### Rails

- `packages/web/src/components/home/HomeDashboardLeftRail.tsx` — orientation; `omitHomeLink` on desktop
- `packages/web/src/components/home/HomeFeedDiscoverRail.tsx` — next-action discovery; existing data only

### Composer (visual only)

- `HomeFeedRichComposer.tsx`, `HomeFeedShellComposer.tsx`, `HomeFeedMockComposer.tsx`

Do not alter submission, upload, validation, visibility defaults, or API calls.

### Additional Home cards

- `HomeUpcomingEventCard.tsx`, `HomeFeedSuggestedPerson.tsx`, `VendorListingMiniCard.tsx`, `TrendingItemCard.tsx`

Distinct recommendation types, not generic sidebar boxes. No new fields or recommendation logic.

### Shared surfaces

`shell-contract.ts`, `card-surface.ts`, `shared-surfaces.css`, `desktop-surfaces.css`, `mobile-polish.css` — do not put desktop polish in `mobile-polish.css`.

---

## 5. Current UX diagnosis

### Likely issues

- Too many content modes compete for attention
- Right rail feels like modules, not a next-action path
- Discover tabs blur Home vs Explore
- Feed cards may not make actor, content type, and next action clear enough
- Education/media/vendor previews can feel like directories inside Home

### Core visual question

Can a member look at the page for 3 seconds and understand their next useful action?

### Mode-specific orientation needs

| Mode | Should communicate |
|------|-------------------|
| Following | Catch up with people and communities |
| Near you | Nearby posts, events, people |
| Trending | Active conversations and community signals |
| Discover | Browse the community OS from one place |

### Mobile diagnosis

Mobile is protected. Do not change bottom nav, CommunityNavBar, feed density, composer flow, scroll padding, or card ordering. Desktop-first unless shared change is explicitly verified.

---

## 6. Safe Home CP3 implementation ideas

1. **Home orientation header** — `HomePageClient.tsx` — compact mode-aware block using `homeMode`, `activeTab`, `returningMember`, `surfaceHeadline`
2. **Feed scope explanation** — `HomeFeedScopeNav.tsx` — helper text on desktop; no href/logic changes
3. **Composer framing** — shell/rich composer — visual wrapper only
4. **Feed card hierarchy** — `LocalPostCard.tsx` — actor, badge, activity line, action row
5. **Right rail next-action hierarchy** — `HomeFeedDiscoverRail.tsx` — group by user job; existing data only
6. **Left rail orientation** — `HomeDashboardLeftRail.tsx` — reduce admin feel
7. **Discover tab helpers** — `HomePageClient.tsx` — mode-aware copy per tab

---

## 7. Risky changes requiring approval

Feed ranking, API calls, mode resolution, composer submission, upload, visibility, moderation, reactions, repost/share/discussion, new recommendation sources, fake activity, sensitive fields, mobile layout/composer/nav changes, directory redirects, onboarding behavior.

---

## 8. Hard no-change list

Routes, auth, API, data fetching, schema, permissions, feed ranking, home mode resolution, active tab routing, directory redirects, composer behavior, post creation, upload, visibility, moderation, report/block/mute, reaction/repost/share/discussion/save, notifications/messaging, onboarding, mobile layout, bottom nav, mobile composer/cards, drawers/sheets/modals.

---

## 9. Acceptance criteria

### Social command center

- Desktop user understands Home as community command center within ~3 seconds
- Current mode is obvious; feels social, not admin

### Feed agency

- Following / Near you / Trending remain understandable; no behavior changes

### Contribution

- Composer inviting but not dominant; behavior unchanged

### Feed scanability

Cards make clear: actor, context, timestamp, content type, body/media, reactions, discussion, share/repost, safety actions

### Discovery

Rails answer what is suggested, why it matters, next action — no fake data

### Trust, mobile, accessibility

Safety affordances accessible; mobile density unchanged; no duplicate H1, nested interactives, or contrast regressions

---

## Recommended Home CP3 implementation pass

After acceptance, one Home-only pass in this order:

1. Home orientation header — `HomePageClient.tsx`
2. Feed scope presentation — `HomeFeedScopeNav.tsx`
3. Composer framing — `HomeFeedShellComposer.tsx` / `HomeFeedRichComposer.tsx`
4. Feed card hierarchy — `LocalPostCard.tsx`
5. Right rail — `HomeFeedDiscoverRail.tsx`
6. Left rail — `HomeDashboardLeftRail.tsx`
7. Docs — `docs/UI_DESKTOP_SPRINT_3.md`

Stop after Home. One commit.

---

## Verification plan for Home CP3

Run: `npm run typecheck -w web`, `npm run build -w web`, focused Home smoke if available.

Inspect: `/home`, `/home?mode=following`, `/home?mode=discover`, discover tabs (Events, Groups, Vendors, Education, Media), `/explore` as benchmark.

Widths: 375–1920 matrix per Sprint 3 spec.

Report: files changed, principles applied, behavior preserved, mobile impact, verification, screenshots, regressions, next page group.
