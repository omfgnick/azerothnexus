#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

MODE_FILE=".azerothnexus-mode"
COMPOSE_FILE="docker-compose.yml"
MODE="development"
MODE_EXPLICIT=0
SEED_DEMO_DATA="${SEED_DEMO_DATA:-0}"
ENV_CREATED=0
ADMIN_TOKEN_GENERATED=0
ADMIN_TOKEN_WARNING=0

usage() {
  cat <<EOF
Usage: ./install_linux.sh [--prod|--dev] [--seed-demo-data]

This script expects to run from an existing local checkout of Azeroth Nexus.
To clone from GitHub and install in one step, use ./install_from_git_linux.sh instead.

Options:
  --prod             Use docker-compose.prod.yml
  --dev              Use docker-compose.yml
  --seed-demo-data   Run the demo seed after startup
  -h, --help         Show this help
EOF
}

load_env_value() {
  local key="$1"
  local default_value="$2"

  if [[ -f .env ]]; then
    local value
    value="$(grep -E "^${key}=" .env | tail -n 1 | cut -d= -f2- || true)"
    if [[ -n "$value" ]]; then
      echo "$value"
      return
    fi
  fi

  echo "$default_value"
}

set_env_value() {
  local key="$1"
  local value="$2"
  local tmp_file

  tmp_file="$(mktemp)"
  awk -F= -v key="$key" -v value="$value" '
    BEGIN { updated = 0 }
    index($0, key "=") == 1 {
      if (!updated) {
        print key "=" value
        updated = 1
      }
      next
    }
    { print }
    END {
      if (!updated) {
        print key "=" value
      }
    }
  ' .env > "$tmp_file"
  mv "$tmp_file" .env
}

generate_admin_token() {
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -hex 24
    return
  fi

  if [[ -r /dev/urandom ]] && command -v od >/dev/null 2>&1; then
    od -An -tx1 -N24 /dev/urandom | tr -d ' \n'
    return
  fi

  printf '%s%s%s%s' "$RANDOM" "$RANDOM" "$(date +%s)" "$RANDOM"
}

ensure_runtime_env() {
  local current_token
  local backup_dir
  local nginx_port

  backup_dir="$(load_env_value "BACKUP_DIR" "")"
  if [[ -z "$backup_dir" ]]; then
    set_env_value "BACKUP_DIR" "/var/backups/azerothnexus"
  fi

  if [[ "$MODE" == "production" ]]; then
    nginx_port="$(load_env_value "NGINX_PORT" "")"
    if [[ -z "$nginx_port" ]]; then
      set_env_value "NGINX_PORT" "80"
    fi
  fi

  current_token="$(load_env_value "ADMIN_API_TOKEN" "")"
  if [[ -z "$current_token" ]]; then
    set_env_value "ADMIN_API_TOKEN" "$(generate_admin_token)"
    ADMIN_TOKEN_GENERATED=1
  elif [[ "$ENV_CREATED" == "1" && "$current_token" == "change-this-ops-token" ]]; then
    set_env_value "ADMIN_API_TOKEN" "$(generate_admin_token)"
    ADMIN_TOKEN_GENERATED=1
  elif [[ "$current_token" == "change-this-ops-token" ]]; then
    ADMIN_TOKEN_WARNING=1
  fi
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --prod)
      COMPOSE_FILE="docker-compose.prod.yml"
      MODE="production"
      MODE_EXPLICIT=1
      shift
      ;;
    --dev)
      COMPOSE_FILE="docker-compose.yml"
      MODE="development"
      MODE_EXPLICIT=1
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

if [[ -f "$MODE_FILE" && "$MODE_EXPLICIT" != "1" ]]; then
  SAVED_MODE="$(tr -d '\r\n' < "$MODE_FILE" 2>/dev/null || true)"
  if [[ "$SAVED_MODE" == "production" ]]; then
    COMPOSE_FILE="docker-compose.prod.yml"
    MODE="production"
  fi
fi

if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "Created .env from .env.example"
  ENV_CREATED=1
fi

ensure_runtime_env

printf '%s\n' "$MODE" > "$MODE_FILE"

echo "Starting Azeroth Nexus in ${MODE} mode using ${COMPOSE_FILE}..."
docker compose -f "$COMPOSE_FILE" up --build -d

echo
echo "Stack started successfully."
if [[ "$MODE" == "production" ]]; then
  NGINX_PORT_VALUE="$(load_env_value "NGINX_PORT" "80")"
  if [[ "$NGINX_PORT_VALUE" == "80" ]]; then
    echo "Public entrypoint: http://localhost"
    echo "Admin UI: http://localhost/admin"
  else
    echo "Public entrypoint: http://localhost:${NGINX_PORT_VALUE}"
    echo "Admin UI: http://localhost:${NGINX_PORT_VALUE}/admin"
  fi
else
  WEB_PORT_VALUE="$(load_env_value "WEB_PORT" "3000")"
  API_PORT_VALUE="$(load_env_value "API_PORT" "8000")"
  echo "Frontend: http://localhost:${WEB_PORT_VALUE}"
  echo "Admin UI: http://localhost:${WEB_PORT_VALUE}/admin"
  echo "API docs: http://localhost:${API_PORT_VALUE}/docs"
fi

echo "Backup storage: $(load_env_value "BACKUP_DIR" "/var/backups/azerothnexus") (Docker volume: backup_data)"

if [[ "$ADMIN_TOKEN_GENERATED" == "1" ]]; then
  echo "Generated ADMIN_API_TOKEN and stored it in .env"
elif [[ "$ADMIN_TOKEN_WARNING" == "1" ]]; then
  echo "Warning: ADMIN_API_TOKEN is still using the default placeholder. Change it in .env before exposing the stack publicly."
fi

if [[ "$SEED_DEMO_DATA" == "1" ]]; then
  echo
  echo "Seeding demo data..."
  docker compose -f "$COMPOSE_FILE" exec -T api python scripts/seed.py
fi

echo
echo "Use ./uninstall_linux.sh to stop and remove the stack later."
