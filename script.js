/* ================================================================
   NULL & NEON — script.js
   All interactivity: cursor, greeter, day/night, canvas, memory
   game, room explorer, scroll animations, Easter egg.
   No external dependencies. No API keys. No autoplay audio.
   ================================================================ */

'use strict';

// ─────────────────────────────────────────────
// 1. CUSTOM CURSOR
// ─────────────────────────────────────────────
(function initCursor() {
  const cursor = document.getElementById('custom-cursor');
  if (!cursor) return;

  // Hide the native cursor only after the custom cursor is available.
  // If JavaScript fails or the cursor element is missing, the native cursor remains.
  document.body.classList.add('custom-cursor-active');

  let mouseX = -100, mouseY = -100;
  let curX = -100, curY = -100;
  let raf;

  function lerp(a, b, t) { return a + (b - a) * t; }

  function update() {
    curX = lerp(curX, mouseX, 0.18);
    curY = lerp(curY, mouseY, 0.18);
    cursor.style.left = curX + 'px';
    cursor.style.top  = curY + 'px';
    raf = requestAnimationFrame(update);
  }

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  document.addEventListener('mousedown', () => {
    cursor.classList.add('click');
  });
  document.addEventListener('mouseup', () => {
    cursor.classList.remove('click');
  });

  // Detect touch → hide custom cursor, show companion
  window.addEventListener('touchstart', () => {
    document.body.classList.add('touch-mode');
    cancelAnimationFrame(raf);
  }, { once: true });

  update();
})();

// ─────────────────────────────────────────────
// 2. TOUCH COMPANION
// ─────────────────────────────────────────────
(function initTouchCompanion() {
  const companion = document.getElementById('touch-companion');
  const touchMsg  = document.getElementById('touch-msg');
  if (!companion || !touchMsg) return;

  const msgs = [
    'tap nibble!', 'hello! 👋', 'fixing bugs…', '3kb of joy',
    'on patrol!', '🔧 repairing…', '✨ tada!', 'found a glitch!'
  ];
  let idx = 0;

  companion.addEventListener('click', () => {
    idx = (idx + 1) % msgs.length;
    touchMsg.textContent = msgs[idx];
    companion.style.transform = 'scale(1.15)';
    setTimeout(() => { companion.style.transform = ''; }, 200);
  });
})();

// ─────────────────────────────────────────────
// 3. NAVIGATION (burger menu)
// ─────────────────────────────────────────────
(function initNav() {
  const burger    = document.getElementById('nav-burger');
  const navLinks  = document.getElementById('nav-links');
  if (!burger || !navLinks) return;

  burger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
  });

  // Close on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!burger.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    }
  });
})();

// ─────────────────────────────────────────────
// 4. DAY / NIGHT TOGGLE
// ─────────────────────────────────────────────
(function initDayNight() {
  const btn = document.getElementById('day-night-btn');
  if (!btn) return;

  // Restore preference
  const stored = localStorage.getItem('nn-mode');
  if (stored === 'night') applyNight(true);

  btn.addEventListener('click', () => {
    const isNight = document.body.classList.toggle('night');
    applyNight(isNight);
    localStorage.setItem('nn-mode', isNight ? 'night' : 'day');
  });

  function applyNight(on) {
    btn.textContent  = on ? '🌙 NIGHT' : '☀️ DAY';
    btn.setAttribute('aria-pressed', on);
  }
})();

// ─────────────────────────────────────────────
// 5. PIXEL DUST PARTICLES
// ─────────────────────────────────────────────
(function initPixelDust() {
  const container = document.getElementById('pixel-dust');
  if (!container) return;

  const PARTICLE_COUNT = 20;
  const colors = ['#ff2d78','#39ff14','#00ffe7','#ffe000','#a34063'];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const span = document.createElement('span');
    const size = (Math.random() * 4 + 2) + 'px';
    span.style.cssText = `
      left: ${Math.random() * 100}%;
      bottom: ${Math.random() * 40}%;
      width: ${size}; height: ${size};
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      animation-delay: ${Math.random() * 6}s;
      animation-duration: ${4 + Math.random() * 5}s;
    `;
    container.appendChild(span);
  }
})();

