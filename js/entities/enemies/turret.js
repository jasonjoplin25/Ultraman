import { Enemy } from './enemy.js';
import { Sprite } from '../../graphics/sprite.js';
import { TURRET_SPRITE, TURRET_PALETTE } from '../../graphics/sprite-data.js';
import { Projectile } from '../projectile.js';

export class Turret extends Enemy {
    constructor(x, y) {
        super(x, y, 16, 16);
        this.hp = 5;
        this.shootTimer = 0;
        this.shootInterval = 120; // 2 seconds
        this.sprite = new Sprite(TURRET_SPRITE, TURRET_PALETTE);
    }

    update(dt, game) {
        this.shootTimer++;

        if (this.shootTimer >= this.shootInterval) {
            this.shootTimer = 0;
            this.shoot(game);
        }
    }

    shoot(game) {
        // Aim at player position
        const px = game.camera.x + game.camera.width / 2;
        const py = game.camera.y + game.camera.height / 2;
        const dx = px - this.centerX;
        const dy = py - this.centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 1) return;

        const speed = 3;
        const proj = Projectile.createEnemyShot(
            this.centerX, this.centerY,
            (dx / dist) * speed,
            (dy / dist) * speed
        );
        game.projectiles.push(proj);
    }

    draw(ctx, camera) {
        const screenX = Math.round((this.x - camera.x) * 2);
        const screenY = Math.round((this.y - camera.y) * 2);
        this.sprite.draw(ctx, screenX, screenY);
    }
}
