# C2K moderation — plain-English walkthrough

Share this doc in Discord to explain how reporting and moderation work without reading code.

## Who does what

### 1. Members

- **Report** appears on posts, chats, events, profiles, feed posts, education articles, and the support page.
- Pick a **category** (spam, harassment, etc.) and optional details.
- Members can still **block/mute** on their own; that does not replace a report.

### 2. Org and group moderators

- Open **Organizer → Moderation** on their org or group.
- **Inbox** — reports scoped to *their* community (forum, chat, org listing).
- **Actions** — hide a post, lock a thread, hide a chat message.
- **Bans** — remove someone from *that org or group only*.
- When banning, they can check **“Also ask C2K platform to review”** — that creates a platform-visible escalation without automatically site-banning the person.

### 3. C2K mod team (~10)

- **Moderation dashboard → Reports** — cross-community and escalated issues.
- **Actions** — propose enforcement (hide, org ban, warnings, resolve report, etc.).
- **Rule of two** — a proposal needs **two different mods** to approve before it runs. The person who proposed cannot count as an approver.

### 4. Site admins (~5)

- Everything mods have, plus **Admin** tools:
  - Suspend a user site-wide
  - Freeze a rogue org (command bridge / hub off)
  - Identity ban for emergencies (e.g. CSAM path — immediate, no approval queue)
- **Override** — can **execute now** on a pending action with a **reason**; the site shows **Rule of two overridden** in the audit trail.

## What members see after they report

1. Confirmation that the report was received.
2. **Settings → Support & reports** — status moves **Open → In review → Resolved** when updated.
3. Org-local issues are usually handled by org mods first; the platform team sees it when escalated or when the category/scope is platform-level (profiles, feed, etc.).

## Accountability

- Every hide, ban, approval, rejection, and admin override writes one line to an **audit log**.
- Mods and admins can search the timeline; **audit rows are not editable**.
- Platform actions show who proposed, who approved (names/IDs), and whether an admin overrode the two-mod rule.

## What we are *not* doing in this slice

- AI auto-ban or auto-resolve
- Reading DMs in the mod dashboard
- Vendor shop moderation tab (org vendor tools may link here later)
- Federation / cross-instance inbox

## Quick demo script (for team testing)

1. Member reports an org forum post → shows in org **Moderation → Inbox**.
2. Org mod hides the post → members no longer see it; mods still see it as hidden.
3. Org mod bans with **escalate** checked → org ban + platform report.
4. Mod A proposes an action; Mod B approves → action runs; audit shows two approvers.
5. Site admin uses **execute now** on another case → audit shows override + reason.