// ─────────────────────────────────────────────
// 6. INTERACTIVE GREETING TYPEWRITER
// ─────────────────────────────────────────────
(function initGreeting() {
  const bubble = document.getElementById('greeting-bubble');
  const textEl = document.getElementById('greeting-text');
  if (!bubble || !textEl) return;

  const greetings = [
    "Oh! A visitor! Hello hello hello~",
    "I was just fixing a broken carousel… welcome!",
    "Did you know? 404 rooms make the cosiest homes.",
    "🔧 Estimated repair time: forever. Worth it.",
    "I found a GIF today — it was only a little haunted.",
    "null && neon, neon && null… hey, they complete each other!",
    "You found me! Please don't close the tab.",
    "⚡ Glitch detected. Don't worry, I've got my wrench.",
    "Today's forecast: 99% chance of unexpected pixels.",
    "Nibble.exe is running. Errors are features.",
  ];

  let greetIdx = 0;
  let charIdx  = 0;
  let typing   = false;
  let timeoutId;

  function typeText(str) {
    clearTimeout(timeoutId);
    charIdx = 0;
    textEl.textContent = '';
    typing = true;

    function tick() {
      if (charIdx < str.length) {
        textEl.textContent += str[charIdx];
        charIdx++;
        timeoutId = setTimeout(tick, 38 + Math.random() * 24);
      } else {
        typing = false;
      }
    }
    tick();
  }

  // Start with first greeting after short delay
  setTimeout(() => typeText(greetings[0]), 600);

  // Click or Enter → next greeting
  function nextGreeting() {
    if (typing) return;
    greetIdx = (greetIdx + 1) % greetings.length;
    typeText(greetings[greetIdx]);
    // Wobble character
    const svg = document.getElementById('nibble-svg');
    if (svg) {
      svg.style.transform = 'scale(1.15) rotate(-6deg)';
      setTimeout(() => { svg.style.transform = ''; }, 350);
    }
  }

  bubble.addEventListener('click', nextGreeting);
  bubble.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); nextGreeting(); }
  });

  // Also clicking Nibble directly
  const nibbleSvg = document.getElementById('nibble-svg');
  if (nibbleSvg) {
    nibbleSvg.addEventListener('click', nextGreeting);
    nibbleSvg.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); nextGreeting(); }
    });
  }
})();

