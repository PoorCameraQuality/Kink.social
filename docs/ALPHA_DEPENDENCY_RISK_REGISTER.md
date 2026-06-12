# Alpha dependency risk register

Generated during controlled-alpha hardening. Run `npm audit --omit=dev` before wider launch.

| Package | Severity | Reachable in alpha? | Public path? | Mitigation | Blocks alpha? |
|---------|----------|---------------------|--------------|------------|---------------|
| shell-quote (via concurrently) | critical | No — dev script only | No | Dev dependency; not in prod Docker image runtime | **No** |
| react-router / react-router-dom | high | Yes — client bundle | Yes (browser) | Upgrade to patched 7.14.3+ before wider launch; alpha invite-only limits exposure | **No** (monitor) |
| fastify | high | Yes — API server | Yes | Upgrade to 5.8.5+; trust proxy enabled; API not exposed except via Caddy | **No** (monitor) |
| vite | high | No — build tool only | No | Dev/build only; not in prod nginx runtime | **No** |
| drizzle-orm | high | Yes — query builder | Indirect | Upgrade to 0.45.2+ in post-alpha window; audit uses parameterized queries | **No** (monitor) |
| nodemailer | high | Yes — SMTP transport | No outbound injection surface in reset flow | Upgrade to 8.0.11+; fixed recipient from DB only | **No** (monitor) |
| xlsx | high | Yes — organizer import | Organizer-only | **Alpha:** disable bulk XLSX import UI or accept organizer-only risk; no public upload parser | **No** (documented) |
| picomatch | high | Dev/build transitive | No | Upgrade via npm audit fix | **No** |
| fast-xml-parser (AWS SDK) | high | Yes — S3 client | No user XML input | AWS SDK transitive; keep SDK updated | **No** |
| file-type | moderate | Yes — upload validation | Upload route | Upgrade post-alpha; validates magic bytes | **No** |

## Actions taken for alpha

- Documented all high/critical findings; no critical **reachable** production runtime issues remain unmitigated.
- `shell-quote` critical is dev-only (`concurrently`).
- Upload/import surfaces that use vulnerable parsers are disabled or organizer-scoped.

## Before wider launch

1. `npm audit fix` for safe patches.
2. Upgrade `fastify`, `react-router-dom`, `nodemailer`, `drizzle-orm` intentionally with regression tests.
3. Re-run `npm run verify:alpha` and `npm run test:db`.
