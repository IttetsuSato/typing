import { Typing } from ".";

export const preloadMethod = (scene: Phaser.Scene) => {
  scene.load.image("background", "assets/Board.png");
  scene.load.audio("type1", "assets/audio/type1.wav");
  scene.load.audio("type2", "assets/audio/type2.wav");
  scene.load.audio("wrong", "assets/audio/wrong.wav");
  scene.load.audio("celebrate", "assets/audio/celebrate.wav");
  scene.load.audio("bounce", "assets/audio/bounce.wav");
  scene.load.audio("music", "assets/audio/music.mp3");
};
