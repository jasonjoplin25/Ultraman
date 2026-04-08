import { Sprite } from './sprite.js';
import { EXPLOSION, EXPLOSION_PALETTE } from './sprite-data.js';

// Weapon colors for death explosion
const DEATH_COLORS = {
    buster:  ['#0058f8', '#3cbcfc', '#fcfcfc'],
    flame:   ['#a81000', '#f83800', '#fca044'],
    ice:     ['#0088a8', '#40d0f8', '#b8f0f8'],
    thunder: ['#a86800', '#f8d800', '#fcfcfc'],
    blade:   ['#606060', '#b0b0b0', '#fcfcfc'],
};

export class Particle {
    constructor(x, y, vx, vy, color, size, life, gravity = 0.1) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.size = size;
        this.life = life;
        this.maxLife = life;
        this.gravity = gravity;
        this.active = true;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.life--;
        if (this.life <= 0) this.active = false;
    }

    draw(ctx, camera) {
        if (!this.active) return;
        const alpha = this.life / this.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.fillRect(
            Math.round((this.x - camera.x) * 2),
            Math.round((this.y - camera.y) * 2),
            this.size * 2, this.size * 2
        );
        ctx.globalAlpha = 1;
    }
}

export class EffectsManager {
    constructor() {
        this.particles = [];
        this.explosionSprite = new Sprite(EXPLOSION, EXPLOSION_PALETTE);
    }

    // Classic Mega Man player death: 8 chunks fly outward with no gravity
    spawnPlayerDeath(cx, cy, weaponId) {
        const colors = DEATH_COLORS[weaponId] || DEATH_COLORS.buster;

        // 8 large rectangular chunks in all cardinal + diagonal directions
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8 - Math.PI / 2;
            const speed = 2.5 + Math.random() * 1.5;
            const color = colors[i % colors.length];
            this.particles.push(new Particle(
                cx, cy,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                color,
                4 + Math.random() * 3,
                50 + Math.random() * 15,
                0   // no gravity - fly in straight lines
            ));
        }

        // Additional smaller inner particles
        for (let i = 0; i < 16; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.5 + Math.random() * 2.5;
            const color = colors[Math.floor(Math.random() * colors.length)];
            this.particles.push(new Particle(
                cx, cy,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                color,
                2,
                35 + Math.random() * 20,
                0
            ));
        }
    }

    spawnExplosion(x, y) {
        const colors = ['#f83800', '#f8a000', '#f8f800', '#fcfcfc'];
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 * i) / 12;
            const speed = 1 + Math.random() * 3;
            const color = colors[Math.floor(Math.random() * colors.length)];
            this.particles.push(new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed - 2,
                color,
                2 + Math.random() * 3,
                20 + Math.random() * 20
            ));
        }
    }

    spawnHitSpark(x, y) {
        const colors = ['#fcfcfc', '#f8f800'];
        for (let i = 0; i < 4; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 2;
            this.particles.push(new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                colors[Math.floor(Math.random() * colors.length)],
                2,
                10
            ));
        }
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            if (!this.particles[i].active) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx, camera) {
        for (const p of this.particles) {
            p.draw(ctx, camera);
        }
    }
}
