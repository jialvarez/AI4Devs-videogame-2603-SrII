import { GameEngine }  from '../engine/game.js';
import { homeCoords, tableSquares, stairCoords, STAIR_FIRST_ID } from '../engine/tableSquares.js';

// Offset para centrar imagen 30x30 sobre coordenada esquina sup-izq del tablero original
const HALF = 15;

// Estados de la máquina
const STATE = {
  ROLL:   'ROLL',    // esperando que el jugador tire el dado
  SELECT: 'SELECT',  // esperando clic en una ficha
  OVER:   'OVER',    // partida terminada
};

export default class GameScene extends Phaser.Scene {
  constructor() { super({ key: 'GameScene' }); }

  preload() {
    this.load.image('board',  'parcheese/data/board_640.png');
    this.load.image('red',    'parcheese/data/red_checker.png');
    this.load.image('green',  'parcheese/data/green_checker.png');
    this.load.image('yellow', 'parcheese/data/yellow_checker.png');
    this.load.image('blue',   'parcheese/data/blue_checker.png');
  }

  create() {
    this.add.image(320, 320, 'board');

    this._initEngine();
    this._buildUI();
    this._buildCheckerSprites();
    this._refreshAllCheckers();

    this.state = STATE.ROLL;
    this._updateUI();
  }

  // ─── Engine ───────────────────────────────────────────────────────────────

  _initEngine() {
    this.engine = new GameEngine();
    this.engine.addPlayer('Rojo',     'red');
    this.engine.addPlayer('Verde',    'green');
    this.engine.addPlayer('Amarillo', 'yellow');
    this.engine.addPlayer('Azul',     'blue');
    this.engine.start();

    // dVal activo y fichas movibles en el turno actual
    this.activeDval  = null;
    this.movable     = [];  // [{ checker, targetSquare }]
    this.bonusPending = null; // null | 10 | 20
  }

  // ─── UI ───────────────────────────────────────────────────────────────────

  _buildUI() {
    const style = { fontSize: '18px', fill: '#fff', stroke: '#000', strokeThickness: 4 };

    // Panel HUD debajo del tablero
    this.turnText  = this.add.text(10, 650, '', style);
    this.diceText  = this.add.text(10, 675, '', style);
    this.msgText   = this.add.text(10, 700, '', { ...style, fontSize: '14px' });

    // Botón tirar dado
    this.rollBtn = this.add.text(540, 665, '🎲 Tirar', {
      fontSize: '22px', fill: '#fff',
      backgroundColor: '#333', padding: { x: 10, y: 6 },
    }).setInteractive({ useHandCursor: true });

    this.rollBtn.on('pointerdown', () => this._onRoll());
    this.rollBtn.on('pointerover',  () => this.rollBtn.setStyle({ fill: '#ff0' }));
    this.rollBtn.on('pointerout',   () => this.rollBtn.setStyle({ fill: '#fff' }));
  }

  _updateUI() {
    const player = this.engine.getCurrentPlayer();
    const colorMap = { red: '#e44', green: '#3c3', yellow: '#dd0', blue: '#55f' };
    const hex = colorMap[player.getColor()] || '#fff';

    this.turnText.setText(`Turno: ${player.getName()}`).setStyle({ fill: hex, fontSize: '18px', stroke: '#000', strokeThickness: 4 });

    if (this.activeDval !== null) {
      const label = this.bonusPending ? `+${this.bonusPending} bonus` : `Dado: ${this.activeDval}`;
      this.diceText.setText(label);
    } else {
      this.diceText.setText('');
    }

    this.rollBtn.setVisible(this.state === STATE.ROLL);
  }

  _setMsg(text) { this.msgText.setText(text); }

  // ─── Sprites de fichas ────────────────────────────────────────────────────

  _buildCheckerSprites() {
    // sprites[color][id] = Phaser.GameObjects.Image
    this.sprites = {};
    for (const player of this.engine.players) {
      const color = player.getColor();
      this.sprites[color] = {};
      for (const chk of player.getCheckers()) {
        const img = this.add.image(0, 0, color)
          .setDisplaySize(30, 30)
          .setInteractive({ useHandCursor: true })
          .setDepth(1);

        img.on('pointerdown', () => this._onCheckerClick(chk));
        img.on('pointerover',  () => { if (img.getData('selectable')) img.setTint(0xffffaa); });
        img.on('pointerout',   () => { if (img.getData('selectable')) img.clearTint(); else this._applyTint(img, chk); });

        this.sprites[color][chk.getID()] = img;
      }
    }
  }

