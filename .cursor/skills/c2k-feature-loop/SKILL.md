---
name: c2k-feature-loop
description: >-
  Run unattended C2K feature loops from docs/BACKLOG_QUEUE.md: audit → plan →
  implement → test → UX pass → docs. Use for autonomous backlog processing,
  /loop C2K prompts, or when the user wants hours of work without checkpoints.
---
# C2K feature loop (autonomous)

## When to use

- User wants **backlog automation** from C2K docs without stopping for approval
- User mentions **feature loop**, **BACKLOG_QUEUE**, **two full loops**, or **hands-off for hours**
- A `stop` hook or `AGENT_LOOP_WAKE` sentinel fired with a C2K loop payload

## Autonomy contract (non-negotiable)

1. **Never** call `AskQuestion` or wait for user input between queue items.
2. **Never** call `SwitchMode` (stay in Agent; do not enter Plan mode that needs approval).
3. **Do not** create git commits or PRs unless the user explicitly asked in this session.
4. **Do** implement, typecheck, run `npm run test -w @c2k/api`, fix failures, update docs.
5. On ambiguity, pick the **smallest shippable diff** aligned with [`C2K-STRATEGIC-GUIDANCE.md`](../../docs/C2K-STRATEGIC-GUIDANCE.md) (phase gates), [`EXTEND_BEFORE_ADD.md`](../../docs/EXTEND_BEFORE_ADD.md), and [`FEATURE_REGISTRY.md`](../../docs/FEATURE_REGISTRY.md).
6. After each item, **immediately** start the next `pending` row in [`docs/BACKLOG_QUEUE.md`](../../docs/BACKLOG_QUEUE.md) — no summary-only stop.

## Session arming

At loop start (first message or wake):

```bash
node .cursor/hooks/c2k-loop-arm.mjs --hours 2
```

This writes `.cursor/c2k-loop-active.json` so the `stop` hook chains the next item.

To end early: `node .cursor/hooks/c2k-loop-arm.mjs --stop`

## One item — exact steps

1. Read [`docs/BACKLOG_QUEUE.md`](../../docs/BACKLOG_QUEUE.md) — first row with Status `pending`.
2. Set that row to `in_progress` in the queue file.
3. **Audit** — read source doc + grep codebase; note privacy/mobile gaps.
4. **Plan** — 3–7 bullets, minimal diff, existing tables/routes only.
5. **Implement** — match repo conventions.
6. **Test** — `npm run typecheck -w @c2k/api`, `npm run typecheck -w web`, `npm run test -w @c2k/api` (fix until green or document blocker in queue Notes → `skipped`).
7. **UX pass** — mobile-first, 44px targets, no mock leak when API-backed.
8. **Docs** — update [`BACKLOG_QUEUE.md`](../../docs/BACKLOG_QUEUE.md) row Notes + [`HANDOFF.md`](../../docs/HANDOFF.md) if milestone-worthy; touch `FEATURE_REGISTRY` / `MASTER_NEXT_STEPS` / domain doc as needed.
9. Set queue row to `done`; clear `in_progress` if any stragglers.
10. If another `pending` row exists and loop is still armed, **go to step 1** in the same session without asking the user.

## Picking work

| Priority | Source |
|----------|--------|
| 1 | [`docs/BACKLOG_QUEUE.md`](../../docs/BACKLOG_QUEUE.md) table (top `pending`) |
| 2 | Never ECKE-only side quests unless queued |

Organizer-specific slices: note in [`HANDOFF.md`](../../docs/HANDOFF.md) when the item is organizer-scoped.

## Parallelism

Per [parallel-subagents rule](../../rules/parallel-subagents.mdc): parallel **read-only** audits across API vs web; **serialize** edits to the same files.

## Dynamic wake (/loop)

If using Cursor `/loop` or `AGENT_LOOP_WAKE_C2K`:

- After finishing an item, re-arm: `node .cursor/hooks/c2k-loop-arm.mjs --hours 2`
- End of turn: one-shot sleeper (PowerShell example):

```powershell
Start-Sleep -Seconds 90
Write-Output 'AGENT_LOOP_WAKE_C2K {"prompt":"Continue C2K autonomous feature loop per .cursor/skills/c2k-feature-loop/SKILL.md. Pick next pending row in docs/BACKLOG_QUEUE.md."}'
```

Use **90s** between items when the prior item completed cleanly; **300s** if tests were flaky and you retried.

## Stop conditions

Stop chaining only when:

- No `pending` rows remain, or
- `.cursor/c2k-loop-active.json` is missing / `until` timestamp passed, or
- User said stop, or
- Same item failed tests twice → mark `skipped` with Notes, continue to next `pending`
