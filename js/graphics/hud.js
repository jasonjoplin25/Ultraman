import { PLAYER_MAX_HP, BOSS_MAX_HP, COLORS, CANVAS_WIDTH, CANVAS_HEIGHT, WEAPON_COLORS } from '../constants.js';

export class HUD {
    constructor() {
        this.bossHp = 0;
        this.bossMaxHp = BOSS_MAX_HP;
        this.showBossBar = false;
        this.bossBarFillTimer = 0;
    }

    draw(ctx, player) {
        // Player HP bar (left side, vertical like Mega Man)
        this.drawHealthBar(ctx, 8, 16, player.hp, PLAYER_MAX_HP, COLORS.HP_BAR);

        // Lives counter
        ctx.fillStyle = COLORS.WHITE;
        ctx.font = '14px monospace';
        ctx.fillText(`Lives: ${player.lives}`, 8, CANVAS_HEIGHT - 8);

        // Current weapon energy bar with per-weapon color
        if (player.currentWeapon !== 'buster') {
            const energy = player.weaponEnergy[player.currentWeapon] || 0;
            const wc = WEAPON_COLORS[player.currentWeapon] || { light: COLORS.WEAPON_ENERGY };
            this.drawHealthBar(ctx, 24, 16, energy, 28, wc.light);
        }

        // Boss HP bar (right side)
        if (this.showBossBar) {
            const displayHp = this.bossBarFillTimer > 0
                ? Math.floor((1 - this.bossBarFillTimer / 60) * this.bossHp)
                : this.bossHp;
            this.drawHealthBar(ctx, CANVAS_WIDTH - 24, 16, displayHp, this.bossMaxHp, COLORS.BOSS_HP_BAR);
        }
    }

    drawHealthBar(ctx, x, y, current, max, color) {
        const barWidth = 8;
        const barHeight = max * 4;
        const fillHeight = (current / max) * barHeight;

        // Background
        ctx.fillStyle = COLORS.HP_BAR_BG;
        ctx.fillRect(x, y, barWidth, barHeight);

        // Border
        ctx.strokeStyle = COLORS.WHITE;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, barWidth, barHeight);

        // Fill (from bottom)
        ctx.fillStyle = color;
        ctx.fillRect(x + 1, y + barHeight - fillHeight, barWidth - 2, fillHeight);

        // Tick marks
        ctx.fillStyle = COLORS.BLACK;
        for (let i = 1; i < max; i++) {
            const tickY = y + barHeight - (i / max) * barHeight;
            ctx.fillRect(x + 1, tickY, barWidth - 2, 1);
        }
    }

    startBossFill(hp) {
        this.showBossBar = true;
        this.bossHp = hp;
        this.bossBarFillTimer = 60;
    }

    updateBossHp(hp) {
        this.bossHp = hp;
    }

    update() {
        if (this.bossBarFillTimer > 0) {
            this.bossBarFillTimer--;
        }
    }
}
