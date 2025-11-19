export class Enemy {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.size = 20;
        this.speedX = 2;
        this.speedY = 1.5;
        this.color = "#f44";
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // rebond sur les bords (très simple)
        if (this.x < 0 || this.x > this.game.canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > this.game.canvas.height) this.speedY *= -1;

    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
    }
}
