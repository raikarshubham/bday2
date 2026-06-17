/* =============================================
   BIRTHDAY PAGE FOR MUMMY — script.js
   ============================================= */

"use strict";

// ─── CONFIG ────────────────────────────────────
const CONFIG = {
  name: "Mummy",
  numHeroCandles: 7,
  numBigCandles: 7,
  particleCount: 35,
  petalEmojis: ["🌹", "🌸", "🌺", "🌷", "💐", "🌼", "💮"],
  confettiColors: [
    "#c2185b","#f48fb1","#d4a54b","#e91e8c",
    "#fce4ec","#f9e4a0","#fb7185","#fbbf24"
  ],
};

// ─── DOM REFS ───────────────────────────────────
const splashScreen      = document.getElementById("splash-screen");
const openBtn           = document.getElementById("open-btn");
const mainPage          = document.getElementById("main-page");
const candleRow         = document.getElementById("candle-row");
const bigCandlesEl      = document.getElementById("big-candles");
const wishStatus        = document.getElementById("wish-status");
const relightBtn        = document.getElementById("relight-btn");
const confettiCanvas    = document.getElementById("confetti-canvas");
const floatingPetals    = document.getElementById("floating-petals");
const splashPetals      = document.getElementById("splash-petals");
const celebrateBtn      = document.getElementById("celebrate-again-btn");
const sparkle           = document.getElementById("sparkle-cursor");
const musicBtn          = document.getElementById("music-btn");
const musicIcon         = document.getElementById("music-icon");
const musicDisc         = document.getElementById("music-disc");
// Photo slider
const photoSlider       = document.getElementById("photo-slider");
const photoSlides       = document.querySelectorAll(".photo-slide");
const photoDots         = document.querySelectorAll(".photo-dot");
const photoPrevBtn      = document.getElementById("photo-prev");
const photoNextBtn      = document.getElementById("photo-next");

// ─── UTILITIES ──────────────────────────────────
const rand    = (min, max) => Math.random() * (max - min) + min;
const randInt = (min, max) => Math.floor(rand(min, max));

// ─── CUSTOM CURSOR ──────────────────────────────
let cursorX = -100, cursorY = -100;
document.addEventListener("mousemove", e => {
  cursorX = e.clientX;
  cursorY = e.clientY;
  sparkle.style.left = cursorX + "px";
  sparkle.style.top  = cursorY + "px";

  // Occasional sparkle trail
  if (Math.random() < 0.25) spawnCursorSpark(e.clientX, e.clientY);
});

function spawnCursorSpark(x, y) {
  const s = document.createElement("div");
  const emojis = ["✨","💖","🌸","⭐","💕","🌟"];
  s.textContent = emojis[randInt(0, emojis.length)];
  s.style.cssText = `
    position:fixed; left:${x}px; top:${y}px; pointer-events:none;
    z-index:99998; font-size:${rand(0.7,1.3)}rem;
    animation: sparkTrail 0.8s ease forwards;
    transform: translate(-50%,-50%);
  `;
  document.body.appendChild(s);
  setTimeout(() => s.remove(), 800);
}

// Inject sparkle trail animation
const cursorStyle = document.createElement("style");
cursorStyle.textContent = `
  @keyframes sparkTrail {
    0%   { opacity:1; transform:translate(-50%,-50%) scale(1); }
    100% { opacity:0; transform:translate(${rand(-40,40)-50}%,${-80-50}%) scale(0.2); }
  }
`;
document.head.appendChild(cursorStyle);

// ─── SPLASH PETALS ──────────────────────────────
function buildSplashPetals() {
  for (let i = 0; i < 22; i++) {
    const p = document.createElement("div");
    p.className = "petal";
    p.textContent = CONFIG.petalEmojis[randInt(0, CONFIG.petalEmojis.length)];
    p.style.cssText = `
      left: ${rand(0,100)}%;
      font-size: ${rand(1,2.2)}rem;
      animation-duration: ${rand(5,12)}s;
      animation-delay: ${rand(0,8)}s;
      opacity: ${rand(0.5,0.9)};
    `;
    splashPetals.appendChild(p);
  }
}

