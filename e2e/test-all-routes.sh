#!/bin/bash
# Full App Route Test Script
# Tests all routes return 200 and contain expected HTML

BASE_URL="http://localhost:8080"
PASS=0
FAIL=0
TOTAL=0

test_route() {
  local path="$1"
  local description="$2"
  TOTAL=$((TOTAL + 1))

  local tmpfile="/tmp/route_test_$TOTAL.html"
  local status
  status=$(curl -s -o "$tmpfile" -w "%{http_code}" "$BASE_URL$path" 2>/dev/null)
  local size=$(wc -c < "$tmpfile")

  if [ "$status" = "200" ] && grep -q 'id="root"' "$tmpfile" && [ "$size" -gt 500 ]; then
    PASS=$((PASS + 1))
    echo "  ✓ $path ($description) — ${size}B, HTTP $status"
  else
    FAIL=$((FAIL + 1))
    echo "  ✗ $path ($description) — ${size}B, HTTP $status"
  fi
  rm -f "$tmpfile"
}

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  AIA Product Compass Hub — Full App Route Test"
echo "═══════════════════════════════════════════════════════"
echo ""

echo "── Public Pages ──"
test_route "/" "Home / Dashboard"
test_route "/auth" "Auth / Sign In"
test_route "/consultant-landing" "Consultant Landing"
test_route "/awaiting-approval" "Awaiting Approval"
test_route "/force-password" "Force Password Change"
test_route "/reset-password" "Reset Password"

echo ""
echo "── App Pages ──"
test_route "/how-to-use" "How to Use Portal"
test_route "/search-by-profile" "Search by Profile"
test_route "/bookmarks" "Bookmarks"
test_route "/my-account" "My Account"

echo ""
echo "── CMFAS ──"
test_route "/cmfas-exams" "CMFAS Exams"
test_route "/cmfas/module/onboarding" "CMFAS Module (Onboarding)"
test_route "/cmfas/chat" "CMFAS Chat"

echo ""
echo "── Roleplay ──"
test_route "/roleplay" "Roleplay Hub"

echo ""
echo "── Knowledge Base ──"
test_route "/kb" "Knowledge Base"

echo ""
echo "── Scripts & Playbooks ──"
test_route "/scripts" "Scripts Database"
test_route "/servicing" "Servicing Page"
test_route "/playbooks" "Playbooks"
test_route "/flows" "Script Flows"

echo ""
echo "── Admin ──"
test_route "/admin" "Admin Dashboard"

echo ""
echo "── Other ──"
test_route "/changelog" "Changelog"
test_route "/this-does-not-exist" "404 Not Found"

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  Results: $PASS passed, $FAIL failed, $TOTAL total"
echo "═══════════════════════════════════════════════════════"
echo ""

# Test static assets
echo "── Static Assets ──"
ASSET_PASS=0
ASSET_TOTAL=0

for asset in "/@vite/client" "/src/main.tsx"; do
  ASSET_TOTAL=$((ASSET_TOTAL + 1))
  status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$asset" 2>/dev/null)
  if [ "$status" = "200" ]; then
    ASSET_PASS=$((ASSET_PASS + 1))
    echo "  ✓ $asset — HTTP $status"
  else
    echo "  ✗ $asset — HTTP $status"
  fi
done

echo ""
echo "  Asset results: $ASSET_PASS/$ASSET_TOTAL passed"
echo ""

# Build check
echo "── Build Validation ──"
cd /home/user/aia-product-compass-hub
BUILD_OUTPUT=$(npm run build 2>&1)
if echo "$BUILD_OUTPUT" | grep -q "built in"; then
  BUILD_TIME=$(echo "$BUILD_OUTPUT" | grep "built in" | grep -oP '\d+\.\d+s')
  echo "  ✓ Production build succeeds (${BUILD_TIME})"
else
  echo "  ✗ Production build FAILED"
  echo "$BUILD_OUTPUT" | tail -10
fi

# Lint check
echo ""
echo "── Lint Check ──"
LINT_OUTPUT=$(npm run lint 2>&1)
LINT_EXIT=$?
if [ $LINT_EXIT -eq 0 ]; then
  echo "  ✓ ESLint passes"
else
  LINT_ERRORS=$(echo "$LINT_OUTPUT" | grep -c "error")
  LINT_WARNINGS=$(echo "$LINT_OUTPUT" | grep -c "warning")
  echo "  ⚠ ESLint: $LINT_ERRORS errors, $LINT_WARNINGS warnings"
  echo "$LINT_OUTPUT" | grep "error\|warning" | head -10
fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  FULL TEST SUMMARY"
echo "═══════════════════════════════════════════════════════"
echo "  Routes: $PASS/$TOTAL passed"
echo "  Assets: $ASSET_PASS/$ASSET_TOTAL passed"
echo "═══════════════════════════════════════════════════════"
