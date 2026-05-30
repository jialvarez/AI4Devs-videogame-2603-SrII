export class Checker {
  constructor(player, square, id) {
    this.player    = player;
    this.square    = square;
    this.id        = id;
    this.inStairs  = false;
    this.inNirvana = false;
  }

  getID()       { return this.id; }
  getPos()      { return this.square.getID(); }
  getSquare()   { return this.square; }
  getPlayer()   { return this.player; }
  getColor()    { return this.player.getColor(); }
  isInStairs()  { return this.inStairs; }
  setInStairs() { this.inStairs = true; }
  isInNirvana() { return this.inNirvana; }
  setInNirvana(){ this.inNirvana = true; }
}
