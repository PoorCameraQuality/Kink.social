# Alpha QA journey (kink.social social platform)

**Last updated:** 2026-06-17  
**Audience:** Project owner, alpha testers, moderators  
**Related:** [`ALPHA_SEED_WORLD.md`](./ALPHA_SEED_WORLD.md) · [`VPS_ALPHA_READINESS.md`](./VPS_ALPHA_READINESS.md) · [`QA_TESTER_GUIDE.md`](./QA_TESTER_GUIDE.md) · [`PILOT_READINESS.md`](./PILOT_READINESS.md) · [`FEATURE_REGISTRY.md`](./FEATURE_REGISTRY.md)

---

## 1. Purpose

This guide is a **repeatable walkthrough** for alpha QA. The goal is to learn whether kink.social feels like a **living kink community platform**, not only a set of directories (events, orgs, places).

You are testing **real product behavior** with honest empty states, privacy rules, and social loops. You are not testing whether every future feature exists.

### Goals

- [ ] Verify onboarding is clear and lands users on Home
- [ ] Verify the **social loop**: post, react, comment, follow, connect, message, get notified
- [ ] Verify **privacy expectations** match what the UI says
- [ ] Verify **messaging and request** flows (Main vs Requests, pending states)
- [ ] Verify **groups and events** feel connected to community life
- [ ] Verify **mobile and desktop** usability for the same journey
- [ ] Collect **useful alpha feedback** (confusion, trust, polish)

---

## 2. Test environment assumptions

| Assumption | Detail |
|------------|--------|
| **Environment** | **Public-facing alpha** on kink.social (or staging). Anyone may visit and browse. This is **not** final public launch. |
| **Registration** | Check `GET /api/auth/registration-policy`. If `inviteRequired: true`, ask the operator for a code. If `registrationOpen: true` and no invite required, registration is open during alpha — still use fictional profile data. |
| **Alpha social seed** | May be present: fictional `alpha_*` users and social content. See [`ALPHA_SEED_WORLD.md`](./ALPHA_SEED_WORLD.md). Do not treat seed personas as real community members. |
| **ECKE event data** | Realistic East Coast event listings may already exist. **Do not delete or reset** that data during QA. |
| **Database** | Testers must **not** run wipe, truncate, or destructive seed scripts. |
| **Personal data** | Use fictional names, `example.test` emails, and broad fake regions. **Do not** use real phone numbers, home addresses, or identifiable photos of real people. |
| **Screenshots** | Blur or crop DMs, notifications, and attendee lists before sharing externally. |

**Operator note:** Run the alpha social seed only on environments where it is intended. Never run it against production without explicit operator approval. See seed doc for guards.

**Visitor vs structured tester:** Casual visitors may already view the site. This journey is for **structured QA** — run internally **before actively promoting alpha testing** or asking people to use the product deeply.

---

## 3. Test accounts

Full seed details: [`ALPHA_SEED_WORLD.md`](./ALPHA_SEED_WORLD.md).

**Default password (when seed is present):** `AlphaSocial!23`  
Override only if the operator set `ALPHA_SOCIAL_SEED_PASSWORD`.

**Email pattern:** `alpha+<username>@example.test`

| Username | Role / persona | What to test | Password source |
|----------|----------------|--------------|-----------------|
| `alpha_social` | Active member | Home, Following, general social loop | Default seed password |
| `alpha_organizer` | Community organizer | Events, org context, connections hub | Default seed password |
| `alpha_newbie` | New sparse profile | Onboarding contrast, pending connection/DM | Default seed password |
| `alpha_mod` | Group moderator | Groups, forum threads, moderation copy | Default seed password |
| `alpha_educator` | Presenter / educator | Presenter profile, education guild group | Default seed password |
| `alpha_vendor` | Vendor demo | Vendor shop surfacing (not checkout) | Default seed password |
| `alpha_connected` | Privacy tester | Connections-only feed posts | Default seed password |
| `alpha_private` | Privacy tester | Only-me feed posts | Default seed password |
| `alpha_quiet` | Low profile | Undiscoverable in People search | Default seed password |
| `alpha_open_dm` | Open messaging | Anyone can request DM | Default seed password |
| `alpha_connections_dm` | Restricted messaging | Connections-only DM + pending inbox | Default seed password |
| `alpha_blocker` | Block initiator | Block behavior | Default seed password |
| `alpha_blocked` | Block target | Hidden from blocker surfaces | Default seed password |
| `alpha_hidden_member` | Private group member | Hidden membership on profile | Default seed password |
| `alpha_photog` | Media creator | Profile richness, vendor adjacency | Default seed password |

