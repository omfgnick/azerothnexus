#!/usr/bin/env bash
set -euo pipefail

REPO_URL="${AZEROTH_NEXUS_REPO_URL:-https://github.com/omfgnick/azerothnexus.git}"
BRANCH="${AZEROTH_NEXUS_BRANCH:-main}"
INSTALL_DIR="${AZEROTH_NEXUS_INSTALL_DIR:-$HOME/azerothnexus}"
SEED_DEMO_DATA="${SEED_DEMO_DATA:-0}"
MODE="production"
INSTALL_ARGS=()

usage() {
  cat <<EOF
Usage: ./install_from_git_linux.sh [--dir PATH] [--branch NAME] [--repo URL] [--prod|--dev] [--seed-demo-data]

Clone Azeroth Nexus directly from GitHub and start the Docker stack.

Options:
  --dir PATH         Destination checkout directory (default: $HOME/azerothnexus)
  --branch NAME      Branch to clone (default: main)
  --repo URL         Git repository URL (default: https://github.com/omfgnick/azerothnexus.git)
  --prod             Install in production mode with nginx on the public port
  --dev              Install in development mode
  --seed-demo-data   Run the demo seed after startup
  -h, --help         Show this help

Examples:
  ./install_from_git_linux.sh
  ./install_from_git_linux.sh --dir /opt/azerothnexus
  ./install_from_git_linux.sh --dir /opt/azerothnexus --dev
  curl -fsSL https://raw.githubusercontent.com/omfgnick/azerothnexus/main/install_from_git_linux.sh | bash
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dir)
      INSTALL_DIR="$2"
      shift 2
      ;;
    --branch)
      BRANCH="$2"
      shift 2
      ;;
    --repo)
      REPO_URL="$2"
      shift 2
      ;;
    --prod)
      MODE="production"
      INSTALL_ARGS=(--prod)
      shift
      ;;
    --dev)
      MODE="development"
      INSTALL_ARGS=(--dev)
      shift
      ;;
    --seed-demo-data)
      SEED_DEMO_DATA=1
      INSTALL_ARGS+=(--seed-demo-data)
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

if [[ "$MODE" == "production" && ! " ${INSTALL_ARGS[*]} " =~ " --prod " ]]; then
      INSTALL_ARGS+=(--prod)
fi

if [[ "$(uname -s)" != "Linux" ]]; then
  echo "This installer is intended for Linux environments." >&2
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

INSTALL_DIR="${INSTALL_DIR/#\~/$HOME}"

if [[ -e "$INSTALL_DIR" && ! -d "$INSTALL_DIR" ]]; then
  echo "Install path exists but is not a directory: $INSTALL_DIR" >&2
  exit 1
fi

if [[ -d "$INSTALL_DIR/.git" ]]; then
  echo "A Git checkout already exists at $INSTALL_DIR"
  echo "Use ./update_linux.sh there to pull the latest version." >&2
  exit 1
fi

if [[ -d "$INSTALL_DIR" ]] && [[ -n "$(find "$INSTALL_DIR" -mindepth 1 -maxdepth 1 -print -quit 2>/dev/null)" ]]; then
  echo "Install directory is not empty: $INSTALL_DIR" >&2
  echo "Choose another path with --dir or empty this directory first." >&2
  exit 1
fi

mkdir -p "$(dirname "$INSTALL_DIR")"

echo "Cloning Azeroth Nexus from $REPO_URL"
git clone --branch "$BRANCH" --single-branch "$REPO_URL" "$INSTALL_DIR"

cd "$INSTALL_DIR"

git config core.fileMode false

for script in install_linux.sh update_linux.sh uninstall_linux.sh install.sh uninstall.sh; do
  if [[ -f "./$script" && ! -x "./$script" ]]; then
    chmod +x "./$script"
  fi
done

echo
echo "Installing Azeroth Nexus from $INSTALL_DIR"
./install_linux.sh "${INSTALL_ARGS[@]}"

echo
echo "Install complete."
echo "Project directory: $INSTALL_DIR"
echo "Mode: $MODE"
if [[ "$SEED_DEMO_DATA" == "1" ]]; then
  echo "Demo seed: enabled"
fi
echo "Use ./update_linux.sh inside the project directory to pull future updates."
