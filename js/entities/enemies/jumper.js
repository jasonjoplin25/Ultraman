import { Enemy } from './enemy.js';
import { Sprite } from '../../graphics/sprite.js';
import { JUMPER_SPRITE, JUMPER_PALETTE } from '../../graphics/sprite-data.js';
import { GRAVITY } from '../../constants.js';

export class Jumper extends Enemy {
    constructor(x, y) {
        super(x, y, 14, 16);
        this.hp = 2;
        this.jumpTimer = 0;
        this.jumpInterval = 60;
        this.sprite = new Sprite(JUMPER_SPRITE, JUMPER_PALETTE);
    }

    update(dt, game) {
        this.jumpTimer++;

        if (this.onGround && this.jumpTimer >= this.jumpInterval) {
            this.jumpTimer = 0;
            this.vy = -7;
            // Jump toward player
            const playerX = game.camera.x + game.camera.width / 2;
            this.vx = playerX > this.x ? 2 : -2;
            this.facing = this.vx > 0 ? 1 : -1;
        }

        this.applyGravity();

        if (this.onGround) {
            this.vx = 0;
        }

        this.resolveCollisions(game.tileGrid);
    }

    draw(ctx, camera) {
        const screenX = Math.round((this.x - camera.x) * 2);
        const screenY = Math.round((this.y - camera.y) * 2);
        this.sprite.draw(ctx, screenX, screenY, this.facing === -1);
    }
}
