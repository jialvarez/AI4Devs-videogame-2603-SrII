import { Checker } from './checker.js';
import { INIT_POS, LAST_POS, STAIR_FIRST_ID } from './tableSquares.js';

export class Player {
  constructor(name, color) {
    this.name     = name;
    this.color    = color;
    this.checkers = [];
    this.initPos  = INIT_POS[color];
    this.lastPos  = LAST_POS[color];
    this.sixTimes = 0;
    this.movType  = null;
  }

  getName()     { return this.name; }
  getColor()    { return this.color; }
  getCheckers() { return this.checkers; }
  getSixTimes() { return this.sixTimes; }

  resetSixTimes() { this.sixTimes = 0; }

  // Incrementa contador de seises. Devuelve false al tercer seis (se resetea).
  incSixTimes() {
    if (this.sixTimes === 2) { this.resetSixTimes(); return false; }
    this.sixTimes++;
    return true;
  }

  setMovType(t) { this.movType = t; }
  getMovType()  { return this.movType; }

  initCheckers(homeSquare) {
    this.checkers = [0, 1, 2, 3].map(i => new Checker(this, homeSquare, i));
  }

  checkersAtHome() {
    return this.checkers.find(c => c.getPos() === 0) || false;
  }

  getNumChksAtHome() {
    return this.checkers.filter(c => c.getPos() === 0).length;
  }

  // Devuelve la ficha seleccionada o false si está en casa/nirvana
  selectChecker(chkID) {
    const chk = this.checkers[chkID];
    if (chk.getPos() === 0 || chk.isInNirvana()) return false;
    return chk;
  }

  toHome(chk, normalS) {
    chk.square.popChecker(chk);
    normalS[0].addChecker(chk);
    chk.inStairs = false;
  }

  // Lleva una ficha a la posición inicial del jugador.
  // Devuelve: true (ok), false (bloqueado), 20 (comió rival)
  toInitPos(chk, squares) {
    const squ     = squares[this.initPos];
    const chkInSq = squ.getCheckers();

    if (chkInSq.length === 2) {
      if (!this._testEatsAtHome(squ, chk, squares)) {
        return false;   // bloqueado, no puede salir
      }
      squ.addChecker(chk);
      return 20;
    }

    squ.addChecker(chk);
    if (chkInSq.length === 2) {
      return this._testEatsAtHome(squ, chk, squares) ? 20 : true;
    }
    return true;
  }

  _testEatsAtHome(squ, chk, squares) {
    if (!this.checkIfNiamNiam(squ, chk, squares)) {
      this.setMovType('locked');
      squ.setLock(true);
      return false;
    }
    return true;
  }

  // ¿Está la ficha cerca de su pasillo de meta?
  nearStairs(chk) {
    const pos = chk.getPos();
    if (this.color === 'yellow') return pos > this.lastPos - 19;
    return pos > this.lastPos - 19 && pos < this.initPos;
  }

  // Comprueba que ninguna casilla del rango está bloqueada.
  // squares puede ser normalS o stairS (ambos accedidos por índice).
  checkMobility(range, squares, newSq) {
    for (const idx of range) {
      if (squares[idx] && squares[idx].isLocked()) {
        this.setMovType('range');
        return false;
      }
    }
    return newSq;
  }

  checkMobEnterStairs(startIdx, endIdx, squares, targetSq) {
    const rng = [];
    for (let i = startIdx; i < endIdx; i++) rng.push(i);
    const result = this.checkMobility(rng, squares, targetSq);
    return result === false ? undefined : result;
  }

  // Comprueba si hay canibalismo en la casilla dada.
  // Devuelve true si comió rival (y lo manda a casa).
  checkIfNiamNiam(sq, chk, normalS) {
    const sqHome       = normalS[this.initPos];
    const enemyCheckers = sq.getCheckers();

    if (enemyCheckers.length === 2) {
      const notSecure = !sq.isSecure() || sqHome.getID() === sq.getID();
      if (notSecure && !sq.isNirvana()) {
        for (const enemyChk of [...enemyCheckers]) {
          if (enemyChk.getColor() !== chk.getColor()) {
            this.toHome(enemyChk, normalS);
            if (sq.getCheckers().length < 2) sq.setLock(false);
            else { sq.setLock(true); this.setMovType('locked'); }
            return true;
          }
        }
        // Dos del mismo color → bloqueo
        sq.setLock(true);
        this.setMovType('locked');
      }
    }
    return false;
  }

