import { Scene } from './scene.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT, STARTING_LIVES, PLAYER_MAX_HP } from '../constants.js';

export class GameOverScene extends Scene {
    constructor(game) {
        super(game);
        this.cursorIndex = 0;
        this.timer = 0;
    }

    enter() {
        this.cursorIndex = 0;
        this.timer = 0;
    }

    update(dt) {
        this.timer++;

        const input = this.game.input;

        if (input.justPressed('up') || input.justPressed('down')) {
            this.cursorIndex = this.cursorIndex === 0 ? 1 : 0;
            if (this.game.audio) this.game.audio.play('select');
        }

        if (input.justPressed('start') || input.justPressed('jump')) {
            if (this.cursorIndex === 0) {
                // Continue - restart stage with fresh lives
                if (this.game.player) {
                    this.game.player.lives = STARTING_LIVES;
                    this.game.player.hp = PLAYER_MAX_HP;
                }
                if (this.game.currentStage) {
                    this.game.startStage(this.game.currentStage);
                }
            } else {
                // Stage Select
                if (this.game.player) {
                    this.game.player.lives = STARTING_LIVES;
                    this.game.player.hp = PLAYER_MAX_HP;
                }
                this.game.switchScene('stageSelect');
            }
        }
    }

    draw(ctx) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.textAlign = 'center';

        // Game Over text
        ctx.fillStyle = '#f83800';
        ctx.font = 'bold 36px monospace';
        ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, 180);

        // Options
        const options = ['CONTINUE', 'STAGE SELECT'];
        for (let i = 0; i < options.length; i++) {
            ctx.fillStyle = i === this.cursorIndex ? '#fcfcfc' : '#888888';
            ctx.font = '20px monospace';
            ctx.fillText(options[i], CANVAS_WIDTH / 2, 280 + i * 40);

            if (i === this.cursorIndex) {
                ctx.fillText('\u25B6', CANVAS_WIDTH / 2 - 100, 280 + i * 40);
            }
        }

        ctx.textAlign = 'left';
    }
}
