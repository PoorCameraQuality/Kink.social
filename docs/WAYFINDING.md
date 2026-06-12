# Wayfinding (C2K web)

**Purpose:** When to use breadcrumbs, back links, and URL-driven tabs so organizer and hub pages stay consistent.

---

## URL tabs (`?tab=`)

Use when the user should **bookmark or share** a section of a multi-panel page.

| Surface | Query param | Example |
|---------|-------------|---------|
| Org hub | `tab=Overview\|Calendar\|Forums\|…` | `/orgs/demo-east-collective?tab=Calendar` |
| Group detail | `tab=Channels\|Forums\|Members\|…` | `/groups/{uuid}?tab=Forums` |
| Convention | `tab=Schedule\|Manage\|ISO\|…` | `/conventions/seed-demo-con-program?tab=Schedule` |
| Organizer console | `tab=home\|schedule\|people\|settings\|…` | `/organizer/orgs/demo-east-collective?tab=schedule` |
| Home feed | `tab=My Feed\|Local\|Events\|…` | `/home?tab=Local` |

Implementation: `useTabFromUrl()` in `packages/web/src/hooks/useTabFromUrl.ts`.

---

## Breadcrumbs

Use when the user navigated **down a hierarchy** and needs context to go up one level (not replace the whole tab bar).

| Pattern | Example |
|---------|---------|
| Organizer → org → convention Manage | Convention page with `?organizerOrg=demo-east-collective` shows breadcrumb back to org Schedule |
| Parent org on group header | Group detail links to `/orgs/{slug}` |

Prefer breadcrumbs over a generic “Back” when the parent label is meaningful (org name, “Organizer console”).

---

## Back links

Use for **linear flows** or when there is no stable parent in the IA:

- Profile edit → “Back to profile”
- 404 → Home + Advanced Search
- Onboarding steps → **Back** between wizard steps

Do not use Back alone on hub pages that already have tabs; use breadcrumb + tabs instead.

---

## Mobile

- Tab bars: horizontal scroll + snap (`overflow-x-auto`, min-h-11 targets).
- Organizer and org tabs share the same tab component vocabulary (`TabButton`, `OrganizerTabNav`).

---

*Update when a new multi-tab surface ships or organizer IA changes.*
