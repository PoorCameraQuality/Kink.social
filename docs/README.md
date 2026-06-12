# C2K documentation index

**Doc sync (2026-06-06):** Critical docs updated in **batches of 5** vs codebase (grep/read only — no test/build). **Complete** through deploy, architecture, design, T&S, QA, and strategy docs. Re-run `scripts/build-critical-docs-zip.ps1` (or Desktop zip recipe in session notes) after major doc passes.

**Start here** (~10 minutes): [`MASTER_NEXT_STEPS.md`](./MASTER_NEXT_STEPS.md) §1 read order.

## Canonical (live)

| Doc | Purpose |
|-----|---------|
| [`C2K-STRATEGIC-GUIDANCE.md`](./C2K-STRATEGIC-GUIDANCE.md) | Product strategy + binding agent rules |
| [`FEATURE_REGISTRY.md`](./FEATURE_REGISTRY.md) | Routes, API modules, env — **single source of truth** |
| [`MASTER_NEXT_STEPS.md`](./MASTER_NEXT_STEPS.md) | Session priorities, backlog table, verification |
| [`PROJECT_ROADMAP.md`](./PROJECT_ROADMAP.md) | Work-order tracks A–D |
| [`BACKLOG_QUEUE.md`](./BACKLOG_QUEUE.md) | Autonomous agent queue |
| [`HANDOFF.md`](./HANDOFF.md) | Rolling engineer/agent session handoff |
| [`architecture/README.md`](./architecture/README.md) | Runtime domains, WS, workers |
| [`PILOT_READINESS.md`](./PILOT_READINESS.md) | Alpha/pilot operator gate |
| [`C2K-DESIGN-SYSTEM.md`](./C2K-DESIGN-SYSTEM.md) | Visual guardrails, `--dc-*` theme contract |
| [`DESIGN_BIBLE.md`](./DESIGN_BIBLE.md) | Design topic index (01–08) |

## Active workstreams

| Doc | Purpose |
|-----|---------|
| [`UX_REFACTOR_BACKLOG.md`](./UX_REFACTOR_BACKLOG.md) | UI-DISC-* and UX debt queue |
| [`UI_DISCOVER_REFRESH_PROGRESS.md`](./UI_DISCOVER_REFRESH_PROGRESS.md) | Discover refresh shells + nav debt |
| [`SOCIAL_GRAPH_FETLIFE_PARITY_BACKLOG.md`](./SOCIAL_GRAPH_FETLIFE_PARITY_BACKLOG.md) | Phase 2 social (SG-###) |
| [`LEGAL-PROFILE-TRUST-SAFETY-MASTER-PLAN.md`](./LEGAL-PROFILE-TRUST-SAFETY-MASTER-PLAN.md) | Legal profile + T&S phases |
| [`plans/SCOPED-MOD-1-ORCHESTRATION.md`](./plans/SCOPED-MOD-1-ORCHESTRATION.md) | Scoped mod build — **complete 2026-06-06** |
| [`plans/MODERATION-TOOLS-PLANNING-BRIEF.md`](./plans/MODERATION-TOOLS-PLANNING-BRIEF.md) | Moderation tooling reference (alpha pass complete) |

## Folders

| Path | Contents |
|------|----------|
| [`adr/`](./adr/) | Architecture decision records |
| [`architecture/`](./architecture/) | Runtime architecture series (01–13) |
| [`audits/trust-and-safety/`](./audits/trust-and-safety/) | T&S implementation refs + wave ledger |
| [`audits/ui/`](./audits/ui/) | UI QA system (inventory, E2E, manual checklist) |
| [`design/`](./design/) | Design topic specs (01–08) |
| [`handoff/`](./handoff/) | GPT bundle + manual smoke checklists |
| [`plans/`](./plans/) | Active orchestration plans only |
| [`privacy/`](./privacy/) | Legal/compliance ops |
| [`trust-safety/`](./trust-safety/) | Policy matrix, gap audits, playbooks |
| [`archive/`](./archive/) | **Historical** — superseded audits, completed plans, session logs |

## External AI handoff

`npm run handoff:context` → [`handoff/C2K_PROJECT_CONTEXT_LATEST.txt`](./handoff/C2K_PROJECT_CONTEXT_LATEST.txt)

See [`handoff/README.md`](./handoff/README.md).
