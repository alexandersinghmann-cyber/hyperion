#!/bin/bash
cd "$(dirname "$0")"
echo "Deploying Hyperion to GitHub Pages..."
cp hyperion.html index.html
python3 deploy.py
echo ""
echo "Done. Press any key to close."
read -n 1
