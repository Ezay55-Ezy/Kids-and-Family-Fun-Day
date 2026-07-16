#!/bin/bash
set -e

BASE_URL="https://kids-and-family-fun-day-vercel.app"
RESULTS_DIR="results"
mkdir -p "$RESULTS_DIR"

echo "============================================"
echo "  K6 Performance Test Suite"
echo "  Target: $BASE_URL"
echo "============================================"
echo ""

run_test() {
  local name=$1
  local file=$2
  local extra_args=$3

  echo ">>> Running: $name"
  k6 run \
    --out json="$RESULTS_DIR/${name}.json" \
    $extra_args \
    "$file" 2>&1 | tee "$RESULTS_DIR/${name}.log"
  echo ""
  echo ">>> Completed: $name"
  echo "--------------------------------------------"
  echo ""
}

echo "Phase 1: Individual endpoint tests"
echo "============================================"
echo ""

run_test "01-homepage" "performance/homepage.js"
run_test "02-events-listing" "performance/events-listing.js"
run_test "03-event-details" "performance/event-details.js"
run_test "04-vendor-marketplace" "performance/vendor-marketplace.js"
run_test "05-auth" "performance/auth.js"
run_test "06-booking-flow" "performance/booking-flow.js"
run_test "07-dashboard" "performance/dashboard.js"

echo ""
echo "Phase 2: Combined full-load test"
echo "============================================"
echo ""

run_test "08-full-load" "performance/full-load.js"

echo ""
echo "============================================"
echo "  All tests completed!"
echo "  Results saved to: $RESULTS_DIR/"
echo "============================================"
