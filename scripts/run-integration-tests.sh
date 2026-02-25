#!/bin/bash
set -e

HOST="${TEST_HOST:-127.0.0.1}"
CONTROLLER_PORT="${CONTROLLER_PORT:-2998}"
CHAIN_PORT="${CHAIN_PORT:-8888}"

export CHAIN_ID=$(curl -s "http://${HOST}:${CHAIN_PORT}/v1/chain/get_info" 2>/dev/null | python3 -c 'import json,sys;print(json.load(sys.stdin)["chain_id"])' 2>/dev/null || echo "")
export API_URL="http://${HOST}:${CONTROLLER_PORT}/v1/graphql"
export CHAIN_URL="http://${HOST}:${CHAIN_PORT}"
export SERVER_SECRET="${SERVER_SECRET:-SECRET}"
export TEST_EMAIL="${TEST_EMAIL:-ivanov@example.com}"

echo "Running SDK integration tests..."
pnpm --filter @coopenomics/sdk run test

echo "Running Boot integration tests..."
pnpm --filter @coopenomics/boot run test
