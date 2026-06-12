# Brand & Identity — C2K

**Purpose:** Define how Coast to Coast Kink *looks* and *sounds* so every screen feels consistent, trustworthy, and community-centered.

**When to use:** Marketing pages, onboarding copy, error messages, empty states, moderation comms, and any new feature naming.

---

## Principles

1. **Community first** — We center consent, education, and connection — not shock value.
2. **Radical clarity** — Plain language for policies, safety, and settings; avoid gatekeeping jargon unless we also offer a glossary entry.
3. **Dignity always** — Copy and imagery respect identities, bodies, and boundaries.
4. **Dark elegance** — Calm themed surfaces + accent from `--dc-accent`; energy from structure and content, not noise.

---

## Brand voice

| Attribute | What it means | Example |
|-----------|----------------|---------|
| **Warm** | Welcoming to newcomers and elders alike | “Welcome back — here’s what’s happening near you.” |
| **Direct** | Short sentences for actions and errors | “We couldn’t load messages. Try again.” |
| **Safety-literate** | Normalize consent vocabulary | “Only proceed if everyone involved consented to this photo.” |
| **Non-judgmental** | Describe choices without ranking people | “You can change this anytime in Settings.” |

**Avoid:** Shaming, mocking “vanilla” people, or overly sexualized microcopy in functional UI (buttons, toasts, errors).

---

## Tone by surface

| Surface | Tone |
|---------|------|
| Onboarding | Encouraging, step-by-step, optional fields explained |
| Feed / groups | Neutral, scannable; humor only if it aids clarity |
| Safety / report | Calm, procedural, no victim-blaming |
| Legal / age gates | Formal, precise, short sentences |
| Empty states | Helpful + one clear CTA |

---

## Visual identity

### Color story

- **Primary contract:** Member UI uses **`--dc-*`** semantic tokens via `DancecardAppearanceProvider` (default theme **midnight-brass**). User-selectable themes: midnight-brass, parchment, lifted-ink. See [C2K-DESIGN-SYSTEM.md](../C2K-DESIGN-SYSTEM.md).
- **Legacy:** `--c2k-*` / Tailwind `c2k.*` remain on routes not yet migrated — do not add new `--c2k-*` usage.
- **Accent:** Theme-specific brass/teal family — not a single global hex; use `--dc-accent` in components.

Full token tables: [08-DESIGN_TOKENS.md](./08-DESIGN_TOKENS.md).

### Typography

- **Primary typeface:** Inter — weights 300–800 for UI and marketing.
- **Rule:** One family for UI; use weight and size for hierarchy, not extra display fonts, unless marketing explicitly needs a second face (future).

### Logo & wordmark

- **Placeholder rule until assets exist:** Use wordmark “Coast to Coast Kink” or “C2K” in `text-c2k-text-primary` with optional teal underline or icon mark.
- **Minimum clear space:** Height of the “o” in the wordmark around all sides.
- **On dark:** White or near-white text; teal only for accent mark, not full wordmark (contrast).

### Imagery

- **Photography:** Real community context when possible; diverse bodies, roles, and ages (18+). No deceptive stock “fantasy” that implies non-consent.
- **Illustrations:** Geometric or soft abstract; avoid caricaturing kink identities.
- **Thumbnails:** Respect content warnings (see [05-CONTENT_AND_SAFETY.md](./05-CONTENT_AND_SAFETY.md)).

---

## Patterns

### Hero / landing

```
┌─────────────────────────────────────────────┐
│  [Wordmark]                    [Log in]    │
│                                             │
│     Headline — confident, inclusive         │
│     Sub — one line value prop               │
│     [ Primary CTA ]  [ Secondary ]          │
│                                             │
│  Trust strip: safety · privacy · local    │
└─────────────────────────────────────────────┘
```

### In-app headers

- Title: sentence case (“Messages”, not “MESSAGES”).
- Destructive actions: label clearly (“Delete post”, not “Remove”).

---

## Do / Don’t

| Do | Don’t |
|----|--------|
| Use “you” and active verbs | Use blamey language (“Invalid user”) |
| Offer “Learn more” for complex policies | Hide critical safety info behind vague “Info” |
| Repeat brand colors from tokens | Introduce rainbow one-offs per page |

---

## C2K-specific

- Product is **kink-positive** and **event/group-centric** — brand should feel like a serious community tool, not a gimmick.
- **NSFW** is handled with **safety UI** and **user control**, not with explicit visuals in chrome (nav, settings).

---

## References

- [C2K-DESIGN-SYSTEM.md](../C2K-DESIGN-SYSTEM.md) — canonical theme contract
- [08-DESIGN_TOKENS.md](./08-DESIGN_TOKENS.md)
- [DESIGN_RESEARCH.md](../DESIGN_RESEARCH.md) — Typography and color systems (industry evidence)
- [ADULT_PLATFORM_DESIGN_RESEARCH.md](../ADULT_PLATFORM_DESIGN_RESEARCH.md) — Inclusive language and safety framing
- [../DESIGN_BIBLE.md](../DESIGN_BIBLE.md)
