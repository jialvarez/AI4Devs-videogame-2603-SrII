import { Square } from './square.js';
import { SECURE_SQUARES } from './tableSquares.js';

const NIRVANA_IDS = new Set([76, 84, 92, 100]);

function buildRange(start, end) {
  return Array.from({ length: end - start }, (_, i) => i + start);
}

export class Table {
  constructor(players) {
    this.players = players;

    // Casillas normales: normalS[i].getID() === i  (i = 0..68)
    this.normalS = buildRange(0, 69).map(id => new Square(id, SECURE_SQUARES.has(id) ? 1 : 0));

    // Escaleras: stairS[i] = la i-ésima casilla de esa escalera (i = 0..7)
    this.yStair = buildRange(69, 77).map(id => new Square(id, NIRVANA_IDS.has(id) ? 3 : 2));
    this.bStair = buildRange(77, 85).map(id => new Square(id, NIRVANA_IDS.has(id) ? 3 : 2));
    this.rStair = buildRange(85, 93).map(id => new Square(id, NIRVANA_IDS.has(id) ? 3 : 2));
    this.gStair = buildRange(93, 101).map(id => new Square(id, NIRVANA_IDS.has(id) ? 3 : 2));

    for (const player of players) {
      player.initCheckers(this.normalS[0]);
      const firstChk = player.getCheckers()[0];
      player.toInitPos(firstChk, this.normalS);
    }
  }

  getNormalSquares()        { return this.normalS; }
  getStairSquares(player)   {
    switch (player.getColor()) {
      case 'yellow': return this.yStair;
      case 'blue':   return this.bStair;
      case 'red':    return this.rStair;
      case 'green':  return this.gStair;
    }
  }
}