// ─────────────────────────────────────────────
// 7. PROJECT 1 — GLITCH REPAIR CANVAS
// ─────────────────────────────────────────────
(function initGlitchCanvas() {
  const canvas = document.getElementById('glitch-canvas');
  const scoreEl = document.getElementById('glitch-score');
  if (!canvas || !scoreEl) return;

  const ctx = canvas.getContext('2d');
  let W, H;
  let xpScore = 0;
  let activeTool = 'fix';
  let isDrawing = false;
  let lastX = 0, lastY = 0;
  let glitchBlocks = [];
  let animFrame;

  const NEON_COLORS = ['#ff2d78', '#39ff14', '#00ffe7', '#ffe000', '#a34063'];

  function resize() {
    W = canvas.offsetWidth;
    H = canvas.offsetHeight;
    canvas.width  = W;
    canvas.height = H;
    spawnGlitches();
  }

  function spawnGlitches() {
    glitchBlocks = [];
    const count = Math.floor(W / 20);
    for (let i = 0; i < count; i++) {
      glitchBlocks.push({
        x: Math.random() * W,
        y: Math.random() * H,
        w: Math.random() * 40 + 8,
        h: Math.random() * 14 + 4,
        col: NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)],
        opacity: Math.random() * 0.8 + 0.2,
        speed: (Math.random() - 0.5) * 2,
        life: 1.0,
      });
    }
  }

  function drawFrame() {
    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = '#0a0812';
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = 'rgba(0,255,231,0.07)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 20) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 20) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    // Glitch blocks
    glitchBlocks.forEach((b, i) => {
      b.x += b.speed;
      if (b.x > W) b.x = -b.w;
      if (b.x < -b.w) b.x = W;

      ctx.globalAlpha = b.opacity * b.life;
      ctx.fillStyle = b.col;
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.globalAlpha = 1;
    });

    // Remove dead blocks
    glitchBlocks = glitchBlocks.filter(b => b.life > 0.01);

    animFrame = requestAnimationFrame(drawFrame);
  }

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) * (W / rect.width),
      y: (src.clientY - rect.top)  * (H / rect.height),
    };
  }

  function repairAt(x, y) {
    const radius = activeTool === 'fix' ? 28 : activeTool === 'spark' ? 15 : 20;
    let fixed = 0;

    glitchBlocks = glitchBlocks.filter(b => {
      const cx = b.x + b.w / 2;
      const cy = b.y + b.h / 2;
      const dist = Math.hypot(cx - x, cy - y);
      if (dist < radius) { fixed++; return false; }
      return true;
    });

    xpScore += fixed * 10;

    if (activeTool === 'paint') {
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = '#ff2d78';
      for (let i = 0; i < 5; i++) {
        ctx.fillRect(
          x + (Math.random() - 0.5) * 16,
          y + (Math.random() - 0.5) * 16,
          4, 4
        );
      }
      ctx.globalAlpha = 1;
      xpScore += 2;
    }

    if (activeTool === 'spark') {
      ctx.strokeStyle = '#ffe000';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#ffe000';
      ctx.beginPath();
      ctx.arc(x, y, 8 + Math.random() * 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      xpScore += 3;
    }

    updateScore();
  }

  function updateScore() {
    const filled = Math.min(10, Math.floor(xpScore / 50));
    const bar = '█'.repeat(filled) + '░'.repeat(10 - filled);
    scoreEl.textContent = `REPAIR XP: ${xpScore} ${bar}`;
    if (xpScore >= 500 && !canvas.dataset.celebrated) {
      canvas.dataset.celebrated = '1';
      scoreEl.textContent = '✨ MASTER REPAIRER! XP: ' + xpScore;
    }
  }

  // Events
  canvas.addEventListener('mousedown', (e) => { isDrawing = true; const p = getPos(e); lastX = p.x; lastY = p.y; repairAt(p.x, p.y); });
  canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    const p = getPos(e);
    // interpolate for smooth strokes
    const steps = Math.ceil(Math.hypot(p.x - lastX, p.y - lastY) / 10);
    for (let s = 0; s <= steps; s++) {
      repairAt(lastX + (p.x - lastX) * s / steps, lastY + (p.y - lastY) * s / steps);
    }
    lastX = p.x; lastY = p.y;
  });
  document.addEventListener('mouseup', () => { isDrawing = false; });

  canvas.addEventListener('touchstart', (e) => { e.preventDefault(); isDrawing = true; const p = getPos(e); repairAt(p.x, p.y); }, { passive: false });
  canvas.addEventListener('touchmove', (e) => { e.preventDefault(); if (!isDrawing) return; const p = getPos(e); repairAt(p.x, p.y); }, { passive: false });
  canvas.addEventListener('touchend', () => { isDrawing = false; });

  // Keyboard: press Enter or Space to spray-fix current center
  canvas.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      repairAt(W / 2, H / 2);
      spawnGlitches(); // add new glitches for more fun
    }
  });

  // Tool buttons
  document.querySelectorAll('.glitch-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tool = btn.dataset.tool;
      if (tool === 'reset') {
        xpScore = 0;
        updateScore();
        spawnGlitches();
        delete canvas.dataset.celebrated;
        return;
      }
      activeTool = tool;
      document.querySelectorAll('.glitch-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Periodically spawn new glitches (canvas stays lively)
  let spawnInterval = setInterval(() => {
    if (glitchBlocks.length < 30) {
      const col = NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];
      glitchBlocks.push({
        x: Math.random() * W,
        y: Math.random() * H,
        w: Math.random() * 40 + 8,
        h: Math.random() * 14 + 4,
        col, opacity: Math.random() * 0.8 + 0.2,
        speed: (Math.random() - 0.5) * 2,
        life: 1.0,
      });
    }
  }, 1200);

  // Resize observer
  const ro = new ResizeObserver(() => resize());
  ro.observe(canvas);
  resize();
  drawFrame();
})();

