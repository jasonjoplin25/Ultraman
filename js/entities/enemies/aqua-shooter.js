import { Enemy } from './enemy.js';
import { Sprite } from '../../graphics/sprite.js';
import { Projectile } from '../projectile.js';
import { AQUA_SHOOTER_SPRITE, AQUA_SHOOTER_PALETTE } from '../../graphics/sprite-data.js';
import { DIR } from '../../constants.js';

export class AquaShooter extends Enemy {
    constructor(x, y) {
        super(x, y, 16, 14);
        this.hp = 3;
        this.sprite = new Sprite(AQUA_SHOOTER_SPRITE, AQUA_SHOOTER_PALETTE);
        this.shootTimer = 0;
        this.shootInterval = 90;
        this.facing = DIR.RIGHT;
    }

    update(dt, game) {
        if (!this.isOnScreen(game.camera)) return;

        // Face player
        if (game.player) {
            this.facing = game.player.centerX > this.centerX ? DIR.RIGHT : DIR.LEFT;
        }

        this.shootTimer++;
        if (this.shootTimer >= this.shootInterval) {
            this.shootTimer = 0;
            this.fireArc(game);
        }
    }

    fireArc(game) {
        // Fire 2 arc shots: (facing*3, -4) and (facing*5, -2)
        const shots = [
            { vx: this.facing * 3, vy: -4 },
            { vx: this.facing * 5, vy: -2 },
        ];
        for (const s of shots) {
            const proj = Projectile.createEnemyShot(
                this.centerX + this.facing * 6,
                this.y + 4,
                s.vx,
                s.vy
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
