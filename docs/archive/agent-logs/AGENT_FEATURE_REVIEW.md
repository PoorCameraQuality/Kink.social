# Feature review log (retired)

**Historical autonomous loop entries were removed 2026-06-06** (~2700 lines of May 2026 session notes). They duplicated [`BACKLOG_QUEUE.md`](../../BACKLOG_QUEUE.md) `done` rows and [`HANDOFF.md`](../../HANDOFF.md) ship notes.

## Where to log new work

| Audience | Doc |
|----------|-----|
| Autonomous queue | [`BACKLOG_QUEUE.md`](../../BACKLOG_QUEUE.md) — set row `done` + Notes |
| Engineer resume | [`HANDOFF.md`](../../HANDOFF.md) — dated section per milestone |
| Ship inventory | [`FEATURE_REGISTRY.md`](../../FEATURE_REGISTRY.md) |

## Loop skill

[`.cursor/skills/c2k-feature-loop/SKILL.md`](../../../.cursor/skills/c2k-feature-loop/SKILL.md) — no longer appends to this file.

## Recovering old entries

Use git history: `git log -- docs/archive/agent-logs/AGENT_FEATURE_REVIEW.md` (if committed before trim) or prior commits on `docs/AGENT_FEATURE_REVIEW.md`.
