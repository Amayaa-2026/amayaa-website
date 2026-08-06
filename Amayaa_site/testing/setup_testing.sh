#!/bin/bash
# =============================================================================
# Amayaa by Polka Dots — Test Infrastructure Setup
# Run ONCE to install Playwright and capture visual reference screenshots.
#
# Uses Playwright for BOTH interaction tests AND visual regression.
# No BackstopJS dependency.
#
# Usage:
#   cd ~/Downloads/Amayaa_site
#   bash testing/setup_testing.sh
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"   # .../Amayaa_site/testing
SITE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"       # .../Amayaa_site
PORT=8080

echo ""
echo "============================================================"
echo "  Amayaa — Test Infrastructure Setup"
echo "  Site dir: $SITE_DIR"
echo "============================================================"
echo ""

# ── Step 1: Start local server ────────────────────────────────────────────────
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

# ── Step 2: Install Playwright package ───────────────────────────────────────
echo "▶ Installing Playwright..."
cd "$SCRIPT_DIR"
npm install 2>&1 | grep -E "^added|^up to date" || true
echo "  ✓ Playwright package ready"
echo ""

# ── Step 3: Install browsers ─────────────────────────────────────────────────
echo "▶ Installing browsers (Chromium + WebKit)..."
echo "  Downloads ~250MB on first run — takes 1–3 minutes..."
npx playwright install chromium webkit
echo "  ✓ Browsers installed"
echo ""

# ── Step 4: Run interaction tests baseline ───────────────────────────────────
echo "▶ Running interaction tests (baseline — all must be green)..."
echo ""
npx playwright test tests/regression.spec.js --reporter=list
REG_EXIT=$?
echo ""
if [ $REG_EXIT -eq 0 ]; then
  echo "  ✓ All interaction tests PASSED"
else
  echo "  ✗ Some interaction tests FAILED"
  echo "    Investigate before making code changes."
  echo "    Run: cd ~/Downloads/Amayaa_site/testing && npx playwright show-report"
fi
echo ""

# ── Step 5: Capture visual reference screenshots ──────────────────────────────
echo "▶ Capturing visual reference screenshots (7 pages × 4 browser/viewport combos)..."
echo "  First run creates the reference — takes ~2 minutes..."
echo ""
npx playwright test tests/visual.spec.js --update-snapshots --reporter=list
VIS_EXIT=$?
echo ""
if [ $VIS_EXIT -eq 0 ]; then
  echo "  ✓ Visual references saved → testing/tests/visual.spec.js-snapshots/"
else
  echo "  ✗ Visual snapshot capture had issues (exit $VIS_EXIT)"
  echo "    Check output above."
fi
echo ""

# ── Step 6: Stop server ───────────────────────────────────────────────────────
kill $SERVER_PID 2>/dev/null
echo "▶ Server stopped"
echo ""

# ── Summary ───────────────────────────────────────────────────────────────────
FAIL=0
[ $REG_EXIT -ne 0 ] && FAIL=$((FAIL+1))
[ $VIS_EXIT -ne 0 ] && FAIL=$((FAIL+1))

echo "============================================================"
if [ $FAIL -eq 0 ]; then
  echo "  ✅ SETUP COMPLETE — safety net is in place"
  echo ""
  echo "  Interaction tests : PASSED"
  echo "  Visual references : CAPTURED"
  echo ""
  echo "  To run regression after changes:"
  echo "    bash testing/run_regression.sh"
else
  echo "  ⚠️  SETUP HAD $FAIL ISSUE(S) — fix before proceeding"
fi
echo "============================================================"
echo ""
