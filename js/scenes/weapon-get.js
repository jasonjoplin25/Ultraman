import { Scene } from './scene.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS, WEAPON_FLAME, WEAPON_ICE, WEAPON_THUNDER, WEAPON_BLADE } from '../constants.js';

const WEAPON_NAMES = {
    [WEAPON_FLAME]: 'FLAME WAVE',
    [WEAPON_ICE]: 'ICE SHARD',
    [WEAPON_THUNDER]: 'THUNDER STRIKE',
    [WEAPON_BLADE]: 'RAZOR BLADE',
};

const WEAPON_COLORS = {
    [WEAPON_FLAME]: '#f83800',
    [WEAPON_ICE]: '#3cbcfc',
    [WEAPON_THUNDER]: '#f8d800',
    [WEAPON_BLADE]: '#bcbcbc',
};

export class WeaponGetScene extends Scene {
    constructor(game) {
        super(game);
        this.weaponId = null;
        this.timer = 0;
        this.flashTimer = 0;
    }

    enter() {
        this.timer = 0;
        this.flashTimer = 0;
        if (this.game.audio) this.game.audio.play('weapon_get');
    }

    setWeapon(weaponId) {
        this.weaponId = weaponId;
        if (this.game.player) {
            this.game.player.addWeapon(weaponId);
        }
        if (!this.game.defeatedBosses.includes(weaponId)) {
            this.game.defeatedBosses.push(weaponId);
        }
        // Save progress after getting a new weapon
        this.game.saveProgress();
    }

    update(dt) {
        this.timer++;
        this.flashTimer++;

        if (this.timer > 240) { // 4 seconds
            this.game.switchScene('stageSelect');
        }
    }

    draw(ctx) {
        // Flashing background
        const flash = Math.floor(this.flashTimer / 4) % 2;
        ctx.fillStyle = flash ? '#000040' : '#000000';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Player in center
        const player = this.game.player;
        if (player) {
            const sprite = player.spriteMap.stand;
            if (sprite) {
                sprite.draw(ctx, CANVAS_WIDTH / 2 - 16, CANVAS_HEIGHT / 2 - 24);
            }
        }

        // Weapon name
        if (this.weaponId) {
            const name = WEAPON_NAMES[this.weaponId] || 'UNKNOWN';
            ctx.fillStyle = WEAPON_COLORS[this.weaponId] || COLORS.WHITE;
            ctx.font = 'bold 20px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('YOU GOT', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
            ctx.fillText(name, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 65);
            ctx.textAlign = 'left';
        }
    }
}
