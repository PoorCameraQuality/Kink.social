# Mobile UX audit

**Viewports:** 390×844 (primary), 430×932, 768×1024, 1440×900 (desktop reference).

**Automated guard:** `e2e/route-smoke.mobile.spec.ts` checks horizontal overflow and console errors on critical paths.

**Question per screen:** Can a real person complete the workflow on this size without devtools or guessing?

---

## Checklist by route group

| Route group | Component focus | Checks | Severity template |
|-------------|-----------------|--------|-------------------|
| Landing `/` | Hero, CTAs | No overflow; tap targets ≥44px | P4 |
| Create event modal | `CreateFlowModal` | Sheet fits viewport; footer not under browser chrome; datetime readable | P1 |
| Command Bridge | Sidebar / tabs | Tabs scroll or collapse; content not under fixed header | P1 |
| Program tab | Grid / list | List fallback or intentional horizontal scroll for grid | P2 |
| People hub tabs | Tab strip | All people sub-tabs reachable without clipping | P1 |
| Door mode | `DoorModePanel` | Search + check-in thumb-reachable; primary CTA full width | P1 |
| Org public hub | `OrgHubClient` | Chat composer visible; forums reply not hidden | P2 |
| Convention hub | Tabs | Schedule readable; pin actions reachable | P2 |

---

## Issues log

| Route | Viewport | Component | Problem | Severity | Recommended fix | Screenshot |
|-------|----------|-----------|---------|----------|-----------------|------------|
| — | — | — | *No issues filed in automated pass; fill during manual staging rehearsal* | — | — | — |

---

## Door mode (mobile-first)

- [ ] Search field visible without scrolling past QR block
- [ ] Check-in button min height ~56px
- [ ] Eligibility messaging visible (not only color)
- [ ] Exit link back to signups works

---

## Create event (modal)

- [ ] Stepper visible at top
- [ ] Sticky footer does not cover last form field
- [ ] Virtual vs in-person toggle tappable

---

## Program grid

- [ ] At 390px width, program uses list/cards or documented horizontal scroll
- [ ] Slot drawer/modal full-screen or nearly full-screen

---

*Update this file during Wave 7 staging rehearsal; link screenshots under `docs/audits/ui/screenshots/` if captured.*
