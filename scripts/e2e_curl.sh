#!/usr/bin/env bash
# Simple E2E smoke script for Fix-It-Forward (requires curl + jq).
# Runs: health check -> list promotions -> validate promo against first product -> place guest order (cheque/offline)

set -euo pipefail
BASE=${BASE:-http://localhost:3000}

command -v jq >/dev/null 2>&1 || { echo "jq is required for this script"; exit 1; }

echo "== Health check =="
curl -s "$BASE/api/health" | jq '.'

echo "\n== Promotions list =="
PROMOS=$(curl -s "$BASE/api/promotions")
echo "$PROMOS" | jq '.'

# get first product
echo "\n== Picking product to test =="
PROD=$(curl -s "$BASE/api/products" | jq '.[0]')
if [ "$PROD" = "null" ]; then
  echo "No products available to test; aborting."; exit 0
fi
PID=$(echo "$PROD" | jq -r '.id')
PRICE=$(echo "$PROD" | jq -r '.price')
if [ -z "$PID" ] || [ "$PID" = "null" ]; then echo "Could not determine product id"; exit 1; fi

CODE=$(echo "$PROMOS" | jq -r '.[0].code // empty')
if [ -z "$CODE" ]; then CODE=SAVE10; fi

echo "Using product id: $PID (price: $PRICE) and promo code: $CODE"

# validate promo
echo "\n== Validate promotion =="
curl -s -X POST "$BASE/api/promotions/validate" -H 'Content-Type: application/json' -d \
  '{"code":"'"$CODE"'","items":[{"product_id":"'"$PID"'","quantity":1}]}' | jq '.'

echo "\n== Place guest order (cheque/offline) =="
# place order as guest (no auth) using offline method
RESPONSE=$(curl -s -X POST "$BASE/api/orders" -H 'Content-Type: application/json' -d \
  '{"items":[{"product_id":"'"$PID"'","quantity":1}],"contact":{"name":"Smoke Tester","email":"smoke@example.com"}}')

echo "$RESPONSE" | jq '.'

echo "\nScript finished. Note: This script will decrement inventory if order placed."
