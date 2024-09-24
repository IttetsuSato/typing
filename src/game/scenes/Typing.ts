import { romajiTable } from "@/const/romaji";
import { Scene } from "phaser";

// type Sound = "NoAudioSound | HTML5AudioSound | WebAudioSound";
type Sound =
    | Phaser.Sound.NoAudioSound
    | Phaser.Sound.HTML5AudioSound
    | Phaser.Sound.WebAudioSound;

const isAlphaNumeric = /^[0-9a-zA-Z ]+$/;
let words = ["fart attack"];

export class Typing extends Scene {
    word: string;
    score: number;
    wordText: Phaser.GameObjects.Text;
    typingText: Phaser.GameObjects.Text;
    scoreText: Phaser.GameObjects.Text;
    type1Sound: Sound;
    type2Sound: Sound;
    scoreUpSound: Sound;
    wrongSound: Sound;
    celebrateSound: Sound;
    music: Sound;

    constructor() {
        super("Typing");
        this.word = "";
        this.score = 0;
    }

    preload() {
        this.load.image("background", "assets/Board.png");

        this.load.audio("type1", "assets/audio/type1.wav");
        this.load.audio("type2", "assets/audio/type2.wav");
        this.load.audio("score_up", "assets/audio/score_up.wav");
        this.load.audio("wrong", "assets/audio/wrong.wav");
        this.load.audio("celebrate", "assets/audio/celebrate.wav");
        this.load.audio("bounce", "assets/audio/bounce.wav");
        this.load.audio("music", "assets/audio/music.mp3");
    }

    create() {
        this.newWord();
        this.add.image(480, 270, "background");

        this.wordText = this.add.text(100, 200, this.word, {
            font: "64px Arial",
            color: "#ccc",
        });

        this.typingText = this.add.text(100, 200, "", {
            font: "64px Arial",
            color: "#000",
        });

        this.scoreText = this.add.text(630, 70, `Score: ${this.score}`, {
            font: "24px Arial",
            color: "#222",
        });

        this.type1Sound = this.sound.add("type1");
        this.type2Sound = this.sound.add("type2");
        this.scoreUpSound = this.sound.add("score_up");
        this.wrongSound = this.sound.add("wrong");
        this.celebrateSound = this.sound.add("celebrate");
        this.music = this.sound.add("music");

        this.music.setLoop(true);
        this.music.play();

        if (this.input.keyboard)
            this.input.keyboard.on("keydown", this.keyDown, this);
    }

    update(time: number, delta: number) {
        this.typingText.x = this.wordText.x;
        this.typingText.y = this.wordText.y;
    }

    keyDown(event: KeyboardEvent) {
        if (!event.key.match(isAlphaNumeric)) {
            return;
        }

        this.type1Sound.play();

        if (event.key !== this.word[this.typingText.text.length]) {
            this.wrongSound.play();

            this.scoreText.text = "Score: " + this.score;

            this.typingText.text = "";
            this.wordText.text = this.word;

            return;
        }

        this.typingText.text += event.key;

        if (this.typingText.text === this.word) {
            this.score++;
            this.scoreUpSound.play();

            this.scoreText.text = "Score: " + this.score;

            this.newWord();

            this.typingText.text = "";
            this.wordText.text = this.word;
        }
    }

    newWord() {
        this.word = words[Math.floor(Math.random() * words.length)];
    }
}

