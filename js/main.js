import { Game } from './game.js';

const canvas = document.getElementById('game-canvas');
const game = new Game(canvas);

// Check for test level from editor
const params = new URLSearchParams(window.location.search);

game.initSave().then(() => {
    if (params.get('test') === '1') {
        const testLevel = localStorage.getItem('ultraman_test_level');
        const testStage = localStorage.getItem('ultraman_test_stage') || 'new';
        if (testLevel) {
            const layoutMatch = testLevel.match(/layout:\s*`\n?([\s\S]*?)\n?`/);
            const bgMatch = testLevel.match(/bgColor:\s*'([^']+)'/);
            const bossMatch = testLevel.match(/bossType:\s*(?:'([^']+)'|null)/);
            const nameMatch = testLevel.match(/stageName:\s*'([^']+)'/);

            if (layoutMatch) {
                const customStage = {
                    stageName: nameMatch ? nameMatch[1] : 'Test Stage',
                    bossType: bossMatch && bossMatch[1] ? bossMatch[1] : null,
                    bgColor: bgMatch ? bgMatch[1] : '#000000',
                    palette: null,
                    layout: layoutMatch[1],
                };

                import('./graphics/sprite-data.js').then(sprites => {
                    const paletteMap = {
                        flame: sprites.TILE_PALETTE_FLAME,
                        frost: sprites.TILE_PALETTE_FROST,
                        thunder: sprites.TILE_PALETTE_THUNDER,
                        blade: sprites.TILE_PALETTE_BLADE,
                    };
                    customStage.palette = paletteMap[testStage] || sprites.TILE_PALETTE_DEFAULT;
                    game.start();
                    game.startStage(customStage);
                });
                return;
            }
        }
    }
    game.start();
});