  _getPixelPos(chk) {
    const sq = chk.getSquare();
    const sqId = sq.getID();

    if (sqId === 0) {
      const [x, y] = homeCoords[chk.getColor()][chk.getID()];
      return { x: x + HALF, y: y + HALF };
    }
    if (sqId <= 68) {
      const [x, y] = tableSquares[sqId];
      return { x: x + HALF, y: y + HALF };
    }
    // Escalera
    const color    = chk.getColor();
    const firstId  = STAIR_FIRST_ID[color];
    const stairs   = stairCoords[color];
    const [x, y]   = stairs[sqId - firstId];
    return { x: x + HALF, y: y + HALF };
  }

  _refreshAllCheckers() {
    // Agrupa fichas por casilla para detectar barreras y desplazar
    const squareOccupancy = {};  // squareId → [chk, ...]

    for (const player of this.engine.players) {
      for (const chk of player.getCheckers()) {
        const sqId = chk.getSquare().getID();
        if (!squareOccupancy[sqId]) squareOccupancy[sqId] = [];
        squareOccupancy[sqId].push(chk);
      }
    }

    for (const player of this.engine.players) {
      for (const chk of player.getCheckers()) {
        const img  = this.sprites[chk.getColor()][chk.getID()];
        const sqId = chk.getSquare().getID();
        const base = this._getPixelPos(chk);

        let { x, y } = base;
        const occupants = squareOccupancy[sqId] || [];

        // Desplazar cuando hay 2 fichas en la misma casilla
        if (occupants.length === 2) {
          const idxInSq = occupants.indexOf(chk);
          // Horizontal si la casilla está en fila (filas 238 o 370), vertical si columna
          const coord = sqId > 0 && sqId <= 68 ? tableSquares[sqId] : null;
          const isHorizontal = coord && (coord[1] === 238 || coord[1] === 370 || coord[1] === 304);
          if (isHorizontal) { y += idxInSq === 0 ? -10 : 10; }
          else               { x += idxInSq === 0 ? -10 : 10; }
        }

        img.setPosition(x, y);
        this._applyTint(img, chk);
        img.setData('selectable', false);
      }
    }
  }

  _applyTint(img, chk) {
    if (chk.isInNirvana()) { img.setAlpha(0.3); return; }
    img.setAlpha(1).clearTint();
  }

  _highlightMovable(movable) {
    // Limpiar tints previos
    for (const player of this.engine.players)
      for (const chk of player.getCheckers())
        this.sprites[chk.getColor()][chk.getID()].setData('selectable', false).clearTint();

    for (const { checker } of movable) {
      const img = this.sprites[checker.getColor()][checker.getID()];
      img.setData('selectable', true).setTint(0x00ff00);
    }
  }

  _clearHighlights() {
    for (const player of this.engine.players)
      for (const chk of player.getCheckers()) {
        const img = this.sprites[chk.getColor()][chk.getID()];
        img.setData('selectable', false).clearTint();
      }
  }

  // ─── Lógica de turno ──────────────────────────────────────────────────────

