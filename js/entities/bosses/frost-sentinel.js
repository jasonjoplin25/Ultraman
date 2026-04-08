import { Boss } from './boss.js';
import { Sprite } from '../../graphics/sprite.js';
import { Projectile } from '../projectile.js';
import { WEAPON_THUNDER, WEAPON_ICE, GRAVITY, PLAYER_MAX_FALL } from '../../constants.js';
import { resolveEntityTileCollisions } from '../../core/collision.js';

const FS_SPRITE = [
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
    [0,0,0,0,0,1,3,3,3,2,2,2,2,3,3,3,3,1,0,0,0,0,0,0],
    [0,0,0,0,1,3,3,3,3,2,2,2,2,3,3,3,3,3,1,0,0,0,0,0],
    [0,0,0,1,3,3,3,3,3,2,2,2,2,3,3,3,3,3,3,1,0,0,0,0],
    [0,0,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,0,0,0],
    [0,0,1,4,4,1,3,3,3,3,3,3,3,3,3,3,3,1,4,4,1,0,0,0],
    [0,0,1,4,4,1,3,3,3,3,3,3,3,3,3,3,3,1,4,4,1,0,0,0],
    [0,0,0,1,1,3,3,3,3,3,3,3,3,3,3,3,3,3,1,1,0,0,0,0],
    [0,0,0,0,1,3,3,3,3,3,3,3,3,3,3,3,3,3,1,0,0,0,0,0],
    [0,0,0,0,1,3,3,3,3,3,3,3,3,3,3,3,3,3,1,0,0,0,0,0],
    [0,0,0,0,1,3,3,3,3,3,3,3,3,3,3,3,3,3,1,0,0,0,0,0],
    [0,0,0,0,1,3,3,3,3,3,1,1,3,3,3,3,3,3,1,0,0,0,0,0],
    [0,0,0,0,1,3,3,3,3,1,0,0,1,3,3,3,3,3,1,0,0,0,0,0],
    [0,0,0,0,1,3,3,3,3,1,0,0,1,3,3,3,3,3,1,0,0,0,0,0],
    [0,0,0,0,1,3,3,3,3,1,0,0,1,3,3,3,3,3,1,0,0,0,0,0],
    [0,0,0,1,3,3,3,3,3,1,0,0,1,3,3,3,3,3,3,1,0,0,0,0],
    [0,0,0,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

const FS_PALETTE = ['', '#000000', '#0058f8', '#3cbcfc', '#f8b878', '#fcfcfc'];

export class FrostSentinel extends Boss {
    constructor(x, y) {
        super(x, y, 20, 26);
        this.weakness = WEAPON_THUNDER;
        this.weaponReward = WEAPON_ICE;
        this.sprite = new Sprite(FS_SPRITE, FS_PALETTE);

        this.slideSpeed = 4;
    }

    update(dt, game) {
        if (this.updateBase(dt, game)) return;

        this.stateTimer++;
        this.vy += GRAVITY;
        this.vy = Math.min(this.vy, PLAYER_MAX_FALL);

        switch (this.state) {
            case 'idle':
                this.vx = 0;
                if (this.stateTimer > 40) this.chooseAction(game);
                break;

            case 'slide':
                this.vx = this.facing * this.slideSpeed;
                if (this.stateTimer > 45) this.setState('shoot');
                break;

            case 'shoot':
                this.vx = 0;
                if (this.stateTimer === 10) this.fireIce(game);
                if (this.stateTimer === 25) this.fireIce(game);
                if (this.stateTimer > 50) this.setState('idle');
                break;

            case 'ice_rain':
                this.vx = 0;
                if (this.stateTimer % 20 === 5 && this.stateTimer < 80) {
                    this.fireIceFromAbove(game);
                }
                if (this.stateTimer > 100) this.setState('idle');
                break;
        }

        this.onGround = false;
        resolveEntityTileCollisions(this, game.tileGrid);

        const playerX = game.player ? game.player.centerX : (game.camera.x + game.camera.width / 2);
        this.facing = playerX > this.centerX ? 1 : -1;
    }

    chooseAction(game) {
        const roll = Math.random();
        if (this.phase === 2 && roll < 0.3) {
            this.setState('ice_rain');
        } else if (roll < 0.5) {
            this.setState('slide');
        } else {
            this.setState('shoot');
        }
    }

    setState(s) { this.state = s; this.stateTimer = 0; }

    fireIce(game) {
        const proj = Projectile.createEnemyShot(
            this.centerX + this.facing * 14, this.centerY,
            this.facing * 4, 0
        );
        proj.damage = 3;
        game.projectiles.push(proj);
    }

    fireIceFromAbove(game) {
        const px = game.camera.x + Math.random() * game.camera.width;
        const proj = Projectile.createEnemyShot(px, game.camera.y, 0, 3);
        proj.damage = 3;
        game.projectiles.push(proj);
    }

    onPhaseChange(game) {
        if (game.camera) game.camera.shake(4, 30);
    }

    draw(ctx, camera) { this.drawBase(ctx, camera, this.sprite); }
}
