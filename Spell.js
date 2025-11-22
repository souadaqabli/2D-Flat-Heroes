export class Spell {
    constructor(x, y, dirX, dirY) {
        this.x = x;
        this.y = y;
        this.size = 6;
        this.speed = 8;
        this.dirX = dirX;
        this.dirY = dirY;
        this.dead = false;
    }

    update() {
        this.x += this.dirX * this.speed;
        this.y += this.dirY * this.speed;
    }

    draw(ctx) {
        ctx.fillStyle = "#00ffff";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}
