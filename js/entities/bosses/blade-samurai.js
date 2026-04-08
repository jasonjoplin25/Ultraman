import { Boss } from './boss.js';
import { Sprite } from '../../graphics/sprite.js';
import { Projectile } from '../projectile.js';
import { WEAPON_FLAME, WEAPON_BLADE, GRAVITY, PLAYER_MAX_FALL } from '../../constants.js';
import { resolveEntityTileCollisions } from '../../core/collision.js';

const BS_SPRITE = [
    [0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,3,3,3,3,3,3,3,3,3,3,1,0,0,0,0,0,0],
    [0,0,0,0,0,1,3,2,2,2,2,2,2,2,2,2,3,3,1,0,0,0,0,0],
    [0,0,0,0,0,1,3,2,2,2,2,2,2,2,2,2,3,3,1,0,0,0,0,0],
    [0,0,0,0,1,1,1,1,4,4,4,4,4,4,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,1,4,4,4,4,4,4,4,4,4,4,4,4,4,1,0,0,0,0,0],
    [0,0,0,0,1,4,5,1,4,4,4,4,4,4,1,5,4,4,1,0,0,0,0,0],
    [0,0,0,0,1,4,4,4,4,4,4,4,4,4,4,4,4,4,1,0,0,0,0,0],
    [0,0,0,0,0,1,4,4,4,1,1,1,1,4,4,4,4,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,2,2,2,3,3,3,3,2,2,2,2,1,0,0,0,0,0,0],
    [0,0,0,0,1,2,2,2,2,3,3,3,3,2,2,2,2,2,1,0,0,0,0,0],
    [0,0,0,1,2,2,2,2,2,3,3,3,3,2,2,2,2,2,2,1,0,0,0,0],
    [0,0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,0,0,0],
    [0,0,1,4,4,1,2,2,2,2,2,2,2,2,2,2,2,1,4,4,1,0,0,0],
    [0,0,1,4,4,1,2,2,2,2,2,2,2,2,2,2,2,1,4,4,1,0,0,0],
    [0,0,0,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,0,0,0,0],
    [0,0,0,0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,1,0,0,0,0,0],
    [0,0,0,0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,1,0,0,0,0,0],
    [0,0,0,0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,1,0,0,0,0,0],
    [0,0,0,0,1,2,2,2,2,2,1,1,2,2,2,2,2,2,1,0,0,0,0,0],
    [0,0,0,0,1,2,2,2,2,1,0,0,1,2,2,2,2,2,1,0,0,0,0,0],
    [0,0,0,0,1,2,2,2,2,1,0,0,1,2,2,2,2,2,1,0,0,0,0,0],
    [0,0,0,0,1,2,2,2,2,1,0,0,1,2,2,2,2,2,1,0,0,0,0,0],
    [0,0,0,1,2,2,2,2,2,1,0,0,1,2,2,2,2,2,2,1,0,0,0,0],
    [0,0,0,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

const BS_PALETTE = ['', '#000000', '#888888', '#bcbcbc', '#f8b878', '#fcfcfc'];

export class BladeSamurai extends Boss {
    constructor(x, y) {
        super(x, y, 20, 26);
        this.weakness = WEAPON_FLAME;
        this.weaponReward = WEAPON_BLADE;
        this.sprite = new Sprite(BS_SPRITE, BS_PALETTE);
        this.dashSpeed = 5;
        this.counterWindow = false;
    }

    update(dt, game) {
        if (this.updateBase(dt, game)) return;

        this.stateTimer++;
        this.vy += GRAVITY;
        this.vy = Math.min(this.vy, PLAYER_MAX_FALL);

        switch (this.state) {
            case 'idle':
                this.vx = 0;
                if (this.stateTimer > 35) this.chooseAction(game);
                break;

            case 'dash':
                this.vx = this.facing * this.dashSpeed;
                if (this.stateTimer > 30) this.setState('shoot');
                break;

            case 'shoot':
                this.vx = 0;
                if (this.stateTimer === 10) this.fireBlade(game);
                if (this.stateTimer === 25) this.fireBlade(game);
                if (this.stateTimer > 50) this.setState('idle');
                break;

            case 'jump_slash':
                if (this.stateTimer === 1) {
                    this.vy = -10;
                    this.vx = this.facing * 3;
                }
                if (this.stateTimer === 15) this.fireBlade(game);
                if (this.onGround && this.stateTimer > 10) this.setState('idle');
                break;

            case 'counter':
                this.vx = 0;
                this.counterWindow = true;
                this.invulnerable = true;
                if (this.stateTimer > 40) {
                    this.counterWindow = false;
                    this.invulnerable = false;
                    this.fireBlade(game);
                    this.fireBlade(game);
                    this.setState('dash');
                }
                break;
        }

        this.onGround = false;
        resolveEntityTileCollisions(this, game.tileGrid);

        if (this.state === 'idle' || this.state === 'counter') {
            const playerX = game.player ? game.player.centerX : (game.camera.x + game.camera.width / 2);
            this.facing = playerX > this.centerX ? 1 : -1;
        }
    }

    chooseAction(game) {
        const roll = Math.random();
        if (this.phase === 2 && roll < 0.25) {
            this.setState('counter');
        } else if (roll < 0.4) {
            this.setState('jump_slash');
        } else if (roll < 0.7) {
            this.setState('dash');
        } else {
            this.setState('shoot');
        }
    }

    setState(s) { this.state = s; this.stateTimer = 0; this.counterWindow = false; this.invulnerable = false; }

    fireBlade(game) {
        const proj = Projectile.createEnemyShot(
            this.centerX + this.facing * 14, this.centerY - 4,
            this.facing * 5, -1
        );
        proj.damage = 3;
        game.projectiles.push(proj);
    }

    onPhaseChange(game) {
        if (game.camera) game.camera.shake(4, 30);
    }

    draw(ctx, camera) { this.drawBase(ctx, camera, this.sprite); }
}
