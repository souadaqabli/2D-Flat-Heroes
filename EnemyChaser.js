export class EnemyChaser {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.size = 35; // Plus grand que les ennemis normaux (22)
        this.speed = 2;
        this.color = "#1a0033"; // Violet très foncé
        
        this.life = 3;
        this.dead = false;

        this.knockbackX = 0;
        this.knockbackY = 0;
        this.knockbackFriction = 0.9;
        
        // Animation de l'aura
        this.auraPulse = 0;
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

        // Blocage dans le cadre
        this.x = Math.max(this.size / 2, Math.min(this.x, this.game.canvas.width - this.size / 2));
        this.y = Math.max(this.size / 2, Math.min(this.y, this.game.canvas.height - this.size / 2));

        // Animation de l'aura
        this.auraPulse += 0.08;
    }

    takeHit() {
        this.life--;

        // Recul magique
        this.knockbackX += (Math.random() - 0.5) * 12;
        this.knockbackY += (Math.random() - 0.5) * 12;

        if (this.life <= 0) {
            this.dead = true;
            this.game.score += 25;
        }
    }

    draw(ctx) {
        if (this.dead) return;

        ctx.save();
        ctx.translate(this.x, this.y);

        // === AURA SOMBRE PULSANTE ===
        const auraPulse = Math.sin(this.auraPulse) * 5 + 15;
        
        // Aura externe (plus grande)
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 2 + auraPulse, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(80, 0, 120, 0.15)"; // Violet sombre transparent
        ctx.fill();

        // Aura intermédiaire
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 2 + auraPulse / 2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(100, 0, 150, 0.25)"; 
        ctx.fill();

        // === CORPS PRINCIPAL ===
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = this.color; // Violet très foncé
        ctx.fill();

        // Bordure brillante violette
        ctx.strokeStyle = "#6a0dad"; // Violet brillant
        ctx.lineWidth = 2;
        ctx.stroke();

        // === YEUX DÉMONIAQUES VIOLETS ===
        // Yeux plus grands et menaçants
        ctx.fillStyle = "#ff00ff"; // Magenta brillant
        ctx.fillRect(-8, -4, 4, 5);
        ctx.fillRect(4, -4, 4, 5);

        // Lueur des yeux
        ctx.shadowColor = "#ff00ff";
        ctx.shadowBlur = 10;
        ctx.fillRect(-8, -4, 4, 5);
        ctx.fillRect(4, -4, 4, 5);
        ctx.shadowBlur = 0;

        // === DÉTAILS DÉMONIAQUES ===
        // Cornes ou pointes
        ctx.fillStyle = "#4a0080";
        ctx.beginPath();
        ctx.moveTo(-this.size / 3, -this.size / 2.5);
        ctx.lineTo(-this.size / 4, -this.size / 1.5);
        ctx.lineTo(-this.size / 5, -this.size / 2.5);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(this.size / 3, -this.size / 2.5);
        ctx.lineTo(this.size / 4, -this.size / 1.5);
        ctx.lineTo(this.size / 5, -this.size / 2.5);
        ctx.fill();

        ctx.restore();

        // === BARRE DE VIE (violet au lieu de vert) ===
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fillRect(this.x - 15, this.y - 30, 30, 5);

        // Couleur de vie selon HP
        let lifeColor = "#a020f0"; // Violet
        if (this.life === 2) lifeColor = "#8000ff"; // Violet moyen
        if (this.life === 1) lifeColor = "#ff00ff"; // Magenta (danger)

        ctx.fillStyle = lifeColor;
        ctx.fillRect(this.x - 15, this.y - 30, (this.life / 3) * 30, 5);
        
        // Bordure de la barre de vie
        ctx.strokeStyle = "#6a0dad";
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x - 15, this.y - 30, 30, 5);
    }
}