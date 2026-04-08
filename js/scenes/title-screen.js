import { Scene } from './scene.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS } from '../constants.js';

export class TitleScreen extends Scene {
    constructor(game) {
        super(game);
        this.timer = 0;
        this.blinkTimer = 0;
        this.hasSave = false;
        this.selectedOption = 0; // 0 = new game, 1 = continue
    }

    enter() {
        this.timer = 0;
        this.hasSave = this.game.hasSave;
        this.selectedOption = this.hasSave ? 1 : 0;
    }

    update(dt) {
        this.timer++;
        this.blinkTimer++;

        if (this.hasSave) {
            if (this.game.input.justPressed('up') || this.game.input.justPressed('down')) {
                this.selectedOption = this.selectedOption === 0 ? 1 : 0;
                if (this.game.audio) this.game.audio.play('select');
            }
        }

        if (this.game.input.justPressed('start') || this.game.input.justPressed('jump')) {
            if (this.game.audio) {
                this.game.audio.init();
                this.game.audio.play('select');
            }

            if (this.selectedOption === 1 && this.hasSave) {
                // Continue - load saved progress
                this.game.loadProgress();
            } else {
                // New game - clear save and reset
                this.game.clearSave();
                this.game.newGame();
            }
            this.game.switchScene('stageSelect');
        }
    }

    draw(ctx) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Title
        ctx.fillStyle = '#3cbcfc';
        ctx.font = 'bold 48px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('ULTRAMAN', CANVAS_WIDTH / 2, 140);

        // Subtitle
        ctx.fillStyle = '#fcfcfc';
        ctx.font = '16px monospace';
        ctx.fillText('A MEGA MAN TRIBUTE', CANVAS_WIDTH / 2, 175);

        // Decorative line
        ctx.strokeStyle = '#3cbcfc';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(CANVAS_WIDTH / 2 - 120, 190);
        ctx.lineTo(CANVAS_WIDTH / 2 + 120, 190);
        ctx.stroke();

        // Menu options
        if (this.hasSave) {
            const options = ['NEW GAME', 'CONTINUE'];
            for (let i = 0; i < options.length; i++) {
                const y = 280 + i * 35;
                const selected = i === this.selectedOption;

                ctx.fillStyle = selected ? '#fcfcfc' : '#666666';
                ctx.font = '20px monospace';
                ctx.fillText(options[i], CANVAS_WIDTH / 2, y);

                if (selected && Math.floor(this.blinkTimer / 30) % 2 === 0) {
                    ctx.fillText('\u25B6', CANVAS_WIDTH / 2 - 90, y);
                }
            }
        } else {
            // No save - just press start
            if (Math.floor(this.blinkTimer / 30) % 2 === 0) {
                ctx.fillStyle = '#fcfcfc';
                ctx.font = '20px monospace';
                ctx.fillText('PRESS ENTER', CANVAS_WIDTH / 2, 300);
            }
        }

        // Controls
        ctx.fillStyle = '#888888';
        ctx.font = '12px monospace';
        ctx.fillText('ARROWS: Move   Z: Jump   X: Shoot', CANVAS_WIDTH / 2, 400);
        ctx.fillText('SHIFT: Switch Weapon   ESC: Pause', CANVAS_WIDTH / 2, 420);

        // Credits
        ctx.fillStyle = '#666666';
        ctx.font = '10px monospace';
        ctx.fillText('2026', CANVAS_WIDTH / 2, 460);

        ctx.textAlign = 'left';
    }
}