  // Calcula si la ficha puede moverse dVal casillas.
  // Devuelve la casilla destino o false.
  checkMovement(chk, dVal, normalS, stairS) {
    if (chk.isInNirvana()) return false;
    const curSq  = chk.getSquare();
    const newPos = curSq.getID() + dVal;

    if (chk.isInStairs()) {
      this.setMovType('instairs');
      const lastStairId = stairS[7].getID();
      if (newPos > lastStairId) { this.setMovType('overpass'); return false; }

      const firstStairId = stairS[0].getID();
      const startIdx = curSq.getID() - firstStairId + 1;
      let   endIdx   = newPos - firstStairId;
      endIdx = (endIdx === 7) ? endIdx : endIdx + 1;
      const rng = [];
      for (let i = startIdx; i < endIdx; i++) rng.push(i);
      const targetIdx = newPos - firstStairId;
      if (targetIdx < 0 || targetIdx > 7) return false;
      return this.checkMobility(rng, stairS, stairS[targetIdx]);

    } else if (this.nearStairs(chk) && newPos > this.lastPos) {
      this.setMovType('enterStairs');
      const stairIdx = newPos - this.lastPos - 1;
      if (stairIdx >= stairS.length || stairIdx < 0) return false;
      const targetSq = stairS[stairIdx];

      // Tramo de casillas normales hasta lastPos
      let newSq = this.checkMobEnterStairs(curSq.getID() + 1, this.lastPos + 1, normalS, targetSq);
      if (newSq === undefined || newSq === false) return false;

      // Tramo dentro de la escalera
      newSq = this.checkMobEnterStairs(0, newPos - this.lastPos, stairS, targetSq);
      return (newSq === undefined) ? false : newSq;

    } else {
      this.setMovType('normal');
      let adjustedPos = newPos;
      const rng = [];
      if (newPos > 68) {
        adjustedPos = newPos - 68;
        for (let i = curSq.getID(); i < 68; i++) rng.push(i);
        for (let i = 1; i <= adjustedPos; i++) rng.push(i);
      } else {
        for (let i = curSq.getID() + 1; i <= newPos; i++) rng.push(i);
      }
      return this.checkMobility(rng, normalS, normalS[adjustedPos]);
    }
  }

  checkIfChkCanMove(chk, dVal, normalS, stairS) {
    return this.checkMovement(chk, dVal, normalS, stairS);
  }

  checkIfPlayerCanMove(dVal, normalS, stairS) {
    return this.checkers.some(chk => {
      const res = this.checkMovement(chk, dVal, normalS, stairS);
      return res !== false && (chk.getPos() !== 0 || dVal === 5) && !chk.isInNirvana();
    });
  }

  // Devuelve la ficha de barrera a mover, o chkToMove si no hay barrera.
  checkIfHasBarrier(chkToMove, dVal, normalS, stairS) {
    for (const chk of this.checkers) {
      if (chk.getSquare().isLocked()) {
        const barrier = chk.getSquare().getCheckers();
        if (barrier.length >= 2 && barrier[0].getColor() === barrier[1].getColor()) {
          if (this.checkIfChkCanMove(chk, dVal, normalS, stairS)) return chk;
        }
      }
    }
    return chkToMove;
  }

  // Mueve la ficha a la casilla destino.
  // Devuelve: 20 (comió), 10 (nirvana), null (normal)
  move(chk, curSq, newSq, normalS) {
    if (this.movType === 'enterStairs') chk.setInStairs();
    curSq.popChecker(chk);
    newSq.addChecker(chk);
    if (this.checkIfNiamNiam(newSq, chk, normalS)) return 20;
    if (newSq.isNirvana()) { chk.setInNirvana(); return 10; }
    return null;
  }

  // ¿Todas las fichas en nirvana?
  hasWon() {
    return this.checkers.every(c => c.isInNirvana());
  }
}
