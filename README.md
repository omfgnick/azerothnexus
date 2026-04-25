# Azeroth Nexus

A public World of Warcraft progression and ranking platform scaffold inspired by the product direction in the project brief, but with its own architecture, visual identity and provider-driven backend. It is designed for **public consultation** without end-user login flows. Maintenance endpoints are isolated behind an optional admin token.

## Stack

- Web: Next.js App Router + TypeScript + TailwindCSS
- API: FastAPI + SQLAlchemy 2 + Pydantic Settings
- Data: PostgreSQL + Redis
- Jobs: Dramatiq scaffold
- Infra: Docker Compose + Nginx

## Current delivery

This package now includes:

- public home and ranking dashboard
- premium composite rank system with tiers, grades, trends, confidence, and score notes
- guild and character profile endpoints with public profile pages
- history endpoints for guild and character score evolution
- side-by-side guild and character comparison intelligence
- public activity feed
- public search and autocomplete by name, realm, region and guild
- persisted ranking snapshots with fallback to computed ladders
- provider scaffolds for Blizzard, Raider.IO and Warcraft Logs
- separate admin sanctum with overview, integrations, backups, and logs
- runtime integration settings persisted from the admin UI
- full JSON backup exports stored in a persistent Docker volume
- request audit logging plus operational timeline for sync and admin actions
- Linux install, Git bootstrap, update, and uninstall scripts
- demo sync endpoint protected by `X-Admin-Token`

## Quick start (Linux)

Install directly from GitHub in production mode with no port in the URL:

```bash
curl -fsSL https://raw.githubusercontent.com/omfgnick/azerothnexus/main/install_from_git_linux.sh | bash
```

Install into a custom directory in production mode:

```bash
curl -fsSL https://raw.githubusercontent.com/omfgnick/azerothnexus/main/install_from_git_linux.sh | bash -s -- --dir /opt/azerothnexus
```

Use development mode only when you explicitly want ports like `3000` and `8000`:

```bash
curl -fsSL https://raw.githubusercontent.com/omfgnick/azerothnexus/main/install_from_git_linux.sh | bash -s -- --dev
```

If you already have a local checkout:

```bash
chmod +x install_linux.sh update_linux.sh uninstall_linux.sh
./install_linux.sh
```

Production compose:

```bash
./install_linux.sh --prod
```

The Git bootstrap installer uses production mode by default and remembers that mode for future `./update_linux.sh` runs. Production also defaults to `NGINX_PORT=80`, so the site opens without a port in the URL.

The development stack keeps Postgres and Redis internal to Docker by default, so an existing local database on `5432` or Redis on `6379` will not block startup.

On a fresh Linux install, `install_linux.sh` now generates a secure `ADMIN_API_TOKEN` automatically when `.env` is first created. The value is stored in `.env`, and the admin UI is available at `/admin`.

Update an existing Git-based install:

```bash
./update_linux.sh
```

Update in production mode:

```bash
./update_linux.sh --prod
```

Stop and remove containers:

```bash
./uninstall_linux.sh
```

Remove containers and volumes:

```bash
./uninstall_linux.sh --purge-data
```

## Environment

Copy `.env.example` to `.env` and set what you need.

Important variables:

- `DATABASE_URL`
- `REDIS_URL`
- `ADMIN_API_TOKEN`
- `BACKUP_DIR`
- `BLIZZARD_CLIENT_ID`
- `BLIZZARD_CLIENT_SECRET`
- `RAIDERIO_API_BASE_URL`
- `WARCRAFTLOGS_CLIENT_ID`
- `WARCRAFTLOGS_CLIENT_SECRET`

## Admin and operations

The protected admin UI lives at:

- production: `http://your-host/admin`
- development: `http://your-host:3000/admin`

From the admin area you can now:

- view operational health and recent sync activity
- trigger tracked-entity refreshes
- configure Blizzard, Raider.IO, and Warcraft Logs integration settings
- generate and download JSON backups
- inspect request logs, admin actions, and sync timeline events

The web app calls these routes server-side with `ADMIN_API_TOKEN`, so the browser never needs the raw token directly.

## Public search endpoints

- `GET /api/search?q=...&region=...&realm=...&guild=...&type=...`
- `GET /api/search/autocomplete?q=...`

## Admin endpoints

These endpoints are **not public**. Send the header `X-Admin-Token: <your token>`.

- `GET /api/admin/dashboard`
- `GET /api/admin/sync-plan`
- `GET /api/admin/providers/health`
- `GET /api/admin/settings/integrations`
- `PUT /api/admin/settings/integrations`
- `GET /api/admin/logs`
- `GET /api/admin/backups`
- `POST /api/admin/backups`
- `GET /api/admin/backups/{filename}`
- `POST /api/admin/refresh/all`
- `POST /api/admin/refresh/guild/{region}/{realm}/{guild_name}`
- `POST /api/admin/refresh/character/{region}/{realm}/{character_name}`
- `POST /api/admin/sync/demo-run`

## Seed data

To seed demo data inside the API container:

```bash
docker compose exec api python /app/scripts/seed.py
```

## Notes

- No scraping of WowProgress is used.
- Public-facing usage does not require login.
- The provider clients can still read from environment variables, but the preferred operational flow is to manage them from `/admin/integrations`.
- Public compare, history, and search views are now included to make the ranking product feel closer to a modern premium competitive dashboard.
- `install_from_git_linux.sh` clones the repository first, then delegates to `install_linux.sh`.
- `update_linux.sh` requires a clean working tree before running `git pull --ff-only` and rebuilding the stack.
- Linux Git installs set `core.fileMode=false` locally so script permission bits do not dirty the checkout after bootstrap.
- The selected Linux runtime mode is stored locally in `.azerothnexus-mode`, so updates keep using production or development consistently.
- Backups are stored in the Docker named volume `backup_data`. `./uninstall_linux.sh --purge-data` removes both PostgreSQL data and backup files.
