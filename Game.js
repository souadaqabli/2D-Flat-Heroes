import { Player } from "./Player.js";
import { Input } from "./Input.js";
import { Enemy } from "./Enemy.js";
import { aabbCollision } from "./Collision.js";
import { EnemyChaser } from "./EnemyChaser.js";
import { Particle } from "./Particle.js";
import { SoundManager } from "./SoundManager.js";

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.input = new Input();
        this.player = new Player(this);
        this.soundManager = new SoundManager(); 

        this.score = 0;
        this.level = 1;
        this.levelTransition = false;
        this.transitionTimer = 0;
        this.transitionDuration = 2000;

        this.enemies = [];
        this.particles = [];

        this.lastTime = 0;
        this.gameOver = false;
        this.gameStarted = false;

        // Étoiles scintillantes
        this.stars = [];
        this.createStars();

        // Bouton restart
        this.restartButton = {
            x: this.canvas.width / 2 - 100,
            y: this.canvas.height / 2 + 100,
            width: 200,
            height: 50
        };

        // Bouton start (menu principal)
        this.startButton = {
            x: this.canvas.width / 2 - 100,
            y: this.canvas.height / 2 + 50,
            width: 200,
            height: 60
        };

        // Gestion des clics
        this.canvas.addEventListener("click", (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            // Menu principal
            if (!this.gameStarted) {
                const btn = this.startButton;
                if (
                    mouseX >= btn.x &&
                    mouseX <= btn.x + btn.width &&
                    mouseY >= btn.y &&
                    mouseY <= btn.y + btn.height
                ) {
                    this.startGame();
                }
            }

            // Game Over
            if (this.gameOver) {
                const btn = this.restartButton;
                if (
                    mouseX >= btn.x &&
                    mouseX <= btn.x + btn.width &&
                    mouseY >= btn.y &&
                    mouseY <= btn.y + btn.height
                ) {
                    this.reset();
                }
            }
        });

        requestAnimationFrame(this.loop.bind(this));
    }

    createStars() {
        for (let i = 0; i < 100; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 0.5,
                brightness: Math.random(),
                twinkleSpeed: Math.random() * 0.02 + 0.01
            });
        }
    }

    async startGame() {
        this.gameStarted = true;
        this.spawnEnemies();
        
        // Démarrer l'audio APRÈS le clic utilisateur
        await this.soundManager.start();
        
        this.soundManager.playStartSound();
        setTimeout(() => {
            this.soundManager.playBackgroundMusic();
        }, 500);
    }

    loop(time) {
        const delta = time - this.lastTime;
        this.lastTime = time;

        this.update(delta);
        this.draw();

        requestAnimationFrame(this.loop.bind(this));
    }

    update(dt) {
        // Menu principal
        if (!this.gameStarted) return;

        // Restart avec R
        if (this.gameOver && (this.input.isDown("r") || this.input.isDown("R"))) {
            this.reset();
            return;
        }

        if (this.gameOver) return;

        this.player.update(this.input);

        this.particles.forEach(p => p.update());
        this.particles = this.particles.filter(p => p.life > 0);

        // Update étoiles
        this.stars.forEach(star => {
            star.brightness += star.twinkleSpeed;
            if (star.brightness > 1) star.brightness = 0;
        });

        this.enemies.forEach(e => {
            e.update(this.player);

            if (!this.player.invincible && aabbCollision(this.player, e)) {
                this.player.lives--;
                this.player.invincible = true;

                // Son de collision
                this.soundManager.playHitSound();

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
                    // Le son Game Over arrête la musique automatiquement
                    this.soundManager.playGameOverSound();
                }
            }
        });

        this.player.spells.forEach(spell => {
            spell.update();

            this.enemies.forEach(enemy => {
                // Collision AABB
                if (!enemy.dead && aabbCollision(spell, enemy)) {
                    enemy.takeHit();
                    spell.dead = true;
                    
                    // Son si l'ennemi meurt
                    if (enemy.dead) {
                        this.soundManager.playEnemyDeathSound();
                    }
                }
            });
        });

        this.enemies = this.enemies.filter(e => !e.dead);
        this.player.spells = this.player.spells.filter(s => !s.dead);

        // Passer au niveau suivant quand TOUS les ennemis sont morts
        if (this.enemies.length === 0 && !this.levelTransition) {
            this.levelTransition = true;
            this.transitionTimer = performance.now();
            //  Son level up
            this.soundManager.playLevelUpSound();
        }

        if (this.levelTransition) {
            if (performance.now() - this.transitionTimer > this.transitionDuration) {
                this.level++;
                this.player.lives = this.player.maxLives;
                this.spawnEnemies();
                this.levelTransition = false;
            }
        }
    }

    draw() {
        const ctx = this.ctx;

        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, "#0f2027");
        gradient.addColorStop(0.5, "#203a43");
        gradient.addColorStop(1, "#2c5364");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Étoiles scintillantes
        this.stars.forEach(star => {
            ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });

        // Menu principal
        if (!this.gameStarted) {
            this.drawMainMenu();
            return;
        }

        // HUD amélioré
        this.drawImprovedHUD();

        // Entités
        this.player.draw(ctx);
        this.enemies.forEach(e => e.draw(ctx));
        this.particles.forEach(p => p.draw(ctx));

        // Transition de niveau
        if (this.levelTransition) {
            this.drawLevelTransition();
        }

        // Game Over
        if (this.gameOver) {
            this.drawGameOver();
        }
    }

    drawMainMenu() {
        const ctx = this.ctx;

        ctx.save();

        // Titre du jeu avec effet magique
        const pulse = Math.sin(Date.now() / 300) * 10;
        
        ctx.shadowColor = "#ffd700";
        ctx.shadowBlur = 30;
        ctx.font = "bold 70px Georgia";
        ctx.fillStyle = "#ffd700";
        ctx.textAlign = "center";
        ctx.fillText("WIZARD BATTLE", this.canvas.width / 2, 150 + pulse);

        ctx.shadowBlur = 0;

        // Bouton Start - IDENTIQUE au bouton Game Over
        const btn = this.startButton;
        const hover = Math.sin(Date.now() / 200) * 3;

        // Fond sombre avec coins arrondis
        ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
        ctx.beginPath();
        ctx.roundRect(btn.x, btn.y + hover, btn.width, btn.height, 15);
        ctx.fill();

        // Ombre du bouton
        ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 5;

        ctx.fillStyle = "#1a1a1a";
        ctx.strokeStyle = "#d3a625";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(btn.x, btn.y + hover, btn.width, btn.height, 15);
        ctx.fill();
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        // Texte du bouton avec glow
        ctx.shadowColor = "#ffd700";
        ctx.shadowBlur = 15;
        ctx.fillStyle = "#ffd700";
        ctx.font = "bold 26px Georgia";
        ctx.fillText("START GAME", btn.x + btn.width / 2, btn.y + 35 + hover);

        ctx.shadowBlur = 0;

        // Instructions
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.font = "18px Arial";
        ctx.fillText("WASD - Déplacer | F - Tirer | SPACE - Dash", this.canvas.width / 2, 450);

        ctx.restore();
    }

    drawImprovedHUD() {
        const ctx = this.ctx;

        // === AFFICHAGE DES CŒURS (original) ===
        for (let i = 0; i < this.player.lives; i++) {
            ctx.fillStyle = "red";
            ctx.font = "22px Arial";
            ctx.fillText("❤️", 20 + i * 30, 30);
        }

        // === SCORE AVEC EFFET BRILLANT ===
        const scoreY = 70;
        const scoreGlow = Math.sin(Date.now() / 200) * 0.3 + 0.7;

        ctx.save();
        ctx.shadowColor = "#ffd700";
        ctx.shadowBlur = 15 * scoreGlow;
        ctx.fillStyle = "#ffd700";
        ctx.font = "bold 24px Arial";
        ctx.textAlign = "left";
        ctx.fillText("Score " + this.score, 20, scoreY);
        ctx.restore();

        // === NIVEAU ===
        ctx.shadowColor = "#ffd700";
        ctx.fillStyle = "#ffd700";
        ctx.font = "bold 22px Arial";
        ctx.textAlign = "left";
        ctx.fillText("Level " + this.level, 20, 110);
    }

    drawLevelTransition() {
        const ctx = this.ctx;

        ctx.save();
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const pulse = Math.sin(Date.now() / 150) * 20;

        ctx.shadowColor = "#ffd700";
        ctx.shadowBlur = 40;
        ctx.font = "bold 60px Georgia";
        ctx.fillStyle = "#ffd700";
        ctx.textAlign = "center";
        ctx.fillText("LEVEL " + (this.level + 1) , this.canvas.width / 2, this.canvas.height / 2 + pulse);

        ctx.restore();
    }

    drawGameOver() {
        const ctx = this.ctx;

        ctx.save();

        // Overlay sombre avec fondu
        ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const pulse = Math.sin(Date.now() / 300) * 8;

        // === GAME OVER - Style doré élégant ===
        ctx.shadowColor = "#ffd700";
        ctx.shadowBlur = 40;
        ctx.font = "bold 80px Georgia";
        ctx.fillStyle = "#ffd700";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", this.canvas.width / 2, this.canvas.height / 2 - 100 + pulse);

        // Ligne décorative dorée
        ctx.strokeStyle = "#d3a625";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.canvas.width / 2 - 200, this.canvas.height / 2 - 60);
        ctx.lineTo(this.canvas.width / 2 + 200, this.canvas.height / 2 - 60);
        ctx.stroke();

        ctx.shadowBlur = 0;

        // === STATISTIQUES - Style propre ===
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.font = "32px Georgia";
        ctx.fillText("Final Score", this.canvas.width / 2, this.canvas.height / 2 - 10);

        // Score en grand et doré
        ctx.shadowColor = "#ffd700";
        ctx.shadowBlur = 20;
        ctx.fillStyle = "#ffd700";
        ctx.font = "bold 50px Arial";
        ctx.fillText(this.score, this.canvas.width / 2, this.canvas.height / 2 + 40);

        ctx.shadowBlur = 0;

        // Niveau atteint
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.font = "24px Georgia";
        ctx.fillText("Level Reached: " + this.level, this.canvas.width / 2, this.canvas.height / 2 + 80);

        // === BOUTON REPLAY - Style doré ===
        const btn = this.restartButton;
        const hover = Math.sin(Date.now() / 200) * 3;

        // Ombre du bouton
        ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 5;

        ctx.fillStyle = "#1a1a1a";
        ctx.strokeStyle = "#d3a625";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(btn.x, btn.y + hover, btn.width, btn.height, 15);
        ctx.fill();
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        // Texte du bouton avec glow
        ctx.shadowColor = "#ffd700";
        ctx.shadowBlur = 15;
        ctx.fillStyle = "#ffd700";
        ctx.font = "bold 26px Georgia";
        ctx.fillText("PLAY AGAIN", btn.x + btn.width / 2, btn.y + 35 + hover);

        ctx.restore();
    }

    spawnEnemies() {
        this.enemies = [];

        // === PROGRESSION HYBRIDE ===
        // Nombre total augmente progressivement
        let totalEnemies;
        if (this.level <= 3) {
            totalEnemies = 5; // Niveaux 1-3 : 5 ennemis
        } else if (this.level <= 6) {
            totalEnemies = 6; // Niveaux 4-6 : 6 ennemis
        } else if (this.level <= 9) {
            totalEnemies = 7; // Niveaux 7-9 : 7 ennemis
        } else {
            totalEnemies = 8; // Niveau 10+ : 8 ennemis max
        }

        // Proportion de chasseurs augmente avec le niveau
        // Level 1: 1 chasseur, Level 5: 3 chasseurs, Level 10: 5 chasseurs
        const chasers = Math.min(
            Math.floor(this.level / 2) + 1, 
            totalEnemies - 1 // Au moins 1 ennemi normal
        );
        
        const baseEnemies = totalEnemies - chasers;

        // Ennemis normaux
        for (let i = 0; i < baseEnemies; i++) {
            const x = Math.random() * (this.canvas.width - 50) + 25;
            const y = Math.random() * (this.canvas.height - 50) + 25;
            this.enemies.push(new Enemy(this, x, y));
        }

        // Chasseurs
        for (let i = 0; i < chasers; i++) {
            const x = Math.random() * (this.canvas.width - 50) + 25;
            const y = Math.random() * (this.canvas.height - 50) + 25;
            this.enemies.push(new EnemyChaser(this, x, y));
        }

        console.log(`Level ${this.level}: ${baseEnemies} normaux + ${chasers} chasseurs = ${totalEnemies} total`);
    }

    reset() {
        this.gameOver = false;
        this.score = 0;
        //this.player.lives = 10;
        this.player.lives = this.player.maxLives;
        this.player.invincible = false;
        this.player.x = this.canvas.width / 2;
        this.player.y = this.canvas.height / 2;
        this.level = 1;
        this.spawnEnemies();
        this.particles = [];
        
        // Redémarrer la musique
        this.soundManager.playBackgroundMusic();
    }
}