// ─────────────────────────────────────────────
// 8. PROJECT 2 — MEMORY ARCHIVE
// ─────────────────────────────────────────────
(function initMemoryGame() {
  const grid     = document.getElementById('memory-grid');
  const movesEl  = document.getElementById('memory-moves');
  const statusEl = document.getElementById('memory-status');
  const resetBtn = document.getElementById('memory-reset');
  if (!grid || !movesEl || !statusEl || !resetBtn) return;

  const SYMBOLS = ['📼', '💾', '📡', '🖲️', '📟', '🗂️', '🔌', '💿'];
  let flipped = [], matched = 0, moves = 0, locked = false;
  let cards = [];

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function buildGrid() {
    grid.innerHTML = '';
    flipped = []; matched = 0; moves = 0; locked = false;
    movesEl.textContent = 'MOVES: 0';
    statusEl.textContent = 'find the pairs!';

    const deck = shuffle([...SYMBOLS, ...SYMBOLS]);
    cards = deck.map((sym, i) => {
      const card = document.createElement('div');
      card.className = 'memory-card';
      card.setAttribute('role', 'gridcell');
      card.setAttribute('aria-label', `Card ${i + 1} — face down`);
      card.setAttribute('tabindex', '0');
      card.dataset.symbol = sym;
      const inner = document.createElement('span');
      inner.textContent = sym;
      card.appendChild(inner);

      function flip() {
        if (locked || card.classList.contains('flipped') || card.classList.contains('matched')) return;
        card.classList.add('flipped');
        card.setAttribute('aria-label', `Card ${i + 1} — ${sym}`);
        flipped.push(card);

        if (flipped.length === 2) {
          moves++;
          movesEl.textContent = `MOVES: ${moves}`;
          locked = true;
          setTimeout(checkMatch, 700);
        }
      }

      card.addEventListener('click', flip);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); }
      });

      grid.appendChild(card);
      return card;
    });
  }

  function checkMatch() {
    const [a, b] = flipped;
    if (a.dataset.symbol === b.dataset.symbol) {
      a.classList.replace('flipped', 'matched');
      b.classList.replace('flipped', 'matched');
      a.setAttribute('aria-label', `Matched: ${a.dataset.symbol}`);
      b.setAttribute('aria-label', `Matched: ${b.dataset.symbol}`);
      matched++;
      if (matched === SYMBOLS.length) {
        statusEl.textContent = `✨ ARCHIVE RESTORED in ${moves} moves!`;
      } else {
        statusEl.textContent = `${matched}/${SYMBOLS.length} recovered!`;
      }
    } else {
      a.classList.remove('flipped');
      b.classList.remove('flipped');
      a.setAttribute('aria-label', `Card — face down`);
      b.setAttribute('aria-label', `Card — face down`);
      statusEl.textContent = `keep looking…`;
    }
    flipped = [];
    locked = false;
  }

  resetBtn.addEventListener('click', buildGrid);
  buildGrid();
})();

