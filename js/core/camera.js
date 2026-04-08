import { CANVAS_WIDTH, CANVAS_HEIGHT, TILE_SIZE } from '../constants.js';
import { clamp } from './utils.js';

export class Camera {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.width = CANVAS_WIDTH / 2; // internal resolution
        this.height = CANVAS_HEIGHT / 2;
        this.levelWidth = 0;
        this.levelHeight = 0;
        this.shakeTimer = 0;
        this.shakeIntensity = 0;
        this.shakeOffsetX = 0;
        this.shakeOffsetY = 0;
    }

    setLevelBounds(widthInTiles, heightInTiles) {
        this.levelWidth = widthInTiles * TILE_SIZE;
        this.levelHeight = heightInTiles * TILE_SIZE;
    }

    follow(target) {
        // Center on target
        const targetX = target.x + target.w / 2 - this.width / 2;
        const targetY = target.y + target.h / 2 - this.height / 2;

        this.x = targetX;
        this.y = targetY;

        // Clamp to level bounds
        this.x = clamp(this.x, 0, Math.max(0, this.levelWidth - this.width));
        this.y = clamp(this.y, 0, Math.max(0, this.levelHeight - this.height));
    }

    shake(intensity, duration) {
        this.shakeIntensity = intensity;
        this.shakeTimer = duration;
    }

    update() {
        if (this.shakeTimer > 0) {
            this.shakeTimer--;
            this.shakeOffsetX = (Math.random() - 0.5) * this.shakeIntensity * 2;
            this.shakeOffsetY = (Math.random() - 0.5) * this.shakeIntensity * 2;
        } else {
            this.shakeOffsetX = 0;
            this.shakeOffsetY = 0;
        }
    }

    getDrawOffset() {
        return {
            x: this.x + this.shakeOffsetX,
            y: this.y + this.shakeOffsetY,
        };
    }
}
