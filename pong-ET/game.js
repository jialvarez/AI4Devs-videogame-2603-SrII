// @ts-check
// noinspection JSUnusedLocalSymbols

/**
 * @typedef {'easy' | 'medium' | 'hard'} Difficulty
 */

/**
 * @typedef {'start' | 'playing' | 'gameover'} GameState
 */

/**
 * @typedef {Object} Ball
 * @property {number} x
 * @property {number} y
 * @property {number} vx
 * @property {number} vy
 * @property {number} speed
 * @property {number} radius
 */

/**
 * @typedef {Object} Paddle
 * @property {number} x
 * @property {number} y
 * @property {number} width
 * @property {number} height
 * @property {number} flashTimer
 */

/**
 * @typedef {Object} DifficultyConfig
 * @property {number} ballSpeed
 * @property {number} aiSpeed
 * @property {number} aiReactionInterval
 * @property {boolean} aiPredicts
 * @property {number} speedIncrement
 */

/**
 * @typedef {Object} InputState
 * @property {boolean} up
 * @property {boolean} down
 * @property {number | null} pointerX
 * @property {number | null} pointerY
 * @property {boolean} usePointer
 */

/**
 * @typedef {Object} Button
 * @property {number} x
 * @property {number} y
 * @property {number} width
 * @property {number} height
 * @property {string} label
 * @property {Difficulty} difficulty
 */

