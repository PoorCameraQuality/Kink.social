# Policy coverage + minimum moderation gap audit — orchestration

**Worker ID:** `POLICY-COVERAGE-GAP-AUDIT-1`  
**Purpose:** Competitive-research checklist only — **no FetLife copy**. Policy coverage first; minimum engineering only for alpha-blocking gaps.  
**Prerequisite:** LEGAL-ALPHA-1 + 1.5 landed; freeze after manual smoke unless verify/smoke fails.

**Outputs:**
- [`docs/trust-safety/POLICY_COVERAGE_MATRIX.md`](../trust-safety/POLICY_COVERAGE_MATRIX.md)
- [`docs/trust-safety/SCOPED_MODERATION_GAP_AUDIT.md`](../trust-safety/SCOPED_MODERATION_GAP_AUDIT.md)
- DMCA counter-notice timing: **10–14 business days** after valid counter-notice unless claimant files court action (17 U.S.C. § 512) — **never “7 days”**

**Related:** [`PILOT_CRITICAL_GAP_AUDIT.md`](../PILOT_CRITICAL_GAP_AUDIT.md) · [`PROJECT_DECISIONS.md`](../PROJECT_DECISIONS.md) · [`plans/SCOPED-MOD-1-ORCHESTRATION.md`](./SCOPED-MOD-1-ORCHESTRATION.md)

---

## Hard guardrails

- Do not copy competitor text, tone, jurisdiction, SLAs, or integration claims.
- Alpha: `community_only`, explicit off, scanners fail closed, humans decide, legal holds block deletion.
- Anti-fiddling: build only if blocks alpha, reduces real risk, pilot needs it, fixes verify/smoke, or removes event-breaking manual process.
- Extend existing T&S stack; no PhotoDNA, NCMEC API, StopNCII, Stripe, explicit video, full UI-2.

---

## Phases (summary)

| Phase | Action |
|-------|--------|
| 1 | Confirm verify gates + manual smoke (owner) |
| 2 | Policy coverage matrix (24 areas) |
| 3 | Patch policy pages only where gaps exist |
| 4 | Scoped moderation gap audit per live UGC surface |
| 5 | Build **only** alpha-blocking minimums |
| 6 | Map report reasons — extend taxonomy only if necessary |
| 7 | DMCA 10–14 business day correction |
| 8 | Update docs honestly |
| 9 | Verify + manual smoke recommendations |

Full paste-ready coordinator prompt: see git history of this file (2026-06-05) or product owner handoff bundle.

---

## Report reason mapping (prefer existing)

Use [`packages/shared/src/moderation-types.ts`](../../packages/shared/src/moderation-types.ts) `POLICY_REASONS`. Sub-reasons (body shaming, kink shaming, screenshots, fantasy pushing) → `harassmentThreats`, `consentSafety`, `doxxingOuting`, `spamScam`, or `other` + detail in report body — **no new enum per policy article**.

Suggested broad buckets already in taxonomy: minor safety, NCII/consent, doxing, harassment, threats, impersonation, spam/scam, illegal goods, commercial sex/trafficking, copyright (DMCA path separate), local scope → `other` + scope note until scoped-mod ships.

---

## Stop conditions

Stop when: LEGAL-ALPHA-1 passes; matrix + gap audit exist; DMCA timing correct; only alpha-blocking gaps built; verify green.
