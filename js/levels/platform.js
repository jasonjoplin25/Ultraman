import { Entity } from '../entities/entity.js';
import { Sprite } from '../graphics/sprite.js';
import { MOVING_PLATFORM_SPRITE, MOVING_PLATFORM_PALETTE } from '../graphics/sprite-data.js';
import { TILE_SIZE } from '../constants.js';

export class MovingPlatform extends Entity {
    constructor(x, y, direction = 'horizontal', range = 64, speed = 1) {
        super(x, y, 32, 4); // 2-tile wide platform, thin hitbox
        this.startX = x;
        this.startY = y;
        this.direction = direction;
        this.range = range;
        this.speed = speed;
        this.phase = 0;
        this.sprite = new Sprite(MOVING_PLATFORM_SPRITE, MOVING_PLATFORM_PALETTE);
        this.prevX = x;
        this.prevY = y;
    }

    update(dt, player, tileGrid) {
        this.prevX = this.x;
        this.prevY = this.y;

        this.phase += this.speed * 0.02;

        if (this.direction === 'horizontal') {
            this.x = this.startX + Math.sin(this.phase) * this.range;
        } else {
            this.y = this.startY + Math.sin(this.phase) * this.range;
        }

        // Carry the player if standing on top
        if (player && this.isPlayerOnTop(player)) {
            player.x += this.x - this.prevX;
            player.y += this.y - this.prevY;
            player.onGround = true;
        }
    }

    isPlayerOnTop(player) {
        const onTopY = Math.abs(player.y + player.h - this.y) < 4;
        const overlapX = player.x + player.w > this.x && player.x < this.x + this.w;
        return onTopY && overlapX && player.vy >= 0;
    }

    draw(ctx, camera) {
        const screenX = Math.round((this.x - camera.x) * 2);
        const screenY = Math.round((this.y - camera.y) * 2);
        this.sprite.draw(ctx, screenX, screenY);
    }
}
