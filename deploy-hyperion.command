#!/bin/bash
# HYPERION DEPLOYER — double-click to deploy to a live URL via Surge
cd "$(dirname "$0")"

echo ""
echo "  ⚡ HYPERION DEPLOY"
echo "  =================="
echo ""

# Check if hyperion.html exists
if [ ! -f "hyperion.html" ]; then
    echo "  ERROR: hyperion.html not found in $(pwd)"
    echo "  Press any key to exit..."
    read -n 1
    exit 1
fi

# Check for Node.js
if ! command -v npx &> /dev/null; then
    echo "  ERROR: Node.js is required. Install from https://nodejs.org"
    echo "  Press any key to exit..."
    read -n 1
    exit 1
fi

# Create temp deploy folder with index.html
DEPLOY_DIR=$(mktemp -d)
cp hyperion.html "$DEPLOY_DIR/index.html"

DOMAIN="hyperion-coach.surge.sh"

echo "  Deploying to $DOMAIN..."
echo "  (First time: enter any email + password to create a free Surge account)"
echo ""

npx surge "$DEPLOY_DIR" "$DOMAIN"

STATUS=$?
rm -rf "$DEPLOY_DIR"

if [ $STATUS -eq 0 ]; then
    echo ""
    echo "  ✓ LIVE AT:"
    echo ""
    echo "    https://$DOMAIN"
    echo ""
    echo "  Bookmark this URL on your phone."
    echo "  To update later, just double-click this file again."
fi

echo ""
echo "  Press any key to exit..."
read -n 1
