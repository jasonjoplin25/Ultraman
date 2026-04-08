// Renders pixel art sprites from 2D arrays to offscreen canvases for caching

const spriteCache = new Map();

export function renderSpriteToCanvas(pixelData, palette, scale = 1) {
    const key = JSON.stringify({ pixelData, palette, scale });
    if (spriteCache.has(key)) return spriteCache.get(key);

    const h = pixelData.length;
    const w = pixelData[0].length;
    const canvas = document.createElement('canvas');
    canvas.width = w * scale;
    canvas.height = h * scale;
    const ctx = canvas.getContext('2d');

    for (let row = 0; row < h; row++) {
        for (let col = 0; col < w; col++) {
            const idx = pixelData[row][col];
            if (idx === 0) continue; // transparent
            ctx.fillStyle = palette[idx];
            ctx.fillRect(col * scale, row * scale, scale, scale);
        }
    }

    spriteCache.set(key, canvas);
    return canvas;
}

export function drawSprite(ctx, spriteCanvas, x, y, flipX = false) {
    if (flipX) {
        ctx.save();
        ctx.translate(Math.round(x + spriteCanvas.width), Math.round(y));
        ctx.scale(-1, 1);
        ctx.drawImage(spriteCanvas, 0, 0);
        ctx.restore();
    } else {
        ctx.drawImage(spriteCanvas, Math.round(x), Math.round(y));
    }
}

export function clearCache() {
    spriteCache.clear();
}
