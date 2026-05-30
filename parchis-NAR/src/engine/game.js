import { Player } from './player.js';
import { Table }  from './table.js';

export class GameEngine {
  constructor() {
    this.players = [];
    this.table   = null;
    this.turnIdx = 0;
  }

  addPlayer(name, color) {
    this.players.push(new Player(name, color));
  }

  start() {
    // El turno comienza por el último de la lista (imitando el .reverse() del original)
    this.table = new Table(this.players);
    this.turnIdx = this.players.length - 1;
  }

  getCurrentPlayer() { return this.players[this.turnIdx]; }

  nextPlayer() {
    this.turnIdx = (this.turnIdx - 1 + this.players.length) % this.players.length;
    return this.getCurrentPlayer();
  }

  rollDice() { return Math.floor(Math.random() * 6) + 1; }

  getNormalSquares()       { return this.table.getNormalSquares(); }
  getStairSquares(player)  { return this.table.getStairSquares(player); }

  checkWinner() {
    return this.players.find(p => p.hasWon()) || null;
  }

  // Devuelve true si el jugador tiene barrera que FUERZA mover una ficha específica.
  barrierChecker(player, dVal) {
    const normalS = this.getNormalSquares();
    const stairS  = this.getStairSquares(player);
    const chk     = player.checkIfHasBarrier(null, dVal, normalS, stairS);
    return chk || null;
  }

  // Calcula qué fichas puede mover el jugador con este dado.
  // Devuelve array de objetos { checker, targetSquare }
  getMovableCheckers(player, dVal) {
    const normalS = this.getNormalSquares();
    const stairS  = this.getStairSquares(player);
    const result  = [];

    for (const chk of player.getCheckers()) {
      if (chk.isInNirvana()) continue;
      if (chk.getPos() === 0 && dVal !== 5) continue;
      const target = player.checkIfChkCanMove(chk, dVal, normalS, stairS);
      if (target) result.push({ checker: chk, targetSquare: target });
    }
    return result;
  }

  // Mueve la ficha indicada con el dado dado.
  // Devuelve: { bonus: 20|10|null, wentHome: bool }
  moveChecker(player, chk, dVal) {
    const normalS = this.getNormalSquares();
    const stairS  = this.getStairSquares(player);

    // Si dVal=5 y ficha en casa → sacar a posición inicial
    if (dVal === 5 && chk.getPos() === 0) {
      const resOut = player.toInitPos(chk, normalS);
      const bonus  = (resOut === 20) ? 20 : null;
      return { bonus, wentHome: false };
    }

    const targetSq = player.checkIfChkCanMove(chk, dVal, normalS, stairS);
    if (!targetSq) return { bonus: null, wentHome: false };

    const moveResult = player.move(chk, chk.getSquare(), targetSq, normalS);
    return { bonus: moveResult, wentHome: false };
  }

  // Manda la ficha a casa (sanción por tres seises)
  sendCheckerHome(player, chk) {
    const normalS = this.getNormalSquares();
    player.toHome(chk, normalS);
  }
}
