#!/usr/bin/env bash
#
# Generates labeled SVG placeholder images for the escape room.
# Every game image is produced here so the placeholders can be regenerated,
# or individual files swapped out for real artwork later (keep the same names).
#
# Usage: ./scripts/generate-placeholders.sh
#
set -euo pipefail

DIR="$(cd "$(dirname "$0")/.." && pwd)/images"
mkdir -p "$DIR"

# svg <name> <w> <h> <fill> <fontsize> <label...>
svg() {
  local name="$1" w="$2" h="$3" fill="$4" fs="$5"; shift 5
  local label="$*"
  local iw=$((w - 8)) ih=$((h - 8))
  local cx=$((w / 2)) cy=$((h / 2))
  local sub=$(( fs * 6 / 10 ))
  cat > "$DIR/$name.svg" <<EOF
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 $w $h" preserveAspectRatio="none">
  <rect x="4" y="4" width="$iw" height="$ih" rx="8" fill="$fill" stroke="#1a1a1a" stroke-width="4" stroke-dasharray="14 8"/>
  <text x="$cx" y="$cy" font-family="Helvetica, Arial, sans-serif" font-size="$fs" font-weight="700" fill="#111" text-anchor="middle" dominant-baseline="middle">$label</text>
  <text x="$cx" y="$((cy + fs))" font-family="Helvetica, Arial, sans-serif" font-size="$sub" fill="#111" opacity="0.55" text-anchor="middle" dominant-baseline="middle">placeholder</text>
</svg>
EOF
}

# --- Walls (scene backgrounds) ---
svg wall-green  1280 720 "#2e8b57" 96 "GREEN WALL"
svg wall-red    1280 720 "#c0392b" 96 "RED WALL"
svg wall-yellow 1280 720 "#f1c40f" 96 "YELLOW WALL"
svg wall-blue   1280 720 "#2980b9" 96 "BLUE WALL"

# --- Green wall objects ---
svg door-closed     240 430 "#6b4f2a" 26 "DOOR"
svg door-open       240 430 "#241a0e" 26 "DOOR OPEN"
svg shelf-bell      170 150 "#b8860b" 22 "BELL"
svg shelf-bell-ring 170 150 "#caa12f" 20 "BELL + RING"
svg hook-key        100 190 "#cfcfcf" 18 "KEY"
svg welcome-mat     320 130 "#8b5a2b" 30 "WELCOME MAT"

# --- Reusable button (used on every wall; tinted per-wall in CSS context) ---
svg button 100 100 "#9aa0a6" 22 "BUTTON"

# --- Blue wall key slots ---
svg indentation      80 80 "#1f5f8b" 13 "KEY SLOT"
svg indentation-glow 80 80 "#c39bd3" 13 "LIT SLOT"

# --- Inventory / placed items ---
svg key  130 64 "#d4af37" 22 "KEY"
svg ring 100 100 "#f4d03f" 22 "RING"

# --- Red wall drawer ---
svg drawer-closed 240 160 "#7b3f1d" 26 "DRAWER"
svg drawer-open   240 160 "#3a1f0d" 24 "DRAWER OPEN"

# --- Special: welcome mat zoom (the solvable clue) ---
# Encodes the button order: Blue, Yellow, Green, Red, Green, Yellow, Blue.
cat > "$DIR/welcome-mat-zoom.svg" <<'EOF'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 360" preserveAspectRatio="xMidYMid meet">
  <rect x="6" y="6" width="748" height="348" rx="18" fill="#8b5a2b" stroke="#5c3a18" stroke-width="6"/>
  <rect x="40" y="40" width="680" height="280" rx="12" fill="#a8703a" stroke="#5c3a18" stroke-width="4" stroke-dasharray="12 8"/>
  <text x="380" y="110" font-family="Georgia, serif" font-size="64" font-weight="700" fill="#3a230f" text-anchor="middle">WELCOME</text>
  <text x="380" y="160" font-family="Helvetica, Arial, sans-serif" font-size="20" fill="#3a230f" text-anchor="middle" opacity="0.8">(placeholder clue &#8212; press the wall buttons in this order)</text>
  <g>
    <rect x="120" y="210" width="60" height="60" rx="6" fill="#2980b9" stroke="#222" stroke-width="3"/>
    <rect x="190" y="210" width="60" height="60" rx="6" fill="#f1c40f" stroke="#222" stroke-width="3"/>
    <rect x="260" y="210" width="60" height="60" rx="6" fill="#2e8b57" stroke="#222" stroke-width="3"/>
    <rect x="330" y="210" width="60" height="60" rx="6" fill="#c0392b" stroke="#222" stroke-width="3"/>
    <rect x="400" y="210" width="60" height="60" rx="6" fill="#2e8b57" stroke="#222" stroke-width="3"/>
    <rect x="470" y="210" width="60" height="60" rx="6" fill="#f1c40f" stroke="#222" stroke-width="3"/>
    <rect x="540" y="210" width="60" height="60" rx="6" fill="#2980b9" stroke="#222" stroke-width="3"/>
  </g>
</svg>
EOF

# --- Special: drawer zoom (shows a ring inside when present) ---
cat > "$DIR/drawer-zoom.svg" <<'EOF'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 420" preserveAspectRatio="xMidYMid meet">
  <rect x="6" y="6" width="628" height="408" rx="16" fill="#3a1f0d" stroke="#1a0e05" stroke-width="6"/>
  <rect x="40" y="40" width="560" height="340" rx="10" fill="#5b3a1d" stroke="#2a1708" stroke-width="4"/>
  <text x="320" y="80" font-family="Helvetica, Arial, sans-serif" font-size="26" font-weight="700" fill="#f0e0c8" text-anchor="middle">OPEN DRAWER</text>
  <g id="ring">
    <circle cx="320" cy="240" r="70" fill="none" stroke="#f4d03f" stroke-width="22"/>
    <circle cx="320" cy="150" r="26" fill="#bfe9ff" stroke="#f4d03f" stroke-width="8"/>
    <text x="320" y="345" font-family="Helvetica, Arial, sans-serif" font-size="20" fill="#f0e0c8" text-anchor="middle" opacity="0.8">a ring &#8212; click to take</text>
  </g>
</svg>
EOF

echo "Generated $(ls -1 "$DIR"/*.svg | wc -l | tr -d ' ') placeholder images in $DIR"
