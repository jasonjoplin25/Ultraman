import { Scene } from './scene.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT, WEAPON_BUSTER, WEAPON_MAX_ENERGY } from '../constants.js';

const WEAPON_DISPLAY = {
    buster: { name: 'MEGA BUSTER', color: '#3cbcfc' },
    flame: { name: 'FLAME WAVE', color: '#f83800' },
    ice: { name: 'ICE SHARD', color: '#3cbcfc' },
    thunder: { name: 'THUNDER STRIKE', color: '#f8d800' },
    blade: { name: 'RAZOR BLADE', color: '#bcbcbc' },
};

export class PauseMenuScene extends Scene {
    constructor(game) {
        super(game);
        this.cursorIndex = 0;
    }

    enter() {
        const player = this.game.player;
        if (player) {
            this.cursorIndex = player.weapons.indexOf(player.currentWeapon);
            if (this.cursorIndex < 0) this.cursorIndex = 0;
        }
    }

    update(dt) {
        const input = this.game.input;
        const player = this.game.player;
        if (!player) return;

        if (input.justPressed('up')) {
            this.cursorIndex = Math.max(0, this.cursorIndex - 1);
            if (this.game.audio) this.game.audio.play('select');
        }
        if (input.justPressed('down')) {
            this.cursorIndex = Math.min(player.weapons.length - 1, this.cursorIndex + 1);
            if (this.game.audio) this.game.audio.play('select');
        }

        if (input.justPressed('start') || input.justPressed('jump') || input.justPressed('pause')) {
            player.currentWeapon = player.weapons[this.cursorIndex];
            if (this.game.audio) this.game.audio.play('pause');
            this.game.switchScene('gameplay');
        }
    }

    draw(ctx) {
        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.textAlign = 'center';

        ctx.fillStyle = '#fcfcfc';
        ctx.font = 'bold 24px monospace';
        ctx.fillText('WEAPON SELECT', CANVAS_WIDTH / 2, 60);

        const player = this.game.player;
        if (!player) return;

        for (let i = 0; i < player.weapons.length; i++) {
            const weapon = player.weapons[i];
            const display = WEAPON_DISPLAY[weapon] || { name: weapon, color: '#fcfcfc' };
            const y = 120 + i * 50;

            // Highlight selected
            if (i === this.cursorIndex) {
                ctx.fillStyle = '#222244';
                ctx.fillRect(CANVAS_WIDTH / 2 - 140, y - 20, 280, 40);
            }

            // Weapon name
            ctx.fillStyle = i === this.cursorIndex ? display.color : '#666666';
            ctx.font = '16px monospace';
            ctx.fillText(display.name, CANVAS_WIDTH / 2, y);

            // Energy bar
            if (weapon !== WEAPON_BUSTER) {
                const energy = player.weaponEnergy[weapon] || 0;
                const barWidth = 100;
                const barX = CANVAS_WIDTH / 2 - barWidth / 2;
                const barY = y + 8;
                ctx.fillStyle = '#333333';
                ctx.fillRect(barX, barY, barWidth, 6);
                ctx.fillStyle = display.color;
                ctx.fillRect(barX, barY, (energy / WEAPON_MAX_ENERGY) * barWidth, 6);
            }

            // Cursor
            if (i === this.cursorIndex) {
                ctx.fillStyle = '#fcfcfc';
                ctx.fillText('\u25B6', CANVAS_WIDTH / 2 - 150, y);
            }
        }

        ctx.textAlign = 'left';
    }
}
