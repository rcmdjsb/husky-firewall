/**
 * Husky Firewall — Core Arcade Game Engine
 * Clean, zero-dependency HTML5 Canvas game loop, physics, renderer, and input handler.
 */
(function (global) {
  "use strict";

  const CANVAS_WIDTH = 720;
  const CANVAS_HEIGHT = 520;
  const FIREWALL_Y = 500;
  const PADDLE_Y = 468;
  const PADDLE_HEIGHT = 16;
  const PADDLE_BASE_WIDTH = 142;
  const PADDLE_OVERCLOCK_WIDTH = 220;
  const PADDLE_SPEED = 720;
  const MAX_LIVES = 3;
  const OVERCLOCK_DURATION = 8.0;
  const PACKET_POINTS = 10;
  const POINTS_PER_WAVE = 100;
  const POINTS_PER_BOSS = 500;
  const QUIZ_INTERVAL = 30.0;
  const QUIZ_REWARD = 100;
  const QUIZ_PENALTY = 25;
  const RESUME_COUNTDOWN_DURATION = 2.0;
  const HIGH_SCORE_KEY = "husky_firewall_high_score";
  const DIFFICULTY_STORAGE_KEY = "husky_firewall_difficulty";

  const DIFFICULTIES = {
    chill: {
      label: "CHILL",
      speedMultiplier: 0.72,
      spawnIntervalMultiplier: 1.22,
      pointMultiplier: 1
    },
    normal: {
      label: "NORMAL",
      speedMultiplier: 1.0,
      spawnIntervalMultiplier: 1.0,
      pointMultiplier: 1
    },
    overdrive: {
      label: "OVERDRIVE",
      speedMultiplier: 1.35,
      spawnIntervalMultiplier: 0.82,
      pointMultiplier: 2
    }
  };

  const COLORS = {
    navy: "#061a22",
    navyLight: "#0b2a36",
    teal: "#1f7a99",
    cyan: "#7cc9e8",
    cyanBright: "#c7f0ff",
    packet: "#39ff88",
    packetDeep: "#0e5c31",
    malware: "#ff3b5c",
    malwareDeep: "#631021",
    boss: "#ff2a85",
    bossDeep: "#3d0a2e",
    overclock: "#ffd166",
    overclockDeep: "#7a5200"
  };

  // DOM References
  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d");

  const hudScore = document.getElementById("hud-score");
  const hudMultiplier = document.getElementById("hud-multiplier");
  const hudWave = document.getElementById("hud-wave");
  const hudStreak = document.getElementById("hud-streak");
  const hudLives = document.getElementById("hud-lives");
  const hudHighScore = document.getElementById("hud-highscore");

  const btnPause = document.getElementById("btn-pause");
  const iconPause = document.getElementById("icon-pause");
  const iconPlay = document.getElementById("icon-play");
  const btnMute = document.getElementById("btn-mute");
  const iconSoundOn = document.getElementById("icon-sound-on");
  const iconSoundOff = document.getElementById("icon-sound-off");
  const muteLabel = document.getElementById("mute-label");

  const overclockBar = document.getElementById("overclock-bar");
  const overclockFill = document.getElementById("overclock-fill");
  const overclockTime = document.getElementById("overclock-time");

  const overlayStart = document.getElementById("overlay-start");
  const startHighScore = document.getElementById("start-highscore");
  const legendPacketPts = document.getElementById("legend-packet-pts");
  const difficultySelector = document.getElementById("difficulty-selector");
  const diffButtons = difficultySelector ? Array.prototype.slice.call(difficultySelector.querySelectorAll(".diff-btn")) : [];
  const btnStart = document.getElementById("btn-start");

  const overlayPause = document.getElementById("overlay-pause");
  const btnResume = document.getElementById("btn-resume");
  const btnPauseRestart = document.getElementById("btn-pause-restart");

  const overlayQuiz = document.getElementById("overlay-quiz");
  const quizCategory = document.getElementById("quiz-category");
  const quizPrompt = document.getElementById("quiz-prompt");
  const quizChoices = document.getElementById("quiz-choices");
  const quizFeedback = document.getElementById("quiz-feedback");
  const quizFeedbackTitle = document.getElementById("quiz-feedback-title");
  const quizFeedbackText = document.getElementById("quiz-feedback-text");
  const btnQuizContinue = document.getElementById("btn-quiz-continue");
  const quizHint = document.getElementById("quiz-hint");

  const overlayGameOver = document.getElementById("overlay-gameover");
  const goScore = document.getElementById("go-score");
  const goHighScore = document.getElementById("go-highscore");
  const goWave = document.getElementById("go-wave");
  const goBestStreak = document.getElementById("go-best-streak");
  const goNewRecord = document.getElementById("go-new-record");
  const goQuizSummary = document.getElementById("go-quiz-summary");
  const btnPlayAgain = document.getElementById("btn-play-again");
  const btnChangeDifficulty = document.getElementById("btn-change-difficulty");

  // Persistent Storage Helpers
  function loadHighScore() {
    try {
      const raw = global.localStorage.getItem(HIGH_SCORE_KEY);
      const parsed = parseInt(raw, 10);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
    } catch (_) {
      return 0;
    }
  }

  function saveHighScore(val) {
    try {
      global.localStorage.setItem(HIGH_SCORE_KEY, String(val));
    } catch (_) {
      // Ignore storage errors
    }
  }

  function loadDifficulty() {
    try {
      const raw = global.localStorage.getItem(DIFFICULTY_STORAGE_KEY);
      if (raw && Object.prototype.hasOwnProperty.call(DIFFICULTIES, raw)) {
        return raw;
      }
    } catch (_) {}
    return "normal";
  }

  function saveDifficulty(val) {
    try {
      global.localStorage.setItem(DIFFICULTY_STORAGE_KEY, val);
    } catch (_) {
      // Ignore storage errors
    }
  }

  // Game State
  const state = {
    mode: "start", // "start" | "playing" | "paused" | "quiz" | "countdown" | "gameover"
    difficulty: loadDifficulty(),
    score: 0,
    highScore: loadHighScore(),
    isNewRecord: false,
    wave: 1,
    nextBossScore: POINTS_PER_BOSS,
    lives: MAX_LIVES,
    streak: 0,
    bestStreak: 0,
    overclockTimer: 0,
    spawnTimer: 0.4,
    powerupCooldown: 9.0,
    quizTimer: QUIZ_INTERVAL,
    quizDeck: [],
    activeQuiz: null,
    quizAsked: 0,
    quizCorrect: 0,
    pendingBossAfterQuiz: false,
    pendingWaveAfterQuiz: null,
    pendingQuizWasCorrect: null,
    resumeCountdown: 0,
    resumeCountdownLastTick: 0,
    gridOffset: 0,
    elapsed: 0,
    shakeTimer: 0,
    shakeMagnitude: 0,
    breachFlash: 0,
    waveBannerText: "",
    waveBannerColor: COLORS.cyan,
    waveBannerTimer: 0,
    lastMalwareX: CANVAS_WIDTH / 2,
    paddle: {
      x: CANVAS_WIDTH / 2,
      width: PADDLE_BASE_WIDTH,
      targetWidth: PADDLE_BASE_WIDTH,
      flashTimer: 0,
      flashColor: COLORS.cyan
    },
    entities: [],
    particles: [],
    popups: [],
    bgStreams: []
  };

  // Input State
  const input = {
    left: false,
    right: false,
    pointerActive: false,
    pointerX: CANVAS_WIDTH / 2
  };

  // Configure HiDPI Canvas Scaling
  function setupCanvasResolution() {
    const dpr = Math.min(global.devicePixelRatio || 1, 2);
    canvas.width = CANVAS_WIDTH * dpr;
    canvas.height = CANVAS_HEIGHT * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // Initialize decorative ambient background data streams
  function initBgStreams() {
    state.bgStreams = [];
    for (let i = 0; i < 18; i++) {
      state.bgStreams.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        length: 24 + Math.random() * 48,
        speed: 40 + Math.random() * 70,
        alpha: 0.08 + Math.random() * 0.14
      });
    }
  }

  function getDifficultyConfig() {
    return DIFFICULTIES[state.difficulty] || DIFFICULTIES.normal;
  }

  function getPointMultiplier() {
    const baseMult = getDifficultyConfig().pointMultiplier;
    const overclockMult = state.overclockTimer > 0 ? 2 : 1;
    return baseMult * overclockMult;
  }

  function getWaveSpeedMultiplier() {
    const baseWave = Math.min(2.0, 1 + (state.wave - 1) * 0.09);
    return Math.min(2.5, baseWave * getDifficultyConfig().speedMultiplier);
  }

  function getSpawnInterval() {
    const baseInterval = Math.max(0.52, 1.22 - (state.wave - 1) * 0.048);
    return Math.max(0.42, baseInterval * getDifficultyConfig().spawnIntervalMultiplier);
  }

  function setDifficulty(level) {
    if (!Object.prototype.hasOwnProperty.call(DIFFICULTIES, level)) return;
    state.difficulty = level;
    saveDifficulty(level);
    syncDifficultyUI();
    syncHUD();
  }

  function syncDifficultyUI() {
    const cfg = getDifficultyConfig();
    diffButtons.forEach(function (btn) {
      const isSelected = btn.getAttribute("data-difficulty") === state.difficulty;
      btn.classList.toggle("active", isSelected);
      btn.setAttribute("aria-checked", String(isSelected));
    });
    if (legendPacketPts) {
      const pts = PACKET_POINTS * cfg.pointMultiplier;
      legendPacketPts.textContent = "+" + pts + " pts" + (cfg.pointMultiplier > 1 ? " (" + cfg.pointMultiplier + "x)" : " & streak");
    }
  }

  // UI Sync Functions
  function syncMuteUI() {
    const isMuted = global.HuskyAudio.isMuted();
    btnMute.setAttribute("aria-pressed", String(isMuted));
    iconSoundOn.classList.toggle("hidden", isMuted);
    iconSoundOff.classList.toggle("hidden", !isMuted);
    muteLabel.textContent = isMuted ? "MUTED" : "SFX ON";
  }

  function syncPauseButtonUI() {
    const isPaused = state.mode === "paused";
    const canPause = state.mode === "playing" || isPaused;
    btnPause.disabled = !canPause;
    iconPause.classList.toggle("hidden", isPaused);
    iconPlay.classList.toggle("hidden", !isPaused);
    btnPause.querySelector(".btn-label").textContent = isPaused ? "RESUME" : "PAUSE";
  }

  function syncHUD() {
    hudScore.textContent = String(state.score);
    hudWave.textContent = String(state.wave);
    hudStreak.textContent = state.streak + "x";
    hudHighScore.textContent = String(state.highScore);
    startHighScore.textContent = String(state.highScore);

    const overclockActive = state.overclockTimer > 0;
    const totalMult = getPointMultiplier();
    const showMultPill = totalMult > 1;
    hudMultiplier.textContent = totalMult + "X";
    hudMultiplier.classList.toggle("active", showMultPill);
    hudMultiplier.setAttribute("aria-hidden", String(!showMultPill));

    overclockBar.classList.toggle("active", overclockActive && state.mode !== "start");
    if (overclockActive) {
      const pct = Math.max(0, Math.min(1, state.overclockTimer / OVERCLOCK_DURATION));
      overclockFill.style.transform = "scaleX(" + pct.toFixed(4) + ")";
      overclockTime.textContent = state.overclockTimer.toFixed(1) + "s";
    }

    const pips = hudLives.querySelectorAll(".life-pip");
    pips.forEach(function (pip, idx) {
      const alive = idx < state.lives;
      pip.classList.toggle("active", alive);
      pip.classList.toggle("critical", alive && state.lives === 1);
    });
    hudLives.setAttribute("aria-label", state.lives + " of " + MAX_LIVES + " firewall lives remaining");
  }

  function showOverlay(targetMode) {
    overlayStart.classList.toggle("active", targetMode === "start");
    overlayPause.classList.toggle("active", targetMode === "paused");
    if (overlayQuiz) {
      overlayQuiz.classList.toggle("active", targetMode === "quiz");
    }
    overlayGameOver.classList.toggle("active", targetMode === "gameover");
  }

  // Hosford AI & Digital Citizenship Quiz Engine
  function refillQuizDeck() {
    const bank = global.HUSKY_QUESTIONS || [];
    state.quizDeck = [];
    for (let i = 0; i < bank.length; i++) {
      state.quizDeck.push(i);
    }
    // Fisher-Yates shuffle so questions rotate without repeats
    for (let i = state.quizDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = state.quizDeck[i];
      state.quizDeck[i] = state.quizDeck[j];
      state.quizDeck[j] = tmp;
    }
  }

  function openQuiz() {
    const bank = global.HUSKY_QUESTIONS || [];
    if (!bank.length || !overlayQuiz) {
      state.quizTimer = QUIZ_INTERVAL;
      return;
    }

    if (state.quizDeck.length === 0) {
      refillQuizDeck();
    }
    const qIdx = state.quizDeck.pop();
    const rawQ = bank[qIdx];

    // Shuffle answer choices while preserving the correct option
    const options = rawQ.choices.map(function (text, idx) {
      return { text: text, isCorrect: idx === rawQ.correctIndex };
    });
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = options[i];
      options[i] = options[j];
      options[j] = tmp;
    }

    state.mode = "quiz";
    state.quizTimer = QUIZ_INTERVAL;
    state.pendingBossAfterQuiz = false;
    state.pendingWaveAfterQuiz = null;
    state.activeQuiz = {
      category: rawQ.category,
      prompt: rawQ.prompt,
      feedback: rawQ.feedback,
      options: options,
      answered: false,
      wasCorrect: false
    };

    input.left = false;
    input.right = false;
    input.pointerActive = false;

    quizCategory.textContent = "HOSFORD // " + rawQ.category;
    quizPrompt.textContent = rawQ.prompt;
    quizChoices.innerHTML = "";

    options.forEach(function (opt, idx) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "quiz-choice-btn";
      btn.setAttribute("data-choice-idx", String(idx));

      const keySpan = document.createElement("span");
      keySpan.className = "quiz-choice-key";
      keySpan.textContent = String(idx + 1);

      const textSpan = document.createElement("span");
      textSpan.textContent = opt.text;

      btn.appendChild(keySpan);
      btn.appendChild(textSpan);
      btn.addEventListener("click", function () {
        answerQuiz(idx);
      });
      quizChoices.appendChild(btn);
    });

    quizFeedback.classList.add("hidden");
    quizFeedback.classList.remove("correct", "wrong");
    btnQuizContinue.classList.add("hidden");
    quizHint.innerHTML = "Click an answer or press <kbd>1</kbd>–<kbd>4</kbd>";

    global.HuskyAudio.playWaveUp();
    showOverlay("quiz");
    syncPauseButtonUI();
    syncHUD();
  }

  function answerQuiz(choiceIdx) {
    const q = state.activeQuiz;
    if (!q || q.answered) return;
    if (choiceIdx < 0 || choiceIdx >= q.options.length) return;

    q.answered = true;
    state.quizAsked += 1;

    const chosen = q.options[choiceIdx];
    q.wasCorrect = chosen.isCorrect;

    if (chosen.isCorrect) {
      state.quizCorrect += 1;
      state.score += QUIZ_REWARD;

      if (state.score > state.highScore) {
        state.highScore = state.score;
        state.isNewRecord = true;
        saveHighScore(state.highScore);
      }

      const nextWave = Math.floor(state.score / POINTS_PER_WAVE) + 1;
      if (state.score >= state.nextBossScore) {
        state.nextBossScore = (Math.floor(state.score / POINTS_PER_BOSS) + 1) * POINTS_PER_BOSS;
        state.pendingBossAfterQuiz = true;
      }
      if (nextWave > state.wave) {
        state.wave = nextWave;
        state.pendingWaveAfterQuiz = state.wave;
      }

      quizFeedback.classList.add("correct");
      quizFeedbackTitle.textContent = "✓ +" + QUIZ_REWARD + " PTS — GREAT HUSKY CHOICE!";
      global.HuskyAudio.playPowerup();
    } else {
      state.score = Math.max(0, state.score - QUIZ_PENALTY);
      quizFeedback.classList.add("wrong");
      quizFeedbackTitle.textContent = "✖ -" + QUIZ_PENALTY + " PTS — HUSKY TIP:";
      global.HuskyAudio.playBreach();
    }

    quizFeedbackText.textContent = q.feedback;
    quizFeedback.classList.remove("hidden");

    const buttons = quizChoices.querySelectorAll(".quiz-choice-btn");
    buttons.forEach(function (btn, idx) {
      btn.disabled = true;
      const opt = q.options[idx];
      if (opt.isCorrect) {
        btn.classList.add("correct");
      } else if (idx === choiceIdx) {
        btn.classList.add("wrong");
      } else {
        btn.classList.add("dimmed");
      }
    });

    btnQuizContinue.classList.remove("hidden");
    quizHint.innerHTML = "Press <kbd>SPACE</kbd> or <kbd>ENTER</kbd> to continue";
    syncHUD();
  }

  function closeQuizAndResume() {
    if (state.mode !== "quiz" || !state.activeQuiz || !state.activeQuiz.answered) return;

    state.pendingQuizWasCorrect = state.activeQuiz.wasCorrect;
    state.activeQuiz = null;
    state.mode = "countdown";
    state.resumeCountdown = RESUME_COUNTDOWN_DURATION;
    state.resumeCountdownLastTick = Math.ceil(RESUME_COUNTDOWN_DURATION);
    state.quizTimer = QUIZ_INTERVAL;
    state.spawnTimer = Math.max(state.spawnTimer, 0.45);

    global.HuskyAudio.playPause(false);
    showOverlay("countdown");
    syncPauseButtonUI();
    syncHUD();
  }

  function finishResumeCountdown() {
    const wasCorrect = state.pendingQuizWasCorrect;
    const spawnBoss = state.pendingBossAfterQuiz;
    const waveReached = state.pendingWaveAfterQuiz;

    state.pendingQuizWasCorrect = null;
    state.pendingBossAfterQuiz = false;
    state.pendingWaveAfterQuiz = null;
    state.resumeCountdown = 0;
    state.resumeCountdownLastTick = 0;
    state.mode = "playing";

    global.HuskyAudio.playPacketCatch(4);

    if (wasCorrect === true) {
      spawnParticles(state.paddle.x, PADDLE_Y - 12, COLORS.packet, 20, 1.25);
      spawnPopup(CANVAS_WIDTH / 2, PADDLE_Y - 42, "+" + QUIZ_REWARD + " HUSKY QUIZ!", COLORS.packet);
    } else if (wasCorrect === false) {
      spawnPopup(CANVAS_WIDTH / 2, PADDLE_Y - 42, "-" + QUIZ_PENALTY + " QUIZ PENALTY", COLORS.malware);
    }

    if (spawnBoss) {
      spawnBossGlitch();
    } else if (waveReached) {
      triggerWaveBanner("WAVE " + waveReached + " // SPEED UP!", COLORS.cyan);
    }

    syncPauseButtonUI();
    syncHUD();
  }

  // Visual FX Spawners
  function spawnParticles(x, y, color, count, speedScale) {
    const scale = speedScale || 1;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (65 + Math.random() * 175) * scale;
      state.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 35,
        size: 2 + Math.random() * 3.5,
        color: color,
        life: 0.32 + Math.random() * 0.28,
        maxLife: 0.6
      });
    }
  }

  function spawnPopup(x, y, text, color) {
    state.popups.push({
      x: Math.max(54, Math.min(CANVAS_WIDTH - 54, x)),
      y: y,
      text: text,
      color: color,
      life: 0.85,
      maxLife: 0.85
    });
  }

  function triggerWaveBanner(text, color) {
    state.waveBannerText = text;
    state.waveBannerColor = color || COLORS.cyan;
    state.waveBannerTimer = 2.1;
  }

  function spawnBossGlitch() {
    const speedMult = getWaveSpeedMultiplier();
    const x = CANVAS_WIDTH * (0.32 + Math.random() * 0.36);
    state.entities.push({
      type: "boss_glitch",
      x: x,
      y: -36,
      radius: 28,
      vy: (92 + Math.random() * 14) * Math.min(1.6, speedMult),
      vx: (Math.random() < 0.5 ? -1 : 1) * (28 + state.wave * 2),
      phase: Math.random() * Math.PI * 2,
      rot: 0,
      rotSpeed: (Math.random() < 0.5 ? -1 : 1) * 1.2
    });
    triggerWaveBanner("⚠ BOSS GLITCH DETECTED!", COLORS.boss);
  }

  function spawnSplitMiniBugs(originX, originY) {
    const launchY = Math.min(originY, PADDLE_Y - PADDLE_HEIGHT / 2 - 14);
    const leftHigher = Math.random() < 0.5;
    const configs = [
      {
        dir: -1,
        vx: -(74 + Math.random() * 24),
        vy: leftHigher ? -370 : -305
      },
      {
        dir: 1,
        vx: 74 + Math.random() * 24,
        vy: leftHigher ? -305 : -370
      }
    ];

    configs.forEach(function (cfg) {
      const startX = Math.max(28, Math.min(CANVAS_WIDTH - 28, originX + cfg.dir * 18));
      state.entities.push({
        type: "malware",
        isMiniBug: true,
        x: startX,
        y: launchY,
        radius: 12,
        vx: cfg.vx,
        vy: cfg.vy,
        gravity: 300,
        spawnGrace: 0.24,
        phase: Math.random() * Math.PI * 2,
        rot: 0,
        rotSpeed: cfg.dir * 3.6
      });
    });
  }

  // Entity Spawning
  function spawnEntity() {
    const speedMult = getWaveSpeedMultiplier();
    const margin = 44;

    // Decide whether to spawn an occasional gold Overclock orb
    const hasOverclockOnScreen = state.entities.some(function (e) {
      return e.type === "overclock";
    });
    const activeMalwareCount = state.entities.filter(function (e) {
      return e.type === "malware" || e.type === "boss_glitch";
    }).length;
    const maxConcurrentMalware = state.wave < 4 ? 2 : 3;
    let type;

    if (!hasOverclockOnScreen && state.powerupCooldown <= 0 && Math.random() < 0.34) {
      type = "overclock";
      state.powerupCooldown = 9.5 + Math.random() * 4.5;
    } else if (activeMalwareCount >= maxConcurrentMalware) {
      type = "packet";
    } else {
      // Gentle malware proportion that ramps gradually with waves
      const malwareChance = Math.min(0.45, 0.33 + (state.wave - 1) * 0.012);
      type = Math.random() < malwareChance ? "malware" : "packet";
    }

    let x = margin + Math.random() * (CANVAS_WIDTH - margin * 2);

    // Keep consecutive malware spawns within comfortable reach of the shield
    if (type === "malware") {
      const maxDelta = 225;
      if (Math.abs(x - state.lastMalwareX) > maxDelta) {
        const dir = x > state.lastMalwareX ? 1 : -1;
        x = Math.max(margin, Math.min(CANVAS_WIDTH - margin, state.lastMalwareX + dir * (90 + Math.random() * 130)));
      }
      state.lastMalwareX = x;
    }

    if (type === "packet") {
      state.entities.push({
        type: "packet",
        x: x,
        y: -22,
        radius: 17,
        vy: (118 + Math.random() * 34) * speedMult,
        vx: (Math.random() - 0.5) * 10,
        phase: Math.random() * Math.PI * 2
      });
    } else if (type === "malware") {
      state.entities.push({
        type: "malware",
        x: x,
        y: -24,
        radius: 17,
        vy: (126 + Math.random() * 38) * speedMult,
        vx: (Math.random() - 0.5) * (14 + state.wave * 2),
        phase: Math.random() * Math.PI * 2,
        rot: 0,
        rotSpeed: (Math.random() < 0.5 ? -1 : 1) * (1.5 + Math.random() * 1.1)
      });
    } else {
      state.entities.push({
        type: "overclock",
        x: x,
        y: -22,
        radius: 16,
        vy: (110 + Math.random() * 24) * Math.min(1.5, speedMult),
        vx: 0,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  // Lifecycle Actions
  function startNewGame() {
    global.HuskyAudio.unlock();
    global.HuskyAudio.playStart();

    state.mode = "playing";
    state.score = 0;
    state.isNewRecord = false;
    state.wave = 1;
    state.nextBossScore = POINTS_PER_BOSS;
    state.lives = MAX_LIVES;
    state.streak = 0;
    state.bestStreak = 0;
    state.overclockTimer = 0;
    state.spawnTimer = 0.35;
    state.powerupCooldown = 8.5 + Math.random() * 4;
    state.quizTimer = QUIZ_INTERVAL;
    state.activeQuiz = null;
    state.quizAsked = 0;
    state.quizCorrect = 0;
    state.pendingBossAfterQuiz = false;
    state.pendingWaveAfterQuiz = null;
    state.pendingQuizWasCorrect = null;
    state.resumeCountdown = 0;
    state.resumeCountdownLastTick = 0;
    refillQuizDeck();
    const diffCfg = getDifficultyConfig();
    state.shakeTimer = 0;
    state.breachFlash = 0;
    state.waveBannerText = "WAVE 1 // " + diffCfg.label + " MODE";
    state.waveBannerColor =
      state.difficulty === "overdrive"
        ? COLORS.overclock
        : state.difficulty === "chill"
          ? COLORS.packet
          : COLORS.cyan;
    state.waveBannerTimer = 1.6;
    state.entities = [];
    state.particles = [];
    state.popups = [];

    state.paddle.x = CANVAS_WIDTH / 2;
    state.paddle.width = PADDLE_BASE_WIDTH;
    state.paddle.targetWidth = PADDLE_BASE_WIDTH;
    state.paddle.flashTimer = 0;

    input.pointerActive = false;

    showOverlay("playing");
    syncPauseButtonUI();
    syncHUD();
  }

  function togglePause() {
    if (state.mode === "playing") {
      state.mode = "paused";
      global.HuskyAudio.playPause(true);
      showOverlay("paused");
      syncPauseButtonUI();
    } else if (state.mode === "paused") {
      state.mode = "playing";
      global.HuskyAudio.playPause(false);
      showOverlay("playing");
      syncPauseButtonUI();
    }
  }

  function triggerGameOver() {
    state.mode = "gameover";
    global.HuskyAudio.playGameOver();

    if (state.score > state.highScore) {
      state.highScore = state.score;
      state.isNewRecord = true;
      saveHighScore(state.highScore);
    }

    goScore.textContent = String(state.score);
    goHighScore.textContent = String(state.highScore);
    goWave.textContent = String(state.wave);
    goBestStreak.textContent = state.bestStreak + "x";
    goNewRecord.classList.toggle("hidden", !state.isNewRecord);

    if (goQuizSummary) {
      if (state.quizAsked > 0) {
        goQuizSummary.textContent =
          "HOSFORD CHECKPOINTS: " + state.quizCorrect + " / " + state.quizAsked + " CORRECT";
        goQuizSummary.classList.remove("hidden");
      } else {
        goQuizSummary.classList.add("hidden");
      }
    }

    showOverlay("gameover");
    syncPauseButtonUI();
    syncHUD();
  }

  // Update Step
  function update(dt) {
    // Freeze everything completely while quiz modal or pause overlay is open
    if (state.mode === "quiz" || state.mode === "paused") {
      return;
    }

    // 2-second resume countdown after answering a quiz: keep falling objects & timers frozen
    if (state.mode === "countdown") {
      state.resumeCountdown = Math.max(0, state.resumeCountdown - dt);
      const currentTick = Math.ceil(state.resumeCountdown);
      if (currentTick > 0 && currentTick !== state.resumeCountdownLastTick) {
        state.resumeCountdownLastTick = currentTick;
        global.HuskyAudio.playPause(false);
      }
      if (state.resumeCountdown <= 0) {
        finishResumeCountdown();
      }
      return;
    }

    state.elapsed += dt;

    // Ambient scrolling grid & background streams run on start/gameover/playing
    const bgMult = state.mode === "playing" ? getWaveSpeedMultiplier() : 0.45;
    state.gridOffset = (state.gridOffset + 58 * bgMult * dt) % 40;

    for (let i = 0; i < state.bgStreams.length; i++) {
      const s = state.bgStreams[i];
      s.y += s.speed * bgMult * dt;
      if (s.y - s.length > CANVAS_HEIGHT) {
        s.y = -10;
        s.x = Math.random() * CANVAS_WIDTH;
      }
    }

    if (state.mode !== "playing") {
      return;
    }

    // Timers
    if (state.shakeTimer > 0) {
      state.shakeTimer = Math.max(0, state.shakeTimer - dt);
    }
    if (state.breachFlash > 0) {
      state.breachFlash = Math.max(0, state.breachFlash - dt * 1.4);
    }
    if (state.waveBannerTimer > 0) {
      state.waveBannerTimer = Math.max(0, state.waveBannerTimer - dt);
    }
    if (state.paddle.flashTimer > 0) {
      state.paddle.flashTimer = Math.max(0, state.paddle.flashTimer - dt);
    }
    if (state.powerupCooldown > 0) {
      state.powerupCooldown -= dt;
    }

    // Trigger Hosford AI & Digital Citizenship Checkpoint every 30 seconds
    state.quizTimer -= dt;
    if (state.quizTimer <= 0) {
      openQuiz();
      return;
    }

    // Overclock countdown & paddle width interpolation
    if (state.overclockTimer > 0) {
      state.overclockTimer = Math.max(0, state.overclockTimer - dt);
      state.paddle.targetWidth = state.overclockTimer > 0 ? PADDLE_OVERCLOCK_WIDTH : PADDLE_BASE_WIDTH;
    } else {
      state.paddle.targetWidth = PADDLE_BASE_WIDTH;
    }
    state.paddle.width += (state.paddle.targetWidth - state.paddle.width) * Math.min(1, dt * 11);

    // Paddle Movement (Keyboard or Pointer)
    let keyDir = 0;
    if (input.left) keyDir -= 1;
    if (input.right) keyDir += 1;

    if (keyDir !== 0) {
      input.pointerActive = false;
      state.paddle.x += keyDir * PADDLE_SPEED * dt;
    } else if (input.pointerActive) {
      const diff = input.pointerX - state.paddle.x;
      state.paddle.x += diff * Math.min(1, dt * 26);
    }

    const halfW = state.paddle.width / 2;
    state.paddle.x = Math.max(halfW + 8, Math.min(CANVAS_WIDTH - halfW - 8, state.paddle.x));

    // Entity Spawning
    state.spawnTimer -= dt;
    if (state.spawnTimer <= 0) {
      spawnEntity();
      const baseInterval = getSpawnInterval();
      state.spawnTimer = baseInterval * (0.78 + Math.random() * 0.44);
    }

    // Paddle bounding box for collision checks (with slight forgiving edge grace)
    const pLeft = state.paddle.x - halfW - 5;
    const pRight = state.paddle.x + halfW + 5;
    const pTop = PADDLE_Y - PADDLE_HEIGHT / 2 - 3;
    const pBottom = PADDLE_Y + PADDLE_HEIGHT / 2 + 2;

    // Update Entities
    for (let i = state.entities.length - 1; i >= 0; i--) {
      const e = state.entities[i];
      if (e.gravity) {
        e.vy = Math.min(480, e.vy + e.gravity * dt);
      }
      if (e.spawnGrace > 0) {
        e.spawnGrace = Math.max(0, e.spawnGrace - dt);
      }

      e.y += e.vy * dt;
      e.x += e.vx * dt;

      if (e.type === "malware" || e.type === "boss_glitch") {
        e.rot += e.rotSpeed * dt;
      }

      // Bounce softly off side walls
      if (e.x - e.radius < 12) {
        e.x = 12 + e.radius;
        e.vx = Math.abs(e.vx);
      } else if (e.x + e.radius > CANVAS_WIDTH - 12) {
        e.x = CANVAS_WIDTH - 12 - e.radius;
        e.vx = -Math.abs(e.vx);
      }

      // Check Circle-vs-AABB collision with cyber-shield paddle
      let hitPaddle = false;
      if (!(e.spawnGrace > 0)) {
        const closestX = Math.max(pLeft, Math.min(e.x, pRight));
        const closestY = Math.max(pTop, Math.min(e.y, pBottom));
        const dx = e.x - closestX;
        const dy = e.y - closestY;
        hitPaddle = dx * dx + dy * dy <= e.radius * e.radius;
      }

      if (hitPaddle) {
        state.entities.splice(i, 1);
        handlePaddleCatch(e);
        continue;
      }

      // Check bottom firewall boundary
      if (e.vy > 0 && e.y + e.radius >= FIREWALL_Y) {
        if (e.type === "malware" || e.type === "boss_glitch") {
          state.entities.splice(i, 1);
          handleFirewallBreach(e);
          if (state.mode !== "playing") {
            return;
          }
        } else if (e.y - e.radius > CANVAS_HEIGHT + 10) {
          if (e.type === "packet" && state.streak > 0) {
            state.streak = 0;
            spawnPopup(e.x, FIREWALL_Y - 16, "STREAK LOST", "#7da9bb");
          }
          state.entities.splice(i, 1);
        }
      }
    }

    // Update Particles
    for (let i = state.particles.length - 1; i >= 0; i--) {
      const p = state.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        state.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 260 * dt;
    }

    // Update Floating Popups
    for (let i = state.popups.length - 1; i >= 0; i--) {
      const pop = state.popups[i];
      pop.life -= dt;
      if (pop.life <= 0) {
        state.popups.splice(i, 1);
        continue;
      }
      pop.y -= 48 * dt;
    }

    syncHUD();
  }

  function handlePaddleCatch(entity) {
    if (entity.type === "packet") {
      const mult = getPointMultiplier();
      const points = PACKET_POINTS * mult;
      state.score += points;
      state.streak += 1;
      if (state.streak > state.bestStreak) {
        state.bestStreak = state.streak;
      }

      // Live High Score update
      if (state.score > state.highScore) {
        state.highScore = state.score;
        state.isNewRecord = true;
        saveHighScore(state.highScore);
      }

      // Wave Speed Progression every 100 points & Boss Glitch every 500 points
      const nextWave = Math.floor(state.score / POINTS_PER_WAVE) + 1;
      let spawnedBoss = false;
      if (state.score >= state.nextBossScore) {
        state.nextBossScore = (Math.floor(state.score / POINTS_PER_BOSS) + 1) * POINTS_PER_BOSS;
        spawnBossGlitch();
        spawnedBoss = true;
      }

      if (nextWave > state.wave) {
        state.wave = nextWave;
        if (!spawnedBoss) {
          triggerWaveBanner("WAVE " + state.wave + " // SPEED UP!", COLORS.cyan);
        }
        global.HuskyAudio.playWaveUp();
      } else if (spawnedBoss) {
        global.HuskyAudio.playWaveUp();
      } else {
        global.HuskyAudio.playPacketCatch(state.streak);
      }

      state.paddle.flashTimer = 0.16;
      state.paddle.flashColor = mult > 1 ? COLORS.overclock : COLORS.packet;
      spawnParticles(entity.x, PADDLE_Y - 6, COLORS.packet, 14, 1.0);
      spawnPopup(entity.x, PADDLE_Y - 22, "+" + points + (mult > 1 ? " (" + mult + "X)" : ""), mult > 1 ? COLORS.overclock : COLORS.packet);
    } else if (entity.type === "boss_glitch") {
      // Blocking a Boss Glitch splits it into two smaller bugs launched upward!
      state.streak += 1;
      if (state.streak > state.bestStreak) {
        state.bestStreak = state.streak;
      }
      state.paddle.flashTimer = 0.24;
      state.paddle.flashColor = COLORS.boss;
      state.shakeTimer = 0.16;
      state.shakeMagnitude = 4.5;
      global.HuskyAudio.playMalwareBlock();
      spawnParticles(entity.x, PADDLE_Y - 6, COLORS.boss, 18, 1.35);
      spawnParticles(entity.x, PADDLE_Y - 6, COLORS.cyan, 12, 1.15);
      spawnPopup(entity.x, PADDLE_Y - 28, "GLITCH SPLIT!", COLORS.boss);
      spawnSplitMiniBugs(entity.x, entity.y);
    } else if (entity.type === "malware") {
      // Successfully deflected malware!
      state.streak += 1;
      if (state.streak > state.bestStreak) {
        state.bestStreak = state.streak;
      }
      state.paddle.flashTimer = 0.18;
      state.paddle.flashColor = COLORS.cyanBright;
      global.HuskyAudio.playMalwareBlock();
      spawnParticles(entity.x, PADDLE_Y - 6, COLORS.cyan, 10, 1.15);
      spawnParticles(entity.x, PADDLE_Y - 6, COLORS.malware, 8, 0.9);
      spawnPopup(entity.x, PADDLE_Y - 22, "BLOCKED!", COLORS.cyan);
    } else if (entity.type === "overclock") {
      state.overclockTimer = OVERCLOCK_DURATION;
      state.paddle.flashTimer = 0.35;
      state.paddle.flashColor = COLORS.overclock;
      global.HuskyAudio.playPowerup();
      spawnParticles(entity.x, PADDLE_Y - 6, COLORS.overclock, 24, 1.35);
      spawnPopup(entity.x, PADDLE_Y - 28, "OVERCLOCK 2X!", COLORS.overclock);
    }
  }

  function handleFirewallBreach(entity) {
    state.lives = Math.max(0, state.lives - 1);
    state.streak = 0;
    state.shakeTimer = 0.28;
    state.shakeMagnitude = entity.type === "boss_glitch" ? 11 : 8;
    state.breachFlash = 0.55;

    const breachColor = entity.type === "boss_glitch" ? COLORS.boss : COLORS.malware;
    const breachLabel = entity.type === "boss_glitch" ? "BOSS BREACH! -1" : "BREACH! -1";
    spawnParticles(entity.x, FIREWALL_Y - 4, breachColor, entity.type === "boss_glitch" ? 30 : 22, 1.35);
    spawnPopup(entity.x, FIREWALL_Y - 24, breachLabel, breachColor);
    syncHUD();

    if (state.lives <= 0) {
      triggerGameOver();
    } else {
      global.HuskyAudio.playBreach();
    }
  }

  // Rendering Functions
  function drawBackground() {
    ctx.fillStyle = COLORS.navy;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Radial cyber core ambience
    const grad = ctx.createRadialGradient(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT * 0.42,
      20,
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT * 0.5,
      CANVAS_WIDTH * 0.65
    );
    grad.addColorStop(0, "rgba(31, 122, 153, 0.16)");
    grad.addColorStop(1, "rgba(6, 26, 34, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Scrolling cyber grid
    ctx.save();
    ctx.strokeStyle = "rgba(31, 122, 153, 0.16)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 40; x < CANVAS_WIDTH; x += 40) {
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, FIREWALL_Y);
    }
    for (let y = state.gridOffset; y < FIREWALL_Y; y += 40) {
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(CANVAS_WIDTH, y + 0.5);
    }
    ctx.stroke();

    // Subtle vertical network telemetry streams
    for (let i = 0; i < state.bgStreams.length; i++) {
      const s = state.bgStreams[i];
      ctx.strokeStyle = "rgba(124, 201, 232, " + s.alpha.toFixed(3) + ")";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x, s.y - s.length);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawFirewallLine() {
    ctx.save();
    const isCritical = state.lives === 1;
    const isWarn = state.lives === 2;
    const lineColor = isCritical ? COLORS.malware : isWarn ? "#53b8d9" : COLORS.cyan;
    const pulse = 0.65 + 0.35 * Math.sin(state.elapsed * (isCritical ? 10 : 4));

    // Sub-floor shaded zone
    ctx.fillStyle = "rgba(3, 14, 19, 0.85)";
    ctx.fillRect(0, FIREWALL_Y, CANVAS_WIDTH, CANVAS_HEIGHT - FIREWALL_Y);

    // Main laser barrier
    ctx.shadowColor = lineColor;
    ctx.shadowBlur = 12 * pulse;
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, FIREWALL_Y);
    ctx.lineTo(CANVAS_WIDTH, FIREWALL_Y);
    ctx.stroke();

    // Perimeter nodes
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(124, 201, 232, 0.35)";
    ctx.font = "700 10px 'SF Mono', Menlo, Consolas, monospace";
    ctx.textAlign = "center";
    ctx.fillText(
      state.lives === 1 ? "⚠ CRITICAL PERIMETER INTEGRITY ⚠" : "HUSKY FIREWALL PERIMETER // ACTIVE",
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT - 6
    );

    if (state.mode === "playing") {
      const secs = Math.max(0, Math.ceil(state.quizTimer));
      ctx.fillStyle = secs <= 5 ? COLORS.overclock : "rgba(124, 201, 232, 0.6)";
      ctx.textAlign = "right";
      ctx.fillText("QUIZ IN " + secs + "s", CANVAS_WIDTH - 12, CANVAS_HEIGHT - 6);
    } else if (state.mode === "quiz") {
      ctx.fillStyle = COLORS.overclock;
      ctx.textAlign = "right";
      ctx.fillText("TIMER PAUSED", CANVAS_WIDTH - 12, CANVAS_HEIGHT - 6);
    } else if (state.mode === "countdown") {
      ctx.fillStyle = COLORS.cyanBright;
      ctx.textAlign = "right";
      ctx.fillText("RESUMING IN " + Math.max(1, Math.ceil(state.resumeCountdown)) + "s", CANVAS_WIDTH - 12, CANVAS_HEIGHT - 6);
    }
    ctx.restore();
  }

  function drawPaddle() {
    const p = state.paddle;
    const w = p.width;
    const h = PADDLE_HEIGHT;
    const x = p.x - w / 2;
    const y = PADDLE_Y - h / 2;
    const overclock = state.overclockTimer > 0;
    const primaryColor = overclock ? COLORS.overclock : COLORS.cyan;
    const rimColor = p.flashTimer > 0 ? p.flashColor : primaryColor;

    ctx.save();

    // Energy rail glow under shield
    ctx.shadowColor = rimColor;
    ctx.shadowBlur = overclock ? 22 : 16;

    // Beveled cyber-shield body
    const bevel = 7;
    ctx.beginPath();
    ctx.moveTo(x + bevel, y);
    ctx.lineTo(x + w - bevel, y);
    ctx.lineTo(x + w, y + h / 2);
    ctx.lineTo(x + w - bevel, y + h);
    ctx.lineTo(x + bevel, y + h);
    ctx.lineTo(x, y + h / 2);
    ctx.closePath();

    const bodyGrad = ctx.createLinearGradient(x, y, x, y + h);
    if (overclock) {
      bodyGrad.addColorStop(0, "#fff2bd");
      bodyGrad.addColorStop(0.5, COLORS.overclock);
      bodyGrad.addColorStop(1, "#c47d00");
    } else {
      bodyGrad.addColorStop(0, COLORS.cyanBright);
      bodyGrad.addColorStop(0.5, COLORS.cyan);
      bodyGrad.addColorStop(1, COLORS.teal);
    }

    ctx.fillStyle = bodyGrad;
    ctx.fill();

    ctx.lineWidth = 1.6;
    ctx.strokeStyle = p.flashTimer > 0 ? "#ffffff" : COLORS.cyanBright;
    ctx.stroke();

    // Inner dark core slit with Husky emblem chevron
    ctx.shadowBlur = 0;
    ctx.fillStyle = COLORS.navy;
    ctx.fillRect(p.x - w * 0.24, y + 4, w * 0.48, h - 8);

    // Center pulsing cyber core
    ctx.fillStyle = overclock ? "#ffffff" : COLORS.cyanBright;
    ctx.fillRect(p.x - 10, y + 6, 20, h - 12);

    // Top shield deflection arc aura
    ctx.strokeStyle = overclock ? "rgba(255, 209, 102, 0.55)" : "rgba(124, 201, 232, 0.45)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 6, y - 4);
    ctx.quadraticCurveTo(p.x, y - 10, x + w - 6, y - 4);
    ctx.stroke();

    ctx.restore();
  }

  function drawPacket(e) {
    const r = e.radius;
    const pulse = 1 + 0.06 * Math.sin(state.elapsed * 8 + e.phase);

    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.scale(pulse, pulse);

    // Trailing green bit stream
    ctx.strokeStyle = "rgba(57, 255, 136, 0.28)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(0, -r - 18);
    ctx.stroke();

    // Glowing hexagon data packet
    ctx.shadowColor = COLORS.packet;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2;
      const px = Math.cos(angle) * r;
      const py = Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();

    ctx.fillStyle = COLORS.packetDeep;
    ctx.fill();
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = COLORS.packet;
    ctx.stroke();

    // Inner "01" clean telemetry glyph
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#c8ffe0";
    ctx.font = "800 10px 'SF Mono', Menlo, Consolas, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("01", 0, 1);

    ctx.restore();
  }

  function drawMalware(e) {
    const r = e.radius;

    ctx.save();
    ctx.translate(e.x, e.y);

    // Warning red/magenta trail
    const strokeCol = e.isMiniBug ? COLORS.boss : COLORS.malware;
    ctx.strokeStyle = e.isMiniBug ? "rgba(255, 42, 133, 0.36)" : "rgba(255, 59, 92, 0.3)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-4, -r);
    ctx.lineTo(-4, -r - 16);
    ctx.moveTo(4, -r);
    ctx.lineTo(4, -r - 12);
    ctx.stroke();

    ctx.rotate(e.rot);
    ctx.shadowColor = strokeCol;
    ctx.shadowBlur = e.isMiniBug ? 14 : 16;

    // Jagged 8-point cyber virus body
    ctx.beginPath();
    const spikes = 8;
    for (let i = 0; i < spikes * 2; i++) {
      const rad = i % 2 === 0 ? r : r * 0.62;
      const angle = (Math.PI / spikes) * i;
      const px = Math.cos(angle) * rad;
      const py = Math.sin(angle) * rad;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();

    ctx.fillStyle = e.isMiniBug ? COLORS.bossDeep : COLORS.malwareDeep;
    ctx.fill();
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = strokeCol;
    ctx.stroke();

    // Inner glowing X core scaled to bug size
    const cross = r * 0.27;
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "#ffd1da";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-cross, -cross);
    ctx.lineTo(cross, cross);
    ctx.moveTo(cross, -cross);
    ctx.lineTo(-cross, cross);
    ctx.stroke();

    ctx.restore();
  }

  function drawBossGlitch(e) {
    const r = e.radius;
    const jitterX = Math.sin(state.elapsed * 38 + e.phase) * 3;
    const pulse = 1 + 0.05 * Math.sin(state.elapsed * 12 + e.phase);

    ctx.save();
    ctx.translate(e.x, e.y);

    // Outer unstable targeting halo
    ctx.strokeStyle = "rgba(255, 42, 133, 0.55)";
    ctx.lineWidth = 1.6;
    ctx.setLineDash([7, 5]);
    ctx.beginPath();
    ctx.arc(0, 0, r + 7, state.elapsed * 3, state.elapsed * 3 + Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Chromatic aberration cyan & crimson ghosts
    const drawSpikedShape = function (offsetX, offsetY, fill, stroke) {
      ctx.save();
      ctx.translate(offsetX, offsetY);
      ctx.rotate(e.rot);
      ctx.scale(pulse, pulse);
      ctx.beginPath();
      const spikes = 10;
      for (let i = 0; i < spikes * 2; i++) {
        const rad = i % 2 === 0 ? r : r * 0.68;
        const angle = (Math.PI / spikes) * i;
        const px = Math.cos(angle) * rad;
        const py = Math.sin(angle) * rad;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      if (fill) {
        ctx.fillStyle = fill;
        ctx.fill();
      }
      if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 2.4;
        ctx.stroke();
      }
      ctx.restore();
    };

    drawSpikedShape(-jitterX - 2, 0, null, "rgba(124, 201, 232, 0.55)");
    drawSpikedShape(jitterX + 2, 0, null, "rgba(255, 59, 92, 0.55)");

    ctx.shadowColor = COLORS.boss;
    ctx.shadowBlur = 22;
    drawSpikedShape(0, 0, COLORS.bossDeep, COLORS.boss);

    // Horizontal glitch scan slices
    ctx.shadowBlur = 0;
    const sliceOffset = ((state.elapsed * 90) % (r * 1.4)) - r * 0.7;
    ctx.fillStyle = "rgba(124, 201, 232, 0.65)";
    ctx.fillRect(-r * 0.72 + jitterX, sliceOffset, r * 1.44, 2.5);
    ctx.fillStyle = "rgba(255, 42, 133, 0.85)";
    ctx.fillRect(-r * 0.55 - jitterX, -sliceOffset * 0.6, r * 1.1, 2);

    // Core label
    ctx.fillStyle = "#ffe3f0";
    ctx.shadowColor = COLORS.boss;
    ctx.shadowBlur = 8;
    ctx.font = "900 10px 'SF Mono', Menlo, Consolas, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("ERR", jitterX * 0.35, 1);

    ctx.restore();
  }

  function drawOverclock(e) {
    const r = e.radius;
    const spin = state.elapsed * 4 + e.phase;

    ctx.save();
    ctx.translate(e.x, e.y);

    // Outer spinning energy halo
    ctx.shadowColor = COLORS.overclock;
    ctx.shadowBlur = 18;
    ctx.strokeStyle = "rgba(255, 209, 102, 0.7)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, r + 4, spin, spin + Math.PI * 1.35);
    ctx.stroke();

    // Core gold orb
    const orbGrad = ctx.createRadialGradient(-3, -3, 2, 0, 0, r);
    orbGrad.addColorStop(0, "#fff8d6");
    orbGrad.addColorStop(0.55, COLORS.overclock);
    orbGrad.addColorStop(1, COLORS.overclockDeep);

    ctx.fillStyle = orbGrad;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineWidth = 1.8;
    ctx.strokeStyle = "#fff5cc";
    ctx.stroke();

    // Crisp "2X" label
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#2b1900";
    ctx.font = "900 11px 'SF Mono', Menlo, Consolas, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("2X", 0, 1);

    ctx.restore();
  }

  function drawParticles() {
    ctx.save();
    for (let i = 0; i < state.particles.length; i++) {
      const p = state.particles[i];
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.restore();
  }

  function drawPopups() {
    ctx.save();
    ctx.font = "800 13px 'SF Mono', Menlo, Consolas, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let i = 0; i < state.popups.length; i++) {
      const pop = state.popups[i];
      const alpha = Math.max(0, pop.life / pop.maxLife);
      ctx.globalAlpha = alpha;
      ctx.shadowColor = pop.color;
      ctx.shadowBlur = 10;
      ctx.fillStyle = pop.color;
      ctx.fillText(pop.text, pop.x, pop.y);
    }
    ctx.restore();
  }

  function drawWaveBanner() {
    if (state.waveBannerTimer <= 0) return;

    const alpha = Math.min(1, state.waveBannerTimer / 0.45);
    ctx.save();
    ctx.globalAlpha = alpha;

    const bannerY = state.overclockTimer > 0 ? 78 : 42;
    const bannerColor = state.waveBannerColor || COLORS.cyan;
    ctx.fillStyle = "rgba(6, 26, 34, 0.86)";
    ctx.strokeStyle = bannerColor;
    ctx.lineWidth = 1.5;

    const boxW = 310;
    const boxH = 34;
    const bx = (CANVAS_WIDTH - boxW) / 2;
    const by = bannerY - boxH / 2;

    ctx.beginPath();
    ctx.roundRect(bx, by, boxW, boxH, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle =
      bannerColor === COLORS.boss
        ? "#ffd6e9"
        : bannerColor === COLORS.overclock
          ? "#fff2bd"
          : bannerColor === COLORS.packet
            ? "#c8ffe0"
            : COLORS.cyanBright;
    ctx.shadowColor = bannerColor;
    ctx.shadowBlur = 10;
    ctx.font = "800 13px 'SF Mono', Menlo, Consolas, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(state.waveBannerText, CANVAS_WIDTH / 2, bannerY + 1);

    ctx.restore();
  }

  function drawResumeCountdown() {
    if (state.mode !== "countdown") return;

    const secsLeft = Math.max(1, Math.ceil(state.resumeCountdown));
    const progress = Math.max(0, Math.min(1, state.resumeCountdown / RESUME_COUNTDOWN_DURATION));
    const cx = CANVAS_WIDTH / 2;
    const cy = CANVAS_HEIGHT * 0.45;
    const radius = 56;

    ctx.save();

    // Subtle translucent scrim so frozen falling objects stay clearly visible
    ctx.fillStyle = "rgba(4, 18, 24, 0.48)";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Dark navy countdown medallion
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 6, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(6, 26, 34, 0.92)";
    ctx.fill();
    ctx.strokeStyle = "rgba(31, 122, 153, 0.55)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Depleting glowing neon cyan progress arc
    ctx.shadowColor = COLORS.cyan;
    ctx.shadowBlur = 16;
    ctx.strokeStyle = COLORS.cyanBright;
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
    ctx.stroke();

    // Big countdown numeral ("2" then "1")
    ctx.fillStyle = COLORS.cyanBright;
    ctx.font = "900 48px 'SF Mono', Menlo, Consolas, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(secsLeft), cx, cy + 2);

    // Subtitle pill below medallion
    ctx.shadowBlur = 8;
    ctx.fillStyle = COLORS.cyan;
    ctx.font = "800 13px 'SF Mono', Menlo, Consolas, monospace";
    ctx.fillText("RESUMING DEFENSE...", cx, cy + radius + 28);

    ctx.restore();
  }

  function render() {
    ctx.save();

    // Screen shake on breach
    if (state.shakeTimer > 0) {
      const intensity = state.shakeMagnitude * (state.shakeTimer / 0.28);
      const ox = (Math.random() - 0.5) * 2 * intensity;
      const oy = (Math.random() - 0.5) * 2 * intensity;
      ctx.translate(ox, oy);
    }

    drawBackground();
    drawFirewallLine();

    // Render falling entities
    for (let i = 0; i < state.entities.length; i++) {
      const e = state.entities[i];
      if (e.type === "packet") drawPacket(e);
      else if (e.type === "boss_glitch") drawBossGlitch(e);
      else if (e.type === "malware") drawMalware(e);
      else drawOverclock(e);
    }

    drawPaddle();
    drawParticles();
    drawPopups();
    drawWaveBanner();
    drawResumeCountdown();

    ctx.restore();

    // Red perimeter flash overlay when breached
    if (state.breachFlash > 0) {
      ctx.save();
      ctx.fillStyle = "rgba(255, 59, 92, " + (state.breachFlash * 0.42).toFixed(3) + ")";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.restore();
    }
  }

  // Main Animation Loop
  let lastTimestamp = 0;
  function frame(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const dt = Math.min(0.05, Math.max(0, (timestamp - lastTimestamp) / 1000));
    lastTimestamp = timestamp;

    update(dt);
    render();
    global.requestAnimationFrame(frame);
  }

  // Pointer & Touch Mapping
  function updatePointerFromClientX(clientX) {
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0) return;
    const normalized = (clientX - rect.left) / rect.width;
    input.pointerX = Math.max(0, Math.min(CANVAS_WIDTH, normalized * CANVAS_WIDTH));
    input.pointerActive = true;
  }

  canvas.addEventListener("pointerdown", function (evt) {
    global.HuskyAudio.unlock();
    if (state.mode !== "playing") return;
    if (canvas.setPointerCapture) {
      try {
        canvas.setPointerCapture(evt.pointerId);
      } catch (_) {}
    }
    updatePointerFromClientX(evt.clientX);
  });

  canvas.addEventListener("pointermove", function (evt) {
    if (state.mode !== "playing") return;
    // Track mouse hover cleanly or active touch/mouse drag
    if (evt.pointerType === "mouse" || evt.buttons > 0 || evt.pressure > 0) {
      updatePointerFromClientX(evt.clientX);
    }
  });

  // Keyboard Controls
  global.addEventListener("keydown", function (evt) {
    const key = evt.key;

    if (state.mode === "quiz") {
      if (state.activeQuiz && !state.activeQuiz.answered) {
        if (key === "1" || key === "2" || key === "3" || key === "4") {
          evt.preventDefault();
          answerQuiz(parseInt(key, 10) - 1);
          return;
        }
      } else if (key === " " || key === "Enter") {
        evt.preventDefault();
        closeQuizAndResume();
        return;
      }
      if (key === "m" || key === "M") {
        evt.preventDefault();
        global.HuskyAudio.toggleMute();
        syncMuteUI();
      }
      return;
    }

    if (key === "ArrowLeft" || key === "a" || key === "A") {
      input.left = true;
      if (state.mode === "playing") evt.preventDefault();
    } else if (key === "ArrowRight" || key === "d" || key === "D") {
      input.right = true;
      if (state.mode === "playing") evt.preventDefault();
    } else if (key === "p" || key === "P") {
      if (state.mode === "playing" || state.mode === "paused") {
        evt.preventDefault();
        togglePause();
      }
    } else if (key === "m" || key === "M") {
      evt.preventDefault();
      global.HuskyAudio.toggleMute();
      syncMuteUI();
    } else if (key === " " || key === "Enter") {
      if (state.mode === "start" || state.mode === "gameover") {
        evt.preventDefault();
        startNewGame();
      }
    }
  });

  global.addEventListener("keyup", function (evt) {
    const key = evt.key;
    if (key === "ArrowLeft" || key === "a" || key === "A") {
      input.left = false;
    } else if (key === "ArrowRight" || key === "d" || key === "D") {
      input.right = false;
    }
  });

  // Auto-pause if player switches tabs mid-game
  document.addEventListener("visibilitychange", function () {
    if (document.hidden && state.mode === "playing") {
      togglePause();
    }
  });

  // UI Button Listeners
  btnStart.addEventListener("click", startNewGame);
  btnPlayAgain.addEventListener("click", startNewGame);
  if (btnChangeDifficulty) {
    btnChangeDifficulty.addEventListener("click", function () {
      state.mode = "start";
      state.overclockTimer = 0;
      showOverlay("start");
      syncPauseButtonUI();
      syncHUD();
    });
  }
  btnResume.addEventListener("click", togglePause);
  btnPause.addEventListener("click", togglePause);
  btnPauseRestart.addEventListener("click", startNewGame);
  if (btnQuizContinue) {
    btnQuizContinue.addEventListener("click", closeQuizAndResume);
  }

  diffButtons.forEach(function (btn, idx) {
    btn.addEventListener("click", function () {
      const level = btn.getAttribute("data-difficulty");
      global.HuskyAudio.unlock();
      setDifficulty(level);
      global.HuskyAudio.playPause(false);
    });

    btn.addEventListener("keydown", function (evt) {
      if (evt.key === "ArrowLeft" || evt.key === "ArrowRight") {
        evt.preventDefault();
        const delta = evt.key === "ArrowRight" ? 1 : -1;
        const nextBtn = diffButtons[(idx + delta + diffButtons.length) % diffButtons.length];
        if (nextBtn) {
          nextBtn.focus();
          setDifficulty(nextBtn.getAttribute("data-difficulty"));
          global.HuskyAudio.playPause(false);
        }
      }
    });
  });

  btnMute.addEventListener("click", function () {
    global.HuskyAudio.toggleMute();
    syncMuteUI();
  });

  global.addEventListener("resize", setupCanvasResolution);

  // Boot
  setupCanvasResolution();
  initBgStreams();
  syncMuteUI();
  syncDifficultyUI();
  syncPauseButtonUI();
  syncHUD();
  showOverlay("start");
  global.requestAnimationFrame(frame);
})(window);
