# Policy coverage matrix (C2K)

**Last updated:** 2026-06-06  
**Purpose:** Map policy areas → public pages → report reasons → moderation path. Competitive-research checklist; **original C2K language only**.  
**Orchestration:** [`plans/POLICY-COVERAGE-GAP-AUDIT-ORCHESTRATION.md`](../plans/POLICY-COVERAGE-GAP-AUDIT-ORCHESTRATION.md)

**Source of truth:** `@c2k/shared` [`moderation-types.ts`](../../packages/shared/src/moderation-types.ts) — 15 canonical `PolicyReason` codes, default severity, queue routing, P0 notify list. Intake: `POST /api/v1/moderation/reports` (`moderation-ts-reports.ts`).

### Canonical reason codes (quick reference)

| Code | Default queue | P0? |
|------|---------------|-----|
| `MINOR_SAFETY`, `CSAM_SUSPECTED` | `MINOR_SAFETY_RESTRICTED` | Yes |
| `NCII`, `AI_DEEPFAKE_NCII`, `HIDDEN_CAMERA_LEAKED` | `NCII_URGENT` | Yes |
| `TRAFFICKING_COERCION` | `GENERAL_REVIEW` | Yes |
| `DOXXING_OUTING`, `HARASSMENT_THREATS`, `COMMERCIAL_SEX_SOLICITATION`, `ILLEGAL_GOODS_SERVICES` | `GENERAL_REVIEW` | No |
| `IMPERSONATION`, `CONSENT_SAFETY` | `GENERAL_REVIEW` | No |
| `EXPLICIT_VISIBILITY_VIOLATION` | `MEDIA_REVIEW` | No |
| `SPAM_SCAM` | `SPAM_ABUSE` | No |
| `OTHER` (note required) | `GENERAL_REVIEW` | No |

Legacy web categories map at intake via `mapLegacyReportCategoryToPolicyReason()` — do not store legacy strings on new cases.

