# Kink Social Design Bible

**Last updated:** 2026-06-06 (Kink Social rebrand — index only; canon in [`C2K-DESIGN-SYSTEM.md`](./C2K-DESIGN-SYSTEM.md))

**Role:** Design doc **index** for **Kink Social** — not visual canon. For binding styling rules during the UX refactor, read **[C2K-DESIGN-SYSTEM.md](./C2K-DESIGN-SYSTEM.md)** first. (Filename retains C2K internal codename.)

**Stack:** Vite/React (`packages/web`), Tailwind, TypeScript — not Next.js.

---

## Read order

| Order | Document | When |
|-------|----------|------|
| **0** | [C2K-DESIGN-SYSTEM.md](./C2K-DESIGN-SYSTEM.md) | Theme contract (`--dc-*`), hard rejections, refactor guardrails |
| 1 | Topic docs below | Per-domain specs |
| 2 | [GPT_UI_DESIGN_CONTEXT.md](./GPT_UI_DESIGN_CONTEXT.md) | As-built routes, shells, UX debt (external AI) |
| 3 | Research layer | Industry evidence only — not normative C2K specs |

---

## Topic documents

| # | Document | Focus |
|---|----------|--------|
| 01 | [Brand & identity](./design/01-BRAND_AND_IDENTITY.md) | Voice, tone, visual identity |
| 02 | [Layout & responsive](./design/02-LAYOUT_AND_RESPONSIVE.md) | Breakpoints, widths, grids |
| 03 | [Component library](./design/03-COMPONENT_LIBRARY.md) | Structure, states, checklist |
| 04 | [Navigation & IA](./design/04-NAVIGATION_AND_IA.md) | Nav, routes, settings map |
| 05 | [Content & safety](./design/05-CONTENT_AND_SAFETY.md) | CW, blur/reveal, feeds, media |
| 06 | [Privacy & trust](./design/06-PRIVACY_AND_TRUST.md) | Profiles, DMs, reporting, age gates |
| 07 | [Accessibility & performance](./design/07-ACCESSIBILITY_AND_PERFORMANCE.md) | WCAG, motion, vitals |
| 08 | [Design tokens](./design/08-DESIGN_TOKENS.md) | Color, type, space, z-index, motion |

---

## Research layer (evidence — not canon)

| File | Contents |
|------|----------|
| [DESIGN_RESEARCH.md](./DESIGN_RESEARCH.md) | Social/mobile patterns, typography, color, nav, a11y, motion |
| [DESIGN_SYSTEM_RESEARCH.md](./DESIGN_SYSTEM_RESEARCH.md) | Tokens, layouts, forms, real-time UI, admin patterns |
| [ADULT_PLATFORM_DESIGN_RESEARCH.md](./ADULT_PLATFORM_DESIGN_RESEARCH.md) | Privacy, safety, identity, legal context |

Normative token and component rules live in **C2K-DESIGN-SYSTEM** + **design/08** — not in research files.

---

## Code locations

| Concern | Location |
|---------|----------|
| Global styles & CSS variables | `packages/web/src/app/globals.css` |
| Tailwind theme | `packages/web/tailwind.config.js` (or `@theme` in CSS) |
| Nav / footer config | `packages/web/src/config/site.config.ts` |
| Member theme provider | `DancecardAppearanceProvider` (`--dc-*` themes) |

---

## Governance

- **Token / theme changes:** update [C2K-DESIGN-SYSTEM.md](./C2K-DESIGN-SYSTEM.md) and [design/08-DESIGN_TOKENS.md](./design/08-DESIGN_TOKENS.md) in the same PR.
- **New screens:** cite the topic doc in the PR (e.g. “Content: per 05-CONTENT_AND_SAFETY”).
- **Contrast / legal** for adult content may override visual preferences — document in PR.

---

## Related

- [FEATURE_REGISTRY.md](./FEATURE_REGISTRY.md) — routes and shipped UI
- [UX_REFACTOR_BACKLOG.md](./UX_REFACTOR_BACKLOG.md) — active UI debt queue
- [archive/](./archive/) — historical UI audits

*Last updated: 2026-06-06 — trimmed to index; visual canon → C2K-DESIGN-SYSTEM.*
