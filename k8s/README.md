# Kubernetes manifests

Templates for production API + worker. **Do not apply blindly.**

**Start here:** [`docs/SERVER_MOUNT_RUNBOOK.md`](../docs/SERVER_MOUNT_RUNBOOK.md)

| File | Purpose |
|------|---------|
| `base/namespace.yaml` | `c2k` namespace |
| `base/configmap.yaml` | Non-secret API config |
| `base/secret.example.yaml` | Copy → `secret.yaml` (gitignored), fill mail + DB + auth |
| `base/api-deployment.yaml` | API (default **2** replicas — enable Redis WS bridge) |
| `base/worker-deployment.yaml` | BullMQ worker (same secret as API for mail) |

Mail sign-off after deploy: [`docs/PROD_SMTP_K8S_CHECKLIST.md`](../docs/PROD_SMTP_K8S_CHECKLIST.md)
