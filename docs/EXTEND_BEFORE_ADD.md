# Extend before you add

**Last updated:** 2026-06-12 (points to `FEATURE_REGISTRY` §4 — **74** route registrars; pass 26)

We build and prototype in the same repo. The goal is **one coherent product surface**, not parallel stacks that drift apart.

The same guidance is enforced for Cursor via [`.cursor/rules/extend-before-add.mdc`](../.cursor/rules/extend-before-add.mdc) (`alwaysApply: true`).

---

## Before you implement

1. Open **`docs/FEATURE_REGISTRY.md`** — routes, API prefixes, and shipped behavior live there first.
2. **Search the repo** for the feature you’re adding (e.g. `convention`, `schedule`, `forum`, `event`, `group`, `org`).
3. Prefer **extending** existing schema, handlers, and UI over introducing a second parallel path.

---

## PR or plan snippet (copy/paste)

- **Existing:** What already covers this? (files, tables, route modules.)
- **Gap:** What is actually missing?
- **Choice:** Extend vs new — if new, **one sentence** why reuse is not viable.

---

## High-risk duplication areas

| Area | Guidance |
|------|----------|
| **Events / conventions / schedule** | Treat as one user-facing calendar story where possible. Align with `events`, `conventions`, and `schedule_slots` rather than adding a third program model without an ADR. Program discovery is centralized in `packages/api/src/lib/event-program.ts`. Presenter “classes on offer” belong in **`presenter_offerings`**, not duplicate schedule tables. |
| **Forums** | Org-scoped and group-scoped forums share one pattern; avoid a third forum implementation. |
| **Organizations / org hub** | Extend `organizations` (e.g. `community` jsonb), `organization_members` (directory opt-in, volunteer tags), `org_channels` (slow mode), `forum_post_reactions`, and `organizations.ts` routes — do not fork a parallel “org community” stack. |
| **API** | New `/api/v1/...` behavior belongs in real route modules under `packages/api/src/routes/`. Do not duplicate in `ecosystem-stubs.ts` except as a **temporary** stub with a tracked follow-up. |
| **Web UI** | Prefer a single data boundary (hook, loader, or small API client) per domain. Push `apiBacked ? … : mock` branching to that boundary instead of repeating it on every page. |

---

## Red flags — pause and design

- A second table that differs only by which FK it uses (org vs group vs event).
- A new page that is mostly a copy of an existing page with renamed props.
- A second enum or type that mirrors an existing one under a new name.

If duplication already exists, **small consolidation PRs** usually beat shipping the next feature on both paths.

---

## Related docs

- [`FEATURE_REGISTRY.md`](./FEATURE_REGISTRY.md) — inventory of routes and features
- [`MASTER_NEXT_STEPS.md`](./MASTER_NEXT_STEPS.md) — session priorities and backlog
- [`adr/README.md`](./adr/README.md) — ADR index (decisions that constrain extension)
