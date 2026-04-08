import { renderSpriteToCanvas, drawSprite } from './renderer.js';

export class Sprite {
    constructor(pixelData, palette, scale = 2) {
        this.pixelData = pixelData;
        this.palette = palette;
        this.scale = scale;
        this.canvas = null;
        this.flippedCanvas = null;
    }

    getCanvas() {
        if (!this.canvas) {
            this.canvas = renderSpriteToCanvas(this.pixelData, this.palette, this.scale);
        }
        return this.canvas;
    }

    get width() {
        return this.pixelData[0].length * this.scale;
    }

    get height() {
        return this.pixelData.length * this.scale;
    }

    draw(ctx, x, y, flipX = false) {
        drawSprite(ctx, this.getCanvas(), x, y, flipX);
    }
}
