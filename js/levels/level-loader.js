import { TILE, TILE_SIZE } from '../constants.js';

// Parse a string-based level layout into a tile grid
// Characters: . = air, B = solid, S = spike, L = ladder, T = ladder top,
//             P = one-way platform, C = checkpoint, G = boss gate
//             W = water current right, w = water current left
//             b = bounce tile
// Entity markers (not placed in tile grid):
//             @ = player spawn, M = met, J = jumper, U = turret, F = flyer
//             * = boss spawn, 1 = small HP, 2 = large HP, 3 = small energy
//             4 = large energy, 5 = 1-up
//             m = moving platform (horizontal), v = moving platform (vertical)
//             D = disappearing block
//             K = crumbling block
//             A = aqua shooter, N = current drifter
//             Y = wind gust, Z = storm drone

const CHAR_TO_TILE = {
    '.': TILE.AIR,
    'B': TILE.SOLID,
    'S': TILE.SPIKE,
    'L': TILE.LADDER,
    'T': TILE.LADDER_TOP,
    'P': TILE.PLATFORM,
    'C': TILE.CHECKPOINT,
    'G': TILE.BOSS_GATE,
    'W': TILE.WATER_CURRENT_R,
    'w': TILE.WATER_CURRENT_L,
    'b': TILE.BOUNCE,
};

export function loadLevel(stageData) {
    const lines = stageData.layout.trim().split('\n').map(l => l.trimEnd());

    // Find max width
    const height = lines.length;
    const width = Math.max(...lines.map(l => l.length));

    // Build tile grid
    const tileGrid = [];
    const entities = [];
    let playerSpawn = { x: 32, y: 32 };

    for (let row = 0; row < height; row++) {
        tileGrid[row] = [];
        for (let col = 0; col < width; col++) {
            const char = col < lines[row].length ? lines[row][col] : '.';

            if (CHAR_TO_TILE[char] !== undefined) {
                tileGrid[row][col] = CHAR_TO_TILE[char];
            } else {
                // Entity marker - place air tile, record entity
                tileGrid[row][col] = TILE.AIR;

                const ex = col * TILE_SIZE;
                const ey = row * TILE_SIZE;

                switch (char) {
                    case '@':
                        playerSpawn = { x: ex, y: ey - 8 };
                        break;
                    case 'M':
                        entities.push({ type: 'met', x: ex, y: ey });
                        break;
                    case 'J':
                        entities.push({ type: 'jumper', x: ex, y: ey });
                        break;
                    case 'U':
                        entities.push({ type: 'turret', x: ex, y: ey });
                        break;
                    case 'F':
                        entities.push({ type: 'flyer', x: ex, y: ey });
                        break;
                    case '*':
                        entities.push({ type: 'boss', x: ex, y: ey });
                        break;
                    case '1':
                        entities.push({ type: 'pickup_small_hp', x: ex, y: ey });
                        break;
                    case '2':
                        entities.push({ type: 'pickup_large_hp', x: ex, y: ey });
                        break;
                    case '3':
                        entities.push({ type: 'pickup_small_energy', x: ex, y: ey });
                        break;
                    case '4':
                        entities.push({ type: 'pickup_large_energy', x: ex, y: ey });
                        break;
                    case '5':
                        entities.push({ type: 'pickup_life', x: ex, y: ey });
                        break;
                    case '6':
                        entities.push({ type: 'pickup_full_hp', x: ex, y: ey });
                        break;
                    case 'm':
                        entities.push({ type: 'moving_platform_h', x: ex, y: ey });
                        break;
                    case 'v':
                        entities.push({ type: 'moving_platform_v', x: ex, y: ey });
                        break;
                    case 'D':
                        entities.push({ type: 'disappearing_block', x: ex, y: ey });
                        break;
                    case 'K':
                        entities.push({ type: 'crumble_block', x: ex, y: ey });
                        break;
                    case 'A':
                        entities.push({ type: 'aqua_shooter', x: ex, y: ey });
                        break;
                    case 'N':
                        entities.push({ type: 'current_drifter', x: ex, y: ey });
                        break;
                    case 'Y':
                        entities.push({ type: 'wind_gust', x: ex, y: ey });
                        break;
                    case 'Z':
                        entities.push({ type: 'storm_drone', x: ex, y: ey });
                        break;
                }
            }
        }
    }

    return {
        tileGrid,
        entities,
        playerSpawn,
        width,
        height,
        palette: stageData.palette || null,
        bgColor: stageData.bgColor || '#000000',
        bossType: stageData.bossType || null,
        stageName: stageData.stageName || 'Unknown Stage',
    };
}
