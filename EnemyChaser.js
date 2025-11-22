export class EnemyChaser {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.size = 20;
        this.speed = 2;
        this.color = "#ff2222"; // rouge agressif

        this.life = 3;      // ✅ VIE
        this.dead = false;  // ✅ ÉTAT DE MORT

        this.knockbackX = 0;
        this.knockbackY = 0;
        this.knockbackFriction = 0.9;
    }

    update(player) {
        this.x += this.knockbackX;
        this.y += this.knockbackY;

        this.knockbackX *= this.knockbackFriction;
        this.knockbackY *= this.knockbackFriction;

        let dx = player.x - this.x;
        let dy = player.y - this.y;

        let length = Math.hypot(dx, dy) || 1;
        dx /= length;
        dy /= length;

        this.x += dx * this.speed;
        this.y += dy * this.speed;

        // blocage dans le cadre
        this.x = Math.max(this.size / 2, Math.min(this.x, this.game.canvas.width - this.size / 2));
        this.y = Math.max(this.size / 2, Math.min(this.y, this.game.canvas.height - this.size / 2));

    }

    // ✅ MÉTHODE APPELÉE PAR LES TIRS
    takeHit() {
        this.life--;

        // petit recul magique
        this.knockbackX += (Math.random() - 0.5) * 12;
        this.knockbackY += (Math.random() - 0.5) * 12;

        if (this.life <= 0) {
            this.dead = true;
            this.game.score += 25; // bonus points
        }
    }

    draw(ctx) {
        // corps
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
        ctx.fill();

        // ✅ barre de vie
        ctx.fillStyle = "black";
        ctx.fillRect(this.x - 15, this.y - 20, 30, 4);

        ctx.fillStyle = "lime";
        ctx.fillRect(this.x - 15, this.y - 20, (this.life / 3) * 30, 4);
    }
}