If seed is **not** present, register a fresh account (with invite code only if required) and use this guide for structure; privacy table scenarios marked "seed" will be skip or N/A.

---

## 4. Core alpha journey

Work top to bottom once per environment. Check boxes as you go. Note pass/fail in the privacy table (section 5) where relevant.

### A. Registration and login

- [ ] Open the landing page. Value proposition, **alpha status**, and sign-in entry are obvious.
- [ ] Confirm **18+**, Terms, Privacy, and Community/Content Guidelines are reachable before or during signup.
- [ ] If `registrationOpen`: register using fictional profile data; use **invite code only if** `inviteRequired` (check operator or `/api/auth/registration-policy`).
- [ ] If seed exists: log in as `alpha_social` (or your fresh account).
- [ ] Confirm there is no confusing "check your email to continue" dead end unless SMTP is known to be on.
- [ ] On login page: password reset link or copy exists (actual email delivery optional unless operator confirmed SMTP).
- [ ] After login, you reach the app shell (Home or onboarding), not a blank error.

### B. Onboarding

- [ ] Complete profile basics (display name, optional bio).
- [ ] Set location and any privacy choices offered.
- [ ] Add interests or roles if prompted.
- [ ] Copy explains what kink.social is for (community, events, consent-forward norms).
- [ ] Wizard finishes and lands on **Home** (or clear next step).

### C. Home

- [ ] Open `/home` (or app Home route).
- [ ] **Following**, **Local**, and **Discover** (or equivalent tabs/modes) are labeled in plain language.
- [ ] Read **"How Home works"** (or similar guidance). It matches what you see.
- [ ] Signed-in feed shows **real posts only** (no fake demo padding).
- [ ] If feed is sparse, empty state is honest ("follow people", "join groups", not fake cards).
- [ ] Create a short **PG-13 community post** (intro, event question, or group shout-out).
- [ ] **React** and **comment** on an existing post.
- [ ] Privacy-related labels use human wording (not raw enum names like `connections_only`).

### D. People and connections

- [ ] Visit `/people` (or People from nav).
- [ ] Search or filter if available.
- [ ] **Follow** someone.
- [ ] Send a **connection request** to someone else.
- [ ] Review **connection suggestions** (should feel like recommendations, not a random directory slice).
- [ ] **Follow** vs **Connect** copy is distinct and accurate.
- [ ] Empty states suggest useful next steps.
- [ ] As `alpha_social`, confirm `alpha_quiet` does **not** appear in People search (seed scenario).
- [ ] As `alpha_blocker`, confirm `alpha_blocked` does not appear where block rules apply.

### E. Profile

- [ ] Open **your** profile. Edit entry is findable.
- [ ] Open **another member's** profile (e.g. `alpha_organizer`).
- [ ] **Recent posts** appear when the author allows them in feeds/profile rules.
- [ ] You do **not** see implied private posts (only-me, connections-only) without permission.
- [ ] **Follow**, **Connect**, and **Message** actions match relationship state (pending, connected, blocked).
- [ ] **Hidden group membership** does not show on `alpha_hidden_member` public profile (seed).
- [ ] Private or count-only **event attendance** is not exposed on profile inappropriately.

### F. Groups

- [ ] Browse groups (Discover or `/groups`).
- [ ] Join a **public** group (e.g. `alpha-social-regional-hub` if seeded).
- [ ] On join, review privacy options if shown:
  - [ ] Show / hide on member list
  - [ ] Show / hide group on profile (if supported)
  - [ ] Announce / do not announce join in feed (if supported)
- [ ] Open **Forums** tab. Start or open a thread.
- [ ] Open a **group thread deep link** from Home/Following or notifications (copy URL, reopen).
- [ ] As non-member: private group content and private forum threads are **not** visible.
- [ ] Signed-in group page does **not** show fake channels, resources, or photo galleries as if they were real.

### G. Events

- [ ] Browse events (Home Events tab, `/events`, or calendar browse).
- [ ] Open an event detail page (seed alpha event or existing ECKE listing).
- [ ] Host, org, and group context lines are present when applicable.
- [ ] **RSVP** (going, maybe, or waitlist if offered).
- [ ] Read **attendee visibility** copy (`public` names vs count only).
- [ ] Open **event discussion** (forum thread on event if present).
- [ ] **Save / bookmark** event if the UI offers it.
- [ ] Count-only events do **not** leak attendee names to strangers (seed: workshop night).
- [ ] Event activity in Home/Following appears only where privacy allows.

### H. Messaging