// ─────────────────────────────────────────────
// 9. PROJECT 3 — SECRET ROOM EXPLORER
// ─────────────────────────────────────────────
(function initRoomExplorer() {
  const artEl     = document.getElementById('room-art');
  const descEl    = document.getElementById('room-desc');
  const choicesEl = document.getElementById('room-choices');
  if (!artEl || !descEl || !choicesEl) return;

  const ROOMS = [
    {
      id: 'entrance',
      art: `
  ┌─────────────────────────────┐
  │  ░░░░░ THE ENTRANCE ░░░░░   │
  │   [  DOOR  ]   [  DOOR  ]  │
  │    ███████      ███████     │
  │       🚪           🔑      │
  │  ≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈   │
  └─────────────────────────────┘`,
      desc: '🔦 Nibble\'s lantern flickers. Two doors stand before you — one glows berry-pink, one glows cyan. A key sits on the dusty floor.',
      choices: [
        { label: '🌸 Open the pink door', next: 'gallery' },
        { label: '💎 Take the key and try the cyan door', next: 'archive' },
        { label: '🔍 Inspect the floor', next: 'floor' },
      ],
    },
    {
      id: 'gallery',
      art: `
  ┌─────────────────────────────┐
  │   🖼️  THE GIF GALLERY  🖼️   │
  │  ┌───┐ ┌───┐ ┌───┐ ┌───┐  │
  │  │✨ │ │🌀 │ │🐾 │ │💫 │  │
  │  └───┘ └───┘ └───┘ └───┘  │
  │   spinning forever…         │
  └─────────────────────────────┘`,
      desc: '🎞️ Hundreds of ancient GIFs loop endlessly. A dancing skeleton. A spinning star. A loading bar that never finishes. Nibble sighs happily.',
      choices: [
        { label: '🔧 Repair the broken GIFs', next: 'gallery_fixed' },
        { label: '⬅️ Back to entrance', next: 'entrance' },
      ],
    },
    {
      id: 'gallery_fixed',
      art: `
  ┌─────────────────────────────┐
  │ ✅  GALLERY RESTORED!  ✅   │
  │  ┌───┐ ┌───┐ ┌───┐ ┌───┐  │
  │  │🌟 │ │🌈 │ │🦋 │ │🎆 │  │
  │  └───┘ └───┘ └───┘ └───┘  │
  │   vibrant and alive! ✨     │
  └─────────────────────────────┘`,
      desc: '✨ +150 XP! The GIFs bloom back into colour. Nibble does a little happy spin. A secret passage appears behind a giant rainbow GIF.',
      choices: [
        { label: '🌈 Enter the secret passage', next: 'secret' },
        { label: '⬅️ Back to entrance', next: 'entrance' },
      ],
    },
    {
      id: 'archive',
      art: `
  ┌─────────────────────────────┐
  │  💾 THE DATA ARCHIVE  💾    │
  │                             │
  │  [████░░░░░░] 40% restored  │
  │  [██████░░░░] 60% restored  │
  │  [░░░░░░░░░░] 0%  corrupted │
  │                             │
  └─────────────────────────────┘`,
      desc: '🗄️ Row upon row of memory chips, many cracked and dark. The key in your hand begins to vibrate. One chip slots are key-shaped…',
      choices: [
        { label: '🔑 Insert the key into the corrupted slot', next: 'archive_unlock' },
        { label: '🧐 Read the 40% chip', next: 'chip_read' },
        { label: '⬅️ Back to entrance', next: 'entrance' },
      ],
    },
    {
      id: 'archive_unlock',
      art: `
  ┌─────────────────────────────┐
  │  💥 MEMORY UNLOCKED! 💥     │
  │                             │
  │  [██████████] 100% RESTORED │
  │  [██████████] 100% RESTORED │
  │  [██████████] 100% RESTORED │
  │                             │
  └─────────────────────────────┘`,
      desc: '🔓 A cascade of data floods back! Lost memories of a 2003 personal homepage. Someone\'s cat. A poem about rain. A MIDI of Für Elise.',
      choices: [
        { label: '📖 Read the recovered memories', next: 'memories' },
        { label: '⬅️ Back to entrance', next: 'entrance' },
      ],
    },
    {
      id: 'chip_read',
      art: `
  ┌─────────────────────────────┐
  │  📄 PARTIAL MEMORY          │
  │  "…and the best summer      │
  │   of my life was 2001       │
  │   when we built a           │
  │   treehouse and…"           │
  │  [CORRUPTED AFTER THIS]     │
  └─────────────────────────────┘`,
      desc: '📝 A fragment of someone\'s diary, stored in a chip for safekeeping. Nibble carefully transcribes the remaining text.',
      choices: [
        { label: '⬅️ Back to archive', next: 'archive' },
      ],
    },
    {
      id: 'memories',
      art: `
  ┌─────────────────────────────┐
  │  🌟 HOMEPAGE: STARLAKE1998  │
  │  "Welcome 2 my corner of    │
  │   the web!! Updates daily!  │
  │   My cat Pixel says hi 🐱" │
  │  visitors: 000247 ✦         │
  └─────────────────────────────┘`,
      desc: '🐱 Starlake1998 — a web pioneer who loved cats, HTML tables, and updating their "about me" page every week. Their homepage lives again.',
      choices: [
        { label: '💌 Leave a comment in the guestbook', next: 'guestbook' },
        { label: '⬅️ Back to entrance', next: 'entrance' },
      ],
    },
    {
      id: 'guestbook',
      art: `
  ┌─────────────────────────────┐
  │  📖 GUESTBOOK               │
  │  ──────────────────────     │
  │  Nibble: "Fixed your        │
  │  site! It's beautiful. 🔧" │
  │  YOU: "We remember you ✨"  │
  │  ──────────────────────     │
  └─────────────────────────────┘`,
      desc: '💾 Your message has been saved into the memory chip. Somewhere in the server, a pixel flickers with warmth.',
      choices: [
        { label: '🏠 Return to entrance', next: 'entrance' },
        { label: '🌈 Find the secret room', next: 'secret' },
      ],
    },
    {
      id: 'floor',
      art: `
  ┌─────────────────────────────┐
  │  🔎 FLOOR INSPECTION        │
  │                             │
  │  You find: a pixel shard,   │
  │  a broken hyperlink, and    │
  │  a note that reads:         │
  │  "ROOM_7 EXISTS. — N"       │
  └─────────────────────────────┘`,
      desc: '📌 Nibble left this note! ROOM_7 is the legendary secret room. The pink door leads to clues…',
      choices: [
        { label: '🌸 Head to the pink door', next: 'gallery' },
        { label: '⬅️ Back to entrance', next: 'entrance' },
      ],
    },
    {
      id: 'secret',
      art: `
  ┌─────────────────────────────┐
  │  🌟✨ ROOM SEVEN ✨🌟        │
  │                             │
  │     NULL://NEON/ROOM_7      │
  │                             │
  │   ♥ Nibble's favourite      │
  │     secret hiding place     │
  └─────────────────────────────┘`,
      desc: '🎉 You found ROOM 7! Nibble lives here when not on repair duty. There\'s a hammock made of ethernet cables, pixel-art posters, and a half-eaten cookie sprite. You feel very welcome.',
      choices: [
        { label: '🏠 Head back to the entrance', next: 'entrance' },
        { label: '🎊 Trigger the Easter egg!', next: 'easter' },
      ],
    },
  ];

  const roomMap = {};
  ROOMS.forEach(r => { roomMap[r.id] = r; });

  let currentRoom = 'entrance';

  function loadRoom(id) {
    const room = roomMap[id];
    if (!room) return;
    currentRoom = id;

    if (id === 'easter') {
      openEasterEgg();
      loadRoom('secret');
      return;
    }

    artEl.textContent = room.art;
    descEl.textContent = room.desc;
    choicesEl.innerHTML = '';

    room.choices.forEach((c, idx) => {
      const btn = document.createElement('button');
      btn.className = 'room-choice';
      btn.textContent = `[${idx + 1}] ${c.label}`;
      btn.addEventListener('click', () => loadRoom(c.next));
      choicesEl.appendChild(btn);
    });

    // Keyboard: 1, 2, 3 keys
    choicesEl._keys = room.choices.map((c, idx) => ({ key: String(idx + 1), next: c.next }));
  }

  // Global keyboard handler for room choices
  document.addEventListener('keydown', (e) => {
    if (!choicesEl._keys) return;
    const match = choicesEl._keys.find(k => k.key === e.key);
    if (match) {
      // Only trigger if focus is inside the room viewport or not on an input
      const active = document.activeElement;
      const isInput = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA');
      if (!isInput) { loadRoom(match.next); }
    }
  });

  loadRoom('entrance');
})();