;(function () {
  'use strict';

  // ─── CONSTANTS ───────────────────────────────────────────────────────

  const W = 800;
  const H = 600;
  const PADDLE_W = 14;
  const PADDLE_H = 100;
  const PADDLE_MARGIN = 30;
  const BALL_R = 8;
  const PLAYER_SPEED = 450;
  const WIN_SCORE = 5;
  const FLASH_DUR = 0.15;
  const SERVE_DELAY = 0.8;
  const MAX_DT = 0.05;
  const MAX_BOUNCE_ITER = 10;

  const COLOR = Object.freeze({
    bg: '#0a0a0a',
    neon: '#00ff88',
    cyan: '#00ccff',
    dim: '#1a3a2a',
    white: '#ffffff',
  });

  // ─── DIFFICULTY CONFIGS (Open-Closed: add new levels here) ───────────

  /** @type {Record<Difficulty, DifficultyConfig>} */
  const DIFFICULTIES = Object.freeze({
    easy: {
      ballSpeed: 280,
      aiSpeed: 170,
      aiReactionInterval: 300,
      aiPredicts: false,
      speedIncrement: 10,
    },
    medium: {
      ballSpeed: 370,
      aiSpeed: 290,
      aiReactionInterval: 100,
      aiPredicts: false,
      speedIncrement: 20,
    },
    hard: {
      ballSpeed: 460,
      aiSpeed: 400,
      aiReactionInterval: 16,
      aiPredicts: true,
      speedIncrement: 30,
    },
  });

  // ─── DOM ─────────────────────────────────────────────────────────────

  const canvasEl = document.getElementById('game');
  if (!canvasEl || !(canvasEl instanceof HTMLCanvasElement)) {
    throw new Error('Canvas #game not found');
  }
  const cvs = canvasEl;

  const ctxRaw = cvs.getContext('2d');
  if (!ctxRaw) {
    throw new Error('2D context unavailable');
  }
  const ctx = ctxRaw;

  // ─── GAME STATE ──────────────────────────────────────────────────────

  /** @type {GameState} */
  let state = 'start';

  /** @type {Difficulty} */
  let difficulty = 'easy';

  /** @type {DifficultyConfig} */
  let config = DIFFICULTIES.easy;

  /** @type {{ player: number, ai: number }} */
  let score = { player: 0, ai: 0 };

  let ball = makeBall();

  let playerPaddle = makePaddle(PADDLE_MARGIN);
  let aiPaddle = makePaddle(W - PADDLE_MARGIN - PADDLE_W);

  let serveTimer = 0;
  let lastTime = 0;

  /** @type {{ lastReaction: number, targetY: number }} */
  let ai = { lastReaction: 0, targetY: H / 2 };

  /** @type {InputState} */
  let input = {
    up: false,
    down: false,
    pointerX: null,
    pointerY: null,
    usePointer: false,
  };

  /** @type {Button[]} */
  const buttons = [
    makeButton('Fácil', 'easy', 260),
    makeButton('Intermedio', 'medium', 330),
    makeButton('Difícil', 'hard', 400),
  ];

  // ─── FACTORIES ───────────────────────────────────────────────────────

  /** @returns {Ball} */
  function makeBall() {
    return { x: W / 2, y: H / 2, vx: 0, vy: 0, speed: 0, radius: BALL_R };
  }

  /** @param {number} x @returns {Paddle} */
  function makePaddle(x) {
    return {
      x,
      y: (H - PADDLE_H) / 2,
      width: PADDLE_W,
      height: PADDLE_H,
      flashTimer: 0,
    };
  }

  /**
   * @param {string} label
   * @param {Difficulty} diff
   * @param {number} y
   * @returns {Button}
   */
  function makeButton(label, diff, y) {
    const bw = 240;
    const bh = 48;
    return {
      x: (W - bw) / 2,
      y,
      width: bw,
      height: bh,
      label,
      difficulty: diff,
    };
  }

  // ─── UTILITIES ───────────────────────────────────────────────────────

  /**
   * @param {number} v
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  function clamp(v, min, max) {
    return v < min ? min : v > max ? max : v;
  }

  /**
   * @param {number} cx
   * @param {number} cy
   * @param {Button} btn
   * @returns {boolean}
   */
  function hitTest(cx, cy, btn) {
    return (
      cx >= btn.x && cx <= btn.x + btn.width &&
      cy >= btn.y && cy <= btn.y + btn.height
    );
  }

  /**
   * @param {MouseEvent | Touch} evt
   * @returns {{ x: number, y: number }}
   */
  function canvasCoords(evt) {
    const rect = cvs.getBoundingClientRect();
    return {
      x: (evt.clientX - rect.left) * (W / rect.width),
      y: (evt.clientY - rect.top) * (H / rect.height),
    };
  }

  /** @param {string} color @param {number} blur */
  function setShadow(color, blur) {
    ctx.shadowColor = color;
    ctx.shadowBlur = blur;
  }

  function clearShadow() {
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  }

  // ─── INPUT ───────────────────────────────────────────────────────────

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
      input.up = true;
      input.usePointer = false;
    }
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
      input.down = true;
      input.usePointer = false;
    }
    if (e.key === ' ' && state === 'gameover') {
      goToStart();
    }
  });

  document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
      input.up = false;
    }
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
      input.down = false;
    }
  });

  cvs.addEventListener('mousemove', (e) => {
    const pos = canvasCoords(e);
    input.pointerX = pos.x;
    input.pointerY = pos.y;
    input.usePointer = true;
  });

  cvs.addEventListener('mouseleave', () => {
    input.pointerX = null;
    input.pointerY = null;
  });

  cvs.addEventListener('click', (e) => {
    const pos = canvasCoords(e);
    handlePointerTap(pos.x, pos.y);
  });

  cvs.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (e.touches.length === 0) return;
    const pos = canvasCoords(e.touches[0]);
    input.pointerY = pos.y;
    input.usePointer = true;
    handlePointerTap(pos.x, pos.y);
  }, { passive: false });

  cvs.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (e.touches.length === 0) return;
    const pos = canvasCoords(e.touches[0]);
    input.pointerY = pos.y;
    input.usePointer = true;
  }, { passive: false });

  cvs.addEventListener('touchend', () => {
    input.pointerY = null;
    input.usePointer = false;
  });

  /**
   * @param {number} cx
   * @param {number} cy
   */
  function handlePointerTap(cx, cy) {
    if (state === 'start') {
      for (const btn of buttons) {
        if (hitTest(cx, cy, btn)) {
          startGame(btn.difficulty);
          return;
        }
      }
    }
    if (state === 'gameover') {
      goToStart();
    }
  }

  // ─── STATE TRANSITIONS ───────────────────────────────────────────────

  function goToStart() {
    state = 'start';
  }

  /** @param {Difficulty} diff */
  function startGame(diff) {
    difficulty = diff;
    config = DIFFICULTIES[diff];
    score = { player: 0, ai: 0 };
    resetField();
    serve(Math.random() < 0.5 ? 1 : -1);
    state = 'playing';
  }

  function resetField() {
    ball = makeBall();
    playerPaddle = makePaddle(PADDLE_MARGIN);
    aiPaddle = makePaddle(W - PADDLE_MARGIN - PADDLE_W);
    ai = { lastReaction: 0, targetY: H / 2 };
  }

  /**
   * @param {number} dirX 1 = toward AI (right), -1 = toward player (left)
   */
  function serve(dirX) {
    ball.x = W / 2;
    ball.y = H / 2;
    ball.speed = config.ballSpeed;
    const angle = (Math.random() * 60 - 30) * (Math.PI / 180);
    ball.vx = ball.speed * Math.cos(angle) * dirX;
    ball.vy = ball.speed * Math.sin(angle);
    serveTimer = SERVE_DELAY;
  }

  // ─── UPDATE ──────────────────────────────────────────────────────────

  /**
   * @param {number} dt
   * @param {number} timestamp
   */
  function update(dt, timestamp) {
    if (state !== 'playing') return;

    if (serveTimer > 0) {
      serveTimer -= dt;
      updatePlayerPaddle(dt);
      updateFlashTimers(dt);
      return;
    }

    updatePlayerPaddle(dt);
    updateAIPaddle(dt, timestamp);
    updateBall(dt);
    updateFlashTimers(dt);
  }

  /** @param {number} dt */
  function updatePlayerPaddle(dt) {
    if (input.usePointer && input.pointerY !== null) {
      const target = input.pointerY - playerPaddle.height / 2;
      playerPaddle.y = clamp(target, 0, H - playerPaddle.height);
    } else {
      if (input.up) playerPaddle.y -= PLAYER_SPEED * dt;
      if (input.down) playerPaddle.y += PLAYER_SPEED * dt;
      playerPaddle.y = clamp(playerPaddle.y, 0, H - playerPaddle.height);
    }
  }

  /**
   * @param {number} dt
   * @param {number} timestamp
   */
  function updateAIPaddle(dt, timestamp) {
    if (timestamp - ai.lastReaction >= config.aiReactionInterval) {
      ai.lastReaction = timestamp;
      ai.targetY = config.aiPredicts
        ? predictBallY(ball, aiPaddle.x)
        : ball.y;
    }

    const center = aiPaddle.y + aiPaddle.height / 2;
    const diff = ai.targetY - center;
    if (Math.abs(diff) > 3) {
      const move = Math.sign(diff) * Math.min(Math.abs(diff), config.aiSpeed * dt);
      aiPaddle.y = clamp(aiPaddle.y + move, 0, H - aiPaddle.height);
    }
  }

  /**
   * @param {Ball} b
   * @param {number} targetX
   * @returns {number}
   */
  function predictBallY(b, targetX) {
    if (b.vx <= 0) return b.y;
    const time = (targetX - b.x) / b.vx;
    let py = b.y + b.vy * time;
    let i = 0;
    while ((py < 0 || py > H) && i < MAX_BOUNCE_ITER) {
      if (py < 0) py = -py;
      if (py > H) py = 2 * H - py;
      i++;
    }
    return clamp(py, 0, H);
  }

  /** @param {number} dt */
  function updateBall(dt) {
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;

    if (ball.y - ball.radius <= 0) {
      ball.y = ball.radius;
      ball.vy = Math.abs(ball.vy);
    }
    if (ball.y + ball.radius >= H) {
      ball.y = H - ball.radius;
      ball.vy = -Math.abs(ball.vy);
    }

    if (collidesPaddle(ball, playerPaddle)) {
      onPaddleHit(ball, playerPaddle, 1);
    }
    if (collidesPaddle(ball, aiPaddle)) {
      onPaddleHit(ball, aiPaddle, -1);
    }

    if (ball.x + ball.radius < 0) {
      score.ai++;
      if (!checkWin()) serve(1);
    }
    if (ball.x - ball.radius > W) {
      score.player++;
      if (!checkWin()) serve(-1);
    }
  }

  /** @returns {boolean} */
  function checkWin() {
    if (score.player >= WIN_SCORE || score.ai >= WIN_SCORE) {
      state = 'gameover';
      return true;
    }
    return false;
  }

  /**
   * @param {Ball} b
   * @param {Paddle} p
   * @returns {boolean}
   */
  function collidesPaddle(b, p) {
    return (
      b.x + b.radius > p.x &&
      b.x - b.radius < p.x + p.width &&
      b.y + b.radius > p.y &&
      b.y - b.radius < p.y + p.height
    );
  }

  /**
   * @param {Ball} b
   * @param {Paddle} p
   * @param {number} dirX
   */
  function onPaddleHit(b, p, dirX) {
    const relative = (b.y - p.y) / p.height;
    const angle = (relative - 0.5) * Math.PI * 0.7;
    b.speed += config.speedIncrement;
    b.vx = b.speed * Math.cos(angle) * dirX;
    b.vy = b.speed * Math.sin(angle);
    b.x = dirX > 0
      ? p.x + p.width + b.radius
      : p.x - b.radius;
    p.flashTimer = FLASH_DUR;
  }

  /** @param {number} dt */
  function updateFlashTimers(dt) {
    playerPaddle.flashTimer = Math.max(0, playerPaddle.flashTimer - dt);
    aiPaddle.flashTimer = Math.max(0, aiPaddle.flashTimer - dt);
  }

  // ─── RENDERING ───────────────────────────────────────────────────────

  function render() {
    ctx.fillStyle = COLOR.bg;
    ctx.fillRect(0, 0, W, H);

    switch (state) {
      case 'start': renderStart(); break;
      case 'playing': renderPlaying(); break;
      case 'gameover': renderGameOver(); break;
    }
  }

  function renderStart() {
    setShadow(COLOR.neon, 20);
    ctx.font = 'bold 72px monospace';
    ctx.fillStyle = COLOR.neon;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PONG', W / 2, 120);
    clearShadow();

    ctx.font = '16px monospace';
    ctx.fillStyle = COLOR.dim;
    ctx.fillText('Selecciona dificultad', W / 2, 195);

    for (const btn of buttons) {
      const hovered = input.pointerX !== null && hitTest(input.pointerX, input.pointerY ?? -1, btn);
      drawButton(btn, hovered);
    }

    ctx.font = '13px monospace';
    ctx.fillStyle = COLOR.dim;
    ctx.fillText('↑ ↓  ó  W / S  para mover  ·  Mouse / Touch', W / 2, H - 50);
    ctx.fillText('Primero a 5 gana', W / 2, H - 28);
  }

  /**
   * @param {Button} btn
   * @param {boolean} hovered
   */
  function drawButton(btn, hovered) {
    const fill = hovered ? '#112211' : '#0a0a0a';
    const border = hovered ? COLOR.neon : COLOR.dim;
    ctx.fillStyle = fill;
    ctx.strokeStyle = border;
    ctx.lineWidth = 2;
    ctx.fillRect(btn.x, btn.y, btn.width, btn.height);
    ctx.strokeRect(btn.x, btn.y, btn.width, btn.height);

    if (hovered) setShadow(COLOR.neon, 10);
    ctx.font = 'bold 18px monospace';
    ctx.fillStyle = hovered ? COLOR.neon : COLOR.dim;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(btn.label, btn.x + btn.width / 2, btn.y + btn.height / 2);
    clearShadow();
  }

  function renderPlaying() {
    drawCenterLine();
    drawScore();
    drawPaddle(playerPaddle, COLOR.neon);
    drawPaddle(aiPaddle, COLOR.cyan);
    drawBall();
  }

  function drawCenterLine() {
    ctx.setLineDash([8, 12]);
    ctx.strokeStyle = COLOR.dim;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W / 2, 0);
    ctx.lineTo(W / 2, H);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function drawScore() {
    ctx.font = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    setShadow(COLOR.neon, 8);
    ctx.fillStyle = COLOR.neon;
    ctx.fillText(String(score.player), W / 4, 40);
    clearShadow();

    setShadow(COLOR.cyan, 8);
    ctx.fillStyle = COLOR.cyan;
    ctx.fillText(String(score.ai), 3 * W / 4, 40);
    clearShadow();
  }

  /**
   * @param {Paddle} p
   * @param {string} color
   */
  function drawPaddle(p, color) {
    const flashing = p.flashTimer > 0;
    const fillColor = flashing ? COLOR.white : color;
    const glowSize = flashing ? 25 : 12;

    ctx.fillStyle = fillColor;
    setShadow(fillColor, glowSize);
    ctx.fillRect(p.x, p.y, p.width, p.height);
    clearShadow();
  }

  function drawBall() {
    if (serveTimer > 0) {
      const pulse = Math.sin(serveTimer * 12) * 0.3 + 0.7;
      ctx.globalAlpha = pulse;
    }

    ctx.fillStyle = COLOR.white;
    setShadow(COLOR.white, 15);
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    clearShadow();

    ctx.globalAlpha = 1;
  }

  function renderGameOver() {
    drawCenterLine();
    drawPaddle(playerPaddle, COLOR.neon);
    drawPaddle(aiPaddle, COLOR.cyan);
    drawScore();

    ctx.fillStyle = 'rgba(5, 5, 5, 0.85)';
    ctx.fillRect(0, 0, W, H);

    setShadow(COLOR.neon, 20);
    ctx.font = 'bold 56px monospace';
    ctx.fillStyle = COLOR.neon;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GAME OVER', W / 2, H / 3);
    clearShadow();

    const playerWon = score.player >= WIN_SCORE;
    const winColor = playerWon ? COLOR.neon : COLOR.cyan;
    const winText = playerWon ? '¡Ganaste!' : 'Gana la CPU';

    setShadow(winColor, 12);
    ctx.font = 'bold 28px monospace';
    ctx.fillStyle = winColor;
    ctx.fillText(winText, W / 2, H / 2);
    clearShadow();

    ctx.font = '20px monospace';
    ctx.fillStyle = COLOR.white;
    ctx.fillText(`${score.player}  -  ${score.ai}`, W / 2, H / 2 + 45);

    ctx.font = '14px monospace';
    ctx.fillStyle = COLOR.dim;
    ctx.fillText('Click o ESPACIO para jugar de nuevo', W / 2, H * 2 / 3);
  }

  // ─── GAME LOOP ───────────────────────────────────────────────────────

  /**
   * @param {number} timestamp
   */
  function loop(timestamp) {
    const raw = (timestamp - lastTime) / 1000;
    const dt = Math.min(raw, MAX_DT);
    lastTime = timestamp;

    update(dt, timestamp);
    render();
    requestAnimationFrame(loop);
  }

  // ─── START ───────────────────────────────────────────────────────────

  lastTime = performance.now();
  requestAnimationFrame(loop);
})();
