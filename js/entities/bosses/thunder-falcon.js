import { Boss } from './boss.js';
import { Sprite } from '../../graphics/sprite.js';
import { Projectile } from '../projectile.js';
import { WEAPON_BLADE, WEAPON_THUNDER, GRAVITY, PLAYER_MAX_FALL } from '../../constants.js';
import { resolveEntityTileCollisions } from '../../core/collision.js';

const TF_SPRITE = [
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
    [0,1,1,0,0,1,2,2,2,3,3,3,3,2,2,2,2,1,0,0,1,1,0,0],
    [1,2,2,1,1,2,2,2,2,3,3,3,3,2,2,2,2,2,1,1,2,2,1,0],
    [1,3,2,2,2,2,2,2,2,3,3,3,3,2,2,2,2,2,2,2,2,3,1,0],
    [0,1,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3,1,0,0],
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

const TF_PALETTE = ['', '#000000', '#e45c10', '#f8d800', '#f8b878', '#fcfcfc'];

export class ThunderFalcon extends Boss {
    constructor(x, y) {
        super(x, y, 20, 26);
        this.weakness = WEAPON_BLADE;
        this.weaponReward = WEAPON_THUNDER;
        this.sprite = new Sprite(TF_SPRITE, TF_PALETTE);
        this.flying = false;
        this.flyY = y - 60;
        this.groundY = y;
    }

    update(dt, game) {
        if (this.updateBase(dt, game)) return;

        this.stateTimer++;

        switch (this.state) {
            case 'idle':
                this.vx = 0;
                if (!this.flying) {
                    this.vy += GRAVITY;
                    this.vy = Math.min(this.vy, PLAYER_MAX_FALL);
                }
                if (this.stateTimer > 30) this.chooseAction(game);
                break;

            case 'fly_up':
                this.vy = -3;
                this.vx = 0;
                if (this.y <= this.flyY) {
                    this.y = this.flyY;
                    this.vy = 0;
                    this.flying = true;
                    this.setState('fly_attack');
                }
                break;

            case 'fly_attack':
                const px = game.player ? game.player.centerX : (game.camera.x + game.camera.width / 2);
                this.vx = px > this.centerX ? 2.5 : -2.5;
                this.facing = this.vx > 0 ? 1 : -1;
                this.vy = 0;

                if (this.stateTimer % 30 === 15) {
                    this.fireLightning(game);
                }
                if (this.stateTimer > 90) {
                    this.setState('dive');
                }
                break;

            case 'dive':
                this.vx = this.facing * 3;
                this.vy = 6;
                if (this.onGround || this.y >= this.groundY) {
                    this.y = this.groundY;
                    this.vy = 0;
                    this.flying = false;
                    this.setState('idle');
                }
                break;

            case 'lightning_barrage':
                this.vx = 0;
                if (this.stateTimer % 10 === 1 && this.stateTimer < 60) {
                    this.fireLightning(game);
                }
                if (this.stateTimer > 80) this.setState('idle');
                break;
        }

        this.onGround = false;
        resolveEntityTileCollisions(this, game.tileGrid);

        if (this.state === 'idle' || this.state === 'lightning_barrage') {
            const playerX = game.player ? game.player.centerX : (game.camera.x + game.camera.width / 2);
            this.facing = playerX > this.centerX ? 1 : -1;
        }
    }

    chooseAction(game) {
        const roll = Math.random();
        if (this.phase === 2 && roll < 0.3) {
            this.setState('lightning_barrage');
        } else if (roll < 0.6) {
            this.setState('fly_up');
        } else {
            this.fireLightning(game);
            this.setState('idle');
        }
    }

    setState(s) { this.state = s; this.stateTimer = 0; }

    fireLightning(game) {
        const proj = Projectile.createEnemyShot(this.centerX, this.centerY + 10, 0, 5);
        proj.damage = 3;
        game.projectiles.push(proj);
    }

    onPhaseChange(game) {
        if (game.camera) game.camera.shake(4, 30);
    }

    draw(ctx, camera) { this.drawBase(ctx, camera, this.sprite); }
}
