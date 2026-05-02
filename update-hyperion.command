#!/bin/bash
# HYPERION UPDATER — double-click to push latest version live
cd "$(dirname "$0")"

echo ""
echo "  ⚡ HYPERION UPDATE"
echo "  =================="
echo ""

SITE_ID_FILE=".hyperion-site-id"

if [ ! -f "$SITE_ID_FILE" ]; then
    echo "  No site ID found. Run deploy-hyperion.command first."
    echo "  Press any key to exit..."
    read -n 1
    exit 1
fi

if [ ! -f "hyperion.html" ]; then
    echo "  ERROR: hyperion.html not found"
    echo "  Press any key to exit..."
    read -n 1
    exit 1
fi

SITE_ID=$(cat "$SITE_ID_FILE")

TMPDIR=$(mktemp -d)
cp hyperion.html "$TMPDIR/index.html"
cd "$TMPDIR"
zip -q site.zip index.html

echo "  Updating site $SITE_ID..."
echo ""

RESPONSE=$(curl -s -X PUT "https://api.netlify.com/api/v1/sites/$SITE_ID" \
  -H "Content-Type: application/zip" \
  --data-binary @site.zip)

URL=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('ssl_url') or d.get('url','FAILED'))" 2>/dev/null)

rm -rf "$TMPDIR"

if [ "$URL" = "FAILED" ] || [ -z "$URL" ]; then
    echo "  Update failed. Response:"
    echo "$RESPONSE"
    echo ""
    echo "  Press any key to exit..."
    read -n 1
    exit 1
fi

echo "  ✓ UPDATED:"
echo ""
echo "    $URL"
echo ""
echo "  Press any key to exit..."
read -n 1