- [ ] Open `/messaging`.
- [ ] **Main** and **Requests** folders (or tabs) are labeled clearly.
- [ ] Send a message where allowed (`alpha_social` to `alpha_open_dm` if seeded).
- [ ] Attempt to message where **not** allowed (e.g. stranger to `alpha_connections_dm` without connection).
- [ ] Sender sees **"Request sent"** or waiting copy when appropriate.
- [ ] Recipient can see pending request in **Requests** (accept/ignore if supported in UI).
- [ ] **Block** and **report** paths are findable from profile or conversation menus.
- [ ] Empty inbox copy is helpful, not generic lorem.

### I. Notifications and Activity

- [ ] Open `/notifications`.
- [ ] Open `/activity` (your activity inbox or equivalent).
- [ ] Difference between **Notifications** (things for you to act on) and **Activity** (your/outbound feed history) is understandable.
- [ ] If seeded: connection request, connection accepted, message request, new message samples appear with sane copy.
- [ ] Notification **CTAs** go to a useful destination (profile, messaging, thread).
- [ ] No **private message body**, precise location, hidden group name, or private attendee list leaks in notification previews.

### J. Settings and privacy

- [ ] Open account / settings.
- [ ] Review **profile privacy** (discoverability, field visibility).
- [ ] Review **messaging privacy** (who can message you).
- [ ] Review **feed / activity privacy** (posts in feeds, RSVPs, group joins).
- [ ] Review **blocked users** list.
- [ ] Review **muted** users or tags if present.
- [ ] All copy is human-readable; no promise of features listed in section 9 (deferred).

### K. Reporting and safety

- [ ] Find **Report** on at least one: profile, post, group, event, message (as applicable).
- [ ] Report flow categories and submit path are understandable.
- [ ] **Block** a test account (use seed pair only on disposable env).
- [ ] Blocked user content disappears from feed, People, messaging, notifications where testable.
- [ ] Do **not** submit abusive, explicit, or real-person harassment content in reports.

### L. Mobile pass

Repeat on a phone or narrow viewport (~390px width):

- [ ] Login and onboarding
- [ ] Home (tabs, composer, scroll)
- [ ] People
- [ ] Profile (own and other)
- [ ] Groups (browse, join, forum)
- [ ] Events (browse, RSVP, discussion)
- [ ] Messaging (Main / Requests)
- [ ] Notifications and Activity
- [ ] Settings
- [ ] **Bottom nav** highlights current section
- [ ] **Composer** does not cover critical UI
- [ ] No horizontal overflow on cards or modals
- [ ] Modals and sheets are dismissible and tappable

### M. Desktop pass

Repeat core pages at desktop width:

- [ ] Home: left/right rails or columns support the feed (not empty chrome)
- [ ] Home feels like a **social hub**, not disconnected directory links only
- [ ] Profile feels **alive** (posts, actions, context)
- [ ] Group and event pages are readable (line length, hierarchy)
- [ ] Messaging layout: thread list + conversation pane usable without hunting

---

## 5. Privacy-specific QA checklist

Use this table for explicit pass/fail tracking. "Seed" = requires alpha social seed or two coordinated test accounts.

| Scenario | Expected result | Suggested account | Pass / Fail | Notes |
|----------|-----------------|-------------------|-------------|-------|
| Only-me post | Only author sees post in global/local/following feeds | `alpha_private` vs `alpha_social` | | |
| Connections-only post | Strangers do not see post; connections/followers per product rules do | `alpha_connected` vs `alpha_newbie` | | |
| Blocked user in feed | Blocked user's posts hidden from blocker | `alpha_blocker` vs `alpha_blocked` | | |
| Blocked user in People | Blocked user omitted from suggestions/search for blocker | `alpha_blocker` | | |
| Blocked actor notifications | Notifications from blocked user filtered | `alpha_blocker` | | |
| Hidden group membership | Group not shown on member's public profile | `alpha_hidden_member` (viewer: stranger) | | |
| Private group forum in Following | Non-members do not see private group thread cards | `alpha_social` vs private group non-member | | |
| Count-only event RSVP | Non-host sees counts only, not attendee names | `alpha_social` on count-only seed event | | |
| Scoped / private media | Unauthorized viewers do not see restricted attachments | Any + media privacy settings | | |
| DM request preview | Request preview does not expose unsafe body or PII | `alpha_connections_dm` inbox | | |
| Undiscoverable profile | Profile absent from People search | Search for `alpha_quiet` as stranger | | |
| Open vs connections-only DM | Open account accepts requests; connections-only shows request gate | `alpha_open_dm` / `alpha_connections_dm` | | |

---

## 6. Bug report template

Copy per issue:

