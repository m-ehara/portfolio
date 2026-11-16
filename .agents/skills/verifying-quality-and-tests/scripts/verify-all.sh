#!/usr/bin/env bash
set -euo pipefail

export PATH="./node_modules/.bin:${PATH}"

echo "==> [1/5] Running Oxlint (src, infra & tests)..."
oxlint src infra tests

echo "==> [2/5] Checking code formatting with Oxfmt..."
oxfmt --check src infra tests

echo "==> [3/5] Running TypeScript compiler check (tsc -b)..."
tsc -b

echo "==> [4/5] Running Vitest unit tests..."
vitest run

echo "==> [5/5] Building production bundle with Vite..."
vite build

echo "All quality checks, tests, and builds passed!"
