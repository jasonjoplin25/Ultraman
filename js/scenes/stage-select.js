import { Scene } from './scene.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT, WEAPON_FLAME, WEAPON_ICE, WEAPON_THUNDER, WEAPON_BLADE, WEAPON_HYDRO, WEAPON_STORM } from '../constants.js';

const ROBOT_MASTERS = [
    { name: 'FLAME\nKNIGHT',   color: '#f83800', weapon: WEAPON_FLAME,   stageKey: 'flame' },
    { name: 'FROST\nSENTINEL', color: '#3cbcfc', weapon: WEAPON_ICE,     stageKey: 'frost' },
    { name: 'THUNDER\nFALCON', color: '#f8d800', weapon: WEAPON_THUNDER, stageKey: 'thunder' },
    { name: 'BLADE\nSAMURAI',  color: '#bcbcbc', weapon: WEAPON_BLADE,   stageKey: 'blade' },
    { name: 'HYDRO\nMASTER',   color: '#10a8f8', weapon: WEAPON_HYDRO,   stageKey: 'hydro' },
    { name: 'STORM\nKING',     color: '#b050f8', weapon: WEAPON_STORM,   stageKey: 'storm' },
];

// Grid positions (3x2): columns at x=110,256,402 rows at y=165,290
const POSITIONS = [
    { x: 110, y: 165 },
    { x: 256, y: 165 },
    { x: 402, y: 165 },
    { x: 110, y: 290 },
    { x: 256, y: 290 },
    { x: 402, y: 290 },
];

export class StageSelectScene extends Scene {
    constructor(game) {
        super(game);
        this.cursorIndex = 0;
        this.stageDataMap = {};
    }

    registerStage(key, stageData) {
        this.stageDataMap[key] = stageData;
    }

    allRobotMastersBeaten() {
        const db = this.game.defeatedBosses;
        return [WEAPON_FLAME, WEAPON_ICE, WEAPON_THUNDER, WEAPON_BLADE, WEAPON_HYDRO, WEAPON_STORM].every(w => db.includes(w));
    }

    castle1Beaten() {
        return this.game.defeatedBosses.includes('castle1');
    }

    enter() {
        this.cursorIndex = 0;
    }

    maxIndex() {
        if (this.castle1Beaten()) return 7;   // castle2 available
        if (this.allRobotMastersBeaten()) return 6; // castle1 available
        return 5;
    }

    update(dt) {
        const input = this.game.input;
        const max = this.maxIndex();

        // 3x2 grid for indices 0-5, then castle1=6, castle2=7
        if (input.justPressed('left')) {
            if (this.cursorIndex < 6 && this.cursorIndex % 3 !== 0) this.cursorIndex--;
            if (this.game.audio) this.game.audio.play('select');
        }
        if (input.justPressed('right')) {
            if (this.cursorIndex < 6 && this.cursorIndex % 3 !== 2) this.cursorIndex++;
            if (this.game.audio) this.game.audio.play('select');
        }
        if (input.justPressed('up')) {
            if (this.cursorIndex === 7) this.cursorIndex = 6;
            else if (this.cursorIndex === 6) this.cursorIndex = 3;
            else if (this.cursorIndex >= 3) this.cursorIndex -= 3;
            if (this.game.audio) this.game.audio.play('select');
        }
        if (input.justPressed('down')) {
            if (this.cursorIndex < 3) {
                this.cursorIndex += 3;
            } else if (this.cursorIndex < 6 && max >= 6) {
                this.cursorIndex = 6;
            } else if (this.cursorIndex === 6 && max >= 7) {
                this.cursorIndex = 7;
            }
            if (this.game.audio) this.game.audio.play('select');
        }

        this.cursorIndex = Math.max(0, Math.min(max, this.cursorIndex));

        if (input.justPressed('start') || input.justPressed('jump')) {
            this.selectStage();
        }
    }