// ─── SPLASH OPEN ────────────────────────────────
openBtn.addEventListener("click", () => {
  splashScreen.classList.add("exit");
  setTimeout(() => {
    splashScreen.style.display = "none";
    mainPage.classList.remove("hidden");
    init();
  }, 900);
});

// ─── INIT ───────────────────────────────────────
function init() {
  buildHeroCandles();
  buildBigCandles();
  buildFloatingHeroPetals();
  initPhotoSlider();
  initScrollReveal();
  burstConfetti(320);
  setTimeout(() => burstConfetti(200), 1600);
}

// ─── HERO CANDLES ────────────────────────────────
function buildHeroCandles() {
  candleRow.innerHTML = "";
  for (let i = 0; i < CONFIG.numHeroCandles; i++) {
    const c = document.createElement("div");
    c.className = "candle";
    c.innerHTML = `<div class="candle-flame"></div><div class="candle-body"></div>`;
    candleRow.appendChild(c);
  }
}

// ─── FLOATING HERO PETALS ────────────────────────
function buildFloatingHeroPetals() {
  for (let i = 0; i < 18; i++) {
    const p = document.createElement("div");
    p.className = "hero-petal";
    p.textContent = CONFIG.petalEmojis[randInt(0, CONFIG.petalEmojis.length)];
    p.style.cssText = `
      left: ${rand(0,95)}%;
      bottom: -40px;
      font-size: ${rand(1.2, 2.6)}rem;
      animation: petalFloat ${rand(8,16)}s linear ${rand(0,8)}s infinite;
      opacity: ${rand(0.35,0.75)};
    `;
    floatingPetals.appendChild(p);
  }
}

// ─── BIG CANDLES (Blow) ─────────────────────────
let blownCount = 0;

function buildBigCandles() {
  bigCandlesEl.innerHTML = "";
  blownCount = 0;
  for (let i = 0; i < CONFIG.numBigCandles; i++) {
    const c = document.createElement("div");
    c.className = "big-candle";
    c.innerHTML = `
      <div class="big-flame" id="flame-${i}"></div>
      <div class="big-candle-body"></div>
    `;
    c.addEventListener("click", () => blowCandle(i, c));
    bigCandlesEl.appendChild(c);
  }
  wishStatus.textContent = "Click each candle to blow it out! 🌬️";
  wishStatus.classList.remove("all-out");
  relightBtn.style.display = "none";
}

function blowCandle(idx, el) {
  const flame = document.getElementById(`flame-${idx}`);
  if (flame && !flame.classList.contains("out")) {
    flame.classList.add("out");
    blownCount++;
    createSmokePuff(el);
    if (blownCount === CONFIG.numBigCandles) {
      setTimeout(() => {
        wishStatus.textContent = "💖 Your wish is coming true! Happy Birthday Mummy! 💖";
        wishStatus.classList.add("all-out");
        relightBtn.style.display = "inline-block";
        burstConfetti(200);
        playSuccessChime();
      }, 450);
    }
  }
}

function createSmokePuff(el) {
  const rect = el.getBoundingClientRect();
  for (let i = 0; i < 6; i++) {
    const smoke = document.createElement("div");
    smoke.style.cssText = `
      position:fixed;
      left:${rect.left + rect.width / 2 + rand(-10, 10)}px;
      top:${rect.top - 10}px;
      width:10px; height:10px; border-radius:50%;
      background:rgba(220,200,210,0.6);
      pointer-events:none; z-index:9999;
      animation: smokeRise 1s ease forwards;
    `;
    document.body.appendChild(smoke);
    setTimeout(() => smoke.remove(), 1000);
  }
}

relightBtn.addEventListener("click", buildBigCandles);

// ─── PHOTO SLIDER ────────────────────────────────
let currentPhoto = 0;
let photoAutoInterval = null;

