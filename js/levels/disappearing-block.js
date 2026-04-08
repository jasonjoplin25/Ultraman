import { TILE, TILE_SIZE } from '../constants.js';
import { Sprite } from '../graphics/sprite.js';
import { TILE_DISAPPEARING, DISAPPEARING_PALETTE } from '../graphics/sprite-data.js';

export class DisappearingBlock {
    constructor(x, y, groupId = 0, onTime = 60, offTime = 60) {
        this.x = x;
        this.y = y;
        this.col = Math.floor(x / TILE_SIZE);
        this.row = Math.floor(y / TILE_SIZE);
        this.groupId = groupId;
        this.onTime = onTime;
        this.offTime = offTime;
        this.timer = groupId * 20; // Stagger by group
        this.visible = true;
        this.sprite = new Sprite(TILE_DISAPPEARING, DISAPPEARING_PALETTE);
    }

    update(dt, tileGrid) {
        this.timer++;
        const cycle = this.onTime + this.offTime;
        const phase = this.timer % cycle;

        const wasVisible = this.visible;
        this.visible = phase < this.onTime;

        // Update tile grid
        if (this.visible !== wasVisible) {
            if (this.row >= 0 && this.row < tileGrid.length &&
                this.col >= 0 && this.col < tileGrid[0].length) {
                tileGrid[this.row][this.col] = this.visible ? TILE.SOLID : TILE.AIR;
            }
        }
    }

    draw(ctx, camera) {
        if (!this.visible) return;
        const screenX = Math.round((this.x - camera.x) * 2);
        const screenY = Math.round((this.y - camera.y) * 2);
        this.sprite.draw(ctx, screenX, screenY);
    }
}