| Policy area | Public page / section | Report reason (canonical) | Who can report | Local / scope mod | Platform T&S | Escalate? | Audit | Alpha status | Future backlog |
|-------------|----------------------|---------------------------|----------------|-------------------|--------------|-----------|-------|--------------|----------------|
| Copyright / DMCA | `/dmca`, `/policies/dmca` | Formal: DMCA intake API; UGC: `OTHER` + detail | Copyright owner / agent | n/a | DMCA admin (`/moderation/dmca`) | If abuse of process | DMCA case audit | **Covered** | Designated agent registration |
| Stolen / questionable copyright | `/guidelines`, `/dmca` | `OTHER` or `SPAM_SCAM` | Anyone | Hide if scope owner | Review | If repeat | Scoped/platform | **Policy** | Faster non-DMCA path UI |
| Person in picture / consent withdrawal | `/adult-content-consent`, `/ncii` | `NCII`, `CONSENT_SAFETY`, `HIDDEN_CAMERA_LEAKED` | Depicted person, member | Hide in scope | `NCII_URGENT` queue | Always for NCII | Case + audit | **Covered** (intake) | Emergency restrict + hash re-upload block |
| AI deepfake intimate imagery | `/ncii`, `/adult-content-consent` | `AI_DEEPFAKE_NCII` | Depicted person, member | Hide in scope | `NCII_URGENT` (P0) | Always | Case + audit | **Covered** (intake) | Dedicated takedown workflow |
| Off-site repost of member content | `/guidelines`, `/privacy` | `CONSENT_SAFETY`, `DOXXING_OUTING` | Member | Limited | Review | Privacy harm | Audit | **Policy** | No off-site enforcement promise |
| Screenshots / spotting / shame | `/guidelines`, `/ncii` | `DOXXING_OUTING`, `HARASSMENT_THREATS` | Target, witness | Hide/remove | Review | Outing/doxxing | Audit | **Policy** | — |
| Fantasy pushing / unwanted sexual comments | `/guidelines` | `CONSENT_SAFETY`, `HARASSMENT_THREATS` | Targeted member | Hide in public spaces | Review | Harassment pattern | Audit | **Policy** | DM consent tools if DMs alpha |
| Adult content mislabeled / public leak | `/adult-content-consent`, `/guidelines` | `EXPLICIT_VISIBILITY_VIOLATION` | Member | Hide in scope | `MEDIA_REVIEW` | If repeat / scanner flag | Audit | **Covered** (intake) | Automated scanner → case wiring |
| Sock puppets / ban evasion | `/guidelines`, `/terms` | `IMPERSONATION`, `SPAM_SCAM`, `OTHER` | Member, mod | Scope ban | Risk review | Cross-scope | Audit + flags | **Policy** | Linked-account detection |
| Hateful conduct | `/guidelines` | `HARASSMENT_THREATS` | Target, witness | Hide/remove | Review | Identity-based harm | Audit | **Covered** | No ML classifier |
| Body shaming | `/guidelines` | `HARASSMENT_THREATS` | Target | Hide/remove | If targeted pattern | Escalate if pile-on | Audit | **Policy** | — |
| Kink shaming | `/guidelines` | `HARASSMENT_THREATS` | Target | Hide/remove | If pattern | Escalate if cross-scope | Audit | **Policy** | — |
| Harmful disruption / personal attacks | `/guidelines` | `HARASSMENT_THREATS` | Participants | Lock/hide | Review | Threats | Audit | **Policy** | — |
| Misleading / deceptive profiles | `/guidelines`, `/terms` | `IMPERSONATION`, `SPAM_SCAM` | Member | n/a | Review | Scam | Audit | **Policy** | — |
| Staff / mod / organizer impersonation | `/guidelines`, `/policies/moderator-code-of-conduct` | `IMPERSONATION` | Anyone | n/a | **High** | Coercion/scam | Audit | **Covered** | Verified badges later |
| Illegal drugs / controlled items | `/guidelines`, `/terms` | `ILLEGAL_GOODS_SERVICES` | Member | Hide/remove | Review | Always | Audit | **Covered** | — |
| Sex work / exchange of sex acts | `/guidelines`, `/terms` | `COMMERCIAL_SEX_SOLICITATION`, `TRAFFICKING_COERCION` | Member | Hide/remove | Review | **Always** (P0 for trafficking) | Audit | **Covered** | — |
| Minor safety / under-18 | `/policies/minor-safety`, `/terms` | `MINOR_SAFETY`, `CSAM_SUSPECTED` | Anyone | n/a | `MINOR_SAFETY_RESTRICTED` (P0) | Always | Case + audit | **Covered** (intake) | Critical queue UI, NCMEC workflow |
| Commercial spam / clickbait | `/guidelines`, `/vendor-organizer-terms` | `SPAM_SCAM` | Member | Hide/remove | `SPAM_ABUSE` | Scam events | Audit | **Policy** | Vendor role gating |
| Group guidelines | `/policies/groups`, `/guidelines` | Scope + platform reasons | Member | Group mod | Override | Serious categories | Scoped audit | **Covered** | Inactive owner transfer — backlog |
| Group leader guidelines | `/policies/groups` | Leadership abuse → platform | Member | Recusal required | **Platform** | Leadership abuse | Audit | **Covered** | Scoped mod UI |
| Event guidelines | `/policies/events` | `SPAM_SCAM`, local rules | Member | Event host | Platform | Fake/spam events | Audit | **Covered** | — |
| Submitting reports | `/support`, `/policies/appeals` | All 15 `PolicyReason` values via `TsReportModal` | Member (varies) | n/a | T&S queues | P0 auto-route | Case timeline | **Covered** | Mock-only surfaces deferred |
| Appeals | `/policies/appeals` | Case appeal schema | Affected member | n/a | `APPEALS` queue (skeleton) | — | Audit | **Policy + skeleton** | Full appeals UI backlog |
| Moderator / team code of conduct | `/policies/moderator-code-of-conduct` | Report staff via `/support` | Member | Recusal | **Platform** | Always | Audit | **Covered** | One-strike power abuse; no appeal |
| UGC / platform content role | `/policies/adult-content-records` | n/a (legal page) | n/a | n/a | n/a | n/a | n/a | **Published posture** | Counsel-reviewed statement |
| Friend/following limits | — | n/a | n/a | n/a | n/a | n/a | n/a | **Backlog** | Only if abuse/perf requires |

## Policy page index

Hub: [`/policies`](/policies) — see [`policies/POLICY-HUB-ARCHITECTURE.md`](../policies/POLICY-HUB-ARCHITECTURE.md).

## DMCA vs consent / NCII

| Path | Use for |
|------|---------|
| **DMCA intake** (`POST /api/v1/dmca/intake`, `/dmca`) | Copyright claims by owner/agent only |
| **NCII / consent reports** (`/ncii`, in-product `ReportAction` → `NCII`, `CONSENT_SAFETY`, `HIDDEN_CAMERA_LEAKED`, `AI_DEEPFAKE_NCII`) | Non-consensual intimate imagery, consent withdrawal, person-in-picture — **not** DMCA |

Counter-notice restoration window: **not less than 10 nor more than 14 business days** after valid counter-notice unless claimant files court action (17 U.S.C. § 512).

## Moderation path (shipped)

1. Member submits `POST /api/v1/moderation/reports` with `policyReason` + `targetType`/`targetId`.
2. Intake creates `moderation_cases` + `moderation_reports` + content snapshot; scoped mirror row when org/group/event.
3. `queueForPolicyReason()` assigns queue; P0 reasons enqueue `p0_report_notify`.
4. Platform mods triage via `/moderation/cases`; scoped mods via org/group panels.
5. Enforcement: scoped hide/lock/ban APIs; platform case actions + rule-of-two `moderation_actions`.

See [`SCOPED_MODERATION_GAP_AUDIT.md`](./SCOPED_MODERATION_GAP_AUDIT.md) for per-surface scorecard and [`../audits/trust-and-safety/POLICY_TAXONOMY.md`](../audits/trust-and-safety/POLICY_TAXONOMY.md) for full enum tables.
