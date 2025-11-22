export class Enemy {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.size = 22;
        this.speedX = Math.random() * 2 + 1;
        this.speedY = Math.random() * 2 + 1;

        this.color = "#8b0000";
        this.life = 3; // nombre de coups nécessaires
        this.dead = false;

        this.knockbackX = 0;
        this.knockbackY = 0;
        this.knockbackFriction = 0.85;
    }

    update() {
        if (this.dead) return;

        this.x += this.knockbackX;
        this.y += this.knockbackY;

        this.knockbackX *= this.knockbackFriction;
        this.knockbackY *= this.knockbackFriction;

        this.x += this.speedX;
        this.y += this.speedY;

        //if (this.x < 0 || this.x > this.game.canvas.width) this.speedX *= -1;
        //if (this.y < 0 || this.y > this.game.canvas.height) this.speedY *= -1;

        this.x = Math.max(this.size / 2, Math.min(this.x, this.game.canvas.width - this.size / 2));
        this.y = Math.max(this.size / 2, Math.min(this.y, this.game.canvas.height - this.size / 2));

    }

    takeHit() {
        this.life--;

        // petit recul quand touché
        this.knockbackX += (Math.random() - 0.5) * 10;
        this.knockbackY += (Math.random() - 0.5) * 10;

        if (this.life <= 0) {
            this.dead = true;
            this.game.score += 100; // points gagnés
        }
    }

    

    draw(ctx) {
        if (this.dead) return;

        ctx.save();
        ctx.translate(this.x, this.y);

        // Aura sombre
        ctx.beginPath();
        ctx.arc(0, 0, this.size + 8, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(150,0,0,0.3)";
        ctx.fill();

        // Corps principal
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = "#330000";
        ctx.fill();

        // Yeux démoniaques
        ctx.fillStyle = "red";
        ctx.fillRect(-6, -3, 3, 3);
        ctx.fillRect(3, -3, 3, 3);

        ctx.restore();
    }
}
