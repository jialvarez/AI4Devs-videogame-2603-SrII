import GameScene from './scenes/GameScene.js';

new Phaser.Game({
  type:            Phaser.AUTO,
  width:           640,
  height:          730,   // 640 tablero + 90 HUD
  backgroundColor: '#1a1a1a',
  scene:           [GameScene],
  parent:          'game-container',
});