```text
Title: [short summary]

Page / route:
Account used:
Device / browser:

What I tried:
What I expected:
What happened:

Screenshot or video attached? (yes/no)
Console error? (paste if any)

Severity (pick one):
[ ] blocker — cannot continue core journey
[ ] confusing — works but I did not understand it
[ ] privacy concern — data shown or hidden wrongly
[ ] visual polish — layout, spacing, typography
[ ] content / copy — wording wrong or misleading
[ ] mobile issue — broken on small viewport only
```

---

## 7. Feedback prompts

After the journey, answer briefly (bullet points are fine):

1. What made sense **immediately**?
2. Where did you feel **lost**?
3. Did **Home** feel useful on day one?
4. Could you **find people** you wanted to connect with?
5. Did **profiles** feel alive or empty?
6. Did **groups** feel like real community spaces?
7. Did **events** feel connected to the social graph (RSVPs, discussion, activity)?
8. Did **messaging rules** (requests, connections-only, open) make sense?
9. Did anything feel **unsafe or too revealing**?
10. Did anything feel **fake** (demo padding, placeholder modules)?
11. What would make you **come back tomorrow**?

---

## 8. Operator checklist before structured tester QA

Complete **before actively promoting alpha testing** or asking people to run this journey deeply. Public visitors may already browse kink.social.

- [ ] Deploy latest build to target environment
- [ ] Verify required env vars (see [`ALPHA_DEPLOYMENT.md`](./ALPHA_DEPLOYMENT.md), [`FEATURE_REGISTRY.md`](./FEATURE_REGISTRY.md))
- [ ] Run DB migrations (`db:migrate-incremental`)
- [ ] Run **alpha social seed** only if intended (`ALLOW_ALPHA_SOCIAL_SEED=true`); **never** on production without explicit approval
- [ ] Do **not** run `db:wipe` or full destructive `db:seed` before tester session
- [ ] Confirm **registration policy** (`GET /api/auth/registration-policy`) and comms match env (open vs invite-gated)
- [ ] Confirm **SMTP** / password reset config if testers must reset passwords (do not test reset on VPS without operator approval)
- [ ] Confirm **S3 / uploads** if photo tests are in scope
- [ ] Confirm owner / admin / mod accounts and UUIDs for escalation
- [ ] Hit **health endpoints** (`/api/health`, mail health if applicable)
- [ ] Create or confirm **test accounts** (seed or manual)
- [ ] Take **baseline screenshots** of Home, People, one group, one event
- [ ] Confirm **database backup** exists before multi-tester sessions
- [ ] Verify **public-facing alpha safety** (see [`VPS_ALPHA_READINESS.md`](./VPS_ALPHA_READINESS.md) §17)
- [ ] Share this doc and [`ALPHA_SEED_WORLD.md`](./ALPHA_SEED_WORLD.md) with structured testers

---

## 9. What not to test yet

These are **known deferred or alpha-limited** areas. Failure here is not automatically a regression.

- Payment processing and Stripe checkout
- Full vendor checkout and order fulfillment
- Full group **channels**, **resources**, and **photo galleries** (may be absent or stubbed)
- Group **reply** activity aggregation in Following
- Per-group **activity mute** controls
- Full **notification inline actions** (accept/ignore from notification row)
- Production-scale **push notifications** on all devices
- Real **identity verification** beyond alpha trust signals
- **Mobile app store** native apps (PWA web alpha is in scope)
- Autonomous moderation resolution (humans decide)
- Portable identity / credential panel (phase 3)

---

## 10. Quick reference routes

| Area | Typical route |
|------|----------------|
| Home | `/home` |
| People | `/people` |
| Connections | `/connections` (or People sub-tab) |
| Profile | `/profile` or `/u/{username}` |
| Groups | `/groups` |
| Events | `/events` or Home Events |
| Messaging | `/messaging` |
| Notifications | `/notifications` |
| Activity | `/activity` |
| Settings | `/settings` or profile settings |

Exact paths may vary slightly; use app nav if URLs differ.

---

## 11. Automated gates (operators)

Optional engineering checks before human QA:

```bash
npm run verify:alpha        # local automated alpha gate
npm run test:e2e:alpha-gate # Playwright alpha routes
```

Human testers can ignore these; operators run them **before actively promoting alpha testing**.

---

## 12. Internal Browser QA Pass 1 — verdict questions

After completing this journey in a browser, answer:

1. Is the **public-facing alpha safe to leave visible** (no obvious privacy leaks to logged-out or casual visitors)?
2. Is it **ready to actively promote** for alpha testing?
3. Are there **blocker bugs** before asking people to use it seriously?
4. Are there **privacy leaks** visible to normal users?

Use the readiness template in [`VPS_ALPHA_READINESS.md`](./VPS_ALPHA_READINESS.md) §18 when filing operator reports.

---

*End of alpha QA journey. File issues using section 6 and share section 7 feedback with the project owner.*
