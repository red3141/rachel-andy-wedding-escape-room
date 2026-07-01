/* ============================================================
   Rachel & Andy's Wedding Escape Room
   Vanilla JS. No build step. Hosted on GitHub Pages (index.html).
   ============================================================ */

(function () {
  "use strict";

  // --- Puzzle configuration ---------------------------------
  // Walls in clockwise order. Player starts facing WHITE.
  //   turn right (+1): white -> orange -> yellow -> magenta
  //   turn left  (-1): white -> magenta -> yellow -> orange
  const WALL_ORDER = ["white", "orange", "yellow", "magenta"];

  // Button order shown on the welcome-mat clue image.
  const TARGET_SEQUENCE = [
    "white", "white", "white",
    "orange",
    "yellow", "yellow",
    "magenta", "magenta", "magenta",
  ];

  // Magenta wall has a grid of key slots; this is the one that unlocks the drawer.
  const SLOT_COLS = 4;
  const SLOT_ROWS = 3;
  const SLOT_COUNT = SLOT_COLS * SLOT_ROWS;
  const CORRECT_SLOT = 6; // 0-indexed (row 1, col 2)

  // --- Game state -------------------------------------------
  const state = {
    wall: 0,            // index into WALL_ORDER
    inventory: [],      // item ids, e.g. "key", "ring"
    selected: null,     // currently selected inventory item
    sequence: [],       // recent button presses
    blacklight: false,
    keyTaken: false,
    keyPlacedAt: null,  // slot index, or null
    drawerOpen: false,
    ringTaken: false,
    ringPlaced: false,
    doorOpen: false,
    won: false,
  };

  // --- Element refs -----------------------------------------
  const scene = document.getElementById("scene");
  const walls = {};
  document.querySelectorAll(".wall").forEach((el) => {
    walls[el.dataset.wall] = el;
  });
  const invItemsEl = document.getElementById("inv-items");
  const toastEl = document.getElementById("toast");
  const orangeGlow = document.getElementById("orange-glow");
  const doorEl = document.getElementById("door");
  const hookKeyEl = document.getElementById("hook-key");
  const shelfBellEl = document.getElementById("shelf-bell");
  const welcomeMatEl = document.getElementById("welcome-mat");
  const drawerEl = document.getElementById("drawer");

  // Modal
  const modal = document.getElementById("modal");
  const modalBody = document.getElementById("modal-body");

  // --- Helpers ----------------------------------------------
  let toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2200);
  }

  function addItem(item) {
    if (!state.inventory.includes(item)) state.inventory.push(item);
  }
  function removeItem(item) {
    state.inventory = state.inventory.filter((i) => i !== item);
    if (state.selected === item) state.selected = null;
  }

  function showWall() {
    const name = WALL_ORDER[state.wall];
    Object.keys(walls).forEach((w) => {
      walls[w].classList.toggle("active", w === name);
    });
  }

  function turn(dir) {
    state.wall = (state.wall + dir + WALL_ORDER.length) % WALL_ORDER.length;
    showWall();
  }

  // --- Build magenta-wall key slots -------------------------
  const slotEls = [];
  (function buildSlots() {
    const magenta = walls.magenta;
    const areaLeft = 18, areaTop = 30, areaW = 56, areaH = 46; // % of scene
    const cellW = areaW / SLOT_COLS;
    const cellH = areaH / SLOT_ROWS;
    for (let i = 0; i < SLOT_COUNT; i++) {
      const r = Math.floor(i / SLOT_COLS);
      const c = i % SLOT_COLS;
      const el = document.createElement("div");
      el.className = "hotspot slot";
      el.dataset.slot = String(i);
      // center a 9%-wide slot within its cell
      const slotW = 9, slotH = 11;
      const left = areaLeft + c * cellW + (cellW - slotW) / 2;
      const top = areaTop + r * cellH + (cellH - slotH) / 2;
      el.style.left = left + "%";
      el.style.top = top + "%";
      el.style.width = slotW + "%";
      el.style.height = slotH + "%";
      el.addEventListener("click", () => onSlotClick(i));
      magenta.appendChild(el);
      slotEls.push(el);
    }
  })();

  // --- Render dynamic state ---------------------------------
  function render() {
    // Inventory
    invItemsEl.innerHTML = "";
    if (state.inventory.length === 0) {
      const empty = document.createElement("span");
      empty.className = "inv-empty";
      empty.textContent = "(empty)";
      invItemsEl.appendChild(empty);
    } else {
      state.inventory.forEach((item) => {
        const el = document.createElement("div");
        el.className = "inv-item" + (state.selected === item ? " selected" : "");
        el.dataset.item = item;
        el.title = item;
        el.addEventListener("click", () => {
          state.selected = state.selected === item ? null : item;
          render();
        });
        invItemsEl.appendChild(el);
      });
    }

    // Green wall objects
    hookKeyEl.classList.toggle("hidden", state.keyTaken);
    shelfBellEl.classList.toggle("ring", state.ringPlaced);
    doorEl.classList.toggle("open", state.doorOpen);

    // Blacklight lighting + dependent visuals. The yellow-wall message's
    // hidden "ink" words are revealed purely via the .blacklight CSS class.
    scene.classList.toggle("blacklight", state.blacklight);

    // Blue wall slots
    slotEls.forEach((el, i) => {
      el.classList.toggle("has-key", state.keyPlacedAt === i);
      el.classList.toggle("glow", state.blacklight && i === CORRECT_SLOT);
    });

    // Red wall drawer is revealed only when the key is in the correct slot
    // and the blacklight has lit it up.
    const drawerRevealed = state.blacklight && state.keyPlacedAt === CORRECT_SLOT;
    orangeGlow.classList.toggle("hidden", !drawerRevealed || state.drawerOpen);
    drawerEl.classList.toggle("hidden", !drawerRevealed);
    drawerEl.classList.toggle("open", state.drawerOpen);
  }

  // --- Interactions -----------------------------------------
  function pressButton(color, el) {
    el.classList.remove("flash");
    void el.offsetWidth; // restart animation
    el.classList.add("flash");
    el.addEventListener("animationend", () => el.classList.remove("flash"), { once: true });

    toast("You press the button on the " + color + " wall.");

    state.sequence.push(color);
    if (state.sequence.length > TARGET_SEQUENCE.length) {
      state.sequence.shift();
    }
    if (!state.blacklight && sequenceMatches()) {
      activateBlacklight();
    }
  }

  function sequenceMatches() {
    if (state.sequence.length !== TARGET_SEQUENCE.length) return false;
    return state.sequence.every((c, i) => c === TARGET_SEQUENCE[i]);
  }

  function activateBlacklight() {
    state.blacklight = true;
    toast("The lights shift to an eerie purple glow…");
    render();
  }

  function takeKey() {
    if (state.keyTaken) return;
    state.keyTaken = true;
    addItem("key");
    toast("You picked up a key.");
    render();
  }

  function onSlotClick(i) {
    // Click the slot holding the key to take it back.
    if (state.keyPlacedAt === i) {
      state.keyPlacedAt = null;
      addItem("key");
      toast("You took the key back.");
      render();
      return;
    }
    // Place a held key into an empty slot.
    if (state.selected === "key" && state.keyPlacedAt === null) {
      state.keyPlacedAt = i;
      removeItem("key");
      toast("You fit the key into the slot.");
      render();
      return;
    }
    if (state.keyPlacedAt !== null) {
      toast("The key is already in a slot.");
    } else {
      toast("An empty key-shaped slot.");
    }
  }

  function clickShelfBell() {
    if (state.ringPlaced) {
      toast("The ring already sits on the doorbell.");
      return;
    }
    if (state.selected === "ring") {
      state.ringPlaced = true;
      removeItem("ring");
      state.doorOpen = true;
      toast("You place the ring on the doorbell. The door unlocks!");
      render();
      return;
    }
    toast("A little bell on a shelf — the doorbell.");
  }

  function clickDoor() {
    if (state.doorOpen) {
      win();
    } else {
      toast("The door is locked.");
    }
  }

  function clickDrawer() {
    if (drawerEl.classList.contains("hidden")) return;
    if (!state.drawerOpen) {
      state.drawerOpen = true;
      toast("The drawer slides open.");
      render();
      return;
    }
    showDrawerZoom();
  }

  // --- Modals ------------------------------------------------
  function openModal(html) {
    modalBody.innerHTML = html;
    modal.classList.remove("hidden");
  }
  function closeModal() {
    modal.classList.add("hidden");
    modalBody.innerHTML = "";
  }

  function showWelcomeMat() {
    openModal('<img src="images/welcome-mat-zoom.png" alt="Welcome mat clue" />');
  }

  function showDrawerZoom() {
    if (state.ringTaken) {
      openModal('<img src="images/drawer-open.png" alt="Empty open drawer" /><p style="text-align:center;color:#aaa;">The drawer is empty.</p>');
      return;
    }
    openModal('<img id="drawer-ring-img" class="clickable-ring" src="images/drawer-zoom.png" alt="Drawer with a ring inside" /><p style="text-align:center;color:#aaa;">Click the ring to take it.</p>');
    const img = document.getElementById("drawer-ring-img");
    if (img) {
      img.addEventListener("click", () => {
        state.ringTaken = true;
        addItem("ring");
        toast("You picked up a ring.");
        render();
        closeModal();
      });
    }
  }

  function win() {
    if (state.won) return;
    state.won = true;
    openModal(
      '<div class="win-message">' +
        "<h2>You win!</h2>" +
        "<p>Of course, you don't need a game to know you're winning; your wedding clearly indicates you already are!</p>" +
        "<p>We're so excited that you guys are married, and we're thrilled we could be a part of your special day. We hope and pray for health, happiness, and all of God's blessings in your new life together.</p>" +
        "<p>And just like this is only the beginning of your married life, this is also only the beginning of your wedding gift. Niamh has a friend who owns an escape room business in Kingston with some great rooms, and we want to go with you! We're thinking that we figure out a time (maybe 1-2 nights) that works for all of us and we'll fit as many escape rooms in as we can. We'll cover the rooms we stay in and the rooms we escape from.</p>" +
        "<p>Congrats again; we're so happy for you!<br>Richard and Rachel.</p>" +
      "</div>"
    );
  }

  // --- Wire up event listeners ------------------------------
  document.getElementById("turn-left").addEventListener("click", () => turn(-1));
  document.getElementById("turn-right").addEventListener("click", () => turn(1));

  document.querySelectorAll(".button").forEach((btn) => {
    btn.addEventListener("click", () => pressButton(btn.dataset.color, btn));
  });

  hookKeyEl.addEventListener("click", takeKey);
  shelfBellEl.addEventListener("click", clickShelfBell);
  welcomeMatEl.addEventListener("click", showWelcomeMat);
  doorEl.addEventListener("click", clickDoor);
  drawerEl.addEventListener("click", clickDrawer);

  document.getElementById("modal-close").addEventListener("click", closeModal);
  document.getElementById("modal-backdrop").addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  // --- Boot --------------------------------------------------
  showWall();
  render();
})();
