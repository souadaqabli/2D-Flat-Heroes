export class EnemyChaser {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.size = 20;
        this.speed = 2;
        this.color = "#ff0";
    }

    update(player) {
        let dx = player.x - this.x;
        let dy = player.y - this.y;

        // normaliser le vecteur
        let length = Math.hypot(dx, dy);
        if (length > 0) {
            dx /= length;
            dy /= length;
        }

        this.x += dx * this.speed;
        this.y += dy * this.speed;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(
            this.x - this.size / 2,
            this.y - this.size / 2,
            this.size,
            this.size
        );
    }
}
