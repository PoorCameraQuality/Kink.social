# Privacy & Trust — C2K

**Purpose:** User control over visibility, identity, location, messaging consent, and safety actions — core expectations for a kink-positive social product.

**When to use:** Profiles, settings, DMs, events/RSVPs, search, and any feature that exposes personal data.

---

## Principles

1. **Layered privacy** — Controls are **per asset** (photo, field, post), not one global switch.
2. **Consent first** — Messages and explicit media default to guarded delivery.
3. **Safety without spectacle** — Reporting/blocking is easy to find, calm to use.
4. **Pseudonyms welcome** — Real names are not required for community participation.

---

## Visibility model (target)

| Asset / area | Example levels |
|--------------|----------------|
| Profile | Community only / connections / private |
| Photos | Per album or per item: public (members) / connections / custom list |
| Activity | Per post visibility; optional “don’t show in feeds” |
| RSVPs | Public / count-only / hidden (“ghost RSVP”) for sensitive events |
| Location | Region/city only; never precise coordinates in UI |

**Defaults:** restrictive for new accounts; progressive prompts explain each toggle.

---

## Profile design (community identity)

### Core sections

- Display name, **pronouns** (optional), **roles**, location (coarse), experience level.
- **About** with rich text limits and content rules.
- **Interests / kinks** with **four-tier** classification:

| Tier | Meaning |
|------|---------|
| **Into** | Actively enjoy |
| **Curious** | Exploring interest |
| **Soft limit** | Possible with trust/conditions |
| **Hard limit** | No |

Use **color + text** (not color alone) for tier chips — see token doc for semantic colors.

### Optional fields

- Relationship structure, “looking for”, boundaries statement, accessibility needs for meetups.

### Trust signals

- **Verification** badge (method-agnostic label).
- **Trust ring** / badges for behavior (events, consent culture, hosting) — already in codebase; keep tooltips readable.

---

## Location & discovery

- Show **distance buckets** (`< 5 mi`, `5–15 mi`, …), not exact distance where feasible.
- **Explore mode** (browse another city without implying physical presence) — product decision; if shipped, label honestly in UI.
- Mitigate **triangulation** risks server-side (noise, rounding) — not only a UI concern.

---

## Messaging (consent-first)

**Target model:**

- **Connection requests** or **message requests** for people who haven’t mutually opted in.
- **Explicit media in DMs** blurred until recipient accepts; tie to safety mode.
- **Icebreakers** suggested from **shared interests** (optional, user can disable).

**Separate concepts:**

- **Mute** — hide their content; they aren’t notified.
- **Block** — mutual invisibility.
- **Restrict** (optional) — limited visibility + filtered inbox.

---

## Reporting

**Flow:** Report → category → details → optional evidence → confirmation + what happens next.

**Kink-aware categories** (non-exhaustive): harassment, consent violation, non-consensual imagery, outing/doxxing, underage concern, spam/scams, hate speech.

**Do not** force users to report in order to block.

---

## Age assurance & legal UI

- **Jurisdiction-dependent:** Some regions require strong age assurance for adult content — product/legal must define gating **before** explicit surfaces are live ([ADULT_PLATFORM_DESIGN_RESEARCH.md](../ADULT_PLATFORM_DESIGN_RESEARCH.md)).
- **Checkpoints:** account creation, first NSFW view, first upload, first DM with media, RSVP to high-risk events — use short, plain-language summaries with links to full policy.

---

## Do / Don’t

| Do | Don’t |
|----|--------|
| Explain *who can see this* on sensitive fields | Hide visibility behind vague “Privacy” toggles |
| Separate **report** and **block** | Imply reporting is mandatory for safety |
| Allow pronouns/identity fields to be hidden | Require gender for unrelated features |

---

## C2K-specific

- **Mock phase:** document intended ACL fields in types even if not enforced yet.
- **Settings** page is currently placeholder — when wired, map sections to the IA in [04-NAVIGATION_AND_IA.md](./04-NAVIGATION_AND_IA.md).
- **Endorse** and similar actions should log consent expectations when implemented.

---

## References

- [C2K-DESIGN-SYSTEM.md](../C2K-DESIGN-SYSTEM.md)
- [05-CONTENT_AND_SAFETY.md](./05-CONTENT_AND_SAFETY.md)
- [04-NAVIGATION_AND_IA.md](./04-NAVIGATION_AND_IA.md)
- [ADULT_PLATFORM_DESIGN_RESEARCH.md](../ADULT_PLATFORM_DESIGN_RESEARCH.md)
- [FEATURE_REGISTRY.md](../FEATURE_REGISTRY.md)
- [../DESIGN_BIBLE.md](../DESIGN_BIBLE.md)
