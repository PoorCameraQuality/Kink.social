# Adult Social Platform Design Research

**Date:** March 2026
**Scope:** Privacy-first design, content safety, community features, trust & safety, profile design, search/discovery, messaging, inclusive design, legal compliance, and monetization for kink/fetish community platforms.
**Platforms studied:** FetLife, Recon, Scruff, Feeld, Grindr, Sniffies, Plura, Hily, Fansly, OnlyFans, KinkPoint, Kinkanauts, KNKI, Splashd, Bumble

---

## 1. Privacy-First Design

### 1.1 Layered Visibility Architecture

The gold standard across kink platforms is **layered, per-asset privacy controls** — not a single global toggle. FetLife implements this comprehensively:

| Asset | Visibility Options |
|-------|-------------------|
| Profile | Logged-in members only (default), not indexed by search engines |
| Individual photos | All members, friends only, specific custom lists |
| Friend list | Self only, friends only, all members |
| Fetish/kink list | Hidden, friends only, all members |
| Activity feed | Configurable per-post |

**Recommendations for C2K:**

- **Default to restrictive.** Profiles visible only to authenticated members. No public indexing.
- **Per-content privacy selectors.** Every photo, writing, and kink-list item gets its own visibility dial: `Public (members)` / `Connections only` / `Close connections` / `Private`.
- **Granular messaging gates.** FetLife lets users restrict inbound messages to: anyone, friends + friends-of-friends, friends only, or custom criteria. Implement similar tiers.
- **Location coarsening.** Display city/region only, never precise coordinates. Offer a "fuzzy radius" toggle (Vicinity uses 0.1–10 mile randomization).
- **Activity stealth controls.** Grindr's "Show Me in Viewed List" toggle and Sniffies' Ghost Mode (hide online/last-active status) are table stakes.
- **Discreet mode.** Sniffies' "Vanilla Mode" blurs explicit imagery for public-space browsing. FetLife's new Safe Mode (alpha) blurs all photos/videos platform-wide. Offer a quick toggle in the header/nav.

### 1.2 Anti-Trilateration Protections

Research on LGBTQ+ geosocial apps shows that even with distance display disabled, colluding-trilateration attacks can locate users. Mitigations:

