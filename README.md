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
- `NEXT_PUBLIC_API_BASE_URL`
- `ADMIN_API_TOKEN`
- `BLIZZARD_CLIENT_ID`
- `BLIZZARD_CLIENT_SECRET`
- `WARCRAFTLOGS_CLIENT_ID`
- `WARCRAFTLOGS_CLIENT_SECRET`

## Public search endpoints

- `GET /api/search?q=...&region=...&realm=...&guild=...&type=...`
- `GET /api/search/autocomplete?q=...`

## Demo admin endpoints

These endpoints are **not public**. Send the header `X-Admin-Token: <your token>`.

- `GET /api/admin/sync-plan`
- `GET /api/admin/providers/health`
- `POST /api/admin/sync/demo-run`

## Seed data

To seed demo data inside the API container:

```bash
docker compose exec api python /app/scripts/seed.py
```

## Notes

- No scraping of WowProgress is used.
- Public-facing usage does not require login.
- The provider clients are prepared for current official/public integrations, but full live sync orchestration still needs the next rounds.
- Public compare, history, and search views are now included to make the ranking product feel closer to a modern premium competitive dashboard.
- `install_from_git_linux.sh` clones the repository first, then delegates to `install_linux.sh`.
- `update_linux.sh` requires a clean working tree before running `git pull --ff-only` and rebuilding the stack.
- Linux Git installs set `core.fileMode=false` locally so script permission bits do not dirty the checkout after bootstrap.
- The selected Linux runtime mode is stored locally in `.azerothnexus-mode`, so updates keep using production or development consistently.
