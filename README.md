# Rachel & Andy's Wedding Escape Room

A browser-based escape room, built with plain HTML/CSS/JavaScript so it can be
hosted on **GitHub Pages** with no build step. The game lives in `index.html`.

## Play locally

Open `index.html` directly in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## How the room works

It's a square room with four walls. Click the **left/right edges** of the scene
to turn and face the next wall.

- **Green wall** (start): the exit door, a doorbell on a shelf, a key on a hook,
  a welcome mat (click it for a clue), and a button.
- **Blue wall** (left): a grid of key-shaped slots, and a button.
- **Yellow wall** (back): a message, and a button.
- **Red wall** (right): a button — and a hidden drawer.

### Solution (current placeholder puzzle)

1. Read the **welcome mat** clue: it shows the button order
   **Blue → Yellow → Green → Red → Green → Yellow → Blue** (BYGRGYB).
2. Press the wall buttons in that order. The room shifts to **blacklight** (purple).
3. Under blacklight, one **key slot** on the blue wall glows. Take the **key**
   from the hook on the green wall, select it in your inventory, and place it in
   the glowing slot.
4. A light now points to a spot on the **red wall** — click it to open a
   **drawer**, then click the drawer to find a **ring**. Take the ring.
5. The yellow-wall message now reads *"Put the Ring on the Doorbell to Escape."*
   Select the ring and click the **doorbell** on the green wall. The door opens.
6. Click the open door to **win**.

## Project layout

```
index.html                     # the game page (entry point for GitHub Pages)
css/styles.css                 # all styling
js/game.js                     # all game logic
images/                        # placeholder SVG art (one file per game image)
scripts/generate-placeholders.sh   # regenerates the placeholder images
```

## Replacing the placeholder art

Every game image is a labeled SVG in `images/`. To use real artwork, replace a
file **keeping the same name** (any web image format works — update the
extension in `css/styles.css` / `index.html` if you switch away from `.svg`).

Regenerate all placeholders with:

```bash
./scripts/generate-placeholders.sh
```

## Tuning the puzzle

Key constants live at the top of `js/game.js`:

- `TARGET_SEQUENCE` — the button order (and update the `welcome-mat-zoom.svg` clue to match).
- `CORRECT_SLOT` — which blue-wall key slot unlocks the drawer.
- `WALL_ORDER` — the clockwise arrangement of the walls.

The win message is the placeholder `lorem ipsum` block in the `win()` function.
