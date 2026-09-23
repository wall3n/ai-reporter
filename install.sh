#!/usr/bin/env sh
# ==============================================================================
# AI-Reporter Installer
# https://github.com/wall3n/ai-reporter
#
# Install via curl:
#   curl -fsSL https://raw.githubusercontent.com/wall3n/ai-reporter/main/install.sh | bash
#
# Supported OS: macOS (Darwin) & Linux
# Prerequisites: Node.js >= 22 (for native node:sqlite engine)
# ==============================================================================
set -eu

REPO="${AI_REPORTER_REPO:-wall3n/ai-reporter}"
BRANCH="${AI_REPORTER_BRANCH:-main}"
INSTALL_DIR="${AI_REPORTER_INSTALL_DIR:-$HOME/.local/bin}"
DATA_DIR="${AI_REPORTER_DIR:-$HOME/.local/share/ai-reporter}"
BASE_URL="https://raw.githubusercontent.com/$REPO/$BRANCH"

# Setup terminal colors if interactive
if [ -t 1 ]; then
  ESC="$(printf '\033')"
  BOLD="${ESC}[1m"
  DIM="${ESC}[2m"
  CYAN="${ESC}[36m"
  GREEN="${ESC}[32m"
  YELLOW="${ESC}[33m"
  RED="${ESC}[31m"
  RESET="${ESC}[0m"
else
  BOLD=""
  DIM=""
  CYAN=""
  GREEN=""
  YELLOW=""
  RED=""
  RESET=""
fi

log_info() {
  printf "  ${CYAN}✦${RESET} %s\n" "$1"
}

log_success() {
  printf "  ${GREEN}✓${RESET} %s\n" "$1"
}

log_warn() {
  printf "  ${YELLOW}!${RESET} %s\n" "$1"
}

log_error() {
  printf "  ${RED}✗${RESET} %s\n" "$1" >&2
}

printf "\n${BOLD}${CYAN}  AI-REPORTER INSTALLER${RESET}\n"
printf "  ${DIM}24/7 AI Token & Spend Tracker · All Coding Agents${RESET}\n\n"

# 1. Detect OS & Architecture
OS="$(uname -s)"
ARCH="$(uname -m)"

case "$OS" in
  Darwin)
    OS_NAME="macOS"
    ;;
  Linux)
    OS_NAME="Linux"
    ;;
  *)
    log_error "Unsupported operating system: $OS"
    printf "\n  AI-Reporter natively supports macOS and Linux.\n"
    printf "  On Windows, we recommend running inside WSL (Windows Subsystem for Linux).\n\n"
    exit 1
    ;;
esac

log_info "Detected Platform: ${BOLD}$OS_NAME ($ARCH)${RESET}"

# 2. Check for Node.js (version 22+)
NODE_BIN=""
if command -v node >/dev/null 2>&1; then
  NODE_BIN="$(command -v node)"
else
  # Search well-known paths (Homebrew, Mise, NVM, FNM, ASDF)
  for candidate in \
    /opt/homebrew/bin/node \
    /usr/local/bin/node \
    "$HOME/.nvm/versions/node"/*/bin/node \
    "$HOME/.local/share/mise/installs/node"/*/bin/node \
    "$HOME/.fnm/current/bin/node" \
    "$HOME/.asdf/shims/node"; do
    if [ -x "$candidate" ]; then
      NODE_BIN="$candidate"
      break
    fi
  done
fi

if [ -z "$NODE_BIN" ]; then
  log_error "Node.js (>= 22.0.0) is required but was not found."
  printf "\n  AI-Reporter relies on Node.js 22+ for its native SQLite storage engine (${DIM}node:sqlite${RESET}).\n\n"
  printf "  ${BOLD}Install Node.js 22+:${RESET}\n"
  if [ "$OS" = "Darwin" ]; then
    printf "    brew install node\n"
  else
    printf "    curl -fsSL https://fnm.vercel.app/install | bash\n"
    printf "    fnm install 22\n"
    printf "    ${DIM}or visit: https://nodejs.org${RESET}\n"
  fi
  printf "\n"
  exit 1
fi

NODE_VER="$("$NODE_BIN" -v 2>/dev/null || echo "v0.0.0")"
NODE_MAJOR="$(echo "$NODE_VER" | sed -E 's/^v([0-9]+).*/\1/')"

if [ -z "$NODE_MAJOR" ] || [ "$NODE_MAJOR" -lt 22 ]; then
  log_error "Node.js 22 or higher is required (found $NODE_VER at $NODE_BIN)."
  printf "\n  AI-Reporter requires Node 22+ for the native ${DIM}node:sqlite${RESET} database module.\n"
  printf "  Please upgrade Node.js before proceeding.\n\n"
  exit 1
fi

log_success "Found Node.js ${BOLD}$NODE_VER${RESET} ($NODE_BIN)"

# 3. Create destination directories
mkdir -p "$INSTALL_DIR" "$DATA_DIR"