    selectStage() {
        const idx = this.cursorIndex;

        if (idx === 6 && this.allRobotMastersBeaten()) {
            const stage = this.stageDataMap['castle1'];
            if (stage) {
                if (this.game.audio) this.game.audio.play('select');
                this.game.startStage(stage);
            }
            return;
        }

        if (idx === 7 && this.castle1Beaten()) {
            const stage = this.stageDataMap['castle2'];
            if (stage) {
                if (this.game.audio) this.game.audio.play('select');
                this.game.startStage(stage);
            }
            return;
        }

        if (idx >= ROBOT_MASTERS.length) return;

        const boss = ROBOT_MASTERS[idx];
        const stageData = this.stageDataMap[boss.stageKey];
        if (!stageData) return;

        if (this.game.audio) this.game.audio.play('select');
        this.game.startStage(stageData);
    }

    draw(ctx) {
        ctx.fillStyle = '#000020';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.fillStyle = '#fcfcfc';
        ctx.font = 'bold 24px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SELECT STAGE', CANVAS_WIDTH / 2, 55);

        // 6 robot master portraits in 3x2 grid
        for (let i = 0; i < ROBOT_MASTERS.length; i++) {
            const boss = ROBOT_MASTERS[i];
            const pos = POSITIONS[i];
            const defeated = this.game.defeatedBosses.includes(boss.weapon);
            const boxSize = 76;
            const bx = pos.x - boxSize / 2;
            const by = pos.y - boxSize / 2;

            ctx.fillStyle = defeated ? '#333333' : '#111133';
            ctx.fillRect(bx, by, boxSize, boxSize);

            ctx.strokeStyle = i === this.cursorIndex ? '#fcfcfc' : '#444488';
            ctx.lineWidth = i === this.cursorIndex ? 3 : 1;
            ctx.strokeRect(bx, by, boxSize, boxSize);

            ctx.fillStyle = defeated ? '#555555' : boss.color;
            ctx.fillRect(bx + 18, by + 14, 40, 38);

            ctx.fillStyle = defeated ? '#666666' : '#fcfcfc';
            ctx.font = '10px monospace';
            boss.name.split('\n').forEach((line, li) => {
                ctx.fillText(line, pos.x, by + boxSize + 13 + li * 13);
            });

            if (defeated) {
                ctx.fillStyle = '#ff4444';
                ctx.font = 'bold 11px monospace';
                ctx.fillText('CLEAR', pos.x, pos.y + 4);
            }

            if (i === this.cursorIndex) {
                ctx.fillStyle = '#fcfcfc';
                ctx.font = '16px monospace';
                ctx.fillText('\u25B6', bx - 16, pos.y + 5);
            }
        }

        // Castle 1 option
        if (this.allRobotMastersBeaten()) {
            this.drawCastleOption(ctx, 6, 'WILY CASTLE 1', '#ff8800', 400, this.castle1Beaten());
        }

        // Castle 2 option (only shown after castle 1 beaten)
        if (this.castle1Beaten()) {
            this.drawCastleOption(ctx, 7, 'WILY CASTLE 2', '#ff2200', 440, this.game.defeatedBosses.includes('castle2'));
        }

        ctx.textAlign = 'left';
    }

    drawCastleOption(ctx, idx, label, color, y, cleared) {
        const selected = this.cursorIndex === idx;
        const w = 200, h = 32;
        const bx = CANVAS_WIDTH / 2 - w / 2;

        ctx.fillStyle = selected ? '#221100' : '#110800';
        ctx.fillRect(bx, y - h / 2, w, h);
        ctx.strokeStyle = selected ? '#fcfcfc' : '#884400';
        ctx.lineWidth = selected ? 3 : 1;
        ctx.strokeRect(bx, y - h / 2, w, h);

        ctx.fillStyle = cleared ? '#666666' : color;
        ctx.font = 'bold 14px monospace';
        ctx.fillText(label, CANVAS_WIDTH / 2, y + 5);

        if (cleared) {
            ctx.fillStyle = '#ff4444';
            ctx.font = 'bold 11px monospace';
            ctx.fillText('CLEAR', CANVAS_WIDTH / 2 + 80, y + 5);
        }

        if (selected) {
            ctx.fillStyle = '#fcfcfc';
            ctx.font = '16px monospace';
            ctx.fillText('\u25B6', bx - 18, y + 6);
        }
    }
}
