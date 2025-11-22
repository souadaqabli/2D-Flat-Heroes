import { Spell } from "./Spell.js";

export class Player {
    constructor(game) {
        this.game = game;

        this.x = 400;
        this.y = 300;
        this.size = 20;
        this.speed = 4;
        this.color = "#4df";
        this.lives = 10;
        this.invincible = false;
        this.invincibilityTime = 800;
        this.knockbackX = 0;
        this.knockbackY = 0;
        this.knockbackFriction = 0.9;

        // Sorts
        this.spells = [];
        this.shootCooldown = 300;
        this.lastShot = 0;

        // Dash
        this.isDashing = false;
        this.dashSpeed = 20;
        this.dashTime = 150;
        this.dashCooldown = 800;
        this.lastDash = 0;
        this.dashDirection = { x: 0, y: 0 };
    }

    update(input) {
        this.x += this.knockbackX;
        this.y += this.knockbackY;
        this.knockbackX *= this.knockbackFriction;
        this.knockbackY *= this.knockbackFriction;

        // DASH
        if (input.isDown("Space") && !this.isDashing) {
            const now = performance.now();
            if (now - this.lastDash > this.dashCooldown) {
                this.startDash(input);
            }
        }

        if (this.isDashing) {
            this.x += this.dashDirection.x * this.dashSpeed;
            this.y += this.dashDirection.y * this.dashSpeed;
        } else {
            if (input.isDown("ArrowLeft") || input.isDown("a")) this.x -= this.speed;
            if (input.isDown("ArrowRight") || input.isDown("d")) this.x += this.speed;
            if (input.isDown("ArrowUp") || input.isDown("w")) this.y -= this.speed;
            if (input.isDown("ArrowDown") || input.isDown("s")) this.y += this.speed;
        }

        // TIR
        if (input.isDown("f")) {
            const now = performance.now();
            if (now - this.lastShot > this.shootCooldown) {
                this.shoot();
                this.lastShot = now;
            }
        }

        // Mise à jour des sorts
        this.spells.forEach(spell => spell.update());
        this.spells = this.spells.filter(spell => spell.x > 0 && spell.x < 800 && spell.y > 0 && spell.y < 600);

        // empêcher de sortir du cadre
        this.x = Math.max(this.size / 2, Math.min(this.x, this.game.canvas.width - this.size / 2));
        this.y = Math.max(this.size / 2, Math.min(this.y, this.game.canvas.height - this.size / 2));

    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        if (this.invincible) {
            ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 50) * 0.5;
        }

        // Aura
        ctx.beginPath();
        ctx.arc(0, 0, this.size + 8, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(120,0,0,0.25)";
        ctx.fill();

        // Cape
        ctx.beginPath();
        ctx.moveTo(0, -20);
        ctx.lineTo(-18, 20);
        ctx.lineTo(18, 20);
        ctx.closePath();
        ctx.fillStyle = "#2b0f0f";
        ctx.fill();

        // Corps
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fillStyle = "#444";
        ctx.fill();

        // Casque
        ctx.beginPath();
        ctx.moveTo(-12, -5);
        ctx.lineTo(0, -22);
        ctx.lineTo(12, -5);
        ctx.closePath();
        ctx.fillStyle = "#111";
        ctx.fill();

        // Yeux
        ctx.fillStyle = "red";
        ctx.fillRect(-4, -2, 3, 2);
        ctx.fillRect(1, -2, 3, 2);

        ctx.restore();

        // Dessin des sorts
        this.spells.forEach(spell => spell.draw(ctx));
    }

    startDash(input) {
        this.dashDirection = { x: 0, y: 0 };

        if (input.isDown("ArrowUp") || input.isDown("w")) this.dashDirection.y = -1;
        if (input.isDown("ArrowDown") || input.isDown("s")) this.dashDirection.y = 1;
        if (input.isDown("ArrowLeft") || input.isDown("a")) this.dashDirection.x = -1;
        if (input.isDown("ArrowRight") || input.isDown("d")) this.dashDirection.x = 1;

        if (this.dashDirection.x === 0 && this.dashDirection.y === 0)
            this.dashDirection.x = 1;

        this.isDashing = true;
        this.lastDash = performance.now();

        setTimeout(() => {
            this.isDashing = false;
        }, this.dashTime);
    }

    shoot() {
    let dirX = 0;
    let dirY = 0;

    if (this.game.input.isDown("ArrowUp") || this.game.input.isDown("w")) dirY = -1;
    if (this.game.input.isDown("ArrowDown") || this.game.input.isDown("s")) dirY = 1;
    if (this.game.input.isDown("ArrowLeft") || this.game.input.isDown("a")) dirX = -1;
    if (this.game.input.isDown("ArrowRight") || this.game.input.isDown("d")) dirX = 1;

    // Si aucune direction → tir par défaut vers la droite
    if (dirX === 0 && dirY === 0) dirX = 1;

    const length = Math.hypot(dirX, dirY);
    dirX /= length;
    dirY /= length;

    this.spells.push(new Spell(this.x, this.y, dirX, dirY));
}

}
