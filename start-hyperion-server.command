#!/bin/bash
# One-time setup: loads the Hyperion server as a background service
# After this, the server runs permanently (even after reboot)

echo ""
echo "  ⚡ HYPERION SERVER SETUP"
echo "  ========================"
echo ""

# Unload first in case it's already loaded
launchctl unload ~/Library/LaunchAgents/com.hyperion.server.plist 2>/dev/null

# Load the LaunchAgent
launchctl load ~/Library/LaunchAgents/com.hyperion.server.plist

sleep 1

# Check if running
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8747/hyperion.html | grep -q "200"; then
    # Get local IP
    LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "unknown")

    echo "  ✓ Server running!"
    echo ""
    echo "  On this Mac:  http://localhost:8747/hyperion.html"
    echo "  On your phone: http://${LOCAL_IP}:8747/hyperion.html"
    echo ""
    echo "  ↑ Bookmark the phone URL. It will always serve the latest version."
    echo "  The server starts automatically on boot — you never need to run this again."
else
    echo "  ✗ Server didn't start. Check /tmp/hyperion-server.log for details."
fi

echo ""
echo "  Press any key to exit..."
read -n 1
