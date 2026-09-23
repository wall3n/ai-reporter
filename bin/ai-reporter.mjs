#!/usr/bin/env sh
# AI-Reporter CLI Launcher
set -e

# Detect Node.js binary (version >= 22)
NODE_CMD=""
if command -v node >/dev/null 2>&1; then
  NODE_CMD="$(command -v node)"
else
  for p in \
    "/Users/franmoreno/.local/share/mise/installs/node/lts/bin/node" \
    /opt/homebrew/bin/node \
    /usr/local/bin/node \
    "$HOME/.nvm/versions/node"/*/bin/node \
    "$HOME/.local/share/mise/installs/node"/*/bin/node \
    "$HOME/.fnm/current/bin/node" \
    "$HOME/.asdf/shims/node"; do
    if [ -x "$p" ]; then
      NODE_CMD="$p"
      break
    fi
  done
fi

if [ -z "$NODE_CMD" ]; then
  echo "ai-reporter: Node.js (>= 22) is required but not found in PATH." >&2
  exit 1
fi

exec "$NODE_CMD" "/Users/franmoreno/.local/share/ai-reporter/ai-reporter.mjs" "$@"