function showPhoto(n) {
  photoSlides[currentPhoto].classList.remove("active");
  photoDots[currentPhoto].classList.remove("active");
  currentPhoto = (n + photoSlides.length) % photoSlides.length;
  photoSlides[currentPhoto].classList.add("active");
  photoDots[currentPhoto].classList.add("active");
}

function initPhotoSlider() {
  photoPrevBtn.addEventListener("click", () => showPhoto(currentPhoto - 1));
  photoNextBtn.addEventListener("click", () => showPhoto(currentPhoto + 1));
  photoDots.forEach((dot, i) => dot.addEventListener("click", () => showPhoto(i)));

  // Auto-advance every 4s
  photoAutoInterval = setInterval(() => showPhoto(currentPhoto + 1), 4000);

  // Touch swipe support
  let touchStartX = 0;
  photoSlider.addEventListener("touchstart", e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  photoSlider.addEventListener("touchend", e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? showPhoto(currentPhoto + 1) : showPhoto(currentPhoto - 1);
  });
}

// ─── MUSIC PLAYER ────────────────────────────────
// Web Audio API — plays "Happy Birthday to You" melody
let audioCtx    = null;
let isPlaying   = false;
let activeNodes = [];   // track all oscillators so we can stop them
let loopTimer   = null;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
}

// Happy Birthday note sequence: frequency (Hz) and duration (beats)
const BIRTHDAY_NOTES = [
  // "Hap-py Birth-day to You"
  [392, 0.5],[392, 0.5],[440, 1],[392, 1],[523.25, 1],[493.88, 2],
  // "Hap-py Birth-day to You"
  [392, 0.5],[392, 0.5],[440, 1],[392, 1],[587.33, 1],[523.25, 2],
  // "Hap-py Birth-day dear Mum-my"
  [392, 0.5],[392, 0.5],[783.99, 1],[659.25, 1],[523.25, 1],[493.88, 1],[440, 1],
  // "Hap-py Birth-day to You"
  [698.46, 0.5],[698.46, 0.5],[659.25, 1],[523.25, 1],[587.33, 1],[523.25, 2],
];

function playBirthday() {
  if (!isPlaying) return;   // guard: don't schedule if already paused
  activeNodes = [];         // reset node list for this loop
  const bpm = 84;
  const beatDur = 60 / bpm;
  let t = audioCtx.currentTime + 0.1;

  BIRTHDAY_NOTES.forEach(([freq, beats]) => {
    const osc  = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const osc2  = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();

    osc.connect(gain);   gain.connect(audioCtx.destination);
    osc2.connect(gain2); gain2.connect(audioCtx.destination);

    osc.type = "sine";
    osc2.type = "triangle";
    osc.frequency.setValueAtTime(freq, t);
    osc2.frequency.setValueAtTime(freq * 1.003, t);

    const noteDur = beats * beatDur * 0.88;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.22, t + 0.02);
    gain.gain.setValueAtTime(0.22, t + noteDur - 0.08);
    gain.gain.linearRampToValueAtTime(0, t + noteDur);

    gain2.gain.setValueAtTime(0, t);
    gain2.gain.linearRampToValueAtTime(0.08, t + 0.02);
    gain2.gain.linearRampToValueAtTime(0, t + noteDur);

    osc.start(t);  osc.stop(t + noteDur + 0.05);
    osc2.start(t); osc2.stop(t + noteDur + 0.05);

    // Keep references so we can force-stop them
    activeNodes.push(osc, osc2);

    t += beats * beatDur;
  });

  const totalDur = BIRTHDAY_NOTES.reduce((sum, [, b]) => sum + b, 0) * beatDur + 0.3;
  loopTimer = setTimeout(() => {
    if (isPlaying) playBirthday();   // loop only if still playing
  }, totalDur * 1000);
}