// ─────────────────────────────────────────────
// 10. SCROLL REVEAL — ORIGIN STORY
// ─────────────────────────────────────────────
(function initScrollReveal() {
  const scenes = document.querySelectorAll('.story-scene');
  if (!scenes.length) return;

  // Reduced-motion check
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    scenes.forEach(s => s.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  scenes.forEach(s => observer.observe(s));
})();

// ─────────────────────────────────────────────
// 11. EASTER EGG — Konami Code
// ─────────────────────────────────────────────
function openEasterEgg() {
  const modal   = document.getElementById('easter-egg-modal');
  const closeBtn = document.getElementById('egg-close');
  if (!modal) return;

  modal.classList.add('open');
  closeBtn && closeBtn.focus();

  function closeModal() {
    modal.classList.remove('open');
    document.removeEventListener('keydown', handleEscKey);
  }

  function handleEscKey(e) {
    if (e.key === 'Escape') closeModal();
  }

  closeBtn && closeBtn.addEventListener('click', closeModal, { once: true });
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', handleEscKey);
}

(function initEasterEgg() {
  const KONAMI = [
    'ArrowUp','ArrowUp','ArrowDown','ArrowDown',
    'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight',
    'b','a'
  ];
  let konamiIdx = 0;

  document.addEventListener('keydown', (e) => {
    if (e.key === KONAMI[konamiIdx]) {
      konamiIdx++;
      if (konamiIdx === KONAMI.length) {
        konamiIdx = 0;
        openEasterEgg();
      }
    } else {
      konamiIdx = e.key === KONAMI[0] ? 1 : 0;
    }
  });
})();

// ─────────────────────────────────────────────
// 12. NIBBLE CURSOR REACTION (pointer-aware)
// F2: target the correct pupil <circle> elements via attribute selector
// F6: capture original positions ONCE at init, not inside the handler
// ─────────────────────────────────────────────
(function initPointerReaction() {
  const nibble = document.getElementById('nibble-svg');
  if (!nibble) return;

  // F2 fix: select the two cyan iris circles by their fill attribute.
  // The SVG pupils are <circle fill="#00ffe7"> inside .nibble-eye — not ellipses.
  const pupils = Array.from(
    nibble.querySelectorAll('.nibble-eye circle[fill="#00ffe7"]')
  );
  if (!pupils.length) return; // guard: nothing to animate if SVG changes

  // F6 fix: capture original cx/cy BEFORE any movement happens.
  // Storing inside the handler caused the already-shifted value to be saved
  // as the base on the first call, making the eye drift further each move.
  const origPos = pupils.map(el => ({
    cx: parseFloat(el.getAttribute('cx')),
    cy: parseFloat(el.getAttribute('cy')),
  }));

  const MAX_OFFSET = 2.5; // pixels of maximum pupil displacement

  function movePupils(dx, dy) {
    pupils.forEach((el, i) => {
      // Always compute relative to frozen original — no cumulative drift
      el.setAttribute('cx', origPos[i].cx + dx * MAX_OFFSET);
      el.setAttribute('cy', origPos[i].cy + dy * MAX_OFFSET);
    });
  }

  function resetPupils() {
    pupils.forEach((el, i) => {
      el.setAttribute('cx', origPos[i].cx);
      el.setAttribute('cy', origPos[i].cy);
    });
  }

  document.addEventListener('mousemove', (e) => {
    const rect = nibble.getBoundingClientRect();
    if (!rect.width) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top  + rect.height / 2;
    // Normalise to ‑1…+1 based on viewport dimensions
    const dx = (e.clientX - cx) / (window.innerWidth  / 2);
    const dy = (e.clientY - cy) / (window.innerHeight / 2);
    movePupils(dx, dy);
  });

  // Reset pupils when the pointer leaves the browser window
  document.addEventListener('mouseleave', resetPupils);

  // Touch: nibble reacts to taps with a quick wobble
  nibble.addEventListener('touchend', () => {
    nibble.style.transition = 'transform 0.3s';
    nibble.style.transform = 'scale(1.2) rotate(10deg)';
    setTimeout(() => { nibble.style.transform = ''; }, 400);
  });
})();

// ─────────────────────────────────────────────
// 13. ACTIVE NAV LINK (scroll spy)
// ─────────────────────────────────────────────
(function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.style.color = '';
          if (link.getAttribute('href') === '#' + entry.target.id) {
            link.style.color = 'var(--berry)';
          }
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => observer.observe(s));
})();

// ─────────────────────────────────────────────
// 14. CONSOLE GREETING
// ─────────────────────────────────────────────
console.log(
  '%c NULL & NEON %c\n%c⚡ Made by Nibble the Glitch Sprite.\nKonami code for a surprise: ↑↑↓↓←→←→BA\nRoom 7 awaits you in the Secret Room Explorer.',
  'background:#a34063;color:#fff8f1;font-size:18px;font-weight:bold;padding:6px 12px;',
  '',
  'color:#00ffe7;font-size:12px;'
);
