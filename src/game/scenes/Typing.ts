import { Scene } from "phaser";
import { keygraph } from "../../utils/DAG/keygraph";

// type Sound = "NoAudioSound | HTML5AudioSound | WebAudioSound";
type Sound =
  | Phaser.Sound.NoAudioSound
  | Phaser.Sound.HTML5AudioSound
  | Phaser.Sound.WebAudioSound;

const isAlphaNumeric = /^[0-9a-zA-Z ]+$/;
let words = ["とってもしんでる!"];

export class Typing extends Scene {
  word: string;
  key_done: Phaser.GameObjects.Text;
  key_candidate: Phaser.GameObjects.Text;
  seq_done: Phaser.GameObjects.Text;
  seq_candidate: Phaser.GameObjects.Text;
  type1Sound: Sound;
  type2Sound: Sound;
  wrongSound: Sound;
  celebrateSound: Sound;
  music: Sound;

  constructor() {
    super("Typing");
    this.word = "";
  }

  preload() {
    this.load.image("background", "assets/Board.png");
    this.load.audio("type1", "assets/audio/type1.wav");
    this.load.audio("type2", "assets/audio/type2.wav");
    this.load.audio("wrong", "assets/audio/wrong.wav");
    this.load.audio("celebrate", "assets/audio/celebrate.wav");
    this.load.audio("bounce", "assets/audio/bounce.wav");
    this.load.audio("music", "assets/audio/music.mp3");
  }

  create() {
    keygraph.reset();
    this.reset();

    this.add.image(480, 270, "background");

    this.key_done = this.add.text(100, 120, keygraph.key_done(), {
      font: "16px Arial",
      color: "#ccc",
    });

    this.key_candidate = this.add.text(100, 140, keygraph.key_candidate(), {
      font: "16px Arial",
      color: "#ccc",
    });

    this.seq_done = this.add.text(100, 160, keygraph.seq_done(), {
      font: "16px Arial",
      color: "#ccc",
    });

    this.seq_candidate = this.add.text(100, 180, keygraph.seq_candidates(), {
      font: "16px Arial",
      color: "#ccc",
    });

    this.type1Sound = this.sound.add("type1");
    this.type2Sound = this.sound.add("type2");
    this.wrongSound = this.sound.add("wrong");
    this.celebrateSound = this.sound.add("celebrate");

    if (this.input.keyboard)
      this.input.keyboard.on("keydown", this.keyDown, this);
  }

  update(time: number, delta: number) {}

  keyDown(e: KeyboardEvent) {
    if (!e.key.match(isAlphaNumeric)) {
      return;
    }

    if (keygraph.next(e.key)) {
      // 正解の場合
      this.type1Sound.play();
      this.displayWord();
      if (keygraph.is_finished()) {
        // 全てのキーが入力された場合
        this.celebrateSound.play();
        this.reset();
      }
    } else {
      this.wrongSound.play();
    }
  }

  reset() {
    keygraph.build(words[0]);
  }

  displayWord() {
    this.key_done.setText(keygraph.key_done());
    this.key_candidate.setText(keygraph.key_candidate());
    this.seq_done.setText(keygraph.seq_done());
    this.seq_candidate.setText(keygraph.seq_candidates());
  }
}
