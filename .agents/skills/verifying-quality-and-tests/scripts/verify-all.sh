#!/usr/bin/env bash
set -euo pipefail

export PATH="./node_modules/.bin:${PATH}"

echo "==> [1/6] Running Oxlint (src, infra & tests)..."
oxlint src infra tests

echo "==> [2/6] Checking code formatting with Oxfmt..."
oxfmt --check src infra tests

echo "==> [3/6] Checking unused files, dependencies & exports with Knip..."
knip

echo "==> [4/6] Running TypeScript compiler check (tsc -b)..."
tsc -b

echo "==> [5/6] Running Vitest unit tests..."
vitest run

echo "==> [6/6] Building production bundle with Vite..."
vite build

echo "All quality checks, tests, and builds passed!"
