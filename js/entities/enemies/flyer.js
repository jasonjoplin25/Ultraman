import { Enemy } from './enemy.js';
import { Sprite } from '../../graphics/sprite.js';
import { FLYER_SPRITE, FLYER_PALETTE } from '../../graphics/sprite-data.js';

export class Flyer extends Enemy {
    constructor(x, y) {
        super(x, y, 14, 12);
        this.hp = 2;
        this.startY = y;
        this.phase = 0;
        this.amplitude = 24;
        this.frequency = 0.05;
        this.moveSpeed = -1.5;
        this.diving = false;
        this.diveTimer = 0;
        this.sprite = new Sprite(FLYER_SPRITE, FLYER_PALETTE);
    }

    update(dt, game) {
        // Always move horizontally
        this.x += this.moveSpeed;

        if (this.diving) {
            this.y += this.diveVy;
            this.diveTimer++;
            if (this.diveTimer > 30) {
                this.diving = false;
                // Return to sine wave from current position
                this.startY = this.y;
                this.phase = 0;
            }
        } else {
            this.phase += this.frequency;
            this.y = this.startY + Math.sin(this.phase) * this.amplitude;

            // Periodic dive
            if (Math.random() < 0.005) {
                this.diving = true;
                this.diveTimer = 0;
                this.diveVy = 4;
            }
        }

        // Face toward movement
        this.facing = this.moveSpeed > 0 ? 1 : -1;
    }

    draw(ctx, camera) {
        const screenX = Math.round((this.x - camera.x) * 2);
        const screenY = Math.round((this.y - camera.y) * 2);
        this.sprite.draw(ctx, screenX, screenY, this.facing === -1);
    }
}
