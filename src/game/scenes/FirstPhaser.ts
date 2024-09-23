import { Scene } from "phaser";

export class FirstPhaser extends Scene {
    constructor() {
        super("FirstPhaser");
    }

    preload() {
        this.load.image("sky", "assets/sky.png");
        this.load.image("ground", "assets/platform.png");
        this.load.image("star", "assets/star.png");
        this.load.image("bomb", "assets/bomb.png");
        this.load.spritesheet("dude", "assets/dude.png", {
            frameWidth: 32,
            frameHeight: 48,
        });
    }

    create() {
        this.add.image(0, 0, "sky").setOrigin(0,0);
        this.add.image(400, 300, "star");
    }
}
