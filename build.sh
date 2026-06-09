#!/bin/bash
set -e

npm install -g pnpm@9
export PATH="$(npm config get prefix)/bin:$PATH"
pnpm install --no-frozen-lockfile
pnpm --filter @workspace/api-server run build
