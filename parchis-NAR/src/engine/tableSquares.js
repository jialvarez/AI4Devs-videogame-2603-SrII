// Coordenadas píxel [x, y] de la esquina sup-izq de cada casilla en el tablero 640x640.
// En Phaser (origen centrado) añadir 15 px para centrar sobre una imagen 30x30.

export const tableSquares = {
   1: [597, 238],  2: [567, 238],  3: [537, 238],  4: [507, 238],
   5: [480, 238],                                                    // segura
   6: [450, 238],  7: [420, 238],  8: [390, 238],
   9: [372, 220], 10: [372, 190], 11: [372, 160],
  12: [372, 130],                                                    // segura
  13: [372, 100], 14: [372,  70], 15: [372,  40], 16: [372,  15],
  17: [305,  15],                                                    // segura
  18: [237,  15], 19: [237,  42], 20: [237,  72], 21: [237, 102],
  22: [237, 132],                                                    // segura
  23: [237, 162], 24: [237, 192], 25: [237, 222],
  26: [223, 238], 27: [193, 238], 28: [163, 238],
  29: [133, 238],                                                    // segura
  30: [103, 238], 31: [ 73, 238], 32: [ 43, 238], 33: [ 15, 238],
  34: [ 15, 304],                                                    // segura
  35: [ 15, 370], 36: [ 40, 370], 37: [ 70, 370], 38: [100, 370],
  39: [130, 370],                                                    // segura
  40: [160, 370], 41: [190, 370], 42: [220, 370],
  43: [237, 388], 44: [237, 418], 45: [237, 448],
  46: [237, 478],                                                    // segura
  47: [237, 508], 48: [237, 538], 49: [237, 568], 50: [235, 595],
  51: [305, 595],                                                    // segura
  52: [372, 595], 53: [372, 568], 54: [372, 538], 55: [372, 508],
  56: [372, 478],                                                    // segura
  57: [372, 448], 58: [372, 418], 59: [372, 388],
  60: [390, 370], 61: [420, 370], 62: [450, 370],
  63: [480, 370],                                                    // segura
  64: [510, 370], 65: [540, 370], 66: [570, 370], 67: [596, 370],
  68: [596, 305],                                                    // segura
};

export const yellowStairs = [
  [570, 304], [540, 304], [510, 304], [480, 304],
  [450, 304], [420, 304], [390, 304], [360, 304],   // [7] = Nirvana
];

export const blueStairs = [
  [304,  40], [304,  70], [304, 100], [304, 130],
  [304, 160], [304, 190], [304, 220], [304, 266],   // [7] = Nirvana
];

export const redStairs = [
  [ 40, 304], [ 70, 304], [100, 304], [130, 304],
  [160, 304], [190, 304], [220, 304], [250, 304],   // [7] = Nirvana
];

export const greenStairs = [
  [304, 568], [304, 538], [304, 508], [304, 478],
  [304, 448], [304, 418], [304, 388], [304, 358],   // [7] = Nirvana
];

// stairCoords[color] → array de 8 coordenadas [x,y]
export const stairCoords = {
  yellow: yellowStairs,
  blue:   blueStairs,
  red:    redStairs,
  green:  greenStairs,
};

// Posición inicial de cada ficha (0-3) en su casa (casilla 0)
export const homeCoords = {
  red:    [[ 20, 435], [180, 435], [180, 580], [ 20, 580]],
  green:  [[425, 435], [590, 435], [425, 580], [590, 580]],
  yellow: [[425, 175], [590, 175], [425,  20], [590,  20]],
  blue:   [[ 20, 175], [180, 175], [180,  20], [ 20,  20]],
};

// Casillas seguras (ID de las casillas normales 1-68)
export const SECURE_SQUARES = new Set([5, 12, 17, 22, 29, 34, 39, 46, 51, 56, 63, 68]);

// Última casilla de cada color antes de entrar en su pasillo (lastPos)
export const LAST_POS  = { yellow: 68, blue: 17, red: 34, green: 51 };

// Casilla inicial de cada color en el circuito común (initPos)
export const INIT_POS  = { yellow: 5,  blue: 22, red: 39, green: 56 };

// Rango de IDs de escalera por color (69-76, 77-84, 85-92, 93-100)
export const STAIR_FIRST_ID = { yellow: 69, blue: 77, red: 85, green: 93 };
