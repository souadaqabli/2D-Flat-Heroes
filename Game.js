import { Player } from "./Player.js";
import { Input } from "./Input.js";
import { Enemy } from "./Enemy.js";
import { aabbCollision } from "./collision.js";
import { EnemyChaser } from "./EnemyChaser.js";
import { Particle } from "./particle.js";

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.input = new Input();
        this.player = new Player(this);

        this.level = 1;
        this.score = 0;


        this.enemies = [
            new Enemy(this, 100, 100),
            new Enemy(this, 700, 400),
            new EnemyChaser(this, 400, 50)
        ];

        this.particles = [];
        this.score = 0;


        this.lastTime = 0;
        this.gameOver = false;

        // Bouton restart
        this.restartButton = {
            x: this.canvas.width / 2 - 100,
            y: this.canvas.height / 2 + 70,
            width: 200,
            height: 50
        };

        // Clic souris sur bouton restart
        this.canvas.addEventListener("click", (e) => {
            if (!this.gameOver) return;

            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            const btn = this.restartButton;

            if (
                mouseX >= btn.x &&
                mouseX <= btn.x + btn.width &&
                mouseY >= btn.y &&
                mouseY <= btn.y + btn.height
            ) {
                this.reset();
            }
        });

        requestAnimationFrame(this.loop.bind(this));
    }

    loop(time) {
        const delta = time - this.lastTime;
        this.lastTime = time;

        this.update(delta);
        this.draw();

        requestAnimationFrame(this.loop.bind(this));
    }

    update(dt) {

        // Restart avec R
        if (this.gameOver && (this.input.isDown("r") || this.input.isDown("R"))) {
            this.reset();
            return;
        }

        if (this.gameOver) return;

        this.player.update(this.input);

        this.particles.forEach(p => p.update());
        this.particles = this.particles.filter(p => p.life > 0);

        this.enemies.forEach(e => {
            e.update(this.player);

            if (!this.player.invincible && aabbCollision(this.player, e)) {

                this.player.lives--;

                this.player.invincible = true;

                let dx = this.player.x - e.x;
                let dy = this.player.y - e.y;
                let dist = Math.hypot(dx, dy) || 1;

                dx /= dist;
                dy /= dist;

                const force = 15;

                this.player.knockbackX = dx * force;
                this.player.knockbackY = dy * force;

                e.knockbackX = -dx * force;
                e.knockbackY = -dy * force;

                for (let i = 0; i < 20; i++) {
                    this.particles.push(new Particle(this.player.x, this.player.y));
                }

                setTimeout(() => {
                    this.player.invincible = false;
                }, this.player.invincibilityTime);

                if (this.player.lives <= 0) {
                    this.gameOver = true;
                }
            }
        });

    this.player.spells.forEach(spell => {
    spell.update();

    this.enemies.forEach(enemy => {
        if (!enemy.dead && aabbCollision(spell, enemy)) {
            enemy.takeHit();
            spell.dead = true;
        }
    });
});


    this.enemies = this.enemies.filter(e => !e.dead);
    this.player.spells = this.player.spells.filter(s => !s.dead);

    if (this.enemies.length === 0) {
    this.level++;
    this.spawnEnemies();
    }

    }

    draw() {
        const ctx = this.ctx;

        // ===== BACKGROUND =====
        const gradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, "#0f2027");
        gradient.addColorStop(0.5, "#203a43");
        gradient.addColorStop(1, "#2c5364");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // HUD vies
        ctx.font = "22px Arial";
        ctx.textAlign = "left";
        ctx.fillStyle = "white";
        //ctx.fillText("Lives :", 20, 30);

        // Affichage des coeurs
        for (let i = 0; i < this.player.lives; i++) {
            ctx.fillStyle = "red";
            ctx.fillText("❤️", 90 + i * 30, 30);
        }

        ctx.fillStyle = "yellow";
        ctx.font = "20px Arial";
        ctx.textAlign = "left";
        ctx.fillText("Score : " + this.score, 20, 70);

        ctx.fillStyle = "yellow";
        ctx.font = "20px Arial";
        ctx.fillText("Level : " + this.level, 20, 100);




        // ENTITÉS
        this.player.draw(ctx);
        this.enemies.forEach(e => e.draw(ctx));
        this.particles.forEach(p => p.draw(ctx));

        // ===== GAME OVER =====
        if (this.gameOver) {
            ctx.save();

            ctx.fillStyle = "rgba(0,0,0,0.7)";
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            const pulse = Math.sin(Date.now() / 200) * 10;

            ctx.shadowColor = "red";
            ctx.shadowBlur = 20;
            ctx.font = "bold 60px Arial";
            ctx.fillStyle = "#ff4444";
            ctx.textAlign = "center";

            ctx.fillText("GAME OVER", this.canvas.width / 2, this.canvas.height / 2 - pulse);

            ctx.shadowBlur = 0;

            // Bouton RESTART
            const btn = this.restartButton;

            ctx.fillStyle = "#111";
            ctx.strokeStyle = "#ff4444";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.roundRect(btn.x, btn.y, btn.width, btn.height, 15);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = "#ff4444";
            ctx.font = "bold 22px Arial";
            ctx.fillText("RESTART", btn.x + btn.width / 2, btn.y + 32);

            ctx.restore();
        }
    }

    spawnEnemies() {
    this.enemies = [];

    const baseEnemies = 2 + this.level; // augmente avec le level

    for (let i = 0; i < baseEnemies; i++) {
        const x = Math.random() * (this.canvas.width - 50) + 25;
        const y = Math.random() * (this.canvas.height - 50) + 25;
        this.enemies.push(new Enemy(this, x, y));
    }

    // tous les 2 levels -> ajouter un chasseur
    if (this.level % 2 === 0) {
        this.enemies.push(new EnemyChaser(this, 400, 60));
    }
}


    reset() {
        this.gameOver = false;

        this.score = 0;

        this.player.lives = 3;
        this.player.invincible = false;
        this.player.x = this.canvas.width / 2;
        this.player.y = this.canvas.height / 2;

        this.level = 1;
        this.spawnEnemies();


        this.particles = [];
    }
}
