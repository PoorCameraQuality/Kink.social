# Legal-risk principle (C2K)

**Implementation plan:** [`../LEGAL-PROFILE-TRUST-SAFETY-MASTER-PLAN.md`](../LEGAL-PROFILE-TRUST-SAFETY-MASTER-PLAN.md)

This document states the repo principle for **lawful compliance minimization** — not evasion. We reduce legal and privacy risk by collecting less, retaining less, and gating high-risk features until policy and process are ready.

## Core principles

1. **Collect the minimum** needed for the product story (organizer workflows, member safety, authenticated community).
2. **Default-deny high-risk surfaces** at launch (explicit sexual media OFF; nudity OFF unless explicitly enabled).
3. **Affirm age and terms at signup** — hard 18+ checkboxes with stored timestamps and policy version.
4. **Retention limits** — security logs and raw IPs short; moderation records longer; deleted accounts purged on schedule unless legally held.
5. **Legal holds before deletion** — no automated purge when `legal_holds.active` covers the target.
6. **Humans decide moderation** — reports, queues, and scanners inform staff; no autonomous takedown.
7. **Extend T&S stack** — one reports/cases/queues model; feature flags gate code paths instead of deleting safety infrastructure.

## v1 launch posture

| Control | Default | Enable when |
|---------|---------|-------------|
| `C2K_ALLOW_EXPLICIT_MEDIA` / `ALLOW_EXPLICIT_MEDIA` | `false` | Operator legal review + `MEDIA_POLICY_MODE=attested_explicit_beta` |
| `C2K_ALLOW_NUDITY` / `ALLOW_NUDITY` | `false` | Product/legal approval for adult-themed non-explicit uploads |
| 18+ signup | Required | Always |
| PhotoDNA / NCMEC automation | Off | Separate epic — not v1 |

## Operator checklist

- [ ] Confirm env flags in production deploy manifest
- [ ] Review [data-inventory.md](./data-inventory.md) against actual schema quarterly
- [ ] Register subprocessors in [vendor-registry.md](./vendor-registry.md)
- [ ] Run retention sweep on worker schedule after purge logic ships (Epic 5+)

## Related docs

- [data-inventory.md](./data-inventory.md)
- [vendor-registry.md](./vendor-registry.md)
- [../audits/trust-and-safety/V1_EXPLICIT_MEDIA_POLICY.md](../audits/trust-and-safety/V1_EXPLICIT_MEDIA_POLICY.md)
