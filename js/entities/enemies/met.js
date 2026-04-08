import { Enemy } from './enemy.js';
import { Sprite } from '../../graphics/sprite.js';
import { MET_HIDDEN, MET_ACTIVE, MET_PALETTE } from '../../graphics/sprite-data.js';
import { Projectile } from '../projectile.js';
import { DIR } from '../../constants.js';

export class Met extends Enemy {
    constructor(x, y) {
        super(x, y, 16, 16);
        this.hp = 1;
        this.state = 'hidden'; // hidden, peek, shoot, hide
        this.timer = 0;
        this.peekDuration = 30;
        this.shootDelay = 15;
        this.hideDuration = 90;
        this.invulnerable = true; // invulnerable while hidden

        this.spriteHidden = new Sprite(MET_HIDDEN, MET_PALETTE);
        this.spriteActive = new Sprite(MET_ACTIVE, MET_PALETTE);
    }

    update(dt, game) {
        this.timer++;

        switch (this.state) {
            case 'hidden':
                this.invulnerable = true;
                if (this.timer > this.hideDuration) {
                    // Check if player is nearby
                    const dist = Math.abs(this.x - game.camera.x - game.camera.width / 2);
                    if (dist < game.camera.width) {
                        this.state = 'peek';
                        this.timer = 0;
                    }
                }
                break;

            case 'peek':
                this.invulnerable = false;
                if (this.timer > this.peekDuration) {
                    this.state = 'shoot';
                    this.timer = 0;
                    this.shoot(game);
                }
                break;

            case 'shoot':
                this.invulnerable = false;
                if (this.timer > this.shootDelay) {
                    this.state = 'hidden';
                    this.timer = 0;
                }
                break;
        }
    }

    shoot(game) {
        // 3-way spread
        const speeds = [
            { vx: -3, vy: 0 },
            { vx: -2, vy: -2 },
            { vx: -1, vy: -3 },
        ];

        // Mirror based on player position
        const playerRight = game.camera.x + game.camera.width / 2 > this.x;

        for (const s of speeds) {
            const vx = playerRight ? -s.vx : s.vx;
            const proj = Projectile.createEnemyShot(
                this.centerX, this.centerY,
                vx, s.vy
            );
            game.projectiles.push(proj);
        }
    }

    draw(ctx, camera) {
        const screenX = Math.round((this.x - camera.x) * 2);
        const screenY = Math.round((this.y - camera.y) * 2);

        if (this.state === 'hidden') {
            this.spriteHidden.draw(ctx, screenX, screenY);
        } else {
            this.spriteActive.draw(ctx, screenX, screenY);
        }
    }
}
