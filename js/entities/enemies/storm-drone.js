import { Enemy } from './enemy.js';
import { Sprite } from '../../graphics/sprite.js';
import { Projectile } from '../projectile.js';
import { STORM_DRONE_SPRITE, STORM_DRONE_PALETTE } from '../../graphics/sprite-data.js';
import { DIR } from '../../constants.js';

export class StormDrone extends Enemy {
    constructor(x, y) {
        super(x, y, 14, 14);
        this.hp = 3;
        this.sprite = new Sprite(STORM_DRONE_SPRITE, STORM_DRONE_PALETTE);
        this.facing = DIR.RIGHT;
        this.moveTimer = 0;
        this.movePhase = 0; // 0=left/right, 1=up/down
        this.shootTimer = 0;
        this.shootInterval = 45;
        this.baseX = x;
        this.baseY = y;
    }

    update(dt, game) {
        if (!this.isOnScreen(game.camera)) return;

        this.moveTimer++;

        // Zigzag: 30f horizontal dash, then 30f vertical drift, repeat
        const phase = Math.floor(this.moveTimer / 30) % 4;
        switch (phase) {
            case 0: // dash right
                this.x += 3;
                this.facing = DIR.RIGHT;
                break;
            case 1: // drift down
                this.y += 2;
                break;
            case 2: // dash left
                this.x -= 3;
                this.facing = DIR.LEFT;
                break;
            case 3: // drift up
                this.y -= 2;
                break;
        }

        // Clamp around spawn
        this.x = Math.max(this.baseX - 48, Math.min(this.baseX + 48, this.x));
        this.y = Math.max(this.baseY - 32, Math.min(this.baseY + 32, this.y));

        // Fire straight down every shootInterval frames
        this.shootTimer++;
        if (this.shootTimer >= this.shootInterval) {
            this.shootTimer = 0;
            const proj = Projectile.createEnemyShot(
                this.centerX,
                this.y + this.h,
                0,
                4
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
