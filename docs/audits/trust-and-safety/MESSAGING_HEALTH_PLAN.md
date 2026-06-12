# Messaging Health (Alpha Implementation)

**Status:** Implemented (alpha) — 2026-06-06

- **Rollups:** `messaging_health_rollups` + `recomputeMessagingHealthRollup()` in `packages/api/src/lib/messaging-health.ts`
- **Restrictions:** `messaging_restrictions` — auto DM cooldown when `NEEDS_COOLDOWN` threshold hit
- **Gate:** `POST /api/v1/conversations` checks `assertCanStartNewConversation()` before creating new DMs
- **Decay:** `trust-decay-sweep` lifecycle job expires restrictions

**Not yet:** block-after-contact / report-after-contact rollups (placeholders at 0), recipient-facing labels (intentionally absent).

**User notice:** “Your ability to start new conversations is temporarily limited because recent outreach looked unusually high or unwanted.”
