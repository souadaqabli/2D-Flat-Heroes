export class Enemy {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.size = 22;
        this.speedX = Math.random() * 2 + 1;
        this.speedY = Math.random() * 2 + 1;

        this.color = "#8b0000";
        this.life = 2; // 2 vies = 2 tirs nécessaires !
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

        // 🔧 REBOND sur les bords (corrigé)
        if (this.x < this.size / 2 || this.x > this.game.canvas.width - this.size / 2) {
            this.speedX *= -1;
            this.x = Math.max(this.size / 2, Math.min(this.x, this.game.canvas.width - this.size / 2));
        }
        
        if (this.y < this.size / 2 || this.y > this.game.canvas.height - this.size / 2) {
            this.speedY *= -1;
            this.y = Math.max(this.size / 2, Math.min(this.y, this.game.canvas.height - this.size / 2));
        }
    }

    takeHit() {
        this.life--;

        // Petit recul quand touché
        this.knockbackX += (Math.random() - 0.5) * 10;
        this.knockbackY += (Math.random() - 0.5) * 10;

        if (this.life <= 0) {
            this.dead = true;
            this.game.score += 100; // 100 points quand tué (après 2 hits)
        } else {
            // Premier hit : +30 points
            this.game.score += 30;
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
        
        // === BARRE DE VIE (affiche les 2 vies) ===
        if (this.life < 2) { // Afficher seulement si blessé
            ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
            ctx.fillRect(this.x - 15, this.y - 20, 30, 4);

            ctx.fillStyle = this.life === 1 ? "#ffa500" : "#ff0000"; // Orange si 1 vie
            ctx.fillRect(this.x - 15, this.y - 20, (this.life / 2) * 30, 4);
            
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 1;
            ctx.strokeRect(this.x - 15, this.y - 20, 30, 4);
        }
    }
}