musicBtn.addEventListener("click", () => {
  if (!isPlaying) {
    // ── PLAY ──
    isPlaying = true;
    musicIcon.textContent = "⏸";
    musicDisc.classList.add("spinning");
    initAudio();
    playBirthday();
  } else {
    // ── PAUSE ──
    isPlaying = false;
    musicIcon.textContent = "▶";
    musicDisc.classList.remove("spinning");
    // Cancel the loop timer
    if (loopTimer) { clearTimeout(loopTimer); loopTimer = null; }
    // Force-stop every scheduled oscillator immediately
    activeNodes.forEach(node => {
      try { node.stop(); } catch (e) { /* already stopped */ }
    });
    activeNodes = [];
  }
});

// ─── CONFETTI ────────────────────────────────────
const confCtx = confettiCanvas.getContext("2d");
let confettiPieces = [];
let confettiAnimId = null;

function resizeCanvas() {
  confettiCanvas.width  = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

class ConfettiPiece {
  constructor() { this.reset(true); }
  reset(fresh = false) {
    this.x     = rand(0, confettiCanvas.width);
    this.y     = fresh ? rand(-100, 0) : rand(-20, 0);
    this.w     = rand(5, 13);
    this.h     = rand(3, 8);
    this.shape = Math.random() < 0.4 ? "circle" : "rect";
    this.color = CONFIG.confettiColors[randInt(0, CONFIG.confettiColors.length)];
    this.vx    = rand(-2.5, 2.5);
    this.vy    = rand(2, 5.5);
    this.angle = rand(0, Math.PI * 2);
    this.spin  = rand(-0.14, 0.14);
    this.alpha = 1;
    this.fade  = rand(0.005, 0.013);
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.angle += this.spin;
    this.alpha -= this.fade;
    if (this.alpha <= 0) this.reset();
  }
  draw() {
    confCtx.save();
    confCtx.globalAlpha = Math.max(0, this.alpha);
    confCtx.translate(this.x, this.y);
    confCtx.rotate(this.angle);
    confCtx.fillStyle = this.color;
    if (this.shape === "circle") {
      confCtx.beginPath();
      confCtx.arc(0, 0, this.w / 2, 0, Math.PI * 2);
      confCtx.fill();
    } else {
      confCtx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
    }
    confCtx.restore();
  }
}

function burstConfetti(count = 100) {
  for (let i = 0; i < count; i++) {
    const p = new ConfettiPiece();
    p.x     = rand(0, confettiCanvas.width);
    p.y     = rand(0, confettiCanvas.height * 0.35);
    p.alpha = 1;
    confettiPieces.push(p);
  }
  if (!confettiAnimId) runConfetti();
}

function runConfetti() {
  confCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  confettiPieces = confettiPieces.filter(p => p.alpha > 0);
  confettiPieces.forEach(p => { p.update(); p.draw(); });
  if (confettiPieces.length > 0) {
    confettiAnimId = requestAnimationFrame(runConfetti);
  } else {
    confettiAnimId = null;
  }
}

// ─── SCROLL REVEAL ───────────────────────────────
function initScrollReveal() {
  const targets = document.querySelectorAll(
    ".section-title, .section-sub, .wish-card, .letter-card, .blow-cake-wrapper"
  );
  targets.forEach(el => el.classList.add("reveal"));

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  targets.forEach(el => obs.observe(el));
}

// ─── SUCCESS CHIME ────────────────────────────────
function playSuccessChime() {
  try {
    initAudio();
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((freq, i) => {
      const osc  = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime + i * 0.14);
      gain.gain.setValueAtTime(0.18, audioCtx.currentTime + i * 0.14);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i * 0.14 + 0.5);
      osc.start(audioCtx.currentTime + i * 0.14);
      osc.stop(audioCtx.currentTime  + i * 0.14 + 0.5);
    });
  } catch (e) { /* silent fail */ }
}

// ─── CELEBRATE AGAIN ─────────────────────────────
celebrateBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
  setTimeout(() => burstConfetti(350), 600);
  buildBigCandles();
  playSuccessChime();
});

// ─── BOOT ─────────────────────────────────────────
buildSplashPetals();
