# Profile locations (US places seed)

## Rules

- **Default population threshold**: `10_000` (Census 2020 Decennial `P1_001N` per place).
- **Per-state floor**: If fewer than `5` places meet the threshold in a state, the top `5` places by population are included instead (so sparse states still have options).
- **Scope**: United States only — one `countries` row (`US`), 50 states + DC in `states`. Territories are excluded until explicitly added.

## Data source

- Population: US Census Bureau, **2020 Decennial** (`P1_001N`), via `api.census.gov`.
- Coordinates: optional in seed (`lat`/`lng` null in current pipeline); can be joined later from the 2020 Gazetteer.

## Regenerate seed file

From `packages/api` (requires network):

```bash
npm run build:places-data -w @c2k/api
```

Writes `packages/api/data/places-seed.json` (committed for reproducible installs).

## Load into Postgres

After schema push:

```bash
USE_DATABASE=true npm run db:push -w @c2k/api
USE_DATABASE=true npm run db:seed:locations -w @c2k/api
```

`db:seed:locations` is idempotent: it skips if `places` already has rows.

## API

- `GET /api/locations/countries`
- `GET /api/locations/states?country_id=<uuid>`
- `GET /api/locations/places?state_id=<uuid>` — ordered by population descending

Profile PATCH accepts optional `placeId`, `stateId`, `customLocation` (with `null` to clear). Display string `location` is derived on the server.
