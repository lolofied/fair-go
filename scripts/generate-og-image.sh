#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TEMPLATE="$ROOT/public/og-image-template.html"
PNG="$ROOT/public/og-image.png"
JPG="$ROOT/public/og-image.jpg"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

"$CHROME" \
  --headless=new \
  --disable-gpu \
  --hide-scrollbars \
  --window-size=1200,630 \
  --screenshot="$PNG" \
  "file://$TEMPLATE"

sips -s format jpeg -s formatOptions 85 "$PNG" --out "$JPG" >/dev/null
echo "Generated $JPG"
