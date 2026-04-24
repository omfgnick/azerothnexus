#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

COMPOSE_FILE="docker-compose.yml"
MODE="development"
SEED_DEMO_DATA="${SEED_DEMO_DATA:-0}"

usage() {
  cat <<EOF
Usage: ./install_linux.sh [--prod] [--seed-demo-data]

This script expects to run from an existing local checkout of Azeroth Nexus.
To clone from GitHub and install in one step, use ./install_from_git_linux.sh instead.

Options:
  --prod             Use docker-compose.prod.yml
  --seed-demo-data   Run the demo seed after startup
  -h, --help         Show this help
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --prod)
      COMPOSE_FILE="docker-compose.prod.yml"
      MODE="production"
      shift
      ;;
    --seed-demo-data)
      SEED_DEMO_DATA=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if [[ "$(uname -s)" != "Linux" ]]; then
  echo "This installer is intended for Linux environments." >&2
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required but was not found in PATH." >&2
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose plugin is required but was not found." >&2
  exit 1
fi

if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "Created .env from .env.example"
fi

echo "Starting Azeroth Nexus in ${MODE} mode using ${COMPOSE_FILE}..."
docker compose -f "$COMPOSE_FILE" up --build -d

echo
echo "Stack started successfully."
if [[ "$MODE" == "production" ]]; then
  echo "Public entrypoint: http://localhost:8080"
else
  echo "Frontend: http://localhost:3000"
  echo "API docs: http://localhost:8000/docs"
fi

if [[ "$SEED_DEMO_DATA" == "1" ]]; then
  echo
  echo "Seeding demo data..."
  docker compose -f "$COMPOSE_FILE" exec -T api python scripts/seed.py
fi

echo
echo "Use ./uninstall_linux.sh to stop and remove the stack later."
