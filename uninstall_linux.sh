#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

COMPOSE_FILE="docker-compose.yml"
PURGE_DATA=0
REMOVE_IMAGES=0

usage() {
  cat <<EOF
Usage: ./uninstall_linux.sh [--prod] [--purge-data] [--remove-images]

Options:
  --prod           Use docker-compose.prod.yml
  --purge-data     Remove named volumes (this deletes Postgres data)
  --remove-images  Remove locally built images used by the stack
  -h, --help       Show this help
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --prod)
      COMPOSE_FILE="docker-compose.prod.yml"
      shift
      ;;
    --purge-data)
      PURGE_DATA=1
      shift
      ;;
    --remove-images)
      REMOVE_IMAGES=1
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
  echo "This uninstall script is intended for Linux environments." >&2
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

DOWN_ARGS=( -f "$COMPOSE_FILE" down --remove-orphans )
if [[ "$PURGE_DATA" == "1" ]]; then
  DOWN_ARGS+=( -v )
fi
if [[ "$REMOVE_IMAGES" == "1" ]]; then
  DOWN_ARGS+=( --rmi local )
fi

echo "Removing Azeroth Nexus stack using ${COMPOSE_FILE}..."
docker compose "${DOWN_ARGS[@]}"

echo "Stack removed."
if [[ "$PURGE_DATA" == "1" ]]; then
  echo "Database volume and persistent data were also removed."
fi
