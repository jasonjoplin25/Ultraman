import { TILE, TILE_SIZE } from '../constants.js';
import { Sprite } from '../graphics/sprite.js';
import {
    TILE_SOLID, TILE_SPIKE, TILE_LADDER, TILE_PLATFORM, TILE_CHECKPOINT,
    TILE_BOSS_GATE, TILE_DISAPPEARING,
    TILE_PALETTE_DEFAULT, SPIKE_PALETTE, LADDER_PALETTE, PLATFORM_PALETTE,
    CHECKPOINT_PALETTE, BOSS_GATE_PALETTE, DISAPPEARING_PALETTE,
    TILE_WATER_CURRENT_R, TILE_WATER_CURRENT_L, WATER_CURRENT_PALETTE,
    TILE_BOUNCE, BOUNCE_PALETTE,
    TILE_CRUMBLE, CRUMBLE_PALETTE,
} from '../graphics/sprite-data.js';

// Cached tile sprites
const tileSpriteCache = {};

export function getTileSprite(tileType, palette) {
    const key = `${tileType}_${JSON.stringify(palette)}`;
    if (tileSpriteCache[key]) return tileSpriteCache[key];

    let pixelData, tilePalette;

    switch (tileType) {
        case TILE.SOLID:
            pixelData = TILE_SOLID;
            tilePalette = palette || TILE_PALETTE_DEFAULT;
            break;
        case TILE.SPIKE:
            pixelData = TILE_SPIKE;
            tilePalette = SPIKE_PALETTE;
            break;
        case TILE.LADDER:
        case TILE.LADDER_TOP:
            pixelData = TILE_LADDER;
            tilePalette = LADDER_PALETTE;
            break;
        case TILE.PLATFORM:
            pixelData = TILE_PLATFORM;
            tilePalette = PLATFORM_PALETTE;
            break;
        case TILE.CHECKPOINT:
            pixelData = TILE_CHECKPOINT;
            tilePalette = CHECKPOINT_PALETTE;
            break;
        case TILE.BOSS_GATE:
            pixelData = TILE_BOSS_GATE;
            tilePalette = BOSS_GATE_PALETTE;
            break;
        case TILE.WATER_CURRENT_R:
            pixelData = TILE_WATER_CURRENT_R;
            tilePalette = WATER_CURRENT_PALETTE;
            break;
        case TILE.WATER_CURRENT_L:
            pixelData = TILE_WATER_CURRENT_L;
            tilePalette = WATER_CURRENT_PALETTE;
            break;
        case TILE.BOUNCE:
            pixelData = TILE_BOUNCE;
            tilePalette = BOUNCE_PALETTE;
            break;
        case TILE.CRUMBLE:
            pixelData = TILE_CRUMBLE;
            tilePalette = CRUMBLE_PALETTE;
            break;
        default:
            return null;
    }

    const sprite = new Sprite(pixelData, tilePalette);
    tileSpriteCache[key] = sprite;
    return sprite;
}

export function drawTileGrid(ctx, tileGrid, camera, palette) {
    const startCol = Math.max(0, Math.floor(camera.x / TILE_SIZE));
    const endCol = Math.min(tileGrid[0].length, Math.ceil((camera.x + camera.width) / TILE_SIZE) + 1);
    const startRow = Math.max(0, Math.floor(camera.y / TILE_SIZE));
    const endRow = Math.min(tileGrid.length, Math.ceil((camera.y + camera.height) / TILE_SIZE) + 1);

    for (let row = startRow; row < endRow; row++) {
        for (let col = startCol; col < endCol; col++) {
            const tileType = tileGrid[row][col];
            if (tileType === TILE.AIR) continue;

            const sprite = getTileSprite(tileType, palette);
            if (!sprite) continue;

            const screenX = Math.round((col * TILE_SIZE - camera.x) * 2);
            const screenY = Math.round((row * TILE_SIZE - camera.y) * 2);
            sprite.draw(ctx, screenX, screenY);
        }
    }
}
