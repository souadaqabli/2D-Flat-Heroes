import { Player } from "./Player.js";
import { Input } from "./Input.js";
import { Enemy } from "./Enemy.js";
import { aabbCollision } from "./collision.js";
import { EnemyChaser } from "./EnemyChaser.js";

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.input = new Input();
        this.player = new Player(this);
        this.enemies = [
            new Enemy(this, 100, 100),
            new Enemy(this, 700, 400),
            new EnemyChaser(this, 400, 50)
    ];


    this.lastTime = 0;
    this.gameOver = false;

    requestAnimationFrame(this.loop.bind(this));

    }


    loop(time) {
    const delta = time - this.lastTime;
    this.lastTime = time;

    if (!this.gameOver) {
        this.update(delta);
    }

    this.draw();

    requestAnimationFrame(this.loop.bind(this));
}


    update(dt) {
        this.player.update(this.input);
        //this.enemies.forEach(e => e.update());
        this.enemies.forEach(e => {
        e.update(this.player);   

        // Collision + invincibilité
        if (!this.player.invincible && aabbCollision(this.player, e)) {
    
            this.player.lives--;
            console.log("💥 Collision ! Vies restantes :", this.player.lives);

            // activation de l'invincibilité
            this.player.invincible = true;

            setTimeout(() => {
            this.player.invincible = false;
            }, this.player.invincibilityTime);

        if (this.player.lives <= 0) {
            this.gameOver = true;
        }
}

    });

    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // style simple
        this.ctx.save();
        this.ctx.fillStyle = "rgba(255,255,255,0.05)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();

        this.ctx.fillStyle = "white";
        this.ctx.font = "20px Arial";
        this.ctx.fillText("Lives : " + this.player.lives, 50, 30);

        this.player.draw(this.ctx);
        this.enemies.forEach(e => e.draw(this.ctx));

        if (this.gameOver) {
            this.ctx.fillStyle = "white";
            this.ctx.font = "40px Arial";
            this.ctx.textAlign = "center";
            this.ctx.fillText("GAME OVER", this.canvas.width / 2, this.canvas.height / 2);

        }

    }
}
