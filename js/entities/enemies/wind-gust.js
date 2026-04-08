import { Enemy } from './enemy.js';
import { Sprite } from '../../graphics/sprite.js';
import { Projectile } from '../projectile.js';
import { WIND_GUST_SPRITE, WIND_GUST_PALETTE } from '../../graphics/sprite-data.js';
import { DIR } from '../../constants.js';

export class WindGust extends Enemy {
    constructor(x, y) {
        super(x, y, 16, 10);
        this.hp = 2;
        this.sprite = new Sprite(WIND_GUST_SPRITE, WIND_GUST_PALETTE);
        this.facing = DIR.RIGHT;
        this.shootTimer = 0;
        this.shootInterval = 80;
        this.hoverTimer = 0;
        this.baseY = y;
    }

    update(dt, game) {
        if (!this.isOnScreen(game.camera)) return;

        // Hover: gentle sine-wave vertical drift
        this.hoverTimer++;
        this.y = this.baseY + Math.sin(this.hoverTimer * 0.04) * 8;

        // Track player horizontally
        if (game.player) {
            const dx = game.player.centerX - this.centerX;
            if (Math.abs(dx) > 2) {
                this.x += Math.sign(dx) * 0.6;
            }
            this.facing = dx > 0 ? DIR.RIGHT : DIR.LEFT;
        }

        // Shoot every shootInterval frames
        this.shootTimer++;
        if (this.shootTimer >= this.shootInterval) {
            this.shootTimer = 0;
            this.fireShots(game);
        }
    }

    fireShots(game) {
        if (!game.player) return;
        // Aim at player
        const dx = game.player.centerX - this.centerX;
        const dy = game.player.centerY - this.centerY;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const speed = 3;
        const vx = (dx / dist) * speed;
        const vy = (dy / dist) * speed;

        // 2 aimed shots slightly spread
        for (let i = -1; i <= 1; i += 2) {
            const proj = Projectile.createEnemyShot(
                this.centerX,
                this.centerY,
                vx + i * 0.5,
                vy
            );
            proj.damage = 2;
            game.projectiles.push(proj);
        }
    }

    draw(ctx, camera) {
        if (!this.isOnScreen(camera)) return;
        const screenX = Math.round((this.x - camera.x) * 2);
        const screenY = Math.round((this.y - camera.y) * 2);
        this.sprite.draw(ctx, screenX, screenY, this.facing === DIR.LEFT);
    }
}
