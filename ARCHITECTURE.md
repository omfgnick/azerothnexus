# Architecture

## Product mode

Azeroth Nexus is configured as a **public consultation platform**. Visitors can browse rankings, guilds, characters, raids and activity without user accounts. Operational actions stay behind a simple token-protected maintenance surface.

## API modules

- `api/routes/health.py` — status and provider configuration state
- `api/routes/rankings.py` — guild and Mythic+ ladders with snapshot fallback
- `api/routes/search.py` — public search and autocomplete by entity, region, realm and guild context
- `api/routes/guilds.py` — guild detail page data and guild score history
- `api/routes/characters.py` — character detail page data and character score history
- `api/routes/compare.py` — side-by-side guild and character comparisons
- `api/routes/raids.py` — current raid dashboard
- `api/routes/mythic.py` — Mythic+ dashboard and meta pulse
- `api/routes/activity.py` — public activity feed
- `api/routes/admin.py` — protected maintenance endpoints

## Services

- `RankingEngine` — computes ladders and persists snapshots
- `HistoryService` — exposes entity-level score evolution for guilds and characters
- `ComparisonService` — builds premium compare responses with dimension deltas and verdicts
- `ActivityService` — merges kills, sync jobs and snapshot rebuilds into a public feed
- `SearchService` — multi-entity public search with autocomplete, filters and result scoring
- `SyncScheduler` — build sync plans and simulate a demo sync
- `ProviderService` — aggregates provider health checks

## Providers

- `BlizzardProvider` — app token flow and WoW endpoint URL builders
- `RaiderIOProvider` — query builders for guild and character profile endpoints
- `WarcraftLogsProvider` — OAuth client credentials preparation and GraphQL query templates

## Persistence model

Main entities include guilds, characters, raids, bosses, Mythic runs, sync jobs, ranking snapshots and entity score snapshots. Ladder snapshots let the public pages read stable, precomputed payloads without expensive recomputation on every request, while entity score snapshots power public history charts and compare views.

## Next suggested layers

1. Provider sync execution with retry, backoff and rate-limit handling
2. Realm/season aware snapshot partitioning
3. Rich guild comparison pages and raid composition analytics
4. Background jobs wired to Redis broker for repeatable sync cycles
5. Search popularity tracking and hot-query analytics
