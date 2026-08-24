#!/bin/bash
# =============================================================================
# Amayaa by Polka Dots — Regression Test Runner
# Run AFTER Phase 3 Step 2 changes to verify no regressions.
#
# Usage:
#   cd ~/Downloads/Amayaa_site
#   bash testing/run_regression.sh
#
# Layers:
#   Layer 1 — Playwright visual  : pixel diff against reference screenshots
#   Layer 2 — Playwright interact: JS interactions + console errors + cross-browser
#   Layer 3 — sh script          : structural checks (306 checks)
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"   # .../Amayaa_site/testing
SITE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"       # .../Amayaa_site
PORT=8080
PASS=0
FAIL=0

echo ""
echo "============================================================"
echo "  Amayaa — Full Regression Test Run"
echo "============================================================"
echo ""

# ── Start local server ────────────────────────────────────────────────────────
echo "▶ Starting local HTTP server on port $PORT..."
lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
sleep 1
cd "$SITE_DIR"
python3 -m http.server $PORT &>/dev/null &
SERVER_PID=$!
sleep 2

if ! curl -s "http://localhost:$PORT/index.html" > /dev/null; then
  echo "  ✗ Server failed to start. Aborting."
  exit 1
fi
echo "  ✓ Server running at http://localhost:$PORT"
echo ""

cd "$SCRIPT_DIR"

# ── LAYER 1: Visual regression ────────────────────────────────────────────────
echo "════════════════════════════════════════════════════════════"
echo "  LAYER 1 — Visual Regression (pixel diff)"
echo "════════════════════════════════════════════════════════════"
echo ""
npx playwright test tests/visual.spec.js --reporter=list
L1_EXIT=$?
echo ""
if [ $L1_EXIT -eq 0 ]; then
  echo "  ✓ LAYER 1 PASSED — no visual changes"
  PASS=$((PASS+1))
else
  echo "  ✗ LAYER 1 FAILED — visual differences detected"
  echo "    Run: cd ~/Downloads/Amayaa_site/testing && npx playwright show-report"
  FAIL=$((FAIL+1))
fi
echo ""

# ── LAYER 2: Interaction + console tests ─────────────────────────────────────
echo "════════════════════════════════════════════════════════════"
echo "  LAYER 2 — Interaction + Console Tests"
echo "════════════════════════════════════════════════════════════"
echo ""
npx playwright test tests/regression.spec.js --reporter=list
L2_EXIT=$?
echo ""
if [ $L2_EXIT -eq 0 ]; then
  echo "  ✓ LAYER 2 PASSED — all interactions working"
  PASS=$((PASS+1))
else
  echo "  ✗ LAYER 2 FAILED — interaction tests failed"
  echo "    Run: cd ~/Downloads/Amayaa_site/testing && npx playwright show-report"
  FAIL=$((FAIL+1))
fi
echo ""

# ── LAYER 3: Structural sh script ─────────────────────────────────────────────
echo "════════════════════════════════════════════════════════════"
echo "  LAYER 3 — Structural Test Script (306 checks)"
echo "════════════════════════════════════════════════════════════"
echo ""
TEST_SCRIPT="$SCRIPT_DIR/test_and_deploy.sh"
if [ -f "$TEST_SCRIPT" ]; then
  bash "$TEST_SCRIPT" test
  L3_EXIT=$?
  echo ""
  if [ $L3_EXIT -eq 0 ]; then
    echo "  ✓ LAYER 3 PASSED — all structural checks green"
    PASS=$((PASS+1))
  else
    echo "  ✗ LAYER 3 FAILED — structural checks failed"
    FAIL=$((FAIL+1))
  fi
else
  echo "  ⚠ test_and_deploy.sh not found at $TEST_SCRIPT"
fi
echo ""

# ── Stop server ───────────────────────────────────────────────────────────────
kill $SERVER_PID 2>/dev/null

# ── Result ────────────────────────────────────────────────────────────────────
echo "============================================================"
echo "  RESULT: $PASS/3 layers passed  |  $FAIL failed"
echo ""
if [ $FAIL -eq 0 ]; then
  echo "  ✅ ALL LAYERS GREEN — safe to deploy"
  echo "     bash ~/Downloads/test_and_deploy.sh deploy"
else
  echo "  ❌ REGRESSION DETECTED — do NOT deploy until resolved"
  echo "     cd ~/Downloads/Amayaa_site/testing && npx playwright show-report"
fi
echo "============================================================"
echo ""

exit $FAIL
