# Storybook UI system (Pass 5)

Component workshop for kink.social member UI in `packages/web`. Use Storybook to review shared surfaces, feed/profile/directory cards, menus, and mobile states **before** editing routes.

Pass 4 Playwright + axe remains the CI regression gate. Storybook a11y addon is **advisory only**.

## Run locally

```bash
# From repo root
npm run storybook

# Or workspace directly
npm run storybook -w web
```

**Monorepo note:** root `package.json` pins `"overrides": { "esbuild": "0.27.4" }` so Storybook and Vite share one esbuild binary. If `build-storybook` fails with a host/binary version mismatch, run `node node_modules/esbuild/install.js` from the repo root.

Opens at **http://localhost:6006** with the dark app shell background.

## Build static Storybook

```bash
npm run build-storybook
# output: packages/web/storybook-static
```

## Where stories live

| Path | Purpose |
|------|---------|
| `packages/web/src/stories/**/*.stories.tsx` | All stories (colocated by domain) |
| `packages/web/src/stories/mocks/` | Safe neutral mock props (no production/private data) |
| `packages/web/src/stories/decorators.tsx` | App shell, router, fixed auth |
| `packages/web/.storybook/main.ts` | Vite aliases, story globs, addons |
| `packages/web/.storybook/preview.ts` | Global CSS, backgrounds, viewports |

Story groups:

- **Foundations/** — surfaces, typography, accent usage
- **UI/** — Button, Cards, Dialogs & Menus, Empty States, Search & Filters, Tabs
- **Feed/** — Post card, Reaction footer
- **Profile/** — Hero, section cards, gallery strip
- **Directories/** — People, Group, Event, Vendor, Org, Education cards
- **Shells/** — Hub/detail page sections (event detail panels, RSVP sidebar, orientation card)

## Providers & decorators

Every story is wrapped with:

1. **`MemoryRouter`** — for `Link` / route-aware components
2. **`FixedAuthProvider`** — static session (`RopeDreamer`, authenticated) without `/api/auth/session`
3. **`StoryCanvas`** — dark `bg-dc-surface` shell with optional max-width

Global CSS: `packages/web/src/app/globals.css` (Tailwind + dancecard tokens + feed/profile surfaces).

Per-story overrides via `parameters.providers`:

```tsx
parameters: {
  providers: { maxWidth: '390px', authenticated: false },
  viewport: { defaultViewport: 'mobile390' },
}
```

## Surface / card conventions

- Use **`Card`**, **`ContentSection`**, **`RailCard`**, and `card-surface` tokens — not one-off borders/backgrounds
- Hub/detail tab panels and sidebars: **`ContentSection`** (`cardSurfaceBaseClass`), not `bg-dc-elevated/95`
- Interactive cards: `Card interactive` or directory card components
- Menus/dialogs: `z-dc-dropdown` / `z-dc-modal` — verify in **UI/Dialogs & Menus**
- Vendor directory: discovery framing, **no price emphasis** in grid cards
- People cards: profile link is the card; no loud Connect CTA in stories
- Event cards: date/location badge + `MediaSurfaceFallback` when no hero image

## Mobile expectations

Preview viewports:

| Name | Size |
|------|------|
| `mobile390` | 390×844 |
| `desktop1440` | 1440×900 |

Key components with mobile stories: feed post, reaction footer, profile hero, directory grid, explore search.

## Accessibility in Storybook

- Addon: `@storybook/addon-a11y` (parameters `a11y.test: 'todo'` — advisory)
- Do not treat Storybook a11y as release gate — use `npm run test:e2e:a11y`

## Canonical components

| Domain | Component | Story path |
|--------|-----------|------------|
| Actions | `Button` | UI/Button |
| Surfaces | `Card`, `ContentSection`, `RailCard` | UI/Cards, Shells/* |
| Overlays | `Dialog`, `CopyLinkOverflowMenu` | UI/Dialogs & Menus |
| Empty | `EmptyState` | UI/Empty States |
| Tabs | `TabShell`, `TabButton` | UI/Tabs |
| Feed | `LocalPostCard`, `FeedPostActionBar`, `FeedReactionPicker` | Feed/* |
| Profile | `ProfileHero`, `ProfileAboutCard` | Profile/Surfaces |
| Directories | `PersonCard`, `GroupCard`, `EventCard`, `VendorCard`, `OrgDirectoryCard`, `EducationArticleCard` | Directories/Cards |

## Workflow for future Cursor UI work

1. **Find or add a story** for the component you are changing
2. Adjust component + story together in the same PR
3. Check desktop + `mobile390` in Storybook
4. Run Pass 4 e2e if the change touches feed, menus, directories, or profile surfaces

## Deferred (intentionally)

| Area | Why deferred |
|------|----------------|
| Full page clients (`HomePageClient`, `ProfilePageClient`) | Route orchestration — use Playwright |
| `ProfileStoryView` composite | Heavy data hooks + API links fetch |
| Organizer / door / moderation shells | Out of alpha member UI workshop scope |
| Live API-backed reactions on mock posts | Mock posts use visual-only reaction state; interactive reactions in `Feed/Reaction Footer` |

## Do not

- Create one-off card surfaces outside shared tokens
- Use random z-index values
- Ship nearly invisible cards (low contrast panels)
- Use solid rose/accent buttons on every repeated card CTA
- Put real emails, DMs, moderation notes, tokens, or private URLs in stories

## Related docs

- [`docs/UI_TESTING_CONTRACT.md`](UI_TESTING_CONTRACT.md) — Pass 4 Playwright + axe
- [`docs/E2E.md`](E2E.md) — full route smokes
