import { tableSquares, stairCoords, homeCoords, STAIR_FIRST_ID } from './tableSquares.js';

export class Square {
  // type: 0=normal, 1=segura, 2=escalera, 3=nirvana
  constructor(id, type) {
    this.id       = id;
    this.type     = type;
    this.checkers = [];
    this.locked   = false;
  }

  getID()      { return this.id; }
  isSecure()   { return this.type === 1; }
  isStair()    { return this.type === 2; }
  isNirvana()  { return this.type === 3; }
  isLocked()   { return this.locked; }
  setLock(val) { this.locked = val; }
  getCheckers(){ return this.checkers; }

  addChecker(chk) {
    this.checkers.push(chk);
    chk.square = this;
  }

  popChecker(chk) {
    const idx = this.checkers.indexOf(chk);
    if (idx !== -1) this.checkers.splice(idx, 1);
    if (this.locked) this.locked = false;
  }

  // Devuelve [x, y] píxel (esquina sup-izq, imagen 30x30)
  getCoord(chk = null, chkNum = null) {
    if (this.id === 0) return homeCoords[chk.getColor()][chkNum];

    if (this.id <= 68) return tableSquares[this.id];

    // Escalera: calcular índice relativo al primer ID de la escalera del color
    const color = chk ? chk.getColor() : this._guessColor();
    const firstId = STAIR_FIRST_ID[color];
    return stairCoords[color][this.id - firstId];
  }

  // Obtiene el color a partir de las fichas presentes (sólo escaleras)
  _guessColor() {
    if (this.checkers.length > 0) return this.checkers[0].getColor();
    return 'red';
  }
}
