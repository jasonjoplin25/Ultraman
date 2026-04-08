import { TILE, TILE_SIZE } from '../constants.js';
import { rectOverlap } from './utils.js';

export function getTileAt(tileGrid, col, row) {
    if (row < 0 || row >= tileGrid.length) return TILE.AIR;
    if (col < 0 || col >= tileGrid[0].length) return TILE.AIR;
    return tileGrid[row][col];
}

export function isSolid(tileType) {
    return tileType === TILE.SOLID || tileType === TILE.BOSS_GATE ||
           tileType === TILE.BOUNCE || tileType === TILE.CRUMBLE;
}

export function isSpike(tileType) {
    return tileType === TILE.SPIKE;
}

export function isLadder(tileType) {
    return tileType === TILE.LADDER || tileType === TILE.LADDER_TOP;
}

export function isOneWayPlatform(tileType) {
    return tileType === TILE.PLATFORM || tileType === TILE.LADDER_TOP;
}

// Resolve entity collisions with tile grid using axis-separated resolution
export function resolveEntityTileCollisions(entity, tileGrid, dt) {
    // Move X
    entity.x += entity.vx;
    resolveAxisX(entity, tileGrid);

    // Move Y
    entity.y += entity.vy;
    resolveAxisY(entity, tileGrid);
}

function resolveAxisX(entity, tileGrid) {
    const left = Math.floor(entity.x / TILE_SIZE);
    const right = Math.floor((entity.x + entity.w - 1) / TILE_SIZE);
    const top = Math.floor(entity.y / TILE_SIZE);
    const bottom = Math.floor((entity.y + entity.h - 1) / TILE_SIZE);

    for (let row = top; row <= bottom; row++) {
        for (let col = left; col <= right; col++) {
            const tile = getTileAt(tileGrid, col, row);
            if (!isSolid(tile)) continue;

            const tileRect = { x: col * TILE_SIZE, y: row * TILE_SIZE, w: TILE_SIZE, h: TILE_SIZE };
            const entRect = { x: entity.x, y: entity.y, w: entity.w, h: entity.h };

            if (rectOverlap(entRect, tileRect)) {
                if (entity.vx > 0) {
                    entity.x = tileRect.x - entity.w;
                } else if (entity.vx < 0) {
                    entity.x = tileRect.x + TILE_SIZE;
                }
                entity.vx = 0;
            }
        }
    }
}

function resolveAxisY(entity, tileGrid) {
    const left = Math.floor(entity.x / TILE_SIZE);
    const right = Math.floor((entity.x + entity.w - 1) / TILE_SIZE);
    const top = Math.floor(entity.y / TILE_SIZE);
    const bottom = Math.floor((entity.y + entity.h - 1) / TILE_SIZE);

    for (let row = top; row <= bottom; row++) {
        for (let col = left; col <= right; col++) {
            const tile = getTileAt(tileGrid, col, row);

            // One-way platforms: only block when falling from above
            if (isOneWayPlatform(tile)) {
                if (entity.vy <= 0) continue;
                const tileTop = row * TILE_SIZE;
                const entityBottom = entity.y + entity.h;
                const prevBottom = entityBottom - entity.vy;
                if (prevBottom > tileTop + 2) continue;

                const tileRect = { x: col * TILE_SIZE, y: row * TILE_SIZE, w: TILE_SIZE, h: TILE_SIZE };
                const entRect = { x: entity.x, y: entity.y, w: entity.w, h: entity.h };
                if (rectOverlap(entRect, tileRect)) {
                    entity.y = tileTop - entity.h;
                    entity.vy = 0;
                    entity.onGround = true;
                }
                continue;
            }

            if (!isSolid(tile)) continue;

            const tileRect = { x: col * TILE_SIZE, y: row * TILE_SIZE, w: TILE_SIZE, h: TILE_SIZE };
            const entRect = { x: entity.x, y: entity.y, w: entity.w, h: entity.h };

            if (rectOverlap(entRect, tileRect)) {
                if (entity.vy > 0) {
                    entity.y = tileRect.y - entity.h;
                    entity.vy = 0;
                    entity.onGround = true;
                } else if (entity.vy < 0) {
                    entity.y = tileRect.y + TILE_SIZE;
                    entity.vy = 0;
                }
            }
        }
    }
}

// Check if entity is standing on solid ground
export function checkOnGround(entity, tileGrid) {
    const testY = entity.y + entity.h + 1;
    const left = Math.floor(entity.x / TILE_SIZE);
    const right = Math.floor((entity.x + entity.w - 1) / TILE_SIZE);
    const row = Math.floor(testY / TILE_SIZE);

    for (let col = left; col <= right; col++) {
        const tile = getTileAt(tileGrid, col, row);
        if (isSolid(tile)) return true;
        if (isOneWayPlatform(tile)) {
            const tileTop = row * TILE_SIZE;
            if (Math.abs(entity.y + entity.h - tileTop) < 2) return true;
        }
    }
    return false;
}

// Check if entity overlaps a ladder (or is standing on a ladder top)
export function checkOnLadder(entity, tileGrid, pressingDown) {
    const centerX = Math.floor((entity.x + entity.w / 2) / TILE_SIZE);
    const top = Math.floor(entity.y / TILE_SIZE);
    const bottom = Math.floor((entity.y + entity.h - 1) / TILE_SIZE);

    for (let row = top; row <= bottom; row++) {
        if (isLadder(getTileAt(tileGrid, centerX, row))) return true;
    }

    // If pressing down, also check the tile just below the player's feet
    // This handles standing on top of a ladder top tile
    if (pressingDown) {
        const belowRow = Math.floor((entity.y + entity.h + 1) / TILE_SIZE);
        if (isLadder(getTileAt(tileGrid, centerX, belowRow))) return true;
    }

    return false;
}

// Check for spike collisions
export function checkSpikeCollision(entity, tileGrid) {
    const left = Math.floor(entity.x / TILE_SIZE);
    const right = Math.floor((entity.x + entity.w - 1) / TILE_SIZE);
    const top = Math.floor(entity.y / TILE_SIZE);
    const bottom = Math.floor((entity.y + entity.h - 1) / TILE_SIZE);

    for (let row = top; row <= bottom; row++) {
        for (let col = left; col <= right; col++) {
            if (isSpike(getTileAt(tileGrid, col, row))) return true;
        }
    }
    return false;
}

// Entity-entity AABB overlap
export function entitiesOverlap(a, b) {
    return rectOverlap(
        { x: a.x, y: a.y, w: a.w, h: a.h },
        { x: b.x, y: b.y, w: b.w, h: b.h }
    );
}
