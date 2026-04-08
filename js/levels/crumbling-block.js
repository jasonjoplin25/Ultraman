import { TILE, TILE_SIZE } from '../constants.js';
import { Sprite } from '../graphics/sprite.js';
import { TILE_CRUMBLE, CRUMBLE_PALETTE } from '../graphics/sprite-data.js';

export class CrumblingBlock {
    constructor(x, y, tileGrid) {
        this.x = x;
        this.y = y;
        this.col = Math.floor(x / TILE_SIZE);
        this.row = Math.floor(y / TILE_SIZE);
        this.state = 'solid'; // 'solid', 'shaking', 'fallen'
        this.timer = 0;
        this.shakeOffset = 0;
        this.sprite = new Sprite(TILE_CRUMBLE, CRUMBLE_PALETTE);

        // Set tile in grid to solid (crumble type for visual via tile renderer)
        if (tileGrid && this.row >= 0 && this.row < tileGrid.length &&
            this.col >= 0 && this.col < tileGrid[0].length) {
            tileGrid[this.row][this.col] = TILE.CRUMBLE;
        }
    }

    isPlayerOnTop(player) {
        const playerBottom = player.y + player.h;
        const blockTop = this.row * TILE_SIZE;
        const blockLeft = this.col * TILE_SIZE;
        const blockRight = blockLeft + TILE_SIZE;
        return player.onGround &&
               player.x + player.w > blockLeft && player.x < blockRight &&
               Math.abs(playerBottom - blockTop) <= 3;
    }

    update(dt, tileGrid, player) {
        switch (this.state) {
            case 'solid':
                if (!player.isDead && !player.isSpawning && this.isPlayerOnTop(player)) {
                    this.state = 'shaking';
                    this.timer = 0;
                }
                break;

            case 'shaking':
                this.timer++;
                // Shake intensity increases over time
                this.shakeOffset = Math.sin(this.timer * 0.8) * (this.timer / 30);
                if (this.timer >= 60) {
                    this.state = 'fallen';
                    this.timer = 0;
                    this.shakeOffset = 0;
                    if (tileGrid && this.row >= 0 && this.col >= 0) {
                        tileGrid[this.row][this.col] = TILE.AIR;
                    }
                }
                break;

            case 'fallen':
                this.timer++;
                if (this.timer >= 90) { // 60 shake + 90 fallen = 150 total
                    this.state = 'solid';
                    this.timer = 0;
                    if (tileGrid && this.row >= 0 && this.col >= 0) {
                        tileGrid[this.row][this.col] = TILE.CRUMBLE;
                    }
                }
                break;
        }
    }

    draw(ctx, camera) {
        if (this.state === 'fallen') return;

        const screenX = Math.round((this.col * TILE_SIZE + this.shakeOffset - camera.x) * 2);
        const screenY = Math.round((this.row * TILE_SIZE - camera.y) * 2);
        this.sprite.draw(ctx, screenX, screenY);
    }
}
