import { Enemy } from './enemy.js';
import { Sprite } from '../../graphics/sprite.js';
import { CURRENT_DRIFTER_SPRITE, CURRENT_DRIFTER_PALETTE } from '../../graphics/sprite-data.js';
import { DIR, GRAVITY } from '../../constants.js';
import { resolveEntityTileCollisions } from '../../core/collision.js';

export class CurrentDrifter extends Enemy {
    constructor(x, y) {
        super(x, y, 12, 14);
        this.hp = 2;
        this.sprite = new Sprite(CURRENT_DRIFTER_SPRITE, CURRENT_DRIFTER_PALETTE);
        this.facing = DIR.RIGHT;
        this.walkSpeed = 1.0;
        this.floatTimer = 0;
        this.floatInterval = 80;
        this.isFloating = false;
        this.floatFrames = 0;
    }

    update(dt, game) {
        if (!this.isOnScreen(game.camera)) return;

        this.floatTimer++;

        if (this.isFloating) {
            this.floatFrames++;
            // Reduced gravity float
            this.vy += 0.1;
            if (this.floatFrames >= 45) {
                this.isFloating = false;
            }
        } else {
            this.applyGravity();

            // Patrol walk
            this.vx = this.facing * this.walkSpeed;
        }

        // Trigger float-jump
        if (!this.isFloating && this.floatTimer >= this.floatInterval && this.onGround) {
            this.floatTimer = 0;
            this.isFloating = true;
            this.floatFrames = 0;
            this.vy = -6;
        }

        this.resolveCollisions(game.tileGrid);

        // Turn around at edges
        const nextX = this.x + this.facing * this.walkSpeed;
        const checkCol = this.facing === DIR.RIGHT
            ? Math.floor((this.x + this.w) / 16)
            : Math.floor((this.x - 1) / 16);
        const floorRow = Math.floor((this.y + this.h + 1) / 16);

        // Simple wall / edge detection: flip if hit wall or walked off platform
        if (!this.onGround && this.vy > 0 && this.floatFrames === 0) {
            this.facing = this.facing === DIR.RIGHT ? DIR.LEFT : DIR.RIGHT;
        }

        // Clamp to a range around spawn
        if (Math.abs(this.x - this.spawnX) > 64) {
            this.facing = this.x > this.spawnX ? DIR.LEFT : DIR.RIGHT;
        }
    }

    draw(ctx, camera) {
        if (!this.isOnScreen(camera)) return;
        const screenX = Math.round((this.x - camera.x) * 2);
        const screenY = Math.round((this.y - camera.y) * 2);
        this.sprite.draw(ctx, screenX, screenY, this.facing === DIR.LEFT);
    }
}
