import { Scene } from './scene.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants.js';

const CREDITS_TEXT = [
    '',
    'ULTRAMAN',
    '',
    'A MEGA MAN TRIBUTE',
    '',
    '',
    '- BOSSES -',
    '',
    'FLAME KNIGHT',
    'FROST SENTINEL',
    'THUNDER FALCON',
    'BLADE SAMURAI',
    '',
    '',
    '- WEAPONS -',
    '',
    'FLAME WAVE',
    'ICE SHARD',
    'THUNDER STRIKE',
    'RAZOR BLADE',
    '',
    '',
    'THANK YOU FOR PLAYING!',
    '',
    '',
    '',
    'PRESS ENTER',
];

export class CreditsScene extends Scene {
    constructor(game) {
        super(game);
        this.scrollY = 0;
        this.timer = 0;
    }

    enter() {
        this.scrollY = CANVAS_HEIGHT;
        this.timer = 0;
    }

    update(dt) {
        this.timer++;
        this.scrollY -= 0.5;

        if (this.game.input.justPressed('start') || this.game.input.justPressed('jump')) {
            this.game.newGame();
            this.game.switchScene('title');
        }
    }

    draw(ctx) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.textAlign = 'center';

        for (let i = 0; i < CREDITS_TEXT.length; i++) {
            const y = this.scrollY + i * 30;
            if (y < -30 || y > CANVAS_HEIGHT + 30) continue;

            const line = CREDITS_TEXT[i];
            if (line.startsWith('-') && line.endsWith('-')) {
                ctx.fillStyle = '#3cbcfc';
                ctx.font = 'bold 18px monospace';
            } else if (line === 'ULTRAMAN') {
                ctx.fillStyle = '#3cbcfc';
                ctx.font = 'bold 36px monospace';
            } else if (line === 'THANK YOU FOR PLAYING!' || line === 'PRESS ENTER') {
                ctx.fillStyle = '#f8d800';
                ctx.font = 'bold 20px monospace';
            } else {
                ctx.fillStyle = '#fcfcfc';
                ctx.font = '16px monospace';
            }

            ctx.fillText(line, CANVAS_WIDTH / 2, y);
        }

        ctx.textAlign = 'left';
    }
}