# 4. Fetch or build AI-Reporter bundle
SCRIPT_DIR=""
if [ -n "${BASH_SOURCE[0]:-}" ]; then
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" 2>/dev/null && pwd)"
fi

if [ -n "$SCRIPT_DIR" ] && [ -f "$SCRIPT_DIR/src/index.ts" ] && [ -f "$SCRIPT_DIR/package.json" ]; then
  # Local checkout installation
  log_info "Installing from local repository checkout..."
  if [ ! -f "$SCRIPT_DIR/dist/index.js" ]; then
    log_info "Building standalone bundle..."
    (cd "$SCRIPT_DIR" && node scripts/build.mjs)
  fi
  cp "$SCRIPT_DIR/dist/index.js" "$DATA_DIR/ai-reporter.mjs"
  cp "$SCRIPT_DIR/package.json" "$DATA_DIR/package.json"
else
  # Remote curl download
  log_info "Downloading AI-Reporter bundle from ${CYAN}$REPO${RESET} (${BRANCH})..."
  if ! curl -fsSL "$BASE_URL/dist/index.js" -o "$DATA_DIR/ai-reporter.mjs"; then
    log_error "Failed to download $BASE_URL/dist/index.js"
    exit 1
  fi
  curl -fsSL "$BASE_URL/package.json" -o "$DATA_DIR/package.json" 2>/dev/null || true
fi

chmod +x "$DATA_DIR/ai-reporter.mjs"

# 5. Create launcher wrapper in INSTALL_DIR
LAUNCHER="$INSTALL_DIR/ai-reporter"

cat <<EOF > "$LAUNCHER"
#!/usr/bin/env sh
# AI-Reporter CLI Launcher
set -e

# Detect Node.js binary (version >= 22)
NODE_CMD=""
if command -v node >/dev/null 2>&1; then
  NODE_CMD="\$(command -v node)"
else
  for p in \\
    "$NODE_BIN" \\
    /opt/homebrew/bin/node \\
    /usr/local/bin/node \\
    "\$HOME/.nvm/versions/node"/*/bin/node \\
    "\$HOME/.local/share/mise/installs/node"/*/bin/node \\
    "\$HOME/.fnm/current/bin/node" \\
    "\$HOME/.asdf/shims/node"; do
    if [ -x "\$p" ]; then
      NODE_CMD="\$p"
      break
    fi
  done
fi

if [ -z "\$NODE_CMD" ]; then
  echo "ai-reporter: Node.js (>= 22) is required but not found in PATH." >&2
  exit 1
fi

exec "\$NODE_CMD" "$DATA_DIR/ai-reporter.mjs" "\$@"
EOF

chmod +x "$LAUNCHER"
log_success "Installed executable wrapper to ${BOLD}$LAUNCHER${RESET}"

# 6. Verify PATH
IN_PATH=0
case ":$PATH:" in
  *":$INSTALL_DIR:"*) IN_PATH=1 ;;
  *) IN_PATH=0 ;;
esac

if [ "$IN_PATH" -eq 0 ]; then
  log_warn "${BOLD}$INSTALL_DIR${RESET} is not in your \$PATH."
  printf "  Add it to your shell configuration file:\n\n"
  CURRENT_SHELL="$(basename "${SHELL:-bash}")"
  case "$CURRENT_SHELL" in
    zsh)
      printf "    echo 'export PATH=\"%s:\$PATH\"' >> ~/.zshrc\n" "$INSTALL_DIR"
      printf "    source ~/.zshrc\n\n"
      ;;
    fish)
      printf "    fish_add_path %s\n\n" "$INSTALL_DIR"
      ;;
    *)
      printf "    echo 'export PATH=\"%s:\$PATH\"' >> ~/.bashrc\n" "$INSTALL_DIR"
      printf "    source ~/.bashrc\n\n"
      ;;
  esac
fi

# 7. Verification test
INSTALLED_VER="$("$LAUNCHER" --version 2>/dev/null || echo "installed")"
log_success "AI-Reporter ${BOLD}v$INSTALLED_VER${RESET} is ready to use!"

printf "\n${BOLD}${GREEN}✦ Setup Complete!${RESET}\n\n"
printf "  ${BOLD}Quick Start:${RESET}\n"
printf "    ${CYAN}ai-reporter scan${RESET}             Catch-up scan existing token history\n"
printf "    ${CYAN}ai-reporter watch${RESET}            Launch the live interactive terminal dashboard\n"
printf "    ${CYAN}ai-reporter stats${RESET}            View spend, prompt caching savings, and usage\n"
if [ "$OS" = "Darwin" ]; then
  printf "    ${CYAN}ai-reporter service install${RESET}  Enable 24/7 background tracking (macOS launchd)\n"
else
  printf "    ${CYAN}ai-reporter service install${RESET}  Enable 24/7 background tracking (Linux systemd)\n"
fi
printf "\n"