  _onRoll() {
    if (this.state !== STATE.ROLL) return;

    const player = this.engine.getCurrentPlayer();
    const dVal   = this.engine.rollDice();
    this.activeDval = dVal;
    this._setMsg('');

    // Si dado=5 y hay fichas en casa → sacar automáticamente
    if (dVal === 5) {
      player.resetSixTimes();
      const chkAtHome = player.checkersAtHome();
      if (chkAtHome) {
        const { bonus } = this.engine.moveChecker(player, chkAtHome, 5);
        this._refreshAllCheckers();
        this._updateUI();
        if (bonus === 20) { this._startBonus(player, 20); return; }
        if (this.engine.checkWinner()) { this._endGame(); return; }
        this._setMsg(`${player.getName()} saca ficha con 5.`);
        // Con 5 el turno termina (no se repite)
        this._endTurn();
        return;
      }
    }

    // Tres seises seguidos: sanción
    if (dVal === 6) {
      if (!player.incSixTimes()) {
        this._setMsg('¡Tres seises! Ficha a casa.');
        // Manda la primera ficha en juego a casa
        const chkToSend = player.getCheckers().find(c => c.getPos() !== 0 && !c.isInNirvana());
        if (chkToSend) this.engine.sendCheckerHome(player, chkToSend);
        this._refreshAllCheckers();
        this._endTurn();
        return;
      }
    } else if (dVal !== 20 && dVal !== 10) {
      player.resetSixTimes();
    }

    // ¿Puede mover alguien?
    const movable = this.engine.getMovableCheckers(player, dVal);
    if (movable.length === 0) {
      this._setMsg(`${player.getName()} no puede mover. Turno perdido.`);
      this._endTurn();
      return;
    }

    // ¿Barrera obligatoria?
    const barrierChk = this.engine.barrierChecker(player, dVal);
    if (barrierChk) {
      const forced = movable.find(m => m.checker === barrierChk);
      if (forced) { this._doMove(player, forced.checker, dVal); return; }
    }

    // Si sólo hay una opción, mover automáticamente
    if (movable.length === 1) {
      this._doMove(player, movable[0].checker, dVal);
      return;
    }

    // Esperar selección del jugador
    this.movable = movable;
    this.state   = STATE.SELECT;
    this._highlightMovable(movable);
    this._setMsg('Haz clic en la ficha que quieres mover.');
    this._updateUI();
  }

  _onCheckerClick(chk) {
    if (this.state !== STATE.SELECT) return;

    const isMovable = this.movable.some(m => m.checker === chk);
    if (!isMovable) { this._setMsg('Esa ficha no puede moverse ahora.'); return; }

    this._clearHighlights();
    this._doMove(this.engine.getCurrentPlayer(), chk, this.activeDval);
  }

  _doMove(player, chk, dVal) {
    const { bonus } = this.engine.moveChecker(player, chk, dVal);
    this._refreshAllCheckers();
    this.movable = [];

    if (this.engine.checkWinner()) { this._endGame(); return; }

    if (bonus === 20) { this._startBonus(player, 20); return; }
    if (bonus === 10) { this._startBonus(player, 10); return; }

    // Si dado fue 6 o 12 → el mismo jugador vuelve a tirar
    if (dVal === 6 || dVal === 12) {
      this._setMsg(`${player.getName()} saca ${dVal}. ¡Repite turno!`);
      this.activeDval = null;
      this.state = STATE.ROLL;
      this._updateUI();
      return;
    }

    this._endTurn();
  }

  _startBonus(player, bonusDval) {
    this.bonusPending = bonusDval;
    this.activeDval   = bonusDval;
    const label = bonusDval === 20 ? '¡Come ficha! +20 casillas.' : '¡Meta! +10 casillas.';
    this._setMsg(`${label} Elige ficha para mover.`);

    const movable = this.engine.getMovableCheckers(player, bonusDval);
    if (movable.length === 0) {
      this.bonusPending = null;
      this._endTurn();
      return;
    }

    if (movable.length === 1) {
      this.bonusPending = null;
      this._doMove(player, movable[0].checker, bonusDval);
      return;
    }

    this.movable = movable;
    this.state   = STATE.SELECT;
    this._highlightMovable(movable);
    this._updateUI();
  }

  _endTurn() {
    this.activeDval   = null;
    this.bonusPending = null;
    this.movable      = [];
    this.engine.nextPlayer();
    this.state = STATE.ROLL;
    this._updateUI();
    this._setMsg('');
  }

  _endGame() {
    const winner = this.engine.checkWinner();
    this.state = STATE.OVER;
    this.rollBtn.setVisible(false);
    this._setMsg(`🏆 ¡${winner.getName()} ha ganado!`);
    this.add.text(320, 320, `¡${winner.getName()} gana!`, {
      fontSize: '48px', fill: '#fff', stroke: '#000', strokeThickness: 8,
    }).setOrigin(0.5).setDepth(10);
  }
}
