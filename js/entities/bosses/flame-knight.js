import { Boss } from './boss.js';
import { Sprite } from '../../graphics/sprite.js';
import { Projectile } from '../projectile.js';
import { WEAPON_ICE, WEAPON_FLAME, GRAVITY, PLAYER_MAX_FALL } from '../../constants.js';
import { resolveEntityTileCollisions } from '../../core/collision.js';

// Flame Knight sprite (24x32)
const FK_SPRITE = [
    [0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,2,2,2,2,2,2,2,2,2,2,1,0,0,0,0,0,0],
    [0,0,0,0,0,1,2,3,3,3,3,3,3,3,3,3,2,2,1,0,0,0,0,0],
    [0,0,0,0,0,1,2,3,3,3,3,3,3,3,3,3,2,2,1,0,0,0,0,0],
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

const FK_PALETTE = ['', '#000000', '#a81000', '#f83800', '#f8b878', '#fcfcfc'];

export class FlameKnight extends Boss {
    constructor(x, y) {
        super(x, y, 20, 26);
        this.weakness = WEAPON_ICE;
        this.weaponReward = WEAPON_FLAME;
        this.sprite = new Sprite(FK_SPRITE, FK_PALETTE);
        this.spriteOffsetX = -2;
        this.spriteOffsetY = -2;

        this.jumpCooldown = 0;
        this.shootCooldown = 0;
        this.actionTimer = 0;
        this.spawnX = x; // for bounds clamping
    }

    update(dt, game) {
        if (this.updateBase(dt, game)) return;

        this.stateTimer++;
        this.applyGravity(game);

        switch (this.state) {
            case 'idle':
                this.vx = 0;
                if (this.stateTimer > 30) {
                    this.chooseAction(game);
                }
                break;

            case 'walk':
                this.vx = this.facing * 1.5;
                if (this.stateTimer > 60) {
                    this.setState('idle');
                }
                break;

            case 'jump':
                if (this.stateTimer === 1) {
                    this.vy = -8;
                    this.vx = this.facing * 1.5;
                }
                if (this.onGround && this.stateTimer > 10) {
                    this.setState('shoot');
                }
                break;

            case 'shoot':
                this.vx = 0;
                if (this.stateTimer === 15) {
                    this.fireFlame(game);
                }
                if (this.stateTimer > 40) {
                    this.setState('idle');
                }
                break;

            case 'fire_pillar':
                this.vx = 0;
                if (this.stateTimer % 15 === 1 && this.stateTimer < 60) {
                    this.fireFlame(game);
                }
                if (this.stateTimer > 80) {
                    this.setState('idle');
                }
                break;
        }

        // Resolve collisions
        this.onGround = false;
        resolveEntityTileCollisions(this, game.tileGrid);

        // Clamp to boss room bounds (±128px from spawn)
        this.x = Math.max(this.spawnX - 128, Math.min(this.spawnX + 64, this.x));

        // Face player (use actual player position, not camera center)
        const playerX = game.player ? game.player.centerX : (game.camera.x + game.camera.width / 2);
        this.facing = playerX > this.centerX ? 1 : -1;
    }

    chooseAction(game) {
        const roll = Math.random();
        if (this.phase === 2 && roll < 0.3) {
            this.setState('fire_pillar');
        } else if (roll < 0.5) {
            this.setState('jump');
        } else if (roll < 0.8) {
            this.setState('shoot');
        } else {
            this.setState('walk');
        }
    }

    setState(state) {
        this.state = state;
        this.stateTimer = 0;
    }

    fireFlame(game) {
        const proj = Projectile.createPlayerShot(
            this.centerX + this.facing * 12,
            this.centerY,
            this.facing,
            WEAPON_FLAME
        );
        proj.isPlayerProjectile = false;
        proj.damage = 3;
        proj.vx = this.facing * 3;
        game.projectiles.push(proj);
    }

    applyGravity(game) {
        this.vy += GRAVITY;
        this.vy = Math.min(this.vy, PLAYER_MAX_FALL);
    }

    onPhaseChange(game) {
        if (game.camera) game.camera.shake(4, 30);
    }

    draw(ctx, camera) {
        this.drawBase(ctx, camera, this.sprite);
    }
}
