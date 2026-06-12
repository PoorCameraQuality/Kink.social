# C2K handoff artifacts (for GPT / external reviewers)



**Regenerate:** `npm run handoff:context` (from repo root)



**Refresh policy:** Update the handoff bundle **only after major milestones** (e.g. LEGAL-ALPHA-1 smoke pass, PILOT-GAP-AUDIT-1 sign-off, scoped-mod minimum ship) — **not every session**. Manual checklists live under `docs/handoff/` and do not require bundle regeneration.



## Files (committed)



| File | Purpose |

|------|---------|

| `C2K_PROJECT_CONTEXT_LATEST.txt` | Stable upload target — copy from dated output after `handoff:context` |

| `LEGAL-ALPHA-1-MANUAL-SMOKE.md` | Product-owner manual smoke before freezing LEGAL-ALPHA-1 |

| `PHOTO-UPLOAD-VPS-FIX-2026-06-11.md` | Production upload hang + empty gallery — root cause, code changes, deploy, verification |

| `PHOTO-UPLOAD-SYSTEM-HANDOFF.md` | Full profile photo / upload architecture reference |

| `SESSION-2026-06-11-MOBILE-AUTH-MAIL.md` | Mobile UX, auth gate, landing cleanup, account welcome email — deploy + smoke |



## Generated (do not commit)



`handoff:context` writes dated bundles and `docs-index.txt` locally. Add to `.gitignore` if they reappear after regeneration.



## What to upload to GPT (priority order)



1. `C2K_PROJECT_CONTEXT_LATEST.txt` — best single upload

2. Or separately: `docs/LEGAL-PROFILE-TRUST-SAFETY-MASTER-PLAN.md` + `docs/BACKLOG_QUEUE.md`

3. After each worker: `git status` / `git log` if using git



## Do not include



- `.env`, secrets, API keys

- Production database dumps

- Private user data, session cookies

- Real moderation evidence / CSAM samples



## Screenshots (manual)



Capture with dev stack + platform admin session; store under:



- `docs/audits/trust-and-safety/screenshots/` — moderation dashboard, case detail

- Signup, footer, settings — capture when LEGAL-ALPHA-1 manual smoke passes ([`LEGAL-ALPHA-1-MANUAL-SMOKE.md`](./LEGAL-ALPHA-1-MANUAL-SMOKE.md))



Suggested routes: `/moderation/dashboard`, `/moderation/cases/:id`, register/signup, footer, account settings.



## Git note



If `git` is unavailable in the workspace, the bundle uses a filesystem walk instead of `git ls-files`. Initialize git or run the generator from a git clone for accurate status/log.