- Never expose exact distance values — use coarse buckets (`< 1 mi`, `1–5 mi`, `5–15 mi`, `15+ mi`).
- Add calibrated noise to any distance calculation server-side.
- Allow users to set a **location anchor** offset (a fake "home" point up to N miles from their real location).
- Offer an **Explore mode** (like Grindr's) that lets users browse other cities without revealing they're not actually there.

### 1.3 Profile Sharing & QR Codes

FetLife added QR-code profile sharing — useful at events/munches where you want to connect without exchanging phone numbers or real names. Implement a similar in-app share that generates a temporary, expirable link.

---

## 2. Content Safety & Moderation UI

### 2.1 The Blur/Reveal Pattern

The standard pattern for sensitive content is:

```
┌─────────────────────────┐
│  ░░░░░░ BLURRED ░░░░░░  │
│                         │
│  ⚠️ Sensitive Content    │
│  [Tap to reveal]        │
│                         │
└─────────────────────────┘
```

**Implementation specifics:**

- **CSS `backdrop-filter: blur(20px)`** on the image container, with an overlay containing the warning text and a reveal button.
- **State management:** `useState` toggle per content item. Revealed state should NOT persist across sessions (re-blur on page reload for safety).
- **Accessibility:** Blurred images must have `aria-hidden="true"` on the visual content and descriptive `aria-label` on the reveal button. Screen readers should announce "Sensitive image, tap to reveal" — never auto-read alt-text of NSFW images.
- **Per-content tagging:** Uploaders must tag content as SFW/NSFW/Explicit at upload time. AI pre-scan (confidence threshold) can suggest/enforce tags.
- **Regional sensitivity:** Content warnings can differ by jurisdiction (see Legal section).

### 2.2 Feed Safety Modes

FetLife's Safe Mode blurs all images/videos across the entire platform. Implement three tiers:

| Mode | Behavior |
|------|----------|
| **Open** | All content shown as-is (user has confirmed 18+) |
| **Cautious** | Creator-tagged NSFW content blurred; tap to reveal |
| **Safe** | All media blurred; text-only browsing by default |

Store preference in user settings with a quick-access toggle in the navigation bar.

### 2.3 Upload-Time Scanning

Modern platforms use a **hybrid sync/async moderation pipeline**:

1. **Fast path (< 500ms):** Lightweight classifier flags obvious violations (CSAM, non-consensual) and blocks upload immediately.
2. **Slow path (1–5s):** GPU-based forensic models run asynchronously. Content gets "speculative publish" with blur until cleared.
3. **Human review:** Flagged items go to a moderation queue with context (upload metadata, user history, confidence scores).

FetLife uses ML for content moderation, age verification in uploads, and CSAM detection, publishing monthly transparency reports.

### 2.4 Age Verification at Upload

FetLife verifies age in uploaded content to prevent underage material. Verification photos are encrypted and access is audit-logged. Implement:

- Face-age estimation as a soft gate at upload (flag if estimated age < 18).
- Hard block + human review for flagged content before it reaches any feed.

---

## 3. Community & Event Features

### 3.1 Event Discovery & Organization

Kink events fall into distinct categories requiring different UI treatments:

| Type | Description | UI Needs |
|------|-------------|----------|
| **Munches** | Casual social dinners, no play | Simple RSVP, restaurant info, newcomer-friendly flag |
| **Workshops** | Educational (e.g., rope, impact) | Instructor info, skill level indicator, materials list |
| **Play parties** | Active kink events | Dress code, rules/consent docs, venue details, ticket tiers |
| **Conventions** | Multi-day events | Schedule builder, vendor map, track filtering |
| **Rope jams** | Informal practice sessions | Skill level, bring-your-own gear notes |

**Platform patterns observed:**

- **KinkPoint:** 2,000+ events worldwide with browsing and RSVP. Events tagged by category and fetish interests.
- **Kinkanauts:** Host and RSVP tools with ticketing, guest lists, and moderation roles for hosts.
- **Plura:** Built a censorship-free ticketing system specifically because mainstream platforms (Eventbrite, etc.) ban adult content. Organizers sell tickets directly on-platform. 20,000+ monthly RSVPs. Community calendars curated by city and identity (kink & leather, LGBTQ+, polyamory).
- **FetLife:** Event reminders at 24h and 2h before RSVPed events. RSVP visibility controls (who can see you're attending).

**Recommendations for C2K:**

- **Integrated ticketing.** Don't force organizers to external platforms that may censor them. Build or embed a ticketing flow.
- **RSVP privacy tiers:** `Public` (name in attendee list), `Private` (count-only, name hidden), `Ghost` (attend without any trace).
- **Event rules/consent documents** as a required pre-RSVP step for play events — user must scroll and acknowledge.
- **Newcomer badges** on munch events to signal beginner-friendliness.
- **Post-event check-in** prompt ("How was the event?") for community feedback.
- **Recurring event support** — munches are typically monthly.
- **Community calendars** filtered by city, event type, and community affinity.

### 3.2 Group & Community Organization

- **Kinkanauts model:** Circles (small, private), clubs (larger, themed), and local community groups with moderation roles (admin, moderator, member).
- **KinkPoint:** 400+ groups with discovery features.
- **FetLife:** Groups with enhanced editors for discussion formatting.

**Recommendations:**

- Support group types: Open (anyone joins), Request (approval needed), Invite-only, Secret (not discoverable).
- Group-level content policies (some groups may be SFW-only, others explicit-allowed).
- Moderator tools: pin posts, remove members, set posting rules, configure auto-moderation keywords.
- Cross-reference groups with events (a group can host events).

---

## 4. Trust & Safety UI

### 4.1 Verification Systems

Modern platforms implement multi-tier verification:

| Method | Privacy Level | Friction | Compliance |
|--------|--------------|----------|------------|
| **Facial age estimation** | High (no doc stored) | Very low (selfie only) | UK OSA compliant |
| **Document upload** | Medium (30–90 day retention) | Medium | Most jurisdictions |
| **Database verification** | High (name + DOB only) | Low | US-focused |
| **Digital ID wallet** | Very high (zero-knowledge) | Low | EU-forward |
| **Liveness detection** | High | Low–medium | Prevents spoofing |

**Recommendations for C2K:**

- Offer at least 2 verification paths (facial estimation + document upload) to accommodate user comfort levels.
- **Verification badges** displayed on profiles (checkmark + "Identity verified") without revealing what method was used.
- Verification photos encrypted at rest, access audit-logged (FetLife pattern).
- **Trust levels** that unlock platform features progressively (e.g., new accounts can't DM non-connections for 48h).

### 4.2 Reporting Flow

Best practice from FetLife, Grindr, and Bumble:

```
[⚠️ Report] → Select category → Provide details → Optional evidence upload → Submit
                                                                              ↓
                                                                    Confirmation + 
                                                                    "What happens next" 
                                                                    explanation
```

**Report categories for kink platforms:**

- Harassment / unwanted contact
- Non-consensual content sharing
- Underage user
- Impersonation
- Outing / doxxing
- Consent violation (kink-specific)
- Spam / commercial solicitation
- Hate speech / discrimination

**Key design points:**

- Reporting and blocking are **separate actions** (Grindr pattern). Reporting does not auto-block; blocking does not require a report.
- Post-report transparency: send redacted summaries of outcomes to build trust (trolls.cloud consent-first pattern).
- FetLife maintains 20+ internal policies covering specific behaviors (racial slurs, body shaming, revenge porn).

### 4.3 Blocking & Muting

| Action | Effect |
|--------|--------|
| **Mute** | Hide their content from your feeds; they don't know |
| **Block** | Mutual invisibility — neither sees the other's profile, content, or messages |
| **Restrict** | They can still see you, but their messages go to a filtered inbox you can optionally check |

### 4.4 Safe Words / Boundaries in Profiles

While no platform currently has a dedicated "safe word" field, the concept maps to **limits and boundaries** (see Profile Design section). For real-time interactions (live chat, video):

- Implement a **panic button** or quick-exit gesture that immediately disconnects from a live session.
- In chat, a configurable "safe word" that, when typed, triggers an auto-response and optional disconnect.

---

## 5. Profile Design for Alternative Communities

### 5.1 Complex Identity Expression

FetLife's profile architecture is the industry reference:

**Role designation:** Submissive, Dominant, Switch, Master, Slave, Pet, Owner, Daddy/Mommy, Little, Sadist, Masochist, Rigger, Rope Bunny, Kinkster, Fetishist, Vanilla, Unsure, etc.

**Kink list with four-tier classification:**

| Tier | Meaning | Color Suggestion |
|------|---------|-----------------|
| **Into** | Experienced and actively enjoy | Green |
| **Curious About** | Want to explore, no experience yet | Amber/Yellow |
| **Soft Limit** | Willing with the right person/conditions | Orange |
| **Hard Limit** | Will not do under any circumstances | Red |

FetLife recently expanded this so that any fetish on the platform can be added as a soft or hard limit — not just the "into" and "curious" tiers.

**Activity level indicators:** "24/7" (full-time dynamic), "bedroom only," "scene-based," "exploring."

**Looking for:** Relationships, play partners, mentorship, friendship, event companions, educational exchange.

**Recommendations for C2K:**

- Implement the four-tier kink classification system with color-coded visual indicators.
- Allow free-text kink entries in addition to a curated taxonomy (users will have niche interests not in any predefined list).
- **Experience level** indicator: Newcomer, Exploring, Experienced, Mentor/Educator.
- **Relationship structure:** Solo, Partnered (mono), Partnered (open/poly), Relationship anarchist, etc.
- **Availability status:** Open to new connections, Selectively open, Not currently seeking.
- **Compatibility matching:** KNKI uses AI-powered kinklist matching. At minimum, show "shared interests" overlaps (Feeld pattern).

### 5.2 Profile Sections Architecture

```
┌─────────────────────────────────────┐
│  [Avatar]  DisplayName  [Pronouns]  │
│  Role · Location · Age              │
│  [Verified ✓] [Experience Level]    │
├─────────────────────────────────────┤
│  About Me (rich text, length limit) │
├─────────────────────────────────────┤
│  Kink List (grouped by tier)        │
│    Into: ●●● | Curious: ●●          │
│    Soft limits: ●● | Hard limits: ●●│
├─────────────────────────────────────┤
│  Looking For                        │
│  Relationship Structure             │
│  Boundaries / Limits Statement      │
├─────────────────────────────────────┤
│  Photos [privacy-gated galleries]   │
├─────────────────────────────────────┤
│  Groups · Events · Writings         │
└─────────────────────────────────────┘
```

---

## 6. Search & Discovery

### 6.1 Filtering Architecture

Sensitive content search requires a layered approach:

**Feeld's model (recommended):**
- Front-and-center filtering by age, gender, distance, and desires.
- "Shared desires" feature shows compatibility before full profile view.
- Glossary cards (tap-and-hold) explain community terminology inline.

**Recon's model:**
- Filter by declared fetishes/kinks, age, location, photo availability, and account recency.
- "Recommended for you" algorithmic feed alongside manual search.
- "New Members" and "Visitors" (who viewed your profile) discovery sections.

**Recommendations for C2K:**

- **Primary filters:** Location/distance, event type, kink interests, role, experience level.
- **Secondary filters:** Online now, has photos, verified, age range, relationship structure.
- **Compatibility score** displayed on search results (% overlap in kink lists).
- **"New to the community"** filter/badge for newcomers looking for beginner-friendly connections.
- **Saved searches** with optional push notifications ("3 new people match your search").

### 6.2 Location-Based Discovery with Privacy

| Feature | Implementation |
|---------|---------------|
| **Distance buckets** | `Nearby`, `< 5 mi`, `5–15 mi`, `15–50 mi`, `50+ mi` — never exact distances |
| **Location anchor** | Users can set a fake "home" point offset from their real location |
| **Explore mode** | Browse other cities without revealing your actual location (Grindr pattern) |
| **Venue protection** | Geofence sensitive venues (dungeons, clubs) — don't show user density near them |
| **Travel plans** | Recon's "I'm heading to [city]" feature — opt-in visibility for travel |

### 6.3 Content Discovery

- **"For You" feed** (FetLife's new personalized feed) alongside chronological activity feed.
- **Trending in your area** — popular events, active groups, trending discussions.
- **Content warnings in search results** — NSFW thumbnails blurred in search results by default regardless of user's content mode setting. Reveal requires clicking into the full item.

---

## 7. Messaging & Connection

### 7.1 Consent-First Messaging

**Hily's Consent Guard (2025)** is the current best practice:

- ML detects explicit words and images before sending.
- Recipient gets a consent prompt: "Someone wants to send you explicit content. Would you like to see it?"
- Recipient sets their comfort level: `Open` / `Cautious` / `Not now`.
- Sender gets a one-click consent request button, limited to 3 per chat (prevents spam).

**MIMY protocol (consent-based intro):**

- Three-stage progression: Anonymous intro → Accept/Decline → Gradual information reveal.
- "The ask comes before the approach" — recipient must opt in before any personal details are shared.

**Recommendations for C2K:**

- **Connection request model** (not open DMs by default). Users send a connection request with a short intro message. Recipient accepts, declines, or ignores.
- **Explicit content gating in DMs.** Photos/videos in messages are blurred by default. Recipient chooses to reveal or decline. Repeated declines trigger a soft block suggestion.
- **Ice-breaker prompts** tied to shared kink interests: "You both listed rope bondage as an interest — want to connect?"
- **Message request inbox** — separate from main inbox, for non-connection messages. Shows sender's profile summary without requiring full profile visit.
- **Conversation boundaries** — users can set per-conversation limits ("text only," "photos OK," "explicit OK") that both parties agree to.

### 7.2 Messaging Safety Features

- **Bumble's Private Detector:** Auto-blurs lewd images in DMs using ML, giving the recipient the choice to view or report.
- **Expiring messages:** Grindr's expiring photos (1 view or 10-second timer). Useful for sensitive content.
- **Screenshot detection** (where platform-supported) with notification to the other party.
- **Chat deletion:** Allow full thread deletion from both sides (Grindr pattern).

---

## 8. Inclusive Design

### 8.1 Gender & Pronoun Support

**Feeld's approach (2025 redesign):** 20+ gender options, 30+ desire categories across seven groupings. In-app glossary with tap-and-hold definitions for terms like demisexual, polyamory, and switch.

**Best practices from UX research:**

| Principle | Implementation |
|-----------|---------------|
| **Assess necessity** | Only ask for gender if it serves a purpose. If you just need to address someone, ask for pronouns instead |
| **Separate concepts** | Don't mix gender identity, gender modality (cis/trans), and sexuality in one field |
| **Autocomplete input** | Use autocomplete rather than fixed dropdowns — you can't anticipate every identity |
| **Common defaults + free text** | Show she/her, he/him, they/them as quick-picks; allow custom entry |
| **Make it optional** | Gender and pronoun fields should never be required |
| **Allow updates** | Identity is fluid; let users change anytime without friction |
| **Control visibility** | Let users choose who sees their gender/pronoun info to prevent outing |
| **Display prominently** | Show pronouns next to display name throughout the platform |

**Recommendations for C2K:**

- **Gender field:** Autocomplete input with common options (Man, Woman, Non-binary, Genderqueer, Genderfluid, Agender, Two-Spirit, Trans Man, Trans Woman, Questioning, Prefer to self-describe [free text]).
- **Pronoun field:** Multi-select with free text (he/him, she/her, they/them, ze/zir, xe/xem, any pronouns, ask me, custom).
- **Sexuality field:** Similar autocomplete pattern (Straight, Gay, Lesbian, Bisexual, Pansexual, Queer, Asexual, Demisexual, Fluid, Questioning, custom).
- **In-app glossary** (Feeld pattern) with tappable term definitions throughout the app.
- Carefully translate/preserve community-specific terminology — don't dilute words like "switch," "kink," or "poly" into generic alternatives.

### 8.2 Accessibility for Diverse Bodies & Abilities

**Current industry gaps (from research):**

- Most dating/social apps are heavily visual, creating barriers for users with visual impairments.
- Cluttered interfaces, non-descriptive buttons, poor color contrast, and complex navigation are common.
- Screen reader support is typically an afterthought.

**Recommendations for C2K:**

- **WCAG 2.1 AA minimum** across the entire platform.
- **Image descriptions:** Prompt uploaders to add alt-text; offer AI-suggested descriptions as a starting point (with human edit).
- **Screen reader optimization:** All interactive elements have descriptive `aria-label` attributes. Content warning states are announced. Navigation is fully keyboard-accessible.
- **High contrast mode** and **large text mode** in settings.
- **Reduce motion** preference that disables animations (respect `prefers-reduced-motion`).
- **Disability/accessibility tags** on profiles (optional, user-controlled) — mobility, visual, hearing, neurodivergent, chronic illness, etc.
- **Event accessibility info** — wheelchair access, ASL interpretation, sensory-friendly spaces, scent-free policies.
- **Voice navigation** support for critical flows (messaging, profile browsing).

---

## 9. Legal & Compliance UI

### 9.1 Age Verification

As of July 2025, the **UK Online Safety Act** requires "highly effective" age verification on all platforms hosting pornographic content. Ofcom considers the following methods compliant:

- Open banking verification
- Photo ID matching with liveness detection
- Facial age estimation
- Mobile network operator age checks
- Credit card verification (with limits)
- Digital identity services
- Email-based age estimation

**Not compliant:** Simple self-declaration ("I am over 18" checkbox), non-18+ payment methods.

**Implementation requirements:**

- No pornographic content visible before or during verification.
- Consistent across desktop and mobile.
- Resistant to circumvention (covers all access points, subdomains, direct URLs).
- Re-verification after logout.
- Fines: up to £18M or 10% of global annual turnover (UK); 20+ US states have similar laws.

**Recommendations for C2K:**

- **Gate all content behind age verification at account creation.** No browsing without verification.
- **Offer 2+ verification paths:** Facial age estimation (low friction, Yoti/AgeLayer integration) and document upload (broader acceptance).
- Minimal data retention (30 days for verification artifacts, then purge).
- Clear communication: "We verify your age, not your identity. Your document is encrypted and deleted after verification."

### 9.2 Consent Checkpoints

Design consent as a **progressive, contextual flow** — not a single wall-of-text TOS:

| Checkpoint | Trigger | Content |
|------------|---------|---------|
| **Account creation** | Sign-up | Age verification + community guidelines summary |
| **Profile completion** | First kink list entry | Explanation of visibility defaults + privacy controls |
| **First content view** | Opening a NSFW post | Content sensitivity acknowledgment |
| **Event RSVP** | RSVPing to a play event | Event-specific rules and consent policy |
| **First message** | Sending first DM | Messaging etiquette and consent norms |
| **Content upload** | First photo/video upload | Content policies, prohibited content list, consent verification for depicted persons |

### 9.3 Terms of Service Presentation

- **Layered TOS:** Short, plain-language summary with expandable full legal text.
- **Contextual policies:** Show relevant sections when they matter (e.g., content policy at upload, messaging policy at first DM).
- **Change notifications:** When policies update, show a diff summary and require re-acknowledgment.
- **Accessibility:** TOS available in screen-reader-friendly format, with language selector for i18n.

---

## 10. Monetization UI

### 10.1 Creator Tools

**Fansly's multi-tier model (2026):**

- Up to 5 subscription tiers (vs. OnlyFans' single tier) with customizable names, colors, and benefits.
- Free Follow tier for teasers / SFW content.
- Pay-per-view (PPV) content: $5–$50 per unlock.
- Tip goals, DM tips, livestream tips.
- Tip keywords that auto-respond to specific amounts.
- Content scheduling and queuing.
- Watermarking and region-based content restrictions.

**Recommendations for C2K:**

- **Subscription tiers** (3–5 levels) with creator-defined benefits. Display tier comparison table on creator profiles.
- **PPV content** on individual posts — blurred preview with price tag and unlock button.
- **Tip jar** always accessible on creator profiles and in DMs. Customizable tip amounts + quick-pick buttons ($5, $10, $25, custom).
- **Content scheduling** — queue posts with date/time picker.
- **Digital watermarking** on all downloadable media, tied to the purchasing user's account for leak tracing.

### 10.2 Creator Dashboard

Based on analysis of Aurifan, ManyVids, Lusfera, and PaysiteManager:

```
┌─────────────────────────────────────────┐
│  Creator Dashboard                      │
├──────────┬──────────────────────────────┤
│ Revenue  │  $X,XXX this month          │
│ Chart    │  [Line graph: daily revenue] │
│          │  Subs / Tips / PPV breakdown │
├──────────┼──────────────────────────────┤
│ Subs     │  XXX active subscribers      │
│ Overview │  XX new this week            │
│          │  [Churn risk alerts]         │
├──────────┼──────────────────────────────┤
│ Top Fans │  1. UserA — $XXX lifetime    │
│          │  2. UserB — $XXX lifetime    │
├──────────┼──────────────────────────────┤
│ Content  │  XX posts scheduled          │
│ Queue    │  [Calendar view]             │
├──────────┼──────────────────────────────┤
│ Payouts  │  Next payout: $X,XXX on [date] │
│          │  [Payout history]            │
└──────────┴──────────────────────────────┘
```

**Key metrics to surface:**

- Revenue by type (subscriptions, tips, PPV, custom content).
- Subscriber lifetime value and churn risk (AI-scored: hot/warm/cold).
- Profile views → subscriber conversion rate.
- Content performance (which posts drive the most subscriptions/tips).
- Payout schedule, processing status, and history.

### 10.3 Subscriber Management

- **Fan database** with subscription history, lifetime value, and engagement score.
- **Auto-renewal management** — subscribers can pause, downgrade, or cancel with clear UI (no dark patterns).
- **Promotional tools:** Free trial periods, discount codes, bundle pricing.
- **Subscriber caps** per tier for exclusivity (Fansly pattern).

### 10.4 Revenue Model

| Model | Split | Notes |
|-------|-------|-------|
| **Fansly** | 80% creator / 20% platform | Plus 5% platform fee on Starter plan |
| **OnlyFans** | 80% creator / 20% platform | Industry standard |
| **PaysiteManager** | 75% creator / 25% platform | After payment processing |

**Recommendations for C2K:**

- Start with 80/20 split (industry standard).
- Transparent fee breakdown on every transaction.
- Multiple payout methods (bank transfer, crypto, PayPal where available).
- Minimum payout threshold clearly communicated.
- Tax document generation (1099 for US creators).

---

## 11. Cross-Cutting Patterns & Recommendations

### 11.1 Design Principles for C2K

1. **Consent is the default.** Every interaction — viewing content, sending messages, sharing location — requires explicit opt-in.
2. **Privacy is layered, not binary.** Users control visibility at the asset level, not just the account level.
3. **Community over algorithm.** Prioritize group/event discovery over algorithmic feeds. Kink communities thrive on trust built through shared spaces.
4. **Education is embedded.** Glossaries, tooltips, and contextual explanations (Feeld pattern) help newcomers without patronizing experienced members.
5. **Safety is invisible until needed.** Reporting, blocking, and panic features should be accessible but not prominent enough to create anxiety.
6. **No platform should force outing.** Every identity field is optional. Pseudonyms are first-class citizens. Notifications never contain NSFW content in previews.

### 11.2 Technical Architecture Implications

| Concern | Approach |
|---------|----------|
| **Privacy controls** | Per-asset ACL system stored alongside content metadata |
| **Content moderation** | Hybrid pipeline: fast classifier at upload + async GPU forensics + human review queue |
| **Age verification** | Third-party integration (Yoti, AgeLayer, Token of Trust) with minimal data retention |
| **Location privacy** | Server-side distance bucketing with noise injection; never expose raw coordinates to client |
| **Blur/reveal** | Client-side CSS blur with server-side content tags; state resets on page reload |
| **Messaging consent** | Connection-request model with ML content scanning before delivery |
| **Creator monetization** | Stripe Connect (or equivalent) with tiered subscription + PPV + tipping models |
| **Accessibility** | WCAG 2.1 AA baseline; semantic HTML; ARIA labels; prefers-reduced-motion support |

### 11.3 Platform Comparison Summary

| Feature | FetLife | Recon | Feeld | Grindr | Plura | Fansly |
|---------|---------|-------|-------|--------|-------|--------|
| Kink list taxonomy | ★★★★★ | ★★★☆☆ | ★★★★☆ | ★☆☆☆☆ | ★☆☆☆☆ | N/A |
| Privacy controls | ★★★★★ | ★★★☆☆ | ★★★☆☆ | ★★★★☆ | ★★★☆☆ | ★★★☆☆ |
| Event management | ★★★★☆ | ★★☆☆☆ | ★☆☆☆☆ | ★☆☆☆☆ | ★★★★★ | N/A |
| Content safety | ★★★★☆ | ★★★☆☆ | ★★★☆☆ | ★★★★☆ | N/A | ★★★☆☆ |
| Identity inclusion | ★★★☆☆ | ★★☆☆☆ | ★★★★★ | ★★★★☆ | ★★★★☆ | ★★☆☆☆ |
| Monetization | ★☆☆☆☆ | ★★☆☆☆ | ★☆☆☆☆ | ★★☆☆☆ | ★★★☆☆ | ★★★★★ |
| Accessibility | ★★☆☆☆ | ★☆☆☆☆ | ★★★☆☆ | ★★☆☆☆ | ★★☆☆☆ | ★★☆☆☆ |
| Community/Groups | ★★★★★ | ★★☆☆☆ | ★☆☆☆☆ | ★☆☆☆☆ | ★★★★☆ | ★☆☆☆☆ |

### 11.4 Priority Recommendations for C2K

Based on the project audit (Next.js 14, React 18, Tailwind CSS, mock data phase):

**Phase 1 — Foundation (Current Sprint):**
1. Implement layered privacy controls architecture (per-asset ACL model in data layer).
2. Build blur/reveal content component with three safety modes.
3. Design profile schema with four-tier kink classification, roles, pronouns, and identity fields.
4. Create age verification gate flow (can be mock for now, architecture-ready for third-party integration).

**Phase 2 — Community Core:**
5. Event system with RSVP privacy tiers and integrated consent documents.
6. Group system with configurable privacy levels and moderation tools.
7. Connection-request messaging model with explicit content gating.
8. Reporting and blocking flows.

**Phase 3 — Discovery & Monetization:**
9. Search/discovery with kink compatibility scoring and location privacy.
10. Creator monetization tools (subscription tiers, PPV, tipping).
11. Creator dashboard with analytics.
12. Trust/verification badge system.

---

## Sources

- FetLife privacy settings, release notes, trust & safety documentation (fetlife.com)
- Feeld 2025 redesign roundtable and feature documentation (feeld.co)
- Hily Consent Guard feature launch (hily.com, mashable.com)
- MIMY consent-based intro protocol (mimy.dev)
- Grindr Safety & Privacy Center 2025 (grindr.com)
- Recon app features and new member guide (recon.com)
- Plura ticketing and event platform (heyplura.com)
- KinkPoint, Kinkanauts, KNKI platform features
- Sniffies privacy modes and location features (techshali.com)
- Splashd privacy-first LGBTQ+ platform (splashd.app)
- Fansly creator tools and monetization (fansly.io, creatorhub.fansly.com)
- Aurifan creator dashboard (aurifan.com)
- Token of Trust age verification (tokenoftrust.com)
- Yoti age verification (yoti.com)
- AgeLayer age verification (agelayer.com)
- Ofcom Online Safety Act age assurance guidance (ofcom.org.uk)
- UX Collective — pronoun and gender inclusive form design (uxdesign.cc)
- Accessible dating app reviews (includate.com, accessibility.com)
- Trolls.cloud consent-first moderation patterns
- Academic research on trilateration attacks on geosocial apps (icact.org)
