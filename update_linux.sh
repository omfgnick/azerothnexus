#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

MODE_FILE=".azerothnexus-mode"
COMPOSE_FILE="docker-compose.yml"
MODE="development"
SEED_DEMO_DATA="${SEED_DEMO_DATA:-0}"
SKIP_PULL=0
INSTALL_ARGS=()

usage() {
  cat <<EOF
Usage: ./update_linux.sh [--prod|--dev] [--seed-demo-data] [--skip-pull]

Pull the latest Azeroth Nexus changes from Git and rebuild the Docker stack.

Options:
  --prod             Use docker-compose.prod.yml
  --dev              Use docker-compose.yml
  --seed-demo-data   Run the demo seed after the update
  --skip-pull        Rebuild with local files only, without git pull
  -h, --help         Show this help
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --prod)
      COMPOSE_FILE="docker-compose.prod.yml"
      MODE="production"
      INSTALL_ARGS+=(--prod)
      shift
      ;;
    --dev)
      COMPOSE_FILE="docker-compose.yml"
      MODE="development"
      INSTALL_ARGS+=(--dev)
      shift
      ;;
    --seed-demo-data)
      SEED_DEMO_DATA=1
      INSTALL_ARGS+=(--seed-demo-data)
      shift
      ;;
    --skip-pull)
      SKIP_PULL=1
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
  echo "This update script is intended for Linux environments." >&2
  exit 1
fi

if ! command -v git >/dev/null 2>&1; then
  echo "Git is required but was not found in PATH." >&2
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

if [[ ! -d .git ]]; then
  echo "No .git directory was found in $SCRIPT_DIR." >&2
  echo "Run this script from an Azeroth Nexus Git checkout." >&2
  exit 1
fi

git config core.fileMode false

if [[ -f "$MODE_FILE" && ! " ${INSTALL_ARGS[*]} " =~ " --prod " && ! " ${INSTALL_ARGS[*]} " =~ " --dev " ]]; then
  SAVED_MODE="$(tr -d '\r\n' < "$MODE_FILE" 2>/dev/null || true)"
  if [[ "$SAVED_MODE" == "production" ]]; then
    COMPOSE_FILE="docker-compose.prod.yml"
    MODE="production"
    INSTALL_ARGS+=(--prod)
  fi
fi

if [[ "$SKIP_PULL" != "1" ]]; then
  if [[ -n "$(git status --porcelain)" ]]; then
    echo "Working tree has local changes. Commit, stash, or discard them before updating." >&2
    exit 1
  fi

  CURRENT_BRANCH="$(git branch --show-current)"
  if [[ -z "$CURRENT_BRANCH" ]]; then
    echo "Could not determine the current Git branch." >&2
    exit 1
  fi

  if ! git remote get-url origin >/dev/null 2>&1; then
    echo "Git remote 'origin' is not configured." >&2
    exit 1
  fi

  echo "Fetching latest changes from origin/$CURRENT_BRANCH"
  git fetch origin "$CURRENT_BRANCH"

  echo "Pulling latest changes"
  git pull --ff-only origin "$CURRENT_BRANCH"
fi

for script in install_linux.sh update_linux.sh uninstall_linux.sh install.sh uninstall.sh; do
  if [[ -f "./$script" && ! -x "./$script" ]]; then
    chmod +x "./$script"
  fi
done

echo
echo "Rebuilding Azeroth Nexus using $COMPOSE_FILE"
./install_linux.sh "${INSTALL_ARGS[@]}"

echo
echo "Update complete."
echo "Mode: $MODE"
if [[ "$SEED_DEMO_DATA" == "1" ]]; then
  echo "Demo seed: enabled"
fi
