export class Player {
    constructor(game) {
        this.game = game;

        this.x = 400;
        this.y = 300;
        this.size = 20;
        this.speed = 4;
        this.color = "#4df";
        this.lives = 3;
        this.invincible = false; 
        this.invincibilityTime = 800; // 0.8 sec



        this.isDashing = false;
        this.dashSpeed = 20;       // vitesse du dash
        this.dashTime = 150;       // durée en ms
        this.dashCooldown = 800;   // durée entre deux dashs
        this.lastDash = 0;         // dernier moment où on a dash
        this.dashDirection = { x: 0, y: 0 };

    }

    update(input) {

        if (input.isDown("Space") && !this.isDashing) {
            const now = performance.now();
            if (now - this.lastDash > this.dashCooldown) {
            this.startDash(input);
            }
        }
        
        if (this.isDashing) {
            this.x += this.dashDirection.x * this.dashSpeed;
            this.y += this.dashDirection.y * this.dashSpeed;
            return; // ne pas exécuter le mouvement normal
        }

        if (input.isDown("ArrowLeft") || input.isDown("a")) this.x -= this.speed;
        if (input.isDown("ArrowRight") || input.isDown("d")) this.x += this.speed;
        if (input.isDown("ArrowUp") || input.isDown("w")) this.y -= this.speed;
        if (input.isDown("ArrowDown") || input.isDown("s")) this.y += this.speed;

        


    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
    }

    startDash(input) {
    // direction du dash en fonction des touches
    this.dashDirection = { x: 0, y: 0 };

    if (input.isDown("ArrowUp") || input.isDown("w"))
        this.dashDirection.y = -1;
    if (input.isDown("ArrowDown") || input.isDown("s"))
        this.dashDirection.y = 1;
    if (input.isDown("ArrowLeft") || input.isDown("a"))
        this.dashDirection.x = -1;
    if (input.isDown("ArrowRight") || input.isDown("d"))
        this.dashDirection.x = 1;

    // éviter un dash à direction nulle
    if (this.dashDirection.x === 0 && this.dashDirection.y === 0)
        this.dashDirection.x = 1; // dash par défaut vers la droite

    this.isDashing = true;
    this.lastDash = performance.now();

    // arrêter le dash après dashTime
    setTimeout(() => {
        this.isDashing = false;
    }, this.dashTime);

    }

}
